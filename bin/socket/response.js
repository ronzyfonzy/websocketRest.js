"use strict";

module.exports = function(socket,apiVersion) {
	socket.data = function (data, code) {
		this.send(JSON.stringify({
			apiVersion: apiVersion,
			method: this.REST.method,
			module: this.REST.module,
			code: code,
			data: data
		}));
	};
	socket.info = function (message, code) {
		this.send(JSON.stringify({
			apiVersion: apiVersion,
			method: this.REST.method,
			module: this.REST.module,
			code: code,
			data: {
				message: message
			}
		}));
	};
	socket.error = function (message, errors, code) {
		this.send(JSON.stringify({
			apiVersion: apiVersion,
			method: this.REST.method,
			module: this.REST.module,
			code: code,
			error: {
				message: message,
				errors: errors
			}
		}));
		this.close();
	};
};
