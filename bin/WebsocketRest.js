"use strict";
var status = require('http-status-codes');

var addSocketResponse = require('./socket/response');
var addSocketKeys = require('./socket/keys');

class WebsocketRest {
	constructor(){
		this.socket = null;
		this.apiVersion = null;
		this.modules = {};
		this.onUrlConnect = {};
		this.onUrlClose = {};
		this._connectedClients = {};

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

	registerOnConnectUrl(url,fun){
		var self = this;
		if(url in this.onUrlConnect){
			throw new Error(url + ' is allready in registered connect methods!');
		} else {
			this.onUrlConnect[url] = function(socket){
				fun(socket);
				//After user logic is executed ok socket is added
				self._connectedClients[socket.key] = socket;
			} ;
		}
	}

	registerOnCloseUrl(url, fun) {
		if (url in this.onUrlClose) {
			throw new Error(url + ' is allready in registered connect methods!');
		} else {
			this.onUrlClose[url] = fun;
		}
	}

    initServer() {
        var self = this;
        this.socket.on('connection', function (socket) {

	        addSocketResponse(socket,self.apiVersion);
	        addSocketKeys(socket);

	        self.onUrlConnect[socket.urlPath](socket);

			socket.on('close',function(){
				delete self._connectedClients[socket.key];
				self.onUrlClose[socket.urlPath](socket);
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
