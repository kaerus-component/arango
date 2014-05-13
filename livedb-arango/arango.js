exports = module.exports = function(arango) {
    return new LiveDbArango(arango);
};


function LiveDbArango(arango) {
    this.arango = arango;
    this.closed = false;
    this.operationCollections = {};
//    console.log(this.close.toString());
//    console.log(this.getOps.toString());
}


LiveDbArango.prototype.close = function(callback) {
    if (this.closed) return callback('db already closed');
    this.closed = true;
};


LiveDbArango.prototype.getSnapshot = function(collectionId, documentId, callback) {
    this.arango.document.get(collectionId + "/" + documentId, function(res, err) {
  //      console.log(res);
  //      console.log(err);
        if (err.error = true) {
            if (err.code === 404) {
                callback(false);
            } else {
                callback(err.errorMessage);
            }
        } else {
            callback(false, err);
        }
    });
};

LiveDbArango.prototype.writeSnapshot = function(collection, name,  data, callback) {
    data.name = name;
    this.arango.document.create(collection, data, {createCollection : true}, function(err, ret) {
    //    console.log(err, ret);
        callback();
    });
};


LiveDbArango.prototype.writeOp = function(collection, documentId, operation, callback) {
        console.log(operation);
        this.getOperationsCollection(collection);
        operation.name = documentId;
        this.arango.document.create(collection, operation, function(err, ret) {
      //      console.log(err, ret);
            callback();
        });
};

LiveDbArango.prototype.getVersion = function(collection, documentId, callback) {

    var cursorData = {};
    this.getOperationsCollection(collection);
    cursorData.query = "LET x = MAX((for i in " + this.getOperationslogCollectionName(collection) +
        " FILTER i.name == @name return i.v)) RETURN x == null ? 0 : x + 1"
    cursorData.bindVars = {name : documentId};
    this.arango.cursor.create(cursorData, function(err, ret) {
        if (ret.error || ret.hasMore) {
            callback("Error fetching the last version");
        } else {
        //    console.log("AAAAAAAAAAA", ret);
            callback(null, ret.result[0]);
        }
    });
};

LiveDbArango.prototype.getOps = function(collection, documentId, start, end, callback) {
    var cursorData = {};
    this.getOperationsCollection(collection);
    cursorData.query = "FOR i IN " + this.getOperationslogCollectionName(collection) +
        " FILTER i.name == @name FILTER i.v >= @start FILTER i.v <= @end SORT i.v DESC RETURN i"
    cursorData.count = true;
    cursorData.batchSize = 10000;
    cursorData.bindVars = {name : documentId, start: start, end : end};
    this.arango.cursor.create(cursorData, function(err, ret) {
        if (ret.error || ret.hasMore) {
          //  console.log(err, ret);
            callback("Error fetching the operations log");
        } else {
          //  console.log("BBBBBBBBBB", ret);
            callback(null, ret.result);
        }
    });
};

LiveDbArango.prototype.getOperationsCollection = function(collectionName) {
    var name = this.getOperationslogCollectionName(collectionName);
    if (!this.operationCollections[name]) {
        var self  = this;
        this.arango.collection.create(name, {waitForSync : false},  function(err, ret) {
            if (ret.error === true) {
           //     console.log(ret.errorMessage);
            }
            self.arango.index.createHashIndex(name, ["name", "v"], true, function(err, ret) {
                if (ret.error === true) {
            //        console.log(ret.errorMessage);
                } else {
                    self.operationCollections[name] = 1;
                }
            });

        });
    }
};

LiveDbArango.prototype.getOperationslogCollectionName = function(collectionName) {
    return collectionName + '_ops';
};