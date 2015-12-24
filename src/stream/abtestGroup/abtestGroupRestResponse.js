'use strict';

const rx = require('rx');
const _ = require('lodash');

// Queries
const queryAbtestGroups = require('./../../queries/abtest/queryGroups');
const queryAbtestGroupImpressionsCount = require('./../../queries/abtestGroup/queryImpressionsCount');
const queryAbtestState = require('./../../queries/abtest/queryAbTestState');
const queryAbtestGroupConversionsCount = require('./../../queries/abtestGroup/queryConversionsCount');

// formatters
const abtestToJsonFormatter = require('./../../formatters/abtest/abTestAttributesObject');
const abtestGroupToJsonFormatter = require('./../../formatters/abtestGroup/abtestGroupAttributesObject');


module.exports = function (abtestGroup) {
    const data = {
        type: 'abtestgroup',
        id: abtestGroup._id,
        attributes: _.omit(abtestGroup.toObject(), '_id', '__v'),
        meta: {}
    };


    return queryAbtestGroupImpressionsCount(abtestGroup)
        .combineLatest(
            queryAbtestGroupConversionsCount(abtestGroup),
            function (impressionsCount, conversionsCount) {
                data.meta.impressionsCount = impressionsCount;
                data.meta.conversionsCount = conversionsCount;

                return data;
            }
        );
};
