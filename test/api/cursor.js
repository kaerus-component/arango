if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../../lib/arango',
  '../lib/qunit-1.10.js'
];

define(libs,function(arango){ 

module = QUnit.module;

var db = new arango.Connection({name:"testcursor"});
var query = {query:"FOR u IN testcursor RETURN u", count:true, batchSize:1};

module("Cursor");
  asyncTest('create, get, delete',5, function(){
    db.collection.create(function(collection){
      ok(!collection,"collection created");
      var data = {};
      for(var i = 0; i < 50; i++) {
        data.i = i;
        data.msg = "test";
        db.document.create(data);
      }
      /* NOTE: documents are still injected */
      db.cursor.create(query,function(err,ret){
        ok(!err,"cursor created");
        ok(ret.id,"cursor id");
        ok(ret.result,"cursor result");
        this.id = ret.id;
        this.count = ret.count;
        this.counter = 1;


        /* read batches */
        this.next_cursor = function(cursor){
          db.cursor.get(cursor.id,function(err,ret){
              cursor.counter++;
              if(!ret.hasMore) {
                equal(cursor.counter,cursor.count,"retrieved " + cursor.count);
                db.collection.delete("testcursor");
                start();
              }
              else cursor.next_cursor(cursor);
          });
        }

        this.next_cursor(this);
      });
    });
  });
   
});
  