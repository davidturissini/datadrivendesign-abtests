'use strict';

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const mongodb = require('mongodb');

const connectAbtestDb = require('./../helper/connect-abtest-db');

const abtesturl = require('./../helper/abtest-url');
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

                            abtesturl()
                                .subscribe((url) => {
                                    request(url)
                                        .get(`/users/${userId}`)
                                        .end(function (err, r) {
                                            resolve(r.body.data.relationships.apikey.id);
                                        });
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
                                        .post(`/abtests/${abtestId}/impressions?api_key=${apikey}`)
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

            it('should have a data object', function () {
                expect(res.body.data).to.exist;
            });

            describe('database', function () {
                let mongoImpressions;

                beforeEach(function (done) {
                    connectAbtestDb()
                        .subscribe((db) => {
                            db.collection('impressions').find({
                                abtest: new mongodb.ObjectID(abtestId)
                            }).toArray(function (err, impressions) {
                                mongoImpressions = impressions;
                                done();
                            });
                        });
                });

                it('should have created one mongo Impression', function () {
                    expect(mongoImpressions.length).to.equal(1);
                });
            });

            describe('data', function () {
                let abtestGroupData;
                let firstResponse;

                beforeEach(function () {
                    firstResponse = res;
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

                it('should have assigned a group', function () {
                    const slug = abtestGroupData.attributes.slug;
                    const equal = (slug === 'group-1' || slug === 'group-2');
                    expect(equal).to.equal(true);
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
                                abtesturl()
                                    .subscribe((url) => {
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
                            });

                            it('should assign the same group', function () {
                                expect(secondResponse.body.data.attributes.slug).to.equal(firstResponse.body.data.attributes.slug);
                            });
                        });
                    });
                });

                describe('when another request is sent with no participant object', function () {
                    let anotherRequest;

                    before(function (done) {
                        abtesturl()
                            .subscribe((url) => {
                                request(url)
                                    .post(`/abtests/${abtestId}/impressions?api_key=${userApiKey}`)
                                    .end(function (err, r) {
                                        anotherRequest = r;
                                        done();
                                    });
                            });
                    });

                    it('should assign to the correct group', function () {
                        const slug = anotherRequest.body.data.attributes.slug;
                        const equal = (slug === 'group-1' || slug === 'group-2');
                        expect(equal).to.equal(true);
                    });
                });

                describe('when a third request is sent with no participant object', function () {
                    let anotherRequest;

                    before(function (done) {
                        abtesturl()
                            .subscribe((url) => {
                                request(url)
                                    .post(`/abtests/${abtestId}/impressions?api_key=${userApiKey}`)
                                    .end(function (err, r) {
                                        anotherRequest = r;
                                        done();
                                    });
                            });
                    });

                    it('should assign to the correct group', function () {
                        const slug = anotherRequest.body.data.attributes.slug;
                        const equal = (slug === 'group-1' || slug === 'group-2');
                        expect(equal).to.equal(true);
                    });
                });
            });
        });

        describe('when an abtest has its target number of impressions', function () {
            let maxabtestid;

            before(function (done) {
                logUserIn('test@test.com', 'password')
                    .then(function (loginData) {
                        return new Promise(function (resolve, rej) {
                            const userId = loginData.relationships.user.id;

                            abtesturl()
                                .subscribe((url) => {
                                    request(url)
                                        .get(`/users/${userId}`)
                                        .end(function (err, r) {
                                            resolve(r.body.data.relationships.apikey.id);
                                        });
                                });
                        });
                    })
                    .then(function (apikey) {
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
                            maxabtestid = abtestData.data.id;

                            return abtesturl().toPromise().then(function (url) {
                                request(url)
                                    .post(`/abtests/${maxabtestid}/impressions?api_key=${apikey}`)
                                    .end(function (err, r) {
                                        request(url)
                                            .post(`/abtests/${maxabtestid}/impressions?api_key=${apikey}`)
                                            .end(function (err, r) {
                                                done();
                                            });
                                    });
                            });
                        });
                    });
            });

            describe('database', function () {
                let mongoabteststates;
                let currentmongoagteststate;

                beforeEach(function (done) {
                    connectAbtestDb()
                        .subscribe((db) => {
                            db.collection('abteststates').find({
                                abtest: new mongodb.ObjectID(maxabtestid)
                            }).toArray(function (err, abteststates) {
                                mongoabteststates = abteststates;

                                db.collection('abteststates').find({
                                    abtest: new mongodb.ObjectID(maxabtestid)
                                }, {
                                    sort: {
                                        created_at: -1,
                                        _id: -1
                                    }
                                }).toArray(function (stateErr, abteststates) {
                                    currentmongoagteststate = abteststates[0];
                                    done();
                                });
                            });
                        });
                });

                it('should have 2 abteststates', function () {
                    expect(mongoabteststates.length).to.equal(2);
                });

                it('should have CLOSED state', function () {
                    expect(currentmongoagteststate.status).to.equal('completed');
                });
            });
        });
    });
});
