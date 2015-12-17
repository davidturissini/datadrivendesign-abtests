'use strict';

const rx = require('rx');
const mongoose = require('mongoose');


module.exports = rx.Observable.return('mongodb://localhost/ddd-test')   
    .map((mongoPath) => {
        mongoose.connect(mongoPath);;
    });