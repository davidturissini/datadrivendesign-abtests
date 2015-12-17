'use strict';

const chai = require('chai');
const expect = chai.expect;

module.exports = function (abtestFunc) {
    describe('missing abtest attributes', function () {
        let abtest;

        beforeEach(function () {
            abtest = abtestFunc();
        });

        it('should not have a user property', function () {
            expect(abtest.attributes.user).to.not.exist;
        });
    });
};
