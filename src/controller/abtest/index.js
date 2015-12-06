'use strict';

const rx = require('rx');
const _ = require('lodash');

// Client
const authServiceClient = require('./../../client/authServiceClient');

// Model
const AbTest = require('./../../model/AbTest');
const AbTestGroup = require('./../../model/AbTestGroup');
const User = require('./../../model/User');

// Queries
const queryAbtestGroups = require('./../../queries/abtest/queryGroups');
const queryAbtestGroupImpressionsCount = require('./../../queries/abtestGroup/queryImpressionsCount');

// formatters
const abtestToJsonFormatter = require('./../../formatters/abtest/abTestAttributesObject');
const abtestGroupToJsonFormatter = require('./../../formatters/abtestGroup/abTestGroupAttributesObject');
const impressionToJsonFormatter = require('./../../formatters/impression/impressionToAttributesObject');

module.exports = function (req) {

    return rx.Observable.create(function (o) {
        const user_id = req.params.user_id;

        User.findById(user_id, function (err, user) {
            if (err) {
                o.onError(err);
                return;
            }

            o.onNext(user);
            o.onCompleted();

        });

    })

    .flatMapLatest((user) => {

        return rx.Observable.create(function (o) {
            
            AbTest.find({
                user: user
            }, function (err, abtests) {
                if (err) {
                    o.onError(err);
                    return;
                }

                abtests.forEach(function (abtest) {
                    o.onNext(abtest);
                });

                
                o.onCompleted();
            })

        })

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
                    .map((count) => {
                        groupData.impressions_count = count;
                    });

            })
            .reduce(() => {
                return data;
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

            const data = {
                type: 'abtest',
                id: abtest._id,
                attributes: abtestToJsonFormatter(abtest),
                relationships: {
                    abtestGroups: {
                        data: groups.map(function (groupData) {
                            const abtestGroup = groupData.abtestGroup;
                            const abtestGroupAttributes = abtestGroupToJsonFormatter(abtestGroup);
                            abtestGroupAttributes.id = abtestGroup._id;

                            return {
                                data: abtestGroupAttributes,
                                meta: {
                                    impressions_count: groupData.impressions_count
                                }
                            } 
                        })
                    }
                }
            };
            

            json.data.push(data);

        });

        return json;
    })

    .map((json) => {
        return JSON.stringify(json);
    })
};