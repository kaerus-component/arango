ArangoDB client
===============
A client for the ArangoDB nosql database.

Updates
-------
2013-02-14
* Renamed action.invoke to action submit + added support for user defined serverside snippets.

2013-01-20
* Starting to finalize the framework.
* All modules now "use strict".
* Recovered from AMD detour and reverted back to commonJS.
* Using new build facillity called <a href="https://github.com/medikoo/modules-webmake">webmaker</a> by medikoo! 
* Removed excessive collection parameters from API functions in favour of db.use('collection').
* Simplified polymorphic API function declarations by utils.Params();
* Moved query and action modules to the api section where they belong. 

2013-01-11
* Extended promises with include and spread functions, then gets a single fulfillment value.
* Embedding http headers & statusCode into response object as _headers_ & _status_.

2012-12-16
* Using home rolled Promises/A+ (https://github.com/promises-aplus/promises-spec) instead of Q.
* onFullfill can now receive multiple arguments from resolved promises, promise.resolve(result,headers,code). 

2012-12-12 
* Included the Promise framework by KrisKowal at https://github.com/kriskowal/q.
* As of ArangoDB v1.1 the session API has been scrapped so it has been removed from the client.
* Also removed support for events in favour of promises.
* Added db.use() to switch connection settings such as collection name, db.use('collection').
* Query results now yields a next() method if there is more data to be fetched. 
* Added support for ArangoDB actions through db.action.define(), db.action.invoke() 
* Changed to Apache 2.0 license

Install
-------
```
As nodejs module: npm install arango.client
From source: git clone git://github.com/kaerus/arango-client
```

Test
----
```
Open/run index.html from the test directory.
```

Building
--------
To be able to build a minified version you need to have the require.js optimizer r.js installed.
```
make dist
```
This creates a single minified javascript file in the ```dist``` directory.


Introduction
============
You can use arango-client either as node.js server module or from a web client.
Since arango-client is written in AMD compatible fashion you should be able 
to require it in your project using any standard AMD loader.
However, require.js is included by default when installing through npm.


Require
-------
To use the client in nodejs you require it.
```javascript
var arango = require('arango.client')
``` 

For usage in a web browser you probably want to use the compressed file dist/arango.js.gz (9KB).
Then load the client using an AMD compatible loader, such as require.js.
A minimal html page accessing ArangoDB from the web client can look like this.
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Cache-control" content="no-cache">
  <title>ArangoDB</title>
</head>

<body>
  <h1>Arango-Client</h1>
  <div></div>
    <script data-main="app" src="require.js"></script>
</body>
```

And then create an app.js that looks like this.
```javascript
define(['arango'],function(arango){
      var e = document.getElementsByTagName("div")[0];

	  var db = new arango.Connection("http://localhost:8529");
      
      /* list all collections */
      db.collection.list().then(function(res){

        e.innerHTML = "Result: " + JSON.stringify(res);
      }, function(err){
        e.innerHTML = "Error: " + JSON.stringify(err);
      });
    
}); 
```
Note: The above example assumes you are requiring the non compressed file found in dist/arango.js.
 

Usage
-----
The api methods always return a promise but they also take a callback function.

Example using a callback:
```javascript
db.document.get(docid,function(err,res){
  if(err) console.log("err(%s):", err, res);
  else console.log("result: ", JSON.stringify(res));
});
```

Example using a promise:
```javascript
db.document.get(docid)
  .then(function(res){ console.log("Result:", res) },
    function(err){ console.log("error:", err) } );
```

 
Initialization
--------------
To initialize a connection you have to use the ```Connection([string],[object])``` constructor.
```javascript
/* use default settings, connects to http://127.0.0.1:8529 in nodejs */
/* or window.location when using from your browser */
db = new arango.Connection

/* connection string */
db = new arango.Connection("http://127.0.0.1/test");

/* connection with http auth */
db = new arango.Connection("http://user:pass@your.host.com/database");

/* connection object */
db = new arango.Connection({name:"database", user:"master"});

/* mixed mode */
db = new arango.Connection("http://test.host.com:80/default",{user:uname,pass:pwd});

/* with use() you can switch connection settings */
db.use("http://new.server/collection")

/* use another collection */
db.use("another");

/* db.server dumps server configuration */
db.server

```

Creating collections & documents
-------------------------------
```javascript
/* Create a 'test' collection */
db.use("test").collection.create(function(err,ret){
  console.log("error(%s): ", err, ret);
});

/* create a new document in 'test' collection */
db.document.create({a:'test',b:123,c:Date()})
  .then(function(res){ console.log(res); },
    function(err){ console.log("error(%s): ", err) }
);  

/* get a list of all documents */
db.use("collection123")
  .document.list()
  .then(function(res){ console.log(res) },
    function(err){ console.log("error", err) } );
 
/* create a new document and create a new */
/* collection by passing true as first argument */
db.document.create(true,"newcollection",{a:"test"})
  .then(function(res){ console.log("res", JSON.stringify(res) },
    function(err){ console.log("err", err) } );
});

/* create another document in the collection */
db.document.create("newcollection",{b:"test"})
  .then(function(res){ console.log("res", JSON.stringify(res) },
    function(err){ console.log("err", err) } );
});


/* chain requests */
db.collection.list()
  .then(function(cols){
    /* get a list of all documents */
    /* from the first collection.  */ 
    return db.document.list(cols[0].name);
}).then(function(docs){
    console.log("documents:", docs);
});

```



Queries
-------
```javascript
/* simple query string */
db.query.exec("FOR u in test RETURN u",function(err,ret){
  console.log("err(%s):", err, ret);
});

/* A bindvar for the collection name */
db.query.string = "FOR u IN @@collection RETURN u";
...
/* execute the query and pass the collection variable */
db.query.exec({'@collection':"test"},function(err,ret){
  console.log("err(%s):",util.inspect(ret));
});
```
Note: ArangoDB expects @@ in front of collection names when using a bindvar.
The bindvar attribute in this case needs to be prefixed with a single @. 
In all other cases the bindvar atttribute can be provided without any prefix 
and the variable in the query string is denoted with a single @ . 



Query builder
-------------
Result batch size can be set using the ```query.count(<number>)``` method.
In case of partial results the next batch can be retrieved with res.next().
```javascript
/* using the query builder */
query = db.query.for('u').in('users')
          .filter('u.contact.address.state == @state')
          .collect('region = u.contact.region').into('group')
          .sort('LENGTH(group) DESC').limit('0, 5')
          .return('{"region": region, "count": LENGTH(group)}');


/* show the composed query string */
console.log("Arango query:", query.string);
                
/* test run the query */
query.test(function(err,ret){
  console.log("err(%s):",err,ret);
});

/* execute the query and set the variable 'state' */
query.exec({state: "CA"})
  .then(function(res){ console.log("res",res) },
    function(err){ console.log("err",err) });


/* detailed query explanation */
query.explain({state:"CA"},function(err,ret){
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
  .return('{"what": what, "count": LENGTH(group)}');

query.exec({gender:"female",likes:"running"}).then(function(res){
  console.log("result:",res);
},function(err){
  console.llg("error:", err);
});

/* limit the result set to 1 item each iteration */
query.count(1).exec({gender:"female",likes:"running"}).then(do_something);

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
db.action.submit("someAction",data,function(err,ret){
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
},true); 

db.action.submit("hello").then(function(res){
  console.log("Server says:", res);
},function(error){
  console.log("Error:", error);
});



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
 