"use strict";

var queryString = require('query-string');
var url = require('url');

module.exports = function(socket){

	socket.address = socket.upgradeReq.connection.remoteAddress;
	socket.query = queryString.parse(queryString.extract(socket.upgradeReq.url));
	socket.urlPath = url.parse(socket.upgradeReq.url).pathname.split('/').slice(1);
	socket.headers = socket.upgradeReq.headers;
	socket.key = socket.headers['sec-websocket-key'];
	socket.connectedAt = new Date();
	socket.REST = {
		'method': 'connect',
		'module': 'event'
	};

};
