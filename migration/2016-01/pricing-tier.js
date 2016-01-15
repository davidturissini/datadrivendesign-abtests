'use strict';

const rx = require('rx');
const dbConnection = require('./../../src/db/connection');
const PricingTier = require('./../../src/model/PricingTier');
const User = require('./../../src/model/User');

function createPricingTier(attributes) {
    return rx.Observable.create(function (o) {
        console.log(attributes);
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
        abtest_limit: 20,
        name: 'DEV',
        label: 'development'
    });

    const proTierStream = createPricingTier({
        impressions_limit: Infinity,
        abtest_limit: Infinity,
        name: 'PRO',
        label: 'professional'
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
