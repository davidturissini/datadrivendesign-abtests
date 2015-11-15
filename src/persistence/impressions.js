'use strict';

const uuid = require('uuid');
const groupPersistence = require('./groups');
const abtestPersistence = require('./abtests');

const members = {
    '1': {
        group_id: '3',
        participant_id: 'f013b240-7578-46a7-a984-38f7e6d8ce35'
    }

};

module.exports = {

    all: function () {
        return members;
    },

    save: function (member) {
        if (!member.id) {
            member.id = uuid();
        }

        members[member.id] = member;

        return member;
    },

    findAllByGroup: function (group) {

        return Object.keys(members)
            .map((memberId) => {
                return members[memberId];
            })
            .filter((member) => {
                return member.group_id === group.id;
            });

    },
    
    findByAbTestAndParticipant: function (abtest, participant) {
        return Object.keys(members).map(function (id) {
                return members[id];
            })
            .filter(function (member) {
                return member.participant_id === participant.id;
            })
            .filter(function (member) {
                const group = groupPersistence.get(member.group_id);  

                return (abtest.id === group.abtest_id);
            })

    }

};