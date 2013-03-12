/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

"use strict"

/* Extends object using reduce function */
function extend() {
    var deep = false, target, i = 0;
    if(typeof arguments[i] === "boolean") deep = arguments[i++];
    target = arguments[i++] || {};
  
    for(var source; source = arguments[i]; i++){    
        target = Object.keys(source).reduce(function(obj,key) {
            if(source.hasOwnProperty(key)) {  
                if(typeof source[key] === 'object') {
                    if(deep) obj[key] = extend(true,obj[key],source[key]);
                } else if(source[key]) obj[key] = source[key];
            }    
            return obj;
        }, target);
    }

    return target;
}

/* Allows us to declare typed function arguments. */
/* TODO: Add default values, ranges, lists etc.   */
/* Example: Params([{name1:"type1"},{name2:"type2"}],
            function(name1,name2){ 
                code 
            } 
*/            
function Params(args,func) {
    var p, t, x = "";

    for(var i = 0; i < args.length; i++) {
        p = Object.keys(args[i])[0];
        t = args[i][p];
        x+= "if(typeof arguments[i] === '" + t + "') " + "a[a.length] = arguments[i++];";
        x+= "else a[a.length] = undefined;";
    }
    return new Function("f","return function(){var i = 0, a = [];" + x + "return f.apply(this,a);};")(func);
}


/* Prototypal inheritance (from nodejs) */
function inherit(self, parent) {
    self.super_ = parent;
    self.prototype = Object.create(parent.prototype, {
            constructor: {
                value: self,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
}


module.exports = { 
    extend: extend,
    inherit: inherit,
    Params: Params   
};

