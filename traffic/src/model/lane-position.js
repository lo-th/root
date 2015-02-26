TRAFFIC.LanePosition = function (car, lane, position) {
    this.car = car;
    this.position = position;
    this.id = TRAFFIC.uniqueId('laneposition');
    this.free = true;
    //this.lane = lane;
    this._lane = lane;

    Object.defineProperty(this, 'lane', {
        get: function() {
            return this._lane;
        },
        set: function(lane) {
            this.release();
            return this._lane = lane;
        }
    });

    Object.defineProperty(this, 'relativePosition', {
        get: function() {
            return this.position / this.lane.length;
        }
    });

    Object.defineProperty(this, 'nextCarDistance', {
        get: function() {
            var frontPosition, next, rearPosition, result;
            next = this.getNext();
            if (next) {
                rearPosition = next.position - next.car.length / 2;
                frontPosition = this.position + this.car.length / 2;
                return result = { car: next.car, distance: (rearPosition - frontPosition) };
            }
            return result = { car: null, distance: Infinity };
        }
    });
}

TRAFFIC.LanePosition.prototype = {
    constructor: TRAFFIC.LanePosition,
    acquire : function() {
        var _ref;
        if (((_ref = this.lane) != null ? _ref.addCarPosition : void 0) != null) {
            this.free = false;
            return this.lane.addCarPosition(this);
        }
    },
    release : function() {
        var _ref;
        if (!this.free && ((_ref = this.lane) != null ? _ref.removeCar : void 0)) {
            this.free = true;
            return this.lane.removeCar(this);
        }
    },
    getNext : function() {
        if (this.lane && !this.free) return this.lane.getNext(this); 
    }
}