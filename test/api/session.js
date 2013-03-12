if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../../lib/arango',
  '../lib/qunit-1.10.js'
];

define(libs,function(arango){ 
  module = QUnit.module;
  module('Session');

  var db = new arango.Connection({name:"test"});


  /* TODO: Make all tests atomic... */

  test('set user credentials & validate hashed password',2,function(){
    var user = "test", pass = "word";
    db.config.user = user;
    db.config.pass = pass;
    equal(db.config.user,user,'validating username');
    pass = db.hashPass("word");
    equal(db.config.pass,pass,"validating hashed password");
  });
  
  /* this only passes if no password is set */
  asyncTest('attempt login with no password',1,function(){
    db.config.pass = undefined;
    db.session.login(function(err,ret){
      ok(!err,"No password");
      start();
    });
  });
 
  asyncTest('attempt login with wrong username',1,function(){
    db.config.user = "xyzrandom42";
    db.session.login(function(err,ret){
      ok(err,"wrong username");
      start();
    });
  });
 
  asyncTest('attempt successful login',5,function(){
    db.config.user = "manager";
    db.config.pass = "";
    db.session.login(function(err,ret){
      ok(!err,"login failed: " + err);
      ok(db._sid,"has session");
      ok(db._rights,"has rights");
      deepEqual(db._rights,ret.rights,"validating rights");
      equal(db._sid,ret.sid,"Validating sid");
      start();
    });
  });
  
  asyncTest('get all users',1,function(){
    db.session.users(function(err,ret){
      ok(!err,"received users");
      start();
    });
  });
 
 asyncTest('change password',1,function(){
  db.session.changePass("test",function(err,ret){
    ok(!err,"password changed");
    start();
  });
 });
 
  asyncTest('logout from session',3,function(){
    db.session.logout(function(err,ret){
      ok(!err,"logout successful");
      ok(!db._sid,"sid is unset");
      ok(!db._rights,"rights are unset");
      start();
    });
  });

  asyncTest('login with new password',5,function() {
    db.config.pass = "test";
    db.session.login(function(err,ret){
      ok(!err,"login ok");
      ok(db._sid,"has session");
      ok(db._rights,"has rights");
      deepEqual(db._rights,ret.rights,"validated rights");
      equal(db._sid,ret.sid,"Validated sid");
      start();
    });
  });

  asyncTest('change to empty password', function(){
  db.session.changePass("",function(err,ret){
    ok(!err,"Empty password");
    start();
  });
 });
  
  /* This API is not finished 
  test('create a user',function(done){
    db.session.createUser("admin","lille","lalu",function(err,ret){
      assert(!err);
      done();
    });
  });
   
  test('login with new user',function(done){
    db.config.user = "lille";
    db.config.pass = "lalu";
    
    db.session.login(function(err,ret){
      assert(!err);
      assert(db._sid,"has session");
      assert(db._rights,"has rights");
      assert.deepEqual(db._rights,ret.rights,"validating rights");
      assert.equal(db._sid,ret.sid,"Validating sid");
      done();
    });
  }); 
 */
  
});