TRAFFIC.Trajectory = function (car, lane, position) {
    this.car = car;
    if (position == null) position = 0;
    this.current = new TRAFFIC.LanePosition(this.car, lane, position);
    this.current.acquire();
    this.next = new TRAFFIC.LanePosition(this.car);
    this.temp = new TRAFFIC.LanePosition(this.car);
    this.isChangingLanes = false;

    Object.defineProperty(this, 'lane', {
        get: function() {
            return this.temp.lane || this.current.lane;
        }
    });

    Object.defineProperty(this, 'absolutePosition', {
        get: function() {
            if (this.temp.lane != null) return this.temp.position;
            else  return this.current.position;
        }
    });

    Object.defineProperty(this, 'relativePosition', {
        get: function() {
            return this.absolutePosition / this.lane.length;
        }
    });

    Object.defineProperty(this, 'direction', {
        get: function() {
            return this.lane.getDirection(this.relativePosition);
        }
    });

    Object.defineProperty(this, 'coords', {
        get: function() {
            return this.lane.getPoint(this.relativePosition);
        }
    });

    Object.defineProperty(this, 'nextCarDistance', {
        get: function() {
            var a, b;
            a = this.current.nextCarDistance;
            b = this.next.nextCarDistance;
            if (a.distance < b.distance) return a;
            else return b;
        }
    });

    Object.defineProperty(this, 'distanceToStopLine', {
        get: function() {
            if (!this.canEnterIntersection()) { return this.getDistanceToIntersection(); }
            return Infinity;
        }
    });

    Object.defineProperty(this, 'nextIntersection', {
        get: function() {
            return this.current.lane.road.target;
        }
    });

    Object.defineProperty(this, 'previousIntersection', {
        get: function() {
            return this.current.lane.road.source;
        }
    });
}

TRAFFIC.Trajectory.prototype = {
    constructor: TRAFFIC.Trajectory,
    isValidTurn : function() {
        var nextLane, sourceLane, turnNumber;
        nextLane = this.car.nextLane;
        sourceLane = this.current.lane;
        if (!nextLane) throw Error('no road to enter');
        turnNumber = sourceLane.getTurnDirection(nextLane);
        if (turnNumber === 3) throw Error('no U-turns are allowed');
        if (turnNumber === 0 && !sourceLane.isLeftmost) throw Error('no left turns from this lane');
        if (turnNumber === 2 && !sourceLane.isRightmost) throw Error('no right turns from this lane');
        return true;
    },
    canEnterIntersection : function() {
        var intersection, nextLane, sideId, sourceLane, turnNumber;
        nextLane = this.car.nextLane;
        sourceLane = this.current.lane;
        if (!nextLane) return true;
        intersection = this.nextIntersection;
        turnNumber = sourceLane.getTurnDirection(nextLane);
        sideId = sourceLane.road.targetSideId;
        return intersection.controlSignals.state[sideId][turnNumber];
    },
    getDistanceToIntersection : function() {
        var distance;
        distance = this.current.lane.length - this.car.length / 2 - this.current.position;
        if (!this.isChangingLanes) return TRAFFIC.max(distance, 0);
        else return Infinity;
    },
    timeToMakeTurn : function(plannedStep) {
        if (plannedStep == null) plannedStep = 0;
        return this.getDistanceToIntersection() <= plannedStep;
    },
    moveForward : function(distance) {
        var gap, tempRelativePosition, _ref, _ref1;
        distance = TRAFFIC.max(distance, 0);
        this.current.position += distance;
        this.next.position += distance;
        this.temp.position += distance;
        if (this.timeToMakeTurn() && this.canEnterIntersection() && this.isValidTurn()) this._startChangingLanes(this.car.popNextLane(), 0);
  
        tempRelativePosition = this.temp.position / ((_ref = this.temp.lane) != null ? _ref.length : void 0);
        gap = 2 * this.car.length;
        if (this.isChangingLanes && this.temp.position > gap && !this.current.free) this.current.release();

        if (this.isChangingLanes && this.next.free && this.temp.position + gap > ((_ref1 = this.temp.lane) != null ? _ref1.length : void 0)) this.next.acquire();
        if (this.isChangingLanes && tempRelativePosition >= 1) this._finishChangingLanes();
        if (this.current.lane && !this.isChangingLanes && !this.car.nextLane) return this.car.pickNextLane(); 
    },
    changeLane : function(nextLane) {
        var nextPosition;
        if (this.isChangingLanes) throw Error('already changing lane');
        if (nextLane == null) throw Error('no next lane');
        if (nextLane === this.lane) throw Error('next lane == current lane');
        if (this.lane.road !== nextLane.road) throw Error('not neighbouring lanes');
        nextPosition = this.current.position + 3 * this.car.length;
        if (!(nextPosition < this.lane.length)) throw Error('too late to change lane');
        return this._startChangingLanes(nextLane, nextPosition);
    },
    _getIntersectionLaneChangeCurve : function() {

    },
    _getAdjacentLaneChangeCurve : function() {
        var control1, control2, curve, direction1, direction2, distance, p1, p2;
        p1 = this.current.lane.getPoint(this.current.relativePosition);
        p2 = this.next.lane.getPoint(this.next.relativePosition);
        distance = p2.subtract(p1).length;
        direction1 = this.current.lane.middleLine.vector.normalized.mult(distance * 0.3);
        control1 = p1.add(direction1);
        direction2 = this.next.lane.middleLine.vector.normalized.mult(distance * 0.3);
        control2 = p2.subtract(direction2);
        return curve = new TRAFFIC.Curve(p1, p2, control1, control2);
    },
    _getCurve : function() {
        return this._getAdjacentLaneChangeCurve();
    },
    _startChangingLanes : function(nextLane, nextPosition) {
        var curve;
        if (this.isChangingLanes) throw Error('already changing lane');
        if (nextLane == null) throw Error('no next lane');
        this.isChangingLanes = true;
        //this.next.setlane(nextLane);
        this.next.lane = nextLane;
        this.next.position = nextPosition;
        curve = this._getCurve();
        this.temp.lane = curve;
        this.temp.position = 0;
        return this.next.position -= this.temp.lane.length;
    },
    _finishChangingLanes : function() {
        if (!this.isChangingLanes) throw Error('no lane changing is going on');
        this.isChangingLanes = false;
        this.current.lane = this.next.lane;
        this.current.position = this.next.position || 0;
        this.current.acquire();
        this.next.lane = null;
        this.next.position = NaN;
        this.temp.lane = null;
        this.temp.position = NaN;
        return this.current.lane;
    },
    release : function() {
        var _ref, _ref1, _ref2;
        if ((_ref = this.current) != null) _ref.release();
        if ((_ref1 = this.next) != null) _ref1.release();
        return (_ref2 = this.temp) != null ? _ref2.release() : void 0;
    }
}