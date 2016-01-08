'use strict';

const rx = require('rx');
const _ = require('lodash');

// Model
const AbTest = require('./../../model/AbTest');
const AbTestGroup = require('./../../model/AbTestGroup');
const AbTestState = require('./../../model/AbTestState');

// Action
const validateUserSessionFromRequest = require('./../../action/user/validateUserSessionFromRequest');

const abtestRestResponse = require('./../../stream/abtest/abtestRestResponse');

module.exports = function (req) {
    return validateUserSessionFromRequest(req)
        .flatMapLatest((user) => {
            const json = req.body;
            const abtestParams = json.data.attributes;
            const abtestGroupsData = json.data.relationships.abtestGroup;

            abtestParams.user = user;

            if (!abtestParams.name) {
                abtestParams.name = null;
            }

            return rx.Observable.create(function (o) {
                AbTest.create(abtestParams, (err, abtest) => {
                    if (err) {
                        o.onError(err);
                        return;
                    }

                    o.onNext(abtest);
                    o.onCompleted();
                });
            })

            .flatMapLatest((abtest) => {
                return rx.Observable.create(function (o) {
                    AbTestState.create({
                        abtest: abtest,
                        status: AbTestState.STATUS_ACTIVE
                    }, function (err, abtestState) {
                        if (err) {
                            o.onError(err);
                        }

                        o.onNext(abtest);
                        o.onCompleted();
                    });
                });
            })

            .flatMapLatest((abtest) => {
                return rx.Observable.create(function (o) {
                    abtestGroupsData.forEach(function (abtestGroupData, index) {
                        abtestGroupData.index = index;
                        o.onNext(abtestGroupData);
                    });

                    o.onCompleted();
                })

                .flatMap((abtestGroupData) => {
                    const attributes = _.clone(abtestGroupData);

                    return rx.Observable.create(function (o) {
                        attributes.abtest = abtest;

                        AbTestGroup.create(attributes, function (err, abtestGroup) {
                            if (err) {
                                o.onError(err);
                            }

                            o.onNext(abtestGroup);
                            o.onCompleted();
                        });
                    });
                })
                .toArray()
                .flatMapLatest((abtestGroups) => {
                    return abtestRestResponse(abtest);
                });
            });
        });
};
