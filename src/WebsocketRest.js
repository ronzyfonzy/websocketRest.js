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
				code : code,
                data: data
            }));
        };
        socket.error = function (msg,errors, code) {

			code = code || 500;
            let res = JSON.stringify({
                apiVersion: self.apiVersion,
                error: {
                    code: code,
                    message: msg,
                    errors: errors
                }
            });
            this.send(res);
			this.close();

			console.error(`WebsocketRest.error = ${res}`);
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

				//check req
                var reqKeys = ['module', 'method'];
                var keyError = [];
                for (var i in reqKeys) {
                    if (!(reqKeys[i] in req)) keyError.push(reqKeys[i]);
                }
                if (keyError.length != 0) {
                    var err = `Keys: [${keyError}] not in request!`;
                    console.error(err);
                    socket.error(err,[err],status.BAD_REQUEST);

                } else if(0 == req.method.indexOf("private")){
					var err = `You can not call private methods!`;
					console.error(err);
					socket.error(err,[err],status.METHOD_NOT_ALLOWED);
				} else {
                    self.modules[req['module']][req['method']](req, socket);
                }
            });
        });
    }
}

module.exports = WebsocketRest;
