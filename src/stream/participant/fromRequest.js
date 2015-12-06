'use strict';

const rx = require('rx');

// Action
const createParticipantWithKey = require('./../../action/participant/createWithKey');

// Model
const Participant = require('./../../model/Participant');

// Query
const participantQueryWithKey = require('./../../queries/participant/queryByKey');

module.exports = function (req) {
    const key = req.body.participant_id;
    
    return participantQueryWithKey(key)
        .flatMapLatest((participant) => {
            console.log(participant);
            if (!participant) {
                return createParticipantWithKey(key);
            }

            return rx.Observable.return(participant);

        });


}