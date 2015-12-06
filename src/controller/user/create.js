'use strict';

const rx = require('rx');
const _ = require('lodash');

// Client
const authServiceClient = require('./../../client/authServiceClient');

// Model
const User = require('./../../model/User');

module.exports = function (req) {

    return authServiceClient('/users', {
            method: 'post',
            body: req.body
        })
        .flatMapLatest((userJson) => {

            return rx.Observable.create(function (o) {
                if (userJson.error) {
                    o.onError(userJson.error);
                    return;
                }

                o.onNext(userJson.data);
                o.onCompleted();

            })
        })
        .flatMapLatest((userData) => {
            const userParams = {
                user_management_id: userData._id
            };

            return rx.Observable.create(function (o) {
                User.create(userParams, function (err, user) {
                    if (err) {
                        o.onError(err);
                        return;
                    }

                    const userObject = _.omit(user.toObject(), '__v', 'user_management_id');
                    const json = _.extend(userData, userObject);

                    o.onNext(json);
                    o.onCompleted();

                });
            });

        })

        .map((userObject) => {
            return JSON.stringify(userObject);
        });

}