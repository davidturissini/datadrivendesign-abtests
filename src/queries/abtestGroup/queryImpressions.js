'use strict';

const rx = require('rx');

// Model
const Impression = require('./../../model/Impression');


module.exports = function (abtestGroup) {
    return rx.Observable.create(function (o) {
        Impression.find({
            abtestGroup: abtestGroup
        }, function (err, impressions) {
            if (err) {
                o.onError(err);
            }

            impressions.forEach(function (impression) {
                o.onNext(impression);
            });

            o.onCompleted();

        });
    });
};