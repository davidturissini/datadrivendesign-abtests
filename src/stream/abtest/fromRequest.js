'use strict';

const rx = require('rx');

// Model
const AbTest = require('./../../model/AbTest');


module.exports = function (req) {
    const abtestId = req.params.abtest_id;

    return rx.Observable.create(function (o) {
        AbTest.findById(abtestId, function (err, abtest) {
            if (err) {
                o.onError(err);
                return;
            }

            if (!abtest) {
                o.onError({
                    message: 'Could not find abtest with id "' + abtestId + '"'
                });
            }

            o.onNext(abtest);
            o.onCompleted();

        });

    });

}