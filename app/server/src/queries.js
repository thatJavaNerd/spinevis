/**
 * queries.js -- abstraction layer between database and server. For all input
 * to exported functions, variables are expected to be of the correct type.
 */

let db = require('./database.js');

const COLL_META = 'meta';
const COLL_TIME = 'time';

module.exports.ERROR_MISSING = "missing";
module.exports.ERROR_PAGINATION = "pagination";

function QueryError(msg, data, errType) {
    this.msg = msg;
    this.data = data;
    this.type = errType;
}

let errorMissing = function(msg, data) {
    return new QueryError(msg, data, module.exports.ERROR_MISSING);
}

let errorPagination = function(msg, start, limit) {
    let paginationData = {
        start: start,
        limit: limit
    };
    return new QueryError(msg, paginationData, module.exports.ERROR_PAGINATION);
}

let verifyPaginationData = function(start, limit) {
    let err = null;
    if (typeof start !== 'number') err = 'start is not a number, was ' + typeof start;
    if (typeof limit !== 'number') err = 'limit is not a number, was ' + typeof limit;
    if (limit <= 0) err = 'limit must be greater than 0';
    if (start < 0) err = 'start must be greater than or equal to 0';

    return err;
}

/**
 * Get simple, descriptive, metadata from all trials. No 'heavy' data is
 * included (e.g. Polys/Pts). Returns an array.
 */
module.exports.findAllTrials = function(start, limit) {
    let paginationError = verifyPaginationData(start, limit);
    if (paginationError !== null) {
        return Promise.reject(errorPagination(paginationError, start, limit))
    }
    let identifyingProperties = ['start_time', 'end_time', 'Animal', 'Run', 'nSamples'];

    let projection = {};
    for (let prop of identifyingProperties) {
        projection[prop] = 1;
    }

    return db.mongo().collection(COLL_META)
        .find({})
        .project(projection)
        .skip(start)
        .limit(limit)
        .toArray();
};

/**
 * Get all metadata, both 'light' and 'heavy', for a specific trial.
 *
 * @param id The value of the trial's '_id' field. Case sensitive.
 */
module.exports.getTrialMeta = function(id) {
    return db.mongo().collection(COLL_META).find({_id: id}).limit(1).toArray().then(function(trials) {
        if (trials.length > 0)
            return trials[0];

        return Promise.reject(errorMissing(`No trials for ID '${id}'`, {_id: id}));
    });
};
