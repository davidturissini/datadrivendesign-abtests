'use strict';


const mongoose = require('mongoose');


const AbTestControlGroupRelationship = mongoose.model('AbTestControlGroupRelationship', {
    abtest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AbTest',
        required: true
    },

    abtestGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AbTestGroup',
        required: true
    }
});


module.exports = AbTestControlGroupRelationship;
