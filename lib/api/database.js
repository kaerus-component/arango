var Arango = require('../arango');

function DatabaseAPI(db) {
    var path = "/_api/database/";
    
    return {
        "create": function(name, users, callback) {
            var options = {
                name: name
            };

            if (typeof users === 'function') {
                callback = users;
                users = null;
            }

            if (users) options.users = users;

            return db.post(path, options, callback);
        },
        "current": function(callback) {
            return db.get(path + 'current', callback);
        },
        "list": function(callback) {
            return db.get(path, callback);
        },
        "user": function(callback) {
            return db.get(path + 'user', callback);
        },
        "delete": function(name, callback) {
            return db.delete(path + name, callback);
        }
    };
}

module.exports = Arango.api('database', DatabaseAPI);
