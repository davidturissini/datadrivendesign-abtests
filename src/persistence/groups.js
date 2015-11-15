'use strict';

const uuid = require('uuid');

const groups = {
    '1': {
        id: '1',
        abtest_id: '7240dbb2-e5cd-41da-a36f-f6ed39b18af0',
        distribution: 0.33,
        name: 'group 1',
        slug: 'group-1'
    },
    '2': {
        id: '2',
        abtest_id: '7240dbb2-e5cd-41da-a36f-f6ed39b18af0',
        distribution: 0.33,
        name: 'group 2',
        slug: 'group-2'
    },
    '3': {
        id: '3',
        abtest_id: '7240dbb2-e5cd-41da-a36f-f6ed39b18af0',
        distribution: 0.34,
        name: 'group 3',
        slug: 'group-3'
    }, 
    '4': {
        id: '4',
        abtest_id: '11560f27-98f8-404c-85fc-a53bebc5819c',
        distribution: 0.25,
        name: 'group 4',
        slug: 'group-3'
    }
};

module.exports = {

    save: function (group) {
        if (!group.id) {
            group.id = uuid();
        }

        groups[group.id] = group;

        return group;
    },

    get: function (id) {
        return groups[id];
    },

    findAllForABTest: function (abtest) {
        return Object.keys(groups).filter(function (groupId) {
            const group = groups[groupId];
            return group.abtest_id === abtest.id 
        })
        .map((groupId) => {
            return groups[groupId];
        })
    },

    findAbTestGroupForMember: function (abtest, member) {
        return this.findAllForABTest(abtest)
            .filter(function (group) {
                return group.id === member.id;
            })[0];
    }

};