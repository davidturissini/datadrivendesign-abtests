'use strict';

const server = require('data-driven-design-server-bootstrap');
// token: 2887648e-f89a-4465-b38a-9a7b417e22db

server(4000, [{
    "method": "get",
    "path": "/users/:user_id/abtests",
    "handler": "./src/abtests/index"
}], {
    cwd: __dirname + '/../'
});
