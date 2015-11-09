"use strict";
var status = require('http-status-codes');
var queryString = require('query-string');

class WebsocketRest {
    constructor(socket, apiVersion) {
        this.socket = socket;
        this.apiVersion = apiVersion;
        this.modules = {};

		this.onClose = function(socket){};
		this.onConnect = function(socket){};
    }

    _addSocketFunctions(socket) {
        var self = this;
        //https://google-styleguide.googlecode.com/svn/trunk/jsoncstyleguide.xml
        socket.data = function (data, code) {
			code = code || 200;
            this.send(JSON.stringify({
                apiVersion: self.apiVersion,
				method: this.REST.method,
				module: this.REST.module,
				code : code,
                data: data
            }));
        };
		socket.info = function (message, code) {

			code = code || 200;
			let res = JSON.stringify({
				apiVersion: self.apiVersion,
				method: this.REST.method,
				module: this.REST.module,
				code: code,
				data: {
					message: message
				}
			});
			this.send(res);
		};
        socket.error = function (message,errors, code) {

			code = code || 500;
            let res = JSON.stringify({
                apiVersion: self.apiVersion,
				method: this.REST.method,
				module: this.REST.module,
				code: code,
                error: {
                    message: message,
                    errors: errors
                }
            });
            this.send(res);
			this.close();
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

	setOnConnect(func){
		this.onConnect = func;
	}
	setOnClose(func){
		this.onClose = func;
	}

	_addSocketKeys(socket){
		//Todo...
		socket.address = socket.upgradeReq.connection.remoteAddress;
		socket.params = queryString.parse(queryString.extract( socket.upgradeReq.url) );
		socket.headers = socket.upgradeReq.headers;
		socket.connectedAt = new Date();
		socket.REST = {
			'method' : 'connect',
			'module' : 'event'
		};
		return socket;
	}

    init() {
        var self = this;
        this.socket.on('connection', function (socket) {

			var socket = self._addSocketKeys(socket);
				socket = self._addSocketFunctions(socket);

			self.onConnect(socket);

			socket.on('close',function(){
				self.onClose(socket);
			});


            socket.on('message', function (msg) {
                var req = JSON.parse(msg || "{}");

				console.error(msg);

				//check req
                var reqKeys = ['module', 'method'];
                var keyError = [];
                for (var i in reqKeys) {
                    if (!(reqKeys[i] in req)) keyError.push(reqKeys[i]);
                }
                if (keyError.length != 0) {
                    var err = `Keys: [${keyError}] not in request!`;
                    console.error(err);
                    socket.error(status.getStatusText(status.BAD_REQUEST),[err],status.BAD_REQUEST);

                } else if(0 == req.method.indexOf("private")){
					var err = `You can not call private methods!`;
					console.error(err);
					socket.error(status.getStatusText(status.METHOD_NOT_ALLOWED),[err],status.METHOD_NOT_ALLOWED);
				} else {
					socket.REST.module = req['module'];
					socket.REST.method = req['method'];

                    self.modules[req['module']][req['method']](req, socket);
                }
            });
        });
    }
}

module.exports = WebsocketRest;
