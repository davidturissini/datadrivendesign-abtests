'use strict';

const usersDbStream = require('./../db/user');
const abtestDbStream = require('./../db/abtest');

describe('Ab test api', function () {
    let u;
    let a;

    before(function () {
        u = usersDbStream.connect();
        a = abtestDbStream.connect();

        usersDbStream.subscribe(function (db) {
            db.collection('users').remove({});
        });
    });

    after(function () {
        u.dispose();
        a.dispose();
    });

    require('./creating-user');
    require('./creating-usersession');
    require('./creating-ab-test');
    require('./getting-ab-tests');
    require('./getting-abtest');
    require('./creating-impressions');
    require('./creating-conversions');
    require('./calculating-abtest-results');
});
