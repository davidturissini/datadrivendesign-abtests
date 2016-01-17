'use strict';

const rx = require('rx');

const PricingTier = require('./../../model/PricingTier');

module.exports = function (id) {
    return rx.Observable.create(function (o) {
        PricingTier.findById(id, function (err, tier) {
            if (err) {
                o.onError(err);
            }

            o.onNext(tier);
            o.onCompleted();
        });
    });
};
