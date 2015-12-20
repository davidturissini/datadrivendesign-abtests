'use strict';

const rx = require('rx');

// Model
const Impression = require('./../../model/Impression');
const AbTestState = require('./../../model/AbTestState');

// Queries
const abtestQueryGroups = require('./../../queries/abtest/queryGroups');
const abTestQueryTotalImpressionsCount = require('./../../queries/abtest/queryTotalImpressionsCount');
const abTestGroupQueryImpressionsCount = require('./../../queries/abtestGroup/queryImpressionsCount');

module.exports = function (abtest, participant) {
    const totalImpressionsStream = abTestQueryTotalImpressionsCount(abtest);

    return totalImpressionsStream.flatMapLatest((totalAbtestPopulation) => {
        const abtestGroupingsStream = abtestQueryGroups(abtest)
            .flatMap((abtestGroup, index) => {
                return abTestGroupQueryImpressionsCount(abtestGroup)
                    .map((numImpressions) => {
                        return {
                            numImpressions: numImpressions,
                            abtestGroup: abtestGroup
                        };
                    })
                    .first();
            });

        return abtestGroupingsStream.filter((abtestGrouping, index) => {
            const abtestGroup = abtestGrouping.abtestGroup;
            const numImpressions = abtestGrouping.numImpressions;

            if (totalAbtestPopulation === 0 && index === 0) {
                return true;
            }

            const groupDistribution = abtestGroup.distribution;
            const currentDistribution = numImpressions / totalAbtestPopulation;

            return (currentDistribution <= groupDistribution);
        })
        .map((abtestGrouping) => {
            return abtestGrouping.abtestGroup;
        })
        .first();
    })

    .flatMapLatest((abtestGroup) => {
        return rx.Observable.create(function (o) {
            Impression.create({
                abtest: abtest,
                abtestGroup: abtestGroup,
                participant: participant
            }, function (err, impression) {
                if (err) {
                    o.onError(err);
                    return;
                }

                o.onNext(abtestGroup);
                o.onCompleted();
            });
        });
    })

    .flatMapLatest((abtestGroup) => {
        return abTestQueryTotalImpressionsCount(abtest)
            .flatMapLatest((impressionsCount) => {
                return rx.Observable.create(function (o) {
                    if (impressionsCount === abtest.sampleSize) {
                        AbTestState.create({
                            abtest: abtest,
                            status: AbTestState.STATUS_COMPLETED
                        }, function (err, abtestState) {
                            if (err) {
                                o.onError(err);
                            }

                            o.onNext();
                            o.onCompleted();
                        });
                    } else {
                        o.onNext();
                        o.onCompleted();
                    }
                });
            })
            .map(() => {
                return abtestGroup;
            });
    });
};
