'use strict';

const rx = require('rx');

const mongodb = require('mongodb');

module.exports = function () {
    return rx.Observable.create(function (o) {
        const dbhost = process.env.USER_MONGO_HOST;
        const db = process.env.USER_MONGO_DB;

        if (!dbhost || !db) {
            o.onError('Missing database host and db.');
        }

        const string = `mongodb://${dbhost}/${db}`;

        o.onNext(string);
        o.onCompleted();
    })
    .flatMapLatest((connectionString) => {
        return mongodb.connect(connectionString);
    });
};
