
module.exports = function (socket, apiVersion, logger) {

	socket.validationError = function (error) {
		let json = {
			apiVersion: apiVersion,
			method: this.REST.method,
			module: this.REST.module,
			code: 400,
			error: error
		};
		logger.debug('websocket-rest (socket.validationError)', json);
		try {
			this.send(JSON.stringify(json));
		} catch (err) {
			logger.debug('websocket-rest (socket.send)', {
				message: 'Could not send to client',
				json: json,
				method: 'data',
				stack: err
			})
		}
	};

};
