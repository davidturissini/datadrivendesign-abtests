'use strict';

const rx = require('rx');

// Model
const Impression = require('./../../model/Impression');

// Streams
const participantFromRequestStream = require('./../../stream/participant/fromRequest');
const abtestFromRequestStream = require('./../../stream/abtest/fromRequest');

// Query
const abtestQueryImpressionWithParticipant = require('./../../queries/abtest/queryImpressionWithParticipant');
const impressionQueryAbTestGroup = require('./../../queries/impression/queryAbTestGroup');

// Action
const abtestAssignImpression = require('./../../action/abtest/assignImpression');

// Formatters
const formatAbtestGroupAttributesObject = require('./../../formatters/abtestGroup/abtestGroupAttributesObject');
const participantAttributesObject = require('./../../formatters/participant/participantAttributesObject');

module.exports = function (req) {
    
    const participantStream = participantFromRequestStream(req);
    const abtestStream = abtestFromRequestStream(req);

    const findImpressionsStream = abtestStream.combineLatest(participantStream,
            function (abtest, participant) {
                return {
                    abtest:abtest,
                    participant:participant
                }
            })
        .flatMapLatest((data) => {

            const abtest = data.abtest;
            const participant = data.participant;

            return abtestQueryImpressionWithParticipant(abtest, participant)
                .map((impression) => {
                    data.impression = impression;
                    return data;
                });

        });

    const notAMemberStream = findImpressionsStream.filter((data) => {
            return data.impression;
        })
        .flatMapLatest((data) => {
            return abtestAssignImpression(data.abtest, data.participant);
        });

    const alreadyAMemberStream = findImpressionsStream.filter((data) => {
            return data.impression;
        })
        .map((data) => {
            return data.impression;
        })
        .flatMapLatest((impression) => {
            return impressionQueryAbTestGroup(impression);
        });

    return rx.Observable.merge(
            notAMemberStream,
            alreadyAMemberStream
        )
        .first()
        .combineLatest(participantStream, function (group, participant) {
            return {
                data: {
                    type: 'abtestGroup',
                    id: group._id,
                    attributes: formatAbtestGroupAttributesObject(group)
                },
                relationships: {
                    participant: {
                        data: participantAttributesObject(participant)
                    }
                }
            };
        })
        .map((data) => {
            return JSON.stringify(data);
        });

}