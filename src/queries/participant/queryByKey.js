'use strict';

const rx = require('rx');

// Model
const Participant = require('./../../model/Participant');


module.exports = function (key) {

    return rx.Observable.create(function (o) {
        Participant.findOne({
            key: key
        }, function (err, participant) {
            if (err) {
                o.onError(err);
            }

            o.onNext(participant);
            o.onCompleted();
        });
    });

}
