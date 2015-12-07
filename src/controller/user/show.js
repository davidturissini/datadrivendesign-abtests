'use strict';

const rx = require('rx');
const _ = require('lodash');

// Client
const authServiceClient = require('./../../client/authServiceClient');


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
        })

    })
    .flatMapLatest((user) => {
        const path = `/users/${user.user_management_id}`;

        return authServiceClient(path, {
            method: 'get'
        })
        .map((userResp) => {
            const userData = userResp.data;

            return _.extend(userData, user.toObject());
        })
    })

    .map((json) => {
        return _.omit(json, 'user_management_id', '__v');
    })

    .map((json) => {
        return {
            data: json
        };
    })

    .map((json) => {
        return JSON.stringify(json);
    });
}