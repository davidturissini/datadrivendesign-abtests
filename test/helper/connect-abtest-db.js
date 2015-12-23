'use strict';

const mongodb = require('mongodb');
const config = require('./../../src/config/mongoConnectionString');

module.exports = function () {
    return config.flatMapLatest((connectionString) => {
        return mongodb.connect(connectionString);
    });
};
