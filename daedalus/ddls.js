
var DDLS = {};

DDLS.EPSILON = 0.01;
DDLS.EPSILON_SQUARED = 0.0001;
DDLS.SegmentID = 0;
DDLS.ShapeID = 0;
DDLS.EdgeID = 0;
DDLS.FaceID = 0;
DDLS.MeshID = 0;
DDLS.ObjectID = 0;
DDLS.VertexID = 0;


DDLS.GraphID = 0;
DDLS.GraphEdgeID = 0;
DDLS.GraphNodeID = 0;

// Math function
DDLS.sqrt = Math.sqrt;
DDLS.cos = Math.cos;
DDLS.sin = Math.sin;
DDLS.atan2 = Math.atan2;
DDLS.round = Math.round;
DDLS.pow = Math.pow;
DDLS.max = Math.max;
DDLS.min = Math.min;
DDLS.random = Math.random;

DDLS.lerp = function (a, b, percent) { return a + (b - a) * percent; };
DDLS.randInRange = function (a, b) { return DDLS.lerp(a, b, DDLS.random()); };
DDLS.randInt = function (a, b, n) { return DDLS.lerp(a, b, DDLS.random()).toFixed(n || 0)*1;};

DDLS.PI = 3.14159265358979323846;
DDLS.TwoPI = 6.28318530717958647692;

DDLS.PI90 = DDLS.PI*0.5;
DDLS.PI270 = DDLS.PI+DDLS.PI90;
DDLS.ToRad = DDLS.PI / 180;
DDLS.ToDeg = 180 / DDLS.PI;

DDLS.NaN = Number.NaN;
DDLS.NEGATIVE_INFINITY = -Infinity;//Number.NEGATIVE_INFINITY;
DDLS.POSITIVE_INFINITY = Infinity;//Number.POSITIVE_INFINITY;
DDLS.isFinite = function(i) { return isFinite(i); };
DDLS.isNaN = function(i1) { return isNaN(i1);};
DDLS.int = function(x) { return x | 0; };
// LOG

DDLS.Log = function(str){
    console.log(str)
};

// DEBUG

DDLS.Debug = {};
DDLS.Debug.assertTrue = function(cond,message,pos) {
    if(!cond) console.error( pos.fileName + ":" + pos.lineNumber + ": Expected true but was false! " + (message != null?message:"") );
};
DDLS.Debug.assertFalse = function(cond,message,pos) {
    if(cond) console.error( pos.fileName + ":" + pos.lineNumber + ": Expected false but was true! " + (message != null?message:"") );
};
DDLS.Debug.assertEquals = function(expected,actual,message,pos) {
    if(actual != expected) console.error( pos.fileName + ":" + pos.lineNumber + ": Expected '" + expected.toString() + "' but was '" + actual.toString() + "' " + (message != null ? message : "") );
};
DDLS.Debug.trace = function(value,pos) {
    console.log(value,pos);
};

DDLS.StringMap = function() {
    this.h = {};
};
DDLS.StringMap.prototype = {
    set: function(key,value) {
        this.h[key] = value;
    },
    get: function(key) {
        return this.h[key];
    }
};

// OBJECTMAP = DICTIONARY in as3
/*
DDLS.ObjectMap = function() {
    this.h = { };
    //this.h.__keys__ = { };
    this._count = 0;
};
DDLS.ObjectMap.prototype = {
    set: function(key,value) {
       // var id =  ++ DDLS.ObjectMap.count;
        var id = key.__id__ || (key.__id__ = ++ DDLS.ObjectMap.count);
        //var id = key.__id__ || (key.__id__ = this._count++ );
        this.h[id] = value;
        //this.h[key] = value;
        //this.h.__keys__[id] = key;
    },
    get: function(key) {
        return this.h[key.__id__];
        //return this.h[key];
    }
};
DDLS.ObjectMap.count = 0;
*/
// BIND
DDLS.Fid = 0;
DDLS.Bind = function (o,m) { 
    if( m == null ) return null; 
    if( m.__id__ == null ) m.__id__ = DDLS.Fid++; 
    var f; 
    if( o.hx__closures__ == null ) o.hx__closures__ = {}; 
    else f = o.hx__closures__[m.__id__]; 
    if( f == null ) { 
        f = function(){ return f.method.apply(f.scope, arguments); }; 
        f.scope = o; 
        f.method = m; 
        o.hx__closures__[m.__id__] = f; 
    } return f; 
}

// STRING
DDLS.StringTools = function(){};
DDLS.StringTools.hex = function(n,digits) {
    var s = "";
    var hexChars = "0123456789ABCDEF";
    do {
        s = hexChars.charAt(n & 15) + s;
        n >>>= 4;
    } while(n > 0);
    if(digits != null) while(s.length < digits) s = "0" + s;
    return s;
};

// BYTES
DDLS.Bytes = function(length,b) {
    this.length = length;
    this.b = b;
};
DDLS.Bytes.alloc = function(length) {
    var a = [];
    var _g = 0;
    while(_g < length) {
        var i = _g++;
        a.push(0);
    }
    return new DDLS.Bytes(length,a);
};

// TIMER

DDLS.Timer = function(){};
DDLS.Timer.stamp = function() {
    return self.performance !== undefined && self.performance.now !== undefined ? self.performance.now() * 0.001 : Date.now() * 0.001;
};

// INTERSECTION

DDLS.Intersection = { __ename__ : true, __constructs__ : ["EVertex","EEdge","EFace","ENull"] };
DDLS.Intersection.EVertex = function(vertex) { var _x = ["EVertex",0,vertex]; _x.__enum__ = DDLS.Intersection; return _x; };
DDLS.Intersection.EEdge = function(edge) { var _x = ["EEdge",1,edge]; _x.__enum__ = DDLS.Intersection; return _x; };
DDLS.Intersection.EFace = function(face) { var _x = ["EFace",2,face]; _x.__enum__ = DDLS.Intersection; return _x; };
DDLS.Intersection.ENull = ["ENull",3];
DDLS.Intersection.ENull.__enum__ = DDLS.Intersection;


DDLS.Dictionary = function (overwrite){
    this.overwrite = overwrite == true;
    this.k = [];
    this.v = [];
}
DDLS.Dictionary.prototype = {
    set:function(key, value){
        if(!this.overwrite || this.k.indexOf(key) == -1){
            this.k.push(key);
            this.v.push(value);
        }
    },
    get:function(key){
        var i = this.k.indexOf(key);
        if(i != -1) return this.v[i];
    },
    remove:function(key){
        var i = this.k.indexOf(key);
        if(i != -1){
            this.k.splice(i,1);
            this.v.splice(i,1);
        }
    },
    clearAll:function(value){
        for(var i = 0; i < this.v.length; i++){
            if(this.v[i] == value){
                this.k.splice(i,1);
                this.v.splice(i,1);
            }
        }
    },
    iterate:function(func){
        for(var i = 0; i < this.k.length; i++){
            func(this.k[i], this.v[i]);
        }
    }
}   

DDLS.Point = function(x,y) {
    this.x = x || 0;
    this.y = y || 0;
};
DDLS.Point.prototype = {
    constructor: DDLS.Point,
    transform: function(matrix) {
        matrix.tranform(this);
    },
    set: function(x,y) {
        this.x = x;
        this.y = y;
    },
    setXY: function(x,y) {
        this.x = x;
        this.y = y;
    },
    clone: function() {
        return new DDLS.Point(this.x,this.y);
    },
    substract: function(p) {
        this.x -= p.x;
        this.y -= p.y;
    },
    get_length: function() {
        return DDLS.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize: function() {
        var norm = this.get_length();
        this.x = this.x / norm;
        this.y = this.y / norm;
    },
    scale: function(s) {
        this.x = this.x * s;
        this.y = this.y * s;
    },
    distanceTo: function(p) {
        var diffX = this.x - p.x;
        var diffY = this.y - p.y;
        return DDLS.sqrt(diffX * diffX + diffY * diffY);
    },
    distanceSquaredTo: function(p) {
        var diffX = this.x - p.x;
        var diffY = this.y - p.y;
        return diffX*diffX + diffY*diffY;
    }
};
DDLS.Matrix = function(a,b,c,d,e,f) {
    this.a = a || 0;
    this.b = b || 0;
    this.c = c || 0;
    this.d = d || 0;
    this.e = e || 0;
    this.f = f || 0;
};
DDLS.Matrix.prototype = {
    constructor: DDLS.Matrix,
    identity: function() {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
    },
    translate: function(tx,ty) {
        this.e = this.e + tx;
        this.f = this.f + ty;
    },
    scale: function(sx,sy) {
        this.a = this.a * sx;
        this.b = this.b * sy;
        this.c = this.c * sx;
        this.d = this.d * sy;
        this.e = this.e * sx;
        this.f = this.f * sy;
    },
    rotate: function(rad) {
        var cos = DDLS.cos(rad);
        var sin = DDLS.sin(rad);
        var a = this.a * cos + this.b * -sin;
        var b = this.a * sin + this.b * cos;
        var c = this.c * cos + this.d * -sin;
        var d = this.c * sin + this.d * cos;
        var e = this.e * cos + this.f * -sin;
        var f = this.e * sin + this.f * cos;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    },
    clone: function() {
        return new DDLS.Matrix(this.a,this.b,this.c,this.d,this.e,this.f);
    },
    tranform: function(point) {
        var x = this.a * point.x + this.c * point.y + this.e;
        var y = this.b * point.x + this.d * point.y + this.f;
        point.x = x;
        point.y = y;
    },
    transformX: function(x,y) {
        return this.a * x + this.c * y + this.e;
    },
    transformY: function(x,y) {
        return this.b * x + this.d * y + this.f;
    },
    concat: function(matrix) {
        var a = this.a * matrix.a + this.b * matrix.c;
        var b = this.a * matrix.b + this.b * matrix.d;
        var c = this.c * matrix.a + this.d * matrix.c;
        var d = this.c * matrix.b + this.d * matrix.d;
        var e = this.e * matrix.a + this.f * matrix.c + matrix.e;
        var f = this.e * matrix.b + this.f * matrix.d + matrix.f;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }
};
DDLS.RandGenerator = function(seed,rangeMin,rangeMax) {
    this.rangeMin = rangeMin || 0;
    this.rangeMax = rangeMax || 1;
    this._originalSeed = this._currSeed = seed || 1234;
    this._numIter = 0;

    Object.defineProperty(this, 'seed', {
        get: function() { return this._originalSeed; },
        set: function(value) { this._originalSeed = this._currSeed = value; }
    });
};
DDLS.RandGenerator.prototype = {
    constructor: DDLS.RandGenerator,
    reset: function() {
        this._currSeed = this._originalSeed;
        this._numIter = 0;
    },
    next: function() {
        var tmp = this._currSeed * 1;
        this._tempString = (tmp*tmp).toString();//Std.string(_floatSeed * _floatSeed);
        while(this._tempString.length < 8) this._tempString = "0" + this._tempString;
        this._currSeed = parseInt(this._tempString.substr( 1 , 5 ));//Std.parseInt(HxOverrides.substr(this._tempString,1,5));
        var res = DDLS.round(this.rangeMin + (this._currSeed / 99999) * (this.rangeMax - this.rangeMin));
        if(this._currSeed == 0) this._currSeed = this._originalSeed + this._numIter;
        this._numIter++;
        if(this._numIter == 200) this.reset();
        return res;
    },
    nextInRange: function(rangeMin,rangeMax) {
        this.rangeMin = rangeMin;
        this.rangeMax = rangeMax;
        return this.next();
    },
    shuffle: function(array) {
        var currIdx = array.length;
        while(currIdx > 0) {
            var rndIdx = this.nextInRange(0,currIdx - 1);
            currIdx--;
            var tmp = array[currIdx];
            array[currIdx] = array[rndIdx];
            array[rndIdx] = tmp;
        }
    }
};
DDLS.Edge = function() {
    this.colorDebug = -1;
    this.id = DDLS.EdgeID;
    DDLS.EdgeID ++;
    this.fromConstraintSegments = [];
    this.isConstrained = false;
    this.isReal = false;
    this.originVertex = null;
    this.oppositeEdge = null;
    this.nextLeftEdge = null;
    this.leftFace = null;

    Object.defineProperty(this, 'destinationVertex', {
        get: function() { return this.oppositeEdge.originVertex; }
    });

    Object.defineProperty(this, 'nextRightEdge', {
        get: function() { return this.oppositeEdge.nextLeftEdge.nextLeftEdge.oppositeEdge; }
    });

    Object.defineProperty(this, 'prevRightEdge', {
        get: function() { return this.oppositeEdge.nextLeftEdge.oppositeEdge; }
    });

    Object.defineProperty(this, 'prevLeftEdge', {
        get: function() { return this.nextLeftEdge.nextLeftEdge; }
    });

    Object.defineProperty(this, 'rotLeftEdge', {
        get: function() { return this.nextLeftEdge.nextLeftEdge.oppositeEdge; }
    });

    Object.defineProperty(this, 'rotRightEdge', {
        get: function() { return this.oppositeEdge.nextLeftEdge; }
    });

    Object.defineProperty(this, 'rightFace', {
        get: function() { return this.oppositeEdge.leftFace; }
    });


};
DDLS.Edge.prototype = {
    constructor: DDLS.Edge,
    setDatas: function(originVertex, oppositeEdge, nextLeftEdge, leftFace, isReal, isConstrained) {
        this.isConstrained = isReal !== undefined ? isConstrained : false;
        this.isReal = isReal !== undefined ? isReal : true;
        this.originVertex = originVertex;
        this.oppositeEdge = oppositeEdge;
        this.nextLeftEdge = nextLeftEdge;
        this.leftFace = leftFace;
    },
    addFromConstraintSegment: function(segment) {
        if ( this.fromConstraintSegments.indexOf(segment) == -1 ) this.fromConstraintSegments.push(segment);
    },
    removeFromConstraintSegment: function(segment) {
        //if(this.fromConstraintSegments == null) return;
        var index = this.fromConstraintSegments.indexOf(segment);
        if ( index != -1 ) this.fromConstraintSegments.splice(index, 1);
    },
    dispose: function() {
        this.originVertex = null;
        this.oppositeEdge = null;
        this.nextLeftEdge = null;
        this.leftFace = null;
        this.fromConstraintSegments = null;
    },
    toString: function() {
        return "edge " + this.originVertex.id + " - " + this.destinationVertex.id;
    }
};
DDLS.Face = function() {
    this.colorDebug = -1;
    this.id = DDLS.FaceID;
    DDLS.FaceID ++;
    //this.isReal = false;
    //this.edge = null;
};
DDLS.Face.prototype = {
    constructor: DDLS.Face,
    setDatas: function(edge, isReal) {
        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;
    },
    dispose: function() {
        this.edge = null;
    }
};
DDLS.Vertex = function() {
    this.colorDebug = -1;
    this.id = DDLS.VertexID;
    DDLS.VertexID ++;
    this.pos = new DDLS.Point();
    this.fromConstraintSegments = [];
    this.edge = null;
    this.isReal = false;
};
DDLS.Vertex.prototype = {
    constructor: DDLS.Vertex,
    setDatas: function(edge,isReal) {
        this.isReal = isReal !== undefined ? isReal : true;
        this.edge = edge;
    },
    addFromConstraintSegment: function(segment) {
        if ( this.fromConstraintSegments.indexOf(segment) == -1 ) this.fromConstraintSegments.push(segment);
    },
    removeFromConstraintSegment: function(segment) {
        //if(this.fromConstraintSegments == null) return;
        var index = this.fromConstraintSegments.indexOf(segment);
        if ( index != -1 ) this.fromConstraintSegments.splice(index, 1);
    },
    dispose: function() {
        this.pos = null;
        this.edge = null;
        this.fromConstraintSegments = null;
    },
    toString: function() {
        return "ver_id " + this.id;
    }
};
DDLS.Object = function() {
    this.id = DDLS.ObjectID;
    DDLS.ObjectID++;
    this._pivotX = 0;
    this._pivotY = 0;
    this._matrix = new DDLS.Matrix();
    this._scaleX = 1;
    this._scaleY = 1;
    this._rotation = 0;
    this._constraintShape = null;
    this._x = 0;
    this._y = 0;
    this._coordinates = [];
    this.hasChanged = false;

    Object.defineProperty(this, 'rotation', {
        get: function() { return this._rotation; },
        set: function(value) { if(this._rotation != value) { this._rotation = value; this.hasChanged = true; } }
    });

    Object.defineProperty(this, 'scaleX', {
        get: function() { return this._scaleX; },
        set: function(value) { if(this._scaleX != value) { this._scaleX = value; this.hasChanged = true; } }
    });

    Object.defineProperty(this, 'scaleY', {
        get: function() { return this._scaleY; },
        set: function(value) { if(this._scaleY != value) { this._scaleY = value; this.hasChanged = true; } }
    });

    Object.defineProperty(this, 'x', {
        get: function() { return this._x; },
        set: function(value) { if(this._x != value) { this._x = value; this.hasChanged = true; } }
    });

    Object.defineProperty(this, 'y', {
        get: function() { return this._y; },
        set: function(value) { if(this._y != value) { this._y = value; this.hasChanged = true; } }
    });

    Object.defineProperty(this, 'matrix', {
        get: function() { return this._matrix; },
        set: function(value) { this._matrix = value; this.hasChanged = true; }
    });

    Object.defineProperty(this, 'coordinates', {
        get: function() { return this._coordinates; },
        set: function(value) { this._coordinates = value; this.hasChanged = true; }
    });

    Object.defineProperty(this, 'constraintShape', {
        get: function() { return this._constraintShape; },
        set: function(value) { this._constraintShape = value; this.hasChanged = true; }
    });

    Object.defineProperty(this, 'pivotX', {
        get: function() { return this._pivotX; },
        set: function(value) { this._pivotX = value; this.hasChanged = true; }
    });

    Object.defineProperty(this, 'pivotY', {
        get: function() { return this._pivotY; },
        set: function(value) { this._pivotY = value; this.hasChanged = true; }
    });

    Object.defineProperty(this, 'edges', {
        get: function() { 
            var res = [];
            var seg = this._constraintShape.segments;
            var _g1 = 0;
            var _g = seg.length;
            while(_g1 < _g) {
                var i = _g1++;
                var _g3 = 0;
                var _g2 = seg[i].edges.length;
                while(_g3 < _g2) {
                    var j = _g3++;
                    res.push(seg[i].edges[j]);
                }
            }
            return res; 
        }
    });


};
DDLS.Object.prototype = {
    constructor: DDLS.Object,
    dispose: function() {
        this._matrix = null;
        this._coordinates = null;
        this._constraintShape = null;
    },
    updateValuesFromMatrix: function() {
    },
    updateMatrixFromValues: function() {
        this._matrix.identity();
        this._matrix.translate(-this._pivotX,-this._pivotY);
        this._matrix.scale(this._scaleX,this._scaleY);
        this._matrix.rotate(this._rotation);
        this._matrix.translate(this._x,this._y);
    }
};
DDLS.Segment = function(x,y) {
    this.id = DDLS.SegmentID;
    DDLS.SegmentID ++;
    this.edges = [];
    this.fromShape = null;
};
DDLS.Segment.prototype = {
    constructor: DDLS.Segment,
    addEdge: function(edge) {
        if ( this.edges.indexOf(edge) == -1 && this.edges.indexOf(edge.oppositeEdge) == -1 ) this.edges.push(edge);
    },
    removeEdge: function(edge) {
        var index = this.edges.indexOf(edge);
        if ( index == -1 ) index = this.edges.indexOf(edge.oppositeEdge);
        if ( index != -1 ) this.edges.splice(index, 1);
    },
    dispose: function() {
        this.edges = null;
        this.fromShape = null;
    },
    toString: function() {
        return "seg_id " + this.id;
    }
};
DDLS.Shape = function() {
    this.id = DDLS.ShapeID;
    DDLS.ShapeID ++;
    this.segments = [];
};
DDLS.Shape.prototype = {
    constructor: DDLS.Shape,
    dispose: function() {
        while(this.segments.length > 0) this.segments.pop().dispose();
        this.segments = null;
    }
};
//-------------------------
//     EDGE
//-------------------------

DDLS.FromEdgeToRotatedEdges = function() {
};


//-------------------------
//     FACE
//-------------------------

//!\\ not used
DDLS.FromFaceToInnerVertices = function() {
   // this._fromFace = null;
  //  this._nextEdge = null;

    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });

};
DDLS.FromFaceToInnerVertices.prototype = {
    /*set_fromFace: function(value) {
        this._fromFace = value;
        this._nextEdge = this._fromFace.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultVertex = this._nextEdge.originVertex;
            this._nextEdge = this._nextEdge.nextLeftEdge;
            if(this._nextEdge == this._fromFace.edge) this._nextEdge = null;
        } else this._resultVertex = null;
        return this._resultVertex;
    }
};

DDLS.FromFaceToInnerEdges = function() {
    //this._fromFace = null;
    //this._nextEdge = null;
    
    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });
};
DDLS.FromFaceToInnerEdges.prototype = {
    /*set_fromFace: function(value) {
        this._fromFace = value;
        this._nextEdge = this._fromFace.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge;
            this._nextEdge = this._nextEdge.nextLeftEdge;
            if(this._nextEdge == this._fromFace.edge) this._nextEdge = null;
        } else this._resultEdge = null;
        return this._resultEdge;
    }
};

//!\\ not used
DDLS.FromFaceToNeighbourFaces = function() {
   // this._fromFace = null;
   // this._nextEdge = null;
    Object.defineProperty(this, 'fromFace', {
        set: function(value) { 
            this._fromFace = value;
            this._nextEdge = this._fromFace.edge;
        }
    });
};
DDLS.FromFaceToNeighbourFaces.prototype = {
    /*set_fromFace: function(value) {
        this._fromFace = value;
        this._nextEdge = this._fromFace.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            do{
                this._resultFace = this._nextEdge.rightFace;
                this._nextEdge = this._nextEdge.nextLeftEdge;
                if(this._nextEdge == this._fromFace.edge){
                    this._nextEdge = null;
                    if ( ! this._resultFace.isReal ) this._resultFace = null;
                    break;
                }
            } while ( ! this._resultFace.isReal )
        } else this._resultFace = null;
        return this._resultFace;
    }
};


//-------------------------
//     MESH
//-------------------------

DDLS.FromMeshToVertices = function() {
    //this._fromMesh = null;
    //this._currIndex = 0;
    Object.defineProperty(this, 'fromMesh', {
        set: function(value) { 
            this._fromMesh = value;
            this._currIndex = 0;
        }
    });
};
DDLS.FromMeshToVertices.prototype = {
    /*set_fromMesh: function(value) {
        this._fromMesh = value;
        this._currIndex = 0;
        return value;
    },*/
    next: function() {
        do if(this._currIndex < this._fromMesh._vertices.length) {
            this._resultVertex = this._fromMesh._vertices[this._currIndex];
            this._currIndex++;
        } else {
            this._resultVertex = null;
            break;
        } while(!this._resultVertex.isReal);
        return this._resultVertex;
    }
};

//!\\ not used
DDLS.FromMeshToFaces = function() {
    //this._fromMesh = null;
    //this._currIndex = 0;
    Object.defineProperty(this, 'fromMesh', {
        set: function(value) { 
            this._fromMesh = value;
            this._currIndex = 0;
        }
    });
};
DDLS.FromMeshToFaces.prototype = {
    /*set_fromMesh: function(value) {
        this._fromMesh = value;
        this._currIndex = 0;
        return value;
    },*/
    next: function() {
        do if(this._currIndex < this._fromMesh._faces.length) {
            this._resultFace = this._fromMesh._faces[this._currIndex];
            this._currIndex++;
        } else {
            this._resultFace = null;
            break;
        } while(!this._resultFace.isReal);
        return this._resultFace;
    }
};


//-------------------------
//     VERTEX
//-------------------------

DDLS.FromVertexToHoldingFaces = function() {
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge;
        }
    });
};
DDLS.FromVertexToHoldingFaces.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) do {
            this._resultFace = this._nextEdge.leftFace;
            this._nextEdge = this._nextEdge.rotLeftEdge;
            if(this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
                if(!this._resultFace.isReal) this._resultFace = null;
                break;
            }
        } while(!this._resultFace.isReal); else this._resultFace = null;
        return this._resultFace;
    }
};


DDLS.FromVertexToIncomingEdges = function() {
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge
            while(!this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        }
    });
};
DDLS.FromVertexToIncomingEdges.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        while(!this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge.oppositeEdge;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
                if(this._nextEdge == this._fromVertex.edge) {
                    this._nextEdge = null;
                    break;
                }
            } while(!this._nextEdge.isReal);
        } else this._resultEdge = null;
        return this._resultEdge;
    }
};


DDLS.FromVertexToOutgoingEdges = function() {
    this.realEdgesOnly = true;
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge;
            if(this._nextEdge!=null)
            while(this.realEdgesOnly && !this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        }
    });
};
DDLS.FromVertexToOutgoingEdges.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        while(this.realEdgesOnly && !this._nextEdge.isReal) this._nextEdge = this._nextEdge.rotLeftEdge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null) {
            this._resultEdge = this._nextEdge;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
                if(this._nextEdge == this._fromVertex.edge) {
                    this._nextEdge = null;
                    break;
                }
            } while(this.realEdgesOnly && !this._nextEdge.isReal);
        } else this._resultEdge = null;
        return this._resultEdge;
    }
};


