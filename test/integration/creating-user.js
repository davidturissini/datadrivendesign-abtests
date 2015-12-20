'use strict';

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;

const abtesturl = require('./../helper/abtest-url');
const connectUsersDb = require('./../helper/connect-users-db');
const connectAbtestDb = require('./../helper/connect-abtest-db');

describe('POST /users', function () {
    let res;

    before(function (done) {
        abtesturl()
            .subscribe((url) => {
                request(url)
                    .post('/users')
                    .send({
                        username: 'test@test.com',
                        password: 'password',
                        confirm: 'password'
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
        let mongoUser;
        let abtestUser;

        before(function () {
            return connectUsersDb()
                .toPromise()
                .then(function (db) {
                    return db.collection('users').findOne({
                        username: 'test@test.com'
                    });
                })
                .then(function (user) {
                    mongoUser = user;

                    return connectAbtestDb()
                        .toPromise()
                        .then((abtestDb) => {
                            return abtestDb.collection('users').findOne({
                                user_management_id: mongoUser._id.toString()
                            });
                        })
                        .then((aUser) => {
                            abtestUser = aUser;
                        });
                });
        });

        it('should have saved an abtest user', function () {
            expect(abtestUser).to.exist;
        });

        it('should have assigned the user_management_id to mongo user id', function () {
            expect(abtestUser.user_management_id).to.equal(mongoUser._id.toString());
        });

        it('should have saved the correct username', function () {
            expect(mongoUser.username).to.equal('test@test.com');
        });

        it('should have saved the correct email', function () {
            expect(mongoUser.email).to.equal('test@test.com');
        });

        it('should have saved a password', function () {
            expect(mongoUser.password).to.exist;
        });

        it('should not have saved plaintext', function () {
            expect(mongoUser.password).to.not.equal('password');
        });

        it('should have saved a salt', function () {
            expect(mongoUser.salt).to.exist;
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
            expect(body.data.type).to.equal('user');
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

            it('should have a username property', function () {
                expect(attributes.username).to.equal('test@test.com');
            });

            it('should not have a password property', function () {
                expect(attributes.password).to.not.exist;
            });

            it('should not have a confirm property', function () {
                expect(attributes.confirm).to.not.exist;
            });

            it('should not have a confirm property', function () {
                expect(attributes.user_management_id).to.not.exist;
            });

            it('should have an email property', function () {
                expect(attributes.email).to.exist;
            });

            it('should have correct email property', function () {
                expect(attributes.email).to.equal('test@test.com');
            });

            it('should not have an _id property', function () {
                expect(attributes._id).to.not.exist;
            });
        });

        describe('relationships', function () {
            let relationships;

            beforeEach(function () {
                relationships = body.data.relationships;
            });

            it('should have an apikey', function () {
                expect(relationships.apikey).to.exist;
            });

            describe('apikey', function () {
                it('should have a type attribute', function () {
                    expect(relationships.apikey.type).to.equal('apikey');
                });

                it('should have an id attribute', function () {
                    expect(relationships.apikey.id).to.be.a('string');
                });
            });
        });
    });
});
