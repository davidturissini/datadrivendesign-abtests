'use strict';

const rx = require('rx');

const abtests = require('./../../persistence/abtests');


module.exports = function (req) {
    const abtest_id = req.params.abtest_id;

    return rx.Observable.create(function (o) {
        const abtest = abtests.get(abtest_id);


        o.onNext(abtest);
        o.onCompleted();

    })

}