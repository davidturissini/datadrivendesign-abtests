'use strict';

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const url = 'http://127.0.0.1:4000';
const createAbTest = require('./../helper/create-ab-test');
const logUserIn = require('./../helper/user-login');
const abtestGroupAssertType = require('./../assert/abtestGroup/assertType');

describe('creating impression', function () {
    let res;
    let abtestId;
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
                    .then(function (apikey) {
                        userApiKey = apikey;
                        createAbTest('test@test.com', 'password', {
                            attributes: {
                                name: 'abtest',
                                sampleSize: 4300
                            },
                            relationships: {
                                abtestGroup: [{
                                    slug: 'group-1',
                                    distribution: 0.5,
                                    name: 'group 1'
                                }, {
                                    slug: 'group-2',
                                    distribution: 0.5,
                                    name: 'group 2'
                                }]
                            }
                        })
                        .then(function (abtestData) {
                            abtestId = abtestData.data.id;

                            request(url)
                                .post(`/abtests/${abtestId}/impressions?api_key=${apikey}`)
                                .end(function (err, r) {
                                    res = r;
                                    done();
                                });
                        })
                        .catch((e) => {
                            console.log(e);
                        });
                    });
                });

            it('should have a status 200', function () {
                expect(res.statusCode).to.equal(200);
            });

            it('should have a data object', function () {
                expect(res.body.data).to.exist;
            });

            describe('data', function () {
                let abtestGroupData;

                beforeEach(function () {
                    abtestGroupData = res.body.data;
                });

                abtestGroupAssertType(function () {
                    return abtestGroupData;
                });

                it('should have an id property', function () {
                    expect(abtestGroupData.id).to.exist;
                });

                it('should have a relationships property', function () {
                    expect(abtestGroupData.relationships).to.exist;
                });

                it('should have assigned the correct group', function () {
                    expect(abtestGroupData.attributes.slug).to.equal('group-1');
                });

                describe('relationships', function () {
                    let relationships;

                    beforeEach(function () {
                        relationships = abtestGroupData.relationships;
                    });

                    it('should have participant', function () {
                        expect(relationships.participant).to.exist;
                    });

                    describe('participant', function () {
                        let participantKey;

                        beforeEach(function () {
                            participantKey = abtestGroupData.relationships.participant.data.attributes.key;
                        });

                        it('should have attributes', function () {
                            expect(abtestGroupData.relationships.participant.data.attributes).to.exist;
                        });

                        it('should have key attribute', function () {
                            expect(participantKey).to.be.a('string');
                        });

                        describe('when same participant makes a call to impressions', function () {
                            let secondResponse;

                            before(function (done) {
                                request(url)
                                    .post(`/abtests/${abtestId}/impressions?api_key=${userApiKey}`)
                                    .send({
                                        data: {
                                            type: 'participant',
                                            attributes: {
                                                key: participantKey
                                            }
                                        }
                                    })
                                    .end(function (err, r) {
                                        secondResponse = r;
                                        done();
                                    });
                            });

                            it('should assign the same group', function () {
                                expect(secondResponse.body.data.attributes.slug).to.equal('group-1');
                            });
                        });
                    });
                });

                describe('when another request is sent with no participant object', function () {
                    let anotherRequest;

                    before(function (done) {
                        request(url)
                            .post(`/abtests/${abtestId}/impressions?api_key=${userApiKey}`)
                            .end(function (err, r) {
                                anotherRequest = r;
                                done();
                            });
                    });

                    it('should assign to the correct group', function () {
                        expect(anotherRequest.body.data.attributes.slug).to.equal('group-2');
                    });
                });

                describe('when a third request is sent with no participant object', function () {
                    let anotherRequest;

                    before(function (done) {
                        request(url)
                            .post(`/abtests/${abtestId}/impressions?api_key=${userApiKey}`)
                            .end(function (err, r) {
                                anotherRequest = r;
                                done();
                            });
                    });

                    it('should assign to the correct group', function () {
                        expect(anotherRequest.body.data.attributes.slug).to.equal('group-1');
                    });
                });
            });
        });
    });
});
