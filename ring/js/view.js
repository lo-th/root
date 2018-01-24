

var view = ( function () {

    'use strict';

    var params = {
        background: false,
        sphere: false,
        exposure: 3,
        whitePoint:5,

        // SMAA
        unbiased:true,
        sample:2,
        // bloom
        strength: 1.5,
        threshold: 0.9,
        radius: 1.0,
        // fresnel
        reflect : 0.5,
        refract : 0.99,
        ratio : 1.04,
        bias : 0.1,
        power : 2.0,
        scale : 1.0,
        extra : 1.0,

        // ring
        r_metal: 1.0,
        r_rough: 0.25,
        r_ao : 1.0,
        r_color: 0xc3d9d7,
        // crown
        c_metal: 1.0,
        c_rough: 0.25,
        c_ao : 1.0,
        c_color: 0xc3d9d7,

        // diams front
        f_metal: 1.0,
        f_rough:0.3,
        f_alpha:0.9,
        f_env:4,
        f_ao:1.0,

        // diams back
        b_metal: 1.0,
        b_rough:0.0,
        b_alpha:0.5,
        b_env:6,

        // lights

        ambient : 0x172726,
        spot_front : 0xFFFFFF,
        spot_back : 0x81d8d0,
        point_1 : 0xFFDDDD,
        point_2 : 0xDDFFDD,
        point_3 : 0xDDDDFF,
        front : 1.4,
        back : 0.5,
        p1: 0.25,
        p2: 0.25,
        p3: 0.25,




    }

    var degtorad = 0.0174532925199432957;
    var radtodeg = 57.295779513082320876;

    var ambient, spotf, spotb, p1, p2, p3;

    var container, renderer, scene, camera, vsize, controls, light, clock

    var isPostEffect = false, renderScene, effectFXAA, bloomPass, copyShader, smaaPass, composer = null;

    //var raycaster, mouse, mouseDown = false;

    var cubeCamera = null;
    var textureCubeCamera = null;
    var textureCube = null;
    var diamondCube = null;

    var geo = {};
    var textures = {};
    var materials = {};
    var meshs = {};
    var shaders = {};

    var mouseDown = false;

    var flares = null;


    var env;

    var extraUpdate = [];

    var WIDTH = 512;

    view = {

        render: function () {

            requestAnimationFrame( view.render );

            if( cubeCamera ){ 
                if(flares) flares.group.visible = false;
                meshs.sphereEnv.visible = true;
                meshs.dtmp.visible = true;
                //meshs.dtmp2.visible = true;
                meshs.dfront.visible = false;
                meshs.dback.visible = false;
                meshs.sphere.visible = false;
                cubeCamera.updateCubeMap( renderer, scene );
                meshs.sphere.visible = params.sphere;
                meshs.dfront.visible = true;
                meshs.dback.visible = true;
                meshs.dtmp.visible = false;
                if(flares) flares.group.visible = true;
                //meshs.dtmp2.visible = false;
                meshs.sphereEnv.visible = false;
            }

            //if( flares && mouseDown ) flares.update();

            var i = extraUpdate.length;
            while(i--) extraUpdate[i]();
            
            if( isPostEffect ) composer.render();
            else renderer.render( scene, camera );
            
        },

        resize: function () {

            vsize.x = window.innerWidth;
            vsize.y = window.innerHeight;
            vsize.z = vsize.x / vsize.y;
            camera.aspect = vsize.z;
            camera.updateProjectionMatrix();
            renderer.setSize( vsize.x, vsize.y );

            if( isPostEffect ){
                composer.setSize( vsize.x, vsize.y );
                effectFXAA.uniforms['resolution'].value.set(1 / vsize.x, 1 / vsize.y );
            }

        },

        init: function () {

            clock = new THREE.Clock();

            container = document.createElement( 'div' );
            document.body.appendChild( container );

            vsize = new THREE.Vector3( window.innerWidth, window.innerHeight, 0);
            vsize.z = vsize.x / vsize.y;

            renderer = new THREE.WebGLRenderer({ antialias:false, alpha:true });
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( vsize.x, vsize.y );
            renderer.setClearColor( 0x000000, 0 );

            renderer.gammaInput = true;
            renderer.gammaOutput = true;

            renderer.toneMapping = THREE.Uncharted2ToneMapping;
            renderer.toneMappingExposure = params.exposure;
            renderer.toneMappingWhitePoint = params.whitePoint;

            //

            container.appendChild( renderer.domElement );

            scene = new THREE.Scene();
            scene.matrixAutoUpdate = false;

            camera = new THREE.PerspectiveCamera( 45, vsize.z, 0.1, 1000 );
            camera.position.set(0,60,280);

            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.target.set(0,1,0);
            controls.enableKeys = false;
            controls.update();


            this.initLights();
            this.initPostEffect();

            //this.initFlareEffect();
            //this.initGeometry();

            //
            container.addEventListener( 'mousemove', view.move, false );
            container.addEventListener( 'mousedown', view.down, false ); 
            container.addEventListener( 'mouseup', view.up, false ); 
            window.addEventListener( 'resize', view.resize, false );            

            this.render();
            
        },

        setTone: function(){

            renderer.toneMappingExposure = params.exposure;
            renderer.toneMappingWhitePoint = params.whitePoint;

        },

        move : function(){ if( flares && mouseDown ) flares.update(); },
        down : function(){ mouseDown = true; },
        up : function(){ mouseDown = false; },

        

        initLights: function ( shadow ) {

            //81d8d0

            ambient = new THREE.AmbientLight( 0x101010 );

            scene.add( ambient );

            p1 = new THREE.PointLight( 0xFFDDDD, 0.25);
            p1.position.set( -50,-100,-100 );
            scene.add( p1 );

            p2 = new THREE.PointLight( 0xDDFFDD, 0.25);
            p2.position.set( 0,-100,-100 );
            scene.add( p2 );

            p3 = new THREE.PointLight( 0xDDDDFF, 0.25);
            p3.position.set( 50,-100,-100 );
            scene.add( p3 );

            
            spotf = new THREE.SpotLight( 0xFFFFFF, 0.6, 600, Math.PI / 2, 0, 2 );
            spotf.position.set(-30,100,100);
            spotf.lookAt(new THREE.Vector3(0,0,0));

            scene.add( spotf );

            spotb = new THREE.SpotLight( 0x81d8d0, 0.35, 600, Math.PI / 2, 0, 2 );
            spotb.position.set(40, -60 ,100);
            spotb.lookAt(new THREE.Vector3(0,0,0));

            scene.add( spotb );

            view.setLight();

        },

        setLight: function(){
            spotf.color.setHex( params.spot_front );
            spotb.color.setHex( params.spot_back );
            p1.color.setHex( params.point_1 );
            p2.color.setHex( params.point_2 );
            p3.color.setHex( params.point_3 );
            ambient.color.setHex( params.ambient );

            spotf.power = params.front;
            spotb.power = params.back;
            p1.power = params.p1;
            p2.power = params.p2;
            p3.power = params.p3;

        },

        




    
        initPostEffect: function () {

            renderScene = new THREE.RenderPass( scene, camera );
            //renderScene.clearAlpha = true;

            // renderScene.clear = true;
            effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
            effectFXAA.uniforms['resolution'].value.set( 1 / vsize.x, 1 / vsize.y );

            copyShader = new THREE.ShaderPass( THREE.CopyShader );

            bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( vsize.x, vsize.y ), params.strength, params.radius, params.threshold);

            //var effectHBlur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
            //var effectVBlur = new THREE.ShaderPass( THREE.VerticalBlurShader );

            //var smaapass = new THREE.SMAAPass( vsize.x, vsize.y );
            smaaPass = new THREE.ManualMSAARenderPass( scene, camera );
            smaaPass.unbiased = true;
            smaaPass.sampleLevel = 2;
           //effectHBlur.uniforms[ 'h' ].value = 2 / ( vsize.x / 2 );
            //effectVBlur.uniforms[ 'v' ].value = 2 / ( vsize.y / 2 );

            //effectHBlur.uniforms[ 'h' ].value = 1 / ( vsize.x * 2);
            //effectVBlur.uniforms[ 'v' ].value = 1 / ( vsize.y * 2);

            composer = new THREE.EffectComposer( renderer );
            composer.setSize( vsize.x, vsize.y );

            composer.addPass(renderScene);
            
            
            composer.addPass(effectFXAA);
            composer.addPass(bloomPass);
            

            composer.addPass(smaaPass);
            
            composer.addPass(copyShader);
            //composer.addPass(effectVBlur);
            
            //composer.addPass(smaaPass);


            copyShader.renderToScreen = true;
            isPostEffect = true;

        },



        setBloom: function(){

            smaaPass.unbiased = params.unbiased;
            smaaPass.sampleLevel = params.sample;

            bloomPass.threshold = params.threshold;
            bloomPass.strength = params.strength;
            bloomPass.radius = params.radius;

        },

        initCubeCamera: function () {

            cubeCamera = new THREE.CubeCamera( 0.1, 1000, 512 );
            scene.add( cubeCamera );

            textureCubeCamera = cubeCamera.renderTarget.texture;

        },

        getCubeEnvMap: function () {

            return cubeCamera.renderTarget.texture;

        },

        // -----------------------
        //  RING SIDE
        // -----------------------

        loadAssets : function ( envName, type ) {

            var envName = envName || 'church';
            var path = 'textures/cube/'+envName+'/';
            var format = type || '.jpg';
            var urls = [
                    path + 'posx' + format, path + 'negx' + format,
                    path + 'posy' + format, path + 'negy' + format,
                    path + 'posz' + format, path + 'negz' + format
                ]; 
            path = 'textures/cube/diams/';
            format = '.png'
            urls.push(
                path + 'dposx' + format, path + 'dnegx' + format,
                path + 'dposy' + format, path + 'dnegy' + format,
                path + 'dposz' + format, path + 'dnegz' + format
            )
            urls.push( 'glsl/fresnel_fs.glsl', 'glsl/fresnel_vs.glsl', 'textures/ring_ao.png', 'textures/ring_n.png', 'models/ring.sea' );
            urls.push( 'textures/flare256.png' );

            pool.load( urls, view.initModel );

        },

        initModel : function () {

            view.initCubeCamera();

            var dy = -6.5*10;
            view.moveCamera( [0,dy,260], [0,dy,0] );

            var p = pool.getResult();

            // set cube texture
            textureCube = view.setCubeEnv( [ p['posx'], p['negx'], p['posy'], p['negy'], p['posz'], p['negz'] ] );
            diamondCube = view.setCubeEnv( [ p['dposx'], p['dnegx'], p['dposy'], p['dnegy'], p['dposz'], p['dnegz'] ] );
            view.setBackground();
            

            // get geometry
            var m = p['ring'];
            var i = m.length, g;
            while(i--){ 
                g = m[i].geometry;
                g.scale(10, 10, 10);

                var uvs = g.attributes.uv.array;
                g.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );

                geo[ m[i].name ] = g;

                
            }


            geo[ 'sphere0' ] = new THREE.SphereBufferGeometry( 100, 12, 10 );
            geo[ 'sphere' ] = new THREE.SphereBufferGeometry( 40, 12, 10 );

            // get textures
            textures['fx0'] = new THREE.Texture( p['flare256'] );
            //textures['fx1'] = new THREE.Texture( p['flare512'] );

            textures.fx0.needsUpdate = true;
            //textures.fx1.needsUpdate = true;

            var tx0 = new THREE.Texture( p['ring_ao'] );
            tx0.flipY = false;
            tx0.anisotropy = 16;
            tx0.needsUpdate = true;

            var tx1 = new THREE.Texture( p['ring_n'] );
            tx1.flipY = false;
            tx1.anisotropy = 16;
            tx1.needsUpdate = true;

            textures['ao'] = tx0;
            textures['norm'] = tx1;

            shaders['fresnel_vs'] = p['fresnel_vs'];
            shaders['fresnel_fs'] = p['fresnel_fs'];

            view.addMaterial();
            view.addRing();

            view.addFlare();

        },

        addFlare : function(){

            flares = new view.Flares( textures.fx0, 6 );

        },

        addRing : function () {

            meshs['ring'] = new THREE.Mesh( geo.ring, materials.ring );
            meshs['crown'] = new THREE.Mesh( geo.crown, materials.crown );
            meshs['dfront'] = new THREE.Mesh( geo.diamond, materials.dfront );
            meshs['dback'] = new THREE.Mesh( geo.diamond, materials.dback );

            meshs['dtmp'] = new THREE.Mesh( geo.diamond_back, materials.fresnel );
            //meshs['dtmp2'] = new THREE.Mesh( geo.diamond_back, materials.fresnel );

            /*meshs.dtmp2.scale.multiplyScalar(0.5);
            meshs.dtmp2.rotation.z = 180 * degtorad;
            meshs.dtmp2.rotation.y = 22.5 * degtorad;*/


            meshs['sphere'] = new THREE.Mesh( geo.sphere, materials.test );
            meshs['sphereEnv'] = new THREE.Mesh( geo.sphere0, materials.env );

            for( var m in meshs ){
                scene.add( meshs[m] );
                if(m === 'sphere') meshs[m].position.y = -80 
            };


            //meshs.dtmp.visible = false;
            //meshs.dfront.visible = false;
            //meshs.dback.visible = false;
            //meshs.dfront.materials = materials.fresnel;

        },

        
        



        addMaterial : function () {

            materials['env'] = new THREE.MeshStandardMaterial({
                metalness:1.0, 
                roughness:0.0, 
                transparent:true,
                opacity:0.9,
                shading:THREE.SmoothShading,
                envMap:diamondCube,
                blending:THREE.MultiplyBlending,
                //blending:THREE.AdditiveBlending,
                //blending:THREE.SubtractiveBlending,
                side: THREE.BackSide,
            });

            materials['test'] = new THREE.MeshStandardMaterial({
                metalness:1.0, 
                roughness:0.0, 
                shading:THREE.SmoothShading,
                envMap:textureCubeCamera,
            });

            materials['ring'] = new THREE.MeshStandardMaterial({
                metalness:params.r_metal, 
                roughness:params.r_rough, 
                shading:THREE.SmoothShading,
                aoMap: textures.ao,
                aoMapIntensity:params.r_ao,

                //lightMap: textures.ao,
                //lightMapIntensity:1.0,
                normalMap: textures.norm,
                normalScale : new THREE.Vector2( 2, 2 ),
                envMap:textureCube,
            });

            materials['crown'] = new THREE.MeshStandardMaterial({
                metalness:params.c_metal, 
                roughness:params.c_rough,  
                shading:THREE.SmoothShading,
                aoMap: textures.ao,
                aoMapIntensity:params.c_ao,
                //normalMap: textures.norm,
                envMap:textureCube,
            });

           

            materials['dfront'] = new THREE.MeshPhysicalMaterial({
                transparent:true,
                aoMap: textures.ao,
                //aoMapIntensity:1.0,
                depthWrite:false,
                envMap:textureCubeCamera,
                //refractionRatio:2.46,
            });

            materials['dback'] = new THREE.MeshPhysicalMaterial({
                transparent:true,
                depthWrite:false,
                envMap:textureCubeCamera,
                //envMapIntensity: 5,
                refractionRatio:2.46,
                side: THREE.BackSide,
            });

            materials['fresnel'] = new THREE.ShaderMaterial( {
                uniforms: {
                    "aR": { value: 0.5 },
                    "aF": { value: 0.5 },
                    "mRefractionRatio": { value: 2 },
                    "mFresnelBias": { value: 0.1 },
                    "mFresnelPower": { value: 2 },
                    "mFresnelScale": { value: 1.0 },
                    "mExtraPower": { value: 1.8 },
                    "envMap": { value: null }
                },

                vertexShader: shaders['fresnel_vs'],
                fragmentShader: shaders['fresnel_fs'],
               // blending:THREE.AdditiveBlending,
                transparent:true,
                depthWrite:false,
                // premultipliedAlpha: true,
                //shading:THREE.FlatShading,//,  opacity:0.7//, 
                //side:THREE.DoubleSide,
                //side: THREE.BackSide,
                //side: THREE.FrontSide,
                //envMapIntensity: 2,
                //premultipliedAlpha: true,
            });

            materials.fresnel.uniforms.envMap.value = diamondCube;//textureCube;
            materials.fresnel.uniforms.envMap.value.needsUpdate = true;

            view.setFresnel();
            view.setMaterial();

        },

        setMaterial: function(){

            materials.ring.metalness = params.r_metal;
            materials.ring.roughness = params.r_rough;
            materials.ring.aoMapIntensity = params.r_ao;
            materials.ring.color.setHex( params.r_color );

            materials.crown.metalness = params.c_metal;
            materials.crown.roughness = params.c_rough;
            materials.crown.aoMapIntensity = params.c_ao;
            materials.crown.color.setHex( params.c_color );

            materials.dfront.metalness = params.f_metal;
            materials.dfront.roughness = params.f_rough;
            materials.dfront.opacity = params.f_alpha;
            materials.dfront.envMapIntensity = params.f_env;
            materials.dfront.aoMapIntensity = params.f_ao;

            materials.dback.metalness = params.b_metal;
            materials.dback.roughness = params.b_rough;
            materials.dback.opacity = params.b_alpha;
            materials.dback.envMapIntensity = params.b_env;

        },

        


        setFresnel: function(){

            var u = materials.fresnel.uniforms;

            u.aR.value = params.reflect;
            u.aF.value = params.refract;

            u.mRefractionRatio.value = params.ratio;
            u.mFresnelBias.value = params.bias;
            u.mFresnelPower.value = params.power;
            u.mFresnelScale.value = params.scale;
            u.mExtraPower.value = params.extra;

        },

        setBackground: function(){

            if( params.background ) scene.background = textureCube;
            else scene.background = null;

        },





        // -----------------------
        //  GET FUNCTION
        // -----------------------

        getParams: function () { return params; },

        getPixel: function ( texture, x, y, w, h ) { 

            w = w || 1;
            h = h || 1;
            var read = new Float32Array( 4 * (w * h) );
            renderer.readRenderTargetPixels( texture, x || 0, y || 0, w, h, read ); 
            return read;
            
        },

        getBgColor: function(){ return renderer.getClearColor(); },

        getRenderer: function(){ return renderer; },

        getDom: function () { return renderer.domElement; },

        getCamera: function () { return camera; },

        getScene: function () { return scene; },

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

        moveTarget: function( v ){
            var offset = camera.position.clone().sub( controls.target );
           // controls.autoRotate = true
            var offset = controls.target.clone().sub( camera.position );//camera.position.clone().sub( controls.target );
           // camera.position.add(v.clone().add(offset));
            controls.target.copy( v );
            //camera.position.copy( v.add(dif));
            controls.update();
        },

        setCubeEnv: function( imgs ){

            var ev = new THREE.CubeTexture( imgs );
            ev.format = THREE.RGBFormat;
            ev.needsUpdate = true;
            return ev;

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
            //geo[ 'capsule' ] =  new THREE.CapsuleBufferGeometry( 1, 1, 12, 1 );

        },

        

        addUpdate: function ( fun ) {

            extraUpdate.push( fun );

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

    }


    // -----------------------
    //  FLARES
    // -----------------------

    view.Flares = function( texture, n ){

        this.group = new THREE.Group();

        this.max = n || 6;
        this.f = [];

        var i = this.max;
        while(i--){
            this.f[i] = new view.Flare( texture );
            this.group.add( this.f[i].m );
        }

        view.getScene().add( this.group );

    };

    view.Flares.prototype = {
   
        update: function () {

            var t = view.randRangeInt( 0, this.max-1 );
            this.f[t].show();


            var i = this.max;
            while(i--){
                this.f[i].update();
            }

        }
    }

    //

    view.Flare = function( texture ){

        this.mat = new THREE.SpriteMaterial( { 
            map: texture,
            blending:THREE.AdditiveBlending, 
            transparent:true, 
            opacity:0 
        });

        this.m = new THREE.Sprite( this.mat );

        this.needUp = false;
        this.speed = 0.1;
        this.a = 0;
        this.maxa = 0.8;
        this.maxs = 0;
        this.go_up = false;
        this.go_down = false;
        

    };

    view.Flare.prototype = {

        show: function (){

            if(this.needUp) return;

            var r = view.randRange( 0, Math.PI * 2 );
            var x = Math.cos(r) * view.randRange( 0, 19 );
            var z = Math.sin(r) * view.randRange( 0, 19 );

            this.maxs = view.randRange( 30, 100 );

            this.speed = view.randRange( 0.05, 0.1 );
            this.pos( x, view.randRange( -1, 9 ), z );
            //this.size( this.maxs );
            this.needUp = true;

        },

        size: function ( v ) { this.m.scale.set( v, v, 1 ); },
        pos: function ( x, y, z ) { this.m.position.set( x, y, z ) },
        alpha: function ( v ) { this.mat.opacity = v; },

        update:function(){

            if(!this.needUp) return;

            if( this.a === 0 ) this.go_up = true;

            if( this.go_up ){ 
                this.a += this.speed;
                if(this.a>this.maxa){
                    this.a = this.maxa; 
                    this.go_up = false;
                    this.go_down = true;
                }
            }

            if( this.go_down ){ 
                this.a -= this.speed;
                if(this.a<0){
                    this.a = 0; 
                    this.needUp = false;
                    this.go_down = false;
                }
            }

            this.alpha(this.a);
            this.size((this.a+0.2) * this.maxs );

        },

    };

        

    return view;

})();



