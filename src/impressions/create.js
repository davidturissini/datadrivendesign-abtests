'use strict';


const rx = require('rx');

const abtests = require('./../persistence/abtests');
const groupsPersistence = require('./../persistence/groups');
const impressionsPersistence = require('./../persistence/impressions');


const participantFromRequestStream = require('./../stream/participant/fromRequest');


module.exports = function (req) {
    
    const participantStream = participantFromRequestStream(req);

    const abtestStream = rx.Observable.create(function (o) {
        const abtestId = req.params.abtest_id;
        const abtest = abtests.get(abtestId);

        if (!abtest) {
            throw new Error('Could not assign abtest group. abtest with id "' + abtestId + '" not found');
        }

        o.onNext(abtest);
        o.onCompleted();

    });

    const notAMemberStream = abtestStream.combineLatest(participantStream,
            function (abtest, participant) {
                return {
                    abtest:abtest,
                    participant:participant
                }
            })
        .map((data) => {
            
            const abtest = data.abtest;
            const participant = data.participant;
            const members = impressionsPersistence.findByAbTestAndParticipant(abtest, participant);

            return {
                abtest: abtest,
                members: members
            };

        })
        .filter((data) => {
            return (data.members.length === 0)
        })
        .flatMapLatest((data) => {
            const abtest = data.abtest;
            const groups = groupsPersistence.findAllForABTest(abtest);
            const totalAbtestPopulation = groups.reduce(function (n, group) {
                const population = impressionsPersistence.findAllByGroup(group).length;
                return n + population;
            }, 0);

           

            return rx.Observable.create(function (o) {
                console.log('population', totalAbtestPopulation);
                if (totalAbtestPopulation === 0) {
                    o.onNext(groups[0]);
                } else {

                    let beenAssigned = false;
                    groups.forEach(function (group) {
                        if (beenAssigned === true) {
                            return;
                        };

                        const members = impressionsPersistence.findAllByGroup(group);
                        const population = members.length;
                        const groupDistribution = group.distribution;
                        const currentDistribution = population / totalAbtestPopulation;

                        if (currentDistribution < groupDistribution) {
                            beenAssigned = true;
                            o.onNext(group);
                        }


                    });

                }

                o.onCompleted();

            })
            .combineLatest(
                participantStream, function (group, participant) {
                    impressionsPersistence.save({
                        group_id: group.id,
                        participant_id: participant.id
                    });

                    return group;
                }
            );

        });

    const alreadyAMemberStream = abtestStream.combineLatest(participantStream, function (abtest, participant) {
           
            return {
                abtest: abtest,
                participant: participant
            };

        }).map((data) => {
            const abtest = data.abtest;
            const participant = data.participant;
            const members = impressionsPersistence.findByAbTestAndParticipant(abtest, participant);

            return {
                abtest: abtest,
                members: members
            };

        })
        .filter((data) => {
            return (data.members.length > 0);
        })
        .map((data) => {
            return data.members[0];
        })
        .map((member) => {
            return groupsPersistence.get(member.group_id);
        });

    return rx.Observable.merge(
            notAMemberStream,
            alreadyAMemberStream
        )
        .combineLatest(participantStream, function (group, participant) {
            return {
                group: group,
                participant: participant
            };
        })
        .map((data) => {
            return JSON.stringify(data);
        });

}