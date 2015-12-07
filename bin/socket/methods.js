"use strict";
var Vjson = require('jsonschema').Validator;

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
module.exports = function (socket, apiVersion, log) {

	socket.validate = function (name, type, properties) {
		var vjson = new Vjson();

		let report = vjson.validate(this[name], {
			type,
			properties
		});

		if (report.errors.length > 0) {

			let error = {
				message: `socket.${name} fail on schema validation.`,
				report: report
			};

			log.info(`websocket-rest (socket.validate.${name})`,'fail',error);
			socket.validationError(error);
			return false;
		} else {
			log.info(`websocket-rest (socket.validate.${name})`,'pass');
			return true;
		}
	};


};
