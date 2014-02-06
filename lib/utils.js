"use strict";

function extend() {
    var deep = false,
        source, target,
        key, i = 0,
        l = arguments.length;

    if (typeof arguments[i] === "boolean") deep = arguments[i++];

    target = arguments[i++];

    if (l <= i) return extend(deep, {}, target);

    while (i < l) {
        source = arguments[i++];

        for (key in source) {
            if (typeof source[key] === 'object' && source[key] != null) {
                if (deep) {
                    if (target.hasOwnProperty(key)) extend(true, target[key], source[key]);
                    else target[key] = extend(true, {}, source[key])
                }
            } else target[key] = source[key];
        }
    }

    return target;
}

/* mixin object properties */
function mix() {
    var key, obj = {}, i = 0,
        l = arguments.length;
    do {
        for (key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
                obj[key] = arguments[i][key];
            }
        }
    } while (i++ < l);

    return obj;
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
    mix: mix
};
