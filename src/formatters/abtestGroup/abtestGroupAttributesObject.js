'use strict';

const _ = require('lodash');

module.exports = function (abtestGroup) {
    const obj = abtestGroup.toObject();

    return _.omit(obj, '__v', '_id', 'abtest');
}