[![Build Status](https://travis-ci.org/kaerus-component/arango.png)](https://travis-ci.org/kaerus-component/arango)

ArangoDB client
===============
A client for the ArangoDB nosql database for nodejs and browsers.

NOTE: The official ArangoDB JavaScript driver now lives @ https://github.com/arangodb/arangojs. 

### Latest changes
The Query API returns result from Aql cursors unfiltered.
Before you only got the result Array missing some 'extra' information.
```
db.query
  .for('u').in('_users').return('u')
  .exec()
  .then(function(ret){
    console.log("ret.result", ret.result); // array with results
    console.log("ret.extra", ret.extra); // extra information
  });
```


A ```callback``` method has been added that can be used instead of a callback passed as argument.
```
x = db.database.create("newdb")
  .callback(function(err,ret){
    ... same as above ...  
  });

// x => Promise

```

You may however still pass a callback to the API methods in which case promises are bypassed so you achieve a little less overhead in your db.api calls.
```
var x = db.collection.list(function(err,ret){
  console.log("err(%s):",err,ret);
});

// x => undefined 
```


Introduction
============
You can use arango-client either as node.js server module or from a web client.
Since arango-client is written as a commonJS module you can just require it in your nodejs project or using the generated build file which you can include into your client side app.


Install
-------
```
From source: `git clone git://github.com/triAGENS/ArangoDB-JavaScript`
web component: `component install triAGENS/ArangoDB-JavaScript`
nodejs module: `npm install arangojs`

```

Building
--------
```
make build
```
Creates a single build.js component in the ```./build``` directory.
A standalone is built separately and named arango.js.

Documentation
--------
```
make docs
```
Generates the documentation in the documentation folder. An installation of yuidocjs is required (npm i -g yuidocjs).
You can visit the latest documentation on http://www.arangodb.org/manuals-javascript/master/.

Test
----
```
make test
```
Runs the test suite sequentially under nodejs and karma (supporting Firefox and Chrome).
Feel free to chip in by writing tests if you want a more stable package.


Quick start
===========
To use the client you require it at a commonJS module.
```javascript
var arango = require('arango');
``` 

Then you initialize a connection which returns a db handle.
```javascript
var db = arango.Connection("http://myarangodb.server.com:8529");

db.collection.list().done(function(res){
  console.log("collections: %j", res);
});
```

In a browser
------------
For usage in a web browser you can either use the standalone version arango.js or the build.js component.
A minimal html page using the arangodb client from a web app can look like this.
```html
<!doctype html>
<html>
<head>
    <title>ArangoDB in your browser</title>
    <meta charset="utf-8"/>
</head>
<body>
    <div id="test"></div>
    <script src="../build/build.js"></script>
    <script>
        var arango = require('arango'),
            elem = document.getElementById('test'),
            db = new arango.Connection;

        db.collection.list().then(function(res){
            elem.innerHTML = JSON.stringify(res,null,2);
        }, function(error){
            elem.innerHTML = JSON.stringify(error,null,2);
        })        
    </script>
</body>
</html>
```

The standalone version yields a global ```arango``` object.
```html
<!doctype html>
<html>
<head>
    <title>ArangoDB in your browser</title>
    <meta charset="utf-8"/>
</head>
<body>
    <div id="test"></div>
    <!-- Note: Exports global arango -->
    <script src="../build/arango.js"></script>
    <script>
        var elem = document.getElementById('test'),
            db = new arango.Connection;

        db.collection.list().then(function(res){
            elem.innerHTML = JSON.stringify(res,null,2);
        }, function(error){
            elem.innerHTML = JSON.stringify(error,null,2);
        })        
    </script>
</body>
</html>
```

 

API
===
The following API:s are (more or less) supported, check out the ArangoDB [documentation](http://www.arangodb.org/manuals/current/).
  
  * [transaction](http://www.arangodb.org/manuals/current/HttpTransactions.html)
  * [collection](http://www.arangodb.org/manuals/current/HttpCollection.html)
  * [database](http://www.arangodb.org/manuals/current/HttpDatabase.html)
  * [document](http://www.arangodb.org/manuals/current/RestDocument.html)
  * [action](http://www.arangodb.org/manuals/current/UserManualActions.html)
  * [cursor](http://www.arangodb.org/manuals/current/HttpCursor.html)
  * [simple](http://www.arangodb.org/manuals/current/HttpSimple.html)
  * [index](http://www.arangodb.org/manuals/current/HttpIndex.html)
  * [admin](http://www.arangodb.org/manuals/current/HttpSystem.html)
  * [aqlfunction](https://www.arangodb.org/manuals/current/HttpAqlFunctions.html)
  * [batch](https://www.arangodb.org/manuals/current/HttpBatch.html)
  * [query](http://www.arangodb.org/manuals/current/HttpQuery.html)
  * [graph](http://www.arangodb.org/manuals/current/HttpGraph.html)
  * [batch](http://www.arangodb.org/manuals/current/HttpBatch.html)
  * [edge](http://www.arangodb.org/manuals/current/RestEdge.html)
  * [user](http://www.arangodb.org/manuals/current/HttpUser.html)


The API methods return a [promise](https://github.com/kaerus-component/uP). If you like nodejs callbacks you can use the callback utility provided by the micropromise framework.

Example using a promise:
```javascript
db.document.get(docid).then(function(res){ 
  console.log("res: %j", res) 
},function(err){ 
  console.log("err: %j", err) 
});
```

Example when using a callback:
```javascript
db.document.get(docid)
  .callback(function(err,res){
    if(err) console.log("err: %j", res);
    else console.log("res: %j", res);
  });
```

 
Usage
=====

Connect()
---------
Factory for arango connection.
Sets up a connection to localhost ```http://127.0.0.1:8529``` by default.
```js
  db = arango.Connection()
```

Connection string
```js
  db = arango.Connection("http://127.0.0.1/mydb:collection");
```

Connection with http auth
```js
  db = arango.Connection("http://user:pass@your.host.com/database");
```

Connection object
```
  db = arango.Connection({_name:"database",_collection:"collection",_server:{hostname:"test.host"}});
```

Connecting to a unix socket (nodejs only)
```
  db = arango.Connection({_server:{socketPath:"/var/tmp/arango.sock"}});
```

String and object
```js
  db = arango.Connection("http://test.host.com:80/default",{_server:{username:"user",password:"pass"}});
```

String and api plugin
```javascript
  db = arango.Connection("http://test.host.com:80/foxx",{api:{'foxx':require('foxx')}});
```

use()
-----
With use() you can switch connection settings
```js
  var test = db.use("http://test.host:8520")
```

Use another database
```js
  var test_mydb = test.use("/mydb");
```

Change to another database & collection
```js
  var test_mydb2_mail = test_mydb.use("/mydb2:mail");
```

Change collection
```js
  var test_mydb2__users = test_mydb2_mail.use(":_users");
```

Creating collections & documents
-------------------------------
Initialize a Connection
```js
var db = arango.Connection('http://127.0.0.1:8529');
```

Create a new database
```js
db.database.create('mydb').then(function(res){
  console.log("Database created: %j", res);
},function(err){
  console.log("Failed to create database: %j", err);
})
```

Use mydb database
```js
var mydb = db.use('/mydb');
```

Create a 'test' collection
```js
mydb.collection.create('test').then(function(res){
  console.log("result: %j",res);
},function(err){
  console.log("error: %j",err);
});
```

List all collections in mydb, note the use of [done()](https://github.com/kaerus-component/uP#done)
```js
mydb.collection.list().done(function(res){
  console.log("collections: %j", res);
});
```

Create a collection with options
```js
mydb.collection.create('mycoll',{
  journalSize: 10000000,
  waitForSync:true,
  keyOptions: { 
    type: "autoincrement", 
    increment: 5, 
    allowUserKeys: true 
  }
}).then(function(res){
  console.log("result: %j",res);
},function(err){
  console.log("error: %j",err);
});
```

Delete collection (using callback)
```js
mydb.collection.delete('mycoll').callback(function(err,ret){
  console.log("error(%s): %j", err, ret);
});
```

Create a 'test2' collection (using callback)
```js
mydb.collection.create('test2').callback(function(err,ret){
  console.log("error(%s): %j", err, ret);
});
```

Create a new document in 'test' collection 
```js
mydb.document.create('test',{a:'test',b:123,c:Date()})
  .then(function(res){ 
    console.log("res: %j", res); 
  },function(err){ 
    console.log("err: %j", err); 
  });  
```

Get a list of all documents in 'test' collection
```js
mydb.document.list('test')
  .then(function(res){ 
    console.log("res: %j", res); 
  },function(err){ 
    console.log("err: %j", err); 
  });
```

Create a new document and create a new collection by passing in options
```js
mydb.document.create("newcollection",{a:"test"},{createCollection:true})
  .then(function(res){ console.log("res", JSON.stringify(res) },
    function(err){ console.log("err", err) } );
});
```

Create document and wait for disk sync
```js
mydb.document.create("newcollection",{a:"test"},{waitForSync:true})
  .then(function(res){ console.log("res", JSON.stringify(res) },
    function(err){ console.log("err", err) } );
});
```

Create another document in the collection
```js
db.document.create("newcollection",{b:"test"})
  .then(function(res){ console.log("res", JSON.stringify(res) },
    function(err){ console.log("err", err) } );
});
```

Joining
--------
```js
  db.admin.version()
    .join(db.admin.time())
    .spread(function(v,t){ 
    console.log(v.server,v.version,t.time);
  });
```

Calling API methods directly
----------------------------
You may also request any arangodb API method by using ```db[METHOD]()```.
This is particulary useful when you create your own REST API in ArangoDB.

```js
  db.post("/myapi/object/create",{a:1,b:2}).done(function(res){
    console.log("result from API call: %j", res);
  });
```
Methods supported are: get(), put(), post(), delete(), options(), head(), patch().



Queries
-------
```javascript
/* using a query string */
db.query.exec("FOR u in test RETURN u").callback(function(err,ret){
  console.log("err(%s):", err, ret);
});

...
/* query string with a bindVar */
db.query.exec("FOR u in @@collection return u",{'@collection':"_users"})
  .callback(function(err,ret){
    console.log("err(%s):",util.inspect(ret));
});

```
Note: ArangoDB expects @@ in front of collection names when using a bindvar.
The bindvar attribute in this case needs to be prefixed with a single @. 
In all other cases the bindvar attribute can be provided without any prefix 
and the variable in the query string is denoted with a single @ . 



Query builder
-------------
Result batch size can be set using the ```query.count(<number>)``` method.
In case of partial results the next batch can be retrieved with res.next().
```javascript
/* using the query builder and a bindVar */
db.query.for('u').in('users')
  .filter('u.contact.address.state == @state')
  .collect('region = u.contact.region').into('group')
  .sort('LENGTH(group) DESC').limit('0, 5')
  .return('{"region": region, "count": LENGTH(group)}')
  .exec({state:"CA"})
  .done(function(res){
     console.log("res",res)
  });

             
/* test run a query */
db.query
  .for('u').in('_users').return('u')
  .exec()
  .callback(function(err,ret){
     console.log("err(%s):",err,ret);
  });


/* detailed query explanation */
db.query.explain("for u in _users return u")
  .callback(function(err,ret){
     console.log("err(%s):",err,ret);
  });

/* nested queries embedded as functions(){} */
query = db.query.for('likes').in(function() {
    this.for('u').in('users')
    .filter('u.gender == @gender && @likes')
    .from('u.likes').include(function() {
      this.from('value').in('u.likes')
      .filter('value != @likes')
      .return('value');
    });
  }).collect('what = likes').into('group')
  .sort('LENGTH(group) DESC')
  .limit('0, 5')
  .return('{"what": what, "count": LENGTH(group)}')
  .exec({gender:"female",likes:"running"})
  .callback(function(err,ret){
     console.log("err(%s):",err,ret);
  });

/* limit the result set to 1 item each iteration */
query.count(1).exec({gender:"female",likes:"running"})
  .then(function(ret){
    /* do something */
    /* fetch next item */
    return query.next();
  }).then(function(ret){
    /* do something */
  });


```
Actions
-------
ArangoDB supports user defined actions that can be used for implementing business logic or creating complex queries serverside.

To invoke an action you first need to define it.
```javascript
/* define an action */
db.action.define(
    {
      name: 'someAction',
      url: 'http://127.0.0.1:8530/test'
      method: 'post',
      result: function(res){ console.log("res:", res ) },
      error: function(err){ console.log("err:", err) }   
    }
);

/* submit the action */
var data = {test:"data"}
db.action.submit("someAction",data);

/* submit using a callback */
db.action.submit("someAction",data).callback(function(err,ret){
  console.log("err(%s):", err, ret); 
}); 

/* Define an action that injects code serverside.*/
/* the last argument reloads the routes, or use  */
/* db.admin.routesReload() to reload the routes. */  
db.action.define({name:"hello",url:"/hello"},function(req,res){
  /* Note: this code runs in the ArangoDB */
  res.statusCode = 200;
  res.contentType = "text/html";
  res.body = "Hello World!";
},true).done(function(ret){
  console.log("Action %s defined",ret);
}); 

db.action.submit("hello").then(function(res){
  console.log("Server says:", res);
},function(error){
  console.log("Error:", error);
});
```


Transactions
------------
Transactions are sent to arangodb using ```transaction.submit(collections,action,params,options,callback)```.
`collections` defines read/write access to collections used within the transaction.
`action` is a serverside handler for the transaction.
`options` can be used for adding parameters etc

```javascript
  
  db.collection.create("accounts").join([
    db.document.create("accounts",{ _key: "john", amount: 423 }),
    db.document.create("accounts",{ _key: "fred", amount: 9 })
  ]).spread(function(collection,john,fred){
    console.log("john:", JSON.stringify(john));
    console.log("fred:", JSON.stringify(fred));
    
      return [{
        /* collections affected by this transaction */
        write: collection.name
      },
      function (params) {
        /* note: this code runs in arangodb */
        var db = require("internal").db;
        var account1 = db.accounts.document(params['user1']);
        var account2 = db.accounts.document(params['user2']);
        var amount = params['amount'];

        if (account1.amount < amount) {
          throw "account of user '" + params['user1'] + "' does not have enough money!";
        }

        db.accounts.update(account1, { amount : account1.amount - amount });
        db.accounts.update(account2, { amount : account2.amount + amount });

        /* commit the transaction */
        return true; 
      },
      {
        /* options passed to the transaction handler */
        params: {
          user1: "fred",
          user2: "john", 
          amount: 10
	 }
      }];
      /* submit the transaction */
  }).spread(db.transaction.submit).then(function(ret){
      console.log("Transaction success:", JSON.stringify(ret));
    },function(error){
      console.log("Transaction failed:", JSON.stringify(error));
    }
  );

```


Batch jobs
----------
The BatchAPI allows you to bundle database requests.

Use ```db.batch.start()```to initialize a batch job and ```db.batch.exec()``` to execute jobs. 
```javascript
  // start a batch
  db.batch.start();
  
  // collect admin information  
  db.admin.version();
  db.admin.statistics();
  db.admin.log('info');
  db.admin.time();

  // execute batch
  db.batch.exec().spread(function(batch,version,statistics,log,time){
    console.log("Batch jobs requested=%s, returned results=%s", batch.jobs, batch.length);
    console.log("Version:", JSON.stringify(version,null,2));
    console.log("Statistics:", JSON.stringify(statistics,null,2));
    console.log("Log:", JSON.stringify(log,null,2));
    console.log("Time:", JSON.stringify(time,null,2));
  },function(error){
    console.log("Batch job failed: %j", error);
  });
```

Individual job results can be fetched as usual.
```javascript
  // start a batch
  db.batch.start();
  
  // collect admin information  
  db.admin.version().then(function(version){
    console.log("Version:", JSON.stringify(version,null,2));
  });

  db.admin.statistics().then(function(statistics){
    console.log("Statistics:", JSON.stringify(statistics,null,2));
  });

  // using callback
  db.admin.log('info').callback(function(err,ret){
    if(!err){
      console.log("Log:", JSON.stringify(ret,null,2));
    } 
  });
  
  db.admin.time().callback(function(err,ret){
    if(!err) console.log("Time:", new Date(Math.floor(ret.time*1000)));
  });

  // execute batch
  db.batch.exec().then(undefined,function(error){
    console.log("Batch job failed: %j", error);
  });  
 
```


api
----
An API can be implemented like this.
```javascript

function StubAPI(db) {
    return {
      "get": function(){
          return db.get('/path' /*,headers */);
      },
      "post": function(data){
          return db.post('/path',data /*,headers*/);
      },
      "put": function(data){
          return db.put('/path',data /*,headers*/);
      },
      "delete": function(){
          return db.delete('/path' /*,headers*/);
      },
      "head": function(){
          return db.head('/path' /*,headers*/);
      },
      "patch": function(data){
          return db.path('/path',data /*,headers*/);
      },
      "options": function(){
          return db.options('/path' /*,headers*/);
      }
    };
}

/* Attach the API into 'stub' namespace */
exports.stub = StubAPI;
```

To attach your API into the db instances you use the ```Arango.api``` class method.
```
/* attach to db instances */
Arango.api(require('myAPI'));
var db = new Arango.Connection;
/* call API method */
db.stub.get();
```

License
=======
```
Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 
