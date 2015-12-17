'use strict';

const rx = require('rx');

// Action
const createParticipantWithKey = require('./../../action/participant/createWithKey');

// Query
const participantQueryWithKey = require('./../../queries/participant/queryByKey');

module.exports = function (req) {
    const keyStream = rx.Observable.return(req.body)
        .map((params) => {
            if (!params.data) {
                params.data = {};
            }

            if (!params.data.attributes) {
                params.data.attributes = {};
            }

            return params.data.attributes.key;
        })
        .map((key) => {
            if (key === undefined) {
                return null;
            }

            return key;
        });

    const noKeyStrem = keyStream.filter((key) => {
        return key === null;
    });

    const hasKeyStream = keyStream.filter((key) => {
        return key !== null;
    })
    .flatMapLatest((key) => {
        return participantQueryWithKey(key);
    });

    return rx.Observable.merge(
        noKeyStrem,
        hasKeyStream
    );
};
