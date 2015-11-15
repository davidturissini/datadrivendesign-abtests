'use strict';

const rx = require('rx');

const participants = require('./../../persistence/participants');


module.exports = function (req) {
    const observable = rx.Observable.create(function (o) {
        const participantId = req.body.participant_id;
        let participant;

        if (participantId === undefined || participantId === null) {
            participant = participants.save({});
        } else {
            participant = participants.get(participantId);
        }

        if (!participant) {
            throw new TypeError('Invalid participant id. Participant with id "' + participantId + '" could not be found.');
        }

        o.onNext(participant);
        o.onCompleted();

    }).replay(undefined, 1);

    observable.connect();

    return observable;

}