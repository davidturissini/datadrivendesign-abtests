'use strict';

const _ = require('lodash');

module.exports = function (impression) {
    const obj = impression.toObject();

    return _.omit(obj, '_id', '__v');
}