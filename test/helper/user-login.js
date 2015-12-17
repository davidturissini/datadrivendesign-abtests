'use strict';

const request = require('supertest');
const url = 'http://127.0.0.1:4000';

module.exports = function (username, password) {
    return new Promise(function (res) {
        request(url)
            .post('/usersessions')
            .send({
                username: username,
                password: password
            })
            .end(function (err, r) {
                res(r.body.data);
            });
    });
};
