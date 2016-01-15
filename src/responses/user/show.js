'use strict';

const _ = require('lodash');

// Client
const authServiceClient = require('./../../client/authServiceClient');

// Query
const queryUserApiKey = require('./../../queries/user/queryApiKey');
const queryUserPricingTier = require('./../../queries/user/queryPricingTier');

// Response
const showPricingTierResponse = require('./../pricingTier/show');

module.exports = function (user) {
    return queryUserApiKey(user)
        .flatMapLatest((apiKey) => {
            return queryUserPricingTier(user)
                .flatMapLatest((pricingTier) => {
                    return showPricingTierResponse(pricingTier);
                })
                .flatMapLatest((pricingTierAttributes) => {
                    const path = `/users/${user.user_management_id}`;

                    return authServiceClient(path, {
                        method: 'get'
                    })
                    .map((userResp) => {
                        const userId = user._id;
                        const userAttributes = _.omit(
                            user.toObject(),
                            '_id',
                            '__v',
                            'user_management_id',
                            'apiKey',
                            'pricingTier'
                        );


                        return {
                            type: 'user',
                            id: userId,
                            attributes: _.extend(userResp.data, userAttributes),
                            relationships: {
                                apikey: {
                                    type: 'apikey',
                                    id: apiKey._id
                                },
                                pricingTier: pricingTierAttributes
                            }
                        };
                    });
                });
        });
};
