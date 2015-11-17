"use strict";

var queryString = require('query-string');

module.exports = function(socket){
	socket.address = socket.upgradeReq.connection.remoteAddress;
	socket.params = queryString.parse(queryString.extract( socket.upgradeReq.url) );
	socket.headers = socket.upgradeReq.headers;
	socket.connectedAt = new Date();
	socket.REST = {
		'method' : 'connect',
		'module' : 'event'
	};
	return socket;
};
