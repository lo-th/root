

var view = ( function () {

    'use strict';

    var degtorad = 0.0174532925199432957;
    var radtodeg = 57.295779513082320876;

    var container, renderer, scene, camera, vsize, controls, light, clock;

    var raycaster, mouse, mouseDown = false;

    var geo;

    var env;

    var meshBodys = [];
    var heroBodys = [];
    var statics = [];

    var extraUpdate = [];

    var WIDTH = 512;

    view = {

        render: function () {

            requestAnimationFrame( view.render );

            //var delta = clock.getDelta();

            //THREE.SEA3D.AnimationHandler.update( delta*0.26 );

            var i = extraUpdate.length
            while(i--){
                extraUpdate[i]();
            }
            renderer.render( scene, camera );

        },

        resize: function () {

            vsize.x = window.innerWidth;
            vsize.y = window.innerHeight;
            vsize.z = vsize.x / vsize.y;
            camera.aspect = vsize.z;
            camera.updateProjectionMatrix();
            renderer.setSize( vsize.x, vsize.y );

        },

        init: function () {

            clock = new THREE.Clock();

            container = document.createElement( 'div' );
            document.body.appendChild( container );

            vsize = new THREE.Vector3( window.innerWidth, window.innerHeight, 0);
            vsize.z = vsize.x / vsize.y;

            renderer = new THREE.WebGLRenderer({ antialias:false });
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( vsize.x, vsize.y );
            renderer.setClearColor( 0x2c2c26, 1 );

            renderer.gammaInput = true;
            renderer.gammaOutput = true;

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap;

            container.appendChild( renderer.domElement );

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( 45, vsize.z, 0.1, 1000 );
            camera.position.set(0,60,100);

            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.target.set(0,1,0);
            controls.enableKeys = false;
            controls.update();

            scene.add( new THREE.AmbientLight( 0x282824 ) );

            var pointLight = new THREE.PointLight( 0xdddd00, 0.2 );
            scene.add( pointLight );

            pointLight.position.set( -5,-10,-6 ).multiplyScalar( 100 );

            light = new THREE.DirectionalLight( 0xffffdd, 1 );
            light.position.set(5,10,6).multiplyScalar( 100 );
            light.lookAt(new THREE.Vector3(0,0,0));

            light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 20, 1, 5, 30 ) );
            light.shadow.bias = 0.0001;

            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;

            light.castShadow = true;

            scene.add( light );

            window.addEventListener( 'resize', view.resize, false );

            //this.initGeometry();

            this.render();
            
        },

        // -----------------------
        //  RAYCAST
        // -----------------------

        getIntersect: function ( obj ) {

            return raycaster.intersectObjects( obj );

        },

        addRay: function(){

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            renderer.domElement.addEventListener( 'mousemove', view.rayMove, false );
            renderer.domElement.addEventListener( 'mousedown', view.rayDown, false );
            renderer.domElement.addEventListener( 'mouseup', view.rayUp, false );

        },

        rayMove: function ( e ) {

            mouse.x = ( e.clientX / vsize.x ) * 2 - 1;
            mouse.y = - ( e.clientY / vsize.y ) * 2 + 1;
            raycaster.setFromCamera( mouse, camera );

        },

        rayDown: function ( e ) {

            e.preventDefault();
            mouseDown = true;

        },

        rayUp: function ( e ) {

            e.preventDefault();
            mouseDown = false;

        },

        // -----------------------
        //  GET FUNCTION
        // -----------------------

        getPixel: function ( texture, x, y ) { 

            var read = new Float32Array( 4 );
            renderer.readRenderTargetPixels( texture, x || 0, y || 0, 1, 1, read ); 
            return read;
            
        },

        getRenderer: function(){ return renderer; },

        getDom: function () { return renderer.domElement; },

        getCamera: function () { return camera; },

        getControls: function () { return controls; },

        // -----------------------
        //  BASIC FUNCTION
        // -----------------------


        add: function ( mesh ) { scene.add( mesh ); },
        remove: function ( mesh ) { scene.remove( mesh ); },

        moveCamera: function( c, t ){
            camera.position.fromArray( c );
            controls.target.fromArray( t );
            controls.update();
        },

        setEnv: function( img ){

            env = new THREE.Texture( img );
            env.mapping = THREE.SphericalReflectionMapping;
            env.needsUpdate = true;

            return env;

        },

        getEnv: function(){

            return env; 

        },

        initGeometry: function(){

            geo = {};

            geo[ 'box' ] =  new THREE.BoxBufferGeometry( 1, 1, 1 );
            geo[ 'sphere' ] = new THREE.SphereBufferGeometry( 1, 12, 10 );
            geo[ 'cylinder' ] =  new THREE.CylinderBufferGeometry( 1, 1, 1, 12, 1 );
            geo[ 'capsule' ] =  new THREE.CapsuleBufferGeometry( 1, 1, 12, 1 );

        },

        

        addUpdate: function ( fun ) {

            extraUpdate.push( fun );

        },

        addBasicGround: function ( x, y ) {

            var g = new THREE.PlaneBufferGeometry( x, y, 1, 1 );
            g.rotateX( -Math.PI / 2 );

            var plane = new THREE.Mesh( g, new THREE.MeshLambertMaterial({ color:0x080807, transparent:false, opacity:1, depthWrite:false }) );
            plane.castShadow = false;
            plane.receiveShadow = true;

            scene.add(plane);

        },

        // hero

        addHero: function ( o ) {

            o = o || {};

            

            // position
            o.pos = o.pos === undefined ? [ 0, 0, 0 ] : o.pos;

            // size
            o.size = o.size === undefined ? [ 1 ] : o.size;
            if(o.size.length === 1){ o.size[1] = o.size[0]; }
            if(o.size.length === 2){ o.size[2] = o.size[0]; }

            // rotation in degree
            o.rot = o.rot === undefined ? [ 0, 0, 0 ] : view.toRad( o.rot );
            o.quat = new THREE.Quaternion().setFromEuler( new THREE.Euler().fromArray( o.rot ) ).toArray();

            //

            geo[ 'capsule' ] =  new THREE.CapsuleBufferGeometry(  o.size[0],  o.size[1], 6, 1 );

            var material = new THREE.MeshLambertMaterial({ color:0xFFFF00, wireframe:true });
            var mm = new THREE.Mesh( o.geometry || geo[ 'capsule' ], material );
            //var mm = new THREE.Mesh( o.geometry || geo[ 'cylinder' ], material );
            //mm.scale.fromArray( o.size );



            var tmp_pos = new THREE.Vector3().fromArray( o.pos );
            var tmp_scl = new THREE.Vector3(1,1,1)//.fromArray( o.size )
            var tmp_quat = new THREE.Quaternion().fromArray( o.quat );


            var hero = player.add( o );
            var mesh = hero.mesh;
            mesh.add( mm );



            mesh.matrix.compose( tmp_pos, tmp_quat, tmp_scl );
            mesh.matrixAutoUpdate = false;

            //scene.add( mesh );
            heroBodys.push( mesh );

            // send physic
            physic.addHero( o );

        },

        getHeroBody: function () {

            return heroBodys;

        },

        // mesh

        addMesh: function ( o ) {

            o = o || {};

            o.mass = o.mass === undefined ? 0 : o.mass;
            o.type = o.type === undefined ? 'box' : o.type;

            // position
            o.pos = o.pos === undefined ? [ 0, 0, 0 ] : o.pos;

            // size
            o.size = o.size === undefined ? [ 1 ] : o.size;
            if( o.size.length === 1 ) o.size[1] = o.size[0];
            if( o.size.length === 2 ) o.size[2] = o.size[0];

            // rotation in degree
            o.rot = o.rot === undefined ? [0,0,0] : view.toRad( o.rot );
            o.quat = new THREE.Quaternion().setFromEuler( new THREE.Euler().fromArray( o.rot ) ).toArray();

            if( o.type === 'plane' || o.direct !== undefined ){

                // send physic no need mesh
                physic.add( o ); 
                return;

            }

            if( o.type === 'mesh' || o.type === 'convex' ){

                o.v = view.readGeometry( o.shape, o.type );
                o.geometry = o.geometry === undefined ? o.shape : o.geometry;

            }

            var material = o.material === undefined ? new THREE.MeshLambertMaterial() : o.material;

            var mesh = new THREE.Mesh( o.geometry || geo[ o.type ], material );

            mesh.scale.fromArray( o.size );

            /*
            mesh.position.fromArray( pos );
            mesh.quaternion.fromArray( o.quat );
            */

            var tmp_pos = new THREE.Vector3().fromArray( o.pos );
            var tmp_scl = new THREE.Vector3().fromArray( o.size )
            var tmp_quat = new THREE.Quaternion().fromArray( o.quat );

            mesh.matrix.compose( tmp_pos, tmp_quat, tmp_scl );
            mesh.matrixAutoUpdate = false;

            // push 
            if( o.mass ){ 
                
                scene.add( mesh );
                meshBodys.push( mesh );
                mesh.receiveShadow = true;
                mesh.castShadow = true;
                
            }

            else statics.push( mesh );

            // send physic
            physic.add( o );

        },

        getMeshBody: function () {

            return meshBodys;

        },

       

        // MATH

        toRad: function ( r ) {

            var i = r.length;
            while(i--) r[i] *= degtorad;
            return r;

        },

        lerp: function ( a, b, percent ) { return a + (b - a) * percent; },
        randRange: function ( min, max ) { return view.lerp( min, max, Math.random()); },
        randRangeInt: function ( min, max, n ) { return view.lerp( min, max, Math.random()).toFixed(n || 0)*1; },

        readGeometry : function ( g, type ) {

            var only_v = type === 'convex' ? true : false;
            var only_f = type === 'mesh' ? true : false;

            var i, j, n, p, n2, tmpGeo;

            if( g instanceof THREE.BufferGeometry )  tmpGeo = new THREE.Geometry().fromBufferGeometry( g );
            else tmpGeo = g.clone();

            tmpGeo.mergeVertices();

            //var totalVertices = g.attributes.position.array.length/3;
            var nVertices = tmpGeo.vertices.length;
            var nFaces = tmpGeo.faces.length;

            g.realVertices = new Float32Array( nVertices * 3 );
            g.realIndices = new ( nFaces * 3 > 65535 ? Uint32Array : Uint16Array )( nFaces * 3 );

            i = nVertices;
            while( i-- ){
                p = tmpGeo.vertices[ i ];
                n = i * 3;
                g.realVertices[ n ] = p.x;
                g.realVertices[ n + 1 ] = p.y;
                g.realVertices[ n + 2 ] = p.z;
            }

            if( only_v ){ 
                tmpGeo.dispose();
                return g.realVertices;
            }

            i = nFaces;
            while(i--){
                p = tmpGeo.faces[ i ];
                n = i * 3;
                g.realIndices[ n ] = p.a;
                g.realIndices[ n + 1 ] = p.b;
                g.realIndices[ n + 2 ] = p.c;
            }

            tmpGeo.dispose();

            if( only_f ){ 
                var faces = [];
                i = g.realIndices.length;
                while(i--){
                    n = i * 3;
                    p = g.realIndices[i]*3;
                    faces[n] = g.realVertices[ p ];
                    faces[n+1] = g.realVertices[ p+1 ];
                    faces[n+2] = g.realVertices[ p+2 ];
                }
                return faces;
            }
        },

    }

    return view;

})();



