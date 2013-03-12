if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../../lib/arango',
  '../lib/qunit-1.10.js'
];

define(libs,function(arango){ 

module = QUnit.module;

var db = new arango.Connection;

module("Collection");  

asyncTest('create',2,function(){
    db.collection.create("testcreate",function(err,ret){
      ok(!err,"created");
      equal(ret.name,"testcreate","name validated");
      db.collection.delete("testcreate");
      start();
    });
});

asyncTest('delete',3,function(){
  db.collection.create("testdelete",function(err,ret){
    ok(!err,"created");
    this.id = ret.id;
    db.collection.delete(ret.id,function(err,ret){
      ok(!err,"Deleted");
      equal(ret.id,this.id,"deleted id validated");
      start();
    });
  });    
});


asyncTest('get by name & id',5,function(){
  db.collection.create("testget",function(create){
    ok(!create,"created");
    db.collection.get("testget",function(err,ret){
      ok(!err,"get by name");
      ok(ret.id,"have id");
      id = ret.id;
      db.collection.get(id,function(err,ret){
        ok(!err,"get by id");
        equal(ret.name,"testget","name validated");
        db.collection.delete("testget");
        start();
      });
    });
  });    
});

asyncTest('figures & count',3,function(){
  db.collection.create("testfigures",function(create){
    ok(!create,"created");
    db.collection.figures("testfigures",function(err,ret){
      ok(!err,"figures");
      db.collection.count("testfigures",function(err,ret){
        ok(!err,"count");
        db.collection.delete("testfigures");
        start();
      });
    });
  });  
});

asyncTest('list',1,function(){
  db.collection.list(function(list){
    ok(!list,"list");
    start();
  });
});


asyncTest('get & set properties',5,function(){
  db.collection.create("testprop",function(create){
    ok(!create,"created");
    db.collection.getProperties("testprop",function(err,p){
      ok(!err,"get properties");
      var sync = !(p.waitForSync), size = p.journalSize * 10;
      db.collection.setProperties("testprop",{waitForSync: sync,journalSize:size},function(err,ret){
        ok(!err,"set properties");
        equal(ret.waitForSync,sync,"waitForSync changed");
        equal(ret.journalSize,size,"journalSize changed");
        db.collection.delete("testprop");
        start();
      });
    });
  });   
});

asyncTest('unload & load',6,function(){
  db.collection.create("testload").then(function(ret){
    ok(1,"created");
    equal(ret.status,3,"status 3");
    return db.collection.load("testload");
  }).then(function(ret) {
    ok(1,"loaded");
    id = ret.id;
    equal(ret.status,3,"status 3");
    return db.collection.unload(id);
  }).then(function(ret) {
    ok(1,"unloaded");
    /* status is sometimes 2 ? */
    equal(ret.status,4,"status 4");
    return db.collection.delete("testload");
  }).then(function() {  
    start();
  },function(err){
    ok(false,err.message);
    start();
  });
});

asyncTest('rename',4,function(){
  db.collection.create("rename",function(err,ret){
    ok(!err,"created");
    ok(ret.id,"have id");
    db.collection.rename(ret.id,"rename2",function(err,ret){
      ok(!err,"renamed");
      equal(ret.name,"rename2","name validated");
      db.collection.delete(ret.id);
      start();
    });
  });
});

});  
  
  