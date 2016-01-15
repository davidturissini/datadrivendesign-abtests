'use strict';

const rx = require('rx');

module.exports = function (user) {
    return rx.Observable.create(function (o) {
        user.populate('apiKey', function (err, populatedUser) {
            if (err) {
                o.onError(err);
            }

            o.onNext(populatedUser.apiKey);
            o.onCompleted();
        });
    });
};
