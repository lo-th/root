TRAFFIC.Point = function (_at_x, _at_y) {
    this.x = _at_x != null ? _at_x : 0;
    this.y = _at_y != null ? _at_y : 0;

    Object.defineProperty(this, 'length', {
        get: function() {
            return TRAFFIC.sqrt(this.x * this.x + this.y * this.y);
        }
    });

    Object.defineProperty(this, 'direction', {
        get: function() {
             return TRAFFIC.atan2(this.y, this.x);
        }
    });

    Object.defineProperty(this, 'normalized', {
        get: function() {
            return new TRAFFIC.Point(this.x / this.length, this.y / this.length);
        }
    });
}

TRAFFIC.Point.prototype = {
    constructor: TRAFFIC.Point,
    add : function(o) {
        return new TRAFFIC.Point(this.x + o.x, this.y + o.y);
    },
    subtract : function(o) {
        return new TRAFFIC.Point(this.x - o.x, this.y - o.y);
    },
    mult : function(k) {
        return new TRAFFIC.Point(this.x * k, this.y * k);
    },
    divide : function(k) {
        return new TRAFFIC.Point(this.x / k, this.y / k);
    }
}