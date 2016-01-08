'use strict';

const mongoose = require('mongoose');


const AbTestGroup = mongoose.model('AbTestGroup', {
    index: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        default: function () {
            return 'Untitled';
        }
    },
    slug: {
        type: String,
        required: true
    },
    abtest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AbTest',
        required: true
    }
});


module.exports = AbTestGroup;
