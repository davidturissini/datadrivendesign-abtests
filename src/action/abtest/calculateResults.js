'use strict';

const abtestCalculator = require('data-driven-design-ab-test-calculator');

const abtestQueryGroups = require('./../../queries/abtest/queryGroups');
const abtestQueryControlGroup = require('./../../queries/abtest/queryAbTestControlGroup');
const abtestGroupQueryImpressionsCount = require('./../../queries/abtestGroup/queryImpressionsCount');
const abtestGroupQueryConversionsCount = require('./../../queries/abtestGroup/queryConversionsCount');

module.exports = function (abtest) {
    return abtestQueryControlGroup(abtest)
        .flatMapLatest((controlGroup) => {
            return abtestGroupQueryImpressionsCount(controlGroup)
                .combineLatest(
                    abtestGroupQueryConversionsCount(controlGroup),
                    function (controlImpressionsCount, controlConversionsCount) {
                        return {
                            results: {
                                visitors: controlImpressionsCount,
                                conversions: controlConversionsCount
                            },
                            abtestGroup: controlGroup
                        };
                    }
                )
                .flatMapLatest((controlStats) => {
                    return abtestQueryGroups(abtest)
                        .filter((abtestGroup) => {
                            return abtestGroup._id !== controlGroup._id;
                        })
                        .flatMap((abtestGroup) => {
                            return abtestGroupQueryImpressionsCount(abtestGroup)
                                .combineLatest(
                                    abtestGroupQueryConversionsCount(abtestGroup),
                                    function (impressionsCount, conversionsCount) {
                                        return {
                                            visitors: impressionsCount,
                                            conversions: conversionsCount
                                        };
                                    }
                                )
                                .map((results) => {
                                    return {
                                        conversionRate: results.conversions / results.visitors,
                                        abtestGroup: abtestGroup,
                                        results: results
                                    };
                                });
                        })
                        .reduce((seed, abtestGroupData) => {
                            if (seed.conversionRate > abtestGroupData.conversionRate) {
                                return seed;
                            }

                            return abtestGroupData;
                        }, {
                            conversionRate: 0
                        })

                        .map((abtestGroupData) => {
                            const winnerData = abtestCalculator.calculateWinner(controlStats.results, abtestGroupData.results);
                            const confidence = abtestCalculator.calculateConfidence(controlStats.results, abtestGroupData.results);
                            const winner = (winnerData === controlStats.results) ? controlGroup : abtestGroupData.abtestGroup;

                            return {
                                winner_id: winner._id,
                                confidence: confidence
                            };
                        });
                });
        });
};
