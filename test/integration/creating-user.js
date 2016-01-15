'use strict';

const chai = require('chai');
const expect = chai.expect;

const usersDbStream = require('./../db/user');
const abtestDBStream = require('./../db/abtest');
const createPostUsersRequest = require('./../helper/requests/POST_users');

describe('POST /users', function () {
    let res;

    before(function () {
        return createPostUsersRequest({
            username: 'test@test.com',
            password: 'password',
            confirm: 'password'
        }, {
            name: 'DEV'
        })
        .toPromise()
        .then((r) => {
            res = r;
        }, function (e) {
            console.log(e);
        });
    });

    it('should have a status 200', function () {
        expect(res.statusCode).to.equal(200);
    });

    describe('database', function () {
        let mongoUser;
        let pricingTier;
        let abtestUser;

        before(function () {
            return usersDbStream.toPromise()
                .then(function (db) {
                    return db.collection('users').findOne({
                        username: 'test@test.com'
                    });
                })
                .then(function (user) {
                    mongoUser = user;

                    return abtestDBStream.toPromise()
                        .then((abtestDb) => {
                            const userPromise = abtestDb.collection('users').findOne({
                                user_management_id: mongoUser._id.toString()
                            });

                            const pricingTierPromise = abtestDb.collection('pricingtiers').findOne({
                                name: 'DEV'
                            });

                            return Promise.all([
                                userPromise,
                                pricingTierPromise
                            ]);
                        })
                        .then((args) => {
                            abtestUser = args[0];
                            pricingTier = args[1];
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

        it('should have assigned a pricingTier property', function () {
            expect(abtestUser.pricingTier.toString()).to.equal(pricingTier._id.toString());
        });

        it('should have assigned an apiKey property', function () {
            expect(abtestUser.apiKey).to.exist;
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

        it('should have the correct type', function () {
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

            it('should not have a pricingTier property', function () {
                expect(attributes.pricingTier).to.not.exist;
            });

            it('should not have an apiKey property', function () {
                expect(attributes.apiKey).to.not.exist;
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

            it('should have a pricingTier', function () {
                expect(relationships.pricingTier).to.exist;
            });

            describe('pricingTier', function () {
                it('should have a type attribute', function () {
                    expect(relationships.pricingTier.type).to.equal('pricingtier');
                });

                it('should have attributes', function () {
                    expect(relationships.pricingTier.attributes).to.exist;
                });

                describe('pricingTier attributes', function () {
                    it('should have a label', function () {
                        expect(relationships.pricingTier.attributes.label).to.equal('development');
                    });

                    it('should have a name', function () {
                        expect(relationships.pricingTier.attributes.name).to.equal('DEV');
                    });

                    it('should have an impressions_limit', function () {
                        expect(relationships.pricingTier.attributes.impressions_limit).to.equal(500);
                    });

                    it('should have an abtest_limit', function () {
                        expect(relationships.pricingTier.attributes.abtest_limit).to.equal(20);
                    });

                    it('should not have an _id property', function () {
                        expect(relationships.pricingTier.attributes._id).to.not.exist;
                    });

                    it('should not have an __v property', function () {
                        expect(relationships.pricingTier.attributes.__v).to.not.exist;
                    });
                });
            });
        });
    });
});
