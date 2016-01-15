'use strict';

const rx = require('rx');

// Model
const ApiKey = require('./../../model/ApiKey');

module.exports = function (id) {
    return rx.Observable.create(function (o) {
        ApiKey.findById(id, function (err, apiKey) {
            if (err) {
                o.onError(err);
            }

            o.onNext(apiKey);
            o.onCompleted();
        });
    });
};
