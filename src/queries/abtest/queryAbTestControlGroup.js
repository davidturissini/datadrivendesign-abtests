'use strict';

const rx = require('rx');

// Model
const AbTestControlGroupRelationship = require('./../../model/AbTestControlGroupRelationship');
const AbTestGroup = require('./../../model/AbTestGroup');

module.exports = function (abtest) {

    return rx.Observable.create(function (o) {
        AbTestControlGroupRelationship.findOne({
            abtest: abtest
        }, function (err, relationship) {
            if (err) {
                o.onError(err);
            }

            o.onNext(relationship);
            o.onCompleted();
        });
    })

    .flatMapLatest((relationship) => {
        return rx.Observable.create(function (o) {
            AbTestGroup.findOne({
                _id: relationship.abtestGroup
            }, function (err, control) {
                if (err) {
                    o.onError(err);
                }

                o.onNext(control);
                o.onCompleted();
            });
        });
    });
};
