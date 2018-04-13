

var view = ( function () {

    'use strict';

    var degtorad = 0.0174532925199432957;//Math.PI / 180;//;
    var radtodeg = 57.295779513082320876;//180 / Math.PI;//

    var renderer, scene, camera, controls, canvas, vsize, composer, pass, copyPass;
    var light, pointLight1, pointLight2, pointLight3;

    var isOnRender = false;

    var meshBodys = [];
    var meshBones = [];
    var statics = [];
    var geo = {};
    var mat = {};

    var ground;
    var groundTexture;
    var groundMat;

    var phyGroup;
    //var extraUpdate = null;
    var extraUpdates = [];

    var groundSetting = {
        groud : 0.1,
        shadow : 0.3,
    }

    var tmp_quat, tmp_pos, tmp_scl;

    view = function () {};

    view.render = function () {

        requestAnimationFrame( view.render );

        soccer.update();

        physic.update();

        renderer.render( scene, camera );

        //debug('calls:'+renderer.info.render.calls + ' | textures:' + renderer.info.memory.textures + ' | shader:'+renderer.info.programs.length);

    };

    view.simpleRender = function () {

        requestAnimationFrame( view.simpleRender );
        renderer.render( scene, camera );

        var i = extraUpdates.length;
        while(i--) extraUpdates[i]();

        //if( extraUpdate ) extraUpdate();

    };

    view.resize = function () {

        vsize.x = window.innerWidth;
        vsize.y = window.innerHeight;
        vsize.z = vsize.x / vsize.y;
        camera.aspect = vsize.z;
        camera.updateProjectionMatrix();
        renderer.setSize( vsize.x, vsize.y );

    };

    view.setCamera = function ( y, z ) {

        camera.position.set(0,y,z);
        controls.target.set(0,y,0);
        controls.update();

    };

    view.revers = function(){

        camera.position.x *= -1;
        light.position.x *= -1;
        pointLight1.position.x *= -1;
        pointLight2.position.x *= -1;
        pointLight3.position.x *= -1;

        camera.position.z *= -1;
        light.position.z *= -1;
        pointLight1.position.z *= -1;
        pointLight2.position.z *= -1;
        pointLight3.position.z *= -1;

        controls.update();

    };
    

    view.init = function () {

        tmp_quat = new THREE.Quaternion();
        tmp_pos = new THREE.Vector3();
        tmp_scl = new THREE.Vector3();

        vsize = new THREE.Vector3( window.innerWidth, window.innerHeight, 0);
        vsize.z = vsize.x / vsize.y;

        canvas = document.getElementById( 'canvasTree' );

        renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true, alpha:true });
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( vsize.x, vsize.y );
        renderer.setClearColor( 0x000000, 0 );

        //renderer.gammaInput = true;
        //renderer.gammaOutput = true;

        //renderer.toneMapping = THREE.Uncharted2ToneMapping;
        //renderer.toneMappingExposure = 1.5;
        //renderer.toneMappingWhitePoint = 10;
        

        scene = new THREE.Scene();

        phyGroup = new THREE.Group();
        phyGroup.visible = false;

        scene.add( phyGroup );
    
        //camera = new THREE.PerspectiveCamera( 35, vsize.z, 0.1, 4000 );
        camera = new THREE.PerspectiveCamera( 45, vsize.z, 0.1, 4000 );
        camera.position.set(0,100,1000);

        controls = new THREE.OrbitControls( camera, canvas );
        controls.target.set(0,100,0);

        controls.enableKeys = false;
        controls.update();

        window.addEventListener( 'resize', view.resize, false );

        this.initLight();
        this.addGround();

        geo['box'] =  new THREE.BoxBufferGeometry(1,1,1);
        geo['sphere'] = new THREE.SphereBufferGeometry( 1, 6, 5 );
        geo['ball'] = new THREE.SphereBufferGeometry( 1, 24, 20 );
        geo['cylinder'] =  new THREE.CylinderBufferGeometry(1,1,1, 6, 1 );

        mat['ball'] = new THREE.MeshBasicMaterial({ color:0xffffff, name:'basic', wireframe:true });
        mat['basic'] = new THREE.MeshBasicMaterial({ color:0xffffff, name:'basic', wireframe:true });
        mat['wall'] = new THREE.MeshBasicMaterial({ color:0x000000, name:'wall', wireframe:true, transparent:true, opacity:0.1 });
        mat['kinect'] = new THREE.MeshBasicMaterial({ color:0x00FFFF, name:'kinect', wireframe:true  });
        mat['kinecton'] = new THREE.MeshBasicMaterial({ color:0xFF9900, name:'kinecton', wireframe:true, depthTest:false, depthWrite:false  });

        renderer.render( scene, camera );
        
    };

    view.addGround = function(){

        var canvas = document.createElement( 'canvas' );
        canvas.width = canvas.height = 128;
        var ctx = canvas.getContext( '2d' );


        var grd = ctx.createLinearGradient(0,0,0,128);

        grd.addColorStop(0,"rgba(0,0,0,0)");
        grd.addColorStop(0.5,"rgba(0,0,0,1)");
        grd.addColorStop(1,"rgba(0,0,0,0)");

        ctx.fillStyle = grd;
        ctx.fillRect( 32,0,64,128 );

        groundTexture = new THREE.Texture( canvas );
        groundTexture.wrapS = THREE.RepeatWrapping;
        //texture.wrapT = THREE.RepeatWrapping
        groundTexture.repeat.set( 20, 1 );

        groundTexture.needsUpdate = true;

        var geo = new THREE.PlaneBufferGeometry( 1000, 1000 );
        geo.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI * 0.5 ));

        //view.uniformPush('lambert', 'shadowColor', { type: "c", value: new THREE.Color(0x000000) });
        view.uniformPush('lambert', 'mapAlpha', { type: "f", value: groundSetting.groud });
        view.uniformPush('lambert', 'shadowAlpha', { type: "f", value: groundSetting.shadow });
        view.shaderRemplace('lambert', 'fragment', '#include <tonemapping_fragment>', '');

        var fa = [
        "uniform float mapAlpha;",
        "uniform float shadowAlpha;",
        ];
        view.shaderPush('lambert', 'fragment', fa );




        var fm = [
        "   float mask = getShadowMask();",
        "   vec4 pp = texture2D( map, vUv );",
        "   vec4 mapping = vec4( pp.rgb, pp.a * mapAlpha );",
        //"   mapping.a *= mapAlpha;",
        "   vec4 shadowing = vec4( vec3(0.0), shadowAlpha * (1.0 - mask) );",
        "   gl_FragColor = mix( mapping, shadowing, 1.0 - mask );",
        "   gl_FragColor = shadowing;",
        "   gl_FragColor += mapping;",
        ]
        view.shaderMain('lambert', 'fragment', fm );
    
        groundMat = new THREE.MeshLambertMaterial({ map:groundTexture, transparent:true, depthWrite:false });
        ground = new THREE.Mesh( geo, groundMat );

        ground.position.y = - 2;

        ground.frustumCulled = false;
        ground.receiveShadow = true;
        ground.castShadow = false;

        scene.add( ground );

    };

    view.getGroundSetting = function () {

        return groundSetting;
    
    };

    view.applyGroundSetting = function () {

        view.uniformPush('lambert', 'mapAlpha', { type: "f", value: groundSetting.groud });
        view.uniformPush('lambert', 'shadowAlpha', { type: "f", value: groundSetting.shadow });

        groundMat = new THREE.MeshLambertMaterial({ map:groundTexture, transparent:true, depthWrite:false });

        ground.material = groundMat;

    };

    view.showPhySkeleton = function ( b ){ phyGroup.visible = b; };

    view.setBallGeometry = function( g ) { geo['ball'] = g; };
    view.setBallMaterial = function( m ) { 
        mat.ball = m;
        var i = meshBodys.length;
        while(i--) if(meshBodys[i].name==='ball') meshBodys[i].material = mat.ball;
    };

    view.getMeshBody = function(){

        return meshBodys;

    };

    view.getMeshBone = function(){

        return meshBones;

    };

    view.addExtraUpdate = function( extra ){
        
        extraUpdates.push( extra );

    };

    view.initLight = function( shadow ){

        //scene.add( new THREE.AmbientLight( 0x808080 ) );

        // front sun
        //var light = new THREE.SpotLight( 0xFFFFEE, 1.2, 0, Math.PI/2, 1 );
        light = new THREE.DirectionalLight( 0xFFFFEE, 1.2 );
        light.position.set(50,400,300);
        light.lookAt(new THREE.Vector3(0,100,0));
        scene.add( light );

        // top sky
        pointLight1 = new THREE.PointLight( 0x70b4db, 0.8, 1000 );
        pointLight1.position.set(-100, 300, -300)
        scene.add( pointLight1 );

        // green Floor
        pointLight2 = new THREE.PointLight( 0x136321, 0.5, 1000 );
        pointLight2.position.set(100, -200, -100)
        scene.add( pointLight2 );

        // hot red
        pointLight3 = new THREE.PointLight( 0xda450d, 0.7, 1000 );
        pointLight3.position.set(-200, 100, 0)
        scene.add( pointLight3 );

    };

    view.shadow = function ( b ) {

        if( b ){

            light.castShadow = true;

            light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 1000 ) );
            //light.shadow.camera.near = 200;
            //light.shadow.camera.far = 1000;
            //light.shadow.camera.fov = 50;
           // 
            light.shadow.bias = 0.0001;

            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap;
            //renderer.shadowMap.type = THREE.BasicShadowMap;
            //renderer.shadowMap.cullFace = THREE.CullFaceBack;

        } else {

            light.castShadow = false;
            renderer.shadowMap.enabled = false;

        }

    };

    view.toRad = function ( r ) {

        var i = r.length;
        while(i--) r[i] *= degtorad;
        return r;

    };

    view.add = function ( o ) {

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

        var material = mat.wall;

        if( o.mass ) material = mat.basic;
        if( o.flag === 2 ) material = mat.kinect;
        if( o.name === 'ball' ) material = mat.ball;

        var mesh = new THREE.Mesh( o.geometry || geo[o.type], material );

        mesh.scale.fromArray( size );

        /*
        mesh.position.fromArray( pos );
        mesh.quaternion.fromArray( o.quat );
        */

        tmp_pos.fromArray( pos );
        tmp_scl.fromArray( size )
        tmp_quat.fromArray( o.quat );

        mesh.matrix.compose( tmp_pos, tmp_quat, tmp_scl );
        mesh.matrixAutoUpdate = false;



        

        mesh.name = o.name;

        

        // push 
        if( o.mass ){ 
            if(o.name === 'ball' ){ 
                scene.add( mesh );
                meshBodys.push( mesh );
                mesh.receiveShadow = true;
                mesh.castShadow = true;
            } else{ 
                phyGroup.add( mesh );
                meshBones.push( mesh );
                mesh.receiveShadow = false;
                mesh.castShadow = false;
            }
        }
        else statics.push( mesh );

        // send physic
        physic.add( o );

    };

    view.getScene = function ( mesh ) {

        return scene;

    };
    

    // -----------------------------
    //  SHADER HACK
    // -----------------------------

    view.uniformPush = function( type, name, value ){

        type = type || 'physical';
        THREE.ShaderLib[type].uniforms[name] = value;

    };

    view.shaderRemplace = function( type, shad, word, re ){

        type = type || 'physical';
        shad = shad || 'fragment';

        THREE.ShaderLib[type][shad+'Shader'] = THREE.ShaderLib[type][shad+'Shader'].replace(word, re);

    };

    view.shaderPush = function( type, shad, add ){

        type = type || 'physical';
        shad = shad || 'fragment';

        add.push(" ");
        THREE.ShaderLib[type][shad+'Shader'] = add.join("\n") + THREE.ShaderLib[type][shad+'Shader'];

    };

    view.shaderMain = function( type, shad, add ){

        type = type || 'physical';
        shad = shad || 'fragment';

        add.push("} ");

        THREE.ShaderLib[type][shad+'Shader'] = THREE.ShaderLib[type][shad+'Shader'].substring( 0, THREE.ShaderLib[type][shad+'Shader'].length-2 );
        THREE.ShaderLib[type][shad+'Shader'] += add.join("\n");

    };

    // -----------------------------
    //  SEA3D LOADER
    // -----------------------------

    view.seaLoader = function ( url, callback ){

        var loader = new THREE.SEA3D({ autoPlay : false });

        loader.onDownloadProgress = function( e ) {

            var pp = (Math.floor(e.progress) * 100) + "%";
            debug( 'Loading 3D model : ' + pp );

        };

        loader.onComplete = function( e ) {

            callback( loader.meshes );

            if( !isOnRender ){
                isOnRender = true;
                view.render();
            }

        };

        loader.load( url );

    };


    // -----------------------------
    //  IMAGE LOADER
    // -----------------------------

    view.imgLoader = function ( urls, callback ){

        this.urls = urls;
        this.textures = [];
        this.callback = callback;

        this.loadNext();

    };

    view.imgLoader.prototype = {

        loadNext : function(){

            var link = this.urls[0];
            var type = link.substring( 0, link.lastIndexOf('/') );
            var name = link.substring(link.lastIndexOf('/')+1, link.lastIndexOf('.'));
            var _this = this;

            var img = new Image();

            img.onload = function(){

                var tx = new THREE.Texture( img );

                if( type === 'spherical' ) tx.mapping = THREE.SphericalReflectionMapping;
                if( type === 'soccer' ) tx.flipY = false;
                if( type === 'hoyo' ) tx.flipY = false;
                if( type === 'ball' ) tx.flipY = false;

                tx.needsUpdate = true;
                tx.anisotropy = 4;

                _this.textures.push( tx );

                _this.urls.shift();
                if( _this.urls.length === 0 ) _this.callback( _this.textures );
                else _this.loadNext();

            };//.bind(this);

            img.src = 'textures/' + link;

            debug( 'loading texture : ' + name );

        }

    };


    // MATH

    view.lerp = function (a, b, percent) { return a + (b - a) * percent; };
    view.randRange = function (min, max) { return view.lerp( min, max, Math.random()); };
    view.randRangeInt = function (min, max, n) { return view.lerp( min, max, Math.random()).toFixed(n || 0)*1; };

    return view;

})();



