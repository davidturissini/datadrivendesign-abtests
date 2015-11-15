'use strict';

const rx = require('rx');
const request = require('request');
const abtests = require('./../persistence/abtests');
const groupsPersistence = require('./../persistence/groups');
const _ = require('lodash');

module.exports = function (req) {

    return rx.Observable.create(function (o) {
        const json = req.body;
        const abtestParams = _.omit(json, 'groups');

        if (!json.groups) {
            throw new TypeError('Could not create abtest. No groups were sent with request');
        }

        const groups = json.groups.slice();

        abtestParams.user_id = parseInt(req.params.user_id);

        const abtest = abtests.save(abtestParams);

        groups.forEach(function (g) {
            if (typeof g.distribution !== 'number') {
                throw new Error('Could not create ab test. Group "' + g.name + '" has an invalid distribution value: "' + g.distribution + '".');
            }

            g.abtest_id = abtest.id;

            groupsPersistence.save(g)
        });

        abtest.groups = groupsPersistence.findAllForABTest(abtest);


        o.onNext(JSON.stringify(abtest));

    })

}