

var view = ( function () {
    
    'use strict';

    var debug = false;
    var isDirect = false;

    var vsize = { x: window.innerWidth, y: window.innerHeight, z:1 };
    var zsize, zoneTexture, zoneTextureXX;

    var content, canvas, renderer, gl, scene, camera, controls, material, cam;

    var cam_top, camera_top, scene_top, factor, camera_top_helper, zoneRender;

    var ambient, light, point;

    var level = 0;
    var zone, zoneFull;

    var extra = [];
    var collisions = [];

    var collid = null;

    var meshs = [];

    var bg, mask;

    var mat_deep, mat_solid;

    var gputmp;

    var ar8 = typeof Uint8Array !== "undefined" ? Uint8Array : Array;

    view = {

        init: function () {

            bg = new THREE.Color( 0x333333 );
            mask = new THREE.Color( 0xFF0000 );

            vsize.z = vsize.x / vsize.y;

            //debug = debug || false;

            content = document.createElement('div');
            content.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; border:none;';
            document.body.appendChild( content );

            canvas = document.createElement('canvas');
            canvas.style.cssText = 'position:absolute; top:0px; left:0px;';
            content.appendChild( canvas );

            renderer = new THREE.WebGLRenderer({ canvas:canvas, precision: "mediump", antialias: false,  premultipliedAlpha:false });
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( vsize.x, vsize.y );
            renderer.setClearColor( 0x333333, 1 );
            //renderer.autoClear = false;

            gl = renderer.getContext();

            scene = new THREE.Scene();
            scene_top = new THREE.Scene();

            collid = new THREE.Group();
            scene.add ( collid );

            //

            gputmp = new view.GpuSide();

            //

            this.initCameraTop();
            this.initCamera();

            this.initLight();

            this.initMaterial();

            //

            window.addEventListener( 'resize', view.resize, false );

            this.render();

        },

        initCameraTop: function () {

            //var a = new Float32Array( 16 * 16 * 4 );
            //zoneTextureXX = new THREE.DataTexture( a, 16, 16, THREE.RGBAFormat, THREE.FloatType );
            //zoneTextureXX.needsUpdate = true;

            //var pixels = zoneTextureXX.image.data;

            //console.log(pixels)

            zoneRender = new THREE.WebGLRenderTarget( 16, 16, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.UNSIGNED_BYTE } );

            //zoneTexture = new THREE.WebGLRenderTarget( 64, 64, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.UNSIGNED_BYTE } );

            //zsize = { x: Math.floor( 64 * 0.5 ) - 8 , y: Math.floor( 64 * 0.5 ) - 8, z:16 };

            zone = new ar8( 16 * 16 * 4 );

            //if(debug) zoneFull = new ar8( 64 * 64 * 4 ); 

            cam_top = new THREE.Group();

            //factor = 0.005;//1 / 200;
            //camera_top = new THREE.OrthographicCamera( -vsize.x * factor , vsize.x * factor , vsize.y * factor , -vsize.y * factor , 0.1, 400 );
            var w = 0.5;//6;// 500*this.miniSize.f;
            camera_top = new THREE.OrthographicCamera( -w , w , w , -w , 1, 5 );
            camera_top.position.set( 0, 3, 0 );
            camera_top.lookAt( new THREE.Vector3() );

            camera_top_helper = new THREE.CameraHelper( camera_top );

            cam_top.add( camera_top );
            ///scene_top.add( cam_top );
            scene.add( cam_top );
            scene.add( camera_top_helper );

        },

        initCamera: function () {

            cam = new THREE.Group();

            camera = new THREE.PerspectiveCamera( 45, vsize.z, 0.1, 1000 );
            camera.position.set( 0, 1, 4 );

            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.target.set(0,1,0);
            controls.enableKeys = false;
            controls.update();

            cam.add( camera );
            scene.add( cam );

        },

        initLight: function () {

            ambient = new THREE.AmbientLight( 0x282824 );

            light = new THREE.DirectionalLight( 0xffffff, 1 );
            light.position.set(2,10,6).multiplyScalar( 10 );
            light.lookAt(new THREE.Vector3(0,0,0));


            point = new THREE.PointLight( 0x7EC0EE, 1, 200);
            point.position.set( -2,-10,-6 ).multiplyScalar( 10 );

            scene.add( ambient );
            scene.add( light );
            scene.add( point );

        },

        initMaterial: function () {

            material = new THREE.MeshLambertMaterial({ color:0xDDDDDD });

            mat_deep = new THREE.ShaderMaterial({
                uniforms:{ decal: { type: 'f', value: 0 }, deep: { type: 'f', value: 10 },  rgb: { type: 'f', value: 0.003921 } },
                vertexShader:[ 'uniform float deep;', 'uniform float decal;', 'uniform float rgb;', 'varying vec3 c;', 'void main() {', 'float d = ( position.y + decal ) * deep * rgb;', 'c = vec3( d, d, d );', 'if( position.y < 0.0 ) c = vec3( 0., 0., -d );', 'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);', '}'].join("\n"),
                fragmentShader:[ 'varying vec3 c;', 'void main() { gl_FragColor = vec4( c, 1.0 ); }' ].join("\n"),
            });

            mat_solid = new THREE.ShaderMaterial({
                uniforms:{},
                vertexShader:[ 'void main() {', 'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);', '}'].join("\n"),
                fragmentShader:[ 'void main() { gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 ); }' ].join("\n"),
            });

        },

        addUpdate: function ( fun ) {

            extra.push( fun );

        },

        add: function ( m, o ) {

            o = o || {};

            var p = o.pos || [0,0,0];
            var s = o.scale || 1;

            m.material = material;

            m.userData['mat'] = o.material || material;
            m.userData['type'] = o.type || 0;

            if( s !== 1 ) m.scale.multiplyScalar( s );
            m.position.fromArray( p );

            if( m.userData.type === 1 ) collid.add( m );
            else scene.add( m );
            meshs.push( m );

        },

        addCollision: function ( m, s, p ) {

            p = p || {};
            s = s || 1;

            m.material = mat_deep;
            if( s !== 1 ) m.scale.multiplyScalar( s );
            m.position.set( p.x || 0, p.y || 0 , p.z || 0 );
            scene_top.add( m );

            //m.frustumCulled = false;

            m.visible = collisions.length === level ? true : false;

            //var box = m.geometry.boundingBox;
            //console.log( box.min.y, box.max.y );

            //tell ( p.y )

            collisions.push( m );

        },

        setLevel: function ( n ) {

            if( n === level ) return;
            if( !collisions[n] ) return;

            var i = collisions.length;
            while (i--) collisions[i].visible = n === i ? true : false;

            level = n;

            //map.render();

        },

        //

        resize: function () {

            vsize.x = window.innerWidth;
            vsize.y = window.innerHeight;
            vsize.z = vsize.x / vsize.y;

            camera.aspect = vsize.z;
            camera.updateProjectionMatrix();

        },

        rotateTopCamera: function ( r ) {
            cam_top.rotation.y = r;
        },

        testPosition: function ( v, r ) {

            cam_top.position.copy( v );
            //cam_top.rotation.y = r;

            view.renderTop();

        },

        materialSwitch: function ( up ) {

            up = up || false;
            var i = meshs.length, m, t;

            while(i--){

                m = meshs[i];
                t = m.userData.type;

                if( up ){

                    camera_top_helper.visible = false;

                    if( t === 0 ) m.visible = false;
                    //else if( t === 1 ) m.material = mat_deep;
                    else if( t === 2 ) m.material = mat_solid;

                } else {

                    camera_top_helper.visible = true;

                    if( t === 0 ) m.visible = true;
                    else if( t === 2 ) m.material =  m.userData.mat;

                }

            }

        },

        renderTop: function () {

            view.materialSwitch( true );

            renderer.setSize( 16, 16 );
            renderer.setClearColor( mask );

            renderer.render( scene, camera_top, zoneRender, true );
            renderer.readRenderTargetPixels( zoneRender, 0, 0, 16, 16, zone );
            map.testHit( zone );
            //gputmp.renderTexture( zoneRender.texture, zoneTextureXX, 16, 16 );


        },

        renderTop__: function () {

            renderer.setSize( 16, 16 );
            renderer.setClearColor( mask );

            renderer.render( scene, camera_top, zoneRender, true );
            gputmp.renderTexture( zoneRender.texture, zoneTextureXX, 16, 16 );


        },

        renderTop_old: function () {

            //renderer.clear();



            view.materialSwitch( true );

            renderer.setSize( 64, 64 );
            renderer.setClearColor( mask );
            //renderer.render( scene_top, camera_top );
            if( isDirect ) renderer.render( scene, camera_top );
            else renderer.render( scene, camera_top, zoneTexture, true );

            if( debug ){ 
                if( isDirect ) gl.readPixels( 0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, zoneFull );
                else renderer.readRenderTargetPixels( zoneTexture, 0, 0, 64, 64, zoneFull );
                map.draw( zoneFull );
            }

            if( isDirect ) gl.readPixels( zsize.x, zsize.y, zsize.z, zsize.z, gl.RGBA, gl.UNSIGNED_BYTE, zone );
            else renderer.readRenderTargetPixels( zoneTexture, zsize.x, zsize.y, zsize.z, zsize.z, zone );
            map.testHit( zone );

        },

        render: function () {

            requestAnimationFrame( view.render );
        
            var i = extra.length;
            while(i--) extra[i]();

            //view.renderTop();

            view.materialSwitch( false );

            renderer.setSize( vsize.x, vsize.y );
            renderer.setClearColor( bg );

            renderer.render( scene, camera );
            
        },

        

        moveCamera: function( v ){

            cam.position.copy( v );

        },


        // GET ---------------------

        getAzimut: function () { return controls.getAzimuthalAngle(); },

        getGround: function () { return collid; },

        getRenderer: function () { return renderer; },

        // SET ---------------------

        setDeep : function( v ){ mat_deep.uniforms.deep.value = v; },
        setDecal : function( v ){ mat_deep.uniforms.decal.value = v; },



    }

    // ------------------------------
    //   GPU RENDER
    // ------------------------------

    view.GpuSide = function(){

        this.renderer = view.getRenderer();
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.camera.position.z = 1;

        this.baseMat = new THREE.MeshBasicMaterial({ color:0x00FFFF });
        this.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ) , this.baseMat );
        
        this.scene.add( this.mesh );

        this.passThruUniforms = { texture: { value: null }, resolution: { value: new THREE.Vector2(128,128) } };
        this.passThruShader = new THREE.ShaderMaterial( {
            uniforms: this.passThruUniforms,
            vertexShader: ['void main() {', 'gl_Position = vec4( position, 1.0 );', '}'].join('\n'),
            fragmentShader: ['uniform sampler2D texture;', 'uniform vec2 resolution;', 'void main() {', 'vec2 uv = gl_FragCoord.xy/ resolution.xy;', 'gl_FragColor = texture2D( texture, uv );', '}'].join('\n')
            //fragmentShader: ['uniform sampler2D texture;', 'void main() {', 'vec2 uv = gl_FragCoord.xy / resolution.xy;', 'gl_FragColor = texture2D( texture, uv );', '}'].join('\n')
        }); 

    };

    view.GpuSide.prototype = {

        render : function ( mat, output ) {

            this.mesh.material = mat;
            this.renderer.render( this.scene, this.camera, output, false );
            //this.mesh.material = this.passThruShader;

        },

        renderTexture : function ( input, output, w, h ) {

            this.passThruUniforms.resolution.value.x = w;
            this.passThruUniforms.resolution.value.y = h;
            this.passThruUniforms.texture.value = input;

            this.render( this.passThruShader, output );
            //this.passThruUniforms.texture.value = null;

        }
    }

    return view;

})();