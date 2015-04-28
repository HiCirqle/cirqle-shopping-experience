var supports = [];

supports.object = function(){
  if (!Object.keys) {
    Object.keys = (function () {
      var hasOwnProperty = Object.prototype.hasOwnProperty,
          hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
          dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
          ],
          dontEnumsLength = dontEnums.length;

      return function (obj) {
        if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

        var result = [];

        for (var prop in obj) {
          if (hasOwnProperty.call(obj, prop)) result.push(prop);
        }

        if (hasDontEnumBug) {
          for (var i=0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
          }
        }
        return result;
      }
    })()
  };
};

supports.array = function(){
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fun /*, thisp*/)
    {
      var len = this.length;
      if (typeof fun != "function")
        throw new TypeError();
      var thisp = arguments[1];
      for (var i = 0; i < len; i++)
      {
        if (i in this)
          fun.call(thisp, this[i], i, this);
      }
    };
  }
};


module.exports = {
  support:function(name){
    supports[name]();
  }
}
