'use strict';

const mongoose = require('mongoose');

const ApiKey = mongoose.model('ApiKey', {
    secret: {
        type: String,
        required: true,
        default: function () {
            return mongoose.Types.ObjectId();
        }
    }
});


module.exports = ApiKey;
