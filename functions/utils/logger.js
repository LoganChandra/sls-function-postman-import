const util = require('util');

function info({ request_id, message, params = {} } = {}) {
    console.log({
        request_id: request_id,
        message: message,
        params: util.inspect(params, false, Infinity),
    });
}

function error({ request_id, message, error = {} } = {}) {
    console.error({
        request_id: request_id,
        message: message,
        error: util.inspect(error, false, Infinity),
    });
}

function debug({ request_id, message, params = {} } = {}) {
    console.debug({
        request_id: request_id,
        message: message,
        params: util.inspect(params, false, Infinity),
    });
}

module.exports = {
    info,
    error,
    debug,
};
