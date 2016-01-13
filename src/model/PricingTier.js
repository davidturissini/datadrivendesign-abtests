'use strict';

const mongoose = require('mongoose');

const PricingTier = mongoose.model('PricingTier', {
    impressions_limit: {
        type: Number,
        required: true
    },

    abtest_limit: {
        type: Number,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    label: {
        type: String,
        required: true
    }
});


module.exports = PricingTier;
