'use strict';

const rx = require('rx');
const _ = require('lodash');

module.exports = function (pricingTier) {
    return rx.Observable.create(function (o) {
        const pricingTierAttributes = _.omit(
            pricingTier.toObject(),
            '__v',
            '_id'
        );

        const data = {
            type: 'pricingtier',
            attributes: pricingTierAttributes
        };

        o.onNext(data);
        o.onCompleted();
    });
};
