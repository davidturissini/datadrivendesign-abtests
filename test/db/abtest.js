'use strict';

const rx = require('rx');

const mongodb = require('mongodb');
const config = require('./../../src/config/mongoConnectionString');

const o = config.flatMapLatest((connectionString) => {
    return mongodb.connect(connectionString);
})
.replay(undefined, 1);

module.exports = o;
