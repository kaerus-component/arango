var utils = require('./utils'),
    xhr = require('./xhr');

function request(method, path, data, options, callback) {
    var result;

    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    options = options ? options : {};

    options = utils.extend(true, {}, this._server, options);

    if (data && typeof data !== 'string') {
        try {
            data = JSON.stringify(data);
        } catch (err) {
            throw "failed to json stringify data";
        }
    }

    if (this._name) {
        path = '/_db/' + this._name + path;
    }

    result = new this.Promise();

    xhr(method, path, options, data, result);

    if (typeof callback === 'function') {
        /* chain with callback */
        result = result.then(function(value, opaque) {
            return callback(undefined, value, opaque);
        }, function(reason, opaque) {
            return callback(-1, reason, opaque);
        }, function(progress) {
            return callback(0, progress);
        });
    }

    return result;
}

module.exports = request;
