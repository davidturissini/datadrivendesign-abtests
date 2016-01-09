'use strict';

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const url = 'http://localhost:4000';
const createAbTest = require('./../helper/create-ab-test');
const logUserIn = require('./../helper/user-login');
const createImpression = require('./../helper/create-impression');

describe('creating conversion', function () {
    let abtestId;
    let res;
    let groupId;
    let userApiKey;

    describe('successful requests', function () {
        describe('when sent with no participant object', function () {
            before(function (done) {
                logUserIn('test@test.com', 'password')
                    .then(function (loginData) {
                        return new Promise(function (resolve, rej) {
                            const userId = loginData.relationships.user.id;
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
                                sampleSize: 2
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

                            return createImpression(abtestData.data, userApiKey)
                                .then((data) => {
                                    groupId = data.groupId;
                                    res = data.impressionsResponse;
                                    done();
                                });
                        });
                    });
            });

            it('should have a status 200', function () {
                expect(res.statusCode).to.equal(200);
            });

            it('should have a data object', function () {
                expect(res.body.data).to.exist;
            });

            describe('when an abtest is queried after a conversion', function () {
                let abtestRes;
                let convertedAbtestGroup;

                before(function (done) {
                    logUserIn('test@test.com', 'password')
                        .then(function (loginData) {
                            const userId = loginData.relationships.user.id;
                            const userSessionId = loginData.id;

                            request(url)
                                .get(`/users/${userId}/abtests?api_key=${userApiKey}`)
                                .set('authentication', `token ${userId}:${userSessionId}`)
                                .send()
                                .end(function (err, r) {
                                    abtestRes = r;

                                    abtestRes.body.data.filter((abtestData) => {
                                        return abtestData.id === abtestId;
                                    })
                                    .map((abtestData) => {
                                        return abtestData.relationships.abtestGroup.concat(abtestData.relationships.abtestGroupControl);
                                    })
                                    .reduce((seed, val) => {
                                        return val;
                                    }, [])
                                    .filter((abtestGroupData) => {
                                        return abtestGroupData.id === groupId;
                                    })
                                    .forEach((abtestGroup) => {
                                        convertedAbtestGroup = abtestGroup;
                                    });

                                    done();
                                });
                        });
                });

                it('should have the correct number of conversions', function () {
                    expect(convertedAbtestGroup.meta.conversionsCount).to.equal(1);
                });
            });
        });
    });
});
