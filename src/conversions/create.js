'use strict';

const rx = require('rx');

const participants = require('./../persistence/participants');
const conversionsPersistence = require('./../persistence/conversions');
const impressionsPersistence = require('./../persistence/impressions');
const groupsPersistence = require('./../persistence/groups');

// Stream
const abtestsFromRequestStream = require('./../stream/abtest/fromRequest');

module.exports = function (req) {

    const abtestStream = abtestsFromRequestStream(req);

    return rx.Observable.create(function (o) {
            const participantId = req.body.participant_id;
            const participant = participants.get(participantId);

            if (!participant) {
                throw new TypeError('Invalid participant id. Participant with id "' + participantId + '" could not be found.');
            }

            o.onNext(participant);
            o.onCompleted();

        })

        .combineLatest(
            abtestStream,
            function (participant, abtest) {
                return {
                    abtest: abtest,
                    participant: participant
                };
            }
        )

        .flatMapLatest((data) => {

            return rx.Observable.create(function (o) {
                const abtest = data.abtest;
                const participant = data.participant;
                const members = impressionsPersistence.findByAbTestAndParticipant(abtest, participant);
                const member = members[0];

                const group = groupsPersistence.get(member.group_id);

                const conversion = conversionsPersistence.save({
                    group_id: group.id,
                    participant_id: participant.id
                });

                o.onNext(conversion);
                o.onCompleted();

            });


        })

        .map((data) => {
            return JSON.stringify(data);
        });


}