"use strict";

var status = require('http-status-codes');
var addSocketResponse = require('./socket/response');
var addRequestMethods = require('./socket/request');
var addSocketKeys = require('./socket/keys');
var addSocketMethods = require('./socket/methods');

class WebsocketRest {
	constructor(){
		/**
		 * Websocket server instance.
		 * @type {null}
		 */
		this.socket = null;

		/**
		 * Verzion of your app. This data will exist in all responses to clients.
		 * @type {null}
		 */
		this.apiVersion = null;

		/**
		 * All registered modules.
		 * @type {{}}
		 */
		this.modules = {};

		/**
		 * All on connect to url events.
		 * @type {{}}
		 */
		this.onUrlConnect = {};

		/**
		 * All on close from url events.
		 * @type {{}}
		 */
		this.onUrlClose = {};

		this.onEvent = function(){};

		/**
		 * Winston logger instance
		 * @type {null}
		 */
		this._log = null;

		this._connectionsCheck();
	}

	/**
	 * Init function where you set socket server and apiVersion for responses.
	 *
	 * @param socket
	 * @param apiVersion
	 */
    init(socket, apiVersion) {
        this.socket = socket;
        this.apiVersion = apiVersion;
    }

	_connectionsCheck() {
		var self = this;
		setTimeout(function () {
			let sockets = websocketRest.getConnectedClients();
			for (let i in sockets) {
				sockets[i].ping();
				sockets[i].pingsSent++;
				console.log(sockets[i].pingsSent);
				if (sockets[i].pingsSent >= 3) {
					sockets[i].close();
				}
			}
			self._connectionsCheck();
		}, 500);
	}

	/**
	 * Register function that will execute every time message will come from client.
	 *
	 * @param fun
	 */
	registerOnEvent(fun){
		this.onEvent = fun;
	}

	/**
	 * Logger must have next methods.
	 *
	 * @param logger
	 */
	logger(logger){
		this._log = logger;
	}

	_connectionsCheck(){
		var self = this;
		setTimeout(function () {
			let sockets = websocketRest.getConnectedClients();
			for (let i in sockets) {
				sockets[i].ping();
				sockets[i].pingsSent++;
				console.log(sockets[i].pingsSent);
				if (sockets[i].pingsSent >= 3) {
					sockets[i].close();
				}
			}
			self._connectionsCheck();
		}, 500);
	}

	/**
	 * Get connected socket with key.
	 *
	 * @param key
	 * @returns {*}
	 */
	getConnectedClient(key) {
		for (let cliI in this.socket.clients) {
			if (this.socket.clients[cliI].key == key) {
				try {
					this.socket.clients[cliI].ping();
					return this.socket.clients[cliI];
				} catch (err) {
				}
			}
		}
	}

	/**
	 * Get all connected socket clients.
	 *
	 * @returns {{}|*}
	 */
	getConnectedClients() {
		var connectedCli = [];
		for (let cliI in this.socket.clients) {
			try {
				this.socket.clients[cliI].ping();
				connectedCli.push(this.socket.clients[cliI]);
			} catch (err) {
			}
		}

		return connectedCli;
	}

	/**
	 * Adding new module to this.module if not exists.
	 *
	 * @param moduleName
	 * @param module
	 */
    registerModule(moduleName, module) {
        if (moduleName in this.modules) {
            throw new Error(moduleName + ' is allready in registered modules!');
        } else {
            this.modules[moduleName] = module;
        }
    }

	/**
	 * Register fun. that will execute on connection event when
	 * client want to connect to specific server url.
	 * When callback function is called, the client is added to connected clients.
	 *
	 * @param url
	 * @param fun
	 */
	registerOnConnectUrl(url,fun){
		var self = this;
		if(url in this.onUrlConnect){
			let error = `${url} is allready in onUrlConnect!`;
			self._log.fatal('websocket-rest (registerOnConnectUrl)',{
				message : error,
				url : url
			});
			throw new Error(error);
		} else {
			this.onUrlConnect[url] = function(socket){
				try {
					fun(socket,function(){
						self._log.info('websocket-rest (socket.connection)',{
							message: 'Client has connected',
							socket: {
								address: socket.address,
								query: socket.query,
								urlPath: socket.urlPath,
								headers: socket.headers,
								key: socket.key,
								connectedAt: socket.connectedAt
							}
						});
					});
				} catch (err) {
					self._log.err(`websocket-rest (registerOnConnectUrl)`,{
						message : 'this.onUrlConnect[url]',
						url : url,
						stack : err.stack
					});
				}
			};
		}
	}

