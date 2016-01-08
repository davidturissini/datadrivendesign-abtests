'use strict';

const rx = require('rx');
const Chance = require('chance');

// Model
const Impression = require('./../../model/Impression');
const AbTestState = require('./../../model/AbTestState');

// Queries
const abtestQueryGroups = require('./../../queries/abtest/queryGroups');
const abTestQueryTotalImpressionsCount = require('./../../queries/abtest/queryTotalImpressionsCount');
const abTestGroupQueryImpressionsCount = require('./../../queries/abtestGroup/queryImpressionsCount');
const abtestQueryGroupsCount = require('./../../queries/abtest/queryAbTestGroupCount');

module.exports = function (abtest, participant) {
    const totalImpressionsStream = abTestQueryTotalImpressionsCount(abtest);

    return totalImpressionsStream.flatMapLatest((totalAbtestPopulation) => {
        return abtestQueryGroupsCount(abtest)
            .flatMapLatest((numGroups) => {
                const groupIndex = new Chance().integer({
                    min: 0,
                    max: numGroups - 1
                });

                return abtestQueryGroups(abtest).filter((abtestGroup, index) => {
                    return index === groupIndex;
                });
            });
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
