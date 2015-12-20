'use strict';

const rx = require('rx');

module.exports = function () {
    return rx.Observable.create(function (o) {
        const host = process.env.ABTEST_URL_HOST_TEST;
        const port = process.env.ABTEST_URL_PORT_TEST;

        const url = `http://${host}:${port}`;

        o.onNext(url);
        o.onCompleted();
    });
};
