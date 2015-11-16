'use strict';

const uuid = require('uuid');

const abtests = [{
    id: '7240dbb2-e5cd-41da-a36f-f6ed39b18af0',
    user_id: 1,
    name: 'My test abtest',
    sampleSize: 10000,
    group_control_id: 1
}];

module.exports = {

    get: function (id) {
        return abtests.filter(function (abtest) {
            return (abtest.id === id);
        })[0];
    },

    save: function (abtest) {
        if (!abtest.id) {
            abtest.id = uuid();
        }

        abtests.push(abtest);

        return abtest;
    },

    findAllForUser: function (user) {
        return abtests.filter(function (abtest) {
            return abtest.user_id === user.id 
        });
    }

};