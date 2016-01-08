'use strict';

const _ = require('lodash');

// Queries
const queryAbtestGroups = require('./../../queries/abtest/queryGroups');
const queryAbtestState = require('./../../queries/abtest/queryAbTestState');
const queryAbTestControlGroup = require('./../../queries/abtest/queryAbTestControlGroup');

const abtestGroupRestResponse = require('./../abtestGroup/abtestGroupRestResponse');

module.exports = function (abtest) {
    const abtestGroupRestObjectsStream = queryAbtestGroups(abtest)
        .flatMap((abtestGroup) => {
            return abtestGroupRestResponse(abtestGroup);
        })
        .toArray();

    const abtestControlGroupStream = queryAbTestControlGroup(abtest)
        .flatMap((control) => {
            return abtestGroupRestResponse(control);
        });

    const abtestStateRestObjectStream = queryAbtestState(abtest);

    return abtestGroupRestObjectsStream.combineLatest(
        abtestControlGroupStream,
        abtestStateRestObjectStream,
        function (groupsData, controlGroup, abtestState) {
            const groupJson = groupsData.filter((abtestGroup) => {
                return abtestGroup.id.toString() !== controlGroup.id.toString();
            });

            return {
                type: 'abtest',
                id: abtest._id,
                attributes: _.omit(abtest.toObject(), '__v', '_id', 'user'),
                relationships: {
                    abtestGroupControl: controlGroup,
                    abtestGroup: groupJson,
                    abtestState: {
                        type: 'abteststate',
                        data: {
                            date: abtestState.date,
                            status: abtestState.status
                        }
                    }
                }
            };
        });
};
