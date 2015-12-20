'use strict';

const rx = require('rx');

const User = require('./../../model/User');
const AbTest = require('./../../model/AbTest');

module.exports = function validateApiKey(apiKey, abtestId) {
    return rx.Observable.create(function (o) {
        if (typeof apiKey !== 'string') {
            o.onError('Invalid API Key');
        }

        User.findOne({
            apiKey: apiKey,
        }, function (err, user) {
            if (err) {
                o.onError(err);
            }

            o.onNext(user);
            o.onCompleted();
        });
    })
    .flatMapLatest((user) => {
        return rx.Observable.create(function (o) {
            AbTest.findOne({
                user: user,
                _id: abtestId
            }, function (err, abtest) {
                if (err) {
                    o.onError(err);
                }

                if (!abtest) {
                    o.onError('Invalid API Key');
                }

                o.onNext(abtest);
                o.onCompleted();
            });
        });
    });
};
