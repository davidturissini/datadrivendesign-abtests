'use strict';

const rx = require('rx');

// Model
const AbTest = require('./../../model/AbTest');

module.exports = function (user) {

    return rx.Observable.create(function (o) {
                
        AbTest.find({
            user: user
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