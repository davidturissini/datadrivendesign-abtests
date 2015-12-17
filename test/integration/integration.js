'use strict';

const mongodb = require('mongodb');

describe('Ab test api', function () {
    after(function (done) {
        return mongodb.connect('mongodb://localhost/test')
            .then(function (db) {
                db.collection('users').remove({});
                done();
            });
    });

    require('./creating-user');
    require('./creating-usersession');
    require('./creating-ab-test');
    require('./getting-ab-tests');
    require('./creating-impressions');
    require('./creating-conversions');
});
