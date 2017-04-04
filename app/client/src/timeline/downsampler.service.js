let _ = require('lodash');
let relTime = require('./relative-time.js');

const RESOLUTION_FULL = 100; // 100% = all data

let serviceDef = ['session', function DownsamplerService(session) {
    let self = this;
    
    this.init = function(sessionId, relTimes) {
        this.sessionId = sessionId;
        this.relTimes = relTimes;
        this.initialized = true;
    };

    this.process = function(traceName, resolutions) {
        // Some simple validation first
        if (!this.initialized) throw new Error('init() first');
        if (traceName === undefined) throw new Error('traceName was undefined');

        let self = this;
        return session.timeline(sessionId, traceName).then((fullRes) =>
            downsample(fullRes.data.data[traceName], traceName, resolutions));
    };

    let downsample = function(fullRes, traceName, resolutions) {
        let id = `Downsample '${traceName}' (${fullRes.length} samples, resolutions=${resolutions})`;
        console.time(id);

        let downsampled = {};
        for (let resolution of resolutions) {
            let resolutionData;

            // Make sure we're dealing with integers > 1 and < RESOLUTION_FULL
            resolution = Math.floor(resolution);
            if (resolution < 1) resolution = 1;

            if (resolution < RESOLUTION_FULL) {
                let indexes = [];

                // Prevent 0% or negative resolutions
                if (resolution < 1) resolution = 1;
                // Break up the timeline data into chunks, which we will
                // find the maximum value of and then append that index to
                // the downsampled array.

                // 50% res = chunk size of 2, 25% res = chunk size of 4, etc.
                let chunkSize = RESOLUTION_FULL / resolution;
                let chunks = _.chunk(fullRes, chunkSize);

                for (let i = 0; i < chunks.length; i++) {
                    // Find the index within this chumk of the maximum value
                    // of this chunk
                    let localIndex = _.indexOf(chunks[i], _.max(chunks[i]));
                    // Calculate the index of this maximum value in reference
                    // to the full resolution timeline
                    let globalIndex = (i * chunkSize) + localIndex;
                    indexes.push(globalIndex);
                }
                resolutionData = {indexes: indexes};
            } else {
                resolutionData = {
                    x: _.map(self.relTimes, t => new Date(relTime.relativeMillis(t))),
                    y: fullRes
                };
            }

            downsampled[resolution] = resolutionData;
        }

        console.timeEnd(id);

        return {
            fullRes: fullRes,
            downsampled: downsampled
        };
    };
}];

module.exports = {
    name: 'downsampler',
    def: serviceDef
};
