'use strict';

const rx = require('rx');
const User = require('./../../model/User');


module.exports = function (userId) {
    return rx.Observable.create(function (o) {
        User.findById(userId, function (err, user) {
            if (err) {
                o.onError(err);
            }

            o.onNext(user);
            o.onCompleted();

        });
    });
}
