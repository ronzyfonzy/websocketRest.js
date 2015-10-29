"use strict";

exports.dataResponse = function (req, socket) {
	socket.data('dataResponse');
};

exports.errorResponse = function(req,socket){
	socket.error('errorResponse',['error0','error1']);
};

exports.returnAddress= function(req,socket){
	socket.send(socket.address);
};

exports.returnParams = function(req,socket){
	socket.data(socket.params);
};

exports.returnHeaders = function(req,socket){
	socket.data(socket.headers.host);
};

exports.connectedAt = function(req,socket){
	socket.data(socket.connectedAt);
};

exports._privateMethod = function(req,socket){ };
