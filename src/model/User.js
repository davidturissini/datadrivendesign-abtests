'use strict';


const mongoose = require('mongoose');


const User = mongoose.model('User', {
    user_management_id: {
        type: String,
        required: true
    }
});


module.exports = User;