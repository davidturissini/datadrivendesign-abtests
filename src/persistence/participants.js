'use strict';

const uuid = require('uuid');

const participants = {
    'f013b240-7578-46a7-a984-38f7e6d8ce35': {
        id: 'f013b240-7578-46a7-a984-38f7e6d8ce35'
    }

};

module.exports = {

    save: function (participant) {
        if (!participant.id) {
            participant.id = uuid();
        }

        participants[participant.id] = participant;

        return participant;
    },

    get: function (id) {
        return participants[id];
    }

};