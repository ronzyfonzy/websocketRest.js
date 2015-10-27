"use strict";
var status = require('http-status-codes');

class WebsocketRest {
    constructor(socket, apiVersion) {
        this.socket = socket;
        this.apiVersion = apiVersion;
        this.modules = {};

    }

    _addSocketFunctions(socket) {
        var self = this;
        //https://google-styleguide.googlecode.com/svn/trunk/jsoncstyleguide.xml
        socket.data = function (data, code) {
            this.send(JSON.stringify({
                apiVersion: self.apiVersion,
                data: data
            }));
        };
        socket.error = function (msg, code, errors) {
            this.send(JSON.stringify({
                apiVersion: self.apiVersion,
                error: {
                    code: code || 500,
                    message: status.getStatusText(code),
                    errors: errors
                }
            }));
        };
        return socket;
    }

    registerModule(moduleName, module) {
        if (moduleName in this.modules) {
            throw new Error(moduleName + ' is allready in registered modules!');
        } else {
            this.modules[moduleName] = module;
        }
    }

    initMsgListener() {
        var self = this;
        this.socket.on('connection', function (socket) {

            var socket = self._addSocketFunctions(socket);

            socket.on('message', function (msg) {
                var req = JSON.parse(msg);

                var reqKeys = ['module', 'method', 'body'];
                var keyError = [];
                for (var i in reqKeys) {
                    if (!(reqKeys[i] in req)) keyError.push(reqKeys[i]);
                }
                if (keyError.length != 0) {
                    var err = `Keys: [${keyError}] not in request!`;
                    console.error(err);
                    socket.error(err,status.BAD_REQUEST,[
                        err
                    ]);

                } else {
                    self.modules[req['module']][req['method']](req, socket);
                }
            });
        });
    }
}

module.exports = WebsocketRest;
