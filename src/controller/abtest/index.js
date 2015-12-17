'use strict';


// Action
const validateUserSession = require('./../../action/user/validateUserSession');

// Queries
const queryUserAbtests = require('./../../queries/user/queryAbTests');

// Stream
const userFromRequestStream = require('./../../stream/user/fromRequest');

const abtestRestResponse = require('./../../stream/abtest/abtestRestResponse');

module.exports = function (req) {
    return userFromRequestStream(req)

        .flatMapLatest((user) => {
            const userSessionToken = req.headers.authentication.split(':')[1];
            return validateUserSession(user, userSessionToken);
        })

        .flatMapLatest((user) => {
            return queryUserAbtests(user);
        })

        .flatMap((abtest) => {
            return abtestRestResponse(abtest);
        })

        .toArray();
};
