'use strict';

const mongoose = require('mongoose');


const AbTestResult = mongoose.model('AbTestResult', {
    confidence: {
        type: Number,
        required: true
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AbTestGroup',
        required: true
    },
    abtest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AbTest',
        required: true
    }
});


module.exports = AbTestResult;
