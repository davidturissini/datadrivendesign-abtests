'use strict';

const rx = require('rx');
const User = require('./../../model/User');

const queryUserById = require('./../../queries/user/queryById');

module.exports = function (user, pricingTier) {
    return rx.Observable.create(function (o) {
        User.update({
            _id: user.id
        }, {
            pricingTier: pricingTier
        }, function (err, mongoResp) {
            if (err) {
                o.onError(err);
            }

            o.onNext(mongoResp);
            o.onCompleted();
        });
    })
    .flatMapLatest((mongoResp) => {
        return queryUserById(user.id);
    });
};
