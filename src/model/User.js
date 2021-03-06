'use strict';


const mongoose = require('mongoose');


const User = mongoose.model('User', {
    user_management_id: {
        type: String,
        required: true
    },
    apiKey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApiKey',
        required: true
    },
    pricingTier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PricingTier',
        required: true
    }
});


module.exports = User;
