'use strict';

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const url = 'http://localhost:4000';
const createAbTest = require('./../helper/create-ab-test');
const logUserIn = require('./../helper/user-login');
const createImpression = require('./../helper/create-impression');

const abtestCalculator = require('data-driven-design-ab-test-calculator');

describe('creating conversion', function () {
    let abtestId;
    let res;
    let groupId;
    let userApiKey;
    let userId;
    let userSessionId;

    describe('successful requests', function () {
        describe('when ab test has run its course', function () {
            before(function (done) {
                logUserIn('test@test.com', 'password')
                    .then(function (loginData) {
                        return new Promise(function (resolve, rej) {
                            userId = loginData.relationships.user.id;
                            userSessionId = loginData.id;

                            return request(url)
                                .get(`/users/${userId}`)
                                .end(function (err, r) {
                                    resolve(r.body.data.relationships.apikey.id);
                                });
                        });
                    })
                    .then((apikey) => {
                        userApiKey = apikey;
                        createAbTest('test@test.com', 'password', {
                            attributes: {
                                name: 'abtest',
                                sampleSize: 10
                            },
                            relationships: {
                                abtestGroupControl: {
                                    type: 'abtestgroup',
                                    attributes: {
                                        slug: 'group-1',
                                        name: 'group 1'
                                    }
                                },
                                abtestGroup: [{
                                    type: 'abtestgroup',
                                    attributes: {
                                        slug: 'group-2',
                                        name: 'group 2'
                                    }
                                }]
                            }
                        })
                        .then(function (abtestData) {
                            abtestId = abtestData.data.id;
                            const groups = {};

                            const promises = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => {
                                return createImpression(abtestData.data, userApiKey)
                                    .then(function (r) {
                                        if (!groups[r.groupId]) {
                                            groups[r.groupId] = 0;
                                        }

                                        groups[r.groupId] += 1;
                                    })
                            });

                            Promise.all(promises).then(function () {
                                return request(url)
                                .get(`/users/${userId}/abtests/${abtestId}`)
                                .set('authentication', `token ${userId}:${userSessionId}`)
                                .send()
                                .end(function (err, r) {
                                    res = r;
                                    done();
                                });
                            });
                        });
                    });
            });

            it('should have a status 200', function () {
                expect(res.statusCode).to.equal(200);
            });

            it('should have an included attribute', function () {
                expect(res.body.data.included).to.exist;
            });

        });
    });
});
