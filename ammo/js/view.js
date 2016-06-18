

var view = ( function () {

    'use strict';

    var degtorad = 0.0174532925199432957;
    var radtodeg = 57.295779513082320876;

    var container, renderer, scene, camera, vsize, controls, light;

    var geo;

    var meshBodys = [];
    var statics = [];

    var extraUpdate = [];

    var WIDTH = 512;

    view = {

        render : function () {

            requestAnimationFrame( view.render );
            var i = extraUpdate.length
            while(i--){
                extraUpdate[i]();
            }
            renderer.render( scene, camera );

        },

        resize : function () {

            vsize.x = window.innerWidth;
            vsize.y = window.innerHeight;
            vsize.z = vsize.x / vsize.y;
            camera.aspect = vsize.z;
            camera.updateProjectionMatrix();
            renderer.setSize( vsize.x, vsize.y );

        },

        init : function () {

            container = document.createElement( 'div' );
            document.body.appendChild( container );

            vsize = new THREE.Vector3( window.innerWidth, window.innerHeight, 0);
            vsize.z = vsize.x / vsize.y;

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( vsize.x, vsize.y );
            renderer.setClearColor( 0x000000 );

            container.appendChild( renderer.domElement );

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( 45, vsize.z, 0.1, 1000 );
            camera.position.set(0,50,100);

            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.target.set(0,1,0);
            controls.enableKeys = false;
            controls.update();

            light = new THREE.DirectionalLight( 0xFFFFEE, 1.2 );
            light.position.set(50,400,200);
            light.lookAt(new THREE.Vector3(0,0,0));
            scene.add( light );

            window.addEventListener( 'resize', view.resize, false );

            this.initGeometry();

            this.render();
            
        },

        initGeometry : function(){

            geo = {};

            geo['box'] =  new THREE.BoxBufferGeometry(1,1,1);
            geo['sphere'] = new THREE.SphereBufferGeometry( 1, 12, 10 );
            geo['cylinder'] =  new THREE.CylinderBufferGeometry(1,1,1, 6, 1 );

        },

        add : function ( mesh ) {

            scene.add( mesh );

        },

        addUpdate : function ( fun ) {

            extraUpdate.push( fun );

        },

        addMesh : function ( o ) {

            //var isCustomGeometry = false;

            o.mass = o.mass == undefined ? 0 : o.mass;
            o.type = o.type == undefined ? 'box' : o.type;

            // position
            o.pos = o.pos == undefined ? [0,0,0] : o.pos;

            var pos = [o.pos[0], o.pos[1], o.pos[2]];
            o.pos = [o.pos[0], o.pos[1], o.pos[2]];

            // size
            o.size = o.size == undefined ? [1,1,1] : o.size;
            if(o.size.length == 1){ o.size[1] = o.size[0]; }
            if(o.size.length == 2){ o.size[2] = o.size[0]; }

            var size = o.size;
            o.size = [o.size[0], o.size[1], o.size[2]];

            if(o.radius) o.radius = [o.radius[0], o.radius[1], o.radius[2]];
            if(o.center) o.center = [o.center[0], o.center[1], o.center[2]];

            if(o.geoSize){
                if(o.geoSize.length == 1){ o.geoSize[1] = o.geoSize[0]; }
                if(o.geoSize.length == 2){ o.geoSize[2] = o.geoSize[0]; }
            }

            // rotation is in degree
            o.rot = o.rot == undefined ? [0,0,0] : this.toRad(o.rot);
            o.quat = new THREE.Quaternion().setFromEuler( new THREE.Euler().fromArray( o.rot ) ).toArray();

            if(o.rotA) o.quatA = new THREE.Quaternion().setFromEuler( new THREE.Euler().fromArray( this.toRad( o.rotA ) ) ).toArray();
            if(o.rotB) o.quatB = new THREE.Quaternion().setFromEuler( new THREE.Euler().fromArray( this.toRad( o.rotB ) ) ).toArray();

            if(o.angUpper) o.angUpper = this.toRad( o.angUpper );
            if(o.angLower) o.angLower = this.toRad( o.angLower );

     

            if(o.type == 'plane' || o.direct !== undefined ){

                // send physic no need mesh
                physic.add( o ); 
                return;

            }

            var material = new THREE.MeshPhongMaterial();

            var mesh = new THREE.Mesh( o.geometry || geo[o.type], material );

            mesh.scale.fromArray( size );

            /*
            mesh.position.fromArray( pos );
            mesh.quaternion.fromArray( o.quat );
            */

            var tmp_pos = new THREE.Vector3().fromArray( pos );
            var tmp_scl = new THREE.Vector3().fromArray( size )
            var tmp_quat = new THREE.Quaternion().fromArray( o.quat );

            mesh.matrix.compose( tmp_pos, tmp_quat, tmp_scl );
            mesh.matrixAutoUpdate = false;



            

           // mesh.name = o.name;

            

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

        getMeshBody : function () {

            return meshBodys;

        },

        // MATH

        lerp : function (a, b, percent) { return a + (b - a) * percent; },
        randRange : function (min, max) { return view.lerp( min, max, Math.random()); },
        randRangeInt : function (min, max, n) { return view.lerp( min, max, Math.random()).toFixed(n || 0)*1; },

    }

    return view;

})();



