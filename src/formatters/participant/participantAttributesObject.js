'use strict';

const _ = require('lodash');

module.exports = function (participant) {
    const attributes = participant.toObject();

    return _.omit(attributes, '__v', '_id');

}