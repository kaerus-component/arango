/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

function closure(db){
    "use strict"
    
    var utils = require('../utils');

      
    function Aql(){
        var keywords = ['for','in','filter','from','include','collect','into','sort','limit','let','return'],
            aql = this;
     
        keywords.forEach(function(key) {
            aql[key] = function() {
                if(!aql.struct) aql.struct = {};
                if(!arguments.length) return aql.struct[key];
                var args = Array.prototype.slice.call(arguments);
                if(typeof args[0] === 'function') {
                    aql.struct[key] = (function(func) {
                        var faql = new Aql();
                        func.apply(faql);

                        return faql.struct;
                    })(args[0]);
                } else if( args[0] instanceof Aql) {
                    aql.struct[key] = args[0].struct;
                } else {
                    if(key === 'filter' || key === 'let') {
                        if(!aql.struct[key]) aql.struct[key] = [];
                        aql.struct[key].push(args.join(' '));
                    } else aql.struct[key] = args.join(' ');   
                }

                return aql;
            }
        });
        
        function structToString(s) {
            var struct = s || aql.struct;
            return keywords.filter(function(key) {
                return struct[key] ? true : false;
            }).map(function(q) {
                var keyword = q.toUpperCase(), value = struct[q];
                switch(keyword) {
                    case 'FROM': keyword = 'IN'; break;
                    case 'INCLUDE': keyword = ''; break;
                    case 'FILTER': value = value.join(' && '); break;
                    case 'LET': value = value.join(' LET '); break;
                    default: break;
                }   
                if(typeof value === 'object') { 
                    var nested = structToString(value);
                    if( q === 'in' ) 
                        return keyword + ' ( ' +  nested + ' )';
                    else 
                        return keyword + ' ' + nested;
                } else return keyword + ' ' + value;
            }).join(' ');
        }

        aql.toString = structToString;
    }


    function QueryAPI(){
        this.options = {};

        var query = this;

        Aql.call(this);

        /* transforms struct to string */
        Object.defineProperty(query,"query",{
            string: null,
            get: function() {
                if(query.struct) {
                    this.string = query.toString();
                    delete query.struct;
                }

                return this.string;
            },
            set: function(val) {
                this.string = val;
                delete query.struct;

                return this.string;
            }
        });
    }

    utils.inherit(QueryAPI,Aql);

    function exec_query(query,method,args) {
        var q = {}, i = 0, a = Array.prototype.slice.call(args);

        utils.extend(true, q, query.options);

        /* use Aql object */
        if(a[i] instanceof Aql)
            q.query = a[i++].toString();
        /* use query string */
        else if(typeof a[i] === 'string')
            q.query = a[i++];
        else
            q.query = query.query;

        /* merge with object */
        if(typeof a[i] === 'object') {
            if(a[i].hasOwnProperty('bindVars'))
                utils.extend(true, q, a[i++])
            else q.bindVars = a[i++];
        }  

        return db.cursor[method](q,a[i]);
    }

    QueryAPI.prototype = {
        "test": function() {
            return exec_query(this,"query",arguments);
        },
        "explain": function() {
            return exec_query(this,"explain",arguments);
        },
        "exec": function() {
            var on_result = function(retval) {

                if(retval.hasMore) {
                    this.next = function() {
                        return db.cursor.get(retval.id).then(on_result);
                    }
                } else delete this.next;    
                return retval.result;
            } 

            return exec_query(this,"create",arguments).then(on_result);
        },
        "count": function(num) {
            this.options.count = num > 0 ? true : false;
            this.options.batchSize = num > 0 ? num : undefined;
      
            return this;
        },
        "new": function() {
            return new Aql();
        },
        "hasNext": function() {
            return this.next !== QueryAPI.prototype.next;
        },
        "next": function() {
            throw { name: "StopIteration" };
        }
    };    

    return new QueryAPI;
}

module.exports = closure;

