'use strict';

const rx = require('rx');
const _ = require('lodash');

// Client
const authServiceClient = require('./../../client/authServiceClient');


// Model
const User = require('./../../model/User');
const ApiKey = require('./../../model/ApiKey');


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
        return rx.Observable.create(function (o) {
            ApiKey.findById(user.apiKey, function (err, apiKey) {
                if (err) {
                    o.onError(err);
                }

                o.onNext(apiKey);
                o.onCompleted();
            });
        })
        .flatMapLatest((apiKey) => {
            const path = `/users/${user.user_management_id}`;

            return authServiceClient(path, {
                method: 'get'
            })
            .map((userResp) => {
                const userData = userResp.data;
                const userObject = user.toObject();
                userObject.id = userObject._id;

                const json = _.extend(userData, userObject);
                json.relationships = {
                    apikey: {
                        type: 'apikey',
                        id: apiKey._id
                    }
                };

                return json;
            });
        });
    })

    .map((json) => {
        return _.omit(json, 'user_management_id', '__v', '_id');
    });

}
