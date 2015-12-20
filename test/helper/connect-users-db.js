'use strict';

const rx = require('rx');

const mongodb = require('mongodb');

module.exports = function () {
    return rx.Observable.create(function (o) {
        const dbhost = process.env.USER_MONGO_HOST_TEST;
        const db = process.env.USER_MONGO_DB_TEST;

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
