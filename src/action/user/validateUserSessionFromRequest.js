'use strict';

// Stream
const userFromRequestStream = require('./../../stream/user/fromRequest');

// Action
const validateUserSession = require('./../../action/user/validateUserSession');

module.exports = function (req) {


    return userFromRequestStream(req)
        .flatMapLatest((user) => {
            const userSessionToken = req.headers.authentication.split(':')[1];
            return validateUserSession(user, userSessionToken);
        });
}