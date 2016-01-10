'use strict';

const rx = require('rx');
const _ = require('lodash');

const AbTestState = require('./../../model/AbTestState');
const calculateAbTestResults = require('./../../action/abtest/calculateResults');

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
    const hasResultsStream = abtestStateRestObjectStream.filter((abtestState) => {
        return (abtestState.status === AbTestState.STATUS_COMPLETED);
    })
    .flatMapLatest((abtestState) => {
        return calculateAbTestResults(abtest);
    })
    .map((results) => {
        return {
            type: 'abtestresults',
            attributes: results
        };
    });

    const noResultsStream = abtestStateRestObjectStream.filter((abtestState) => {
        return (abtestState.status !== AbTestState.STATUS_COMPLETED);
    })
    .map(() => {
        return {};
    });

    const resultsStream = rx.Observable.merge(
        hasResultsStream,
        noResultsStream
    ).first();

    return abtestGroupRestObjectsStream.combineLatest(
        abtestControlGroupStream,
        abtestStateRestObjectStream,
        resultsStream,
        function (groupsData, controlGroup, abtestState, results) {
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
                },
                included: {
                    abtestResults: results
                }
            };
        });
};
