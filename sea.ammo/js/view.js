var view = ( function () {
    
    'use strict';

    var camera, scene, renderer, controls, light, ambient;

    var mat, mesh1, mesh2, geobox, geosphere, matbox, matboxfreez;

    view = {

        init: function () {

            camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
            camera.position.y = 10;
            camera.position.z = 20;

            camera.lookAt( new THREE.Vector3() );

            scene = new THREE.Scene();

            renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );
            renderer.setClearColor( 0x171717 );

            renderer.gammaInput = true;
            renderer.gammaOutput = true;

            renderer.toneMapping = THREE.Uncharted2ToneMapping;
            renderer.toneMappingExposure = 3.0;
            renderer.toneMappingWhitePoint = 5.0;

            renderer.domElement.style.position = 'absolute';

            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.update();

            ambient = new THREE.AmbientLight( 0x606060 );

            light = new THREE.DirectionalLight( 0xffffff, 1.6 );
            light.position.set(2,10,6).multiplyScalar( 10 );
            light.lookAt( new THREE.Vector3(0,0,0) );

            scene.add(ambient);
            scene.add(light);


            window.addEventListener( 'resize', view.resize, false );

            this.render();

          
            // 

            matbox = new THREE.MeshStandardMaterial( { metalness:0., roughness:0.7, name:'actif' } );
            matboxfreez = new THREE.MeshStandardMaterial( { color:0xFFFF00, metalness:0., roughness:0.7, name:'freeze' } );
            geobox = new THREE.BoxBufferGeometry(1,1,1);
            geosphere = new THREE.SphereBufferGeometry(1,12,12);

        },

        render: function(){

            requestAnimationFrame( view.render );
            THREE.SEA3D.AnimationHandler.update( 0.017 );
            renderer.render( scene, camera );

        },

        resize: function(){

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );

        },

        //

        setActif: function( o, n ) {

            if( n && o.material.name === 'freeze') o.material = matbox;
            if( !n && o.material.name === 'actif' ) o.material = matboxfreez;

        },

        addBox: function( o ) {
            var mo;

            if(o.type === 'box') mo = new THREE.Mesh( geobox, matbox );
            else if(o.type === 'sphere') mo = new THREE.Mesh( geosphere, matbox );

            if(o.size && o.size.length === 1 ) o.size = [o.size[0], o.size[0], o.size[0]];

            if(o.size) mo.scale.fromArray(o.size);
            
            mo.position.set( o.pos[0], o.pos[1], o.pos[2] );

            scene.add( mo );
            return mo;
        },


    }

    return view;

})();