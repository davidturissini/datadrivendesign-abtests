'use strict';

const rx = require('rx');
const port = process.env.PORT || 4000;

module.exports = rx.Observable.return(port);