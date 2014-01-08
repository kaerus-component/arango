var Arango = require('../arango'),
    path = "/_api/index/",
    xpath = "/_api/index?collection=";

  
function IndexAPI(db) {
    return {
        "create": function(collection,data,callback) {
            if(typeof collection !== 'string'){
                callback = data;
                data = collection;
                collection = db._collection;
            }
            return db.post(xpath+collection,data,callback);
        },
        "get": function(id,callback) {
            return db.get(path+id,callback);
        },
        "delete": function(id,callback) {
            return db.delete(path+id,callback);
        },
        "list":function(collection,callback) {
            if(typeof collection !== 'string'){
                callback = collection;
                collection = db._collection;
            }
            return db.get(xpath+collection,callback);
        }
    };    
}


module.exports = Arango.api('index',IndexAPI);
