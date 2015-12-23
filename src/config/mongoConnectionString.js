'use strict';

const configStream = require('./config');

module.exports = configStream.map((config) => {
    return config.database;
})
.map((mongoConfig) => {
    const dbhost = mongoConfig.host;
    const db = mongoConfig.database;
    const protocol = mongoConfig.protocol;
    const connectionString = `${protocol}://${dbhost}/${db}`;
    return connectionString;
});
