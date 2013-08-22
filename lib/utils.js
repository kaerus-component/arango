/* 
 * Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 */

"use strict"

/* Extends object using reduce function */
function extend() {
    var deep = false, source, target, i = 0, l = arguments.length;

    if(typeof arguments[i] === "boolean") deep = arguments[i++];
    
    target = arguments[i++];

    if(l <= i) return extend(deep,{},target);
    
    while(i < l){
        source = arguments[i++];
        target = Object.keys(source).reduce(function(obj,key) {
            if(typeof source[key] === 'object' && source[key] != null) {
                if(deep) obj[key] = extend(true,obj[key],source[key]);
            } else obj[key] = source[key];
            return obj;
        }, target);
    }

    return target;
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
    inherit: inherit 
};

