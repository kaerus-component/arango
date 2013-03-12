if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../../lib/arango',
  '../lib/qunit-1.10.js'
];

QUnit.config.autostart = false;

define(libs,function(arango){ 

module = QUnit.module;

var db = new arango.Connection({name:"testkey"}),
    key, id, 
    options = {}, 
    data = "this is a test",
    extend = {a:1,b:2}, date = new Date();
QUnit.start();

module("Key",{
  setup: function(){
    QUnit.stop();
    db.collection.create("testkey",function(){
      QUnit.start();
    });
  },
  teardown: function(){
    db.collection.delete("testkey");
  }
});  

asyncTest('create, get, update & verify',12,function(){
    key = "testkey";
    date.setDate(date.getDate()+1);
    date.setMilliseconds(0);  // Note: adb truncates millisecs
    options.expires = date;
    options.extended = extend; 

    db.key.create(key,options,data).then(function(ret){
      ok(1,"created key");
      id = ret._id; // ? 

      return db.key.get(key);
  }).then(function(ret,hdr) {
    ok(1,"got key value");
    var d = new Date(Date.parse(hdr['x-voc-expires'].toUpperCase()));
    equal(d.toISOString(), date.toISOString(),"validate expiration");
    deepEqual(JSON.parse(hdr['x-voc-extended']), extend,"validate extended");
    equal(ret,data,"validate data"); 
    options.extend = {b:3,c:1};
    data = "we have updated the data";

    return db.key.put(key,options,data);
  }).then(function(ret) {    
    ok(1,"updated key value using put");
    ok(ret.changed,"validate changed");

    return db.key.get(key);
  }).then(function(ret,hdr) {  
    ok(1,"refreshed key value by get");
    var d = new Date(Date.parse(hdr['x-voc-expires'].toUpperCase()));
    equal(d.toISOString(), date.toISOString(),"validate expiration");
    deepEqual(JSON.parse(hdr['x-voc-extended']),extend,"validate extended");
    equal(ret,data,"validate data");       

    return db.key.delete(key);
  }).then(function(ret) {
    ok(1,"deleted key");
    start();
  },function(err){
    ok(false,err.message);
    start();
  }); 
});     
  
});  