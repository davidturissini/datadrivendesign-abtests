'use strict';

const rx = require('rx');

const AbTestState = require('./../../model/AbTestState');


module.exports = function (abtest) {

    return rx.Observable.create(function (o) {
        AbTestState.findOne({
            abtest: abtest
        }, null, {
            sort:{
                date: -1 //Sort by Date Added DESC
            }
        }, function (err, abtestState) {
            if (err) {
                o.onError(err);
            }

            o.onNext(abtestState);
            o.onCompleted();

        });

    });

}