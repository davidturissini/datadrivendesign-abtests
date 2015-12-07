'use strict';

const rx = require('rx');

// Model
const Conversion = require('./../../model/Conversion');


module.exports = function (abtestGroup) {
    return rx.Observable.create(function (o) {
        Conversion.count({
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