'use strict';

const connectUsersDB = require('./../helper/connect-users-db');

describe('Ab test api', function () {
    after(function (done) {
        connectUsersDB()
            .subscribe(function (db) {
                db.collection('users').remove({});
                done();
            });
    });

    require('./creating-user');
    require('./creating-usersession');
    require('./creating-ab-test');
    require('./getting-ab-tests');
    require('./getting-abtest');
    require('./creating-impressions');
    require('./creating-conversions');
});
