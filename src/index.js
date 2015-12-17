'use strict';

const rx = require('rx');
const dbConnection = require('./db/connection');
const serverRoutes = require('./server/routes');
const serverExpress = require('./server/express');
const serverPort = require('./server/port');

dbConnection.combineLatest(
    serverPort,
    serverExpress,
    function combinePortExpress(db, port, expressApp) {
        expressApp.listen(port);
        console.log(`Server started on port ${port}`);

        return expressApp;
    }
)
.flatMapLatest((expressApp) => {
    return serverRoutes.flatMap((routeData) => {
        return rx.Observable.create(function (o) {
            console.log(`Listening for ${routeData.method.toUpperCase()} ${routeData.path}`);

            expressApp[routeData.method](routeData.path, function (req, res) {
                routeData.handler(req)
                    .subscribe(function (data) {
                        o.onNext({
                            data: {
                                data: data
                            },
                            res: res
                        });
                    }, function (error) {
                        const errorMessage = error.message ? error.message : error;

                        o.onNext({
                            data: {
                                error: {
                                    message: errorMessage
                                }
                            },
                            res: res
                        });
                    });
            });
        });
    });
})

.subscribe(function (data) {
    const res = data.res;
    const json = data.data;

    const jsonString = JSON.stringify(json);

    res.setHeader('Content-Type', 'application/json');
    res.write(jsonString);
    res.end();
}, function (err) {
    console.log(err);
});
