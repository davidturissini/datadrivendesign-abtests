'use strict';

const mongoose = require('mongoose');


const Participant = mongoose.model('Participant', {
    key: {
        type: String,
        required: true,
        default: function () {
            return mongoose.Types.ObjectId();
        }
    }
});


module.exports = Participant;
