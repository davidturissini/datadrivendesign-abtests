'use strict';

const rx = require('rx');

module.exports = rx.Observable.create(function (o) {
    const routes = [{
        method: 'post',
        path: '/users',
        handler: require('./../controller/user/create')
    }, {
        method: 'post',
        path: '/usersessions',
        handler: require('./../controller/userSession/create')
    }, {
        method: 'delete',
        path: '/usersessions',
        handler: require('./../controller/userSession/delete')
    }, {
        method: 'get',
        path: '/users/:user_id',
        handler: require('./../controller/user/show')
    }, {
        method: 'get',
        path: '/users/:user_id/abtests',
        handler: require('./../controller/abtest/index')
    }, {
        method: 'post',
        path: '/users/:user_id/abtests',
        handler: require('./../controller/abtest/create')
    }, {
        method: 'post',
        path: '/abtests/:abtest_id/impressions',
        handler: require('./../controller/impression/create')
    }, {
        method: 'post',
        path: '/abtests/:abtest_id/conversions',
        handler: require('./../controller/conversion/create')
    }, {
        method: 'get',
        path: '/users/:user_id/abtests/:abtest_id',
        handler: require('./../controller/abtest/show')
    }, {
        method: 'get',
        path: '/pricingtiers',
        handler: require('./../controller/pricingTier/index')
    }];

    routes.forEach(function (route) {
        o.onNext(route);
    });

    o.onCompleted();
});