//!\\ not used
DDLS.FromVertexToNeighbourVertices = function() {
    //this._fromVertex = null;
    //this._nextEdge = null;
    Object.defineProperty(this, 'fromVertex', {
        set: function(value) { 
            this._fromVertex = value;
            this._nextEdge = this._fromVertex.edge
        }
    });
};
DDLS.FromVertexToNeighbourVertices.prototype = {
    /*set_fromVertex: function(value) {
        this._fromVertex = value;
        this._nextEdge = this._fromVertex.edge;
        return value;
    },*/
    next: function() {
        if(this._nextEdge != null){
            this._resultVertex = this._nextEdge.destinationVertex;
            do {
                this._nextEdge = this._nextEdge.rotLeftEdge;
            } while(!this._nextEdge.isReal);

            if(this._nextEdge == this._fromVertex.edge) {
                this._nextEdge = null;
            }
        }
        else this._resultVertex = null;
        return this._resultVertex;
    }
};
DDLS.Geom2D = {};

DDLS.Geom2D.__samples = [];
DDLS.Geom2D.__circumcenter = new DDLS.Point();

DDLS.Geom2D.locatePosition = function(x,y,mesh) {
    if(DDLS.Geom2D._randGen == null) DDLS.Geom2D._randGen = new DDLS.RandGenerator();
    DDLS.Geom2D._randGen.seed = (x * 10 + 4 * y | 0);
    var i;
    DDLS.Geom2D.__samples.splice(0,DDLS.Geom2D.__samples.length);
    var numSamples = DDLS.int(DDLS.pow(mesh._vertices.length,0.333333333333333315));
    DDLS.Geom2D._randGen.rangeMin = 0;
    DDLS.Geom2D._randGen.rangeMax = mesh._vertices.length - 1;
    var _g = 0, i1, _rnd;
    while(_g < numSamples) {
        i1 = _g++;
        _rnd = DDLS.Geom2D._randGen.next();
        DDLS.Debug.assertFalse(_rnd < 0 || _rnd > mesh._vertices.length - 1,"_rnd: " + _rnd,{ fileName : "Geom2D.hx", lineNumber : 67, className : "DDLS.Geom2D", methodName : "locatePosition"});
        DDLS.Debug.assertFalse(mesh._vertices == null,"vertices: " + mesh._vertices.length,{ fileName : "Geom2D.hx", lineNumber : 68, className : "DDLS.Geom2D", methodName : "locatePosition"});
        DDLS.Geom2D.__samples.push(mesh._vertices[_rnd]);
    }
    var currVertex;
    var currVertexPos;
    var distSquared;
    var minDistSquared = DDLS.POSITIVE_INFINITY;
    var closedVertex = null;
    var _g1 = 0, i2;
    while(_g1 < numSamples) {
        i2 = _g1++;
        currVertex = DDLS.Geom2D.__samples[i2];
        currVertexPos = currVertex.pos;
        distSquared = (currVertexPos.x - x) * (currVertexPos.x - x) + (currVertexPos.y - y) * (currVertexPos.y - y);
        if(distSquared < minDistSquared) {
            minDistSquared = distSquared;
            closedVertex = currVertex;
        }
    }
    var currFace;
    var iterFace = new DDLS.FromVertexToHoldingFaces();
    iterFace.fromVertex = closedVertex;
    currFace = iterFace.next();
    var faceVisited = new DDLS.Dictionary();
    var currEdge;
    var iterEdge = new DDLS.FromFaceToInnerEdges();
    var objectContainer = DDLS.Intersection.ENull;
    var relativPos;
    var numIter = 0;
    //while(faceVisited.get(currFace) || !(objectContainer = DDLS.Geom2D.isInFace(x,y,currFace))){
    while(faceVisited.get(currFace) || (function(_this) {
        var _r;
        var _g2 = objectContainer = DDLS.Geom2D.isInFace(x,y,currFace);
        _r = (function(_this) {
            /*var _r;
            switch(_g2[1]) {
                case 3: _r = true; break;
                default: _r = false;
            }
            return _r;*/
            return _g2[1] == 3 ? true : false;
        }(_this));
        return _r;
    }(this))) {
        //faceVisited.get(currFace);
        numIter++;
        if(numIter == 50) DDLS.Log("WALK TAKE MORE THAN 50 LOOP");
        iterEdge.fromFace = currFace;
        do {
            currEdge = iterEdge.next();
            if(currEdge == null) {
                DDLS.Log("KILL PATH");
                return DDLS.Intersection.ENull;
            }
            relativPos = DDLS.Geom2D.getRelativePosition(x,y,currEdge);
        } while(relativPos == 1 || relativPos == 0);
        currFace = currEdge.rightFace;
    }
    return objectContainer;
};
DDLS.Geom2D.isCircleIntersectingAnyConstraint = function(x,y,radius,mesh) {
    if(x <= 0 || x >= mesh.width || y <= 0 || y >= mesh.height) return true;
    var loc = DDLS.Geom2D.locatePosition(x,y,mesh);
    var face;
    switch(loc[1]) {
        case 0: face = loc[2].edge.leftFace; break;
        case 1: face = loc[2].leftFace; break;
        case 2: face = loc[2]; break;
        case 3: face = null; break;
    }
    var radiusSquared = radius * radius;
    var pos;
    var distSquared;
    pos = face.edge.originVertex.pos;
    distSquared = (pos.x - x) * (pos.x - x) + (pos.y - y) * (pos.y - y);
    if(distSquared <= radiusSquared) return true;
    pos = face.edge.nextLeftEdge.originVertex.pos;
    distSquared = (pos.x - x) * (pos.x - x) + (pos.y - y) * (pos.y - y);
    if(distSquared <= radiusSquared) return true;
    pos = face.edge.nextLeftEdge.nextLeftEdge.originVertex.pos;
    distSquared = (pos.x - x) * (pos.x - x) + (pos.y - y) * (pos.y - y);
    if(distSquared <= radiusSquared) return true;
    var edgesToCheck = [];
    edgesToCheck.push(face.edge);
    edgesToCheck.push(face.edge.nextLeftEdge);
    edgesToCheck.push(face.edge.nextLeftEdge.nextLeftEdge);
    var edge, pos1, pos2;
    var checkedEdges = new DDLS.Dictionary();
    var intersecting;
    while(edgesToCheck.length > 0) {
        edge = edgesToCheck.pop();
        checkedEdges.set(edge,true);
        //true;
        pos1 = edge.originVertex.pos;
        pos2 = edge.destinationVertex.pos;
        intersecting = DDLS.Geom2D.intersectionsSegmentCircle(pos1.x,pos1.y,pos2.x,pos2.y,x,y,radius);
        if(intersecting) {
            if(edge.isConstrained) return true; 
            else {
                edge = edge.oppositeEdge.nextLeftEdge;
                if(!checkedEdges.get(edge) && !checkedEdges.get(edge.oppositeEdge) && edgesToCheck.indexOf(edge) == -1 && edgesToCheck.indexOf(edge.oppositeEdge) == -1) edgesToCheck.push(edge);

                edge = edge.nextLeftEdge;
                if(!checkedEdges.get(edge) && !checkedEdges.get(edge.oppositeEdge) && edgesToCheck.indexOf(edge) == -1 && edgesToCheck.indexOf(edge.oppositeEdge) == -1) edgesToCheck.push(edge);
            }
        }
    }
    return false;
};
DDLS.Geom2D.getDirection = function(x1,y1,x2,y2,x3,y3) {
    var dot = (x3 - x1) * (y2 - y1) + (y3 - y1) * (-x2 + x1);
    if(dot == 0) return 0; 
    else if(dot > 0) return 1; 
    else return -1;
};
DDLS.Geom2D.getDirection2 = function(x1,y1,x2,y2,x3,y3) {
    var dot = (x3 - x1) * (y2 - y1) + (y3 - y1) * (-x2 + x1);
    if(dot == 0) return 0; 
    else if(dot > 0) {
        if(DDLS.Geom2D.distanceSquaredPointToLine(x3,y3,x1,y1,x2,y2) <= 0.0001) return 0; 
        else return 1;
    } else if(DDLS.Geom2D.distanceSquaredPointToLine(x3,y3,x1,y1,x2,y2) <= 0.0001) return 0; 
    else return -1;
    //return 0;
};
DDLS.Geom2D.getRelativePosition = function(x,y,eUp) {
    return DDLS.Geom2D.getDirection(eUp.originVertex.pos.x,eUp.originVertex.pos.y,eUp.destinationVertex.pos.x,eUp.destinationVertex.pos.y,x,y);
};
DDLS.Geom2D.getRelativePosition2 = function(x,y,eUp) {
    return DDLS.Geom2D.getDirection2(eUp.originVertex.pos.x,eUp.originVertex.pos.y,eUp.destinationVertex.pos.x,eUp.destinationVertex.pos.y,x,y);
};
DDLS.Geom2D.isInFace = function(x,y,polygon) {
    var result = DDLS.Intersection.ENull;
    var e1_2 = polygon.edge;
    var e2_3 = e1_2.nextLeftEdge;
    var e3_1 = e2_3.nextLeftEdge;
    if(DDLS.Geom2D.getRelativePosition(x,y,e1_2) >= 0 && DDLS.Geom2D.getRelativePosition(x,y,e2_3) >= 0 && DDLS.Geom2D.getRelativePosition(x,y,e3_1) >= 0) {
        var v1 = e1_2.originVertex;
        var v2 = e2_3.originVertex;
        var v3 = e3_1.originVertex;
        var x1 = v1.pos.x;
        var y1 = v1.pos.y;
        var x2 = v2.pos.x;
        var y2 = v2.pos.y;
        var x3 = v3.pos.x;
        var y3 = v3.pos.y;
        var v_v1squaredLength = (x1 - x) * (x1 - x) + (y1 - y) * (y1 - y);
        var v_v2squaredLength = (x2 - x) * (x2 - x) + (y2 - y) * (y2 - y);
        var v_v3squaredLength = (x3 - x) * (x3 - x) + (y3 - y) * (y3 - y);
        var v1_v2squaredLength = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        var v2_v3squaredLength = (x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2);
        var v3_v1squaredLength = (x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3);
        var dot_v_v1v2 = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
        var dot_v_v2v3 = (x - x2) * (x3 - x2) + (y - y2) * (y3 - y2);
        var dot_v_v3v1 = (x - x3) * (x1 - x3) + (y - y3) * (y1 - y3);
        var v_e1_2squaredLength = v_v1squaredLength - dot_v_v1v2 * dot_v_v1v2 / v1_v2squaredLength;
        var v_e2_3squaredLength = v_v2squaredLength - dot_v_v2v3 * dot_v_v2v3 / v2_v3squaredLength;
        var v_e3_1squaredLength = v_v3squaredLength - dot_v_v3v1 * dot_v_v3v1 / v3_v1squaredLength;
        var closeTo_e1_2 = v_e1_2squaredLength <= 0.0001;
        var closeTo_e2_3 = v_e2_3squaredLength <= 0.0001;
        var closeTo_e3_1 = v_e3_1squaredLength <= 0.0001;
        if(closeTo_e1_2) {
            if(closeTo_e3_1) result = DDLS.Intersection.EVertex(v1); 
            else if(closeTo_e2_3) result = DDLS.Intersection.EVertex(v2); 
            else result = DDLS.Intersection.EEdge(e1_2);
        } else if(closeTo_e2_3) {
            if(closeTo_e3_1) result = DDLS.Intersection.EVertex(v3); 
            else result = DDLS.Intersection.EEdge(e2_3);
        } else if(closeTo_e3_1) result = DDLS.Intersection.EEdge(e3_1); 
        else result = DDLS.Intersection.EFace(polygon);
    }
    return result;
};
DDLS.Geom2D.clipSegmentByTriangle = function(s1x,s1y,s2x,s2y,t1x,t1y,t2x,t2y,t3x,t3y,pResult1,pResult2) {
    var side1_1;
    var side1_2;
    side1_1 = DDLS.Geom2D.getDirection(t1x,t1y,t2x,t2y,s1x,s1y);
    side1_2 = DDLS.Geom2D.getDirection(t1x,t1y,t2x,t2y,s2x,s2y);
    if(side1_1 <= 0 && side1_2 <= 0) return false;
    var side2_1;
    var side2_2;
    side2_1 = DDLS.Geom2D.getDirection(t2x,t2y,t3x,t3y,s1x,s1y);
    side2_2 = DDLS.Geom2D.getDirection(t2x,t2y,t3x,t3y,s2x,s2y);
    if(side2_1 <= 0 && side2_2 <= 0) return false;
    var side3_1;
    var side3_2;
    side3_1 = DDLS.Geom2D.getDirection(t3x,t3y,t1x,t1y,s1x,s1y);
    side3_2 = DDLS.Geom2D.getDirection(t3x,t3y,t1x,t1y,s2x,s2y);
    if(side3_1 <= 0 && side3_2 <= 0) return false;
    if(side1_1 >= 0 && side2_1 >= 0 && side3_1 >= 0 && (side1_2 >= 0 && side2_2 >= 0 && side3_2 >= 0)) {
        pResult1.x = s1x;
        pResult1.y = s1y;
        pResult2.x = s2x;
        pResult2.y = s2y;
        return true;
    }
    var n = 0;
    if(DDLS.Geom2D.intersections2segments(s1x,s1y,s2x,s2y,t1x,t1y,t2x,t2y,pResult1,null)) n++;
    if(n == 0) {
        if(DDLS.Geom2D.intersections2segments(s1x,s1y,s2x,s2y,t2x,t2y,t3x,t3y,pResult1,null)) n++;
    } else if(DDLS.Geom2D.intersections2segments(s1x,s1y,s2x,s2y,t2x,t2y,t3x,t3y,pResult2,null)) {
        if(-0.01 > pResult1.x - pResult2.x || pResult1.x - pResult2.x > 0.01 || -0.01 > pResult1.y - pResult2.y || pResult1.y - pResult2.y > 0.01) n++;
    }
    if(n == 0) {
        if(DDLS.Geom2D.intersections2segments(s1x,s1y,s2x,s2y,t3x,t3y,t1x,t1y,pResult1,null)) n++;
    } else if(n == 1) {
        if(DDLS.Geom2D.intersections2segments(s1x,s1y,s2x,s2y,t3x,t3y,t1x,t1y,pResult2,null)) {
            if(-0.01 > pResult1.x - pResult2.x || pResult1.x - pResult2.x > 0.01 || -0.01 > pResult1.y - pResult2.y || pResult1.y - pResult2.y > 0.01) n++;
        }
    }
    if(n == 1) {
        if(side1_1 >= 0 && side2_1 >= 0 && side3_1 >= 0) {
            pResult2.x = s1x;
            pResult2.y = s1y;
        } else if(side1_2 >= 0 && side2_2 >= 0 && side3_2 >= 0) {
            pResult2.x = s2x;
            pResult2.y = s2y;
        } else n = 0;
    }
    if(n > 0) return true; 
    else return false;
};
DDLS.Geom2D.isSegmentIntersectingTriangle = function(s1x,s1y,s2x,s2y,t1x,t1y,t2x,t2y,t3x,t3y) {
    var side1_1;
    var side1_2;
    side1_1 = DDLS.Geom2D.getDirection(t1x,t1y,t2x,t2y,s1x,s1y);
    side1_2 = DDLS.Geom2D.getDirection(t1x,t1y,t2x,t2y,s2x,s2y);
    if(side1_1 <= 0 && side1_2 <= 0) return false;
    var side2_1;
    var side2_2;
    side2_1 = DDLS.Geom2D.getDirection(t2x,t2y,t3x,t3y,s1x,s1y);
    side2_2 = DDLS.Geom2D.getDirection(t2x,t2y,t3x,t3y,s2x,s2y);
    if(side2_1 <= 0 && side2_2 <= 0) return false;
    var side3_1;
    var side3_2;
    side3_1 = DDLS.Geom2D.getDirection(t3x,t3y,t1x,t1y,s1x,s1y);
    side3_2 = DDLS.Geom2D.getDirection(t3x,t3y,t1x,t1y,s2x,s2y);
    if(side3_1 <= 0 && side3_2 <= 0) return false;
    if(side1_1 == 1 && side2_1 == 1 && side3_1 == 1) return true;
    if(side1_1 == 1 && side2_1 == 1 && side3_1 == 1) return true;
    var side1;
    var side2;
    if(side1_1 == 1 && side1_2 <= 0 || side1_1 <= 0 && side1_2 == 1) {
        side1 = DDLS.Geom2D.getDirection(s1x,s1y,s2x,s2y,t1x,t1y);
        side2 = DDLS.Geom2D.getDirection(s1x,s1y,s2x,s2y,t2x,t2y);
        if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
    }
    if(side2_1 == 1 && side2_2 <= 0 || side2_1 <= 0 && side2_2 == 1) {
        side1 = DDLS.Geom2D.getDirection(s1x,s1y,s2x,s2y,t2x,t2y);
        side2 = DDLS.Geom2D.getDirection(s1x,s1y,s2x,s2y,t3x,t3y);
        if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
    }
    if(side3_1 == 1 && side3_2 <= 0 || side3_1 <= 0 && side3_2 == 1) {
        side1 = DDLS.Geom2D.getDirection(s1x,s1y,s2x,s2y,t3x,t3y);
        side2 = DDLS.Geom2D.getDirection(s1x,s1y,s2x,s2y,t1x,t1y);
        if(side1 == 1 && side2 <= 0 || side1 <= 0 && side2 == 1) return true;
    }
    return false;
};
DDLS.Geom2D.isDelaunay = function(edge) {
    var vLeft = edge.originVertex;
    var vRight = edge.destinationVertex;
    var vCorner = edge.nextLeftEdge.destinationVertex;
    var vOpposite = edge.nextRightEdge.destinationVertex;
    DDLS.Geom2D.getCircumcenter(vCorner.pos.x,vCorner.pos.y,vLeft.pos.x,vLeft.pos.y,vRight.pos.x,vRight.pos.y,DDLS.Geom2D.__circumcenter);
    var squaredRadius = (vCorner.pos.x - DDLS.Geom2D.__circumcenter.x) * (vCorner.pos.x - DDLS.Geom2D.__circumcenter.x) + (vCorner.pos.y - DDLS.Geom2D.__circumcenter.y) * (vCorner.pos.y - DDLS.Geom2D.__circumcenter.y);
    var squaredDistance = (vOpposite.pos.x - DDLS.Geom2D.__circumcenter.x) * (vOpposite.pos.x - DDLS.Geom2D.__circumcenter.x) + (vOpposite.pos.y - DDLS.Geom2D.__circumcenter.y) * (vOpposite.pos.y - DDLS.Geom2D.__circumcenter.y);
    return squaredDistance >= squaredRadius;
};
DDLS.Geom2D.getCircumcenter = function(x1,y1,x2,y2,x3,y3,result) {
    if(result == null) result = new DDLS.Point();
    var m1 = (x1 + x2) * 0.5;
    var m2 = (y1 + y2) * 0.5;
    var m3 = (x1 + x3) * 0.5;
    var m4 = (y1 + y3) * 0.5;
    var t1 = (m1 * (x1 - x3) + (m2 - m4) * (y1 - y3) + m3 * (x3 - x1)) / (x1 * (y3 - y2) + x2 * (y1 - y3) + x3 * (y2 - y1));
    result.x = m1 + t1 * (y2 - y1);
    result.y = m2 - t1 * (x2 - x1);
    return result;
};
DDLS.Geom2D.intersections2segments = function(s1p1x,s1p1y,s1p2x,s1p2y,s2p1x,s2p1y,s2p2x,s2p2y,posIntersection,paramIntersection,infiniteLineMode) {
    if(infiniteLineMode == null) infiniteLineMode = false;
    var t1 = 0;
    var t2 = 0;
    var result;
    var divisor = (s1p1x - s1p2x) * (s2p1y - s2p2y) + (s1p2y - s1p1y) * (s2p1x - s2p2x);
    if(divisor == 0) result = false; 
    else {
        result = true;
        var invDivisor = 1 / divisor;
        if(!infiniteLineMode || posIntersection != null || paramIntersection != null) {
            t1 = (s1p1x * (s2p1y - s2p2y) + s1p1y * (s2p2x - s2p1x) + s2p1x * s2p2y - s2p1y * s2p2x) * invDivisor;
            t2 = (s1p1x * (s2p1y - s1p2y) + s1p1y * (s1p2x - s2p1x) - s1p2x * s2p1y + s1p2y * s2p1x) * invDivisor;
            if(!infiniteLineMode && !(0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1)) result = false;
        }
    }
    if(result) {
        if(posIntersection != null) {
            posIntersection.x = s1p1x + t1 * (s1p2x - s1p1x);
            posIntersection.y = s1p1y + t1 * (s1p2y - s1p1y);
        }
        if(paramIntersection != null) {
            paramIntersection.push(t1);
            paramIntersection.push(t2);
        }
    }
    return result;
};
DDLS.Geom2D.intersections2edges = function(edge1,edge2,posIntersection,paramIntersection,infiniteLineMode) {
    if(infiniteLineMode == null) infiniteLineMode = false;
    return DDLS.Geom2D.intersections2segments(edge1.originVertex.pos.x,edge1.originVertex.pos.y,edge1.destinationVertex.pos.x,edge1.destinationVertex.pos.y,edge2.originVertex.pos.x,edge2.originVertex.pos.y,edge2.destinationVertex.pos.x,edge2.destinationVertex.pos.y,posIntersection,paramIntersection,infiniteLineMode);
};
DDLS.Geom2D.isConvex = function(edge) {
    var result = true;
    var eLeft;
    var vRight;
    eLeft = edge.nextLeftEdge.oppositeEdge;
    vRight = edge.nextRightEdge.destinationVertex;
    if(DDLS.Geom2D.getRelativePosition(vRight.pos.x,vRight.pos.y,eLeft) != -1) result = false; else {
        eLeft = edge.prevRightEdge;
        vRight = edge.prevLeftEdge.originVertex;
        if(DDLS.Geom2D.getRelativePosition(vRight.pos.x,vRight.pos.y,eLeft) != -1) result = false;
    }
    return result;
};
DDLS.Geom2D.projectOrthogonaly = function(vertexPos,edge) {
    var a = edge.originVertex.pos.x;
    var b = edge.originVertex.pos.y;
    var c = edge.destinationVertex.pos.x;
    var d = edge.destinationVertex.pos.y;
    var e = vertexPos.x;
    var f = vertexPos.y;
    var t1 = (a * a - a * c - a * e + b * b - b * d - b * f + c * e + d * f) / (a * a - 2 * a * c + b * b - 2 * b * d + c * c + d * d);
    vertexPos.x = a + t1 * (c - a);
    vertexPos.y = b + t1 * (d - b);
};
DDLS.Geom2D.projectOrthogonalyOnSegment = function(px, py, sp1x, sp1y, sp2x, sp2y, result) {
    var a = sp1x;
    var b = sp1y;
    var c = sp2x;
    var d = sp2y;
    var e = px;
    var f = py;       
    var t1 = (a*a - a*c - a*e + b*b - b*d - b*f + c*e + d*f) / (a*a - 2*a*c + b*b - 2*b*d + c*c + d*d);
    result.x = a + t1*(c - a);
    result.y = b + t1*(d - b);
};
DDLS.Geom2D.intersections2Circles = function(cx1,cy1,r1,cx2,cy2,r2,result) {
    var distRadiusSQRD = (cx2 - cx1) * (cx2 - cx1) + (cy2 - cy1) * (cy2 - cy1);
    var invDR = 1 / (2 * distRadiusSQRD);
    if((cx1 != cx2 || cy1 != cy2) && distRadiusSQRD <= (r1 + r2) * (r1 + r2) && distRadiusSQRD >= (r1 - r2) * (r1 - r2)) {
        var transcendPart = DDLS.sqrt(((r1 + r2) * (r1 + r2) - distRadiusSQRD) * (distRadiusSQRD - (r2 - r1) * (r2 - r1)));
        var xFirstPart = (cx1 + cx2) * 0.5 + (cx2 - cx1) * (r1 * r1 - r2 * r2) * invDR;
        var yFirstPart = (cy1 + cy2) * 0.5 + (cy2 - cy1) * (r1 * r1 - r2 * r2) * invDR;
        var xFactor = (cy2 - cy1) * invDR;
        var yFactor = (cx2 - cx1) * invDR;
        if(result != null) {
            var _g = 0;
            var _g1 = [xFirstPart + xFactor * transcendPart,yFirstPart - yFactor * transcendPart,xFirstPart - xFactor * transcendPart,yFirstPart + yFactor * transcendPart];
            while(_g < _g1.length) {
                var f = _g1[_g];
                ++_g;
                result.push(f);
            }
        }
        return true;
    } else return false;
};
DDLS.Geom2D.intersectionsSegmentCircle = function(p0x,p0y,p1x,p1y,cx,cy,r,result) {
    var p0xSQD = p0x * p0x;
    var p0ySQD = p0y * p0y;
    var a = p1y * p1y - 2 * p1y * p0y + p0ySQD + p1x * p1x - 2 * p1x * p0x + p0xSQD;
    var b = 2 * p0y * cy - 2 * p0xSQD + 2 * p1y * p0y - 2 * p0ySQD + 2 * p1x * p0x - 2 * p1x * cx + 2 * p0x * cx - 2 * p1y * cy;
    var c = p0ySQD + cy * cy + cx * cx - 2 * p0y * cy - 2 * p0x * cx + p0xSQD - r * r;
    var delta = b * b - 4 * a * c;
    var deltaSQRT;
    var t0;
    var t1;
    if(delta < 0) return false; else if(delta == 0) {
        t0 = -b / (2 * a);
        if(t0 < 0 || t0 > 1) return false;
        if(result != null) {
            var _g = 0;
            var _g1 = [p0x + t0 * (p1x - p0x),p0y + t0 * (p1y - p0y),t0];
            while(_g < _g1.length) {
                var f = _g1[_g];
                ++_g;
                result.push(f);
            }
        }
        return true;
    } else {
        deltaSQRT = DDLS.sqrt(delta);
        t0 = (-b + deltaSQRT) / (2 * a);
        t1 = (-b - deltaSQRT) / (2 * a);
        var intersecting = false;
        if(0 <= t0 && t0 <= 1) {
            if(result != null) {
                var _g2 = 0;
                var _g11 = [p0x + t0 * (p1x - p0x),p0y + t0 * (p1y - p0y),t0];
                while(_g2 < _g11.length) {
                    var f1 = _g11[_g2];
                    ++_g2;
                    result.push(f1);
                }
            }
            intersecting = true;
        }
        if(0 <= t1 && t1 <= 1) {
            if(result != null) {
                var _g3 = 0;
                var _g12 = [p0x + t1 * (p1x - p0x),p0y + t1 * (p1y - p0y),t1];
                while(_g3 < _g12.length) {
                    var f2 = _g12[_g3];
                    ++_g3;
                    result.push(f2);
                }
            }
            intersecting = true;
        }
        return intersecting;
    }
};
DDLS.Geom2D.intersectionsLineCircle = function(p0x,p0y,p1x,p1y,cx,cy,r,result) {
    var p0xSQD = p0x * p0x;
    var p0ySQD = p0y * p0y;
    var a = p1y * p1y - 2 * p1y * p0y + p0ySQD + p1x * p1x - 2 * p1x * p0x + p0xSQD;
    var b = 2 * p0y * cy - 2 * p0xSQD + 2 * p1y * p0y - 2 * p0ySQD + 2 * p1x * p0x - 2 * p1x * cx + 2 * p0x * cx - 2 * p1y * cy;
    var c = p0ySQD + cy * cy + cx * cx - 2 * p0y * cy - 2 * p0x * cx + p0xSQD - r * r;
    var delta = b * b - 4 * a * c;
    var deltaSQRT;
    var t0;
    var t1;
    if(delta < 0) return false; else if(delta == 0) {
        t0 = -b / (2 * a);
        var _g = 0;
        var _g1 = [p0x + t0 * (p1x - p0x),p0y + t0 * (p1y - p0y),t0];
        while(_g < _g1.length) {
            var f = _g1[_g];
            ++_g;
            result.push(f);
        }
    } else if(delta > 0) {
        deltaSQRT = DDLS.sqrt(delta);
        t0 = (-b + deltaSQRT) / (2 * a);
        t1 = (-b - deltaSQRT) / (2 * a);
        var _g2 = 0;
        var _g11 = [p0x + t0 * (p1x - p0x),p0y + t0 * (p1y - p0y),t0,p0x + t1 * (p1x - p0x),p0y + t1 * (p1y - p0y),t1];
        while(_g2 < _g11.length) {
            var f1 = _g11[_g2];
            ++_g2;
            result.push(f1);
        }
    }
    return true;
};
DDLS.Geom2D.tangentsPointToCircle = function(px,py,cx,cy,r,result) {
    var c2x = (px + cx) * 0.5;
    var c2y = (py + cy) * 0.5;
    var r2 = 0.5 * DDLS.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
    return DDLS.Geom2D.intersections2Circles(c2x,c2y,r2,cx,cy,r,result);
};
DDLS.Geom2D.tangentsCrossCircleToCircle = function(r,c1x,c1y,c2x,c2y,result) {
    var distance = DDLS.sqrt((c1x - c2x) * (c1x - c2x) + (c1y - c2y) * (c1y - c2y));
    var radius = distance * 0.25;
    var centerX = c1x + (c2x - c1x) * 0.25;
    var centerY = c1y + (c2y - c1y) * 0.25;
    if(DDLS.Geom2D.intersections2Circles(c1x,c1y,r,centerX,centerY,radius,result)) {
        var t1x = result[0];
        var t1y = result[1];
        var t2x = result[2];
        var t2y = result[3];
        var midX = (c1x + c2x) * 0.5;
        var midY = (c1y + c2y) * 0.5;
        var dotProd = (t1x - midX) * (c2y - c1y) + (t1y - midY) * (-c2x + c1x);
        var tproj = dotProd / (distance * distance);
        var projx = midX + tproj * (c2y - c1y);
        var projy = midY - tproj * (c2x - c1x);
        var t4x = 2 * projx - t1x;
        var t4y = 2 * projy - t1y;
        var t3x = t4x + t2x - t1x;
        var t3y = t2y + t4y - t1y;
        var _g = 0;
        var _g1 = [t3x,t3y,t4x,t4y];
        while(_g < _g1.length) {
            var f = _g1[_g];
            ++_g;
            result.push(f);
        }
        return true;
    } else return false;
};
DDLS.Geom2D.tangentsParalCircleToCircle = function(r,c1x,c1y,c2x,c2y,result) {
    var distance = DDLS.sqrt((c1x - c2x) * (c1x - c2x) + (c1y - c2y) * (c1y - c2y));
    var invD = 1 / distance;
    var t1x = c1x + r * (c2y - c1y) * invD;
    var t1y = c1y + r * (-c2x + c1x) * invD;
    var t2x = 2 * c1x - t1x;
    var t2y = 2 * c1y - t1y;
    var t3x = t2x + c2x - c1x;
    var t3y = t2y + c2y - c1y;
    var t4x = t1x + c2x - c1x;
    var t4y = t1y + c2y - c1y;
    var _g = 0;
    var _g1 = [t1x,t1y,t2x,t2y,t3x,t3y,t4x,t4y];
    while(_g < _g1.length) {
        var f = _g1[_g];
        ++_g;
        result.push(f);
    }
};
DDLS.Geom2D.distanceSquaredPointToLine = function(px,py,ax,ay,bx,by) {
    var a_b_squaredLength = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
    var dotProduct = (px - ax) * (bx - ax) + (py - ay) * (by - ay);
    var p_a_squaredLength = (ax - px) * (ax - px) + (ay - py) * (ay - py);
    return p_a_squaredLength - dotProduct * dotProduct / a_b_squaredLength;
};
DDLS.Geom2D.distanceSquaredPointToSegment = function(px,py,ax,ay,bx,by) {
    var a_b_squaredLength = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
    var dotProduct = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / a_b_squaredLength;
    if(dotProduct < 0) return (px - ax) * (px - ax) + (py - ay) * (py - ay); else if(dotProduct <= 1) {
        var p_a_squaredLength = (ax - px) * (ax - px) + (ay - py) * (ay - py);
        return p_a_squaredLength - dotProduct * dotProduct * a_b_squaredLength;
    } else return (px - bx) * (px - bx) + (py - by) * (py - by);
};
DDLS.Geom2D.distanceSquaredVertexToEdge = function(vertex,edge) {
    return DDLS.Geom2D.distanceSquaredPointToSegment(vertex.pos.x,vertex.pos.y,edge.originVertex.pos.x,edge.originVertex.pos.y,edge.destinationVertex.pos.x,edge.destinationVertex.pos.y);
};
DDLS.Geom2D.pathLength = function(path) {
    var sumDistance = 0.;
    var fromX = path[0];
    var fromY = path[1];
    var nextX;
    var nextY;
    var x;
    var y;
    var distance;
    var i = 2;
    while(i < path.length) {
        nextX = path[i];
        nextY = path[i + 1];
        x = nextX - fromX;
        y = nextY - fromY;
        distance = DDLS.sqrt(x * x + y * y);
        sumDistance += distance;
        fromX = nextX;
        fromY = nextY;
        i += 2;
    }
    return sumDistance;
};
DDLS.Mesh = function(width,height) {
    this.id = DDLS.MeshID;
    DDLS.MeshID++;
    this.__objectsUpdateInProgress = false;
    this.__centerVertex = null;
    this.width = width;
    this.height = height;
    this.clipping = true;
    
    this._edges = [];
    this._faces = [];
    this._objects = [];
    this._vertices = [];
    this.__edgesToCheck = [];
    this._constraintShapes = [];
};

