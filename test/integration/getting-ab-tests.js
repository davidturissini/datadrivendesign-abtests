'use strict';

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const url = 'http://127.0.0.1:4000';
const logUserIn = require('./../helper/user-login');

// asserts
const assertErrorMessageReceived = require('./../assert/errorMessageReceived');
const assertAbTestMissingAttributes = require('./../assert/abtest/assertMissingAttributes');

describe('Getting ab tests', function () {
    let res;
    let userId;
    let userSessionId;

    describe('valid usersession id', function () {
        before(function (done) {
            logUserIn('test@test.com', 'password')
                .then(function (loginData) {
                    userId = loginData.relationships.user.id;
                    userSessionId = loginData.id;

                    request(url)
                        .get(`/users/${userId}/abtests`)
                        .set('authentication', `token ${userId}:${userSessionId}`)
                        .send()
                        .end(function (err, r) {
                            res = r;
                            done();
                        });
                });
        });

        it('shoud have status 200', function () {
            expect(res.statusCode).to.equal(200);
        });

        describe('response', function () {
            let body;

            beforeEach(function () {
                body = res.body;
            });

            it('should have a data attribute', function () {
                expect(body.data).to.exist;
            });

            it('should be an array', function () {
                expect(body.data.length).to.exist;
            });

            describe('abtest', function () {
                let abtest;

                beforeEach(function () {
                    abtest = body.data[0];
                });

                it('should have the correct name', function () {
                    expect(abtest.attributes.name).to.equal('abtest');
                });

                it('should have the correct sampleSize property', function () {
                    expect(abtest.attributes.sampleSize).to.equal(4300);
                });

                assertAbTestMissingAttributes(function () {
                    return abtest;
                });

                it('should have a relationships object', function () {
                    expect(abtest.relationships).to.exist;
                });

                it('should have abtestGroup relationship', function () {
                    expect(abtest.relationships.abtestGroup).to.exist;
                });

                it('should have the correct length', function () {
                    expect(abtest.relationships.abtestGroup.data.length).to.equal(2);
                });

                describe('groups', function () {
                    describe('group 1', function () {
                        let group;

                        beforeEach(function () {
                            group = abtest.relationships.abtestGroup.data[0];
                        });

                        it('should have a type property', function () {
                            expect(group.type).to.equal('abtestgroup');
                        });

                        it('should have an attributes object', function () {
                            expect(group.attributes).to.exist;
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
                            group = abtest.relationships.abtestGroup.data[1];
                        });

                        it('should have a type property', function () {
                            expect(group.type).to.equal('abtestgroup');
                        });

                        it('should have an attributes object', function () {
                            expect(group.attributes).to.exist;
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

    describe('invalid usersession id', function () {
        let errorRes;

        before(function (done) {
            logUserIn('test@test.com', 'password')
                .then(function (loginData) {
                    userId = loginData.relationships.user.id;
                    userSessionId = loginData.id;

                    request(url)
                        .get(`/users/${userId}/abtests`)
                        .set('authentication', `token ${userId}:NOTVALID`)
                        .send()
                        .end(function (err, r) {
                            errorRes = r;
                            done();
                        });
                });
        });

        assertErrorMessageReceived(function () {
            return errorRes;
        });

        it('should have the correct message', function () {
            expect(errorRes.body.error.message).to.equal('Invalid token');
        });
    });
});
