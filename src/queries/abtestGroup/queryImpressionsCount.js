'use strict';

const rx = require('rx');

// Model
const Impression = require('./../../model/Impression');


module.exports = function (abtestGroup) {
    return rx.Observable.create(function (o) {
        Impression.count({
            abtestGroup: abtestGroup
        }, function (err, count) {
            if (err) {
                o.onError(err);
            }

            o.onNext(count);
            o.onCompleted();

        });
    });
};