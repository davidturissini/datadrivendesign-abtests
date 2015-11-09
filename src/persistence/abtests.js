'use strict';

const abtests = [{
    id: 1,
    user_id: 1,
    name: 'abtest1',
    sampleSize: 10000,
    group_control_id: 1
},{
    id: 2,
    user_id: 1,
    name: 'abtest2'
},{
    id: 3,
    user_id: 3,
    name: 'abtest3'
},{
    id: 4,
    user_id: 4,
    name: 'abtest4'
}];

module.exports = {

    findAllForUser (user) {
        return abtests.filter(function (abtest) {
            return abtest.user_id === user.id 
        });
    }

};