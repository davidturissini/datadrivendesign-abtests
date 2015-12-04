'use strict';


const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ddd-test');

require('node-babel')();
const server = require('whirlpool');
// token: 2887648e-f89a-4465-b38a-9a7b417e22db

server(process.env.PORT || 4000, [{
    method: 'post',
    path: '/users',
    handler: './src/controller/users/create'
},{
    method: 'post',
    path: '/userSession',
    handler: './src/controller/userSession/create'
},{
    method: 'get',
    path: '/users/:user_id',
    handler: './src/controller/users/show'
},{
    method: 'get',
    path: '/users/:user_id/abtests',
    handler: './src/controller/abtests/index'
},{
    method: 'post',
    path: '/users/:user_id/abtests',
    handler: './src/controller/abtests/create'
},{
    method: 'post',
    path: '/abtests/:abtest_id/impressions',
    handler: './src/impressions/create'
},{
    method: 'post',
    path: '/abtests/:abtest_id/convert',
    handler: './src/conversions/create'
}], {
    cwd: __dirname + '/../'
});
