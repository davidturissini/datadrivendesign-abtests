'use strict';

const rx = require('rx');

// Model
const Impression = require('./../../model/Impression');

// Queries
const abtestQueryGroups = require('./../../queries/abtest/queryGroups');
const abTestQueryTotalImpressionsCount = require('./../../queries/abtest/queryTotalImpressionsCount');
const abTestGroupQueryImpressionsCount = require('./../../queries/abtestGroup/queryImpressionsCount');

module.exports = function (abtest, participant) {

    const totalImpressionsStream = abTestQueryTotalImpressionsCount(abtest);

    return totalImpressionsStream.flatMapLatest((totalAbtestPopulation) => {
        const abtestGroupingsStream = abtestQueryGroups(abtest)
            .flatMap((abtestGroup) => {
                return abTestGroupQueryImpressionsCount(abtestGroup)
                    .map((numImpressions) => {
                        return {
                            numImpressions: numImpressions,
                            abtestGroup: abtestGroup
                        };

                    })
                    .first();


            });


            return abtestGroupingsStream.reduce((seed, abtestGrouping) => {
                    const abtestGroup = abtestGrouping.abtestGroup;
                    const numImpressions = abtestGrouping.numImpressions;

                    if (seed !== undefined) {
                        return seed;
                    }

                    if (totalAbtestPopulation === 0) {
                        return abtestGroup;
                    }

                    const groupDistribution = abtestGroup.distribution;
                    const currentDistribution = numImpressions / totalAbtestPopulation;


                    if (currentDistribution < groupDistribution) {
                        console.log('returning!');
                        return abtestGroup;
                    }

                }, undefined)
                .combineLatest(
                    abtestGroupingsStream.toArray(),
                    function (abtestGroup, abtestGroupings) {
                        if (abtestGroup === undefined) {
                            return abtestGroupings[0].abtestGroup;
                        }

                        return abtestGroup;

                    }
                );

    })
    
    .flatMapLatest((abtestGroup) => {
        return rx.Observable.create(function (o) {
            Impression.create({
                abtestGroup: abtestGroup,
                participant: participant
            }, function (err, impression) {
                if (err) {
                    o.onError(err);
                    return;
                }

                o.onNext(abtestGroup);
                o.onCompleted();

            })
        });
    });

}