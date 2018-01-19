
/**
 * @author lth / https://github.com/lo-th
 *
 * Creates a dynamics tube which extrudes along a 3d spline.
 *
 */

THREE.Tubular = function ( pp, tubularSegments, radius, radialSegments, closed, CurveType, GeoType ) {

    THREE.BufferGeometry.call( this );

    this.type = 'Tubular';
    this.debug = false;

    this.PI90  = 1.570796326794896;

    this.tubularSegments = tubularSegments || 64;
    this.radius = radius || 1;
    this.radialSegments = radialSegments || 8;
    this.closed = closed || false;
    this.scalar = 1;
    this.geoType = GeoType || 'tube';

    if( pp instanceof Array ) this.positions = pp;
    else {

        this.positions = [];

        var start = new THREE.Vector3().fromArray(pp.start);
        var end = new THREE.Vector3().fromArray(pp.end);
        var mid = end.clone().sub(start);
        var lng = pp.numSegment-1;

        this.positions.push( start );

        for( var i = 1; i < lng; i++ ){

            this.positions.push( new THREE.Vector3( (mid.x/lng)*i, (mid.y/lng)*i, (mid.z/lng)*i).add(start) );

        }

        this.positions.push( end );

    }

    this.path = new THREE.CatmullRomCurve3( this.positions );
    // 'catmullrom', 'centripetal', 'chordal'
    var curveType = CurveType || 'catmullrom'; 
    this.path.type = curveType;
    this.path.closed = this.closed;

    this.frames = this.path.computeFrenetFrames( this.tubularSegments, this.closed );

    // helper variables

    this.vertex = new THREE.Vector3();
    this.normal = new THREE.Vector3();
    this.uv = new THREE.Vector2();

    // buffer

    this.vertices = [];
    this.colors = [];
    this.normals = [];
    this.uvs = [];
    this.indices = [];

    // create buffer data

    this.generateBufferData();

    // build geometry

    this.setIndex( new ( this.indices.length > 65535 ? THREE.Uint32BufferAttribute : THREE.Uint16BufferAttribute )( this.indices, 1 ) );
    this.addAttribute( 'position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );
    this.addAttribute( 'color', new THREE.Float32BufferAttribute( this.colors, 3 ) );
    this.addAttribute( 'normal', new THREE.Float32BufferAttribute( this.normals, 3 ) );
    this.addAttribute( 'uv', new THREE.Float32BufferAttribute( this.uvs, 2 ) );

}

THREE.Tubular.prototype = Object.assign( Object.create( THREE.BufferGeometry.prototype ), {

    constructor: THREE.Tubular,

    //THREE.Tubex.prototype = Object.create( THREE.BufferGeometry.prototype );
    //T//HREE.Tubex.prototype.constructor = THREE.Tubex;

    addDebug: function ( parent ) {
        
        this.path.g = new THREE.Geometry();
        for ( var i = 0; i < this.tubularSegments+1; i ++ ) {
            this.path.g.vertices.push( new THREE.Vector3() );
        }

        this.path.mesh = new THREE.Line( this.path.g, new THREE.LineBasicMaterial( { color: 0x00FF00, linewidth: 1 , depthTest: false, depthWrite: false } ) );
        parent.add( this.path.mesh );

        this.debug = true;

    },

    copyPosition: function(pos){



    },

    setTension: function ( v ) {

        this.path.tension = v;

    },

    generateBufferData: function () {

        for ( var i = 0; i < this.tubularSegments; i ++ ) {

            this.generateSegment( i );

        }

        // if the geometry is not closed, generate the last row of vertices and normals
        // at the regular position on the given path
        //
        // if the geometry is closed, duplicate the first row of vertices and normals (uvs will differ)

        this.generateSegment( ( this.closed === false ) ? this.tubularSegments : 0 );

        // uvs are generated in a separate function.
        // this makes it easy compute correct values for closed geometries

        this.generateIndicesAndUv();

        // finally create faces

        //this.generateIndices();

    },

    generateSegment: function ( i ) {

        var lng = this.radialSegments;
        var point = i / this.tubularSegments;
        //if(lng===2) lng = 1;

        var scale = this.scalar;
        if( this.geoType === 'sphere' ) scale = Math.sqrt(Math.pow(0.5,2) - Math.pow(point-0.5,2)) * 2;

        // we use getPointAt to sample evenly distributed points from the given path

        var P = this.path.getPointAt( point );

        if( this.debug ) this.path.g.vertices[i].copy( P );

        // retrieve corresponding normal and binormal

        var N = this.frames.normals[ i ];
        var B = this.frames.binormals[ i ];

        // generate normals and vertices for the current segment

        for ( var j = 0; j <= lng; j ++ ) {

            var v = j / lng * Math.PI * 2;
            if(lng===1) v = Math.PI*j - this.PI90

            var sin =   Math.sin( v );
            var cos = - Math.cos( v );

            // normal

            this.normal.x = ( cos * N.x + sin * B.x );
            this.normal.y = ( cos * N.y + sin * B.y );
            this.normal.z = ( cos * N.z + sin * B.z );
            this.normal.normalize();

            this.normals.push( this.normal.x, this.normal.y, this.normal.z );

            // vertex

            this.vertex.x = P.x + this.radius * this.normal.x * scale;
            this.vertex.y = P.y + this.radius * this.normal.y * scale;
            this.vertex.z = P.z + this.radius * this.normal.z * scale;

            this.vertices.push( this.vertex.x, this.vertex.y, this.vertex.z );

            // colors

            this.colors.push( 1, 1, 1 );

        }

    },

    generateIndicesAndUv: function (  ) {

        var lng = this.radialSegments;
        //if(lng===2) lng = 1;

        for ( var i = 0; i <= this.tubularSegments; i ++ ) {

            for ( var j = 0; j <= lng; j ++ ) {

                if( j > 0 && i > 0 ) {

                    var a = ( lng + 1 ) * ( i - 1 ) + ( j - 1 );
                    var b = ( lng + 1 ) * i + ( j - 1 );
                    var c = ( lng + 1 ) * i + j;
                    var d = ( lng + 1 ) * ( i - 1 ) + j;

                    // faces

                    this.indices.push( a, b, d );
                    this.indices.push( b, c, d );
                }

                // uv

                this.uv.x = i / this.tubularSegments;
                this.uv.y = j / lng;

                this.uvs.push( this.uv.x, this.uv.y );

            }

        }

    },

    updatePath: function ( p, path ) {

    	/*if(p){ 
    		var l = p.length
    		for( var i=0; i< l; i++){
    			this.positions[i].copy(p[i]);
    		}
    		
    	}*/

        //this.pathAr = []

        //this.path = path;

        this.frames = this.path.computeFrenetFrames( this.tubularSegments, this.closed );

        this.normals = this.attributes.normal.array;
        this.vertices = this.attributes.position.array;
        this.colors = this.attributes.color.array;
        

        for ( var i = 0; i < this.tubularSegments; i ++ ) {

            this.updateSegment( i );

        }

        // if the geometry is not closed, generate the last row of vertices and normals
        // at the regular position on the given path
        //
        // if the geometry is closed, duplicate the first row of vertices and normals (uvs will differ)

        this.updateSegment( ( this.closed === false ) ? this.tubularSegments : 0 );

        


        this.attributes.color.needsUpdate = true;
        this.attributes.position.needsUpdate = true;
        this.attributes.normal.needsUpdate = true;

        //this.computeBoundingSphere();
       

    },

    updateUV: function () {

        var lng = this.radialSegments;
        //if(lng===2) lng = 1;

        this.uvs = this.attributes.uv.array;

        var n, n2;

        for ( var i = 0; i <= this.tubularSegments; i ++ ) {

            n = (i*2) * (lng+1);

            for ( var j = 0; j <= lng; j ++ ) {

                n2 = j * 2;

                this.uv.x = i / this.tubularSegments;
                this.uv.y = j / lng;

                this.uvs[n + n2] = this.uv.x
                this.uvs[n + n2 + 1] = this.uv.y;

            }

        }

         this.attributes.uv.needsUpdate = true;

    },

    updateSegment: function ( i ) {

        var lng = this.radialSegments;
        var point = i / this.tubularSegments;
        //if(lng===2) lng = 1;

        // we use getPointAt to sample evenly distributed points from the given path

        var scale = this.scalar;
        if( this.geoType === 'sphere' ) scale = Math.sqrt(Math.pow(0.5,2) - Math.pow(point-0.5,2)) * 2;

        var n = (i*3) * (lng+1), n2;

        var P = this.path.getPointAt( point );

        // retrieve corresponding normal and binormal

        var N = this.frames.normals[ i ];
        var B = this.frames.binormals[ i ];

        // generate normals and vertices for the current segment

        for ( var j = 0; j <= lng; j ++ ) {

            var v = j / lng * Math.PI * 2;

            if( lng===1 ) v = Math.PI*j - this.PI90;

            n2 = j * 3;

            var sin =   Math.sin( v );
            var cos = - Math.cos( v );

            // normal

            this.normal.x = ( cos * N.x + sin * B.x );
            this.normal.y = ( cos * N.y + sin * B.y );
            this.normal.z = ( cos * N.z + sin * B.z );
            this.normal.normalize();

            this.normals[n + n2] =  this.normal.x;
            this.normals[n + n2 +1] =  this.normal.y;
            this.normals[n + n2 +2] =  this.normal.z;

            // vertex

            this.vertices[n + n2] =  P.x + this.radius * this.normal.x * scale;
            this.vertices[n + n2 +1] =  P.y + this.radius * this.normal.y * scale;
            this.vertices[n + n2 +2] =  P.z + this.radius * this.normal.z * scale;

            // color

            this.colors[n + n2] = Math.abs(this.normal.x);
            this.colors[n + n2 +1] = Math.abs(this.normal.y);
            this.colors[n + n2 +2] = Math.abs(this.normal.z);

            //this.pathAr.push( [ P.x, P.y, P.z] )

        }

    }

});



THREE.Curve.prototype.clamp = function ( value, min, max ) {

    return Math.max( min, Math.min( max, value ) );

};

THREE.Curve.prototype.computeFrenetFrames = function ( segments, closed ) {

    // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf

    var normal = new THREE.Vector3();

    var tangents = [];
    var normals = [];
    var binormals = [];

    var vec = new THREE.Vector3();
    var mat = new THREE.Matrix4();

    var i, u, theta;

    // compute the tangent vectors for each segment on the curve

    for ( i = 0; i <= segments; i ++ ) {

        u = i / segments;

        tangents[ i ] = this.getTangentAt( u );
        tangents[ i ].normalize();

    }

    // select an initial normal vector perpendicular to the first tangent vector,
    // and in the direction of the minimum tangent xyz component

    normals[ 0 ] = new THREE.Vector3();
    binormals[ 0 ] = new THREE.Vector3();
    var min = Number.MAX_VALUE;
    var tx = Math.abs( tangents[ 0 ].x );
    var ty = Math.abs( tangents[ 0 ].y );
    var tz = Math.abs( tangents[ 0 ].z );

    //if ( tx <= min ) {

        min = tx;
        normal.set( 1, 0, 0 );

    /*}

    if ( ty <= min ) {

        min = ty;
        normal.set( 0, 1, 0 );

    }

    if ( tz <= min ) {

        normal.set( 0, 0, 1 );

    }*/

    vec.crossVectors( tangents[ 0 ], normal ).normalize();

    normals[ 0 ].crossVectors( tangents[ 0 ], vec );
    binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] );


    // compute the slowly-varying normal and binormal vectors for each segment on the curve

    for ( i = 1; i <= segments; i ++ ) {

        normals[ i ] = normals[ i - 1 ].clone();

        binormals[ i ] = binormals[ i - 1 ].clone();

        vec.crossVectors( tangents[ i - 1 ], tangents[ i ] );

        if ( vec.length() > Number.EPSILON ) {

            vec.normalize();

            theta = Math.acos( this.clamp( tangents[ i - 1 ].dot( tangents[ i ] ), - 1, 1 ) ); // clamp for floating pt errors

            normals[ i ].applyMatrix4( mat.makeRotationAxis( vec, theta ) );

        }

        binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

    }

    // if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

    if ( closed === true ) {

        theta = Math.acos( this.clamp( normals[ 0 ].dot( normals[ segments ] ), - 1, 1 ) );
        theta /= segments;

        if ( tangents[ 0 ].dot( vec.crossVectors( normals[ 0 ], normals[ segments ] ) ) > 0 ) {

            theta = - theta;

        }

        for ( i = 1; i <= segments; i ++ ) {

            // twist a little...
            normals[ i ].applyMatrix4( mat.makeRotationAxis( tangents[ i ], theta * i ) );
            binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

        }

    }

    return {
        tangents: tangents,
        normals: normals,
        binormals: binormals
    };

}