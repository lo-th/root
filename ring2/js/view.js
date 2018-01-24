

var view = ( function () {

    'use strict';

    var params = {
        background: false,
        sphere: false,
        exposure: 1.0,
        // bloom
        strength: 1.5,
        threshold: 0.9,
        radius: 1.0,
        // fresnel
        reflect : 0.5,
        refract : 0.5,
        ratio : 2,
        bias : 0.1,
        power : 2.0,
        scale : 1.0,

        // ring
        r_metal: 1.0,
        r_rough: 0.4,
        r_ao : 1.0,
        r_color: 0xFFFFFF,
        // crown
        c_metal: 1.0,
        c_rough: 0.4,
        c_ao : 1.0,
        c_color: 0xFFFFFF,

        // diams front
        f_metal: 1.0,
        f_rough:0.0,
        f_alpha:0.9,
        f_env:4,

        // diams back
        b_metal: 1.0,
        b_rough:0.0,
        b_alpha:0.5,
        b_env:4,


    }



    var degtorad = 0.0174532925199432957;
    var radtodeg = 57.295779513082320876;

    var container, renderer, scene, camera, vsize, controls, light, clock

    var isPostEffect = false, renderScene, effectFXAA, bloomPass, copyShader, composer = null;

    //var raycaster, mouse, mouseDown = false;

    var cubeCamera = null;
    var textureCubeCamera = null;
    var textureCube = null;

    var geo = {};
    var textures = {};
    var materials = {};
    var meshs = {};
    var shaders = {};

    var env;

    var extraUpdate = [];

    var WIDTH = 512;

    view = {

        render: function () {

            requestAnimationFrame( view.render );

            if( cubeCamera ){ 
                //meshs.sphereEnv.visible = true;
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
                meshs.dtmp2.visible = false;
                meshs.sphereEnv.visible = false;
            }

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
            //this.initGeometry();

            //

            window.addEventListener( 'resize', view.resize, false );            

            this.render();
            
        },

        initLights: function ( shadow ) {

            //scene.add( new THREE.AmbientLight( 0x404040 ) );

            var pointLight = new THREE.PointLight( 0xFFFFFF, 0.25, 600);
            pointLight.position.set( -5,-10,-10 ).multiplyScalar( 10 );
            scene.add( pointLight );

            var pointLight2 = new THREE.PointLight( 0xFFFFFF, 0.25, 600);
            pointLight2.position.set( 5,-10,-10 ).multiplyScalar( 10 );
            scene.add( pointLight2 );

            
            light = new THREE.SpotLight( 0xFFFFFF, 0.5, 600 );
            light.position.set(-3,10,10).multiplyScalar( 10 );
            light.lookAt(new THREE.Vector3(0,0,0));

            //

            if( shadow ){
                light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 20, 1, 5, 200 ) );
                light.shadow.bias = 0.0001;
                light.shadow.mapSize.width = 1024;
                light.shadow.mapSize.height = 1024;
                light.castShadow = true;

                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFShadowMap;
            }

            //

            scene.add( light );

            var light2 = new THREE.SpotLight( 0xFFFFFF, 0.25, 600 );
            light2.position.set(3,-5,10).multiplyScalar( 10 );
            light2.lookAt(new THREE.Vector3(0,0,0));

            scene.add( light2 );

        },


        

        initPostEffect: function () {

            renderScene = new THREE.RenderPass( scene, camera );
            //renderScene.clearAlpha = true;

            // renderScene.clear = true;
            effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
            effectFXAA.uniforms['resolution'].value.set( 1 / vsize.x, 1 / vsize.y );

            copyShader = new THREE.ShaderPass( THREE.CopyShader );

            bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( vsize.x, vsize.y ), params.strength, params.radius, params.threshold);

            composer = new THREE.EffectComposer( renderer );
            composer.setSize( vsize.x, vsize.y );

            composer.addPass(renderScene);
            composer.addPass(effectFXAA);
            composer.addPass(bloomPass);
            composer.addPass(copyShader);

            copyShader.renderToScreen = true;
            isPostEffect = true;

        },

        setBloom: function(){

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

        loadAssets : function ( envName ) {

            var envName = envName || 'church';
            var path = 'textures/cube/'+envName+'/';
            var format = '.jpg';
            var urls = [
                    path + 'posx' + format, path + 'negx' + format,
                    path + 'posy' + format, path + 'negy' + format,
                    path + 'posz' + format, path + 'negz' + format
                ]; 
            urls.push( 'glsl/fresnel_fs.glsl', 'glsl/fresnel_vs.glsl', 'textures/ring_ao.png', 'textures/ring_n.png', 'models/ring.sea' );

            pool.load( urls, view.initModel );

        },

        initModel : function () {

            view.initCubeCamera();

            var dy = -6.5*10;
            view.moveCamera( [0,dy,260], [0,dy,0] );

            var p = pool.getResult();

            // set cube texture
            textureCube = view.setCubeEnv( [ p['posx'], p['negx'], p['posy'], p['negy'], p['posz'], p['negz'] ] );
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

        },

        addRing : function () {

            meshs['ring'] = new THREE.Mesh( geo.ring, materials.ring );
            meshs['crown'] = new THREE.Mesh( geo.crown, materials.crown );
            meshs['dfront'] = new THREE.Mesh( geo.diamond, materials.dfront );
            meshs['dback'] = new THREE.Mesh( geo.diamond_back, materials.dback );

            meshs['dtmp'] = new THREE.Mesh( geo.diamond_back, materials.fresnel );
            meshs['dtmp2'] = new THREE.Mesh( geo.diamond_back, materials.fresnel );

            meshs.dtmp2.scale.multiplyScalar(0.5);
            meshs.dtmp2.rotation.z = 180 * degtorad;
            meshs.dtmp2.rotation.y = 22.5 * degtorad;


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
                shading:THREE.SmoothShading,
                envMap:textureCube,
                 //side: THREE.DoubleSide,
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
                envMap:textureCube,
            });

            materials['crown'] = new THREE.MeshStandardMaterial({
                metalness:params.c_metal, 
                roughness:params.c_rough,  
                shading:THREE.SmoothShading,
                aoMap: textures.ao,
                aoMapIntensity:params.c_ao,
                normalMap: textures.norm,
                envMap:textureCube,
            });

           

            materials['dfront'] = new THREE.MeshPhysicalMaterial({
                transparent:true,
                aoMap: textures.ao,
                aoMapIntensity:1.0,
                depthWrite:false,
                envMap:textureCubeCamera,
            });

            materials['dback'] = new THREE.MeshPhysicalMaterial({
                transparent:true,
                depthWrite:false,
                envMap:textureCubeCamera,
                envMapIntensity: 5,
            });

            materials['fresnel'] = new THREE.ShaderMaterial( {
                uniforms: {
                    "aR": { value: 0.5 },
                    "aF": { value: 0.5 },
                    "mRefractionRatio": { value: 2 },
                    "mFresnelBias": { value: 0.1 },
                    "mFresnelPower": { value: 2 },
                    "mFresnelScale": { value: 1.0 },
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

            materials.fresnel.uniforms.envMap.value = textureCube;
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

            env = new THREE.CubeTexture( imgs );
            env.format = THREE.RGBFormat;
            //env.mapping = THREE.SphericalReflectionMapping;
            env.needsUpdate = true;

            return env;

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

    return view;

})();



