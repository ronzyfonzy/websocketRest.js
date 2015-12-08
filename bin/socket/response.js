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
		let json = {
			apiVersion: apiVersion,
			method: this.REST.method,
			module: this.REST.module,
			code: code,
			data: data
		};
		logger.debug('websocket-rest (socket.data)',json);
		try{
			this.send(JSON.stringify(json));
		} catch (err){
			logger.debug('websocket-rest (socket.send)',{
				message : 'Could not send to client',
				json : json,
				method : 'data',
				stack : err
			})
		}
	};
	socket.info = function (message, code) {
		let json = {
			apiVersion: apiVersion,
			method: this.REST.method,
			module: this.REST.module,
			code: code,
			data: {
				message: message
			}
		};
		logger.debug('websocket-rest (socket.info)',json);
		try{
			this.send(JSON.stringify(json));
		} catch (err){
			logger.debug('websocket-rest (socket.send)',{
				message : 'Could not send to client',
				json : json,
				method : 'debug',
				stack : err
			})
		}
	};
	socket.error = function (message, errors, code) {
		let json = {
			apiVersion: apiVersion,
			method: this.REST.method,
			module: this.REST.module,
			code: code,
			error: {
				message: message,
				errors: errors
			}
		};
		logger.warn('websocket-rest (socket.error)',{
			message : 'Socket server responde with error.',
			socket : {
				address : socket.address,
				query : socket.query,
				urlPath : socket.urlPath,
				headers : socket.headers,
				key : socket.key,
				connectedAt	: socket.connectedAt
			},
			response : json
		});

		try{
			this.send(JSON.stringify(json));
			this.close();
		} catch (err){
			logger.debug('websocket-rest (socket.send)',{
				message : 'Could not send & close client',
				method : 'error',
				json : json,
				stack : err
			})
		}
	};
};
