var indexScreen = ( function () {
    
    'use strict';

    // F11 to fullSceen

    var content, canvas, content_css, b1, b2;
    var isPause = false;
    var isCSS = false;
    var big = null;
    var bigScreen = null;

    var center,centerin,  mouseDown = false;
    var or = {x:0, y:0};
    var dr = {x:0, y:0};

    var torad = 0.0174532925199432957;

    // 3D

    var vsize = { x: window.innerWidth, y: window.innerHeight, z:1 };
    var renderer = null, scene, camera, controls, light;
    var renderer_css = null, scene_css, camera_css;

    //

    indexScreen = {

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

           /* b1 = document.createElement('div');
            b1.setAttribute( 'class', 'button' );
            content.appendChild( b1 );
            b1.innerHTML = 'open main window';
            b1.addEventListener( 'mousedown', indexScreen.openSecondary, false );*/

            this.init3DView();
            //this.initCSS3DView();

            window.addEventListener( 'resize', indexScreen.resize, false );

            this.render();

        },

        openSecondary : function(e) {

            e.preventDefault();
            big = window.open('index_big.html', 'secondary', 'width=800, height=600, fullscreen=1, resizable=1, scrollbars=1, toolbar=0, menubar=0, status=1' );
            
        },

        setBig: function ( v ) {
            
            bigScreen = v;

        },

        add: function ( o ) {
            
            scene.add( o );

        },

        setCenter: function ( o ) {

            controls.enableRotate = false;

            center = new THREE.Group();
            center.position.y = -1;
            center.add(o);
            scene.add(center);

            center.rotation.z = -21.4 * torad;

            centerin = o;

            document.addEventListener( 'mouseup', indexScreen.up, false );
            document.addEventListener( 'mousedown', indexScreen.down, false );
            document.addEventListener( 'mousemove', indexScreen.move, false );

        },

        up:function ( e ) {

            mouseDown = false;


        },

        down:function ( e ) {

            mouseDown = true;
            or.x = e.clientX;
            or.y = e.clientY;

        },


        move:function ( e ) {

            if(!mouseDown) return;

            centerin.rotation.y -= (( or.x - e.clientX )*0.01);
            //center.rotation.x -= (( or.y - e.clientY )*0.01);

            or.x = e.clientX;
            or.y = e.clientY;

        },

        //

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

        render: function () {

            if(!isPause) requestAnimationFrame( indexScreen.render );

            //light.rotation.y = controls.getAzimuthalAngle();

            if(centerin) centerin.rotation.y -= 0.005;

            renderer.render( scene, camera );
            if( isCSS ) renderer_css.render( scene_css, camera_css );

        },

        // WEBGL

        init3DView: function () {

            vsize.z = vsize.x / vsize.y;

            renderer = new THREE.WebGLRenderer( { canvas:canvas, antialias:true, alpha:false } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( vsize.x, vsize.y );
            renderer.setClearColor( 0xdcdcdc, 1 );

            renderer.gammaInput = true;
            renderer.gammaOutput = true;

            renderer.toneMapping = THREE.Uncharted2ToneMapping;
            renderer.toneMappingExposure = 3.0;
            renderer.toneMappingWhitePoint = 5.0;

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( 45, vsize.z, 0.1, 1000 );

            controls = new THREE.OrbitControls( camera, canvas );
            controls.update();

            camera.position.z = 2;
            camera.lookAt( new THREE.Vector3());

            scene.add(new THREE.AmbientLight(0x808080));

            light = new THREE.Group();

            var light1 = new THREE.SpotLight(0xffffff, 2, 20, Math.PI / 3, 0, 2);

            light.add(light1);
            light1.position.set(4,7,4);
            //camera.add(light);
            light1.lookAt( new THREE.Vector3(0,0,0));

            var light2 = new THREE.SpotLight(0xffffff, 1, 16, Math.PI / 3, 0, 2);

            light.add(light2);
            light2.position.set(-4,-7,-4);
            //camera.add(light);
            light2.lookAt( new THREE.Vector3(0,0,0));

            scene.add(camera);
            scene.add(light);

        },

        // CSS

        initCSS3DView: function () {

            renderer_css = new THREE.CSS3DRenderer( content_css );
            renderer_css.setSize( vsize.x, vsize.y );

            scene_css = new THREE.Scene();
            camera_css = new THREE.PerspectiveCamera( 45, vsize.z, 0.1, 1000 );

        }

    }

    return indexScreen;

})();