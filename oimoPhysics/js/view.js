/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_|
*    @author lo.th / http://lo-th.github.io/labs/
*    THREE manager
*/

var view = ( function () {

var canvas, debug, renderer, scene, camera, controler, geo, mat, light, ambient, followGroup, extraMesh;
var vs = { w:1, h:1, l:0, x:0 };
var isNeedUpdate = false;
var cameraTween = false;
var isMouseMove = true;
var isWithShadow = false;

var shadowGround = null;

var time = 0;
var temp = 0;
var count = 0;
var fps = 0;

var perlin = null;

var bodys = []; // 0
var solids = []; // 1
var terrains = [];

var extraGeo = [];
var loader;
var envmap;

var isMobile = false;

var urls = [];
var callback_load = null;
var results = {};

var bg = 0x151515;

var cam = {

    isFollow: false,
    target:'',
    rotationOffset:-90,
    heightOffset:4,
    acceleration: 0.05,
    speed:10,
    distance:10,

}

var v;

view = {

    byName: {},

    update: function(){

    },

    getBody: function () {
        return bodys;
    },

    getEnvMap: function () {
        return envmap;
    },

	render: function ( stamp ) {

		requestAnimationFrame( view.render );

        TWEEN.update();

        //user.update(); // gamepad

		if( isNeedUpdate ){

            view.update();

			view.bodyStep( Ar, ArPos[0] );
            view.follow();
			isNeedUpdate = false;

		}

		renderer.render( scene, camera );

        time = stamp === undefined ? now() : stamp;
        if ( (time - 1000) > temp ){ temp = time; fps = count; count = 0; }; count++;

	},

    needUpdate: function ( b ){ isNeedUpdate = b; },

    testMobile: function () {

        var n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) return true;
        else return false;  

    },

	init: function ( callback ) {

        isMobile = view.testMobile();

        canvas = document.createElement("canvas");
        canvas.style.cssText = 'position: absolute; top:0; left:0; pointer-events:auto; width:100%; height:100%';
        canvas.oncontextmenu = function(e){ e.preventDefault(); };
        canvas.ondrop = function(e) { e.preventDefault(); };
        document.body.appendChild( canvas );

        debug = document.createElement("div");
        debug.style.cssText = 'position: absolute; bottom:10px; left:10px; pointer-events:auto; width:200px; height:20px; color:#00FF00; ';
        document.body.appendChild( debug );

        // overwrite shadowmap code
        /*var shader = THREE.ShaderChunk.shadowmap_pars_fragment;
        shader = shader.replace( '#ifdef USE_SHADOWMAP', THREE.ShadowPCSS );
        shader = shader.replace( '#if defined( SHADOWMAP_TYPE_PCF )',[ "return PCSS( shadowMap, shadowCoord );", "#if defined( SHADOWMAP_TYPE_PCF )"].join( "\n" ) );
        THREE.ShaderChunk.shadowmap_pars_fragment = shader;*/

        renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias: isMobile ? false : true, alpha:false });
        renderer.setClearColor( bg, 1 );
        renderer.setPixelRatio( isMobile ? 1 : window.devicePixelRatio );

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 60 , 1 , 1, 1000 );
        camera.position.set( 0, 15, 30 );

        // for camera control
        cam.v = new THREE.Vector3();
        cam.s = new THREE.Spherical();

        controler = new THREE.OrbitControls( camera, canvas );
        controler.target.set( 0, 0, 0 );
        controler.enableKeys = false;
        //controler.update();

        

        followGroup = new THREE.Group();
        scene.add(followGroup);

        extraMesh = new THREE.Group();
        scene.add( extraMesh );

        loader = new THREE.TextureLoader();

        envmap = loader.load( './assets/textures/chrome.jpg' );
        envmap.mapping = THREE.SphericalReflectionMapping;

        //var mapCar = loader.load( './assets/textures/cars.png' );
        //mapCar.flipY = false;

        //var map = loader.load( './assets/textures/check.jpg' );

        geo = {

        	plane:      new THREE.PlaneBufferGeometry(1,1,1,1),
            box:        new THREE.BoxBufferGeometry(1,1,1),
            hardbox:    new THREE.BoxBufferGeometry(1,1,1),
            cone:       new THREE.CylinderBufferGeometry( 0,1,0.5, 18 ),
            wheel:      new THREE.CylinderBufferGeometry( 1,1,1, 18 ),
            sphere:     new THREE.SphereBufferGeometry( 1, 32, 24 ),//new THREE.SphereBufferGeometry( 1, 16, 12 ),
            //highsphere: new THREE.SphereBufferGeometry( 1, 32, 24 ),
            cylinder:   new THREE.CylinderBufferGeometry( 1,1,1,12,1 ),

        }

        

        mat = {

            statique: new THREE.MeshStandardMaterial({ color:0x333344, name:'statique', wireframe:false, transparent:true, opacity:0.2, depthTest:true, depthWrite: false, shadowSide:false }),
            plane: new THREE.MeshBasicMaterial({ color:0x111111, name:'plane', wireframe:true }),
            move: new THREE.MeshStandardMaterial({ color:0x999999, name:'move', wireframe:false, envMap:envmap, metalness:0.6, roughness:0.2, shadowSide:false }),
            sleep: new THREE.MeshStandardMaterial({ color:0x129317, name:'sleep', wireframe:false, envMap:envmap, metalness:0.6, roughness:0.2, shadowSide:false }),

            kinematic: new THREE.MeshStandardMaterial({ name:'kinematic', color:0xAA9933, envMap:envmap, shadowSide:false }),//, transparent:true, opacity:0.6

            //moveCar: new THREE.MeshStandardMaterial({ color:0x999999, map:mapCar, name:'moveCar', wireframe:false, envMap:envmap, metalness:0.6, roughness:0.2 }),
            //sleepCar: new THREE.MeshStandardMaterial({ color:0x129317, map:mapCar, name:'sleepCar', wireframe:false, envMap:envmap, metalness:0.6, roughness:0.2 }),
            //terrain: new THREE.MeshLambertMaterial({ color:0x9999EE, vertexColors: THREE.VertexColors, name:'terrain', wireframe:false }),//, side: THREE.DoubleSide, side:THREE.BackSide

        }

        geo.plane.rotateX( -Math.PI90 );
        geo.plane.rotateY( Math.PI90 );

        this.addTone();
        this.addLights();
        this.addShadow();

        // GROUND

        //helper = new THREE.GridHelper( 50, 20, 0x444444, 0x333333 );
        helper = new THREE.GridHelper( 40, 16, 0x111111, 0x050505 );
        helper.position.y = -0.001;
        scene.add( helper );
        //helper.visible = false;

        

        this.resize();

        window.addEventListener( 'resize', view.resize, false );

        this.render(1);

        //requestAnimationFrame( view.render );

        //this.load ( 'basic', callback );

        callback();
    },

    tell: function ( s ) {
        debug.textContent = s;
    },

    loadTexture: function ( name ){

        return loader.load( './assets/textures/'+ name );

    },

    getGeo: function () {
        return geo;
    },

    //--------------------------------------
    //
    //   LOAD SEA3D
    //
    //--------------------------------------

    load: function( Urls, Callback ){

        if ( typeof Urls == 'string' || Urls instanceof String ) urls.push( Urls );
        else urls = urls.concat( Urls );

        callback_load = Callback || function(){};

        view.load_sea( urls[0] );

    },

    load_next: function () {

        urls.shift();
        if( urls.length === 0 ) callback_load();
        else view.load_sea( urls[0] );

    },

    load_sea: function ( n ) {

        var l = new THREE.SEA3D();

        l.onComplete = function( e ) {

            results[ n ] = l.meshes;

            var i = l.geometries.length, g;
            while( i-- ){
                g = l.geometries[i];
                geo[ g.name ] = g;

                if(g.name==='wheel'){

                    geo['wheelR'] = geo.wheel.clone();
                    geo.wheel.rotateY( -Math.PI90 );
                    geo.wheelR.rotateY( Math.PI90 );

                }
            };

            view.load_next();

        };

        l.load( './assets/models/'+ n +'.sea' );

    },

    getResult : function(){

        return results;

    },

    load_bvh: function ( file, callback ) {

        var bvhLoader = new THREE.BVHLoader();
        var xml = new XMLHttpRequest();
        xml.responseType = 'arraybuffer';

        xml.onload = function (  ) {

            callback( bvhLoader.parse( SEA3D.File.LZMAUncompress( xml.response ) ) );

        }

        xml.open( 'GET', './assets/bvh/'+ file +'.z', true );
        xml.send( null );

    },

    resize: function () {

        vs.h = window.innerHeight;
        vs.w = window.innerWidth - vs.x;

        canvas.style.left = vs.x +'px';
        camera.aspect = vs.w / vs.h;
        camera.updateProjectionMatrix();
        renderer.setSize( vs.w, vs.h );

        if( editor ) editor.resizeMenu( vs.w );

    },

    setLeft: function ( x ) { vs.x = x; },

    getFps: function () { return fps; },

    hideGrid: function(){

        if( helper.visible ){ helper.visible = false; if( shadowGround !== null )shadowGround.visible = false; }
        else{ helper.visible = true; if( shadowGround !== null )shadowGround.visible = true; }

    },

    addTone : function( o ) {

        o = o || {};

        var toneMappings = {
            None: THREE.NoToneMapping,
            Linear: THREE.LinearToneMapping,
            Reinhard: THREE.ReinhardToneMapping,
            Uncharted2: THREE.Uncharted2ToneMapping,
            Cineon: THREE.CineonToneMapping
        };

        //renderer.physicallyCorrectLights = true;
        renderer.gammaInput = o.gammaInput !== undefined ? o.gammaInput : true;
        renderer.gammaOutput = o.gammaOutput !== undefined ? o.gammaOutput : true;

        renderer.toneMapping = toneMappings[ o.tone !== undefined ? o.tone : 'Uncharted2' ];
        renderer.toneMappingExposure = o.exposure !== undefined ? o.exposure : 2.0;
        renderer.toneMappingWhitePoint = o.whitePoint !== undefined ? o.whitePoint : 3.0;

    },

    getSun: function (){
        return light.position.clone().normalize();
    },

    addLights: function(){

        light = new THREE.DirectionalLight( 0xffffff, 1.2 );//new THREE.SpotLight( 0xffffff, 2 )//
        //light.power = 25000;
        light.position.set( 0, 70, 10 );
        light.lookAt( new THREE.Vector3() );
        //light.angle = Math.PI / 3;
        //light.penumbra = 0.05;
        //light.decay = 2;
        //light.distance = 150;
        
       //light.lookAt( followGroup.position );

        followGroup.add( light );

        var lightGeometry = new THREE.SphereGeometry( 0.2 );

        var lightMaterial = new THREE.MeshStandardMaterial({
            emissive: 0xffffee,
            emissiveIntensity: 1,
            color: 0x000000
        });

        var pl1 = new THREE.PointLight( 0xffffff, 1, 150, 2 );//new THREE.SpotLight( 0x3333cc, 0.8 );//;
        //pl1.power = 17000;
        pl1.position.set( 0, 70, 10 );
        pl1.add(new THREE.Mesh(lightGeometry, lightMaterial));
        followGroup.add( pl1 );

        /*var pl2 = new THREE.PointLight( 0xffeedd, 0.3, 130 );
        pl2.position.set( -10, -50, 79 );
        //pl2.position.multiplyScalar( 10 )
        scene.add( pl2 );*/

        ambient = new THREE.HemisphereLight( 0x303F9F, 0x000000, 1 )//new THREE.AmbientLight( bg );
        followGroup.add( ambient );

    },

    addShadow: function(){

       if( isWithShadow ) return;

        isWithShadow = true;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.soft = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        //renderer.shadowMap.renderReverseSided = false;

      
        var planemat = new THREE.ShadowMaterial({opacity:0.4});//ShaderMaterial( THREE.ShaderShadow );
        shadowGround = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 200, 1, 1 ), planemat );
        shadowGround.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
        shadowGround.castShadow = false;
        shadowGround.receiveShadow = true;
        scene.add( shadowGround );

        light.castShadow = true;
        /*var d = 100;
        var camShadow = new THREE.OrthographicCamera( d, -d, d, -d,  1, 100 );LightShadow( camShadow );*/
        //light.shadow = new THREE.SpotLightShadow()

        var d = 100;
        var camShadow = new THREE.OrthographicCamera( d, -d, d, -d,  1, 100 );
        light.shadow = new THREE.LightShadow( camShadow );

        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        /*light.shadow.camera.fov = 2 * light.angle * Math.todeg;
        light.shadow.camera.far = light.distance;
        light.shadow.camera.near = 10;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.bias = 0.001;*/

       // followGroup.add( new THREE.SpotLightHelper( light ));//new THREE.CameraHelper( light.shadow.camera ) );


    },

    

    needFocus: function () {

        canvas.addEventListener('mouseover', editor.unFocus, false );

    },

    haveFocus: function () {

        canvas.removeEventListener('mouseover', editor.unFocus, false );

    },

    //--------------------------------------
    //
    //   ADD
    //
    //--------------------------------------

    

    vehicle: function ( o ) {

        var set = {
            name: o.name || 'car',
            w_radius: o.w_radius || 0.3,
            w_pos: o.w_pos || [1, -0.45, 1.1 ],
            w_density: o.w_density || 10,
            w_friction: o.w_friction || 500,
            soft_cfm: o.soft_cfm || 0.001,
            soft_erp: o.soft_erp || 0.5,
            size: o.size || [ 2.4, .5, 1.4 ],
            pos: o.pos || [0, 2.95, 10],
            density: o.density || 500,
            friction: o.friction || 500,
        }

        var wheels_pos = [
            [set.pos[0]+set.w_pos[0], set.pos[1]+set.w_pos[1], set.pos[2]+set.w_pos[2]],
            [set.pos[0]+set.w_pos[0], set.pos[1]+set.w_pos[1], set.pos[2]-set.w_pos[2]],
            [set.pos[0]-set.w_pos[0], set.pos[1]+set.w_pos[1], set.pos[2]+set.w_pos[2]],
            [set.pos[0]-set.w_pos[0], set.pos[1]+set.w_pos[1], set.pos[2]-set.w_pos[2]]
        ];

        this.add({ type:'box', name:set.name+'_body', size:set.size, pos:set.pos, density:set.density, noPhy:true });

        for (var i=0; i<4; i++ ){
            //this.add( {type: 'sphere', name:set.name+'_w'+i, size:[set.w_radius, set.w_radius, set.w_radius ], pos:wheels_pos[i], density:set.w_density, noPhy:true });
            this.add( {type: i % 2 == 0 ?'wheel':'wheelR', name:set.name+'_w'+i, size:[set.w_radius, set.w_radius, set.w_radius ], pos:wheels_pos[i], density:set.w_density, noPhy:true });
        }

        // send to worker
        oimo.send( 'vehicle', o );

    },

    joint: function ( o ) {

        o = o || {};

        /*if( o.b1 == undefined ) console.log( '!! body1 name not define' );
        if( o.b2 == undefined ) console.log( '!! body1 name not define' );

        o.type = o.type == undefined ? 'hinge' : o.type;
        o.pos1 = o.pos1 == undefined ? [0,0,0] : o.pos1;
        o.pos2 = o.pos2 == undefined ? [0,0,0] : o.pos2;

        o.axe = o.axe == undefined ? [1,0,0] : o.axe;
        o.axe1 = o.axe1 == undefined ? [1,0,0] : o.axe1;
        o.axe2 = o.axe2 == undefined ? [1,0,0] : o.axe2;

        o.param = o.param == undefined ? [] : o.param;*/

        oimo.send( 'joint', o );

    },

    add: function ( o ) {

        var i, j, n, lng, lng2, g, mesh, m, material, needScale=true;

    	o = o || {};

        // local position rotation or shape
        o.Rpos = o.Rpos || [];
        o.Rrot = o.Rrot || [];

        var type = o.type || "box";
        if( type.constructor === String ) type = [ type ];

    	o.density = o.density === undefined ? 0 : o.density;
        //o.type = o.type == undefined ? 'box' : o.type;

        // position
        o.pos = o.pos === undefined ? [0,0,0] : o.pos;

        

        // rotation is in degree
        var rot = o.rot === undefined ? [0,0,0] : Math.vectorad(o.rot);
        o.quat = new THREE.Quaternion().setFromEuler( new THREE.Euler().fromArray( rot ) ).toArray();

        // size

        if( o.Rsize === undefined ){

            var size = o.size === undefined ? [1,1,1] : o.size;
            if( size[0].constructor !== Array ){ 
                o.Rsize = [];
                lng = size.length;
                //console.log( lng )
                if( lng === 1 ) o.Rsize.push([ size[0], size[0], size[0] ]);
                else if( lng === 2 ) o.Rsize.push([ size[0], size[1], size[0] ]);
                else if( lng > 2 ){
                    i = Math.floor(lng / 3);
                    for( var j = 0; j<i; j++){
                        n = j*3;
                        o.Rsize.push( [size[n], size[n+1] , size[n+2]] );
                    }
                }
            }

        }

        //onsole.log( o.Rsize )

        /*if( o.type === 'plane' ){
            this.makePlane( o ); 
            return;
        }*/

        /*if( o.type === 'terrain' ){
            this.terrain( o ); 
            return;
        }

        if( o.type === 'planet' ){
            this.planet( o ); 
            return;
        }

        if( o.type === 'mesh' ){
            this.trimesh( o ); 
            oimo.send( 'add', o )
            return;
        }

        */


        //if( o.type === 'plane' ) o.material = 'plane';
        //if( o.density === 0 && o.type==='box' ) o.type = 'hardbox';

        if(o.material !== undefined) material = mat[o.material];
        else material = o.density ? mat.move : mat.statique;


        /*if( type.length > 1 ){
            mesh = new THREE.Group();
            
            }
        } else {*/

        lng = type.length;

        for( var i = 0; i < lng; i++ ){

            if( type[i] === 'capsule' ){

                g = new THREE.CapsuleBufferGeometry( o.Rsize[i][0], o.Rsize[i][1] );
                extraGeo.push(g);
                needScale = false;

            } else if(type[i] === 'plane'){

                o.v = [];
                g = new THREE.PlaneBufferGeometry();
                var v = g.attributes.position.array;
                var lx = 1, lz = 1;
                lng2 = 4;
                for( j = 0; j<lng2; j++){

                    if(j===0) { lx=1; lz=-1; }
                    if(j===1) { lx=1; lz=1; }
                    if(j===2) { lx=-1; lz=-1; }
                    if(j===3) { lx=-1; lz=1; }
                    n = j*3;
                    v[n] = o.Rsize[i][0]*lx; v[n+1] = 0; v[n+2] = o.Rsize[i][2]*lz;
                    o.v.push( new THREE.Vector3( v[n], v[n+1], v[n+2] ));

                }

                o.margin = 0;

                material = mat.plane;

                needScale = false;

            } else if(type[i] === 'convex'){

                o.v = [];
                lng2 = o.vertices.length / 3, n=0;
                for( j = 0; j<lng2; j++){
                    n = j*3;

                    o.v.push( new THREE.Vector3( o.vertices[n], o.vertices[n+1], o.vertices[n+2] ));

                }

                g = new THREE.ConvexGeometry( o.v );
                extraGeo.push(g);

                needScale = false;

            } else {
                g = geo[type[i]];
            }

            m = new THREE.Mesh( g, material );
            //if( o.type === 'plane' )  o.size = [10,10,10];
            if( needScale ) m.scale.fromArray( o.Rsize[i] ) //[ o.size[n], o.size[n+1], o.size[n+2] ] );


            // shape position
            if( o.Rpos[i] !== undefined ) m.position.fromArray( o.Rpos[i] );
            // shape rotation
            if( o.Rrot[i] !== undefined ) m.quaternion.setFromEuler( new THREE.Euler().fromArray( Math.vectorad( o.Rrot[i] )));
            

            if( o.density !== 0  ) m.castShadow = true;
            m.receiveShadow = true;

            if( lng === 1 ){
                mesh = m;
                
            }else{
                if(i===0) mesh = new THREE.Group();
                mesh.add(m);
            } 
        }

        

        mesh.position.fromArray( o.pos );
        mesh.quaternion.fromArray( o.quat );

        if( o.name === undefined ) o.name =  o.density !== 0 ? 'b'+ bodys.length : 'f'+ solids.length; 
        mesh.name = o.name;

        //if( o.parent !== undefined ) o.parent.add( mesh );
        //else 
        scene.add( mesh );


        if( o.density !== 0  ) bodys.push( mesh );
        else solids.push( mesh );

        if( o.name ) this.byName[ o.name ] = mesh;

        //if( o.type === 'dice' ) o.type = 'box';
        //if( o.type === 'hardbox' ) o.type = 'box';
        

        // send to worker
        if( o.noPhy === undefined ) oimo.send( 'add', o );

        

    },

    makePlane: function ( o ) {

        /*o.v = [];
        var lng = o.vertices.length / 3, n=0;
        for( var i = 0; i<lng; i++){
            n = i*3;
            o.v.push( new THREE.Vector3( o.vertices[n], o.vertices[n+1], o.vertices[n+2] ));
        }

        var geometry = new THREE.ConvexGeometry( o.v );*/

        var geometry = new THREE.PlaneBufferGeometry();
        //geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI*0.5));
        //geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
        
        //geometry.applyMatrix(new THREE.Matrix4().makeScale(1,-1,-1));
        //geometry.applyMatrix(new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler(-Math.PI*0.5, Math.PI*0.5, 0) ));
        //geometry.index.array = [2, 0, 3, 0, 1, 3]

        var v = geometry.attributes.position.array;

        var i = o.vertices.length
        while(i--){
            v[i] = o.vertices[i];
        }

      // console.log(geometry)

        //geometry.attributes.position.needsUpdate = true;

        if(o.material !== undefined) material = mat[o.material];
        else material = o.density ? mat.move : mat.statique;

        material.wireframe = true
        material.opacity = 1;

        var mesh = new THREE.Mesh( geometry, material );

        mesh.receiveShadow = true;
        mesh.castShadow = true;

        scene.add( mesh );

        mesh.position.fromArray( o.pos );
        mesh.quaternion.fromArray( o.quat );

        if( o.density !== 0  ) bodys.push( mesh );
        else solids.push( mesh );

        o.type = 'mesh';
        oimo.send( 'add', o );

        /*o.geometry = geometry;//.clone();
            //o.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI*0.5));
            //o.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
            //o.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(o.pos[0], o.pos[1], o.pos[2]));
            //o.type = 'mesh';
            o.notAdd = true;
            this.trimesh( o );
            //return;*/

    },

    mergeMesh: function(geos){

        var tmp = [];
        var i = geos.length;
        while(i--){
            tmp[i] = new THREE.Geometry().fromBufferGeometry( geos[i] );
            //tmp[i].mergeVertices();
        }

        var g = new THREE.Geometry();

        while( tmp.length > 0 ){
            i = tmp.pop();
            g.merge(i);
            i.dispose();
        }

        g.mergeVertices();

        var geometry = new THREE.BufferGeometry().fromGeometry( g );
        g.dispose();

        return geometry;

    },

    trimesh: function ( o ) {

        /*if(o.vertices !== undefined ){
            o.geometry = new THREE.BufferGeometry();
           // o.geometry.index = [0,1,2,  3]
            var positions = new THREE.Float32BufferAttribute( o.vertices.length, 3 );
            positions.array = o.vertices;
            o.geometry.addAttribute( 'position', positions );
            console.log(o.geometry)
            //o.geometry.attributes.position.array = o.vertices;

            o.geometry = new THREE.Geometry().fromBufferGeometry( o.geometry  );
            /*var lng = o.vertices.length / 3, n=0;
            for( var i = 0; i<lng; i++ ){
                n = i*3;
                o.geometry.vertices.push( new THREE.Vector3( o.vertices[n], o.vertices[n+1], o.vertices[n+2] ));
            }
            //o.geometry.addFace(0,1,2,0)
            //o.geometry.addFace(1,2,3,0)
            o.geometry.computeVertexNormals()*/
        //} else {
            if( !o.geometry ) return
            view.getGeomtryInfo( o );
        //}

        if(o.notAdd===undefined){

            var material;
            if(o.material !== undefined) material = mat[o.material];
            else material = o.density ? mat.move : mat.statique;

            mesh = new THREE.Mesh( o.geometry, material );

            console.log('added')
            
            mesh.scale.fromArray( o.size );
            mesh.position.fromArray( o.pos );
            mesh.quaternion.fromArray( o.quat );

            mesh.receiveShadow = true;
            mesh.castShadow = true;

            scene.add( mesh );

            if( o.density !== 0  ) bodys.push( mesh );
            else solids.push( mesh );

        }

        if( o.geometry ) delete( o.geometry );
        if( o.model ) delete( o.model );

        oimo.send( 'add', o );

    },

    updateTerrain: function (name){

        var t = this.byName[ name ];

        if(t.isWater){ t.local.y +=0.2; t.update() }
        else t.easing();

        var o = {
            name:name,
            heightData: t.heightData
        }

        oimo.send( 'terrain', o );

    },

    planet: function ( o ) {

        var mesh = new Planet( o );

        scene.add( mesh );
        solids.push( mesh );

        o.geometry = mesh.geometry;
        o.type = 'mesh'
        this.trimesh( o );

    },

    terrain: function ( o ) {

        o.sample = o.sample == undefined ? [64,64] : o.sample;
        o.pos = o.pos == undefined ? [0,0,0] : o.pos;
        o.complexity = o.complexity == undefined ? 30 : o.complexity;

        var mesh = new Terrain( o, mat.terrain );

        mesh.position.fromArray( o.pos );

        //mesh.castShadow = false;
        //mesh.receiveShadow = true;

        scene.add( mesh );
        solids.push( mesh );

        /// trimesh test
        if(o.toTri){
            o.geometry = mesh.geometry;//.clone();
            //o.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI*0.5));
            //o.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
            //o.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(o.pos[0], o.pos[1], o.pos[2]));
            //o.type = 'mesh';
            o.notAdd = true;
            this.trimesh( o );
            return;
        }

        o.heightData = mesh.heightData;

        o.offset = 0;

        o.rot = [-90,0,0];
        o.rot = Math.vectorad(o.rot);
        o.quat = new THREE.Quaternion().setFromEuler( new THREE.Euler().fromArray( o.rot ) ).toArray();

        if( o.name ) this.byName[ o.name ] = mesh;

        // send to worker
        oimo.send( 'add', o );

    },

    bodyStep: function( AR, N ){

    	if( !bodys.length ) return;

        var i;

        bodys.forEach( function( b, id ) {

            var n = N + ( id * 8 );

            var s = AR[n];

            b.position.fromArray( AR, n + 1 );
            b.quaternion.fromArray( AR, n + 4 );

            if ( s === 0 ) { // actif

                if(!b.isGroup){
                    if ( b.material.name == 'sleep' ) b.material = mat.move;
                    if ( b.material.name == 'sleepCar' ) b.material = mat.moveCar;
                }else{
                    if ( b.children[0].material.name == 'sleep' ){ i = b.children.length; while (i--) b.children[i].material = mat.move; }
                }

                
                
                //b.position.fromArray( AR, n + 1 );
                //b.quaternion.fromArray( AR, n + 4 );

            } else {
                if(!b.isGroup){
                    if ( b.material.name == 'move' ) b.material = mat.sleep;
                    if ( b.material.name == 'moveCar' ) b.material = mat.sleepCar;
                }else{
                    if ( b.children[0].material.name == 'move' ){ i = b.children.length; while (i--) b.children[i].material = mat.sleep; }
                }
            }
        });


    },

    addMesh: function ( m ) {

        extraMesh.add( m );

    },

    reset: function () {

        isNeedUpdate = false;

        helper.visible = true;
        if( shadowGround !== null ) shadowGround.visible = true;

        while( extraMesh.children.length > 0 ) scene.remove( extraMesh.children.pop() );

        while( extraGeo.length > 0 ) extraGeo.pop().dispose();

        while( bodys.length > 0 ) scene.remove( bodys.pop() );
        while( solids.length > 0 ) scene.remove( solids.pop() );
        while( terrains.length > 0 ) scene.remove( terrains.pop() );

        view.update = function () {};
        view.byName = {};
        cam.target = '';

    },

    getGeomtryInfo: function ( o ) {

        var rev = o.Revers !== undefined ? o.Revers : false;

        var isBufferGeo = false;

        //if(o.geometry instanceof THREE.Geometry) console.log( 'is geometry')
        if(o.geometry instanceof THREE.BufferGeometry) isBufferGeo = true;

        var tmpGeo = isBufferGeo ? new THREE.Geometry().fromBufferGeometry( o.geometry ) : o.geometry;

        // remove duplicate
        if( isBufferGeo ) tmpGeo.mergeVertices();

        var numVertices = tmpGeo.vertices.length;
        var numFaces = tmpGeo.faces.length;

        //o.faces = tmpGeo.faces;

        o.vertices = new Float32Array( numVertices * 3 );
        o.indices = new Int32Array( numFaces * 3 );

        var i = numVertices, n, p;
        while(i--){
            p = tmpGeo.vertices[ i ];
            n = i * 3;
            o.vertices[ n ] = p.x;
            o.vertices[ n + 1 ] = rev ? p.z : p.y;
            o.vertices[ n + 2 ] = rev ? p.y : p.z;
        }

        i = numFaces;
        while(i--){
            p = tmpGeo.faces[ i ];
            n = i * 3;
            o.indices[ n ] = p.a;
            o.indices[ n + 1 ] = rev ? p.c : p.b;
            o.indices[ n + 2 ] = rev ? p.b : p.c;
        }

        console.log(o.vertices)

        if( isBufferGeo ) tmpGeo.dispose();

    },

    motion: function (o) {
        if(view.byName[ o.name ]){
            view.byName[ o.name ].position.fromArray(o.v);
            oimo.send( 'motion', o );
        }
    },

    //--------------------------------------
    //
    //   CAMERA AUTO CONTROL
    //
    //--------------------------------------

    updateFollowGroup: function(){

    	followGroup.position.set( controler.target.x, 0, controler.target.z );

    },

    setFollow: function( name ){

        cam.target = name;

    },

    follow: function () {

        if(!cam.target) return;
        if(!view.byName[ cam.target ]) return;

        view.stopMoveCam();

        controler.enabled = false;
        cam.isFollow = true;

        var target = view.byName[ cam.target ];
        var rotMatrix = new THREE.Matrix4().makeRotationFromQuaternion( target.quaternion );
        var yRotation = Math.atan2( rotMatrix.elements[8], rotMatrix.elements[10] );

        var radians = ( cam.rotationOffset * Math.torad ) + yRotation;

        cam.v.copy( target.position );
        cam.v.add( { x:Math.sin(radians) * cam.distance, y:cam.heightOffset, z:Math.cos(radians) * cam.distance });
        cam.v.sub( camera.position );
        cam.v.multiply( { x:cam.acceleration * 2, y:cam.acceleration, z:cam.acceleration * 2 } );

        var v = cam.v;

        if (v.x > cam.speed || v.x < -cam.speed) v.x = v.x < 0 ? -cam.speed : cam.speed;
        if (v.y > cam.speed || v.y < -cam.speed) v.y = v.y < 0 ? -cam.speed : cam.speed;
        if (v.z > cam.speed || v.z < -cam.speed) v.z = v.z < 0 ? -cam.speed : cam.speed;
        

        camera.position.add(cam.v);
        controler.target.copy( target.position );
        camera.lookAt( controler.target );

        view.updateFollowGroup();

    },

    stopMoveCam: function (){

        if( cameraTween !== null ){
            TWEEN.remove( cameraTween );
            cameraTween = null;
        }

    },

    moveCam: function ( o, callback ) {

        if( o.constructor === Array ){ 
           //var t = o;
            var tmp = {};

            if(o[0]) tmp.azim = o[0];
            if(o[1]) tmp.polar = o[1];
            if(o[2]) tmp.distance = o[2];
            if( o[3] ){
                tmp.x = o[3][0];
                tmp.y = o[3][1];
                tmp.z = o[3][2];
            }

            o = tmp;

        }

    	o.x = o.x !== undefined ? o.x : 0;
    	o.y = o.y !== undefined ? o.y : 0;
    	o.z = o.z !== undefined ? o.z : 0;

    	o.phi = o.phi !== undefined ? o.phi : 0;
    	o.theta = o.theta !== undefined ? o.theta : 0;

    	o.phi = o.polar !== undefined ? o.polar : o.phi;
    	o.theta = o.azim !== undefined ? o.azim : o.theta;
    	
        controler.enabled = false;
        var c = view.getCurrentPosition();

        if( o.time === 0 ){

            for( var n in o ) c[n] = o[n];
            view.stopMoveCam();
            view.orbit( c );
            controler.enabled = isMouseMove;
            return;

        }

        callback = callback || function(){};

        cameraTween = new TWEEN.Tween( c ).to( o, o.time || 2000 )
            .delay( o.delay || 0 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .onUpdate( function() { view.orbit( c ); } )
            .onComplete( function() { controler.enabled = isMouseMove;  callback(); } )
            .start();

    },

    orbit: function ( o ) {

    	cam.s.set( o.distance, (-o.phi+90) * Math.torad, o.theta * Math.torad );
    	cam.s.makeSafe();

        controler.target.set( o.x, o.y, o.z );
        camera.position.copy( controler.target );
        camera.position.setFromSpherical( cam.s );
        camera.lookAt( controler.target );

        view.updateFollowGroup();

    },

    getCurrentPosition: function () {

        var t = controler.target;
        var c = camera.position;
        return {
            x:t.x, y:t.y, z:t.z, 
            distance: Math.floor( c.distanceTo( t ) ), 
            phi: -Math.floor( controler.getPolarAngle() * Math.todeg )+90,
            theta: Math.floor( controler.getAzimuthalAngle() * Math.todeg ) 
        };

    },

    getControls: function () {
        return controler;
    },

}

return view;

})();

