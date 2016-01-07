'use strict';

const mongodb = require('mongodb');

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const url = 'http://localhost:4000';
const logUserIn = require('./../helper/user-login');

const connectAbtestDb = require('./../helper/connect-abtest-db');

// asserts
const assertErrorMessageReceived = require('./../assert/errorMessageReceived');
const assertAbTestMissingAttributes = require('./../assert/abtest/assertMissingAttributes');

describe('creating ab test', function () {
    let res;
    let userId;

    describe('successful requests', function () {
        before(function (done) {
            let userSessionId;

            logUserIn('test@test.com', 'password')
                .then(function (loginData) {
                    userId = loginData.relationships.user.id;
                    userSessionId = loginData.id;

                    request(url)
                        .post(`/users/${userId}/abtests`)
                        .set('authentication', `token ${userId}:${userSessionId}`)
                        .send({
                            data: {
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
                            }
                        })
                        .end(function (err, r) {
                            res = r;
                            done();
                        });
                });
        });

        it('should have a status 200', function () {
            expect(res.statusCode).to.equal(200);
        });

        describe('database', function () {
            let mongoabtest;

            beforeEach(function (done) {
                connectAbtestDb()
                    .subscribe((db) => {
                        mongoabtest = db.collection('abtests').findOne({
                            user: new mongodb.ObjectID(userId)
                        }, function (err, abtest) {
                            mongoabtest = abtest;
                            done();
                        });
                    });
            });

            it('should have an ab test', function () {
                expect(mongoabtest).to.exist;
            });

            it('should have the correct name', function () {
                expect(mongoabtest.name).to.equal('abtest');
            });

            it('should have the correct sampleSize', function () {
                expect(mongoabtest.sampleSize).to.equal(4300);
            });

            describe('abtest groups', function () {
                let mongoAbtestGroups;

                beforeEach(function (done) {
                    connectAbtestDb()
                        .subscribe((db) => {
                            mongoabtest = db.collection('abtestgroups').find({
                                abtest: new mongodb.ObjectID(mongoabtest._id)
                            }).toArray(function (err, abtestGroups) {
                                mongoAbtestGroups = abtestGroups;
                                done();
                            });
                        });
                });

                it('should have two abtestgroups', function () {
                    expect(mongoAbtestGroups.length).to.equal(2);
                });

                describe('first abtest group', function () {
                    let group;

                    beforeEach(function () {
                        group = mongoAbtestGroups[0];
                    });

                    it('should have the correct name', function () {
                        expect(group.name).to.equal('group 1');
                    });

                    it('should have the correct slug', function () {
                        expect(group.slug).to.equal('group-1');
                    });

                    it('should have the correct distribution', function () {
                        expect(group.distribution).to.equal(0.5);
                    });
                });

                describe('second abtest group', function () {
                    let group;

                    beforeEach(function () {
                        group = mongoAbtestGroups[1];
                    });

                    it('should have the correct name', function () {
                        expect(group.name).to.equal('group 2');
                    });

                    it('should have the correct slug', function () {
                        expect(group.slug).to.equal('group-2');
                    });

                    it('should have the correct distribution', function () {
                        expect(group.distribution).to.equal(0.5);
                    });
                });
            });

            describe('abtest state', function () {
                let mongoAbtestState;

                beforeEach(function (done) {
                    connectAbtestDb()
                        .subscribe((db) => {
                            mongoabtest = db.collection('abteststates').findOne({
                                abtest: new mongodb.ObjectID(mongoabtest._id)
                            }, function (err, abtestState) {
                                mongoAbtestState = abtestState;
                                done();
                            });
                        });
                });

                it('should have an abtest state', function () {
                    expect(mongoAbtestState).to.exist;
                });

                it('should have the correct status', function () {
                    expect(mongoAbtestState.status).to.equal('active');
                });

                it('should have a date', function () {
                    expect(mongoAbtestState.date).to.exist;
                });
            });
        });

        describe('response', function () {
            let body;

            beforeEach(function () {
                body = res.body;
            });

            it('should have a data attribute', function () {
                expect(body.data).to.exist;
            });

            it('should have the correct attributes', function () {
                expect(body.data.type).to.equal('abtest');
            });

            it('should have a string id', function () {
                expect(body.data.id).to.be.a('string');
            });

            it('should have an attributes object', function () {
                expect(body.data.attributes).to.exist;
            });

            describe('attributes', function () {
                let attributes;

                beforeEach(function () {
                    attributes = body.data.attributes;
                });

                it('should have a samplesize property', function () {
                    expect(attributes.sampleSize).to.equal(4300);
                });

                assertAbTestMissingAttributes(function () {
                    return body.data;
                });

                it('should have a name property', function () {
                    expect(attributes.name).to.equal('abtest');
                });
            });

            describe('relationships', function () {
                let relationships;

                beforeEach(function () {
                    relationships = body.data.relationships;
                });

                it('should have groups', function () {
                    expect(relationships.abtestGroup).to.exist;
                });

                it('should have the correct number of groups', function () {
                    expect(relationships.abtestGroup.data.length).to.equal(2);
                });

                describe('groups', function () {
                    describe('group 1', function () {
                        let group;

                        beforeEach(function () {
                            group = relationships.abtestGroup.data[0];
                        });

                        it('should have an id property', function () {
                            expect(group.id).to.be.a('string');
                        });

                        it('should have a name property', function () {
                            expect(group.attributes.name).to.equal('group 1');
                        });

                        it('should have a slug property', function () {
                            expect(group.attributes.slug).to.equal('group-1');
                        });
                    });

                    describe('group 2', function () {
                        let group;

                        beforeEach(function () {
                            group = relationships.abtestGroup.data[1];
                        });

                        it('should have an id property', function () {
                            expect(group.id).to.be.a('string');
                        });

                        it('should have a name property', function () {
                            expect(group.attributes.name).to.equal('group 2');
                        });

                        it('should have a slug property', function () {
                            expect(group.attributes.slug).to.equal('group-2');
                        });
                    });
                });
            });
        });
    });

    describe('invalid token', function () {
        before(function (done) {
            let userId;

            logUserIn('test@test.com', 'password')
                .then(function (loginData) {
                    userId = loginData.relationships.user.id;

                    request(url)
                        .post(`/users/${userId}/abtests`)
                        .set('authentication', `token ${userId}:INVALID`)
                        .send({
                            data: {
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
                            }
                        })
                        .end(function (err, r) {
                            res = r;
                            done();
                        });
                });
        });

        assertErrorMessageReceived(function () {
            return res;
        });

        it('should have the correct message', function () {
            expect(res.body.error.message).to.equal('Invalid token');
        });
    });
});
