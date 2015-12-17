'use strict';


const mongoose = require('mongoose');


const AbTest = mongoose.model('AbTest', {
    name: {
        type: String,
        default: function () {
            return 'Untitled';
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sampleSize: {
        type: Number
    },
    created: {
        type: Date,
        default: function () {
            return Date.now();
        }
    }
});


module.exports = AbTest;
