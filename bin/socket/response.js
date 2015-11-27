"use strict";

/**
 * All response help methods which wraps socket.send(JSON.stringify()) functionality.
 * The error method will also close socket connection.
 *
 * { data(data,code)
 *   apiVersion: apiVersion,
 *	 method: this.REST.method,
 *	 module: this.REST.module,
 *	 code: code,
 *	 data: data
 * }
 *
 * { info(msg,code)
 *   apiVersion: apiVersion,
 *	 method: this.REST.method,
 *	 module: this.REST.module,
 *	 code: code,
 *	 data: { message: message }
 * }
 *
 * { error(msg,[error,...],code)
 *   apiVersion: apiVersion,
 *	 method: this.REST.method,
 *	 module: this.REST.module,
 *	 code: code,
 *	 error: {
 *		message: message,
 *		errors: errors
 *	 }
 * }
 *
 * @param socket
 * @param apiVersion
 */
module.exports = function(socket,apiVersion,logger) {
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

		logger.warn('websocket-rest (socket.error)',{
			socket : {
				address : socket.address,
				query : socket.query,
				urlPath : socket.urlPath,
				headers : socket.headers,
				key : socket.key,
				connectedAt	: socket.connectedAt
			},
			response : {
				apiVersion: apiVersion,
				method: this.REST.method,
				module: this.REST.module,
				code: code,
				error: {
					message: message,
					errors: errors
				}
			}
		});

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