DDLS.Mesh.prototype = {
    constructor: DDLS.Mesh,
    dispose: function() {
        while(this._vertices.length > 0) this._vertices.pop().dispose();
        this._vertices = null;
        while(this._edges.length > 0) this._edges.pop().dispose();
        this._edges = null;
        while(this._faces.length > 0) this._faces.pop().dispose();
        this._faces = null;
        while(this._constraintShapes.length > 0) this._constraintShapes.pop().dispose();
        this._constraintShapes = null;
        while(this._objects.length > 0) this._objects.pop().dispose();
        this._objects = null;
        this.__edgesToCheck = null;
        this.__centerVertex = null;
    },
    get___constraintShapes: function() {
        return this._constraintShapes;
    },
    buildFromRecord: function(rec) {
        var positions = rec.split(";");
        var i = 0;
        while(i < positions.length) {
            this.insertConstraintSegment(parseFloat(positions[i]),parseFloat(positions[i + 1]),parseFloat(positions[i + 2]),parseFloat(positions[i + 3]));
            i += 4;
        }
    },
    insertObject: function(object) {
        if(object.constraintShape != null) this.deleteObject(object);
        var shape = new DDLS.Shape();
        var segment;
        var coordinates = object.coordinates;
        var m = object.matrix;
        object.updateMatrixFromValues();
        var x1, y1, x2, y2;
        var i = 0;
        while(i < coordinates.length) {
            x1 = coordinates[i];
            y1 = coordinates[i + 1];
            x2 = coordinates[i + 2];
            y2 = coordinates[i + 3];
            segment = this.insertConstraintSegment(m.transformX(x1,y1),m.transformY(x1,y1),m.transformX(x2,y2),m.transformY(x2,y2));
            if(segment != null) {
                segment.fromShape = shape;
                shape.segments.push(segment);
            }
            i += 4;
        }
        this._constraintShapes.push(shape);
        object.constraintShape = shape;
        if(!this.__objectsUpdateInProgress) this._objects.push(object);
    },
    deleteObject: function(object) {
        if(object.constraintShape == null) return;
        this.deleteConstraintShape(object.constraintShape);
        object.constraintShape = null;
        if(!this.__objectsUpdateInProgress) {
            var index = this._objects.indexOf(object);
            this._objects.splice(index,1);
        }
    },
    updateObjects: function() {
        /*this.__objectsUpdateInProgress = true;
        var i = this._objects.length, o;
        while(i--) {
            o = this._objects[i];
            if(o.hasChanged) {
                this.deleteObject(o);
                this.insertObject(o);
                o.hasChanged = false;
            }
        }
        this.__objectsUpdateInProgress = false;*/
        
        this.__objectsUpdateInProgress = true;
        var _g1 = 0;
        var _g = this._objects.length;
        while(_g1 < _g) {
            var i = _g1++;
            if(this._objects[i].hasChanged) {
                this.deleteObject(this._objects[i]);
                this.insertObject(this._objects[i]);
                this._objects[i].hasChanged = false;
            }
        }
        this.__objectsUpdateInProgress = false;
    },

    // insert a new collection of constrained edges.
    // Coordinates parameter is a list with form [x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, ....]
    // where each 4-uple sequence (xi, yi, xi+1, yi+1) is a constraint segment (with i % 4 == 0)
    // and where each couple sequence (xi, yi) is a point.
    // Segments are not necessary connected.
    // Segments can overlap (then they will be automaticaly subdivided).
    insertConstraintShape: function(coordinates) {
        var shape = new DDLS.Shape();
        var segment = null;
        var i = 0;
        while(i < coordinates.length) {
            segment = this.insertConstraintSegment(coordinates[i],coordinates[i + 1],coordinates[i + 2],coordinates[i + 3]);
            if(segment != null) {
                segment.fromShape = shape;
                shape.segments.push(segment);
            }
            i += 4;
        }
        this._constraintShapes.push(shape);
        return shape;
    },
    deleteConstraintShape: function(shape) {
        var _g1 = 0;
        var _g = shape.segments.length;
        while(_g1 < _g) {
            var i = _g1++;
            this.deleteConstraintSegment(shape.segments[i]);
        }
        shape.dispose();
        this._constraintShapes.splice(this._constraintShapes.indexOf(shape),1);
    },
    insertConstraintSegment: function(x1,y1,x2,y2) {
        var newX1 = x1;
        var newY1 = y1;
        var newX2 = x2;
        var newY2 = y2;

        if ( (x1 > this.width && x2 > this.width) || (x1 < 0 && x2 < 0) || (y1 > this.height && y2 > this.height) || (y1 < 0 && y2 < 0)  ) return null;
        else{
            var nx = x2 - x1;
            var ny = y2 - y1;
            var tmin = DDLS.NEGATIVE_INFINITY;
            var tmax = DDLS.POSITIVE_INFINITY;
            
            if (nx != 0.0){
                var tx1 = (0 - x1)/nx;
                var tx2 = (this.width - x1)/nx;
                
                tmin = DDLS.max(tmin, DDLS.min(tx1, tx2));
                tmax = DDLS.min(tmax, DDLS.max(tx1, tx2));
            }
            if (ny != 0.0){
                var ty1 = (0 - y1)/ny;
                var ty2 = (this.height - y1)/ny;
                
                tmin = DDLS.max(tmin, DDLS.min(ty1, ty2));
                tmax = DDLS.min(tmax, DDLS.max(ty1, ty2));
            }
            if (tmax >= tmin){
                if (tmax < 1){
                    //Clip end point
                    newX2 = nx*tmax + x1;
                    newY2 = ny*tmax + y1;
                }
                if (tmin > 0){
                    //Clip start point
                    newX1 = nx*tmin + x1;
                    newY1 = ny*tmin + y1;
                }
            }
            else return null;
        }

        // we check the vertices insertions
        var vertexDown = this.insertVertex(newX1,newY1);
        if(vertexDown == null) return null;
        var vertexUp = this.insertVertex(newX2,newY2);
        if(vertexUp == null) return null;
        if(vertexDown === vertexUp) return null;

        //console.log("vertices", vertexDown.id, vertexUp.id);

        // useful
        var iterVertexToOutEdges = new DDLS.FromVertexToOutgoingEdges();
        var currVertex;
        var currEdge;
        var i;

        // the new constraint segment
        var segment = new DDLS.Segment();
        var tempEdgeDownUp = new DDLS.Edge();
        var tempSdgeUpDown = new DDLS.Edge();
        tempEdgeDownUp.setDatas(vertexDown,tempSdgeUpDown,null,null,true,true);
        tempSdgeUpDown.setDatas(vertexUp,tempEdgeDownUp,null,null,true,true);

        var intersectedEdges = [];
        var leftBoundingEdges = [];
        var rightBoundingEdges = [];

        var currObjet = {};
        var pIntersect = new DDLS.Point();
        var edgeLeft;
        var newEdgeDownUp;
        var newEdgeUpDown;
        var done = false;
        currVertex = vertexDown;

        currObjet = DDLS.Intersection.EVertex(currVertex);
        while(true) {
            done = false;
            switch(currObjet[1]) {
            case 0:
                var vertex = currObjet[2];
                currVertex = vertex;
                iterVertexToOutEdges.fromVertex = currVertex;
                while((currEdge = iterVertexToOutEdges.next()) != null) {
                    if(currEdge.destinationVertex == vertexUp) {
                        if(!currEdge.isConstrained) {
                            currEdge.isConstrained = true;
                            currEdge.oppositeEdge.isConstrained = true;
                        }
                        currEdge.addFromConstraintSegment(segment);
                        currEdge.oppositeEdge.fromConstraintSegments = currEdge.fromConstraintSegments;
                        vertexDown.addFromConstraintSegment(segment);
                        vertexUp.addFromConstraintSegment(segment);
                        segment.addEdge(currEdge);
                        return segment;
                    }
                    if(DDLS.Geom2D.distanceSquaredVertexToEdge(currEdge.destinationVertex,tempEdgeDownUp) <= 0.0001) {
                        if(!currEdge.isConstrained) {
                            currEdge.isConstrained = true;
                            currEdge.oppositeEdge.isConstrained = true;
                        }
                        currEdge.addFromConstraintSegment(segment);
                        currEdge.oppositeEdge.fromConstraintSegments = currEdge.fromConstraintSegments;
                        vertexDown.addFromConstraintSegment(segment);
                        segment.addEdge(currEdge);
                        vertexDown = currEdge.destinationVertex;
                        tempEdgeDownUp.originVertex = vertexDown;
                        currObjet = DDLS.Intersection.EVertex(vertexDown);
                        done = true;
                        break;
                    }
                }
                if(done) continue;

                iterVertexToOutEdges.fromVertex = currVertex;
                while((currEdge = iterVertexToOutEdges.next()) != null) {
                    currEdge = currEdge.nextLeftEdge;
                    if(DDLS.Geom2D.intersections2edges(currEdge,tempEdgeDownUp,pIntersect)) {
                        if(currEdge.isConstrained) {
                            vertexDown = this.splitEdge(currEdge,pIntersect.x,pIntersect.y);
                            iterVertexToOutEdges.fromVertex = currVertex;
                            while((currEdge = iterVertexToOutEdges.next()) != null) if(currEdge.destinationVertex == vertexDown) {
                                currEdge.isConstrained = true;
                                currEdge.oppositeEdge.isConstrained = true;
                                currEdge.addFromConstraintSegment(segment);
                                currEdge.oppositeEdge.fromConstraintSegments = currEdge.fromConstraintSegments;
                                segment.addEdge(currEdge);
                                break;
                            }
                            currVertex.addFromConstraintSegment(segment);
                            tempEdgeDownUp.originVertex = vertexDown;
                            currObjet = DDLS.Intersection.EVertex(vertexDown);
                        } else {
                            intersectedEdges.push(currEdge);
                            leftBoundingEdges.unshift(currEdge.nextLeftEdge);
                            rightBoundingEdges.push(currEdge.prevLeftEdge);
                            currEdge = currEdge.oppositeEdge;
                            currObjet = DDLS.Intersection.EEdge(currEdge);
                        }
                        break;
                    }
                }
                break;
            case 1:
                var edge = currObjet[2];
                currEdge = edge;
                edgeLeft = currEdge.nextLeftEdge;
                if(edgeLeft.destinationVertex == vertexUp) {
                    leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
                    rightBoundingEdges.push(edgeLeft);
                    newEdgeDownUp = new DDLS.Edge();
                    newEdgeUpDown = new DDLS.Edge();
                    newEdgeDownUp.setDatas(vertexDown,newEdgeUpDown,null,null,true,true);
                    newEdgeUpDown.setDatas(vertexUp,newEdgeDownUp,null,null,true,true);
                    leftBoundingEdges.push(newEdgeDownUp);
                    rightBoundingEdges.push(newEdgeUpDown);
                    this.insertNewConstrainedEdge(segment,newEdgeDownUp,intersectedEdges,leftBoundingEdges,rightBoundingEdges);
                    return segment;
                } else if(DDLS.Geom2D.distanceSquaredVertexToEdge(edgeLeft.destinationVertex,tempEdgeDownUp) <= 0.0001) {
                    leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
                    rightBoundingEdges.push(edgeLeft);
                    newEdgeDownUp = new DDLS.Edge();
                    newEdgeUpDown = new DDLS.Edge();
                    newEdgeDownUp.setDatas(vertexDown,newEdgeUpDown,null,null,true,true);
                    newEdgeUpDown.setDatas(edgeLeft.destinationVertex,newEdgeDownUp,null,null,true,true);
                    leftBoundingEdges.push(newEdgeDownUp);
                    rightBoundingEdges.push(newEdgeUpDown);
                    this.insertNewConstrainedEdge(segment,newEdgeDownUp,intersectedEdges,leftBoundingEdges,rightBoundingEdges);
                    intersectedEdges.splice(0,intersectedEdges.length);
                    leftBoundingEdges.splice(0,leftBoundingEdges.length);
                    rightBoundingEdges.splice(0,rightBoundingEdges.length);
                    vertexDown = edgeLeft.destinationVertex;
                    tempEdgeDownUp.originVertex = vertexDown;
                    currObjet = DDLS.Intersection.EVertex(vertexDown);
                } else if(DDLS.Geom2D.intersections2edges(edgeLeft,tempEdgeDownUp,pIntersect)) {
                    if(edgeLeft.isConstrained) {
                        currVertex = this.splitEdge(edgeLeft,pIntersect.x,pIntersect.y);
                        iterVertexToOutEdges.fromVertex = currVertex;
                        while((currEdge = iterVertexToOutEdges.next()) != null) {
                            if(currEdge.destinationVertex === leftBoundingEdges[0].originVertex ) leftBoundingEdges.unshift(currEdge);
                            if(currEdge.destinationVertex === rightBoundingEdges[rightBoundingEdges.length - 1].destinationVertex ) rightBoundingEdges.push(currEdge.oppositeEdge);
                        }
                        newEdgeDownUp = new DDLS.Edge();
                        newEdgeUpDown = new DDLS.Edge();
                        newEdgeDownUp.setDatas(vertexDown,newEdgeUpDown,null,null,true,true);
                        newEdgeUpDown.setDatas(currVertex,newEdgeDownUp,null,null,true,true);
                        leftBoundingEdges.push(newEdgeDownUp);
                        rightBoundingEdges.push(newEdgeUpDown);
                        this.insertNewConstrainedEdge(segment,newEdgeDownUp,intersectedEdges,leftBoundingEdges,rightBoundingEdges);

                        intersectedEdges.splice(0,intersectedEdges.length);
                        leftBoundingEdges.splice(0,leftBoundingEdges.length);
                        rightBoundingEdges.splice(0,rightBoundingEdges.length);
                        vertexDown = currVertex;
                        tempEdgeDownUp.originVertex = vertexDown;
                        currObjet = DDLS.Intersection.EVertex(vertexDown);
                    } else {
                        intersectedEdges.push(edgeLeft);
                        leftBoundingEdges.unshift(edgeLeft.nextLeftEdge);
                        currEdge = edgeLeft.oppositeEdge;
                        currObjet = DDLS.Intersection.EEdge(currEdge);
                    }
                } else {
                    edgeLeft = edgeLeft.nextLeftEdge;
                    DDLS.Geom2D.intersections2edges(edgeLeft,tempEdgeDownUp,pIntersect);
                    if(edgeLeft.isConstrained) {
                        currVertex = this.splitEdge(edgeLeft,pIntersect.x,pIntersect.y);
                        iterVertexToOutEdges.fromVertex = currVertex;
                        while((currEdge = iterVertexToOutEdges.next()) != null) {
                            if(currEdge.destinationVertex == leftBoundingEdges[0].originVertex) leftBoundingEdges.unshift(currEdge);
                            if(currEdge.destinationVertex == rightBoundingEdges[rightBoundingEdges.length - 1].destinationVertex) rightBoundingEdges.push(currEdge.oppositeEdge);
                        }
                        newEdgeDownUp = new DDLS.Edge();
                        newEdgeUpDown = new DDLS.Edge();
                        newEdgeDownUp.setDatas(vertexDown,newEdgeUpDown,null,null,true,true);
                        newEdgeUpDown.setDatas(currVertex,newEdgeDownUp,null,null,true,true);
                        leftBoundingEdges.push(newEdgeDownUp);
                        rightBoundingEdges.push(newEdgeUpDown);
                        this.insertNewConstrainedEdge(segment,newEdgeDownUp,intersectedEdges,leftBoundingEdges,rightBoundingEdges);
                        intersectedEdges.splice(0,intersectedEdges.length);
                        leftBoundingEdges.splice(0,leftBoundingEdges.length);
                        rightBoundingEdges.splice(0,rightBoundingEdges.length);
                        vertexDown = currVertex;
                        tempEdgeDownUp.originVertex = vertexDown;
                        currObjet = DDLS.Intersection.EVertex(vertexDown);
                    } else {
                        intersectedEdges.push(edgeLeft);
                        rightBoundingEdges.push(edgeLeft.prevLeftEdge);
                        currEdge = edgeLeft.oppositeEdge;
                        currObjet = DDLS.Intersection.EEdge(currEdge);
                    }
                }
                break;
            case 2:
                var face = currObjet[2];
                break;
            case 3:
                break;
            }
        }
        //?\\
        //return segment;
    },
    insertNewConstrainedEdge: function(fromSegment,edgeDownUp,intersectedEdges,leftBoundingEdges,rightBoundingEdges) {
        this._edges.push(edgeDownUp);
        this._edges.push(edgeDownUp.oppositeEdge);
        edgeDownUp.addFromConstraintSegment(fromSegment);
        edgeDownUp.oppositeEdge.fromConstraintSegments = edgeDownUp.fromConstraintSegments;
        fromSegment.addEdge(edgeDownUp);
        edgeDownUp.originVertex.addFromConstraintSegment(fromSegment);
        edgeDownUp.destinationVertex.addFromConstraintSegment(fromSegment);
        this.untriangulate(intersectedEdges);
        this.triangulate(leftBoundingEdges,true);
        this.triangulate(rightBoundingEdges,true);
    },
    deleteConstraintSegment: function(segment) {
        var i;
        var vertexToDelete = [];
        var edge = null;
        var vertex;
        var fromConstraintSegment;
        var _g1 = 0;
        var _g = segment.edges.length;
        while(_g1 < _g) {
            var i1 = _g1++;
            edge = segment.edges[i1];
            edge.removeFromConstraintSegment(segment);
            if(edge.fromConstraintSegments.length == 0) {
                edge.isConstrained = false;
                edge.oppositeEdge.isConstrained = false;
            }
            vertex = edge.originVertex;
            vertex.removeFromConstraintSegment(segment);
            vertexToDelete.push(vertex);
        }
        vertex = edge.destinationVertex;
        vertex.removeFromConstraintSegment(segment);
        vertexToDelete.push(vertex);
        var _g11 = 0;
        var _g2 = vertexToDelete.length;
        while(_g11 < _g2) {
            var i2 = _g11++;
            this.deleteVertex(vertexToDelete[i2]);
        }
        segment.dispose();
    },
    check: function() {
        var _g1 = 0;
        var _g = this._edges.length;
        while(_g1 < _g) {
            var i = _g1++;
            if(this._edges[i].nextLeftEdge == null) {
                DDLS.Log("!!! missing nextLeftEdge");
                return;
            }
        }
        DDLS.Log("check OK");
    },
    insertVertex: function(x,y) {
        if(x < 0 || y < 0 || x > this.width || y > this.height) return null;
        this.__edgesToCheck.splice(0,this.__edgesToCheck.length);
        var inObject = DDLS.Geom2D.locatePosition(x,y,this);
        var newVertex = null;
        switch(inObject[1]) {
        case 0:
            var vertex = inObject[2];
            newVertex = vertex;
            break;
        case 1:
            var edge = inObject[2];
            newVertex = this.splitEdge(edge,x,y);
            break;
        case 2:
            var face = inObject[2];
            newVertex = this.splitFace(face,x,y);
            break;
        case 3:
            break;
        }
        this.restoreAsDelaunay();
        return newVertex;
    },
    flipEdge: function(edge) {
        var eBot_Top = edge;
        var eTop_Bot = edge.oppositeEdge;
        var eLeft_Right = new DDLS.Edge();
        var eRight_Left = new DDLS.Edge();
        var eTop_Left = eBot_Top.nextLeftEdge;
        var eLeft_Bot = eTop_Left.nextLeftEdge;
        var eBot_Right = eTop_Bot.nextLeftEdge;
        var eRight_Top = eBot_Right.nextLeftEdge;

        var vBot = eBot_Top.originVertex;
        var vTop = eTop_Bot.originVertex;
        var vLeft = eLeft_Bot.originVertex;
        var vRight = eRight_Top.originVertex;

        var fLeft = eBot_Top.leftFace;
        var fRight = eTop_Bot.leftFace;
        var fBot = new DDLS.Face();
        var fTop = new DDLS.Face();

        // add the new edges
        this._edges.push(eLeft_Right);
        this._edges.push(eRight_Left);
        // add the new faces
        this._faces.push(fTop);
        this._faces.push(fBot);
        // set vertex, edge and face references for the new LEFT_RIGHT and RIGHT-LEFT edges
        eLeft_Right.setDatas(vLeft,eRight_Left,eRight_Top,fTop,edge.isReal,edge.isConstrained);
        eRight_Left.setDatas(vRight,eLeft_Right,eLeft_Bot,fBot,edge.isReal,edge.isConstrained);
        // set edge references for the new TOP and BOTTOM faces
        fTop.setDatas(eLeft_Right);
        fBot.setDatas(eRight_Left);
        // check the edge references of TOP and BOTTOM vertice
        if(vTop.edge === eTop_Bot) vTop.setDatas(eTop_Left);
        if(vBot.edge === eBot_Top) vBot.setDatas(eBot_Right);
        // set the new edge and face references for the 4 bouding edges
        eTop_Left.nextLeftEdge = eLeft_Right;
        eTop_Left.leftFace = fTop;
        eLeft_Bot.nextLeftEdge = eBot_Right;
        eLeft_Bot.leftFace = fBot;
        eBot_Right.nextLeftEdge = eRight_Left;
        eBot_Right.leftFace = fBot;
        eRight_Top.nextLeftEdge = eTop_Left;
        eRight_Top.leftFace = fTop;
        // remove the old TOP-BOTTOM and BOTTOM-TOP edges
        eBot_Top.dispose();
        eTop_Bot.dispose();
        this._edges.splice(this._edges.indexOf(eBot_Top),1);
        this._edges.splice(this._edges.indexOf(eTop_Bot),1);
        // remove the old LEFT and RIGHT faces
        fLeft.dispose();
        fRight.dispose();
        this._faces.splice(this._faces.indexOf(fLeft),1);
        this._faces.splice(this._faces.indexOf(fRight),1);

        return eRight_Left;
    },
    splitEdge: function(edge,x,y) {
        this.__edgesToCheck.splice(0,this.__edgesToCheck.length);

        var eLeft_Right = edge;
        var eRight_Left = eLeft_Right.oppositeEdge;
        var eRight_Top = eLeft_Right.nextLeftEdge;
        var eTop_Left = eRight_Top.nextLeftEdge;
        var eLeft_Bot = eRight_Left.nextLeftEdge;
        var eBot_Right = eLeft_Bot.nextLeftEdge;

        var vTop = eTop_Left.originVertex;
        var vLeft = eLeft_Right.originVertex;
        var vBot = eBot_Right.originVertex;
        var vRight = eRight_Left.originVertex;

        var fTop = eLeft_Right.leftFace;
        var fBot = eRight_Left.leftFace;

        // check distance from the position to edge end points
        if((vLeft.pos.x - x) * (vLeft.pos.x - x) + (vLeft.pos.y - y) * (vLeft.pos.y - y) <= DDLS.EPSILON_SQUARED) return vLeft;
        if((vRight.pos.x - x) * (vRight.pos.x - x) + (vRight.pos.y - y) * (vRight.pos.y - y) <= DDLS.EPSILON_SQUARED) return vRight;
        // create new objects
        var vCenter = new DDLS.Vertex();
        var eTop_Center = new DDLS.Edge();
        var eCenter_Top = new DDLS.Edge();
        var eBot_Center = new DDLS.Edge();
        var eCenter_Bot = new DDLS.Edge();

        var eLeft_Center = new DDLS.Edge();
        var eCenter_Left = new DDLS.Edge();
        var eRight_Center = new DDLS.Edge();
        var eCenter_Right = new DDLS.Edge();

        var fTopLeft = new DDLS.Face();
        var fBotLeft = new DDLS.Face();
        var fBotRight = new DDLS.Face();
        var fTopRight = new DDLS.Face();
        // add the new vertex
        this._vertices.push(vCenter);
        // add the new edges
        this._edges.push(eCenter_Top);
        this._edges.push(eTop_Center);
        this._edges.push(eCenter_Left);
        this._edges.push(eLeft_Center);
        this._edges.push(eCenter_Bot);
        this._edges.push(eBot_Center);
        this._edges.push(eCenter_Right);
        this._edges.push(eRight_Center);
        // add the new faces
        this._faces.push(fTopRight);
        this._faces.push(fBotRight);
        this._faces.push(fBotLeft);
        this._faces.push(fTopLeft);
        // set pos and edge reference for the new CENTER vertex
        vCenter.setDatas(fTop.isReal ? eCenter_Top : eCenter_Bot );
        vCenter.pos.x = x;
        vCenter.pos.y = y;
        DDLS.Geom2D.projectOrthogonaly(vCenter.pos,eLeft_Right);

        // set the new vertex, edge and face references for the new 8 center crossing edges
        eCenter_Top.setDatas(vCenter, eTop_Center, eTop_Left, fTopLeft, fTop.isReal);
        eTop_Center.setDatas(vTop, eCenter_Top, eCenter_Right, fTopRight, fTop.isReal);
        eCenter_Left.setDatas(vCenter, eLeft_Center, eLeft_Bot, fBotLeft, edge.isReal, edge.isConstrained);
        eLeft_Center.setDatas(vLeft, eCenter_Left, eCenter_Top, fTopLeft, edge.isReal, edge.isConstrained);
        eCenter_Bot.setDatas(vCenter, eBot_Center, eBot_Right, fBotRight, fBot.isReal);
        eBot_Center.setDatas(vBot, eCenter_Bot, eCenter_Left, fBotLeft, fBot.isReal);
        eCenter_Right.setDatas(vCenter, eRight_Center, eRight_Top, fTopRight, edge.isReal, edge.isConstrained);
        eRight_Center.setDatas(vRight, eCenter_Right, eCenter_Bot, fBotRight, edge.isReal, edge.isConstrained);
        // set the new edge references for the new 4 faces
        fTopLeft.setDatas(eCenter_Top,fTop.isReal);
        fBotLeft.setDatas(eCenter_Left,fBot.isReal);
        fBotRight.setDatas(eCenter_Bot,fBot.isReal);
        fTopRight.setDatas(eCenter_Right,fTop.isReal);

        // check the edge references of LEFT and RIGHT vertices
        if(vLeft.edge === eLeft_Right) vLeft.setDatas(eLeft_Center);
        if(vRight.edge === eRight_Left) vRight.setDatas(eRight_Center);
        // set the new edge and face references for the 4 bounding edges
        eTop_Left.nextLeftEdge = eLeft_Center;
        eTop_Left.leftFace = fTopLeft;
        eLeft_Bot.nextLeftEdge = eBot_Center;
        eLeft_Bot.leftFace = fBotLeft;
        eBot_Right.nextLeftEdge = eRight_Center;
        eBot_Right.leftFace = fBotRight;
        eRight_Top.nextLeftEdge = eTop_Center;
        eRight_Top.leftFace = fTopRight;

        // if the edge was constrained, we must:
        // - add the segments the edge is from to the 2 new
        // - update the segments the edge is from by deleting the old edge and inserting the 2 new
        // - add the segments the edge is from to the new vertex
        if(eLeft_Right.isConstrained) {
            var fromSegments = eLeft_Right.fromConstraintSegments;
            eLeft_Center.fromConstraintSegments = fromSegments.slice(0);
            eCenter_Left.fromConstraintSegments = eLeft_Center.fromConstraintSegments;
            eCenter_Right.fromConstraintSegments = fromSegments.slice(0);
            eRight_Center.fromConstraintSegments = eCenter_Right.fromConstraintSegments;
            var edges;
            var index;
            var _g1 = 0;
            var _g = eLeft_Right.fromConstraintSegments.length;
            while(_g1 < _g) {
                var i = _g1++;
                edges = eLeft_Right.fromConstraintSegments[i].edges;
                index = edges.indexOf(eLeft_Right);
                if(index != -1) {
                    edges.splice(index, 1, eLeft_Center, eCenter_Right);
                    /*edges.splice(index,1);
                    edges.splice(index,0,eLeft_Center);
                    edges.splice(index + 1,0,eCenter_Right);*/
                } else {
                    edges.splice(edges.indexOf(eRight_Left), 1, eRight_Center, eCenter_Left);
                    /*var index2 = edges.indexOf(eRight_Left);
                    edges.splice(index2,1);
                    edges.splice(index2,0,eRight_Center);
                    edges.splice(index2,0,eCenter_Left);*/
                }
            }
            vCenter.fromConstraintSegments = fromSegments.slice(0);
        }
        // remove the old LEFT-RIGHT and RIGHT-LEFT edges
        eLeft_Right.dispose();
        eRight_Left.dispose();
        this._edges.splice(this._edges.indexOf(eLeft_Right),1);
        this._edges.splice(this._edges.indexOf(eRight_Left),1);
        // remove the old TOP and BOTTOM faces
        fTop.dispose();
        fBot.dispose();
        this._faces.splice(this._faces.indexOf(fTop),1);
        this._faces.splice(this._faces.indexOf(fBot),1);
        // add new bounds references for Delaunay restoring
        this.__centerVertex = vCenter;
        this.__edgesToCheck.push(eTop_Left);
        this.__edgesToCheck.push(eLeft_Bot);
        this.__edgesToCheck.push(eBot_Right);
        this.__edgesToCheck.push(eRight_Top);
        return vCenter;
    },
    splitFace: function(face,x,y) {
        this.__edgesToCheck.splice(0,this.__edgesToCheck.length);
        var eTop_Left = face.edge;
        var eLeft_Right = eTop_Left.nextLeftEdge;
        var eRight_Top = eLeft_Right.nextLeftEdge;
        var vTop = eTop_Left.originVertex;
        var vLeft = eLeft_Right.originVertex;
        var vRight = eRight_Top.originVertex;
        var vCenter = new DDLS.Vertex();
        var eTop_Center = new DDLS.Edge();
        var eCenter_Top = new DDLS.Edge();
        var eLeft_Center = new DDLS.Edge();
        var eCenter_Left = new DDLS.Edge();
        var eRight_Center = new DDLS.Edge();
        var eCenter_Right = new DDLS.Edge();
        var fTopLeft = new DDLS.Face();
        var fBot = new DDLS.Face();
        var fTopRight = new DDLS.Face();
        // add the new vertex
        this._vertices.push(vCenter);
        // add the new edges
        this._edges.push(eTop_Center);
        this._edges.push(eCenter_Top);
        this._edges.push(eLeft_Center);
        this._edges.push(eCenter_Left);
        this._edges.push(eRight_Center);
        this._edges.push(eCenter_Right);
        // add the new faces
        this._faces.push(fTopLeft);
        this._faces.push(fBot);
        this._faces.push(fTopRight);

        // set pos and edge reference for the new CENTER vertex
        vCenter.setDatas(eCenter_Top);
        vCenter.pos.x = x;
        vCenter.pos.y = y;

        // set the new vertex, edge and face references for the new 6 center crossing edges
        eTop_Center.setDatas(vTop,eCenter_Top,eCenter_Right,fTopRight);
        eCenter_Top.setDatas(vCenter,eTop_Center,eTop_Left,fTopLeft);
        eLeft_Center.setDatas(vLeft,eCenter_Left,eCenter_Top,fTopLeft);
        eCenter_Left.setDatas(vCenter,eLeft_Center,eLeft_Right,fBot);
        eRight_Center.setDatas(vRight,eCenter_Right,eCenter_Left,fBot);
        eCenter_Right.setDatas(vCenter,eRight_Center,eRight_Top,fTopRight);

        // set the new edge references for the new 3 faces
        fTopLeft.setDatas(eCenter_Top);
        fBot.setDatas(eCenter_Left);
        fTopRight.setDatas(eCenter_Right);

        // set the new edge and face references for the 3 bounding edges
        eTop_Left.nextLeftEdge = eLeft_Center;
        eTop_Left.leftFace = fTopLeft;
        eLeft_Right.nextLeftEdge = eRight_Center;
        eLeft_Right.leftFace = fBot;
        eRight_Top.nextLeftEdge = eTop_Center;
        eRight_Top.leftFace = fTopRight;

        // we remove the old face
        face.dispose();
        this._faces.splice(this._faces.indexOf(face),1);

        // add new bounds references for Delaunay restoring
        this.__centerVertex = vCenter;
        this.__edgesToCheck.push(eTop_Left);
        this.__edgesToCheck.push(eLeft_Right);
        this.__edgesToCheck.push(eRight_Top);

        return vCenter;
    },
    restoreAsDelaunay: function() {
        var edge;
        while(this.__edgesToCheck.length > 0) {
            edge = this.__edgesToCheck.shift();
            if(edge.isReal && !edge.isConstrained && !DDLS.Geom2D.isDelaunay(edge)) {
                if(edge.nextLeftEdge.destinationVertex == this.__centerVertex) {
                    this.__edgesToCheck.push(edge.nextRightEdge);
                    this.__edgesToCheck.push(edge.prevRightEdge);
                } else {
                    this.__edgesToCheck.push(edge.nextLeftEdge);
                    this.__edgesToCheck.push(edge.prevLeftEdge);
                }
                this.flipEdge(edge);
            }
        }
    },
    // Delete a vertex IF POSSIBLE and then fill the hole with a new triangulation.
    // A vertex can be deleted if:
    // - it is free of constraint segment (no adjacency to any constrained edge)
    // - it is adjacent to exactly 2 contrained edges and is not an end point of any constraint segment
    deleteVertex: function(vertex) {
        var i;
        var freeOfConstraint;
        var iterEdges = new DDLS.FromVertexToOutgoingEdges();
        iterEdges.fromVertex = vertex;
        iterEdges.realEdgesOnly = false;
        var edge;
        var outgoingEdges = [];
        freeOfConstraint = vertex.fromConstraintSegments.length == 0;
        var bound = [];
        var realA = false;
        var realB = false;
        var boundA = [];
        var boundB = [];
        if(freeOfConstraint){ 
            //while(edge = iterEdges.next()) {
            while((edge = iterEdges.next()) != null) {
                outgoingEdges.push(edge);
                bound.push(edge.nextLeftEdge);
            }
        } else {
            // we check if the vertex is an end point of a constraint segment
            var edges;
            var _g1 = 0;
            var _g = vertex.fromConstraintSegments.length;
            while(_g1 < _g) {
                var i1 = _g1++;
                edges = vertex.fromConstraintSegments[i1].edges;
                if(edges[0].originVertex == vertex || edges[edges.length - 1].destinationVertex == vertex) return false;
            }
            // we check the count of adjacent constrained edges
            var count = 0;
            //while(edge = iterEdges.next()) {
            while((edge = iterEdges.next()) != null) {
                outgoingEdges.push(edge);
                if(edge.isConstrained) {
                    count++;
                    if(count > 2) return false;
                }
            }

            // if not disqualified, then we can process
            boundA = [];
            boundB = [];
            var constrainedEdgeA = null;
            var constrainedEdgeB = null;
            var edgeA = new DDLS.Edge();
            var edgeB = new DDLS.Edge();
            this._edges.push(edgeA);
            this._edges.push(edgeB);
            var _g11 = 0;
            var _g2 = outgoingEdges.length;
            while(_g11 < _g2) {
                var i2 = _g11++;
                edge = outgoingEdges[i2];
                if(edge.isConstrained) {
                    if(constrainedEdgeA == null) {
                        edgeB.setDatas(edge.destinationVertex,edgeA,null,null,true,true);
                        boundA.push(edgeA);
                        boundA.push(edge.nextLeftEdge);
                        boundB.push(edgeB);
                        constrainedEdgeA = edge;
                    } else if(constrainedEdgeB == null) {
                        edgeA.setDatas(edge.destinationVertex,edgeB,null,null,true,true);
                        boundB.push(edge.nextLeftEdge);
                        constrainedEdgeB = edge;
                    }
                } 
                else if(constrainedEdgeA == null) boundB.push(edge.nextLeftEdge); 
                else if(constrainedEdgeB == null) boundA.push(edge.nextLeftEdge); 
                else boundB.push(edge.nextLeftEdge);
            }
            // keep infos about reality
            realA = constrainedEdgeA.leftFace.isReal;
            realB = constrainedEdgeB.leftFace.isReal;
            // we update the segments infos
            edgeA.fromConstraintSegments = constrainedEdgeA.fromConstraintSegments.slice(0);
            edgeB.fromConstraintSegments = edgeA.fromConstraintSegments;
            var index;
            var _g12 = 0;
            var _g3 = vertex.fromConstraintSegments.length;
            while(_g12 < _g3) {
                var i3 = _g12++;
                edges = vertex.fromConstraintSegments[i3].edges;
                index = edges.indexOf(constrainedEdgeA);
                if(index != -1) {
                    edges.splice(index - 1,2);
                    edges.splice(index - 1,0,edgeA);
                } else {
                    var index2 = edges.indexOf(constrainedEdgeB) - 1;
                    edges.splice(index2,2);
                    edges.splice(index2,0,edgeB);
                }
            }
        }
        // Deletion of old faces and edges
        var faceToDelete;
        var _g13 = 0;
        var _g4 = outgoingEdges.length;
        while(_g13 < _g4) {
            var i4 = _g13++;
            edge = outgoingEdges[i4];
            faceToDelete = edge.leftFace;
            this._faces.splice(this._faces.indexOf(faceToDelete),1);
            faceToDelete.dispose();
            edge.destinationVertex.edge = edge.nextLeftEdge;
            this._edges.splice( this._edges.indexOf(edge.oppositeEdge),1);
            edge.oppositeEdge.dispose();
            this._edges.splice(this._edges.indexOf(edge),1);
            edge.dispose();
        }
        this._vertices.splice(this._vertices.indexOf(vertex),1);
        vertex.dispose();
        // finally we triangulate
        if(freeOfConstraint) this.triangulate(bound,true); 
        else {
            this.triangulate(boundA,realA);
            this.triangulate(boundB,realB);
        }
        return true;
    },
    // untriangulate is usually used while a new edge insertion in order to delete the intersected edges
    // edgesList is a list of chained edges oriented from right to left
    untriangulate: function(edgesList) {
        // we clean useless faces and adjacent vertices
        var i;
        var verticesCleaned = new DDLS.Dictionary();
        var currEdge;
        var outEdge;
        var _g1 = 0;
        var _g = edgesList.length;
        while(_g1 < _g) {
            var i1 = _g1++;
            currEdge = edgesList[i1];
            if(verticesCleaned.get(currEdge.originVertex) == null ){
                currEdge.originVertex.edge = currEdge.prevLeftEdge.oppositeEdge;
                verticesCleaned.set(currEdge.originVertex,true);
            }
            if(verticesCleaned.get(currEdge.destinationVertex) == null ){
                currEdge.destinationVertex.edge = currEdge.nextLeftEdge;
                verticesCleaned.set(currEdge.destinationVertex,true);
            }
            this._faces.splice(this._faces.indexOf(currEdge.leftFace),1);
            currEdge.leftFace.dispose();
            if(i1 == edgesList.length - 1) {
                this._faces.splice(this._faces.indexOf(currEdge.rightFace),1);
                currEdge.rightFace.dispose();
            }
        }
        // finally we delete the intersected edges
        var _g11 = 0;
        var _g2 = edgesList.length;
        while(_g11 < _g2) {
            var i2 = _g11++;
            currEdge = edgesList[i2];
            this._edges.splice(this._edges.indexOf(currEdge.oppositeEdge),1);
            this._edges.splice(this._edges.indexOf(currEdge),1);
            currEdge.oppositeEdge.dispose();
            currEdge.dispose();
        }
    },

    // triangulate is usually used to fill the hole after deletion of a vertex from mesh or after untriangulation
    // - bounds is the list of edges in CCW bounding the surface to retriangulate,
    triangulate: function(bound,isReal) {
        if(bound.length < 2) {
            DDLS.Log("BREAK ! the hole has less than 2 edges");
            return;
        } else if(bound.length == 2) {
            DDLS.Log("BREAK ! the hole has only 2 edges");
           // DDLS.Debug.trace("  - edge0: " + bound[0].originVertex.id + " -> " + bound[0].destinationVertex.id,{ fileName : "Mesh.hx", lineNumber : 1404, className : "DDLS.Mesh", methodName : "triangulate"});
           // DDLS.Debug.trace("  - edge1: " + bound[1].originVertex.id + " -> " + bound[1].destinationVertex.id,{ fileName : "Mesh.hx", lineNumber : 1405, className : "DDLS.Mesh", methodName : "triangulate"});
            return;
        } else if(bound.length == 3) {
            var f = new DDLS.Face();
            f.setDatas(bound[0],isReal);
            this._faces.push(f);
            bound[0].leftFace = f;
            bound[1].leftFace = f;
            bound[2].leftFace = f;
            bound[0].nextLeftEdge = bound[1];
            bound[1].nextLeftEdge = bound[2];
            bound[2].nextLeftEdge = bound[0];
        } else {
            var baseEdge = bound[0];
            var vertexA = baseEdge.originVertex;
            var vertexB = baseEdge.destinationVertex;
            var vertexC;
            var vertexCheck;
            var circumcenter = new DDLS.Point();
            var radiusSquared;
            var distanceSquared;
            var isDelaunay = false;
            var index = 0;
            var i;
            var _g1 = 2;
            var _g = bound.length;
            while(_g1 < _g) {
                var i1 = _g1++;
                vertexC = bound[i1].originVertex;
                if(DDLS.Geom2D.getRelativePosition2(vertexC.pos.x,vertexC.pos.y,baseEdge) == 1) {
                    index = i1;
                    isDelaunay = true;
                    DDLS.Geom2D.getCircumcenter(vertexA.pos.x,vertexA.pos.y,vertexB.pos.x,vertexB.pos.y,vertexC.pos.x,vertexC.pos.y,circumcenter);
                    radiusSquared = (vertexA.pos.x - circumcenter.x) * (vertexA.pos.x - circumcenter.x) + (vertexA.pos.y - circumcenter.y) * (vertexA.pos.y - circumcenter.y);
                    // for perfect regular n-sides polygons, checking strict delaunay circumcircle condition is not possible, so we substract EPSILON to circumcircle radius:
                    radiusSquared -= DDLS.EPSILON_SQUARED;
                    var _g3 = 2;
                    var _g2 = bound.length;
                    while(_g3 < _g2) {
                        var j = _g3++;
                        if(j != i1) {
                            vertexCheck = bound[j].originVertex;
                            distanceSquared = (vertexCheck.pos.x - circumcenter.x) * (vertexCheck.pos.x - circumcenter.x) + (vertexCheck.pos.y - circumcenter.y) * (vertexCheck.pos.y - circumcenter.y);
                            if(distanceSquared < radiusSquared) {
                                isDelaunay = false;
                                break;
                            }
                        }
                    }
                    if(isDelaunay) break;
                }
            }
            if(!isDelaunay) {
                // for perfect regular n-sides polygons, checking delaunay circumcircle condition is not possible
                DDLS.Log("NO DELAUNAY FOUND");
                var s = "";
                var _g11 = 0;
                var _g4 = bound.length;
                while(_g11 < _g4) {
                    var i2 = _g11++;
                    s += bound[i2].originVertex.pos.x + " , ";
                    s += bound[i2].originVertex.pos.y + " , ";
                    s += bound[i2].destinationVertex.pos.x + " , ";
                    s += bound[i2].destinationVertex.pos.y + " , ";
                }
                index = 2;
            }
            var edgeA = null;
            var edgeAopp = null;
            var edgeB = null;
            var edgeBopp;
            var boundA;
            var boundM;
            var boundB;
            if(index < bound.length - 1) {
                edgeA = new DDLS.Edge();
                edgeAopp = new DDLS.Edge();
                this._edges.push(edgeA);
                this._edges.push(edgeAopp);
                edgeA.setDatas(vertexA,edgeAopp,null,null,isReal,false);
                edgeAopp.setDatas(bound[index].originVertex,edgeA,null,null,isReal,false);
                boundA = bound.slice(index);
                boundA.push(edgeA);
                this.triangulate(boundA,isReal);
            }
            if(index > 2) {
                edgeB = new DDLS.Edge();
                edgeBopp = new DDLS.Edge();
                this._edges.push(edgeB);
                this._edges.push(edgeBopp);
                edgeB.setDatas(bound[1].originVertex,edgeBopp,null,null,isReal,false);
                edgeBopp.setDatas(bound[index].originVertex,edgeB,null,null,isReal,false);
                boundB = bound.slice(1,index);
                boundB.push(edgeBopp);
                this.triangulate(boundB,isReal);
            }
            if(index == 2) boundM = [baseEdge,bound[1],edgeAopp]; else if(index == bound.length - 1) boundM = [baseEdge,edgeB,bound[index]]; else boundM = [baseEdge,edgeB,edgeAopp];
            this.triangulate(boundM,isReal);
        }
    },
    findPositionFromBounds: function(x,y) {
        if(x <= 0) {
            if(y <= 0) return 1; 
            else if(y >= this.height) return 7; 
            else return 8;
        } else if(x >= this.width) {
            if(y <= 0) return 3; 
            else if(y >= this.height) return 5; 
            else return 4;
        } else if(y <= 0) return 2; 
        else if(y >= this.height) return 6; 
        else return 0;
    },
    debug: function() {
        var i;
        var _g1 = 0;
        var _g = this._vertices.length;
        while(_g1 < _g) {
            var i1 = _g1++;
            DDLS.Debug.trace("-- vertex " + this._vertices[i1].id,{ fileName : "Mesh.hx", lineNumber : 1568, className : "DDLS.Mesh", methodName : "debug"});
            DDLS.Debug.trace("  edge " + this._vertices[i1].edge.id + " - " + (this._vertices[i1].edge).toString(),{ fileName : "Mesh.hx", lineNumber : 1569, className : "DDLS.Mesh", methodName : "debug"});
            DDLS.Debug.trace("  edge isReal: " + (this._vertices[i1].edge.isReal).toString(),{ fileName : "Mesh.hx", lineNumber : 1570, className : "DDLS.Mesh", methodName : "debug"});
        }
        var _g11 = 0;
        var _g2 = this._edges.length;
        while(_g11 < _g2) {
            var i2 = _g11++;
            DDLS.Debug.trace("-- edge " + (this._edges[i2]).toString(),{ fileName : "Mesh.hx", lineNumber : 1573, className : "DDLS.Mesh", methodName : "debug"});
            DDLS.Debug.trace("  isReal " + this._edges[i2].id + " - " + (this._edges[i2].isReal).toString(),{ fileName : "Mesh.hx", lineNumber : 1574, className : "DDLS.Mesh", methodName : "debug"});
            DDLS.Debug.trace("  nextLeftEdge " + (this._edges[i2].nextLeftEdge).toString(),{ fileName : "Mesh.hx", lineNumber : 1575, className : "DDLS.Mesh", methodName : "debug"});
            DDLS.Debug.trace("  oppositeEdge " + (this._edges[i2].oppositeEdge).toString(),{ fileName : "Mesh.hx", lineNumber : 1576, className : "DDLS.Mesh", methodName : "debug"});
        }
    },
    traverse: function(onVertex,onEdge) {
        var vertex;
        var incomingEdge;
        var holdingFace;
        var iterVertices;
        iterVertices = new DDLS.FromMeshToVertices();
        iterVertices.fromMesh = this;
        var iterEdges;
        iterEdges = new DDLS.FromVertexToIncomingEdges();
        var dictVerticesDone = new DDLS.Dictionary();
        while((vertex = iterVertices.next()) != null) {
            dictVerticesDone.set(vertex,true);
            //true;
            if(!this.vertexIsInsideAABB(vertex,this)) continue;
            onVertex(vertex);
            iterEdges.fromVertex = vertex;
            while((incomingEdge = iterEdges.next()) != null) if(!dictVerticesDone.get(incomingEdge.originVertex)) onEdge(incomingEdge);
        }
    },
    vertexIsInsideAABB: function(vertex,mesh) {
        if(vertex.pos.x < 0 || vertex.pos.x > mesh.width || vertex.pos.y < 0 || vertex.pos.y > mesh.height) return false; 
        else return true;
    }
};
DDLS.Graph = function() {
    this.id = DDLS.GraphID;
    DDLS.GraphID++;
    this.edge = null;
    this.node = null;
};

