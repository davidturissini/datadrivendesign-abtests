'use strict';

const rx = require('rx');

const PricingTier = require('./../../model/PricingTier');

module.exports = function (attributes) {
    return rx.Observable.create(function (o) {
        PricingTier.findOne(attributes, function (err, tier) {
            if (err) {
                o.onError(err);
            }

            o.onNext(tier);
            o.onCompleted();
        });
    });
};
