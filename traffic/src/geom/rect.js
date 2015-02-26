TRAFFIC.Rect = function (x, y, _width, _height) {
    this.x = x || 0;
    this.y = y || 0;
    this._width = _width != null ? _width : 0;
    this._height = _height != null ? _height : 0;
}
TRAFFIC.Rect.prototype = {
    constructor: TRAFFIC.Rect,
    copy : function(rect) {
        return new TRAFFIC.Rect(rect.x, rect.y, rect._width, rect._height);
    },
    toJSON : function() {
        return TRAFFIC.extend({}, this);
    },
    area : function() {
        return this.width() * this.height();
    },
    left : function(left) {
        if (left != null) this.x = left;
        return this.x;
    },
    right : function(right) {
        if (right != null) this.x = right - this.width();
        return this.x + this.width();
    },
    width : function(width) {
        if (width != null) this._width = width;
        return this._width;
    },
    top : function(top) {
        if (top != null) this.y = top;
        return this.y;
    },
    bottom : function(bottom) {
        if (bottom != null) this.y = bottom - this.height();
        return this.y + this.height();
    },
    height : function(height) {
        if (height != null)  this._height = height;
        return this._height;
    },
    center : function(center) {
        if (center != null) {
            this.x = center.x - this.width() / 2;
            this.y = center.y - this.height() / 2;
        }
        return new TRAFFIC.Point(this.x + this.width() / 2, this.y + this.height() / 2);
    },
    containsPoint : function(point) {
        var _ref, _ref1;
        return (this.left() <= (_ref = point.x) && _ref <= this.right()) && (this.top() <= (_ref1 = point.y) && _ref1 <= this.bottom());
    },
    containsRect : function(rect) {
        return this.left() <= rect.left() && rect.right() <= this.right() && this.top() <= rect.top() && rect.bottom() <= this.bottom();
    },
    getVertices : function() {
        return [new TRAFFIC.Point(this.left(), this.top()), new TRAFFIC.Point(this.right(), this.top()), new TRAFFIC.Point(this.right(), this.bottom()), new TRAFFIC.Point(this.left(), this.bottom())];
    },
    getSide : function(i) {
        var vertices;
        vertices = this.getVertices();
        return new TRAFFIC.Segment(vertices[i], vertices[(i + 1) % 4]);
    },
    getSectorId : function(point) {
        var offset;
        offset = point.subtract(this.center());
        if (offset.y <= 0 && TRAFFIC.abs(offset.x) <= TRAFFIC.abs(offset.y)) return 0;
        if (offset.x >= 0 && TRAFFIC.abs(offset.x) >= TRAFFIC.abs(offset.y)) return 1;
        if (offset.y >= 0 && TRAFFIC.abs(offset.x) <= TRAFFIC.abs(offset.y)) return 2;
        if (offset.x <= 0 && TRAFFIC.abs(offset.x) >= TRAFFIC.abs(offset.y)) return 3;
        throw Error('algorithm error');
    },
    getSector : function(point) {
        return this.getSide(this.getSectorId(point));
    }
}