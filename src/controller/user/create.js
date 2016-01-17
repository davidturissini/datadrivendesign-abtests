'use strict';

const rx = require('rx');
const _ = require('lodash');

// Client
const authServiceClient = require('./../../client/authServiceClient');

// Model
const User = require('./../../model/User');
const ApiKey = require('./../../model/ApiKey');

// Validations
const userNameValidation = require('./../../validations/user/username');

// Queries
const queryPricingTierById = require('./../../queries/pricingTier/findById');

// Response
const userShowResponse = require('./../../responses/user/show');

module.exports = function (req) {
    const pricingTierAttributes = req.body.data.relationships.pricingTier.id;

    const pricingTierStream = queryPricingTierById(pricingTierAttributes);

    return rx.Observable.return(req.body.data.attributes)
        .flatMapLatest((userData) => {
            return userNameValidation(userData);
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
            .combineLatest(
                pricingTierStream,
                function (apiKey, pricingTier) {
                    userParams.apiKey = apiKey;
                    userParams.pricingTier = pricingTier;

                    return userParams;
                }
            )
            .flatMapLatest((params) => {
                return rx.Observable.create(function (o) {
                    User.create(params, function (err, user) {
                        if (err) {
                            o.onError(err);
                            return;
                        }

                        o.onNext(user);
                        o.onCompleted();
                    });
                })
                .flatMapLatest((user) => {
                    return userShowResponse(user);
                });
            });
        });
};
