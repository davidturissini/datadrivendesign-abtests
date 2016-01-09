'use strict';

const rx = require('rx');
const mongoose = require('mongoose');

// Streams
const createParticipantFromRequestStream = require('./../../stream/participant/fromRequest');

// Query
const abtestQueryImpressionWithParticipant = require('./../../queries/abtest/queryImpressionWithParticipant');
const impressionQueryAbTestGroup = require('./../../queries/impression/queryAbTestGroup');
const queryAbTestState = require('./../../queries/abtest/queryAbTestState');
const queryAbTestControlGroup = require('./../../queries/abtest/queryAbTestControlGroup');

// Model
const Participant = require('./../../model/Participant');
const AbTestState = require('./../../model/AbTestState');

// Action
const abtestAssignImpression = require('./../../action/abtest/assignImpression');

// Formatters
const participantAttributesObject = require('./../../formatters/participant/participantAttributesObject');

const abtestGroupRestResponse = require('./../../stream/abtestGroup/abtestGroupRestResponse');

const validateApiKey = require('./../../stream/apikey/validatedWithIdAndAbtestId');

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

                const abTestStateStream = queryAbTestState(abtest);

                const activeStateStream = abTestStateStream.filter((abtestState) => {
                    return abtestState.status === AbTestState.STATUS_ACTIVE;
                })
                .flatMapLatest(() => {
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
                    );
                })

                const completedStateStream = abTestStateStream.filter((abtestState) => {
                    return abtestState.status === AbTestState.STATUS_COMPLETED;
                })
                .flatMapLatest(() => {
                    return queryAbTestControlGroup(abtest);
                });

                return rx.Observable.merge(
                        activeStateStream,
                        completedStateStream
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