	/**
	 * Register fun. that will execute on connection close request from client
	 * or from server action. This will remove client from connected clients
	 * and execute on close function for appropriate socket.urlPath.
	 *
	 * @param url
	 * @param fun
	 */
	registerOnCloseUrl(url, fun) {
		var self = this;
		if (url in this.onUrlClose) {
			let error = `${url} is allready in onUrlClose !`;
			self._log.fatal('websocket-rest (registerOnCloseUrl)',{
				message : error,
				url : url
			});
			throw new Error(error);
		} else {
			this.onUrlClose[url] = function(socket){
				try {
					self._log.info('websocket-rest (socket.close)', {
						message: 'Client has disconnected',
						socket: {
							address: socket.address,
							query: socket.query,
							urlPath: socket.urlPath,
							headers: socket.headers,
							key: socket.key,
							connectedAt: socket.connectedAt
						}
					});
					fun(socket);
				} catch (err) {
					self._log.err(`websocket-rest (registerOnCloseUrl)`,{
						message : 'this.onUrlConnect[url]',
						url : url,
						stack : err.stack
					});
				}
			};
		}
	}

	/**
	 * On client connect this method will execute
	 * registered function for socket client url.
	 * If url not found it will close connection end report the error
	 *
	 * @param socket
	 * @private
	 */
	_onConnection(socket){
		let urlPath = socket.urlPath;

		if(urlPath in this.onUrlConnect){
			this.onUrlConnect[urlPath](socket);
		} else {
			var err = `UrlPath: ${socket.urlPath}] not found !`;
			socket.error(status.getStatusText(status.NOT_FOUND), [err], 480);
			return false;
		}
	}

	/**
	 * This will add listeners and handlers when socket client will connect to registered url
	 * 1. It will add socket response methods [ data, info, error ].
	 * 2. It will add socket properties...
	 * 3. It will execute on connect function for client url.
	 * 4. It will register on close event which will remove client from connected clients and after
	 * that execute registered on close function.
	 * 5. It will register on message event which will parse client message to json,
	 * check for module and method key in message,
	 * check if client want to call private method,
	 * form request structure,
	 * and call requested method in module.
	 */
    initServer() {
        var self = this;
        this.socket.on('connection', function (socket) {

	        addSocketResponse(socket,self.apiVersion,self._log);
	        addSocketKeys(socket);
	        addSocketMethods(socket,self.apiVersion,self._log);

	        if(false === self._onConnection(socket)) return;

	        try {
		        self.onEvent();
	        } catch (err) {
		        self._log.fatal('websocket-rest (socket.onEvent)', {
			        message: 'Found new undiscovered error!',
			        stack: err.stack
		        });
	        }

			socket.on('close',function(){
				try{
					if (socket.urlPath in self.onUrlClose) {
						self.onUrlClose[socket.urlPath](socket);
						self.onEvent();
					}
				} catch(err){
					self._log.err(`websocket-rest (socket.onClose)`,{
						message : 'Unknown error on socket close.',
						stack : err.stack
					});
				}
			});

	        socket.on('pong',function(){
				socket.pingsSent = 0;
	        });

            socket.on('message', function (msg) {
	            try{

					try{
						var req = JSON.parse(msg) || {};
					} catch (err){
						self._log.err(`websocket-rest (socket.onMessage)`, {
							message : 'Error while parsing socket message json structure',
							clientMsg : msg,
							stack : err.stack
						});
						var req = {};
					}

					//check req
					var reqKeys = ['module', 'method'];
					var keyError = [];
					for (var i in reqKeys) {
						if (!(reqKeys[i] in req)) keyError.push(reqKeys[i]);
					}
					if (keyError.length != 0) {
						var err = `Keys: [${keyError}] not in request!`;
						socket.error(status.getStatusText(status.BAD_REQUEST),[err],481);

					} else if(0 == req.method.indexOf("private")){
						var err = `Method: [${req.method}] is private!`;
						socket.REST.module = req['module'];
						socket.REST.method = req['method'];
						socket.error(status.getStatusText(status.METHOD_NOT_ALLOWED),[err],482);
					} else {
						socket.REST.module = req['module'];
						socket.REST.method = req['method'];

						if(!req.data){
							req.body = {};
						} else {
							req.body = req.data;
							delete req.data;
						}

						req = addRequestMethods(socket, req, self._log);

						try{
							self.modules[req['module']][req['method']](req, socket);
							self.onEvent();
						} catch (err){
							self._log.fatal('websocket-rest (socket.onMessage)',{
								message : 'Found new undiscowered error!',
								stack : err.stack
							});
						}
					}
	            } catch (err){
		            self._log.err(`websocket-rest (socket.onMessage)`, {
			            message : 'Unknown error on socket message.',
						stack : err.stack
		            });
	            }
            });
        });
    }
}

/**
 * Module will export instance of WebsocketRest class.
 *
 * @type {WebsocketRest}
 */
module.exports = new WebsocketRest();
