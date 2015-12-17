'use strict';

const mongoose = require('mongoose');


const Conversion = mongoose.model('Conversion', {
    abtestGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AbTestGroup',
        required: true
    },
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant',
        required: true
    },
    date: {
        type: Date,
        default: function () {
            return Date.now();
        }
    }
});


module.exports = Conversion;
