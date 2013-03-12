if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../../lib/arango',
   '../../lib/utils',
  '../lib/qunit-1.10.js'
];

define(libs,function(arango,utils){ 

module = QUnit.module;

var db = new arango.Connection({name:"testedge"});
var from, to, id, rev, data = {e:123}, doc = {a:1,b:2};

module("Edge");  
  asyncTest('create edge', function(){
    db.collection.create({type:3},function(err){
      ok(!err,"collection created");    
      db.document.create(true,data,function(err,ret){
        ok(!err,"doc1 created");
        from = ret._id;
        db.document.create(data,function(err,ret){
          ok(!err,"doc2 created");
          to = ret._id;
          db.edge.create(from,to,data,function(err,ret){
            ok(!err,"test edge created");
            id = ret._id;
            rev = ret._rev;
            db.edge.head(id,function(err,ret){
              ok(!err,"head");
              db.edge.get(id,function(err,ret){
                ok(!err,"get");
                docdata = utils.extend(data,{_id:id,_rev:rev,_from:from,_to:to});
                deepEqual(ret,docdata,"validate edge data");
                db.edge.getIfMatch(id,rev,function(err,ret){
                  ok(!err,"getIfMatch");
                  docdata = utils.extend({_id:id,_rev:rev,_from:from,_to:to},data);
                  deepEqual(ret,docdata,"validate edge data");
                  db.edge.getIfNoneMatch(id,'123456',function(err,ret){
                    ok(!err,"getIfNoneMatch");
                    docdata = utils.extend({_id:id,_rev:rev,_from:from,_to:to},data);
                    deepEqual(ret,docdata,"validate edge");
                    data.e = {a:1,b:2};
                    db.edge.put(id,data,function(err,ret){
                      ok(!err,"updating edge");
                      rev = ret._rev;    
                      db.edge.get(id,function(err,ret){
                        docdata = utils.extend(data,{_id:id,_rev:rev,_from:from,_to:to});
                        deepEqual(ret,docdata,"validate data");
                        data.e = {a:2,b:3};
                        db.edge.putIfMatch(id,rev,data,function(err,ret){
                          ok(!err,"putIfMatch");
                          rev = ret._rev;
                          data.e = {a:4,b:5};
                          db.edge.putIfNoneMatch(id,'123456',data,function(err,ret){
                            ok(!err,"putIfNoneMatch");
                            rev = ret._rev;
                            db.edge.list(from,'any',function(err,ret){
                              ok(!err,"list");
                              db.edge.delete(id,function(err,ret){
                                ok(!err,"deleted edge");
                                db.edge.get(id, function(err,ret){
                                  ok(err,"verify deleted (by get)");
                                  db.edge.head(id, function(err,ret){
                                    ok(err,"verify deleted (by head)");
                                    db.collection.delete("testedge");
                                    start();
                                  });
                                });
                              });
                            });
                          });
                        });
                      });    
                    });
                  });    
                }); 
              });
            });
          });
        });
      });       
    });  
  });
}); 
  
  /* PATCH not supported
  test('patch edge', function(done){
    var data2 = {f:1};
    db.edge.patch(id,data2,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      rev = ret._rev;
      db.edge.get(id,function(err,ret){
        var docdata = db.extend(data,data2,{_id:id,_rev:rev,_from:from,_to:to});
        assert.deepEqual(ret,docdata,"validate edge");
        done();
      });          
    });
  });
  */
  
