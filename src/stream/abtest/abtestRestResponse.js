'use strict';

const _ = require('lodash');

// Queries
const queryAbtestGroups = require('./../../queries/abtest/queryGroups');
const queryAbtestState = require('./../../queries/abtest/queryAbTestState');

const abtestGroupRestResponse = require('./../abtestGroup/abtestGroupRestResponse');

module.exports = function (abtest) {
    const abtestGroupRestObjectsStream = queryAbtestGroups(abtest)
        .flatMap((abtestGroup) => {
            return abtestGroupRestResponse(abtestGroup);
        })
        .toArray();

    const abtestStateRestObjectStream = queryAbtestState(abtest);

    return abtestGroupRestObjectsStream.combineLatest(
        abtestStateRestObjectStream,
        function (groupsData, abtestState) {
            return {
                type: 'abtest',
                id: abtest._id,
                attributes: _.omit(abtest.toObject(), '__v', '_id', 'user'),
                relationships: {
                    abtestGroup: {
                        data: groupsData
                    },
                    abtestState: {
                        type: 'abteststate',
                        data: {
                            status: abtestState.status
                        }
                    }
                }
            };
        });
};
