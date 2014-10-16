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
          else target[key] = extend(true, {}, source[key]);
        }
      } else if(source[key] !== undefined) {
	  target[key] = source[key];
      }
    }
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
