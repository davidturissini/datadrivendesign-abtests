'use strict';

const rx = require('rx');
const mongoose = require('mongoose');

// Streams
const createParticipantFromRequestStream = require('./../../stream/participant/fromRequest');
const abtestFromRequestStream = require('./../../stream/abtest/fromRequest');

// Query
const abtestQueryImpressionWithParticipant = require('./../../queries/abtest/queryImpressionWithParticipant');
const impressionQueryAbTestGroup = require('./../../queries/impression/queryAbTestGroup');

// Model
const Participant = require('./../../model/Participant');
const User = require('./../../model/User');
const AbTest = require('./../../model/AbTest');

// Action
const abtestAssignImpression = require('./../../action/abtest/assignImpression');

// Formatters
const participantAttributesObject = require('./../../formatters/participant/participantAttributesObject');

const abtestGroupRestResponse = require('./../../stream/abtestGroup/abtestGroupRestResponse');

function validateApiKey(apiKey, abtestId) {
    return rx.Observable.create(function (o) {
        if (typeof apiKey !== 'string') {
            o.onError('Invalid API Key');
        }

        User.findOne({
            apiKey: apiKey,
        }, function (err, user) {
            if (err) {
                o.onError(err);
            }

            o.onNext(user);
            o.onCompleted();
        });
    })
    .flatMapLatest((user) => {
        return rx.Observable.create(function (o) {
            AbTest.findOne({
                user: user
            }, function (err, abtest) {
                if (err) {
                    o.onError(err);
                }

                if (!abtest) {
                    o.onError('Invalid API Key');
                }

                o.onNext(abtest);
                o.onCompleted();
            });
        });
    });
}


module.exports = function (req) {
    const apiKey = req.query.api_key;
    const abtestId = req.params.abtest_id;

    return validateApiKey(apiKey, abtestId)
        .flatMapLatest((abtest) => {
            const participantFromRequestStream = createParticipantFromRequestStream(req);
            const participantExistsStream = participantFromRequestStream.filter((p) => {
                return p;
            });

            const createParticipantStream = participantFromRequestStream.filter((p) => {
                return p === null;
            })
            .flatMapLatest(() => {
                return rx.Observable.create(function (o) {
                    Participant.create({
                        key: mongoose.Types.ObjectId()
                    }, function (err, participant) {
                        if (err) {
                            o.onError(err);
                        }

                        o.onNext(participant);
                        o.onCompleted();
                    });
                });
            });

            return rx.Observable.merge(
                participantExistsStream,
                createParticipantStream
            )
            .flatMapLatest((participant) => {
                const findImpressionsStream = abtestQueryImpressionWithParticipant(abtest, participant);

                const notAMemberStream = findImpressionsStream.filter((impression) => {
                    return !impression;
                })
                .flatMapLatest((data) => {
                    return abtestAssignImpression(abtest, participant);
                });

                const alreadyAMemberStream = findImpressionsStream.filter((impression) => {
                    return impression;
                })
                .flatMapLatest((impression) => {
                    return impressionQueryAbTestGroup(impression);
                });

                return rx.Observable.merge(
                        notAMemberStream,
                        alreadyAMemberStream
                    )
                    .flatMapLatest(function (group) {
                        return abtestGroupRestResponse(group);
                    })
                    .map((abtestGroupData) => {
                        abtestGroupData.relationships = {
                            participant: {
                                data: {
                                    attributes: participantAttributesObject(participant)
                                }
                            }
                        };

                        return abtestGroupData;
                    });
            });
        });
};
