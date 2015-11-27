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
		if(key in this._connectedClients){
			return this._connectedClients[key];
		}
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
				try {
					fun(socket);
					//After user logic is executed ok socket is added
					self._connectedClients[socket.key] = socket;
				} catch (err) {
					console.trace(err);
					return socket.error(
						'Internal error: Contact developers',
						[err.stack],
						status.INTERNAL_SERVER_ERROR
					);
				}

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

	_onConnection(socket){
		let urlPath = socket.urlPath;

		if(urlPath in this.onUrlConnect){
			this.onUrlConnect[urlPath](socket);
		} else {
			var err = `UrlPath: ${socket.urlPath}] not found !`;
			socket.error(status.getStatusText(status.NOT_FOUND), [err], status.NOT_FOUND);
		}
	}

    initServer() {
        var self = this;
        this.socket.on('connection', function (socket) {

	        addSocketResponse(socket,self.apiVersion);
	        addSocketKeys(socket);

	        self._onConnection(socket);

			socket.on('close',function(){
				delete self._connectedClients[socket.key];
				if (socket.urlPath in self.onUrlConnect) {
					self.onUrlConnect[socket.urlPath](socket);
				}
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

	                //For standardization with express...
	                if (req.hasOwnProperty('data')) {
		                req['body'] = req['data'];
		                delete req['data'];
	                }

                    self.modules[req['module']][req['method']](req, socket);
                }
            });
        });
    }
}

module.exports = new WebsocketRest();
