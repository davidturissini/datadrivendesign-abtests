'use strict';

const rx = require('rx');

function createServicesConfigStream() {
    return rx.Observable.create(function (o) {
        const databaseConfig = {
            host: process.env.ABTEST_MONGO_HOST,
            database: process.env.ABTEST_MONGO_DB,
            protocol: 'mongodb'
        };

        if (!databaseConfig.host || !databaseConfig.database) {
            o.onError({
                message: `Invalid configuration: database is not configured property (${databaseConfig})`
            });
        }

        o.onNext({
            'user-management': {
                host: process.env.USER_MANAGEMENT_HOST,
                port: process.env.USER_MANAGEMENT_PORT,
                protocol: process.env.USER_MANAGEMENT_PROTOCOL,
                app_key: process.env.USER_MANAGEMENT_APP_KEY, // '56578efaf427032f0620c353',
                app_secret: process.env.USER_MANAGEMENT_APP_SECRET // '$2a$10$3oIETVvpMtgktgSgt4xdpO'
            },
            database: {
                host: process.env.ABTEST_MONGO_HOST,
                database: process.env.ABTEST_MONGO_DB,
                protocol: 'mongodb'
            }
        });

        o.onCompleted();
    })
    .replay(undefined, 1)
    .refCount();
}

module.exports = createServicesConfigStream();
