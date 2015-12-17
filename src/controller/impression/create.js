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

// Action
const abtestAssignImpression = require('./../../action/abtest/assignImpression');

// Formatters
const participantAttributesObject = require('./../../formatters/participant/participantAttributesObject');

const abtestGroupRestResponse = require('./../../stream/abtestGroup/abtestGroupRestResponse');

module.exports = function (req) {
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
        return abtestFromRequestStream(req)
            .flatMapLatest((abtest) => {
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
