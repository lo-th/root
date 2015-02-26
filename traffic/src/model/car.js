TRAFFIC.Car = function (lane, position) {
	this.type = TRAFFIC.rand(TRAFFIC.TYPE_OF_CARS.length-1);

    this.id = TRAFFIC.uniqueId('car');
    this.color = (300 + 240 * TRAFFIC.random() | 0) % 360;
    this._speed = 0;
    this.width = TRAFFIC.TYPE_OF_CARS[this.type].w*2;//1.7;
    this.length = TRAFFIC.TYPE_OF_CARS[this.type].l*2;//3 + 2 * TRAFFIC.random();
    this.maxSpeed = 30;
    this.s0 = 2;
    this.timeHeadway = 1.5;
    this.maxAcceleration = 1;
    this.maxDeceleration = 3;
    this.trajectory = new TRAFFIC.Trajectory(this, lane, position);
    this.alive = true;
    this.preferedLane = null;

    Object.defineProperty(this, 'coords', {
	    get: function() {
	        return this.trajectory.coords;
	    }
	});

	Object.defineProperty(this, 'speed', {
	    get: function() {
	        return this._speed;
	    },
	    set: function(speed) {
	        if (speed < 0) speed = 0;
	        if (speed > this.maxSpeed) speed = this.maxSpeed;
	        return this._speed = speed;
	    }
	});

	Object.defineProperty(this, 'direction', {
	    get: function() {
	        return this.trajectory.direction;
	    }
	});
}

TRAFFIC.Car.prototype = {
    constructor: TRAFFIC.Car,
    release : function() {
    	return this.trajectory.release();
    },
    getAcceleration : function() {
	    var a, b, breakGap, busyRoadCoeff, coeff, deltaSpeed, distanceGap, distanceToNextCar, freeRoadCoeff, intersectionCoeff, nextCarDistance, safeDistance, safeIntersectionDistance, timeGap, _ref;
	    nextCarDistance = this.trajectory.nextCarDistance;
	    distanceToNextCar = TRAFFIC.max(nextCarDistance.distance, 0);
	    a = this.maxAcceleration;
	    b = this.maxDeceleration;
	    deltaSpeed = (this.speed - ((_ref = nextCarDistance.car) != null ? _ref.speed : void 0)) || 0;
	    freeRoadCoeff = Math.pow(this.speed / this.maxSpeed, 4);
	    distanceGap = this.s0;
	    timeGap = this.speed * this.timeHeadway;
	    breakGap = this.speed * deltaSpeed / (2 * TRAFFIC.sqrt(a * b));
	    safeDistance = distanceGap + timeGap + breakGap;
	    busyRoadCoeff = Math.pow(safeDistance / distanceToNextCar, 2);
	    safeIntersectionDistance = 1 + timeGap + Math.pow(this.speed, 2) / (2 * b);
	    intersectionCoeff = Math.pow(safeIntersectionDistance / this.trajectory.distanceToStopLine, 2);
	    coeff = 1 - freeRoadCoeff - busyRoadCoeff - intersectionCoeff;
	    return this.maxAcceleration * coeff;
	},
	move : function(delta) {
	    var acceleration, currentLane, preferedLane, step, turnNumber;
	    acceleration = this.getAcceleration();
	    this.speed += acceleration * delta;
	    if (!this.trajectory.isChangingLanes && this.nextLane) {
	        currentLane = this.trajectory.current.lane;
	        turnNumber = currentLane.getTurnDirection(this.nextLane);
	        preferedLane = (function() {
	        switch (turnNumber) {
	            case 0: return currentLane.leftmostAdjacent; break;
	            case 2: return currentLane.rightmostAdjacent; break;
	            default: return currentLane;
	        }
	        })();
	        if (preferedLane !== currentLane) {
	            this.trajectory.changeLane(preferedLane);
	        }
	    }
	    step = this.speed * delta + 0.5 * acceleration * Math.pow(delta, 2);
	    if (this.trajectory.nextCarDistance.distance < step) console.log('bad IDM');
	    if (this.trajectory.timeToMakeTurn(step)) {
	        if (this.nextLane == null) return this.alive = false;
	    }
	    return this.trajectory.moveForward(step);
    },
    pickNextRoad : function() {
	    var currentLane, intersection, nextRoad, possibleRoads;
	    intersection = this.trajectory.nextIntersection;
	    currentLane = this.trajectory.current.lane;
	    possibleRoads = intersection.roads.filter(function(x) {
	      return x.target !== currentLane.road.source;
	    });
	    /*possibleRoads = TRAFFIC.filter(function(x) {
	      return x.target !== currentLane.road.source;
	    }, intersection.roads);*/
	    if (possibleRoads.length === 0) return null;
	    return nextRoad = TRAFFIC.sample(possibleRoads);
    },
    pickNextLane : function() {
	    var laneNumber, nextRoad, turnNumber;
	    if (this.nextLane) throw Error('next lane is already chosen');
	    this.nextLane = null;
	    nextRoad = this.pickNextRoad();
	    if (!nextRoad) return null;
	    turnNumber = this.trajectory.current.lane.road.getTurnDirection(nextRoad);
	    laneNumber = (function() {
	      switch (turnNumber) {
	        case 0: return nextRoad.lanesNumber - 1; break;
	        case 1: return TRAFFIC.rand(0, nextRoad.lanesNumber - 1); break;
	        case 2: return 0; break;
	      }
	    })();
	    this.nextLane = nextRoad.lanes[laneNumber];
	    if (!this.nextLane) throw Error('can not pick next lane');
	    return this.nextLane;
    },
    popNextLane : function() {
	    var nextLane;
	    nextLane = this.nextLane;
	    this.nextLane = null;
	    this.preferedLane = null;
	    return nextLane;
    }
}