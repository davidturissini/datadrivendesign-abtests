'use strict';

const rx = require('rx');
const request = require('request');
const abtests = require('./../persistence/abtests');
const groups = require('./../persistence/groups');

module.exports = function (req) {
    return rx.Observable.create(function (o) {
        const options = {
            url: 'http://localhost:4100/users/' + req.params.user_id,
            headers: {
                'x-auth-token': req.headers['x-auth-token']
            }
        };

        request(options, function (err, resp, body) {
            o.onNext({ err, resp, body });
        });

    })

    .map(({ err, resp, body }) => {
        if (resp.statusCode === 500) {
            const err = JSON.parse(body);
            throw new Error(err.message);
        }
        
        return JSON.parse(body);
    })

    .flatMapLatest((user) => {
        return rx.Observable.create(function (o) {
            const userAbTests = abtests.findAllForUser(user);
            o.onNext(userAbTests);
        });
    })

    .flatMapLatest((userAbTests) => {
        return rx.Observable.create(function (o) {
            const tests = userAbTests.map(function (userAbTest) {
                userAbTest.groups = groups.findAllForABTest(userAbTest);

                return userAbTest;
            });
            

            o.onNext(tests);

        });
        
    })

    .map((abtests) => {

        return JSON.stringify(abtests);
    })
};