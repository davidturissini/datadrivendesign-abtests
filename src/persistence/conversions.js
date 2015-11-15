'use strict';

const uuid = require('uuid');

const conversions = {
    '1': {
        group_id: '3',
        participant_id: 'f013b240-7578-46a7-a984-38f7e6d8ce35'
    }
};

module.exports = {

    save: function (conversion) {
        if (!conversion.id) {
            conversion.id = uuid();
        }

        conversions[conversion.id] = conversion;

        return conversion;
    },

    findAllByGroup: function (group) {

        return Object.keys(conversions)
            .map((conversionId) => {
                return conversions[conversionId];
            })
            .filter((conversion) => {
                return conversion.group_id === group.id;
            });

    },
    
    findByAbTestAndParticipant: function (abtest, participant) {
        return Object.keys(conversions).map(function (id) {
                return conversions[id];
            })
            .filter(function (conversion) {
                return conversion.participant_id === participant.id;
            })
            .filter(function (conversion) {
                const group = groupPersistence.get(conversion.group_id);

                return (abtest.id === group.abtest_id);
            });


    }

};