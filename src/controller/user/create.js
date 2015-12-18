'use strict';

const rx = require('rx');
const _ = require('lodash');

// Client
const authServiceClient = require('./../../client/authServiceClient');

// Model
const User = require('./../../model/User');
const ApiKey = require('./../../model/ApiKey');

module.exports = function (req) {
    return rx.Observable.return(req.body)
        .flatMapLatest((userData) => {
            return rx.Observable.create(function (o) {
                const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                if (!re.test(userData.username)) {
                    o.onError({
                        message: `${userData.username} is not a valid email address.`
                    });
                }

                userData.email = userData.username;
                o.onNext(userData);
                o.onCompleted();
            });
        })

        .flatMapLatest((userParams) => {
            return authServiceClient('/users', {
                method: 'post',
                body: userParams
            });
        })

        .flatMapLatest((userJson) => {
            return rx.Observable.create(function (o) {
                if (userJson.error) {
                    o.onError(userJson.error);
                    return;
                }

                o.onNext(userJson.data);
                o.onCompleted();
            });
        })

        .flatMapLatest((userData) => {
            const userParams = {
                user_management_id: userData._id
            };

            return rx.Observable.create(function (o) {
                ApiKey.create({}, function (err, apikey) {
                    if (err) {
                        o.onError(err);
                    }

                    o.onNext(apikey);
                    o.onCompleted();
                });
            })
            .flatMapLatest((apiKey) => {
                userParams.apiKey = apiKey;
                return rx.Observable.create(function (o) {
                    User.create(userParams, function (err, user) {
                        if (err) {
                            o.onError(err);
                            return;
                        }

                        o.onNext(user);
                        o.onCompleted();
                    });
                })
                .map((user) => {
                    const userObject = _.omit(user.toObject(),
                        '_id',
                        '__v',
                        'user_management_id'
                    );

                    const attributes = _.extend(userData, userObject);

                    return {
                        type: 'user',
                        id: user._id,
                        attributes: _.omit(attributes, '_id'),
                        relationships: {
                            apikey: {
                                type: 'apikey',
                                id: apiKey._id
                            }
                        }
                    };
                });
            });
        });
};
