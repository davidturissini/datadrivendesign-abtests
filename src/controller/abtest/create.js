'use strict';

const rx = require('rx');
const request = require('request');
const _ = require('lodash');

// Model
const AbTest = require('./../../model/AbTest');
const AbTestGroup = require('./../../model/AbTestGroup');
const User = require('./../../model/User');

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
        })
    })
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

    .map((abtest) => {

        const obj = _.omit(abtest.toObject(), '__v');
        return JSON.stringify(obj);
    });

}