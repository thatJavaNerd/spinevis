let assert = require('assert');
let db = require('../src/database.js');
let queries = require('../src/queries.js');

/**
 * Helper method. Gets the first session via findAllSession() and returns its
 * _id.
 */
let getFirstSessionId = function() {
    return queries.findAllSessions(0, 1)
    .then(function(sessions) {
        return sessions[0]._id;
    });
}

describe('queries', function() {
    before(function mongoConnect() {
        // Change to MODE_TEST when 'spinevis_test' database is ready
        return db.connect(db.MODE_PRODUCTION);
    });

    describe('findAllSessions()', function() {
        it('should find only appropriate session metadata', function() {
            return queries.findAllSessions(0, 20).then(function(sessions) {
                // For each document ensure that only specific data is returned
                let approvedKeys = ['_id', 'start_time', 'end_time', 'Animal', 'Run', 'nSamples', 'volRate'];

                for (let session of sessions) {
                    // Make sure all keys in the object are in the above array
                    for (let key of Object.keys(session)) {
                        assert.ok(approvedKeys.includes(key), `Key '${key}' is unexpected, session ID '${session._id}'`);
                    }

                    // Make sure all expected keys have defined values
                    for (let key of approvedKeys) {
                        assert.ok(session[key] !== undefined, `Key '${key}' is undefined`);
                    }
                }
            });
        });
    });

    describe('getSessionMeta()', function() {
        it('should return only one session', function() {
            let _id = null;

            return getFirstSessionId()
            .then(function(id) {
                _id = id;
                return queries.getSessionMeta(id);
            }).then(function(session) {
                // Make sure the query returns an object with a matching _id
                assert.equal(typeof session, 'object')
                assert.equal(session._id, _id);

                // Global fluorescense trace array must be equal in length to
                // the relative time array
                assert.equal(session.globalTC.length, session.relTimes.length);
            });
        });
    });

    describe('sessionExists()', function() {
        it('should return true for existing IDs', function() {
            return getFirstSessionId()
            .then(function(id) {
                return queries.sessionExists(id);
            }).then(function(exists) {
                assert.ok(exists, 'Did not find existing file');
            });
        });

        it('should return false for non-existent IDs', function() {
            return queries.sessionExists('i_dont_exist').then(function(exists) {
                assert.ok(!exists, 'Found non-existent session');
            });
        });
    });

    describe('getTimeline()', function() {
        it('should return an array of global fluorescense values', function() {
            return getFirstSessionId().then(function(id) {
                return queries.getTimeline(id);
            }).then(function(timelineData) {
                for (let i = 0; i < timelineData.length; i++) {
                    assert.ok(typeof timelineData[i] === 'number');
                }
            });
        })
    });

    describe('getBehavior()', function() {
        it('should return an object mapping behavior events to timepoint indexes', function() {
            return getFirstSessionId().then(function(id) {
                return queries.getBehavior(id);
            }).then(function(behaviorData) {
                for (let key of Object.keys(behaviorData)) {
                    // Make sure we are always returning an array
                    assert.ok(Array.isArray(behaviorData[key]));
                }
            });
        });

        it('should only return events which are asked for', function() {
            let events = ['lick left', 'lick right'];

            return getFirstSessionId().then(function(id) {
                return queries.getBehavior(id, events);
            }).then(function(behaviorData) {
                let dataKeys = Object.keys(behaviorData);
                // Lengths should be the same
                assert.ok(dataKeys.length === events.length);

                // Make sure that every event that was requested was returned
                for (let event of events) {
                    assert.ok(dataKeys.includes(event));
                }
            });
        });

        it('should report missing when one of the behaviors cannot be found', function() {
            let events = ['lick left', 'something else that doesn\'t exist', 'lick right'];

            return getFirstSessionId().then(function(id) {
                return queries.getBehavior(id, events);
            }).then(function(behaviorData) {
                assert.fail(undefined, undefined, 'should not have reached here');
            }).catch(function(err) {
                assert.equal(err.type, queries.ERROR_MISSING);
                // events[1] will not have any data, expect that the only
                // value in the error's 'types' array will be this value
                assert.deepStrictEqual(err.data, {types: [events[1]]});
            });
        });
    });
});