DDLS.Graph.prototype = {
    dispose: function() {
        while(this.node != null) this.deleteNode(this.node);
    },
    insertNode: function() {
        var node = new DDLS.GraphNode();
        if(this.node != null) {
            node.next = this.node;
            this.node.prev = node;
        }
        this.node = node;
        return node;
    },
    deleteNode: function(node) {
        while(node.outgoingEdge != null) {
            if(node.outgoingEdge.oppositeEdge != null) this.deleteEdge(node.outgoingEdge.oppositeEdge);
            this.deleteEdge(node.outgoingEdge);
        }
        var otherNode = this.node;
        var incomingEdge;
        while(otherNode != null) {
            var this1 = otherNode.successorNodes;
            incomingEdge = this1.get(node);
            if(incomingEdge != null) this.deleteEdge(incomingEdge);
            otherNode = otherNode.next;
        }
        if(this.node == node) {
            if(node.next != null) {
                node.next.prev = null;
                this.node = node.next;
            } else this.node = null;
        } else if(node.next != null) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        } else node.prev.next = null;
        node.dispose();
    },
    insertEdge: function(fromNode,toNode) {
        if((function(_this) {
            var _r;
            var this1 = fromNode.successorNodes;
            _r = this1.get(toNode);
            return _r;
        }(this)) != null) return null;
        var edge = new DDLS.GraphEdge();
        if(this.edge != null) {
            this.edge.prev = edge;
            edge.next = this.edge;
        }
        this.edge = edge;
        edge.sourceNode = fromNode;
        edge.destinationNode = toNode;
        var this2 = fromNode.successorNodes;
        this2.set(toNode,edge);
        //edge;
        if(fromNode.outgoingEdge != null) {
            fromNode.outgoingEdge.rotPrevEdge = edge;
            edge.rotNextEdge = fromNode.outgoingEdge;
            fromNode.outgoingEdge = edge;
        } else fromNode.outgoingEdge = edge;
        var oppositeEdge;
        var this3 = toNode.successorNodes;
        oppositeEdge = this3.get(fromNode);
        if(oppositeEdge != null) {
            edge.oppositeEdge = oppositeEdge;
            oppositeEdge.oppositeEdge = edge;
        }
        return edge;
    },
    deleteEdge: function(edge) {
        if(this.edge == edge) {
            if(edge.next != null) {
                edge.next.prev = null;
                this.edge = edge.next;
            } else this.edge = null;
        } else if(edge.next != null) {
            edge.prev.next = edge.next;
            edge.next.prev = edge.prev;
        } else edge.prev.next = null;
        if(edge.sourceNode.outgoingEdge == edge) {
            if(edge.rotNextEdge != null) {
                edge.rotNextEdge.rotPrevEdge = null;
                edge.sourceNode.outgoingEdge = edge.rotNextEdge;
            } else edge.sourceNode.outgoingEdge = null;
        } else if(edge.rotNextEdge != null) {
            edge.rotPrevEdge.rotNextEdge = edge.rotNextEdge;
            edge.rotNextEdge.rotPrevEdge = edge.rotPrevEdge;
        } else edge.rotPrevEdge.rotNextEdge = null;
        edge.dispose();
    }
};

