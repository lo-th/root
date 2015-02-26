
TRAFFIC.Segment = function (source, target) {
    this.source = source;
    this.target = target;

    Object.defineProperty(this, 'vector', {
        get: function() {
            return this.target.subtract(this.source);
        }
    });

    Object.defineProperty(this, 'length', {
        get: function() {
             return this.vector.length;
        }
    });

    Object.defineProperty(this, 'direction', {
        get: function() {
            return this.vector.direction;
        }
    });

    Object.defineProperty(this, 'center', {
        get: function() {
            return this.getPoint(0.5);
        }
    });
}

TRAFFIC.Segment.prototype = {
    constructor: TRAFFIC.Segment,
    split : function(n, reverse) {
        var k, order, _i, _j, _k, _len, _ref, _ref1, _results, _results1, _results2;
        order = reverse ? (function() {
            _results = [];
            for (var _i = _ref = n - 1; _ref <= 0 ? _i <= 0 : _i >= 0; _ref <= 0 ? _i++ : _i--){ _results.push(_i); }
                return _results;
        }).apply(this) : (function() {
          _results1 = [];
          for (var _j = 0, _ref1 = n - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; 0 <= _ref1 ? _j++ : _j--){ _results1.push(_j); }
          return _results1;
        }).apply(this);
        _results2 = [];
        for (_k = 0, _len = order.length; _k < _len; _k++) {
            k = order[_k];
            _results2.push(this.subsegment(k / n, (k + 1) / n));
        }
        return _results2;
    },
    getPoint : function(a) {
        return this.source.add(this.vector.mult(a));
    },
    subsegment : function(a, b) {
        var end, offset, start;
        offset = this.vector;
        start = this.source.add(offset.mult(a));
        end = this.source.add(offset.mult(b));
        return new TRAFFIC.Segment(start, end);
    }
}