'use strict';

const rx = require('rx');


// Model
const User = require('./../../model/User');

module.exports = function (req) {
    const user_id = req.params.user_id;

    return rx.Observable.create(function (o) {
        User.findById(user_id, function (err, user) {
            if (err) {
                o.onError(err);
                return;
            }

            o.onNext(user);
            o.onCompleted();

        });
    });
}