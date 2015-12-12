'use strict';

const rx = require('rx');
const _ = require('lodash');

// Action
const validateUserSession = require('./../../action/user/validateUserSession');

// Model
const AbTest = require('./../../model/AbTest');
const AbTestGroup = require('./../../model/AbTestGroup');
const User = require('./../../model/User');

// Stream
const userFromRequestStream = require('./../../stream/user/fromRequest');

// Queries
const queryAbtestGroups = require('./../../queries/abtest/queryGroups');
const queryAbtestGroupImpressionsCount = require('./../../queries/abtestGroup/queryImpressionsCount');
const queryAbtestState = require('./../../queries/abtest/queryAbTestState');
const queryAbtestGroupConversionsCount = require('./../../queries/abtestGroup/queryConversionsCount');
const queryUserAbtests = require('./../../queries/user/queryAbTests');

// formatters
const abtestToJsonFormatter = require('./../../formatters/abtest/abTestAttributesObject');
const abtestGroupToJsonFormatter = require('./../../formatters/abtestGroup/abTestGroupAttributesObject');
const impressionToJsonFormatter = require('./../../formatters/impression/impressionToAttributesObject');

module.exports = function (req) {
    const authHeader = req.headers.authentication;
    

    return userFromRequestStream(req)

        .flatMapLatest((user) => {
            const userSessionToken = req.headers.authentication.split(':')[1];
            return validateUserSession(user, userSessionToken);
        })

        .flatMapLatest((user) => {
            return queryUserAbtests(user);
        })

        .flatMap((abtest) => {
            const data = {
                abtest: abtest,
                abtestGroups: []
            };

            return queryAbtestGroups(abtest)
                .flatMap((abtestGroup) => {
                    const groupData = {
                        abtestGroup: abtestGroup,
                        impressions_count: 0
                    };

                    data.abtestGroups.push(groupData);

                    return queryAbtestGroupImpressionsCount(abtestGroup)
                        .combineLatest(
                            queryAbtestGroupConversionsCount(abtestGroup),
                            function (impressions_count, conversions_count) {
                                groupData.impressions_count = impressions_count;
                                groupData.conversions_count = conversions_count;
                            }
                        );

                })
                .reduce(() => {
                    return data;
                });

        })

        .flatMap((queryData) => {
            const abtest = queryData.abtest;

            return queryAbtestState(abtest)
                .map((abtestState) => {
                    queryData.abtestState = abtestState;
                    return queryData;
                });
        })

        .toArray()

        .map((queryDataAry) => {
            const json = {
                data: []
            };

            queryDataAry.forEach((queryData) => {
                const abtest = queryData.abtest;
                const groups = queryData.abtestGroups;
                const abtestState = queryData.abtestState;

                const data = {
                    type: 'abtest',
                    id: abtest._id,
                    attributes: abtestToJsonFormatter(abtest),
                    relationships: {
                        abtestState: {
                            data: {
                                status: abtestState.status
                            }
                        },

                        abtestGroups: {
                            data: groups.map(function (groupData) {
                                const abtestGroup = groupData.abtestGroup;
                                const abtestGroupAttributes = abtestGroupToJsonFormatter(abtestGroup);
                                abtestGroupAttributes.id = abtestGroup._id;

                                return {
                                    data: abtestGroupAttributes,
                                    meta: {
                                        conversions_count: groupData.conversions_count,
                                        impressions_count: groupData.impressions_count
                                    }
                                } 
                            })
                        }
                    }
                };
                

                json.data.push(data);

            });

            return json.data;
        });
};