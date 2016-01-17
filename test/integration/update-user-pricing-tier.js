'use strict';

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

const mongo = require('mongodb');

const abtesturl = require('./../helper/abtest-url');
const usersDbStream = require('./../db/user');
const abtestDBStream = require('./../db/abtest');
const createPostUsersRequest = require('./../helper/requests/POST_users');

describe('PUT /users/:user_id', function () {
    let res;
    let userId;
    let updatedPricingTier;

    describe('Updating user pricing tier', function () {
        before(function () {
            return createPostUsersRequest({
                username: 'a@a.com',
                password: 'password',
                confirm: 'password'
            }, {
                name: 'DEV'
            })
            .flatMapLatest((createUserResp) => {
                userId = createUserResp.body.data.id;
                return abtestDBStream.toPromise()
                    .then((abtestDb) => {
                        return abtestDb.collection('pricingtiers').findOne({
                            name: 'PRO'
                        });
                    })
                    .then((pricingTier) => {
                        updatedPricingTier = pricingTier;

                        return abtesturl().toPromise()
                            .then((url) => {
                                return new Promise(function (resolve, reject) {
                                    request(url)
                                        .put(`/users/${userId}`)
                                        .send({
                                            data: {
                                                relationships: {
                                                    pricingTier: {
                                                        type: 'pricingtier',
                                                        id: pricingTier._id
                                                    }
                                                }
                                            }
                                        })
                                        .end(function (err, r) {
                                            resolve(r);
                                        });
                                });
                            });
                    });
            })
            .toPromise()
            .then((r) => {
                res = r;
            });
        });

        it('should have a status 200', function () {
            expect(res.statusCode).to.equal(200);
        });

        describe('database', function () {
            let mongoUser;

            before(function () {
                return abtestDBStream.toPromise()
                    .then((abtestDb) => {
                        return abtestDb.collection('users').findOne({
                            _id: mongo.ObjectId(userId)
                        });
                    })
                    .then((user) => {
                        mongoUser = user;
                    });
            });

            it('should have updated the user pricingTier id', function () {
                expect(mongoUser.pricingTier.toString()).to.equal(updatedPricingTier._id.toString());
            });
        });

        describe('response', function () {
            let responseBody;

            beforeEach(function () {
                responseBody = res.body;
            });

            it('should have a pricingTier relationship', function () {
                expect(responseBody.data.relationships.pricingTier).to.exist;
            });

            it('should have the correct pricingTier id', function () {
                const pricingTierId = responseBody.data.relationships.pricingTier.id;
                expect(pricingTierId).to.equal(updatedPricingTier._id.toString());
            });
        });
    });
});
