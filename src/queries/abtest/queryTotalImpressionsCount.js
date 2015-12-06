'use strict';

const rx = require('rx');

// Queries
const abtestQueryGroups = require('./../../queries/abtest/queryGroups');
const abtestGroupQueryImpressionsCount = require('./../../queries/abtestGroup/queryImpressionsCount');

module.exports = function (abtest) {

    return abtestQueryGroups(abtest)
        .flatMap((abtestGroup) => {
            return abtestGroupQueryImpressionsCount(abtestGroup)
        })
        .reduce((seed, count) => {
            return seed + count;
        }, 0);
}