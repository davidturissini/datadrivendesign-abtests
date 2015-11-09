'use strict';

const server = require('whirlpool');
// token: 2887648e-f89a-4465-b38a-9a7b417e22db

server(process.env.PORT || 4000, [{
    "method": "get",
    "path": "/users/:user_id/abtests",
    "handler": "./src/abtests/index"
}], {
    cwd: __dirname + '/../'
});
