TRAFFIC.Curve = function (_at_A, _at_B, _at_O, _at_Q) {
    this.A = _at_A;
    this.B = _at_B;
    this.O = _at_O;
    this.Q = _at_Q;
    this.AB = new TRAFFIC.Segment(this.A, this.B);
    this.AO = new TRAFFIC.Segment(this.A, this.O);
    this.OQ = new TRAFFIC.Segment(this.O, this.Q);
    this.QB = new TRAFFIC.Segment(this.Q, this.B);
    this._length = null;

    Object.defineProperty(this, 'length', {
        get: function() {
            var i, point, pointsNumber, prevoiusPoint, _i;
            if (this._length == null) {
                pointsNumber = 10;
                prevoiusPoint = null;
                this._length = 0;
                for (i = _i = 0; 0 <= pointsNumber ? _i <= pointsNumber : _i >= pointsNumber; i = 0 <= pointsNumber ? ++_i : --_i) {
                    point = this.getPoint(i / pointsNumber);
                    if (prevoiusPoint) { this._length += point.subtract(prevoiusPoint).length; }
                    prevoiusPoint = point;
                }
            }
            return this._length;
        }
    });
}

TRAFFIC.Curve.prototype = {
    constructor: TRAFFIC.Curve,
    getPoint : function(a) {
        var p0, p1, p2, r0, r1;
        p0 = this.AO.getPoint(a);
        p1 = this.OQ.getPoint(a);
        p2 = this.QB.getPoint(a);
        r0 = (new TRAFFIC.Segment(p0, p1)).getPoint(a);
        r1 = (new TRAFFIC.Segment(p1, p2)).getPoint(a);
        return (new TRAFFIC.Segment(r0, r1)).getPoint(a);
    },
    getDirection : function(a) {
        var p0, p1, p2, r0, r1;
        p0 = this.AO.getPoint(a);
        p1 = this.OQ.getPoint(a);
        p2 = this.QB.getPoint(a);
        r0 = (new TRAFFIC.Segment(p0, p1)).getPoint(a);
        r1 = (new TRAFFIC.Segment(p1, p2)).getPoint(a);
        return (new TRAFFIC.Segment(r0, r1)).direction;
    }
}