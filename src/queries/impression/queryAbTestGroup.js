'use strict';

const rx = require('rx');

// Model
const AbTestGroup = require('./../../model/AbTestGroup');

module.exports = function (impression) {

    return rx.Observable.create(function (o) {
        AbTestGroup.findById(impression.abtestGroup, function (err, abtestGroup) {
            if (err) {
                o.onError(err);
            }

            o.onNext(abtestGroup);
            o.onCompleted();

        });

    });

}