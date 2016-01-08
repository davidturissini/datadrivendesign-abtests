'use strict';

const rx = require('rx');

// Model
const AbTestGroup = require('./../../model/AbTestGroup');

module.exports = function (abtest) {
    return rx.Observable.create(function (o) {
        AbTestGroup.count({
            abtest: abtest
        }, function (err, count) {
            if (err) {
                o.onError(err);
                return;
            }

            o.onNext(count);
            o.onCompleted();
        });
    });
};
