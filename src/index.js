'use strict';

const rx = require('rx');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');



const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ddd-test');


rx.Observable.create(function (o) {
    const expressApp = express();

    expressApp.use(function (req, res, next) {
        const headers = req.headers;
        const contentType = headers['Content-Type'];

        if (!contentType) {
            headers['Content-Type'] = 'application/json';
        }

        next();

    });

    // parse application/json
    expressApp.use(bodyParser.json());

    expressApp.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "authentication, Origin, Content-Type, Accept");
      next();
    });

    expressApp.use(cors());

    o.onNext(expressApp);
    o.onCompleted();
})

.flatMapLatest((expressApp) => {
    const routes = [{
        method: 'post',
        path: '/users',
        handler: require('./controller/user/create')
    },{
        method: 'post',
        path: '/userSession',
        handler: require('./controller/userSession/create')
    },{
        method: 'delete',
        path: '/userSession',
        handler: require('./controller/userSession/delete')
    },{
        method: 'get',
        path: '/users/:user_id',
        handler: require('./controller/user/show')
    },{
        method: 'get',
        path: '/users/:user_id/abtests',
        handler: require('./controller/abtest/index')
    },{
        method: 'post',
        path: '/users/:user_id/abtests',
        handler: require('./controller/abtest/create')
    },{
        method: 'post',
        path: '/abtests/:abtest_id/impressions',
        handler: require('./controller/impression/create')
    },{
        method: 'post',
        path: '/abtests/:abtest_id/conversions',
        handler: require('./controller/conversion/create')
    }];

    return rx.Observable.create(function (o) {
        routes.forEach(function (data) {

            expressApp[data.method](data.path, function (req, res) {
                data.handler(req)
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
                    })
            });

        
        });

        const port = process.env.PORT || 4000;
        expressApp.listen(port);
        console.log(`Server started on port ${port}`);
    });

    
})
.subscribe(function (data) {
    const res = data.res;
    const json = data.data;

    const jsonString = JSON.stringify(json);

    res.write(jsonString);
    res.end();
}, function (err) {
    console.log(err);
});
