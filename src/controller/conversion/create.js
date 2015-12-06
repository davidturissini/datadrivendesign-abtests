'use strict';

const rx = require('rx');

// Model
const Conversion = require('./../../model/Conversion');

// Queries
const participantQueryByKey = require('./../../queries/participant/queryByKey');
const abtestQueryImpressionWithParticipant = require('./../../queries/abtest/queryImpressionWithParticipant');
const impressionQueryAbTestGroup = require('./../../queries/impression/queryAbTestGroup');

// Stream
const abtestsFromRequestStream = require('./../../stream/abtest/fromRequest');

module.exports = function (req) {
    const participantKey = req.body.participant_id;
    const abtestStream = abtestsFromRequestStream(req);

    return participantQueryByKey(participantKey)

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
            const abtest = data.abtest;
            const participant = data.participant;

            return abtestQueryImpressionWithParticipant(abtest, participant)
                .flatMapLatest((impression) => {
                    return impressionQueryAbTestGroup(impression);
                })

                .flatMapLatest((abtestGroup) => {

                    return rx.Observable.create(function (o) {
                        Conversion.create({
                            participant: participant,
                            abtestGroup: abtestGroup
                        }, function (err, conversion) {
                            if (err) {
                                o.onError(err);
                            }

                            o.onNext(conversion);
                            o.onCompleted();
                        })
                    });
                });


        })

        .map((data) => {
            return JSON.stringify(data);
        });


}