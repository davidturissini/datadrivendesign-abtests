'use strict';

const rx = require('rx');

// Response
const createUserShowResponse = require('./../../responses/user/show');

// Model
const User = require('./../../model/User');


module.exports = function (req) {
    const userId = req.params.user_id;

    return rx.Observable.create(function (o) {
        User.findById(userId, function (err, user) {
            if (err) {
                o.onError(err);
                return;
            }

            o.onNext(user);
            o.onCompleted();
        });
    })
    .flatMapLatest((user) => {
        return createUserShowResponse(user);
    });

};
