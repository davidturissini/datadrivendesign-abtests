'use strict';

const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const url = 'http://localhost:4000';

describe('POST /usersessions', function () {
    let res;

    before(function (done) {
        request(url)
            .post('/usersessions')
            .send({
                username: 'test@test.com',
                password: 'password'
            })
            .end(function (err, r) {
                res = r;
                done();
            });
    });

    it('should have a status 200', function () {
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

        it('should have the correct attributes', function () {
            expect(body.data.type).to.equal('usersession');
        });

        it('should have a string id', function () {
            expect(body.data.id).to.be.a('string');
        });

        it('should have a relationship object', function () {
            expect(body.data.relationships).to.exist;
        });

        describe('relationship object', function () {
            let relationship;

            beforeEach(function () {
                relationship = body.data.relationships;
            });

            it('should have a user object', function () {
                expect(relationship.user).to.exist;
            });

            describe('relationship user object', function () {
                let user;

                beforeEach(function () {
                    user = relationship.user;
                });

                it('should have an id property', function () {
                    expect(user.id).to.be.a('string');
                });

                it('should have a username property', function () {
                    expect(user.username).to.equal('test@test.com');
                });

                it('should not have a password property', function () {
                    expect(user.password).to.not.exist;
                });

                it('should not have a confirm property', function () {
                    expect(user.confirm).to.not.exist;
                });

                it('should not have a confirm property', function () {
                    expect(user.user_management_id).to.not.exist;
                });

                it('should have an email property', function () {
                    expect(user.email).to.exist;
                });

                it('should have correct email property', function () {
                    expect(user.email).to.equal('test@test.com');
                });

                it('should not have an _id property', function () {
                    expect(user._id).to.not.exist;
                });
            });
        });
    });
});
