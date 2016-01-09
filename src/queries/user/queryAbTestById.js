'use strict';

const rx = require('rx');

// Model
const AbTest = require('./../../model/AbTest');

module.exports = function (user, id) {
    return rx.Observable.create(function (o) {
        AbTest.findOne({
            user: user,
            _id: id
        }, function (err, abtest) {
            if (err) {
                o.onError(err);
                return;
            }

            o.onNext(abtest);
            o.onCompleted();
        });
    });
};
