  var ctor = function(){};
  var breaker = {};



  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;
var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;
/*if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun, thisArg) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}  */


var TRAFFIC = {};

TRAFFIC.TYPE_OF_CARS = [
   { w:1.8, l:4.8, h:1.4, m:'car001', name:'fordM'  , wPos:[0.76,0,1.46], wRadius:0.36, nWheels:4 },
   { w:1.8, l:4.5, h:1.8, m:'car002', name:'vaz'    , wPos:[0.72,0,1.31], wRadius:0.36, nWheels:4 },
   { w:2.2, l:5.0, h:1.5, m:'car003', name:'coupe'  , wPos:[0.96,0,1.49], wRadius:0.36, nWheels:4 },
   { w:2.2, l:5.2, h:1.9, m:'car004', name:'c4'     , wPos:[0.93,0,1.65], wRadius:0.40, nWheels:4 },
   { w:2.2, l:5.2, h:1.8, m:'car005', name:'ben'    , wPos:[0.88,0,1.58], wRadius:0.40, nWheels:4 },
   { w:2.1, l:5.4, h:1.7, m:'car006', name:'taxi'   , wPos:[0.90,0,1.49], wRadius:0.40, nWheels:4 },
   { w:2.2, l:5.4, h:1.9, m:'car007', name:'207'    , wPos:[0.94,0,1.60], wRadius:0.40, nWheels:4 },
   { w:2.3, l:5.9, h:1.7, m:'car008', name:'police' , wPos:[0.96,0,1.67], wRadius:0.40, nWheels:4 },
   { w:2.7, l:6.2, h:2.6, m:'car009', name:'van1'   , wPos:[1.14,0,1.95], wRadius:0.46, nWheels:4 },
   { w:2.2, l:6.6, h:2.8, m:'car010', name:'van2'   , wPos:[0.89,0,2.10], wRadius:0.40, nWheels:4 },
   { w:2.8, l:7.0, h:3.2, m:'car011', name:'van3'   , wPos:[0.90,0,1.83], wRadius:0.46, nWheels:4 },
   { w:2.8, l:8.9, h:3.9, m:'car012', name:'truck1' , wPos:[1.00,0,2.58], wRadius:0.57, nWheels:6 },
   { w:3.0, l:10.6, h:3.4, m:'car013', name:'truck1', wPos:[1.17,0,3.64], wRadius:0.57, nWheels:6 },
   { w:3.0, l:12.7, h:3.4, m:'car014', name:'bus'   , wPos:[1.25,0,2.49], wRadius:0.64, nWheels:4 },
];

TRAFFIC.settings = {
    /*colors: {
        background: '#97a1a1',
        redLight: 'hsl(0, 100%, 50%)',
        greenLight: '#85ee00',
        intersection: '#586970',
        road: '#586970',
        roadMarking: '#bbb',
        hoveredIntersection: '#3d4c53',
        tempRoad: '#aaa',
        gridPoint: '#586970',
        grid1: 'rgba(255, 255, 255, 0.5)',
        grid2: 'rgba(220, 220, 220, 0.5)',
        hoveredGrid: '#f4e8e1'
    },*/
    //fps: 30,
    lightsFlipInterval: 20,
    gridSize: 32,//14,
    defaultTimeFactor: 5
};

TRAFFIC.abs = Math.abs;
TRAFFIC.sqrt = Math.sqrt;
TRAFFIC.atan2 = Math.atan2;
TRAFFIC.random = Math.random;
TRAFFIC.max = Math.max;
TRAFFIC.min = Math.min;
TRAFFIC.PI = Math.PI;
/*var nativeReduce = null;
var nativeForEach = null;
var nativeMap = null;
var nativeBind = null;*/

TRAFFIC.binding = function(fn, me){ 
	return function(){ return fn.apply(me, arguments); }; 
}

TRAFFIC.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    //if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
}
TRAFFIC.indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };


//TRAFFIC.lerp = function (a, b, percent) { return a + (b - a) * percent; }
//V.rand = function (a, b, n) { return V.lerp(a, b, Math.random()).toFixed(n || 3)*1;}
//TRAFFIC.rand = function (a, b) { return TRAFFIC.lerp(a, b, Math.random()).toFixed(0)*1;}

TRAFFIC.rand = function(min,max){
    if (max == null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
}

TRAFFIC.sample = function(obj, n, guard){
    if (n == null || guard) {
        if (obj.length !== +obj.length) obj = TRAFFIC.values(obj);
        return obj[TRAFFIC.rand(obj.length - 1)];
    }
    return TRAFFIC.shuffle(obj).slice(0, Math.max(0, n));
}

TRAFFIC.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    TRAFFIC.each(obj, function(value) {
        rand = TRAFFIC.rand(index++);
        shuffled[index - 1] = shuffled[rand];
        shuffled[rand] = value;
    });
    return shuffled;
};

TRAFFIC.idCounter = 0;
TRAFFIC.uniqueId = function(prefix){
    var id = ++TRAFFIC.idCounter + '';
    return prefix ? prefix + id : id;
}

TRAFFIC.extend = function(obj){
    TRAFFIC.each(slice.call(arguments, 1), function(source) {
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
}

TRAFFIC.reduce = function(obj, iterator, memo, context){
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = TRAFFIC.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    TRAFFIC.each(obj, function(value, index, list) {
        if (!initial) {
            memo = value;
            initial = true;
        } else {
            memo = iterator.call(context, memo, value, index, list);
        }
    });
    //if (!initial) throw new TypeError(reduceError);
    return memo;
}

TRAFFIC.each = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, length = obj.length; i < length; i++) {
           if (iterator.call(context, obj[i], i, obj) === breaker) return;
        }
    } else {
        var keys = TRAFFIC.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
        }
    }
    return obj;
}

TRAFFIC.keys = function(obj) {
    if (!TRAFFIC.isObject(obj)) return [];
    //if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (TRAFFIC.has(obj, key)) keys.push(key);
    return keys;
}

TRAFFIC.isObject = function(obj) {
    return obj === Object(obj);
}

TRAFFIC.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
}

TRAFFIC.values = function(obj) {
    var keys = TRAFFIC.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
        values[i] = obj[keys[i]];
    }
    return values;
}

/*
TRAFFIC.filter = function(fun, Arg) {
   //'use strict';

   // if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Arg//Object(this);
    var len = t.length;// >>> 0;
    //if (typeof fun !== 'function') { throw new TypeError(); }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  }*/
TRAFFIC.map = function(obj, iterator, context){
	var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    TRAFFIC.each(obj, function(value, index, list) {
        results.push(iterator.call(context, value, index, list));
    });
    return results;
}

