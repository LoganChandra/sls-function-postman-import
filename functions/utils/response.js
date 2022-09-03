function okResponse({ message, data = {} } = {}) {
	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Credentials': true,
		},
		body: JSON.stringify({
			status_code: 200,
			message: message,
			data: data,
		}),
	};
}

function errResponse({ status_code, message, error_object = {} } = {}) {
	return {
		statusCode: status_code,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Credentials': true,
		},
		body: JSON.stringify({
			status_code: status_code,
			message: message,
			error: error_object,
		}),
	};
}

module.exports = {
	okResponse,
	errResponse,
};
