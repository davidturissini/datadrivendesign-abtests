'use strict';

const rx = require('rx');

// Client
const authServiceClient = require('./../../client/authServiceClient');

module.exports = function (user, userSessionToken) {

    const path = `/users/${user.user_management_id}/validateUserSession`;

    return rx.Observable.create(function (o) {
        authServiceClient(path, {
            method: 'post',
            body: {
                data: {
                    type: 'userSession',
                    id: userSessionToken
                }
            }
        })
        .subscribe((resp) => {

            if (resp.error) {
                o.onError(resp.error);
            }

            o.onNext(user);
            o.onCompleted();

        })
    });

}