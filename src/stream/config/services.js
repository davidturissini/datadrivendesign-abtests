'use strict';

const rx = require('rx');

function createServicesConfigStream() {
    return rx.Observable.create(function (o) {
        o.onNext({
            'user-management': {
                host: 'localhost',
                port: 4100,
                protocol: 'http',
                app_key: '56578efaf427032f0620c353',
                app_secret: '$2a$10$3oIETVvpMtgktgSgt4xdpO'
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