// EDGE
DDLS.GraphEdge = function() {
    this.id = DDLS.GraphEdgeID;
    DDLS.GraphEdgeID++;
    this.next = null;
    this.prev = null;
    this.rotPrevEdge = null;
    this.rotNextEdge = null;
    this.oppositeEdge = null;
    this.sourceNode = null;
    this.destinationNode = null;
    this.data = null;
};
DDLS.GraphEdge.prototype = {
    dispose: function() {
    }
};

// NODE
DDLS.GraphNode = function() {
    this.id = DDLS.GraphNodeID;
    DDLS.GraphNodeID++;
    this.successorNodes = new DDLS.Dictionary();
    this.prev = null;
    this.next = null;
    this.outgoingEdge = null;
    this.data = null;
};
DDLS.GraphNode.prototype = {
    dispose: function() {
        this.prev = null;
        this.next = null;
        this.outgoingEdge = null;
        this.successorNodes = null;
        this.data = null;
    }
};

DDLS.EdgeData = function() {};
DDLS.NodeData = function() {};

DDLS.Potrace = {};

DDLS.Potrace.MAX_INT = 2147483647;
DDLS.Potrace.maxDistance = 1;

DDLS.Potrace.buildShapes = function(bmpData,debugBmp,debugShape) {
    var shapes = [];
    var dictPixelsDone = new DDLS.StringMap();
    var _g1 = 1;
    var _g = bmpData.height - 1;
    while(_g1 < _g) {
        var row = _g1++;
        var _g3 = 0;
        var _g2 = bmpData.width - 1;
        while(_g3 < _g2) {
            var col = _g3++;
            if((function(_this) {
                var _r;
                var pos = row * bmpData.width + col << 2;
                var r = bmpData.bytes.b[pos + 1] << 16;
                var g = bmpData.bytes.b[pos + 2] << 8;
                var b = bmpData.bytes.b[pos + 3];
                _r = r | g | b;
                return _r;
            }(this)) == 16777215 && (function(_this) {
                var _r;
                var pos1 = row * bmpData.width + (col + 1) << 2;
                var r1 = bmpData.bytes.b[pos1 + 1] << 16;
                var g1 = bmpData.bytes.b[pos1 + 2] << 8;
                var b1 = bmpData.bytes.b[pos1 + 3];
                _r = r1 | g1 | b1;
                return _r;
            }(this)) < 16777215) {
                if(!dictPixelsDone.get(col + 1 + "_" + row)) shapes.push(DDLS.Potrace.buildShape(bmpData,row,col + 1,dictPixelsDone,debugBmp,debugShape));
            }
        }
    }
    return shapes;
};
DDLS.Potrace.buildShape = function(bmpData,fromPixelRow,fromPixelCol,dictPixelsDone,debugBmp,debugShape) {
    var newX = fromPixelCol;
    var newY = fromPixelRow;
    var path = [newX,newY];
    dictPixelsDone.set(newX + "_" + newY,true);
    //true;
    var curDir = new DDLS.Point(0,1);
    var newDir = new DDLS.Point();
    var newPixelRow;
    var newPixelCol;
    var count = -1;
    while(true) {
        if(debugBmp != null) {
            var pos = fromPixelRow * debugBmp.width + fromPixelCol << 2;
            var a = 255;
            var r = 255;
            var g = 0;
            var b = 0;
            debugBmp.bytes.b[pos] = a & 255;
            debugBmp.bytes.b[pos + 1] = r & 255;
            debugBmp.bytes.b[pos + 2] = g & 255;
            debugBmp.bytes.b[pos + 3] = b & 255;
        }
        newPixelRow = fromPixelRow + curDir.x + curDir.y | 0;
        newPixelCol = fromPixelCol + curDir.x - curDir.y | 0;
        if((function(_this) {
            var _r;
            var pos1 = newPixelRow * bmpData.width + newPixelCol << 2;
            var r1 = bmpData.bytes.b[pos1 + 1] << 16;
            var g1 = bmpData.bytes.b[pos1 + 2] << 8;
            var b1 = bmpData.bytes.b[pos1 + 3];
            _r = r1 | g1 | b1;
            return _r;
        }(this)) < 16777215) {
            newDir.x = -curDir.y;
            newDir.y = curDir.x;
        } else {
            newPixelRow = fromPixelRow + curDir.y | 0;
            newPixelCol = fromPixelCol + curDir.x | 0;
            if((function(_this) {
                var _r;
                var pos2 = newPixelRow * bmpData.width + newPixelCol << 2;
                var r2 = bmpData.bytes.b[pos2 + 1] << 16;
                var g2 = bmpData.bytes.b[pos2 + 2] << 8;
                var b2 = bmpData.bytes.b[pos2 + 3];
                _r = r2 | g2 | b2;
                return _r;
            }(this)) < 16777215) {
                newDir.x = curDir.x;
                newDir.y = curDir.y;
            } else {
                newPixelRow = fromPixelRow;
                newPixelCol = fromPixelCol;
                newDir.x = curDir.y;
                newDir.y = -curDir.x;
            }
        }
        newX = newX + curDir.x;
        newY = newY + curDir.y;
        if(newX == path[0] && newY == path[1]) break; else {
            path.push(newX);
            path.push(newY);
            dictPixelsDone.set(newX + "_" + newY,true);
            //true;
            fromPixelRow = newPixelRow;
            fromPixelCol = newPixelCol;
            curDir.x = newDir.x;
            curDir.y = newDir.y;
        }
        count--;
        if(count == 0) break;
    }
    if(debugShape != null) {
        debugShape.graphics.lineStyle(0.5,65280,1);
        debugShape.graphics.moveTo(path[0],path[1]);
        var i = 2;
        while(i < path.length) {
            debugShape.graphics.lineTo(path[i],path[i + 1]);
            i += 2;
        }
        debugShape.graphics.lineTo(path[0],path[1]);
    }
    return path;
};
DDLS.Potrace.buildGraph = function(shape) {
    var i;
    var graph = new DDLS.Graph();
    var node;
    i = 0;
    while(i < shape.length) {
        node = graph.insertNode();
        node.data = new DDLS.NodeData();
        node.data.index = i;
        node.data.point = new DDLS.Point(shape[i],shape[i + 1]);
        i += 2;
    }
    var node1;
    var node2;
    var subNode;
    var distSqrd;
    var sumDistSqrd;
    var count;
    var isValid;
    var edge;
    var edgeData;
    node1 = graph.node;
    while(node1 != null) {
        if(node1.next != null) node2 = node1.next; else node2 = graph.node;
        while(node2 != node1) {
            isValid = true;
            if(node1.next != null) subNode = node1.next; else subNode = graph.node;
            count = 2;
            sumDistSqrd = 0;
            while(subNode != node2) {
                distSqrd = DDLS.Geom2D.distanceSquaredPointToSegment(subNode.data.point.x,subNode.data.point.y,node1.data.point.x,node1.data.point.y,node2.data.point.x,node2.data.point.y);
                if(distSqrd < 0) distSqrd = 0;
                if(distSqrd >= DDLS.Potrace.maxDistance) {
                    isValid = false;
                    break;
                }
                count++;
                sumDistSqrd += distSqrd;
                if(subNode.next != null) subNode = subNode.next; else subNode = graph.node;
            }
            if(!isValid) break;
            edge = graph.insertEdge(node1,node2);
            edgeData = new DDLS.EdgeData();
            edgeData.sumDistancesSquared = sumDistSqrd;
            edgeData.length = node1.data.point.distanceTo(node2.data.point);
            edgeData.nodesCount = count;
            edge.data = edgeData;
            if(node2.next != null) node2 = node2.next; else node2 = graph.node;
        }
        node1 = node1.next;
    }
    return graph;
};
DDLS.Potrace.buildPolygon = function(graph,debugShape) {
    var polygon = [];
    var currNode;
    var minNodeIndex = 2147483647;
    var edge;
    var score;
    var higherScore;
    var lowerScoreEdge = null;
    currNode = graph.node;
    while(currNode.data.index < minNodeIndex) {
        minNodeIndex = currNode.data.index;
        polygon.push(currNode.data.point.x);
        polygon.push(currNode.data.point.y);
        higherScore = 0;
        edge = currNode.outgoingEdge;
        while(edge != null) {
            score = edge.data.nodesCount - edge.data.length * DDLS.sqrt(edge.data.sumDistancesSquared / edge.data.nodesCount);
            if(score > higherScore) {
                higherScore = score;
                lowerScoreEdge = edge;
            }
            edge = edge.rotNextEdge;
        }
        currNode = lowerScoreEdge.destinationNode;
    }
    if(DDLS.Geom2D.getDirection(polygon[polygon.length - 2],polygon[polygon.length - 1],polygon[0],polygon[1],polygon[2],polygon[3]) == 0) {
        polygon.shift();
        polygon.shift();
    }
    if(debugShape != null) {
        debugShape.graphics.lineStyle(0.5,255);
        debugShape.graphics.moveTo(polygon[0],polygon[1]);
        var i = 2;
        while(i < polygon.length) {
            debugShape.graphics.lineTo(polygon[i],polygon[i + 1]);
            i += 2;
        }
        debugShape.graphics.lineTo(polygon[0],polygon[1]);
    }
    return polygon;
};
DDLS.ShapeSimplifier = function(coords,epsilon) {
    if(epsilon == null) epsilon = 1;
    var len = coords.length;
    DDLS.Debug.assertFalse((len & 1) != 0,"Wrong size",{ fileName : "ShapeSimplifier.hx", lineNumber : 18, className : "DDLS.ShapeSimplifier", methodName : "simplify"});
    if(len <= 4) return [].concat(coords);
    var firstPointX = coords[0];
    var firstPointY = coords[1];
    var lastPointX = coords[len - 2];
    var lastPointY = coords[len - 1];
    var index = -1;
    var dist = 0.;
    var _g1 = 1;
    var _g = len >> 1;
    while(_g1 < _g) {
        var i = _g1++;
        var currDist = DDLS.Geom2D.distanceSquaredPointToSegment(coords[i << 1],coords[(i << 1) + 1],firstPointX,firstPointY,lastPointX,lastPointY);
        if(currDist > dist) {
            dist = currDist;
            index = i;
        }
    }
    if(dist > epsilon * epsilon) {
        var l1 = coords.slice(0,(index << 1) + 2);
        var l2 = coords.slice(index << 1);
        var r1 = DDLS.ShapeSimplifier(l1,epsilon);
        var r2 = DDLS.ShapeSimplifier(l2,epsilon);
        var rs = r1.slice(0,r1.length - 2).concat(r2);
        return rs;
    } else return [firstPointX,firstPointY,lastPointX,lastPointY];
};
DDLS.AStar = function() {
    this.iterEdge = new DDLS.FromFaceToInnerEdges();
    /*this.mesh = null;
    this._radius = 0;
    this.radiusSquared = 0;
    this.diameter = 0;
    this.diameterSquared = 0;
*/

    Object.defineProperty(this, 'radius', {
        get: function() { return this._radius; },
        set: function(value) { 
            this._radius = value;
            this.radiusSquared = this._radius*this._radius;
            this.diameter = this._radius * 2;
            this.diameterSquared = this.diameter * this.diameter; 
        }
    });

};

