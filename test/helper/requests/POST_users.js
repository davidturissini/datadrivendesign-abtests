'use strict';

const rx = require('rx');
const request = require('supertest');

const abtestDbStream = require('./../../db/abtest');
const abtesturl = require('./../abtest-url');

module.exports = function (userAttributes, pricingTierAttributes) {
    return abtestDbStream.flatMapLatest((abtestDb) => {
        return rx.Observable.create(function (o) {
            abtestDb.collection('pricingtiers')
                .findOne(pricingTierAttributes)
                .then(function (tier) {
                    o.onNext(tier);
                    o.onCompleted();
                }, function (err) {
                    o.onError(err);
                });
        })

        .flatMapLatest((pricingTier) => {
            return abtesturl()
                .flatMapLatest((url) => {
                    return rx.Observable.create(function (o) {
                        request(url)
                            .post('/users')
                            .send({
                                data: {
                                    type: 'user',
                                    attributes: userAttributes,
                                    relationships: {
                                        pricingTier: {
                                            type: 'pricingtier',
                                            id: pricingTier._id
                                        }
                                    }
                                }
                            })
                            .end(function (err, r) {
                                o.onNext(r);
                                o.onCompleted();
                            });
                    });
                });
        });
    });
};
