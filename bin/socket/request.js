"use strict";
var Vjson = require('jsonschema').Validator;

module.exports = function (socket,req,log) {

	req.isValidated = true;

	req.validate = function (name, type, properties) {
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
			this.isValidated = false;
		} else {
			log.info(`websocket-rest (socket.validate.${name})`,'pass');
		}
	};

	return req;
};
