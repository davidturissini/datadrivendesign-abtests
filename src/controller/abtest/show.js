'use strict';


// Action
const validateUserSession = require('./../../action/user/validateUserSession');

// Queries
const queryUserAbtestById = require('./../../queries/user/queryAbTestById');

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
            const abtestId = req.params.abtest_id;
            return queryUserAbtestById(user, abtestId);
        })

        .flatMap((abtest) => {
            return abtestRestResponse(abtest);
        });
};
