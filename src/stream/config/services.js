'use strict';

const rx = require('rx');
const fs = require('fs');

function createServicesConfigStream() {

    return rx.Observable.create(function (o) {
        fs.readFile('./src/config/services.json', function (err, contents) {

            if (err) {
                o.onError(err);
            }

            const json = JSON.parse(contents.toString());
            o.onNext(json);
            o.onCompleted();

        });
    })
    .replay(undefined, 1)
    .refCount();

}


module.exports = createServicesConfigStream();