TRAFFIC.World = function () {
    this.toRemove = [];
    this.onTick = TRAFFIC.bind(this.onTick, this);
    this.set({});

    Object.defineProperty(this, 'instantSpeed', {
        get: function() {
            var speeds;
            speeds = TRAFFIC.map(this.cars.all(), function(car) { return car.speed; });
            if (speeds.length === 0) return 0;
            return (TRAFFIC.reduce(speeds, function(a, b) { return a + b; })) / speeds.length;
        }
    });
}

TRAFFIC.World.prototype = {
    constructor: TRAFFIC.World,
    set : function(obj) {
        if (obj == null) obj = {};
        this.intersections = new TRAFFIC.Pool(TRAFFIC.Intersection, obj.intersections);
        this.roads = new TRAFFIC.Pool(TRAFFIC.Road, obj.roads);
        this.cars = new TRAFFIC.Pool(TRAFFIC.Car, obj.cars);
        return this.carsNumber = 0;
    },
    save : function() {
        var data;
        data = TRAFFIC.extend({}, this);
        delete data.cars;
        return window.localStorage.world = JSON.stringify(data);
    },
    load : function() {
        var data, id, intersection, road, _ref, _ref1, _results;
        data = window.localStorage.world;
        data = data && JSON.parse(data);
        if (data == null) return;
        this.clear();
        this.carsNumber = data.carsNumber || 0;
        _ref = data.intersections;
        for (id in _ref) {
            intersection = _ref[id];
            this.addIntersection(TRAFFIC.Intersection.copy(intersection));
        }
        _ref1 = data.roads;
        _results = [];
        for (id in _ref1) {
            road = _ref1[id];
            road = new TRAFFIC.Road().copy(road);
            road.source = this.getIntersection(road.source);
            road.target = this.getIntersection(road.target);
            _results.push(this.addRoad(road));
        }
        return _results;
    },
    generateMap : function(X, Y, linemax, mult) {
        var minX = -X;
        var maxX = X;
        var minY = -Y;
        var maxY = Y;
    //generateMap : function(minX, maxX, minY, maxY, Linemax, mult) {
        linemax = linemax || 5;
        mult =  mult || 0.8;
        var gridSize, intersection, intersectionsNumber, map, previous, rect, step, x, y, _i, _j, _k, _l;
        /*if (minX == null) minX = -2;
        if (maxX == null) maxX = 2;
        if (minY == null) minY = -2;
        if (maxY == null) maxY = 2;*/
        this.clear();
        intersectionsNumber = (mult * (maxX - minX + 1) * (maxY - minY + 1)) | 0;
        map = {};
        gridSize = TRAFFIC.settings.gridSize;
        step = linemax * gridSize;
        this.carsNumber = 100;
        while (intersectionsNumber > 0) {
            x = TRAFFIC.rand(minX, maxX);
            y = TRAFFIC.rand(minY, maxY);
            if (map[[x, y]] == null) {
                rect = new TRAFFIC.Rect(step * x, step * y, gridSize, gridSize);
                intersection = new TRAFFIC.Intersection(rect);
                this.addIntersection(map[[x, y]] = intersection);
                intersectionsNumber -= 1;
            }
        }
        for (x = _i = minX; minX <= maxX ? _i <= maxX : _i >= maxX; x = minX <= maxX ? ++_i : --_i) {
            previous = null;
            for (y = _j = minY; minY <= maxY ? _j <= maxY : _j >= maxY; y = minY <= maxY ? ++_j : --_j) {
                intersection = map[[x, y]];
                if (intersection != null) {
                    if (TRAFFIC.random() < 0.9) {
                       if (previous != null)  this.addRoad(new TRAFFIC.Road(intersection, previous));
                       if (previous != null)  this.addRoad(new TRAFFIC.Road(previous, intersection));
                   }
                   previous = intersection;
               }
            }
        }
        for (y = _k = minY; minY <= maxY ? _k <= maxY : _k >= maxY; y = minY <= maxY ? ++_k : --_k) {
            previous = null;
            for (x = _l = minX; minX <= maxX ? _l <= maxX : _l >= maxX; x = minX <= maxX ? ++_l : --_l) {
                intersection = map[[x, y]];
                if (intersection != null) {
                    if (TRAFFIC.random() < 0.9) {
                        if (previous != null) this.addRoad(new TRAFFIC.Road(intersection, previous));
                        if (previous != null) this.addRoad(new TRAFFIC.Road(previous, intersection));
                    }
                    previous = intersection;
                }
            }
        }
        return null;
    },
    clear : function() {
        return this.set({});
    },
    onTick : function(delta) {
        var car, id, intersection, _ref, _ref1, _results;
        if (delta > 1) throw Error('delta > 1');
        this.refreshCars();
        _ref = this.intersections.all();
        for (id in _ref) {
            intersection = _ref[id];
            intersection.controlSignals.onTick(delta);
        }
        _ref1 = this.cars.all();
        _results = [];
        for (id in _ref1) {
            car = _ref1[id];
            car.move(delta);
            //this.debug.innerHTML = id + '|'+car.coords.x +','+ car.coords.y;
            if (!car.alive) _results.push(this.removeCar(car));
            else _results.push(void 0);
        }
        return _results;
    },
    refreshCars : function() {
        if (this.cars.length < this.carsNumber) this.addRandomCar();
        if (this.cars.length > this.carsNumber) return this.removeRandomCar();
    },
    addRoad : function(road) {
        this.roads.put(road);
        road.source.roads.push(road);
        road.target.inRoads.push(road);
        return road.update();
    },
    getRoad : function(id) {
        return this.roads.get(id);
    },
    addCar : function(car) {
        return this.cars.put(car);
    },
    getCar : function(id) {
       return this.cars.get(id);
    },
    removeCar : function(car) {
        this.toRemove.push(car.id);
        return this.cars.pop(car);
    },
    clearTmpRemove:function(){
        this.toRemove = [];
    },
    addIntersection : function(intersection) {
        return this.intersections.put(intersection);
    },
    getIntersection : function(id) {
        return this.intersections.get(id);
    },
    addRandomCar : function() {
        var lane, road;
        road = TRAFFIC.sample(this.roads.all());
        if (road != null) {
            lane = TRAFFIC.sample(road.lanes);
            if (lane != null){
                //console.log('car add');
                return this.addCar(new TRAFFIC.Car(lane));
            }
        }
    },
    removeRandomCar : function() {
        var car;
        car = TRAFFIC.sample(this.cars.all());
        if (car != null) return this.removeCar(car);
    }
}