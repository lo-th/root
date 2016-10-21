var scene = ( function () {
    
    'use strict';

    var isPause = false;
    var isCSS = false;

    var content, canvas, content_css;
    var vsize = { x: window.innerWidth, y: window.innerHeight, z:1 };
    var renderer = null, scene3d, camera, controls, light;
    var renderer_css = null, scene3d_css, camera_css;

    var extra = [];

    var env;

    scene = {

        init: function () {

            content = document.createElement('div');
            content.setAttribute( 'class', 'content' );
            document.body.appendChild( content );

            canvas = document.createElement('canvas');
            canvas.setAttribute( 'class', 'canvas3d' );
            content.appendChild( canvas );

            content_css = document.createElement('div');
            content_css.setAttribute( 'class', 'cssContent' );
            content.appendChild( content_css );

            this.init3DView();
            //this.initCSS3DView();

            //this.initInterface();

            window.addEventListener( 'resize', scene.resize, false );

            this.render();


        },

        preload: function ( ) {

            var res = [
                'assets/textures/env.png', 'assets/textures/earth_metal.png', 'assets/textures/earth_rough.png', 'assets/textures/earth_n.png',
                'assets/models/icons.sea', 'assets/textures/icon.png', 'assets/textures/plane.png', 'assets/textures/base.png',
            ];

            pool.load( res, scene.endLoad );

        },

        endLoad: function ( p ) {

            env = new THREE.Texture( p.env );
            env.mapping = THREE.SphericalReflectionMapping;
            env.needsUpdate = true;

            world.init();
            menu.init();

            //world.add();
            menu.add();

        },

        goToMenu: function ( e ){

            world.clear();
            menu.add();

        },

        goToWorld: function ( e ){

            menu.clear();
            world.add();

        },

        getEnv: function () {

            return env;

        },

        addUpdate: function ( fun ) {

            extra.push( fun );

        },

        clearUpdate: function () {

            extra = [];

        },


        add: function ( o ) {
            
            scene3d.add( o );

        },

        remove: function ( o ) {
            
            scene3d.remove( o );

        },

        render: function () {

            if(!isPause) requestAnimationFrame( scene.render );

            var i = extra.length;
            while(i--) extra[i]();

            //light.rotation.y = controls.getAzimuthalAngle();

            //if(centerin) centerin.rotation.y -= 0.005;

            renderer.render( scene3d, camera );
            if( isCSS ) renderer_css.render( scene3d_css, camera_css );

        },

        resize: function () {

            vsize.x = window.innerWidth;
            vsize.y = window.innerHeight;
            vsize.z = vsize.x / vsize.y;

            if( renderer ){

                renderer.setSize( vsize.x, vsize.y );
                camera.aspect = vsize.z;
                camera.updateProjectionMatrix();

            }

            if( renderer_css ){

                renderer_css.setSize( vsize.x, vsize.y );
                camera_css.aspect = vsize.z;
                camera_css.updateProjectionMatrix();

            }

        },

        // WEBGL

        backImage: function (){

            var c = document.createElement( 'canvas' );
            var res = 1;

            c.width = 512*res;
            c.height = 512*res;

            var ctx = c.getContext( '2d' );
            //ctx.filter = 'blur(1px)';

            var dgrad = new DitheredRadialGradient( 256*res, 1024*res, 512*res, 256*res, 1024*res, 1024*res );     
            dgrad.addColorStop(0.1,255, 255, 255);
           // dgrad.addColorStop(0.6,228,228,228);
            dgrad.addColorStop(1,200,200,200);
            dgrad.fillRect( ctx, 0, 0, 512*res, 512*res );

            var tx = new THREE.Texture( c );
            tx.anisotropy = 16;
            tx.format = THREE.RGBFormat;
            tx.needsUpdate = true;

            return tx;
        },

        init3DView: function () {

            vsize.z = vsize.x / vsize.y;

            renderer = new THREE.WebGLRenderer( { canvas:canvas, antialias:true, alpha:false } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( vsize.x, vsize.y );
            renderer.setClearColor( 0xdcdcdc, 1 );

            renderer.gammaInput = true;
            renderer.gammaOutput = true;

            /*renderer.toneMapping = THREE.Uncharted2ToneMapping;
            renderer.toneMappingExposure = 3.0;
            renderer.toneMappingWhitePoint = 5.0;*/

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            scene3d = new THREE.Scene();
            scene3d.background = scene.backImage();

            camera = new THREE.PerspectiveCamera( 40, vsize.z, 0.1, 1000 );

            //controls = new THREE.OrbitControls( camera, canvas );
            //controls.update();

            camera.position.z = 2;
            camera.lookAt( new THREE.Vector3());

            this.initLight();
            this.preload();

        },

        initLight: function () {

            var ambient = new THREE.AmbientLight( 0x333333 );

            var light1 = new THREE.SpotLight(0xffffFF, 0.3, 4, Math.PI / 3, 0, 1);
            light1.position.set(0,3,2);
            light1.lookAt( new THREE.Vector3(0,-1,0));

            light1.castShadow = true;

                light1.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 1, 4 ) );

                light1.shadow.bias = 0.0001;

                light1.shadow.mapSize.width = 1024;
                light1.shadow.mapSize.height = 1024;

            var light2 = new THREE.SpotLight(0xC0C0C0, 0.6, 8, Math.PI / 3, 0, 2);
            light2.position.set(-2,-1,-3);
            light2.lookAt( new THREE.Vector3(0,-1,0));

            var light3 = new THREE.SpotLight(0xC0C0C0, 0.6, 8, Math.PI / 3, 0, 2);
            light3.position.set(2,-1,-3);
            light3.lookAt( new THREE.Vector3(0,-1,0));

            //new THREE.DirectionalLight( 0xffffff, 1 );//

            

            var hemiLight = new THREE.HemisphereLight( 0xC0C0C0, 0xffFFFF, 1 );
                //hemiLight.color.setHSL( 0.6, 1, 0.6 );
               // hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
                hemiLight.position.set( 0, -1, 0 );

            scene.add(ambient);
          //  scene.add(light1);
            scene.add( hemiLight );
            scene.add(light1);
            scene.add(light2);
            scene.add(light3);

        },

        // CSS

        initCSS3DView: function () {

            renderer_css = new THREE.CSS3DRenderer( content_css );
            renderer_css.setSize( vsize.x, vsize.y );

            scene3d_css = new THREE.Scene();
            camera_css = new THREE.PerspectiveCamera( 45, vsize.z, 0.1, 1000 );

        }

    }

    return scene;

})();