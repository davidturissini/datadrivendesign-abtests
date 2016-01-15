'use strict';

const rx = require('rx');

const responsePricingTierShow = require('./../../responses/pricingTier/show');
const PricingTier = require('./../../model/PricingTier');

module.exports = function () {
    return rx.Observable.create(function (o) {
        PricingTier.find({}, function (err, tiers) {
            if (err) {
                o.onError(err);
            }

            tiers.forEach(function (tier) {
                o.onNext(tier);
            });

            o.onCompleted();
        });
    })
    .flatMap((tier) => {
        return responsePricingTierShow(tier);
    })
    .toArray()
    .map((tiers) => {
        return tiers;
    });
};