DDLS.AStar.prototype = {
    dispose: function() {
        this.mesh = null;
        this.closedFaces = null;
        this.sortedOpenedFaces = null;
        this.openedFaces = null;
        this.entryEdges = null;
        this.entryX = null;
        this.entryY = null;
        this.scoreF = null;
        this.scoreG = null;
        this.scoreH = null;
        this.predecessor = null;
    },
    findPath: function(fromX,fromY,toX,toY,resultListFaces,resultListEdges) {
        this.closedFaces = new DDLS.Dictionary();
        this.sortedOpenedFaces = [];
        this.openedFaces = new DDLS.Dictionary();
        this.entryEdges = new DDLS.Dictionary();
        this.entryX = new DDLS.Dictionary();
        this.entryY = new DDLS.Dictionary();
        this.scoreF = new DDLS.Dictionary();
        this.scoreG = new DDLS.Dictionary();
        this.scoreH = new DDLS.Dictionary();
        this.predecessor = new DDLS.Dictionary();
        var loc;
        var locEdge;
        var locVertex;
        var distance;
        var p1;
        var p2;
        var p3;
        loc = DDLS.Geom2D.locatePosition(fromX,fromY,this.mesh);
        switch(loc[1]) {
        case 0:
            var vertex = loc[2];
            locVertex = vertex;
            return;
        case 1:
            var edge = loc[2];
            locEdge = edge;
            if(locEdge.isConstrained) return;
            this.fromFace = locEdge.leftFace;
            break;
        case 2:
            var face = loc[2];
            this.fromFace = face;
            break;
        case 3:
            break;
        }
        loc = DDLS.Geom2D.locatePosition(toX,toY,this.mesh);
        switch(loc[1]) {
        case 0:
            var vertex1 = loc[2];
            locVertex = vertex1;
            this.toFace = locVertex.edge.leftFace;
            break;
        case 1:
            var edge1 = loc[2];
            locEdge = edge1;
            this.toFace = locEdge.leftFace;
            break;
        case 2:
            var face1 = loc[2];
            this.toFace = face1;
            break;
        case 3:
            break;
        }
        this.sortedOpenedFaces.push(this.fromFace);
        this.entryEdges.set(this.fromFace,null);
        //null;
        this.entryX.set(this.fromFace,fromX);
        //fromX;
        this.entryY.set(this.fromFace,fromY);
        //fromY;
        this.scoreG.set(this.fromFace,0);
        //0;
        var dist = DDLS.sqrt((toX - fromX) * (toX - fromX) + (toY - fromY) * (toY - fromY));
        this.scoreH.set(this.fromFace,dist);
        //dist;
        this.scoreF.set(this.fromFace,dist);
        //dist;
        var innerEdge;
        var neighbourFace;
        var f;
        var g;
        var h;
        var fromPoint = new DDLS.Point();
        var entryPoint = new DDLS.Point();
        var distancePoint = new DDLS.Point();
        var fillDatas;
        while(true) {
            if(this.sortedOpenedFaces.length == 0) {
                DDLS.Log("AStar no path found",{ fileName : "AStar.hx", lineNumber : 157, className : "DDLS.AStar", methodName : "findPath"});
                this.curFace = null;
                break;
            }
            this.curFace = this.sortedOpenedFaces.pop();
            if(this.curFace == this.toFace) break;
            this.iterEdge.fromFace = this.curFace;
            while((innerEdge = this.iterEdge.next()) != null) {
                if(innerEdge.isConstrained) continue;
                neighbourFace = innerEdge.rightFace;
                if(!this.closedFaces.get(neighbourFace)) {
                    if(this.curFace != this.fromFace && this._radius > 0 && !this.isWalkableByRadius(this.entryEdges.get(this.curFace),this.curFace,innerEdge)) continue;
                    fromPoint.x = this.entryX.get(this.curFace);
                    fromPoint.y = this.entryY.get(this.curFace);
                    entryPoint.x = fromPoint.x;
                    entryPoint.y = fromPoint.y;
                    entryPoint.x = (innerEdge.originVertex.pos.x + innerEdge.destinationVertex.pos.x) * 0.5;
                    entryPoint.y = (innerEdge.originVertex.pos.y + innerEdge.destinationVertex.pos.y) * 0.5;
                    distancePoint.x = entryPoint.x - toX;
                    distancePoint.y = entryPoint.y - toY;
                    h = distancePoint.get_length();
                    distancePoint.x = fromPoint.x - entryPoint.x;
                    distancePoint.y = fromPoint.y - entryPoint.y;
                    g = this.scoreG.get(this.curFace) + distancePoint.get_length();
                    f = h + g;
                    fillDatas = false;
                    if(this.openedFaces.get(neighbourFace) == null || !this.openedFaces.get(neighbourFace)) {
                        this.sortedOpenedFaces.push(neighbourFace);
                        this.openedFaces.set(neighbourFace,true);
                        //true;
                        fillDatas = true;
                    } else if(this.scoreF.get(neighbourFace) > f) fillDatas = true;
                    if(fillDatas) {
                        this.entryEdges.set(neighbourFace,innerEdge);
                        //innerEdge;
                        var v = entryPoint.x;
                        this.entryX.set(neighbourFace,v);
                        //v;
                        var v1 = entryPoint.y;
                        this.entryY.set(neighbourFace,v1);
                        //v1;
                        this.scoreF.set(neighbourFace,f);
                        //f;
                        this.scoreG.set(neighbourFace,g);
                        //g;
                        this.scoreH.set(neighbourFace,h);
                        //h;
                        var v2 = this.curFace;
                        this.predecessor.set(neighbourFace,v2);
                        //v2;
                    }
                }
            }
            this.openedFaces.set(this.curFace,false);
            //false;
            this.closedFaces.set(this.curFace,true);
            //true;
            this.sortedOpenedFaces.sort(DDLS.Bind(this,this.sortingFaces));
        }
        if(this.curFace == null) return;
        resultListFaces.push(this.curFace);
        while(this.curFace != this.fromFace) {
            resultListEdges.unshift(this.entryEdges.get(this.curFace));
            this.curFace = this.predecessor.get(this.curFace);
            resultListFaces.unshift(this.curFace);
        }
    },
    sortingFaces: function(a,b) {
        if(this.scoreF.get(a) == this.scoreF.get(b)) return 0; 
        else if(this.scoreF.get(a) < this.scoreF.get(b)) return 1; 
        else return -1;
    },
    isWalkableByRadius: function(fromEdge,throughFace,toEdge) {
        var vA = null; // the vertex on fromEdge not on toEdge
        var vB = null; // the vertex on toEdge not on fromEdge
        var vC = null; // the common vertex of the 2 edges (pivot)

        // we identify the points
        if(fromEdge.originVertex == toEdge.originVertex) {
            vA = fromEdge.destinationVertex;
            vB = toEdge.destinationVertex;
            vC = fromEdge.originVertex;
        } else if(fromEdge.destinationVertex == toEdge.destinationVertex) {
            vA = fromEdge.originVertex;
            vB = toEdge.originVertex;
            vC = fromEdge.destinationVertex;
        } else if(fromEdge.originVertex == toEdge.destinationVertex) {
            vA = fromEdge.destinationVertex;
            vB = toEdge.originVertex;
            vC = fromEdge.originVertex;
        } else if(fromEdge.destinationVertex == toEdge.originVertex) {
            vA = fromEdge.originVertex;
            vB = toEdge.destinationVertex;
            vC = fromEdge.destinationVertex;
        }

        var dot, result, distSquared, adjEdge;
        // if we have a right or obtuse angle on CAB
        dot = (vC.pos.x - vA.pos.x) * (vB.pos.x - vA.pos.x) + (vC.pos.y - vA.pos.y) * (vB.pos.y - vA.pos.y);
        if(dot <= 0) {
            // we compare length of AC with radius
            distSquared = (vC.pos.x - vA.pos.x) * (vC.pos.x - vA.pos.x) + (vC.pos.y - vA.pos.y) * (vC.pos.y - vA.pos.y);
            if(distSquared >= this.diameterSquared) return true;
            else return false;
        }

        // if we have a right or obtuse angle on CBA
        dot = (vC.pos.x - vB.pos.x) * (vA.pos.x - vB.pos.x) + (vC.pos.y - vB.pos.y) * (vA.pos.y - vB.pos.y);
        if(dot <= 0) {
            // we compare length of BC with radius
            distSquared = (vC.pos.x - vB.pos.x) * (vC.pos.x - vB.pos.x) + (vC.pos.y - vB.pos.y) * (vC.pos.y - vB.pos.y);
            if(distSquared >= this.diameterSquared) return true;
            else return false;
        }
        // we identify the adjacent edge (facing pivot vertex)
        if(throughFace.edge != fromEdge && throughFace.edge.oppositeEdge != fromEdge && throughFace.edge != toEdge && throughFace.edge.oppositeEdge != toEdge) adjEdge = throughFace.edge; 
        else if(throughFace.edge.nextLeftEdge != fromEdge && throughFace.edge.nextLeftEdge.oppositeEdge != fromEdge && throughFace.edge.nextLeftEdge != toEdge && throughFace.edge.nextLeftEdge.oppositeEdge != toEdge) adjEdge = throughFace.edge.nextLeftEdge; 
        else adjEdge = throughFace.edge.prevLeftEdge;

        // if the adjacent edge is constrained, we check the distance of orthognaly projected
        if(adjEdge.isConstrained) {
            var proj = new DDLS.Point(vC.pos.x,vC.pos.y);
            DDLS.Geom2D.projectOrthogonaly(proj,adjEdge);
            distSquared = (proj.x - vC.pos.x) * (proj.x - vC.pos.x) + (proj.y - vC.pos.y) * (proj.y - vC.pos.y);
            if(distSquared >= this.diameterSquared) return true; 
            else return false;
        } else {// if the adjacent is not constrained
            var distSquaredA = (vC.pos.x - vA.pos.x) * (vC.pos.x - vA.pos.x) + (vC.pos.y - vA.pos.y) * (vC.pos.y - vA.pos.y);
            var distSquaredB = (vC.pos.x - vB.pos.x) * (vC.pos.x - vB.pos.x) + (vC.pos.y - vB.pos.y) * (vC.pos.y - vB.pos.y);
            if(distSquaredA < this.diameterSquared || distSquaredB < this.diameterSquared) return false; 
            else {
                var vFaceToCheck = [];
                var vFaceIsFromEdge = [];
                var facesDone = new DDLS.Dictionary();
                vFaceIsFromEdge.push(adjEdge);
                if(adjEdge.leftFace == throughFace) {
                    vFaceToCheck.push(adjEdge.rightFace);
                    var k = adjEdge.rightFace;
                    facesDone.set(k,true);
                } else {
                    vFaceToCheck.push(adjEdge.leftFace);
                    var k1 = adjEdge.leftFace;
                    facesDone.set(k1,true);
                }
                var currFace, faceFromEdge, currEdgeA, nextFaceA, currEdgeB, nextFaceB;
                while(vFaceToCheck.length > 0) {
                    currFace = vFaceToCheck.shift();
                    faceFromEdge = vFaceIsFromEdge.shift();

                    // we identify the 2 edges to evaluate
                    if(currFace.edge == faceFromEdge || currFace.edge == faceFromEdge.oppositeEdge) {
                        currEdgeA = currFace.edge.nextLeftEdge;
                        currEdgeB = currFace.edge.nextLeftEdge.nextLeftEdge;
                    } else if(currFace.edge.nextLeftEdge == faceFromEdge || currFace.edge.nextLeftEdge == faceFromEdge.oppositeEdge) {
                        currEdgeA = currFace.edge;
                        currEdgeB = currFace.edge.nextLeftEdge.nextLeftEdge;
                    } else {
                        currEdgeA = currFace.edge;
                        currEdgeB = currFace.edge.nextLeftEdge;
                    }

                    // we identify the faces related to the 2 edges
                    if(currEdgeA.leftFace == currFace) nextFaceA = currEdgeA.rightFace; 
                    else nextFaceA = currEdgeA.leftFace;

                    if(currEdgeB.leftFace == currFace) nextFaceB = currEdgeB.rightFace; 
                    else nextFaceB = currEdgeB.leftFace;

                    // we check if the next face is not already in pipe
                    // and if the edge A is close to pivot vertex
                    if(!facesDone.get(nextFaceA) && DDLS.Geom2D.distanceSquaredVertexToEdge(vC,currEdgeA) < this.diameterSquared) {
                        // if the edge is constrained
                        if(currEdgeA.isConstrained) return false; // so it is not walkable
                        else {
                            // if the edge is not constrained, we continue the search
                            vFaceToCheck.push(nextFaceA);
                            vFaceIsFromEdge.push(currEdgeA);
                            facesDone.set(nextFaceA,true);
                        }
                    }
                    // we check if the next face is not already in pipe
                    // and if the edge B is close to pivot vertex
                    if(!facesDone.get(nextFaceB) && DDLS.Geom2D.distanceSquaredVertexToEdge(vC,currEdgeB) < this.diameterSquared) {
                        // if the edge is constrained
                        if(currEdgeB.isConstrained) return false; // so it is not walkable
                        else {
                            // if the edge is not constrained, we continue the search
                            vFaceToCheck.push(nextFaceB);
                            vFaceIsFromEdge.push(currEdgeB);
                            facesDone.set(nextFaceB,true);
                        }
                    }
                }
                // if we didn't previously meet a constrained edge
                return true;
            }
        }
        //?\\return true;
    }
};
DDLS.EntityAI = function() {
    this._radius = 10;
    this.radiusSquared = 10*10;
    this.x = this.y = 0;
    this.dirNormX = 1;
    this.dirNormY = 0;
    this.angleFOV = 60;
    this._radiusFOV = 0;
    this._radiusSquaredFOV = 0;

    Object.defineProperty(this, 'radiusFOV', {
        get: function() { return this._radiusFOV; },
        set: function(value) { 
            this._radiusFOV = value;
            this._radiusSquaredFOV = this._radiusFOV*this._radiusFOV; 
        }
    });

    Object.defineProperty(this, 'radius', {
        get: function() { return this._radius; },
        set: function(value) { 
            this._radius = value;
            this.radiusSquared = this._radius*this._radius; 
        }
    });

    Object.defineProperty(this, 'approximateObject', {
        get: function() { 
            this._approximateObject.matrix.identity();
            this._approximateObject.matrix.translate(this.x,this.y);
            return this._approximateObject; 
        }
    });
};

DDLS.EntityAI.prototype = {
    buildApproximation: function() {
        this._approximateObject = new DDLS.Object();
        this._approximateObject.matrix.translate(this.x,this.y);
        var coordinates = [];
        this._approximateObject.coordinates = coordinates;
        if(this._radius == 0) return;
        var _g = 0;
        while(_g < 6) {
            var i = _g++;
            coordinates.push(this._radius * DDLS.cos(DDLS.TwoPI * i / 6));
            coordinates.push(this._radius * DDLS.sin(DDLS.TwoPI * i / 6));
            coordinates.push(this._radius * DDLS.cos(DDLS.TwoPI * (i + 1) / 6));
            coordinates.push(this._radius * DDLS.sin(DDLS.TwoPI * (i + 1) / 6));
        }
    },
    get_approximateObject: function() {
        this._approximateObject.matrix.identity();
        this._approximateObject.matrix.translate(this.x,this.y);
        return this._approximateObject;
    }
};

DDLS.EntityAI.NUM_SEGMENTS = 6;
DDLS.Funnel = function() {
    this._currPoolPointsIndex = 0;
    this._poolPointsSize = 3000;
    this._numSamplesCircle = 16;
    this._radiusSquared = 0;
    this._radius = 0;
    this._poolPoints = [];
    var _g1 = 0;
    var _g = this._poolPointsSize;
    while(_g1 < _g) {
        var i = _g1++;
        this._poolPoints.push(new DDLS.Point());
    }

    Object.defineProperty(this, 'radius', {
        get: function() { return this._radius; },
        set: function(value) { 
            this._radius = DDLS.max(0,value);
            this._radiusSquared = this._radius * this._radius;
            this._sampleCircle = [];
            if(this._radius == 0) return;
            var _g1 = 0;
            var _g = this._numSamplesCircle;
            while(_g1 < _g) {
                var i = _g1++;
                this._sampleCircle.push( new DDLS.Point(this._radius * DDLS.cos( -DDLS.TwoPI * i / this._numSamplesCircle),this._radius * DDLS.sin( -DDLS.TwoPI * i / this._numSamplesCircle)));
            }
            this._sampleCircleDistanceSquared = (this._sampleCircle[0].x - this._sampleCircle[1].x) * (this._sampleCircle[0].x - this._sampleCircle[1].x) + (this._sampleCircle[0].y - this._sampleCircle[1].y) * (this._sampleCircle[0].y - this._sampleCircle[1].y);
        }
    });
};

DDLS.Funnel.prototype = {
    dispose: function() {
        this._sampleCircle = null;
    },
    getPoint: function(x,y) {
        if(y == null) y = 0;
        if(x == null) x = 0;
        this.__point = this._poolPoints[this._currPoolPointsIndex];
        this.__point.setXY(x,y);
        this._currPoolPointsIndex++;
        if(this._currPoolPointsIndex == this._poolPointsSize) {
            this._poolPoints.push(new DDLS.Point());
            this._poolPointsSize++;
        }
        return this.__point;
    },
    getCopyPoint: function(pointToCopy) {
        return this.getPoint(pointToCopy.x,pointToCopy.y);
    },
    findPath: function(fromX,fromY,toX,toY,listFaces,listEdges,resultPath) {
        this._currPoolPointsIndex = 0;
        if(this._radius > 0) {
            var checkFace = listFaces[0];
            var distanceSquared;
            var distance;
            var p1;
            var p2;
            var p3;
            p1 = checkFace.edge.originVertex.pos;
            p2 = checkFace.edge.destinationVertex.pos;
            p3 = checkFace.edge.nextLeftEdge.destinationVertex.pos;
            distanceSquared = (p1.x - fromX) * (p1.x - fromX) + (p1.y - fromY) * (p1.y - fromY);
            if(distanceSquared <= this._radiusSquared) {
                distance = DDLS.sqrt(distanceSquared);
                fromX = this._radius * 1.01 * ((fromX - p1.x) / distance) + p1.x;
                fromY = this._radius * 1.01 * ((fromY - p1.y) / distance) + p1.y;
            } else {
                distanceSquared = (p2.x - fromX) * (p2.x - fromX) + (p2.y - fromY) * (p2.y - fromY);
                if(distanceSquared <= this._radiusSquared) {
                    distance = DDLS.sqrt(distanceSquared);
                    fromX = this._radius * 1.01 * ((fromX - p2.x) / distance) + p2.x;
                    fromY = this._radius * 1.01 * ((fromY - p2.y) / distance) + p2.y;
                } else {
                    distanceSquared = (p3.x - fromX) * (p3.x - fromX) + (p3.y - fromY) * (p3.y - fromY);
                    if(distanceSquared <= this._radiusSquared) {
                        distance = DDLS.sqrt(distanceSquared);
                        fromX = this._radius * 1.01 * ((fromX - p3.x) / distance) + p3.x;
                        fromY = this._radius * 1.01 * ((fromY - p3.y) / distance) + p3.y;
                    }
                }
            }
            checkFace = listFaces[listFaces.length - 1];
            p1 = checkFace.edge.originVertex.pos;
            p2 = checkFace.edge.destinationVertex.pos;
            p3 = checkFace.edge.nextLeftEdge.destinationVertex.pos;
            distanceSquared = (p1.x - toX) * (p1.x - toX) + (p1.y - toY) * (p1.y - toY);
            if(distanceSquared <= this._radiusSquared) {
                distance = DDLS.sqrt(distanceSquared);
                toX = this._radius * 1.01 * ((toX - p1.x) / distance) + p1.x;
                toY = this._radius * 1.01 * ((toY - p1.y) / distance) + p1.y;
            } else {
                distanceSquared = (p2.x - toX) * (p2.x - toX) + (p2.y - toY) * (p2.y - toY);
                if(distanceSquared <= this._radiusSquared) {
                    distance = DDLS.sqrt(distanceSquared);
                    toX = this._radius * 1.01 * ((toX - p2.x) / distance) + p2.x;
                    toY = this._radius * 1.01 * ((toY - p2.y) / distance) + p2.y;
                } else {
                    distanceSquared = (p3.x - toX) * (p3.x - toX) + (p3.y - toY) * (p3.y - toY);
                    if(distanceSquared <= this._radiusSquared) {
                        distance = DDLS.sqrt(distanceSquared);
                        toX = this._radius * 1.01 * ((toX - p3.x) / distance) + p3.x;
                        toY = this._radius * 1.01 * ((toY - p3.y) / distance) + p3.y;
                    }
                }
            }
        }
        var startPoint;
        var endPoint;
        startPoint = new DDLS.Point(fromX,fromY);
        endPoint = new DDLS.Point(toX,toY);
        if(listFaces.length == 1) {
            resultPath.push(startPoint.x);
            resultPath.push(startPoint.y);
            resultPath.push(endPoint.x);
            resultPath.push(endPoint.y);
            return;
        }
        var i;
        var j;
        var k;
        var currEdge = null;
        var currVertex = null;
        var direction;
        {
            var _g = DDLS.Geom2D.isInFace(fromX,fromY,listFaces[0]);
            switch(_g[1]) {
            case 1:
                var edge = _g[2];
                if(listEdges[0] == edge) {
                    listEdges.shift();
                    listFaces.shift();
                }
                break;
            default:
            }
        }
        var funnelLeft = [];
        var funnelRight = [];
        funnelLeft.push(startPoint);
        funnelRight.push(startPoint);
        var verticesDoneSide = new DDLS.Dictionary();
        var pointsList = [];
        var pointSides = new DDLS.Dictionary();
        var pointSuccessor = new DDLS.Dictionary();
        pointSides.set(startPoint,0);
        //0;
        currEdge = listEdges[0];
        var relativPos = DDLS.Geom2D.getRelativePosition2(fromX,fromY,currEdge);
        var prevPoint;
        var newPointA;
        var newPointB;
        newPointA = this.getCopyPoint(currEdge.destinationVertex.pos);
        newPointB = this.getCopyPoint(currEdge.originVertex.pos);
        pointsList.push(newPointA);
        pointsList.push(newPointB);
        pointSuccessor.set(startPoint,newPointA);
        //newPointA;
        pointSuccessor.set(newPointA,newPointB);
        //newPointB;
        prevPoint = newPointB;
        if(relativPos == 1) {
            pointSides.set(newPointA,1);
            //1;
            pointSides.set(newPointB,-1);
            //-1;
            var k1 = currEdge.destinationVertex;
            verticesDoneSide.set(k1,1);
            //1;
            var k2 = currEdge.originVertex;
            verticesDoneSide.set(k2,-1);
            //-1;
        } else if(relativPos == -1) {
            pointSides.set(newPointA,-1);
            //-1;
            pointSides.set(newPointB,1);
            //1;
            var k3 = currEdge.destinationVertex;
            verticesDoneSide.set(k3,-1);
            //-1;
            var k4 = currEdge.originVertex;
            verticesDoneSide.set(k4,1);
            //1;
        }
        var fromVertex = listEdges[0].originVertex;
        var fromFromVertex = listEdges[0].destinationVertex;
        var _g1 = 1;
        var _g2 = listEdges.length;
        while(_g1 < _g2) {
            var i1 = _g1++;
            currEdge = listEdges[i1];
            if(currEdge.originVertex == fromVertex) currVertex = currEdge.destinationVertex; else if(currEdge.destinationVertex == fromVertex) currVertex = currEdge.originVertex; else if(currEdge.originVertex == fromFromVertex) {
                currVertex = currEdge.destinationVertex;
                fromVertex = fromFromVertex;
            } else if(currEdge.destinationVertex == fromFromVertex) {
                currVertex = currEdge.originVertex;
                fromVertex = fromFromVertex;
            } else DDLS.Log("IMPOSSIBLE TO IDENTIFY THE VERTEX !!!");
            newPointA = this.getCopyPoint(currVertex.pos);
            pointsList.push(newPointA);
            direction = -verticesDoneSide.get(fromVertex);
            pointSides.set(newPointA,direction);
            //direction;
            pointSuccessor.set(prevPoint,newPointA);
            //newPointA;
            verticesDoneSide.set(currVertex,direction);
            //direction;
            prevPoint = newPointA;
            fromFromVertex = fromVertex;
            fromVertex = currVertex;
        }
        pointSuccessor.set(prevPoint,endPoint);
        //endPoint;
        pointSides.set(endPoint,0);
        //0;
        var pathPoints = [];
        var pathSides = new DDLS.Dictionary();
        pathPoints.push(startPoint);
        pathSides.set(startPoint,0);
        //0;
        var currPos;
        var _g11 = 0;
        var _g3 = pointsList.length;
        while(_g11 < _g3) {
            var i2 = _g11++;
            currPos = pointsList[i2];
            if(pointSides.get(currPos) == -1) {
                j = funnelLeft.length - 2;
                while(j >= 0) {
                    direction = DDLS.Geom2D.getDirection(funnelLeft[j].x,funnelLeft[j].y,funnelLeft[j + 1].x,funnelLeft[j + 1].y,currPos.x,currPos.y);
                    if(direction != -1) {
                        funnelLeft.shift();
                        var _g21 = 0;
                        while(_g21 < j) {
                            var k5 = _g21++;
                            pathPoints.push(funnelLeft[0]);
                            pathSides.set(funnelLeft[0],1);
                            //1;
                            funnelLeft.shift();
                        }
                        pathPoints.push(funnelLeft[0]);
                        pathSides.set(funnelLeft[0],1);
                        //1;
                        funnelRight.splice(0,funnelRight.length);
                        funnelRight.push(funnelLeft[0]);
                        funnelRight.push(currPos);
                        break;
                    }
                    j--;
                }
                funnelRight.push(currPos);
                j = funnelRight.length - 3;
                while(j >= 0) {
                    direction = DDLS.Geom2D.getDirection(funnelRight[j].x,funnelRight[j].y,funnelRight[j + 1].x,funnelRight[j + 1].y,currPos.x,currPos.y);
                    if(direction == -1) break; else funnelRight.splice(j + 1,1);
                    j--;
                }
            } else {
                j = funnelRight.length - 2;
                while(j >= 0) {
                    direction = DDLS.Geom2D.getDirection(funnelRight[j].x,funnelRight[j].y,funnelRight[j + 1].x,funnelRight[j + 1].y,currPos.x,currPos.y);
                    if(direction != 1) {
                        funnelRight.shift();
                        var _g22 = 0;
                        while(_g22 < j) {
                            var k6 = _g22++;
                            pathPoints.push(funnelRight[0]);
                            pathSides.set(funnelRight[0],-1);
                            //-1;
                            funnelRight.shift();
                        }
                        pathPoints.push(funnelRight[0]);
                        pathSides.set(funnelRight[0],-1);
                        //-1;
                        funnelLeft.splice(0,funnelLeft.length);
                        funnelLeft.push(funnelRight[0]);
                        funnelLeft.push(currPos);
                        break;
                    }
                    j--;
                }
                funnelLeft.push(currPos);
                j = funnelLeft.length - 3;
                while(j >= 0) {
                    direction = DDLS.Geom2D.getDirection(funnelLeft[j].x,funnelLeft[j].y,funnelLeft[j + 1].x,funnelLeft[j + 1].y,currPos.x,currPos.y);
                    if(direction == 1) break; else funnelLeft.splice(j + 1,1);
                    j--;
                }
            }
        }
        var blocked = false;
        j = funnelRight.length - 2;
        while(j >= 0) {
            direction = DDLS.Geom2D.getDirection(funnelRight[j].x,funnelRight[j].y,funnelRight[j + 1].x,funnelRight[j + 1].y,toX,toY);
            if(direction != 1) {
                funnelRight.shift();
                var _g12 = 0;
                var _g4 = j + 1;
                while(_g12 < _g4) {
                    var k7 = _g12++;
                    pathPoints.push(funnelRight[0]);
                    pathSides.set(funnelRight[0],-1);
                    //-1;
                    funnelRight.shift();
                }
                pathPoints.push(endPoint);
                pathSides.set(endPoint,0);
                //0;
                blocked = true;
                break;
            }
            j--;
        }
        if(!blocked) {
            j = funnelLeft.length - 2;
            while(j >= 0) {
                direction = DDLS.Geom2D.getDirection(funnelLeft[j].x,funnelLeft[j].y,funnelLeft[j + 1].x,funnelLeft[j + 1].y,toX,toY);
                if(direction != -1) {
                    funnelLeft.shift();
                    var _g13 = 0;
                    var _g5 = j + 1;
                    while(_g13 < _g5) {
                        var k8 = _g13++;
                        pathPoints.push(funnelLeft[0]);
                        pathSides.set(funnelLeft[0],1);
                        //1;
                        funnelLeft.shift();
                    }
                    pathPoints.push(endPoint);
                    pathSides.set(endPoint,0);
                    //0;
                    blocked = true;
                    break;
                }
                j--;
            }
        }
        if(!blocked) {
            pathPoints.push(endPoint);
            pathSides.set(endPoint,0);
            //0;
            blocked = true;
        }
        var adjustedPoints = [];
        if(this._radius > 0) {
            var newPath = [];
            if(pathPoints.length == 2) this.adjustWithTangents(pathPoints[0],false,pathPoints[1],false,pointSides,pointSuccessor,newPath,adjustedPoints); else if(pathPoints.length > 2) {
                this.adjustWithTangents(pathPoints[0],false,pathPoints[1],true,pointSides,pointSuccessor,newPath,adjustedPoints);
                if(pathPoints.length > 3) {
                    var _g14 = 1;
                    var _g6 = pathPoints.length - 3 + 1;
                    while(_g14 < _g6) {
                        var i3 = _g14++;
                        this.adjustWithTangents(pathPoints[i3],true,pathPoints[i3 + 1],true,pointSides,pointSuccessor,newPath,adjustedPoints);
                    }
                }
                var pathLength = pathPoints.length;
                this.adjustWithTangents(pathPoints[pathLength - 2],true,pathPoints[pathLength - 1],false,pointSides,pointSuccessor,newPath,adjustedPoints);
            }
            newPath.push(endPoint);
            this.checkAdjustedPath(newPath,adjustedPoints,pointSides);
            var smoothPoints = [];
            i = newPath.length - 2;
            while(i >= 1) {
                this.smoothAngle(adjustedPoints[i * 2 - 1],newPath[i],adjustedPoints[i * 2],pointSides.get(newPath[i]),smoothPoints);
                while(smoothPoints.length != 0) {
                    var temp = i * 2;
                    adjustedPoints.splice(temp,0);
                    var x = smoothPoints.pop();
                    adjustedPoints.splice(temp,0,x);
                }
                i--;
            }
        } else adjustedPoints = pathPoints;
        var _g15 = 0;
        var _g7 = adjustedPoints.length;
        while(_g15 < _g7) {
            var i4 = _g15++;
            resultPath.push(adjustedPoints[i4].x);
            resultPath.push(adjustedPoints[i4].y);
        }
    },
    adjustWithTangents: function(p1,applyRadiusToP1,p2,applyRadiusToP2,pointSides,pointSuccessor,newPath,adjustedPoints) {
        var tangentsResult = [];
        var side1 = pointSides.get(p1);
        var side2 = pointSides.get(p2);
        var pTangent1 = null;
        var pTangent2 = null;
        if(!applyRadiusToP1 && !applyRadiusToP2) {
            pTangent1 = p1;
            pTangent2 = p2;
        } else if(!applyRadiusToP1) {
            if(DDLS.Geom2D.tangentsPointToCircle(p1.x,p1.y,p2.x,p2.y,this._radius,tangentsResult)) {
                if(side2 == 1) {
                    pTangent1 = p1;
                    pTangent2 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                } else {
                    pTangent1 = p1;
                    pTangent2 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                }
            } else {
                DDLS.Log("NO TANGENT");
                return;
            }
        } else if(!applyRadiusToP2) {
            if(DDLS.Geom2D.tangentsPointToCircle(p2.x,p2.y,p1.x,p1.y,this._radius,tangentsResult)) {
                if(tangentsResult.length > 0) {
                    if(side1 == 1) {
                        pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                        pTangent2 = p2;
                    } else {
                        pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                        pTangent2 = p2;
                    }
                }
            } else {
                DDLS.Log("NO TANGENT");
                return;
            }
        } else if(side1 == 1 && side2 == 1) {
            DDLS.Geom2D.tangentsParalCircleToCircle(this._radius,p1.x,p1.y,p2.x,p2.y,tangentsResult);
            pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
        } else if(side1 == -1 && side2 == -1) {
            DDLS.Geom2D.tangentsParalCircleToCircle(this._radius,p1.x,p1.y,p2.x,p2.y,tangentsResult);
            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
            pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
        } else if(side1 == 1 && side2 == -1) {
            if(DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius,p1.x,p1.y,p2.x,p2.y,tangentsResult)) {
                pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
            } else {
                DDLS.Log("NO TANGENT, points are too close for radius");
                return;
            }
        } else if(DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius,p1.x,p1.y,p2.x,p2.y,tangentsResult)) {
            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
        } else {
            DDLS.Log("NO TANGENT, points are too close for radius");
            return;
        }
        var successor = pointSuccessor.get(p1);
        var distance;
        while(successor != p2) {
            distance = DDLS.Geom2D.distanceSquaredPointToSegment(successor.x,successor.y,pTangent1.x,pTangent1.y,pTangent2.x,pTangent2.y);
            if(distance < this._radiusSquared) {
                this.adjustWithTangents(p1,applyRadiusToP1,successor,true,pointSides,pointSuccessor,newPath,adjustedPoints);
                this.adjustWithTangents(successor,true,p2,applyRadiusToP2,pointSides,pointSuccessor,newPath,adjustedPoints);
                return;
            } else successor = pointSuccessor.get(successor);
        }
        adjustedPoints.push(pTangent1);
        adjustedPoints.push(pTangent2);
        newPath.push(p1);
    },
    checkAdjustedPath: function(newPath,adjustedPoints,pointSides) {
        var needCheck = true;
        var point0;
        var point0Side;
        var point1;
        var point1Side;
        var point2;
        var point2Side;
        var pt1;
        var pt2;
        var pt3;
        var dot;
        var tangentsResult = [];
        var pTangent1 = null;
        var pTangent2 = null;
        while(needCheck) {
            needCheck = false;
            var i = 2;
            while(i < newPath.length) {
                point2 = newPath[i];
                point2Side = pointSides.get(point2);
                point1 = newPath[i - 1];
                point1Side = pointSides.get(point1);
                point0 = newPath[i - 2];
                point0Side = pointSides.get(point0);
                if(point1Side == point2Side) {
                    pt1 = adjustedPoints[(i - 2) * 2];
                    pt2 = adjustedPoints[(i - 1) * 2 - 1];
                    pt3 = adjustedPoints[(i - 1) * 2];
                    dot = (pt1.x - pt2.x) * (pt3.x - pt2.x) + (pt1.y - pt2.y) * (pt3.y - pt2.y);
                    if(dot > 0) {
                        if(i == 2) {
                            DDLS.Geom2D.tangentsPointToCircle(point0.x,point0.y,point2.x,point2.y,this._radius,tangentsResult);
                            if(point2Side == 1) {
                                pTangent1 = point0;
                                pTangent2 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                            } else {
                                pTangent1 = point0;
                                pTangent2 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                            }
                        } else if(i == newPath.length - 1) {
                            DDLS.Geom2D.tangentsPointToCircle(point2.x,point2.y,point0.x,point0.y,this._radius,tangentsResult);
                            if(point0Side == 1) {
                                pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                                pTangent2 = point2;
                            } else {
                                pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                                pTangent2 = point2;
                            }
                        } else if(point0Side == 1 && point2Side == -1) {
                            DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius,point0.x,point0.y,point2.x,point2.y,tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                            pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
                        } else if(point0Side == -1 && point2Side == 1) {
                            DDLS.Geom2D.tangentsCrossCircleToCircle(this._radius,point0.x,point0.y,point2.x,point2.y,tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
                        } else if(point0Side == 1 && point2Side == 1) {
                            DDLS.Geom2D.tangentsParalCircleToCircle(this._radius,point0.x,point0.y,point2.x,point2.y,tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[2],tangentsResult[3]);
                            pTangent2 = this.getPoint(tangentsResult[4],tangentsResult[5]);
                        } else if(point0Side == -1 && point2Side == -1) {
                            DDLS.Geom2D.tangentsParalCircleToCircle(this._radius,point0.x,point0.y,point2.x,point2.y,tangentsResult);
                            pTangent1 = this.getPoint(tangentsResult[0],tangentsResult[1]);
                            pTangent2 = this.getPoint(tangentsResult[6],tangentsResult[7]);
                        }
                        var temp = (i - 2) * 2;
                        adjustedPoints.splice(temp,1);
                        adjustedPoints.splice(temp,0,pTangent1);
                        temp = i * 2 - 1;
                        adjustedPoints.splice(temp,1);
                        adjustedPoints.splice(temp,0,pTangent2);
                        newPath.splice(i - 1,1);
                        adjustedPoints.splice((i - 1) * 2 - 1,2);
                        tangentsResult.splice(0,tangentsResult.length);
                        i--;
                    }
                }
                i++;
            }
        }
    },
    smoothAngle: function(prevPoint,pointToSmooth,nextPoint,side,encirclePoints) {
        var angleType = DDLS.Geom2D.getDirection(prevPoint.x,prevPoint.y,pointToSmooth.x,pointToSmooth.y,nextPoint.x,nextPoint.y);
        var distanceSquared = (prevPoint.x - nextPoint.x) * (prevPoint.x - nextPoint.x) + (prevPoint.y - nextPoint.y) * (prevPoint.y - nextPoint.y);
        if(distanceSquared <= this._sampleCircleDistanceSquared) return;
        var index = 0;
        var side1;
        var side2;
        var pointInArea;
        var xToCheck;
        var yToCheck;
        var _g1 = 0;
        var _g = this._numSamplesCircle;
        while(_g1 < _g) {
            var i = _g1++;
            pointInArea = false;
            xToCheck = pointToSmooth.x + this._sampleCircle[i].x;
            yToCheck = pointToSmooth.y + this._sampleCircle[i].y;
            side1 = DDLS.Geom2D.getDirection(prevPoint.x,prevPoint.y,pointToSmooth.x,pointToSmooth.y,xToCheck,yToCheck);
            side2 = DDLS.Geom2D.getDirection(pointToSmooth.x,pointToSmooth.y,nextPoint.x,nextPoint.y,xToCheck,yToCheck);
            if(side == 1) {
                if(angleType == -1) {
                    if(side1 == -1 && side2 == -1) pointInArea = true;
                } else if(side1 == -1 || side2 == -1) pointInArea = true;
            } else if(angleType == 1) {
                if(side1 == 1 && side2 == 1) pointInArea = true;
            } else if(side1 == 1 || side2 == 1) pointInArea = true;
            if(pointInArea) {
                encirclePoints.splice(index,0);
                var x = new DDLS.Point(xToCheck,yToCheck);
                encirclePoints.splice(index,0,x);
                index++;
            } else index = 0;
        }
        if(side == -1) encirclePoints.reverse();
    }
};
DDLS.PathFinder = function() {
    this.astar = new DDLS.AStar();
    this.funnel = new DDLS.Funnel();
    this.listFaces = [];
    this.listEdges = [];
    this._mesh = null;
    this.entity = null;

    Object.defineProperty(this, 'mesh', {
        get: function() { return this._mesh; },
        set: function(value) { this._mesh = value; this.astar.mesh = value; }
    });
};

