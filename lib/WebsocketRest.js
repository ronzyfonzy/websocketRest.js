define(['exports'], function (exports) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var status = require('http-status-codes');

    var WebsocketRest = (function () {
        function WebsocketRest(socket, apiVersion) {
            _classCallCheck(this, WebsocketRest);

            this.socket = socket;
            this.apiVersion = apiVersion;
            this.modules = {};
        }

        _createClass(WebsocketRest, [{
            key: '_addSocketFunctions',
            value: function _addSocketFunctions(socket) {
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
        }, {
            key: 'registerModule',
            value: function registerModule(moduleName, module) {
                if (moduleName in this.modules) {
                    throw new Error(moduleName + ' is allready in registered modules!');
                } else {
                    this.modules[moduleName] = module;
                }
            }
        }, {
            key: 'initMsgListener',
            value: function initMsgListener() {
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
                            var err = 'Keys: [' + keyError + '] not in request!';
                            console.error(err);
                            socket.error(err, status.BAD_REQUEST, [err]);
                        } else {
                            self.modules[req['module']][req['method']](req, socket);
                        }
                    });
                });
            }
        }]);

        return WebsocketRest;
    })();

    module.exports = WebsocketRest;
});
//# sourceMappingURL=WebsocketRest.js.map
