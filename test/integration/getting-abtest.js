'use strict';

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const logUserIn = require('./../helper/user-login');
const createAbTest = require('./../helper/create-ab-test');
const abtesturl = require('./../helper/abtest-url');

// asserts
const assertErrorMessageReceived = require('./../assert/errorMessageReceived');
const assertAbTestMissingAttributes = require('./../assert/abtest/assertMissingAttributes');

describe('Get ab tests', function () {
    let res;
    let userId;
    let userSessionId;
    let abtestId;

    describe('valid usersession id', function () {
        before(function (done) {
            logUserIn('test@test.com', 'password')
                .then(function (loginData) {
                    userId = loginData.relationships.user.id;
                    userSessionId = loginData.id;

                    return createAbTest('test@test.com', 'password', {
                        attributes: {
                            name: 'abtest',
                            sampleSize: 4300
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

                        abtesturl()
                            .subscribe((url) => {
                                request(url)
                                    .get(`/users/${userId}/abtests/${abtestId}`)
                                    .set('authentication', `token ${userId}:${userSessionId}`)
                                    .end(function (err, r) {
                                        res = r;
                                        done();
                                    });
                            });
                    });
                });
        });

        it('shoud have status 200', function () {
            expect(res.statusCode).to.equal(200);
        });
    });
});
