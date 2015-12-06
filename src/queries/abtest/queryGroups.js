'use strict';

const rx = require('rx');

// Model
const AbTestGroup = require('./../../model/AbTestGroup');

module.exports = function (abtest) {

    return rx.Observable.create(function (o) {
        AbTestGroup.find({
            abtest: abtest
        }, function (err, groups) {
            if (err) {
                o.onError(err);
                return;
            }

            groups.forEach(function (group) {
                o.onNext(group);
            });

            o.onCompleted();

        });

    });

}