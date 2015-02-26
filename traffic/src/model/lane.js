TRAFFIC.Lane = function (sourceSegment, targetSegment, road) {
    this.sourceSegment = sourceSegment;
    this.targetSegment = targetSegment;
    this.road = road;
    this.leftAdjacent = null;
    this.rightAdjacent = null;
    this.leftmostAdjacent = null;
    this.rightmostAdjacent = null;
    this.carsPositions = {};
    this.update();

    Object.defineProperty(this, 'sourceSideId', {
        get: function() {
            return this.road.sourceSideId;
        }
    });

    Object.defineProperty(this, 'targetSideId', {
        get: function() {
            return this.road.targetSideId;
        }
    });

    Object.defineProperty(this, 'isRightmost', {
        get: function() {
            return this === this.rightmostAdjacent;
        }
    });

    Object.defineProperty(this, 'isLeftmost', {
        get: function() {
            return this === this.leftmostAdjacent;
        }
    });

    Object.defineProperty(this, 'leftBorder', {
        get: function() {
            return new TRAFFIC.Segment(this.sourceSegment.source, this.targetSegment.target);
        }
    });

    Object.defineProperty(this, 'rightBorder', {
        get: function() {
            return new TRAFFIC.Segment(this.sourceSegment.target, this.targetSegment.source);
        }
    });
}

TRAFFIC.Lane.prototype = {
    constructor: TRAFFIC.Lane,
    toJSON:function(lane){
        var obj = TRAFFIC.extend({}, this);
        delete obj.carsPositions;
        return obj;
    },
    update : function() {
        this.middleLine = new TRAFFIC.Segment(this.sourceSegment.center, this.targetSegment.center);
        this.length = this.middleLine.length;
        return this.direction = this.middleLine.direction;
    },
    getTurnDirection : function(other) {
        return this.road.getTurnDirection(other.road);
    },
    getDirection : function() {
       return this.direction;
    },
    getPoint : function(a) {
        return this.middleLine.getPoint(a);
    },
    addCarPosition : function(carPosition) {
        if (carPosition.id in this.carsPositions) throw Error('car is already here');
        return this.carsPositions[carPosition.id] = carPosition;
    },
    removeCar : function(carPosition) {
        if (!(carPosition.id in this.carsPositions)) throw Error('removing unknown car');
        return delete this.carsPositions[carPosition.id];
    },
    getNext : function(carPosition) {
        var bestDistance, distance, id, next, o, _ref;
        if (carPosition.lane !== this) throw Error('car is on other lane');
        next = null;
        bestDistance = Infinity;
        _ref = this.carsPositions;
        for (id in _ref) {
            o = _ref[id];
            distance = o.position - carPosition.position;
            if (!o.free && (0 < distance && distance < bestDistance)) {
                bestDistance = distance;
                next = o;
            }
        }
        return next;
    }
}
