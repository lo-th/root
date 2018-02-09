var view = ( function () {

'use strict';

var renderer, scene, camera, controler, transformer, clock, plane, materialShadow, ambient, light, debug, follow;
var grid = null, capturer = null;
var vs = { w:1, h:1, mx:0, my:0 };
var t = { now:0, delta:0, then:0, inter:0, tmp:0, n:0 };
var isCaptureMode = false;
var isCapture = false;
var maxFrame = 0;
var currentFrame = 0;
 var depthMaterial, depthRenderTarget, ssaoPass, effectComposer = null, isEffect = false, pixelRatio=1;

view = {

    framerate: 60,

    pixelRatio : 1,

    isMobile: false,
    isShadow: false,
    isGrid: false,

    videoSize: [1920,1080],
    
    torad: 0.0174532925199432957,

    update: function () {

        var delta = clock.getDelta();
        if( avatar ) avatar.update( delta );
        
    },

    render: function () {

        requestAnimationFrame( view.render );

        t.now = ( typeof performance === 'undefined' ? Date : performance ).now();
        t.delta = t.now - t.then;

        if ( t.delta > t.inter ) {

            t.then = t.now - ( t.delta % t.inter );

            view.update();

            if ( isEffect ) {

                // Render depth into depthRenderTarget
                scene.overrideMaterial = depthMaterial;
                renderer.render( scene, camera, depthRenderTarget, true );

                // Render renderPass and SSAO shaderPass
                scene.overrideMaterial = null;
                effectComposer.render();

            } else {

                renderer.render( scene, camera );

            }

            

            

            if( isCapture ){ 
                capturer.capture( renderer.domElement );
                currentFrame ++;

                if( maxFrame !== 0 && currentFrame === maxFrame+1 ) view.saveCapture();
            }

            if ( t.now - 1000 > t.tmp ){ 
                t.tmp = t.now; 
                debug.innerHTML = t.n;
                t.n = 0;
            }

            t.n++;

        }

    },

    resize: function ( e, w, h ) {

        vs.w = window.innerWidth;
        vs.h = window.innerHeight;

        w = w || vs.w;
        h = h || vs.h;

        renderer.setSize( w, h );

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        if( gui ) gui.resize();

        if(isEffect){

            // Resize renderTargets
            ssaoPass.uniforms[ 'size' ].value.set( w, h );

            var pixelRatio = renderer.getPixelRatio();
            var newWidth  = Math.floor( w / pixelRatio );
            var newHeight = Math.floor( h / pixelRatio );
            depthRenderTarget.setSize( newWidth, newHeight );
            effectComposer.setSize( newWidth, newHeight );

        }

    },

    setFramerate: function ( n ) {

        view.framerate = n; 
        t.inter = 1000 / view.framerate;

    },

    move: function ( e ) {

        vs.mx = ( e.clientX / vs.w ) * 2 - 1;
        vs.my = ( e.clientY / vs.h ) * 2 - 1;

    },

    getRenderer: function () { return renderer; },
    getControler: function () { return controler; },
    getCamera: function () { return camera; },
    getScene: function () { return scene; },

    init: function ( container ) {

        clock = new THREE.Clock();

        t.then = ( typeof performance === 'undefined' ? Date : performance ).now();
        t.inter = 1000 / this.framerate;

        this.testMobile();

        vs.w = window.innerWidth;
        vs.h = window.innerHeight;

        //renderer = new THREE.WebGLRenderer({ precision: "mediump", antialias:false, alpha: this.isMobile ? false : true });

        renderer = new THREE.WebGLRenderer({ precision: "mediump", antialias: this.isMobile ? false : true, alpha: this.isMobile ? false : true });

        view.pixelRatio = 1;//window.devicePixelRatio;//this.isMobile ? 0.5 : window.devicePixelRatio;
        renderer.setPixelRatio( view.pixelRatio );
        renderer.setSize( vs.w, vs.h );
        container.appendChild( renderer.domElement );

        debug = document.createElement('div');
        debug.className = 'debug';
        container.appendChild( debug );

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 70, 1, 1, 1000 );
        camera.position.set( 0, 50, 100 );
        controler = new THREE.OrbitControls( camera, renderer.domElement );
        controler.target.set( 0, 50, 0 );
        controler.enableKeys = false;
        controler.update();

        follow = new THREE.Group();
        scene.add( follow );

        //transformer = new THREE.TransformControls( camera, renderer.domElement );
        //scene.add( transformer );

        if( this.isMobile ) renderer.setClearColor( 0x333333, 1 );
        else renderer.setClearColor( 0x000000, 0 );

        window.addEventListener( 'resize', this.resize, false );

        //this.addGrid();
        this.addLight();
        this.addShadow( this.isMobile ? false : true );

        this.resize();

        requestAnimationFrame( this.render );

    },

    setPixelRatio: function (b) {

        if(b){
            view.pixelRatio = 0.5;
        } else {
            view.pixelRatio = 1;
        }

        renderer.setPixelRatio( view.pixelRatio );

    },

    // GRID

    addGrid: function ( b ) {

        if(b){

            if( view.isGrid ) return;

            grid = new THREE.GridHelper( 50, 20, 0xFFFFFF, 0xAAAAAA );
            grid.material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors, transparent:true, opacity:0.25 } );
            scene.add( grid );
            view.isGrid = true;

        } else {

            if( !view.isGrid ) return;

            scene.remove( grid );
            grid.material.dispose();
            grid = null;
            view.isGrid = false;

        }

    },

    // POSTPROCESS

    getEffect: function (){

        return isEffect;

    },

    addEffect: function ( b ) {

        isEffect = b;

        if( !isEffect ) return;
        
        if( effectComposer === null ){

            //renderer.gammaInput = true;
            //renderer.gammaOutput = true;

            // Setup render pass
            var renderPass = new THREE.RenderPass( scene, camera );

            // Setup depth pass
            depthMaterial = new THREE.MeshDepthMaterial();
            depthMaterial.depthPacking = THREE.RGBADepthPacking;
            depthMaterial.blending = THREE.NoBlending;
            //depthMaterial.transparent = true;

            var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: true };
            depthRenderTarget = new THREE.WebGLRenderTarget( vs.w, vs.h, pars );
            depthRenderTarget.texture.name = "SSAOShader.rt";

            // Setup SSAO pass
            ssaoPass = new THREE.ShaderPass( THREE.SSAOShader );
            ssaoPass.material.transparent = true;
            ssaoPass.renderToScreen = true;
            //ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
            ssaoPass.uniforms[ "tDepth" ].value = depthRenderTarget.texture;
            ssaoPass.uniforms[ 'size' ].value.set( vs.w, vs.h );
            ssaoPass.uniforms[ 'cameraNear' ].value = camera.near;
            ssaoPass.uniforms[ 'cameraFar' ].value = camera.far*0.25;
            ssaoPass.uniforms[ 'onlyAO' ].value = 0;//( postprocessing.renderMode == 1 );
            ssaoPass.uniforms[ 'aoClamp' ].value = 0.9;//0.3;
            ssaoPass.uniforms[ 'lumInfluence' ].value = 0.5;//0.3;//0.5;

            // Add pass to effect composer
            effectComposer = new THREE.EffectComposer( renderer );
            effectComposer.addPass( renderPass );
            effectComposer.addPass( ssaoPass );

            

        }
    },

    updateEffect: function( o ){

        if( effectComposer !== null ){
            ssaoPass.uniforms[ 'onlyAO' ].value = o.onlyAO ? 1 : 0;
            ssaoPass.uniforms[ 'aoClamp' ].value = o.clamp;
            ssaoPass.uniforms[ 'lumInfluence' ].value = o.luma;
        }



    },

    // LIGHT

    addLight: function () {

        ambient = new THREE.AmbientLight( 0x333333 );
        scene.add( ambient );

        light = new THREE.DirectionalLight( 0xffffff, 1.2 );
        light.position.set(50,300,200);
        light.lookAt( new THREE.Vector3(0,0,0) );
        follow.add( light );

    },

    // SHADOW

    addShadow: function ( b ) {

        if( b ){

            if( view.isShadow ) return;

            view.isShadow = true;

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.soft = view.isMobile ? false : true;
            renderer.shadowMap.type = view.isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
            renderer.shadowMap.renderReverseSided = false;

            //materialShadow = new THREE.MeshLambertMaterial(  );

            materialShadow = new THREE.ShaderMaterial( THREE.ShaderShadow );
            plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 200, 1, 1 ), materialShadow );
            plane.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI*0.5 ) );
            //plane.position.y = -62;
            plane.castShadow = false;
            plane.receiveShadow = true;
            follow.add( plane );

            var d = 100;
            var camShadow = new THREE.OrthographicCamera( d, -d, d, -d,  100, 500 );
            light.shadow = new THREE.LightShadow( camShadow );
            light.shadow.mapSize.width = view.isMobile ? 512 : 1024;
            light.shadow.mapSize.height = view.isMobile ? 512 : 1024;
            light.shadow.bias = 0.01;
            light.castShadow = true;

        } else {

            if( !view.isShadow ) return;

            view.isShadow = false;

            renderer.shadowMap.enabled = false;
            light.castShadow = false;

            follow.remove( plane );
            materialShadow.dispose();
            plane.geometry.dispose();

        }

    },

    // CAPTURE

    getCaptueMode: function () { return isCaptureMode },

    captureMode: function ( b ) {

        isCaptureMode = b;

        if( isCaptureMode ){

            window.removeEventListener( 'resize', view.resize );

            renderer.domElement.style.position = "absolute";
            renderer.domElement.style.left = "50%";
            renderer.domElement.style.top = "50%";
            renderer.domElement.style.border = '6px solid #db0bfa';

            view.setVideoSize();
            view.initCapture();

        } else {

            renderer.domElement.style.position = "absolute";
            renderer.domElement.style.left = "0px";
            renderer.domElement.style.top = "0px";
            renderer.domElement.style.margin = '0px 0px';
            renderer.domElement.style.border = 'none';

            window.addEventListener( 'resize', view.resize );
            view.resize();

        }

    },

    setVideoMaxFrame: function ( v ) {

        maxFrame = v;

    },

    setVideoSize: function ( v ) {

        if( v !== undefined ){

            if( v  instanceof Array ){
                view.videoSize = v;
            } else {
                switch( v ){
                    case 240: view.videoSize = [426, 240]; break;
                    case 360: view.videoSize = [640, 360]; break;
                    case 480: view.videoSize = [854, 480]; break;
                    case 720: view.videoSize = [1280, 720]; break;
                    case 1080: view.videoSize = [1920, 1080]; break;
                }

                gui.upRes( view.videoSize )
            }
        }

        if( !isCaptureMode ) return;

        //if( v !== undefined ) view.videoSize = v;

        var w = view.videoSize[0];
        var h = view.videoSize[1];
        renderer.domElement.style.margin = ((-h*0.5)-6)+'px '+ ((-w*0.5)-6)+'px';
        view.resize( null, w, h );

    },

    initCapture: function () {

        if( capturer !== null ) return;

        capturer = new CCapture( {

            verbose: false,
            display: true,
            framerate: view.framerate,
            //motionBlurFrames: 1,//( 960 / framerate ) * 0 ,
            quality: 100,
            format:"webm-mediarecorder",
            //workersPath:'./js/',
            timeLimit: 60,//second
            frameLimit: 0,
            autoSaveTime: 0,
            //onProgress: function( p ) { progress.style.width = ( p * 100 ) + '%' }
        });

    },

    startCapture: function () {

        if( !isCaptureMode ) return;
        if( isCapture ) return;

        currentFrame = 0;

        renderer.setClearColor( 0x00FF00, 1 );
        capturer.start();
        isCapture = true;

    },

    saveCapture: function () {

        if( !isCaptureMode ) return;
        if( !isCapture ) return;

        isCapture = false;
        capturer.stop();
        capturer.save();
        
        if( this.isMobile ) renderer.setClearColor( 0xffd400, 1 );
        else renderer.setClearColor( 0x000000, 0 );

    },

    // MOBILE SUPPORT

    testMobile: function () {

        var n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) view.isMobile = true;
        else view.isMobile = false;  

    },



}



return view;

})();