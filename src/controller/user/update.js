'use strict';

const rx = require('rx');

// Action
const updateUserPricingTierAction = require('./../../action/user/updateUserPricingTier');

// Query
const queryPricingTierById = require('./../../queries/pricingTier/findById');
const queryUserById = require('./../../queries/user/queryById');

// Response
const createUserShowResponse = require('./../../responses/user/show');

// Model
const User = require('./../../model/User');


module.exports = function (req) {
    const userId = req.params.user_id;
    const reqBody = req.body;
    const pricingTierData = reqBody.data.relationships.pricingTier;

    return queryPricingTierById(pricingTierData.id)
        .flatMapLatest((pricingTier) => {
            return queryUserById(userId)
                .flatMapLatest((user) => {
                    return updateUserPricingTierAction(user, pricingTier);
                });
        })
        .flatMapLatest((user) => {
            return createUserShowResponse(user);
        });
};
