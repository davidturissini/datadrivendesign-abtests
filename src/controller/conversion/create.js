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

const validateApiKey = require('./../../stream/apikey/validatedWithIdAndAbtestId');


module.exports = function (req) {
    const participantKey = req.body.data.id;
    const abtestStream = abtestsFromRequestStream(req);

    return validateApiKey(req.query.api_key, req.params.abtest_id)
        .flatMapLatest((apikey) => {
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
                                });
                            });
                        });
                })
                .map((conversion) => {
                    return {};
                });
        });
};
