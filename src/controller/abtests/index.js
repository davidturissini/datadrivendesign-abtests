'use strict';

const rx = require('rx');
const _ = require('lodash');

// Client
const authServiceClient = require('./../../client/authServiceClient');

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

                o.onNext(abtests);
                o.onCompleted();
            })

        })

    })

    .flatMapLatest((abtests) => {
        const abtestObjects = [];
        const promises = abtests.map((abtest) => {
            return new Promise(function (res, rej) {
                AbTestGroup.find({
                    abtest: abtest
                }, function (err, groups) {
                    if (err) {
                        rej(err);
                        return;
                    }

                    const abtestObject = abtest.toObject();
                    abtestObject.groups = groups.map((group) => {
                        return _.omit(group.toObject(), '__v');
                    });

                    abtestObjects.push(abtestObject);

                    res();
                })
            });
        });

        const promise = Promise.all(promises);
        return rx.Observable.fromPromise(promise)
            .map(() => {
                return abtestObjects;
            });

    })

    .map((abtests) => {
        console.log('abtests', abtests);
        return abtests;
    })

    .map((abtestObjects) => {
        return JSON.stringify(abtestObjects);
    })
};