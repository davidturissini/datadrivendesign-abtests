'use strict';

const chai = require('chai');
const expect = chai.expect;

module.exports = function (resFunc) {
    describe('error response', function () {
        let res;

        beforeEach(function () {
            res = resFunc();
        });

        it('should have a status 200', function () {
            expect(res.statusCode).to.equal(200);
        });

        it('should have an error property', function () {
            expect(res.body.error).to.exist;
        });

        it('should have an error message', function () {
            expect(res.body.error.message).to.be.a('string');
        });
    });
};
