'use strict';

const chai = require('chai');
const expect = chai.expect;

module.exports = function (abtestGroupFunc) {
    describe('abtest group type', function () {
        let abtestGroup;

        beforeEach(function () {
            abtestGroup = abtestGroupFunc();
        });

        it('should be abtestgroup', function () {
            expect(abtestGroup.type).to.equal('abtestgroup');
        });
    });
};
