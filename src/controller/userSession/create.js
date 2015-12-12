'use strict';

const rx = require('rx');
const _ = require('lodash');

// Client
const authServiceClient = require('./../../client/authServiceClient');


// Model
const User = require('./../../model/User');

module.exports = function (req) {

    return authServiceClient('/userSession', {
            method: 'post',
            body: req.body
        })
        .flatMapLatest((userSessionJson) => {
            return rx.Observable.create(function (o) {
                if (userSessionJson.error) {
                    o.onError(userSessionJson.error);
                    return;
                }

                o.onNext(userSessionJson);
                o.onCompleted();

            });
        })

        .flatMapLatest((userSessionJson) => {
            const userManagementId = userSessionJson.data.relationships.user.id;

            return rx.Observable.create(function (o) {
                User.findOne({
                    user_management_id: userManagementId
                }, function (err, user) {
                    if (err) {
                        o.onError(err);
                        return;
                    }

                    const userData = _.clone(userSessionJson.data.relationships.user);
                    userData.id = user._id;
                    
                    const userSessionData = {
                        data: {
                            type: 'usersession',
                            id: userSessionJson.data.id,
                            relationships: {
                                user: userData
                            }
                        }
                    };

                    o.onNext(userSessionData);
                    o.onCompleted();
                });

            });
        })

        .map((json) => {
            return JSON.stringify(json);
        })

};