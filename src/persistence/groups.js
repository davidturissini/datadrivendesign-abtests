'use strict';

const groups = [{
    id: 1,
    abtest_id: 1,
    distribution: 0.25,
    name: 'group 1'
},{
    id: 2,
    abtest_id: 1,
    distribution: 0.25,
    name: 'group 2'
},{
    id: 3,
    abtest_id: 1,
    distribution: 0.25,
    name: 'group 3'
},{
    id: 4,
    abtest_id: 2,
    distribution: 0.25,
    name: 'group 4'
},{
    id: 5,
    abtest_id: 3,
    distribution: 100,
    name: 'group 2'
}];

module.exports = {

    findAllForABTest (abtest) {
        return groups.filter(function (group) {
            return group.abtest_id === abtest.id 
        });
    }

};