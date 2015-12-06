'use strict';

const _ = require('lodash');

module.exports = function (abtest) {
    const obj = abtest.toObject();

    return _.omit(obj, '_id', '__v', 'user');
}