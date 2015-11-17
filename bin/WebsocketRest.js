"use strict";
var status = require('http-status-codes');

var addSocketResponse = require('./socket/response');
var addSocketKeys = require('./socket/keys');

class WebsocketRest {
	constructor(){
		this.socket = null;
		this.apiVersion = null;
		this.modules = {};
		this._connectedClients = {};

		this.onClose = function(socket){};
		this.onConnect = function(socket){};
	}

    init(socket, apiVersion) {
        this.socket = socket;
        this.apiVersion = apiVersion;
    }

	getConnectedClient(key){
		return this._connectedClients[key];
	}
	getConnectedClients(){
		return this._connectedClients;
	}

    registerModule(moduleName, module) {
        if (moduleName in this.modules) {
            throw new Error(moduleName + ' is allready in registered modules!');
        } else {
            this.modules[moduleName] = module;
        }
    }

	setOnConnect(func){
		var self = this;
		this.onConnect = function(socket){
			func(socket);
			//After user logic is executed ok socket is added
			self._connectedClients[socket.key] = socket;
		};

	}
	setOnClose(func){
		this.onClose = func;
	}


    initServer() {
        var self = this;
        this.socket.on('connection', function (socket) {

	        addSocketResponse(socket,self.apiVersion);
	        addSocketKeys(socket);

			self.onConnect(socket);

			socket.on('close',function(){
				delete self._connectedClients[socket.key];
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

module.exports = new WebsocketRest();
