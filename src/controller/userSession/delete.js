'use strict';

const rx = require('rx');

// Model
const User = require('./../../model/User');

// Action
const validateUserSession = require('./../../action/user/validateUserSession');

// Client
const authServiceClient = require('./../../client/authServiceClient');

module.exports = function (req) {
    const userSessionToken = req.headers.authentication.split(':')[1];
    const userId = req.headers.authentication.split(' ')[1].split(':')[0];

    return rx.Observable.create(function (o) {
            User.findById(userId, function (err, user) {
                if (err) {
                    o.onError(err);
                }

                o.onNext(user);
                o.onCompleted();

            });
        })

        .flatMapLatest((user) => {
            return validateUserSession(user, userSessionToken)
        })
        .flatMapLatest((user) => {

            return authServiceClient(`/users/${user.user_management_id}/destroyUserSession`, {
                method: 'delete',
                body: {
                    data: {
                        id: userSessionToken
                    }
                }
            });

        })

        .flatMapLatest((resp) => {
            return rx.Observable.create(function (o) {
                if (resp.error) {
                    o.onError(resp.error);
                }

                o.onNext(resp);
                o.onCompleted();

            });
        });

}