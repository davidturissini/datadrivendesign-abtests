'use strict';

const rx = require('rx');

// Model
const AbTest = require('./../../model/AbTest');

module.exports = function (user) {

    return rx.Observable.create(function (o) {

        AbTest.find({
            user: user
        }, null, {
            sort:{
                _id: -1 //Sort by Date Added DESC
            }
        }, function (err, abtests) {
            if (err) {
                o.onError(err);
                return;
            }

            abtests.forEach(function (abtest) {
                o.onNext(abtest);
            });


            o.onCompleted();
        })

    });

};
