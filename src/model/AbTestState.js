'use strict';


const mongoose = require('mongoose');


const AbTestState = mongoose.model('AbTestState', {
    status: {
        type: String,
        required: true
    },
    abtest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AbTest',
        required: true
    },
    date: {
        type: Date,
        default: function () {
            return Date.now()
        }
    }
});

AbTestState.STATUS_ACTIVE = 'active';
AbTestState.STATUS_COMPLETED = 'completed';


module.exports = AbTestState;