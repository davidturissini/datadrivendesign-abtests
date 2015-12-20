'use strict';

const rx = require('rx');

// Model
const Impression = require('./../../model/Impression');

// Queries
const abtestQueryGroups = require('./../../queries/abtest/queryGroups');

module.exports = function (abtest, participant) {
    return abtestQueryGroups(abtest)
        .toArray()
        .flatMapLatest((abtestGroups) => {
            return rx.Observable.create(function (o) {
                Impression.findOne({
                    participant: participant,
                    abtestGroup: {
                        $in: abtestGroups
                    }
                }, function (err, impression) {
                    if (err) {
                        o.onError(err);
                    }

                    o.onNext(impression);
                    o.onCompleted();
                });
            });
        });
};
