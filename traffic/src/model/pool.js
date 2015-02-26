TRAFFIC.Pool = function (factory, pool) {
    var k, v, _ref;
    this.factory = factory;
    this.objects = {};
    if ((pool != null) && (pool.objects != null)) {
        _ref = pool.objects;
        for (k in _ref) {
            v = _ref[k];
            this.objects[k] = this.factory.copy(v);
        }
    }

    Object.defineProperty(this, 'length', {
        get: function() {
            return Object.keys(this.objects).length;
        }
    });
}

TRAFFIC.Pool.prototype = {
    constructor: TRAFFIC.Pool,
    toJSON : function() {
        return this.objects;
    },
    get : function(id) {
        return this.objects[id];
    },
    put : function(obj) {
    return this.objects[obj.id] = obj;
    },
    pop : function(obj) {
        var id, result, _ref;
        id = (_ref = obj.id) != null ? _ref : obj;
        result = this.objects[id];
        if (typeof result.release === "function") {
            result.release();
        }
        delete this.objects[id];
        return result;
    },
    all : function() {
        return this.objects;
    },
    clear : function() {
        return this.objects = {};
    }
}