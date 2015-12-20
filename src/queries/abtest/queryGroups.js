'use strict';

const rx = require('rx');

// Model
const AbTestGroup = require('./../../model/AbTestGroup');

module.exports = function (abtest) {

    return rx.Observable.create(function (o) {
        AbTestGroup.find({
            abtest: abtest
        }, null, {
            sort: {
                index: 1
            }
        }, function (err, groups) {
            if (err) {
                console.log(err);
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