DDLS.PathFinder.prototype = {
    dispose: function() {
        this._mesh = null;
        this.astar.dispose();
        this.astar = null;
        this.funnel.dispose();
        this.funnel = null;
        this.listEdges = null;
        this.listFaces = null;
    },
    findPath: function(toX,toY,resultPath) {
        resultPath.splice(0,resultPath.length);
        DDLS.Debug.assertFalse(this._mesh == null,"Mesh missing",{ fileName : "PathFinder.hx", lineNumber : 51, className : "DDLS.PathFinder", methodName : "findPath"});
        DDLS.Debug.assertFalse(this.entity == null,"Entity missing",{ fileName : "PathFinder.hx", lineNumber : 52, className : "DDLS.PathFinder", methodName : "findPath"});
        if(DDLS.Geom2D.isCircleIntersectingAnyConstraint(toX,toY,this.entity.radius,this._mesh)) return;
        this.astar.radius = this.entity.radius;
        this.funnel.radius = this.entity.radius;
        this.listFaces.splice(0,this.listFaces.length);
        this.listEdges.splice(0,this.listEdges.length);
        this.astar.findPath(this.entity.x,this.entity.y,toX,toY,this.listFaces,this.listEdges);
        if(this.listFaces.length == 0) {
            DDLS.Log("PathFinder listFaces.length == 0",{ fileName : "PathFinder.hx", lineNumber : 63, className : "DDLS.PathFinder", methodName : "findPath"});
            return;
        }
        this.funnel.findPath(this.entity.x,this.entity.y,toX,toY,this.listFaces,this.listEdges,resultPath);
    }
};
DDLS.FieldOfView = function() {
    this._fromEntity = null;
    this._mesh = null;
    this._debug = false;

    Object.defineProperty(this, 'fromEntity', {
        get: function() { return this._fromEntity; },
        set: function(value) { this._fromEntity = value; }
    });

    Object.defineProperty(this, 'mesh', {
        get: function() { return this._mesh; }
    });
};

DDLS.FieldOfView.prototype = {
    isInField:function(targetEntity){
        if (!this._mesh) return;//throw new Error("Mesh missing");
        if (!this._fromEntity) return;//throw new Error("From entity missing");
        
        var posX = this._fromEntity.x;
        var posY = this._fromEntity.y;
        var directionNormX = this._fromEntity.dirNormX;
        var directionNormY = this._fromEntity.dirNormY;
        var radius = this._fromEntity.radiusFOV;
        var angle = this._fromEntity.angleFOV;
        
        var targetX = targetEntity.x;
        var targetY = targetEntity.y;
        var targetRadius = targetEntity.radius
        
        var distSquared = (posX-targetX)*(posX-targetX) + (posY-targetY)*(posY-targetY);
        
        // if target is completely outside field radius
        if ( distSquared >= (radius + targetRadius)*(radius + targetRadius) ){
            //trace("target is completely outside field radius");
            return false;
        }
        
        if (distSquared < targetRadius*targetRadius){
            //trace("degenerate case if the field center is inside the target");
            return true;
        }
        
        var leftTargetX, leftTargetY, rightTargetX, rightTargetY, leftTargetInField, rightTargetInField;
        
        // we consider the 2 cicrles intersections
        var  result = [];
        if ( DDLS.Geom2D.intersections2Circles(posX, posY, radius, targetX, targetY, targetRadius, result) ){
            leftTargetX = result[0];
            leftTargetY = result[1];
            rightTargetX = result[2];
            rightTargetY = result[3];
        }
        
        var midX = 0.5*(posX + targetX);
        var midY = 0.5*(posY + targetY);
        if ( result.length == 0 || (midX - targetX)*(midX - targetX) + (midY - targetY)*(midY - targetY) < (midX - leftTargetX)*(midX - leftTargetX) + (midY - leftTargetY)*(midY - leftTargetY) ){
            // we consider the 2 tangents from field center to target
            result.splice(0, result.length);
            DDLS.Geom2D.tangentsPointToCircle(posX, posY, targetX, targetY, targetRadius, result);
            leftTargetX = result[0];
            leftTargetY = result[1];
            rightTargetX = result[2];
            rightTargetY = result[3];
        }
        
        if (this._debug){
            this._debug.graphics.lineStyle(1, 0x0000FF);
            this._debug.graphics.drawCircle(leftTargetX, leftTargetY, 2);
            this._debug.graphics.lineStyle(1, 0xFF0000);
            this._debug.graphics.drawCircle(rightTargetX, rightTargetY, 2);
        }
        
        var dotProdMin = DDLS.cos(this._fromEntity.angleFOV/2);
        // we compare the dots for the left point
        var leftX = leftTargetX - posX;
        var leftY = leftTargetY - posY;
        var lengthLeft = DDLS.sqrt( leftX*leftX + leftY*leftY );
        var dotLeft = (leftX/lengthLeft)*directionNormX + (leftY/lengthLeft)*directionNormY;
        // if the left point is in field
        if (dotLeft > dotProdMin){
            //trace("the left point is in field");
            leftTargetInField = true;
        }
        else{
            leftTargetInField = false;
        }
        
        // we compare the dots for the right point
        var rightX = rightTargetX - posX;
        var rightY = rightTargetY - posY;
        var lengthRight = DDLS.sqrt( rightX*rightX + rightY*rightY );
        var dotRight = (rightX/lengthRight)*directionNormX + (rightY/lengthRight)*directionNormY;
        // if the right point is in field
        if (dotRight > dotProdMin){
            //trace("the right point is in field");
            rightTargetInField = true;
        }
        else{
            rightTargetInField = false;
        }
        
        // if the left and right points are outside field
        if (!leftTargetInField && !rightTargetInField){
            // we must check if the Left/right points are on 2 different sides
            if ( DDLS.Geom2D.getDirection(posX, posY, posX+directionNormX, posY+directionNormY, leftTargetX, leftTargetY) == 1
                && DDLS.Geom2D.getDirection(posX, posY, posX+directionNormX, posY+directionNormY, rightTargetX, rightTargetY) == -1 ){
                //trace("the Left/right points are on 2 different sides"); 
            }
            else{
                // we abort : target is not in field
                return false;
            }
        }
        
        // we init the window
        if (!leftTargetInField || !rightTargetInField){
            var p = new DDLS.Point();
            var dirAngle;
            dirAngle = DDLS.atan2(directionNormY, directionNormX);
            if ( !leftTargetInField ){
                var leftFieldX = DDLS.cos(dirAngle - angle/2);
                var leftFieldY = DDLS.sin(dirAngle - angle/2);
                DDLS.Geom2D.intersections2segments(posX, posY, posX+leftFieldX, posY+leftFieldY , leftTargetX, leftTargetY, rightTargetX, rightTargetY , p, null, true);
                if (this._debug){
                    this._debug.graphics.lineStyle(1, 0x0000FF);
                    this._debug.graphics.drawCircle(p.x, p.y, 2);
                }
                leftTargetX = p.x;
                leftTargetY = p.y;
            }
            if ( !rightTargetInField ){
                var rightFieldX = DDLS.cos(dirAngle + angle/2);
                var rightFieldY = DDLS.sin(dirAngle + angle/2);
                DDLS.Geom2D.intersections2segments(posX, posY, posX+rightFieldX, posY+rightFieldY , leftTargetX, leftTargetY, rightTargetX, rightTargetY , p, null, true);
                if (this._debug){
                    this._debug.graphics.lineStyle(1, 0xFF0000);
                    this._debug.graphics.drawCircle(p.x, p.y, 2);
                }
                rightTargetX = p.x;
                rightTargetY = p.y;
            }
        }
        
        if (this._debug){
            this._debug.graphics.lineStyle(1, 0x000000);
            this._debug.graphics.moveTo(posX, posY);
            this._debug.graphics.lineTo(leftTargetX, leftTargetY);
            this._debug.graphics.lineTo(rightTargetX, rightTargetY);
            this._debug.graphics.lineTo(posX, posY);
        }
        // now we have a triangle called the window defined by: posX, posY, rightTargetX, rightTargetY, leftTargetX, leftTargetY
        
        // we set a dictionnary of faces done
        var facesDone = new DDLS.Dictionary();
        // we set a dictionnary of edges done
        var edgesDone = new DDLS.Dictionary();
        // we set the window wall
        var wall = [];
        // we localize the field center
        var startObj = DDLS.Geom2D.locatePosition(posX, posY, this._mesh);
        var startFace;

        if ( startObj instanceof DDLS.Face ) startFace = startObj;
        else if ( startObj instanceof DDLS.Edge ) startFace = startObj.leftFace;
        else if ( startObj instanceof DDLS.Vertex ) startFace = startObj.edge.leftFace;
        
        
        // we put the face where the field center is lying in open list
        var openFacesList = [];
        var openFaces = new DDLS.Dictionary();
        openFacesList.push(startFace);
        openFaces[startFace] = true;
        
        var currentFace, currentEdge, s1, s2;
        var p1 = new DDLS.Point();
        var p2 = new DDLS.Point();
        var param1, param2, i, index1, index2;
        var params = [];
        var edges = [];
        // we iterate as long as we have new open facess
        while ( openFacesList.length > 0 ){
            // we pop the 1st open face: current face
            currentFace = openFacesList.shift();
            openFaces.set(currentFace, null);
            facesDone.set(currentFace, true);
            
            // for each non-done edges from the current face
            currentEdge = currentFace.edge;
            if ( !edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge) ){
                edges.push(currentEdge);
                edgesDone.set(currentEdge, true);
            }
            currentEdge = currentEdge.nextLeftEdge;
            if ( !edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge) ){
                edges.push(currentEdge);
                edgesDone.set(currentEdge, true);
            }
            currentEdge = currentEdge.nextLeftEdge;
            if ( !edgesDone.get(currentEdge) && !edgesDone.get(currentEdge.oppositeEdge) ){
                edges.push(currentEdge);
                edgesDone.set(currentEdge, true);
            }
            
            while (edges.length > 0){
                currentEdge = edges.pop();
                
                // if the edge overlap (interects or lies inside) the window
                s1 = currentEdge.originVertex.pos;
                s2 = currentEdge.destinationVertex.pos;
                if ( DDLS.Geom2D.clipSegmentByTriangle(s1.x, s1.y, s2.x, s2.y, posX, posY, rightTargetX, rightTargetY, leftTargetX, leftTargetY, p1, p2) ){
                    // if the edge if constrained
                    if ( currentEdge.isConstrained ){
                        if (this._debug){
                            this._debug.graphics.lineStyle(6, 0xFFFF00);
                            this._debug.graphics.moveTo(p1.x, p1.y);
                            this._debug.graphics.lineTo(p2.x, p2.y);
                        }
                        
                        // we project the constrained edge on the wall
                        params.splice(0, params.length);
                        DDLS.Geom2D.intersections2segments(posX, posY, p1.x, p1.y, leftTargetX, leftTargetY,  rightTargetX, rightTargetY, null, params, true);
                        DDLS.Geom2D.intersections2segments(posX, posY, p2.x, p2.y, leftTargetX, leftTargetY,  rightTargetX, rightTargetY, null, params, true);
                        param1 = params[1];
                        param2 = params[3];
                        if ( param2 < param1 ){
                            param1 = param2;
                            param2 = params[1];
                        }
                        /*if (_debug)
                        {
                            _debug.graphics.lineStyle(3, 0x00FFFF);
                            _debug.graphics.moveTo(leftTargetX + param1*(rightTargetX-leftTargetX), leftTargetY + param1*(rightTargetY-leftTargetY));
                            _debug.graphics.lineTo(leftTargetX + param2*(rightTargetX-leftTargetX), leftTargetY + param2*(rightTargetY-leftTargetY));
                        }*/
                        
                        // we sum it to the window wall
                        for (i=wall.length-1 ; i>=0 ; i--){
                            if ( param2 >= wall[i] ) break;
                        }
                        index2 = i+1;
                        if (index2 % 2 == 0)
                            wall.splice(index2, 0, param2);
                        
                        for (i=0 ; i<wall.length ; i++){
                            if ( param1 <= wall[i] ) break;
                        }
                        index1 = i;
                        if (index1 % 2 == 0){
                            wall.splice(index1, 0, param1);
                            index2++;
                        }
                        else{
                            index1--;
                        }
                        
                        wall.splice( index1+1, index2-index1-1);
                        
                        // if the window is totally covered, we stop and return false
                        if ( wall.length == 2 && -DDLS.EPSILON < wall[0] && wall[0] < DDLS.EPSILON && 1-DDLS.EPSILON < wall[1] && wall[1] < 1+DDLS.EPSILON ) return false;
                        
                    }
                    
                    // if the adjacent face is neither in open list nor in faces done dictionnary
                    currentFace = currentEdge.rightFace;
                    if (!openFaces.get(currentFace) && !facesDone.get(currentFace)){
                        // we add it in open list
                        openFacesList.push(currentFace);
                        openFaces.set(currentFace, true);
                    }
                }
            }
        }
        
        if (this._debug){
            this._debug.graphics.lineStyle(3, 0x00FFFF);

            for (i=0 ; i<wall.length ; i+=2){
                this._debug.graphics.moveTo(leftTargetX + wall[i]*(rightTargetX-leftTargetX), leftTargetY + wall[i]*(rightTargetY-leftTargetY));
                this._debug.graphics.lineTo(leftTargetX + wall[i+1]*(rightTargetX-leftTargetX), leftTargetY + wall[i+1]*(rightTargetY-leftTargetY));
            }
        }
        // if the window is totally covered, we stop and return false
        /*if ( wall.length == 2
            && -QEConstants.EPSILON < wall[0] && wall[0] < QEConstants.EPSILON
            && 1-QEConstants.EPSILON < wall[1] && wall[1] < 1+QEConstants.EPSILON )
        {
            return false;
        }
        trace(wall);*/
        
        return true;
    }

}
DDLS.LinearPathSampler = function() {
    this.entity = null;
    this._samplingDistanceSquared = 1;
    this._samplingDistance = 1;
    this._preCompX = [];
    this._preCompY = [];
    this._path = null;
    this._currentX = 0;
    this._currentY = 0;
    this.hasPrev = false;
    this.hasNext = false;
    this._count = 0;

    Object.defineProperty(this, 'x', {
        get: function() { return this._currentX; }
    });

    Object.defineProperty(this, 'y', {
        get: function() { return this._currentY; }
    });

    Object.defineProperty(this, 'countMax', {
        get: function() { return this._preCompX.length-1; }
    });

    Object.defineProperty(this, 'count', {
        get: function() { return this._count; },
        set: function(value) { 
            this._count = value;
            if(this._count < 0) this._count = 0;
            if(this._count > this.countMax - 1) this._count = this.countMax - 1;
            if(this._count == 0) this.hasPrev = false; else this.hasPrev = true;
            if(this._count == this.countMax - 1) this.hasNext = false; else this.hasNext = true;
            this._currentX = this._preCompX[this._count];
            this._currentY = this._preCompY[this._count];
            this.updateEntity();
        }
    });

    Object.defineProperty(this, 'samplingDistance', {
        get: function() { return this._samplingDistance; },
        set: function(value) { 
            this._samplingDistance = value;
            this._samplingDistanceSquared = this._samplingDistance * this._samplingDistance;
        }
    });

    Object.defineProperty(this, 'path', {
        get: function() { return this._path; },
        set: function(value) { 
            this._path = value;
            this._preComputed = false;
            this.reset();
        }
    });

    
};

DDLS.LinearPathSampler.pythag = function(a,b) {
    return DDLS.sqrt(a * a + b * b);
};
DDLS.LinearPathSampler.prototype = {
    dispose: function() {
        this.entity = null;
        this._path = null;
        this._preCompX = null;
        this._preCompY = null;
    },
    reset: function() {
        if(this._path.length > 0) {
            DDLS.Debug.assertTrue((this._path.length & 1) == 0,"Wrong length",{ fileName : "LinearPathSampler.hx", lineNumber : 100, className : "DDLS.LinearPathSampler", methodName : "reset"});
            this._currentX = this._path[0];
            this._currentY = this._path[1];
            this._iPrev = 0;
            this._iNext = 2;
            this.hasPrev = false;
            this.hasNext = true;
            this._count = 0;
            this.updateEntity();
        } else {
            this.hasPrev = false;
            this.hasNext = false;
            this._count = 0;
        }
    },
    preCompute: function() {
        this._preCompX.splice(0,this._preCompX.length);
        this._preCompY.splice(0,this._preCompY.length);
        this._count = 0;
        this._preCompX.push(this._currentX);
        this._preCompY.push(this._currentY);
        this._preComputed = false;
        while(this.next()) {
            this._preCompX.push(this._currentX);
            this._preCompY.push(this._currentY);
        }
        this.reset();
        this._preComputed = true;
    },
    prev: function() {
        if(!this.hasPrev) return false;
        this.hasNext = true;
        if(this._preComputed) {
            this._count--;
            if(this._count == 0) this.hasPrev = false;
            this._currentX = this._preCompX[this._count];
            this._currentY = this._preCompY[this._count];
            this.updateEntity();
            return true;
        }
        var remainingDist;
        var dist;
        remainingDist = this._samplingDistance;
        while(true) {
            var pathPrev = this._path[this._iPrev];
            var pathPrev1 = this._path[this._iPrev + 1];
            dist = DDLS.LinearPathSampler.pythag(this._currentX - pathPrev,this._currentY - pathPrev1);
            if(dist < remainingDist) {
                remainingDist -= dist;
                this._iPrev -= 2;
                this._iNext -= 2;
                if(this._iNext == 0) break;
            } else break;
        }
        if(this._iNext == 0) {
            this._currentX = this._path[0];
            this._currentY = this._path[1];
            this.hasPrev = false;
            this._iNext = 2;
            this._iPrev = 0;
            this.updateEntity();
            return true;
        } else {
            this._currentX = this._currentX + (this._path[this._iPrev] - this._currentX) * remainingDist / dist;
            this._currentY = this._currentY + (this._path[this._iPrev + 1] - this._currentY) * remainingDist / dist;
            this.updateEntity();
            return true;
        }
    },
    next: function() {
        if(!this.hasNext) return false;
        this.hasPrev = true;
        if(this._preComputed) {
            this._count++;
            if(this._count == this._preCompX.length - 1) this.hasNext = false;
            this._currentX = this._preCompX[this._count];
            this._currentY = this._preCompY[this._count];
            this.updateEntity();
            return true;
        }
        var remainingDist;
        var dist;
        remainingDist = this._samplingDistance;
        while(true) {
            var pathNext = this._path[this._iNext];
            var pathNext1 = this._path[this._iNext + 1];
            dist = DDLS.LinearPathSampler.pythag(this._currentX - pathNext,this._currentY - pathNext1);
            if(dist < remainingDist) {
                remainingDist -= dist;
                this._currentX = this._path[this._iNext];
                this._currentY = this._path[this._iNext + 1];
                this._iPrev += 2;
                this._iNext += 2;
                if(this._iNext == this._path.length) break;
            } else break;
        }
        if(this._iNext == this._path.length) {
            this._currentX = this._path[this._iPrev];
            this._currentY = this._path[this._iPrev + 1];
            this.hasNext = false;
            this._iNext = this._path.length - 2;
            this._iPrev = this._iNext - 2;
            this.updateEntity();
            return true;
        } else {
            this._currentX = this._currentX + (this._path[this._iNext] - this._currentX) * remainingDist / dist;
            this._currentY = this._currentY + (this._path[this._iNext + 1] - this._currentY) * remainingDist / dist;
            this.updateEntity();
            return true;
        }
    },
    updateEntity: function() {
        if(this.entity == null) return;
        this.entity.x = this._currentX;
        this.entity.y = this._currentY;
    }
};
DDLS.PathIterator = function() {
    this._entity = null;
    this._currentX = 0;
    this._currentY = 0;
    this._hasPrev = false;
    this._hasNext = false;

    this._path = [];
    this._count = 0;
    this._countMax = 0;
};

