/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

var utils = require('../utils');

function closure(db) {
    "use strict"
     
    var path = "/_api/graph/";

    function htmlOptions(options,o,keep){
    	if(options._waitForSync) o.waitForSync = true;
    	if(keep && !options._keepNull) o.keepNull = false; 

        return Object.keys(o)
        	.filter(function(k){return o[k] !== undefined})
        	.reduce(function(a,b,c){
                c = b + '=' + o[b];
                return !a ? '?' + c : a + '&' + c;
         	},'');
    }

    var GraphAPI = {
        "create": function(graph,vertices,edges,callback){
        	var data = {_key:graph,vertices:vertices,edges:edges};
        	
        	return db.post(path,data,callback);
        },
        "get": function(graph,rev,callback){
        	if(typeof rev !== 'string'){
        		callback = rev;
        		rev = '';
        	}
        	
        	var opts = htmlOptions(this,{rev:rev});

        	return db.get(path+graph+opts,callback);
        },
        "delete": function(graph,rev,callback){
        	if(typeof rev !== 'string'){
        		callback = rev;
        		rev = '';
        	}
  	
        	var opts = htmlOptions(this,{rev:rev});
   
        	return db.get(path+graph+opts,callback);
        },
        "vertex": {
        	"create": function(graph,vertex,options,callback){
	        	if(typeof options !== 'object'){
	        		callback = options;
	        		options = {};
	        	}

	        	var data = utils.extend({_key:vertex},options);

	        	return db.post(path+graph+'/vertex',data,callback);
	        },
	        "get": function(graph,vertex,rev,callback){
	        	if(typeof rev !== 'string'){
	        		callback = rev;
	        		rev = '';
	        	}

	        	var opts = htmlOptions(this,{rev:rev});

	        	return db.get(path+graph+'/vertex/'+vertex+opts,callback);
	        },
	        "put": function(graph,vertex,options,rev,callback){
	        	if(typeof rev !== 'string'){
        			callback = rev;
        			rev = '';
        		}

        		var opts = htmlOptions(this,{rev:rev});

        		return db.put(path+graph+'/vertex/'+vertex+opts,options,callback);
	        },
	        "patch": function(graph,vertex,options,rev,callback){
	        	if(typeof rev !== 'string'){
        			callback = rev;
        			rev = '';
        		}

        		var opts = htmlOptions(this,{rev:rev},true);

        		return db.patch(path+graph+'/vertex/'+vertex+opts,options,callback);
	        },
	        "delete": function(graph,vertex,rev,callback){
	        	if(typeof rev !== 'string'){
	        		callback = rev;
	        		rev = '';
	        	}
	        	
	        	var opts = htmlOptions(this,{rev:rev});

	        	return db.delete(path+graph+'/vertex/'+vertex+opts,callback);
	        }
	    },
	    "edge": {
	    	"create": function(graph,edge,from,to,options,callback){
	    		if(options !== 'object'){
	    			callback = options;
	    			options = {};
	    		}
	    		var data = utils.extend({_key:edge,_from:from,_to:to},options);
	    		
	    		return db.post(path+graph+'/edge',data,callback);
	    	},
	    	"get": function(graph,edge,rev,callback){
	    		if(typeof rev !== 'string'){
	        		callback = rev;
	        		rev = '';
	        	}
	        	
	        	var opts = htmlOptions(this,{rev:rev});

	    		return db.get(path+graph+'/edge/'+edge+opts,callback)
	    	},
	    	"put": function(graph,edge,options,rev,callback){
	    		if(typeof rev !== 'string'){
	        		callback = rev;
	        		rev = '';
	        	}
	        	
	        	var opts = htmlOptions(this,{rev:rev});

	        	return db.put(path+graph+'/edge/'+edge+opts,options,callback);	
	    	},
	    	"patch": function(graph,edge,options,rev,callback){
	    		if(typeof rev !== 'string'){
	        		callback = rev;
	        		rev = '';
	        	}
	        	
	        	var opts = htmlOptions(this,{rev:rev},true);
	        	
	        	return db.patch(path+graph+'/edge/'+edge+opts,options,callback);
	        },
	        "delete": function(graph,edge,rev,callback){
	        	if(typeof rev !== 'string'){
	        		callback = rev;
	        		rev = '';
	        	}
	        	
	        	var opts = htmlOptions(this,{rev:rev});

	        	return db.delete(path+graph+'/edge/'+edge+opts,callback);
	        }
	    },
	    "vertices": function(graph,vertex,options,callback){
	    	return db.post(path+graph+'/vertices/'+vertex,options,callback);
	    },
	    "edges": function(graph,edge,options,callback){
	    	return db.post(path+graph+'/edges/'+edge,options,callback);
	    },
	    "keepNull": function(val) {
            this._keepNull = !!val;
            return this;
        },
        "waitForSync": function(val) {
            this._waitForSync = !!val;
            return this;
        }

    };

    return GraphAPI;
}

module.exports = closure;