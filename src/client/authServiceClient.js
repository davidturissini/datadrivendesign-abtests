'use strict';

const rx = require('rx');

const request = require('request');
const crypto = require('crypto');
const _ = require('lodash');

// Stream
const configStream = require('./../config/config');

const defaults = {
    method: 'get',
    qs: {},
    body: {}
};

module.exports = function (path, params) {
    const clone = _.clone(params || {});
    let requestParams = _.defaults(clone, defaults);

    requestParams.qs = requestParams.qs || {};

    if (requestParams.method === 'get') {
        requestParams = _.omit(requestParams, 'body');
    }

    const body = JSON.stringify(requestParams.body || {});
    const qs = JSON.stringify(requestParams.qs);

    return configStream.map((config) => {
            return config['user-management'];
        })
        .map((config) => {
            const fullPath = `/apps/${config.app_key}${path}`;
            const url = `${config.protocol}://${config.host}:${config.port}${fullPath}`;
            const str = (`${requestParams.method}${fullPath}${qs}${body}`).toLowerCase();
            const hmac = crypto.createHmac("SHA256", config.app_secret).update(str).digest('base64');
            console.log(url);

            return {
                method: requestParams.method,
                qs: params.qs,
                url: url,
                body: body,
                headers: {
                    'Content-Type': 'application/json',
                    'authentication': `hmac ${config.app_key}:${hmac}`
                }
            };
        })

        .flatMapLatest((requestParams) => {
            return rx.Observable.create(function (o) {

                request(requestParams, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        o.onNext(body);
                        o.onCompleted();
                    } else {
                        o.onError(err);
                    }
                });

            });
        })

        .map((resp) => {
            return JSON.parse(resp);
        })

}
