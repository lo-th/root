TRAFFIC.Intersection = function (rect) {
    this.rect = rect;
    this.id = TRAFFIC.uniqueId('intersection');
    this.roads = [];
    this.inRoads = [];
    this.controlSignals = new TRAFFIC.ControlSignals(this);
}

TRAFFIC.Intersection.prototype = {
    constructor: TRAFFIC.Intersection,
    copy : function(intersection) {
        var result;
        intersection.rect = TRAFFIC.Rect.copy(intersection.rect);//new TRAFFIC.Rect().copy(intersection.rect);
        result = Object.create( TRAFFIC.Intersection.prototype );
        TRAFFIC.extend(result, intersection);
        result.roads = [];
        result.inRoads = [];
        result.controlSignals = new TRAFFIC.ControlSignals(result);
        return result;
    },
    toJSON : function() {
        var obj;
        return obj = { id: this.id, rect: this.rect };
    },
    update : function() {
        var road, _i, _j, _len, _len1, _ref, _ref1, _results;
        _ref = this.roads;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            road = _ref[_i];
            road.update();
        }
        _ref1 = this.inRoads;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            road = _ref1[_j];
            _results.push(road.update());
        }
        return _results;
    }
}