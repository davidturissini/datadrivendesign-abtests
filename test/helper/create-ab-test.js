'use strict';

const request = require('supertest');
const url = 'http://127.0.0.1:4000';

const logUserIn = require('./user-login');

module.exports = function (username, password, data) {
    let userId;
    let userSessionId;

    return new Promise(function (res) {
        logUserIn(username, password)
            .then(function (loginData) {
                userId = loginData.relationships.user.id;
                userSessionId = loginData.id;

                request(url)
                    .post(`/users/${userId}/abtests`)
                    .set('authentication', `token ${userId}:${userSessionId}`)
                    .send({
                        data: data
                    })
                    .end(function (err, r) {
                        res(r.body);
                    });
            });
    });
};
