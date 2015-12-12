'use strict';

const rx = require('rx');
const request = require('request');
const _ = require('lodash');

// Model
const AbTest = require('./../../model/AbTest');
const AbTestGroup = require('./../../model/AbTestGroup');
const AbTestState = require('./../../model/AbTestState');
const User = require('./../../model/User');

// Action
const validateUserSessionFromRequest = require('./../../action/user/validateUserSessionFromRequest');

module.exports = function (req) {

    return validateUserSessionFromRequest(req)
        .flatMapLatest((user) => {
            return rx.Observable.create(function (o) {
                const json = req.body;
                const abtestParams = _.omit(json, 'groups');

                if (!json.groups) {
                    o.onError('Could not create abtest. No groups were sent with request');
                }

                const groups = json.groups.slice();

                abtestParams.user = user;

                if (!abtestParams.name) {
                    abtestParams.name = null;
                }
                
                AbTest.create(abtestParams, (err, abtest) => {
                    if (err) {
                        o.onError(err);
                        return;
                    }

                    const abtestGroups = groups.map(function (g) {
                        if (typeof g.distribution !== 'number') {
                            o.onError('Could not create ab test. Group "' + g.name + '" has an invalid distribution value: "' + g.distribution + '".');
                        }

                        g.abtest = abtest;

                        return g
                    });

                    abtestGroups.push(function (err, groups) {
                        if (err) {
                            o.onError(err);
                            return;
                        }

                        o.onNext(abtest);
                        o.onCompleted();
                    })

                    AbTestGroup.create.apply(AbTestGroup, abtestGroups);

                });


            })
        })

        .flatMapLatest((abtest) => {
            return rx.Observable.create(function (o) {

                AbTestState.create({
                    abtest:abtest,
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

        .map((abtest) => {
            return _.omit(abtest.toObject(), '__v');
        });

}