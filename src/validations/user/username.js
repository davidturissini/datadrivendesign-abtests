'use strict';

const rx = require('rx');

module.exports = function (userData) {
    return rx.Observable.create(function (o) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!re.test(userData.username)) {
            o.onError({
                message: `${userData.username} is not a valid email address.`
            });
        }

        userData.email = userData.username;
        o.onNext(userData);
        o.onCompleted();
    });
};
