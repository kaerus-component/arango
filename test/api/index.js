if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../../lib/arango',
   '../../lib/utils',
   '../lib/qunit-1.10.js'
];

define(libs,function(arango,utils){ 

module = QUnit.module;

var db = new arango.Connection({name:"testindex"}), id; 
var hash_index = { "type" : "hash", "unique" : false, "fields" : [ "a", "b" ] };

module("Index");

  asyncTest('create, get, list, delete',10, function(){
    db.collection.create(function(create){
      ok(!create,"created collection");
      db.index.create(hash_index,function(err,ret){
        ok(!err,"created hash index");
        ok(ret.id,"has id");
        equal(ret.type,"hash","type is hash");
        equal(ret.unique,false,"not unique");
        deepEqual(ret.fields,hash_index.fields,"validated fields");
        this.id = ret.id;
        db.index.get(ret.id,function(err,ret){
          ok(!err,"retrieved index");
          assert.deepEqual(ret.fields,hash_index.fields,"validate fields"); 
          db.index.list(function(list){
            ok(!list,"list");
            db.index.delete(this.id,function(deleted){
              ok(!deleted,"delete");
              db.collection.delete("testindex");
              start();
            });  
          });
        });
      });
    });    
  });

});