'use strict';


const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ddd-test');

require('node-babel')();
const server = require('whirlpool');
// token: 2887648e-f89a-4465-b38a-9a7b417e22db

server(process.env.PORT || 4000, [{
    method: 'post',
    path: '/users',
    handler: './src/controller/user/create'
},{
    method: 'post',
    path: '/userSession',
    handler: './src/controller/userSession/create'
},{
    method: 'delete',
    path: '/userSession',
    handler: './src/controller/userSession/delete'
},{
    method: 'get',
    path: '/users/:user_id',
    handler: './src/controller/user/show'
},{
    method: 'get',
    path: '/users/:user_id/abtests',
    handler: './src/controller/abtest/index'
},{
    method: 'post',
    path: '/users/:user_id/abtests',
    handler: './src/controller/abtest/create'
},{
    method: 'post',
    path: '/abtests/:abtest_id/impressions',
    handler: './src/controller/impression/create'
},{
    method: 'post',
    path: '/abtests/:abtest_id/conversions',
    handler: './src/controller/conversion/create'
}], {
    cwd: __dirname + '/../'
});
