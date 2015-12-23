'use strict';

const mongoose = require('mongoose');

// Stream
const defaultMongoConnectionStringStream = require('./../config/mongoConnectionString');


function factory(mongoConnectionStringStream) {
    return mongoConnectionStringStream.map((mongoPath) => {
        mongoose.connect(mongoPath);
        console.log(`Mongoose connected at ${mongoPath}`);
    });
}

module.exports = factory(defaultMongoConnectionStringStream);
