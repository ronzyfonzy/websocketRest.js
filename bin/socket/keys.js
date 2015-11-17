"use strict";

var queryString = require('query-string');

module.exports = function(socket){

	socket.address = socket.upgradeReq.connection.remoteAddress;
	socket.query = queryString.parse(queryString.extract(socket.upgradeReq.url));
	socket.headers = socket.upgradeReq.headers;
	socket.key = socket.headers['sec-websocket-key'];
	socket.connectedAt = new Date();
	socket.REST = {
		'method': 'connect',
		'module': 'event'
	};

};