DDLS.PathIterator.prototype = {
    get_entity:function(){
        return this._entity;
    },
    set_entity:function(value){
        this._entity = value;
    },
    get_x:function(){
        return this._currentX;
    },
    get_y:function(){
        return this._currentY;
    },
    get_hasPrev:function(){
        return this._hasPrev;
    },
    get_hasNext:function(){
        return this._hasNext;
    },
    get_count:function(){
        return this._count;
    },
    get_countMax:function(){
        return this._countMax;
    },
    set_path:function(value){
        this._path = value;
        this._countMax = this._path.length / 2;
        this.reset();
    },
    reset:function(){
        this._count = 0;
        this._currentX = this._path[this._count];
        this._currentY = this._path[this._count+1];
        this.updateEntity();
            
        this._hasPrev = false;
        if (this._path.length > 2) this._hasNext = true;
        else this._hasNext = false;
    },
    prev:function(){
        if (! this._hasPrev) return false;
        this._hasNext = true;
            
        this._count--;
        this._currentX = this._path[this._count*2];
        this._currentY = this._path[this._count*2+1];
            
        this.updateEntity();
            
        if (this._count == 0) this._hasPrev = false;
        return true;
    },
    next:function(){
        if (! this._hasNext) return false;
        this._hasPrev = true;
            
        this._count++;
        this._currentX = this._path[this._count*2];
        this._currentY = this._path[this._count*2+1];
            
        this.updateEntity();
            
        if ((this._count+1)*2 == this._path.length) this._hasNext = false;    
        return true;
    },
    updateEntity:function(){
        if (!this._entity) return;
        this._entity.x = this._currentX;
        this._entity.y = this._currentY;
    }
};
DDLS.RectMesh = {};
DDLS.RectMesh = function(w,h) {
    var v = [];
    var e = [];
    var f = [];
    var s = [];
    var i = 4;
    while(i--){
        f.push(new DDLS.Face());
        v.push(new DDLS.Vertex());
        s.push(new DDLS.Segment());
    }
    i = 12;
    while(i--) e.push(new DDLS.Edge());

    var boundShape = new DDLS.Shape();    
    var offset = 10.;

    v[0].pos.setXY(0 - offset,0 - offset);
    v[1].pos.setXY(w + offset,0 - offset);
    v[2].pos.setXY(w + offset,h + offset);
    v[3].pos.setXY(0 - offset,h + offset);
    v[0].setDatas(e[0]);
    v[1].setDatas(e[2]);
    v[2].setDatas(e[4]);
    v[3].setDatas(e[6]);
    e[0].setDatas(v[0],e[1],e[2],f[3],true,true);
    e[1].setDatas(v[1],e[0],e[7],f[0],true,true);
    e[2].setDatas(v[1],e[3],e[11],f[3],true,true);
    e[3].setDatas(v[2],e[2],e[8],f[1],true,true);
    e[4].setDatas(v[2],e[5],e[6],f[2],true,true);
    e[5].setDatas(v[3],e[4],e[3],f[1],true,true);
    e[6].setDatas(v[3],e[7],e[10],f[2],true,true);
    e[7].setDatas(v[0],e[6],e[9],f[0],true,true);
    e[8].setDatas(v[1],e[9],e[5],f[1],true,false);
    e[9].setDatas(v[3],e[8],e[1],f[0],true,false);
    e[10].setDatas(v[0],e[11],e[4],f[2],false,false);
    e[11].setDatas(v[2],e[10],e[0],f[3],false,false);
    f[0].setDatas(e[9]);
    f[1].setDatas(e[8]);
    f[2].setDatas(e[4],false);
    f[3].setDatas(e[2],false);
    v[0].fromConstraintSegments = [s[0],s[3]];
    v[1].fromConstraintSegments = [s[0],s[1]];
    v[2].fromConstraintSegments = [s[1],s[2]];
    v[3].fromConstraintSegments = [s[2],s[3]];
    e[0].fromConstraintSegments.push(s[0]);
    e[1].fromConstraintSegments.push(s[0]);
    e[2].fromConstraintSegments.push(s[1]);
    e[3].fromConstraintSegments.push(s[1]);
    e[4].fromConstraintSegments.push(s[2]);
    e[5].fromConstraintSegments.push(s[2]);
    e[6].fromConstraintSegments.push(s[3]);
    e[7].fromConstraintSegments.push(s[3]);
    s[0].edges.push(e[0]);
    s[1].edges.push(e[2]);
    s[2].edges.push(e[4]);
    s[3].edges.push(e[6]);
    s[0].fromShape = boundShape;
    s[1].fromShape = boundShape;
    s[2].fromShape = boundShape;
    s[3].fromShape = boundShape;

    boundShape.segments.push(s[0], s[1], s[2], s[3]);// = s;
    var mesh = new DDLS.Mesh(w,h);
    mesh._vertices = v;
    mesh._edges = e;
    mesh._faces = f;

    mesh.get___constraintShapes().push(boundShape);
    var securityRect = [ 0,0,w,0,  w,0,w,h,  w,h,0,h,  0,h,0,0 ];

    mesh.clipping = false;
    mesh.insertConstraintShape(securityRect);
    mesh.clipping = true;
    return mesh;
};
DDLS.BitmapObject = {};

DDLS.BitmapObject.buildFromBmpData = function(bmpData,simplificationEpsilon,debugBmp,debugShape) {
    if(simplificationEpsilon == null) simplificationEpsilon = 1;
    var i;
    var j;
    DDLS.Debug.assertTrue(bmpData.width > 0 && bmpData.height > 0,"Invalid `bmpData` size (" + bmpData.width + ", " + bmpData.height + ")",{ fileName : "BitmapObject.js", lineNumber : 24, className : "DDLS.BitmapObject", methodName : "buildFromBmpData"});
    var shapes = DDLS.Potrace.buildShapes(bmpData,debugBmp,debugShape);
    if(simplificationEpsilon >= 1) {
        var _g1 = 0;
        var _g = shapes.length;
        while(_g1 < _g) {
            var i1 = _g1++;
            shapes[i1] = DDLS.ShapeSimplifier(shapes[i1],simplificationEpsilon);
        }
    }
    var graphs = [];
    var _g11 = 0;
    var _g2 = shapes.length;
    while(_g11 < _g2) {
        var i2 = _g11++;
        graphs.push(DDLS.Potrace.buildGraph(shapes[i2]));
    }
    var polygons = [];
    var _g12 = 0;
    var _g3 = graphs.length;
    while(_g12 < _g3) {
        var i3 = _g12++;
        polygons.push(DDLS.Potrace.buildPolygon(graphs[i3],debugShape));
    }
    var obj = new DDLS.Object();
    var _g13 = 0;
    var _g4 = polygons.length;
    while(_g13 < _g4) {
        var i4 = _g13++;
        j = 0;
        while(j < polygons[i4].length - 2) {
            obj.coordinates.push(polygons[i4][j]);
            obj.coordinates.push(polygons[i4][j + 1]);
            obj.coordinates.push(polygons[i4][j + 2]);
            obj.coordinates.push(polygons[i4][j + 3]);
            j += 2;
        }
        obj.coordinates.push(polygons[i4][0]);
        obj.coordinates.push(polygons[i4][1]);
        obj.coordinates.push(polygons[i4][j]);
        obj.coordinates.push(polygons[i4][j + 1]);
    }
    return obj;
};
DDLS.BitmapMesh = {};

DDLS.BitmapMesh.buildFromBmpData = function(bmpData,simplificationEpsilon,debugBmp,debugShape) {
    if(simplificationEpsilon == null) simplificationEpsilon = 1;
    var i;
    var j;
    DDLS.Debug.assertTrue(bmpData.width > 0 && bmpData.height > 0,"Invalid `bmpData` size (" + bmpData.width + ", " + bmpData.height + ")",{ fileName : "BitmapMesh.js", lineNumber : 24, className : "DDLS.BitmapMesh", methodName : "buildFromBmpData"});
    var shapes = DDLS.Potrace.buildShapes(bmpData,debugBmp,debugShape);
    if(simplificationEpsilon >= 1) {
        var _g1 = 0;
        var _g = shapes.length;
        while(_g1 < _g) {
            var i1 = _g1++;
            shapes[i1] = DDLS.ShapeSimplifier(shapes[i1],simplificationEpsilon);
        }
    }
    var graphs = [];
    var _g11 = 0;
    var _g2 = shapes.length;
    while(_g11 < _g2) {
        var i2 = _g11++;
        graphs.push(DDLS.Potrace.buildGraph(shapes[i2]));
    }
    var polygons = [];
    var _g12 = 0;
    var _g3 = graphs.length;
    while(_g12 < _g3) {
        var i3 = _g12++;
        polygons.push(DDLS.Potrace.buildPolygon(graphs[i3],debugShape));
    }
    var mesh = DDLS.RectMesh(bmpData.width, bmpData.height);
    var _g13 = 0;
    var _g4 = polygons.length;
    while(_g13 < _g4) {
        var i4 = _g13++;
        j = 0;
        while(j < polygons[i4].length - 2) {
            mesh.insertConstraintSegment(polygons[i4][j], polygons[i4][j+1], polygons[i4][j+2], polygons[i4][j+3]);
            j += 2;
        }
        mesh.insertConstraintSegment(polygons[i4][j], polygons[i4][j+1], polygons[i4][j+2], polygons[i4][j+3]);
    }
    return mesh;
};
DDLS.BasicCanvas = function(w, h, color, fps) {
    this.canvas = window.document.createElement("canvas");
    this.canvas.width = w || 200;
    this.canvas.height = h || 200;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.style.position = "absolute";
    this.canvas.style.backgroundColor = color || '#000000';
    this.ctx.fillStyle = color || '#000000';
    this.image = this.canvas;
    this.loop(fps || 60);

    window.document.body.appendChild(this.canvas);
};

DDLS.BasicCanvas.prototype = {
    loop: function(tim) {
        window.requestAnimationFrame(DDLS.Bind(this,this.loop));
        if(this.onEnterFrame != null) this.onEnterFrame();
        return true;
    },
    clear: function() {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    },
    drawCircle: function(x,y,radius) {
        this.ctx.beginPath();
        this.ctx.arc(x,y,radius,0, DDLS.TwoPI, false);
        this.ctx.stroke();
        this.ctx.closePath();
    },
    drawRect: function(x,y,width,height) {
        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
        this.ctx.lineTo(x + width,y);
        this.ctx.lineTo(x + width,y + height);
        this.ctx.lineTo(x,y + height);
        this.ctx.stroke();
        this.ctx.closePath();
    },
    lineStyle: function(wid,col,alpha) {
        this.ctx.lineWidth = wid;
        if(alpha != null && alpha != 1.0) {
            var r = col >> 16 & 255;
            var g = col >> 8 & 255;
            var b = col & 255;
            this.ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
        } else this.ctx.strokeStyle = "#" + DDLS.StringTools.hex(col,6);
    },
    moveTo: function(x,y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x,y);
    },
    lineTo: function(x,y) {
        this.ctx.lineTo(x,y);
        this.ctx.closePath();
        this.ctx.stroke();
    },
    beginFill: function(col,alpha) {
        if(alpha != null && alpha != 1.0) {
            var r = col >> 16 & 255;
            var g = col >> 8 & 255;
            var b = col & 255;
            this.ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
        } else this.ctx.fillStyle = "#" + DDLS.StringTools.hex(col,6);
        this.ctx.beginPath();
    },
    endFill: function() {
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.fill();
    }
};
DDLS.SimpleView = function(canvas) {
    this.entitiesAlpha = .75;
    this.entitiesWidth = 1;
    this.entitiesColor = 65280;
    this.pathsAlpha = .75;
    this.pathsWidth = 1.5;
    this.pathsColor = 16760848;
    this.verticesAlpha = .25;
    this.verticesRadius = .5;
    this.verticesColor = 255;
    this.constraintsAlpha = 1.0;
    this.constraintsWidth = 2;
    this.constraintsColor = 16711680;
    this.edgesAlpha = .25;
    this.edgesWidth = 1;
    this.edgesColor = 10066329;
    this.graphics = new DDLS.DrawContext(canvas);
    this.g = this.graphics.g;
};

DDLS.SimpleView.prototype = {
    drawVertex: function(vertex) {
        this.g.lineStyle(this.verticesRadius,this.verticesColor,this.verticesAlpha);
        this.g.beginFill(this.verticesColor,this.verticesAlpha);
        this.g.drawCircle(vertex.pos.x,vertex.pos.y,this.verticesRadius);
        this.g.endFill();
    },
    drawEdge: function(edge) {
        if(edge.isConstrained) {
            this.g.lineStyle(this.constraintsWidth,this.constraintsColor,this.constraintsAlpha);
            this.g.moveTo(edge.originVertex.pos.x,edge.originVertex.pos.y);
            this.g.lineTo(edge.destinationVertex.pos.x,edge.destinationVertex.pos.y);
        } else {
            this.g.lineStyle(this.edgesWidth,this.edgesColor,this.edgesAlpha);
            this.g.moveTo(edge.originVertex.pos.x,edge.originVertex.pos.y);
            this.g.lineTo(edge.destinationVertex.pos.x,edge.destinationVertex.pos.y);
        }
    },
    drawMesh: function(mesh,cleanBefore) {
        if(cleanBefore == null) cleanBefore = false;
        if(cleanBefore) this.g.clear();
        mesh.traverse(DDLS.Bind(this,this.drawVertex),DDLS.Bind(this,this.drawEdge));
    },
    drawEntity: function(entity,cleanBefore) {
        if(cleanBefore == null) cleanBefore = false;
        if(cleanBefore) this.g.clear();
        this.g.lineStyle(this.entitiesWidth,this.entitiesColor,this.entitiesAlpha);
        this.g.beginFill(this.entitiesColor,this.entitiesAlpha);
        this.g.drawCircle(entity.x,entity.y,entity.radius);
        this.g.endFill();
    },
    drawEntities: function(vEntities,cleanBefore) {
        if(cleanBefore == null) cleanBefore = false;
        if(cleanBefore) this.g.clear();
        var _g1 = 0;
        var _g = vEntities.length;
        while(_g1 < _g) {
            var i = _g1++;
            this.drawEntity(vEntities[i],false);
        }
    },
    drawPath: function(path,cleanBefore) {
        if(cleanBefore == null) cleanBefore = false;
        if(cleanBefore) this.g.clear();
        if(path.length == 0) return;
        this.g.lineStyle(this.pathsWidth,this.pathsColor,this.pathsAlpha);
        this.g.moveTo(path[0],path[1]);
        var i = 2;
        while(i < path.length) {
            this.g.lineTo(path[i],path[i + 1]);
            this.g.moveTo(path[i],path[i + 1]);
            i += 2;
        }
    }
};


DDLS.DrawContext = function(g) {
    this.g = g;
};

DDLS.DrawContext.prototype = {
    clear: function() { this.g.clear(); },
    lineStyle: function(thickness,c,a) {  if(a == null) a = 1; this.g.lineStyle(thickness,c,a); },
    beginFill: function(c,a) { if(a == null) a = 1; this.g.beginFill(c,a);},
    endFill: function() { this.g.endFill(); },
    moveTo: function(x,y) { this.g.moveTo(x,y); },
    lineTo: function(x,y) { this.g.lineTo(x,y);},
    drawCircle: function(cx,cy,r) { this.g.drawCircle(cx,cy,r); },
    drawRect: function(x,y,w,h) { this.g.drawRect(x,y,w,h); }
};
DDLS._Pixels = {};
DDLS._Pixels.Pixels_Impl_ = function() { };

DDLS._Pixels.Pixels_Impl_._new = function(width,height,alloc) {
    if(alloc == null) alloc = true;
    return new DDLS._Pixels.PixelsData(width,height,alloc);
};
DDLS._Pixels.Pixels_Impl_.getByte = function(this1,i) {
    return this1.bytes.b[i];
};
DDLS._Pixels.Pixels_Impl_.getPixel = function(this1,x,y) {
    var pos = y * this1.width + x << 2;
    var r = this1.bytes.b[pos + 1] << 16;
    var g = this1.bytes.b[pos + 2] << 8;
    var b = this1.bytes.b[pos + 3];
    return r | g | b;
};
DDLS._Pixels.Pixels_Impl_.getPixel32 = function(this1,x,y) {
    var pos = y * this1.width + x << 2;
    var a = this1.bytes.b[pos] << 24;
    var r = this1.bytes.b[pos + 1] << 16;
    var g = this1.bytes.b[pos + 2] << 8;
    var b = this1.bytes.b[pos + 3];
    return a | r | g | b;
};
DDLS._Pixels.Pixels_Impl_.setByte = function(this1,i,value) {
    this1.bytes.b[i] = value & 255;
};
DDLS._Pixels.Pixels_Impl_.setPixel = function(this1,x,y,value) {
    var pos = y * this1.width + x << 2;
    var r = value >> 16 & 255;
    var g = value >> 8 & 255;
    var b = value & 255;
    this1.bytes.b[pos + 1] = r & 255;
    this1.bytes.b[pos + 2] = g & 255;
    this1.bytes.b[pos + 3] = b & 255;
};
DDLS._Pixels.Pixels_Impl_.setPixel32 = function(this1,x,y,value) {
    var pos = y * this1.width + x << 2;
    var a = value >> 24 & 255;
    var r = value >> 16 & 255;
    var g = value >> 8 & 255;
    var b = value & 255;
    this1.bytes.b[pos] = a & 255;
    this1.bytes.b[pos + 1] = r & 255;
    this1.bytes.b[pos + 2] = g & 255;
    this1.bytes.b[pos + 3] = b & 255;
};
DDLS._Pixels.Pixels_Impl_.fromImageData = function(image) {
    var pixels = new DDLS._Pixels.PixelsData(image.width,image.height,true);
    var data = image.data;
    var _g1 = 0;
    var _g = data.byteLength;
    while(_g1 < _g) {
        var i = _g1++;
        pixels.bytes.b[i] = data[i] & 255;
    }
    return pixels;
};
DDLS._Pixels.PixelsData = function(width,height,alloc) {
    if(alloc == null) alloc = true;
    this.length = width * height;
    if(alloc) this.bytes = DDLS.Bytes.alloc(this.length << 2);
    this.width = width;
    this.height = height;
};
DDLS._Pixels.PixelsData.__name__ = true;
DDLS.Converter = function() { };
DDLS.Converter.__name__ = true;
DDLS.Converter.ARGB2RGBA = function(inBytesARGB,outBytesRGBA) {
    var convertInPlace = outBytesRGBA == null;
    if(!convertInPlace) {
        var _g1 = 0;
        var _g = inBytesARGB.length;
        while(_g1 < _g) {
            var i = _g1++;
            var pos;
            if(i % 4 != 0) pos = i - 1; else pos = i + 3;
            outBytesRGBA.b[pos] = inBytesARGB.b[i] & 255;
        }
    } else {
        outBytesRGBA = inBytesARGB;
        var _g11 = 0;
        var _g2 = inBytesARGB.length >> 2;
        while(_g11 < _g2) {
            var i1 = _g11++;
            var pos1 = i1 << 2;
            var a = inBytesARGB.b[pos1];
            var r = inBytesARGB.b[pos1 + 1];
            var g = inBytesARGB.b[pos1 + 2];
            var b = inBytesARGB.b[pos1 + 3];
            outBytesRGBA.b[pos1 + 3] = a & 255;
            outBytesRGBA.b[pos1] = r & 255;
            outBytesRGBA.b[pos1 + 1] = g & 255;
            outBytesRGBA.b[pos1 + 2] = b & 255;
        }
    }
};
DDLS.Converter.RGBA2ARGB = function(inBytesRGBA,outBytesARGB) {
    var convertInPlace = outBytesARGB == null;
    if(!convertInPlace) {
        var _g1 = 0;
        var _g = inBytesRGBA.length;
        while(_g1 < _g) {
            var i = _g1++;
            var pos;
            if(i % 4 <= 3) pos = i + 1; else pos = i - 3;
            outBytesARGB.b[pos] = inBytesRGBA.b[i] & 255;
        }
    } else {
        outBytesARGB = inBytesRGBA;
        var _g11 = 0;
        var _g2 = inBytesRGBA.length >> 2;
        while(_g11 < _g2) {
            var i1 = _g11++;
            var pos1 = i1 << 2;
            var a = inBytesRGBA.b[pos1 + 3];
            var r = inBytesRGBA.b[pos1];
            var g = inBytesRGBA.b[pos1 + 1];
            var b = inBytesRGBA.b[pos1 + 2];
            outBytesARGB.b[pos1] = a & 255;
            outBytesARGB.b[pos1 + 1] = r & 255;
            outBytesARGB.b[pos1 + 2] = g & 255;
            outBytesARGB.b[pos1 + 3] = b & 255;
        }
    }
};

// CanvasPixelMatrix

DDLS.CanvasPixelMatrix = function(data_,w_,h_) {
    this.data = data_;
    this.width = w_;
    this.height = h_;
    this.lookup = [];
    var count = 0;
    var _g1 = 0;
    var _g = this.height;
    while(_g1 < _g) {
        var i = _g1++;
        this.lookup[i] = [];
        var _g3 = 0;
        var _g2 = this.width;
        while(_g3 < _g2) {
            var j = _g3++;
            this.lookup[i][j] = count * 4 | 0;
            count++;
        }
    }
};
DDLS.CanvasPixelMatrix.createCanvasPixelMatrixFromContext = function(context,w_,h_) {
    var imageData = context.getImageData(0,0,w_,h_);
    var dataIn = imageData.data;
    return new DDLS.CanvasPixelMatrix(dataIn,w_,h_);
};

DDLS.CanvasPixelMatrix.prototype = {
    getPixel32: function(w_,h_) {
        var offset = this.lookup[h_][w_];
        return this.data[offset + 3] << 24 | this.data[offset] << 16 | this.data[offset + 1] << 8 | this.data[offset + 2];
    }
    ,setPixel32: function(w_,h_,value) {
        var offset = this.lookup[h_][w_];
        this.data[offset + 3] = value >> 24 & 255;
        this.data[offset] = value >> 16 & 255;
        this.data[offset + 1] = value >> 8 & 255;
        this.data[offset + 2] = value & 255;
    }
    ,setPixel: function(w_,h_,value) {
        var offset = this.lookup[h_][w_];
        this.data[offset] = value >> 16 & 255;
        this.data[offset + 1] = value >> 8 & 255;
        this.data[offset + 2] = value & 255;
    }
    ,getPixel: function(w_,h_) {
        var offset = this.lookup[h_][w_];
        return this.data[offset] << 16 | this.data[offset + 1] << 8 | this.data[offset + 2];
    }
};

// ImageLoader

DDLS.ImageLoader = function(imageNames,loaded_) {
    this.images = new DDLS.StringMap();
    this.loaded = loaded_;
    this.count = imageNames.length;
    var _g = 0;
    while(_g < imageNames.length) {
        var name = imageNames[_g];
        ++_g;
        this.load(name);
    }
};

DDLS.ImageLoader.prototype = {
    load: function(img) {
        var image;
        var _this = window.document;
        image = _this.createElement("img");
        var imgStyle = image.style;
        imgStyle.left = "0px";
        imgStyle.top = "0px";
        imgStyle.paddingLeft = "0px";
        imgStyle.paddingTop = "0px";
        image.onload = (function(f,a1,a2) {
            return function(e) {
                return f(a1,a2,e);
            };
        })(DDLS.Bind(this,this.store),image,img.split("/").pop());
        imgStyle.position = "absolute";
        image.src = img;
    }
    ,store: function(image,name,e) {
        this.count--;
        DDLS.Log("store " + name + " " + this.count,{ fileName : "ImageLoader.hx", lineNumber : 67, className : "DDLS.ImageLoader", methodName : "store"});
        this.images.set(name,image);
        if(this.count == 0) this.loaded();
    }
};
