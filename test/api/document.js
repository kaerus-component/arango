if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../../lib/arango',
   '../../lib/utils',
  '../lib/qunit-1.10.js'
];

define(libs,function(arango,utils){ 

module = QUnit.module;

var db = new arango.Connection({name:'testimplicit'})
  , data = {somedata:"test1",somemore:"test2"};

module("Document");
  
asyncTest('create & get with implicit collection',5, function(){
  db.collection.create('testimplicit',function(create){
    ok(!create,"collection");
    db.document.create(data,function(err,ret){
      ok(!err,"created");
      this.id = ret._id;
      ok(ret._id,"has document id");
      this.rev = ret._rev;
      db.document.get(this.id,function(err,doc){
        ok(!err,"retrieved");
        this.docdata = utils.extend({_id:this.id,_rev:this.rev},data);
        deepEqual(this.docdata,doc,"validated data");
        db.collection.delete("testimplicit");
        start();
      });
    });
  });  
});

asyncTest('create & get & delete with explicit collection',7, function(){
  db.collection.create('testexplicit',function(create){
    ok(!create,"collection");
    db.document.create("testexplicit",data,function(err,ret){
      ok(!err,"created");
      this.id = ret._id;
      this.rev = ret._rev;
      db.document.get(ret._id,function(err,doc){
        ok(!err,"retrieved");
        this.docdata = utils.extend({_id:this.id,_rev:this.rev},data);
        deepEqual(this.docdata,doc,"validated data");
        db.document.delete(id,function(deleted,ret){
          ok(!deleted,"Deleted");
          equal(ret._id,this.id,"validated id");
          equal(ret._rev,this.rev,"validated rev");
          db.collection.delete("testexplicit");
          start();
        });  
      });
    });  
  });
});

asyncTest('create & get & update and create collection on demand',8, function(){
  db.document.create(true, "testdemand",data,function(err,ret){
    ok(!err,"created");
    this.id = ret._id; 
    this.rev = ret._rev;
    db.document.get(ret._id,function(err,doc){
      this.docdata = utils.extend({_id:this.id,_rev:this.rev},data);
      ok(!err,"retrieved");
      deepEqual(this.docdata,doc,"validated data");
      this.moredata = utils.extend(data,{more:"some extra"});
      db.document.put(this.id,this.moredata,function(update,ret){
        ok(!update,"updated");
        equal(this.id,ret._id,"id validated");
        notEqual(this.rev,ret._rev,"new revision");
        this.rev = ret._rev;
        db.document.get(this.id,function(get,doc){
          ok(!get,"retrieved");
          this.docdata =  utils.extend({_id:this.id,_rev:this.rev},this.moredata);
          deepEqual(this.docdata,doc,"validated data");
          db.collection.delete("testdemand");
          start();   
        });
      }); 
    });
  });
});

/* TODO: Add tests for: head, list, patch, getIfMatched, getIfNoneMatch... */
  
  /* PATCH method is not supported
  test('get and patch document', function(done) {
    db.document.get(id,function(err,doc){
        assert(!err);
        var patchdata = {patched:"xxx"};
        db.document.patch(id,patchdata,function(err,ret){
          assert(!err,util.inspect(ret));
          assert(true,"todo: verify patched data");
          done();
        });
    });
  });
  */

});