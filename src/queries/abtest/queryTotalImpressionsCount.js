'use strict';

const rx = require('rx');

const Impression = require('./../../model/Impression');

module.exports = function (abtest) {
    return rx.Observable.create(function (o) {
        Impression.count({
            abtest: abtest
        }, function (err, count) {
            if (err) {
                o.onError(err);
            }

            o.onNext(count);
            o.onCompleted();
        });
    });
};
