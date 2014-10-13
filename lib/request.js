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

  var asyncCallback = function(err, value, opaque){
    process.nextTick(function() {
      callback(err, value, opaque);
    });
  };

  if (typeof callback === 'function') {
    result = result.then(function (value, opaque) {
      return asyncCallback(undefined, value, opaque);
    }, function (reason, opaque) {
      return asyncCallback(-1, reason, opaque);
    }, function (progress) {
      return asyncCallback(0, progress);
    });
  }

  return result;
}

module.exports = request;
