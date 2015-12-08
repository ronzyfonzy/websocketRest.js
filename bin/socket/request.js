'use strict';

module.exports = function (req) {

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
			return false;
		} else {
			log.info(`websocket-rest (socket.validate.${name})`,'pass');
			return true;
		}
	};
};
