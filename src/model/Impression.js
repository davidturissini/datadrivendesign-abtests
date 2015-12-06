'use strict';

const mongoose = require('mongoose');


const Impression = mongoose.model('Impression', {

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
            return Date.now()
        }
    }
    
});


module.exports = Impression;