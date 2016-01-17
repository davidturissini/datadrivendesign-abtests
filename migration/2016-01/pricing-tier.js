'use strict';

const rx = require('rx');
const dbConnection = require('./../../src/db/connection');
const PricingTier = require('./../../src/model/PricingTier');
const User = require('./../../src/model/User');

function createPricingTier(attributes) {
    return rx.Observable.create(function (o) {
        PricingTier.create(attributes, function (err, tier) {
            if (err) {
                o.onError(err);
            }

            o.onNext(tier);
            o.onCompleted();
        });
    });
}

dbConnection.flatMapLatest((db) => {
    const devTierStream = createPricingTier({
        impressions_limit: 500,
        abtest_limit: 5,
        name: 'DEV',
        label: 'development',
        price_per_unit: 0
    });

    const proTierStream = createPricingTier({
        impressions_limit: Infinity,
        abtest_limit: Infinity,
        name: 'PRO',
        label: 'professional',
        price_per_unit: 49.99
    });

    return devTierStream
        .combineLatest(
            proTierStream,
            function (devTier, proTier) {
                return proTier;
            }
        );
})
.flatMapLatest((proTier) => {
    return rx.Observable.create(function (o) {
        User.find({}, function (err, users) {
            if (err) {
                o.onError(err);
            }

            users.forEach(function (user) {
                o.onNext(user);
            });

            o.onCompleted();
        });
    })
    .flatMap((user) => {
        return rx.Observable.create(function (o) {
            user.pricingTier = proTier;
            user.save(function (err) {
                if (err) {
                    o.onError(err);
                }

                o.onNext(user);
                o.onCompleted();
            });
        });
    });
})
.subscribe((user) => {
    console.log(`user ${user._id} updated`);
});
