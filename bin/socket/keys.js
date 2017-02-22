"use strict";

var queryString = require('query-string');
var url = require('url');

/**
 * Here all socket keys will be added to client socket instance:
 * 1. address: client ip.
 * 2. query: url query in json format.
 * 3. urlPath: url path on socket connection event.
 * 4. headers: connection request headers.
 * 5. key: Unique socket key.
 * 6. connectedAt: date when client has connected.
 * 7. REST: will hold updated information obout last called method and module.
 *  default falues will be method='connect', module='event'.
 *
 * @param socket
 */
module.exports = function(socket){
	socket.pingStats = {
		count : 0,
		pingedAt : new Date()
	};
	socket.address = socket.upgradeReq.connection.remoteAddress;
	socket.query = queryString.parse(queryString.extract(socket.upgradeReq.url));
	socket.urlPath = url.parse(socket.upgradeReq.url).pathname;
	socket.headers = socket.upgradeReq.headers;
	socket.key = socket.headers['sec-websocket-key'];
	socket.connectedAt = new Date();
	socket.REST = {
		'method': 'connect',
		'module': 'event'
	};

};
