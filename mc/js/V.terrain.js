/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

V.Terrain = function(Parent, obj){
    this.tween = null;
    this.root = Parent;
    this.debug = obj.debug || false;

    obj = obj || {};

    this.div = obj.div || [256,256];
    //this.div = obj.div || [512,512];
    this.size = obj.size || [50, 10, 50];

    this.r = 1;
    //this.size = obj.size || [256, 30, 256];
    this.isAutoMove = obj.AutoMove || false;
    this.isMove = obj.Move || false;

    this.ratio = 0;
    this.hfFloatBuffer = null;

    this.videoTexture = null;


    this.mapOffset = obj.offset || 4;
    //this.noisePower = obj.noisePower || 0.3;
    
    //this.colors = [0x505050, 0x707050, 0x909050, 0xAAAA50, 0xFFFF50];

    //this.bumpTexture = new THREE.Texture();

    this.heightMap = null;
    this.normalMap = null;
    this.specularMap = null;

    this.mlib = {};
    this.textureCounter=0;

    this.sceneRenderTarget = null;
    this.cameraOrtho = null;

    
    
    this.W = 0;
    this.H = 0;

    this.quadTarget = null;

    this.animDelta = 0;
    this.animDeltaDir = 0;//-1;
    //this.lightVal = 0;
    //this.lightDir = 1;
    this.pos = {x:0, y:0};
    this.ease = {x:0, y:0};

    this.maxspeed = 2;
    this.acc = 0.1;
    this.dec = 0.1;

    this.updateNoise = true;

    this.noiseShader = null;
    this.normalShader = null;
    this.specularShader = null;
    this.terrainShader = null;

    this.tmpData = null;

    this.isWithDepthTest = true;

    this.textures = [];

    this.maps = ['fog_mask.png', 'tx1.png', 'tx2.png', 'tx1_n.png', 'tx2_n.png', 'gg1.jpg'];

    this.fullLoaded = false;
    this.timerTest = null;

    this.hset = false;

    this.end = null;
    this.debugTerrain = false;

    this.deepMap = null;

    this.loaded = false;

    //this.init();

}

V.Terrain.prototype = {
    constructor: V.Terrain,
    load:function(endFunction){
        this.end = endFunction;
        var PATH = 'textures/';
        var i = this.maps.length;
        while(i--){
            this.textures[i] = new THREE.ImageUtils.loadTexture( PATH + this.maps[i] );
        }
        this.timerTest = setInterval(function(){ this.testTextures(); }.bind(this), 20);
    },
    testTextures:function () {
        if ( this.textures.length == this.maps.length)  {
            clearInterval(this.timerTest);
            var i = this.textures.length;
            while(i--){
                this.textures[i].format = THREE.RGBFormat;
                this.textures[i].wrapS = this.textures[i].wrapT = THREE.RepeatWrapping;
            }
            //this.start();
            this.loaded = true;
        }
    },
    clear:function () {
        this.sceneRenderTarget.remove( this.cameraOrtho );
        this.sceneRenderTarget.remove( this.quadTarget );
        this.quadTarget.geometry.dispose();

        this.sceneRenderTarget = null;
        this.cameraOrtho = null;
        this.quadTarget = null;


        this.container.remove(this.mesh);
        this.mesh.geometry.dispose();

        for(var o in this.mlib)this.mlib[o].dispose();
        this.mlib = {};

        this.heightMap.dispose();
        this.normalMap.dispose();
        this.specularMap.dispose();
        this.heightMap = null;
        this.normalMap = null;
        this.specularMap = null;
        this.tmpData = null;
    },
    init:function () {

        this.ratio = -this.size[1]/255;//765;
        this.hfFloatBuffer = new Float32Array(this.div[0]*this.div[1]);
            
        var geo = new THREE.PlaneBufferGeometry(this.size[0], this.size[2], this.div[0]-1, this.div[1]-1);

       
        this.mesh = new THREE.Mesh( geo, new THREE.MeshBasicMaterial( { color:0xFF5555 } ) );
        this.mesh.rotation.x = -Math.PI / 2;
        //this.mesh.position.y = -this.size[1];
        this.mesh.geometry.computeTangents();
        this.mesh.geometry.dynamic = true;

         var vertices = this.mesh.geometry.attributes.position.array;
        this.vlength = vertices.length/3;

        this.mesh.visible = false;

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.container = new THREE.Group();
        this.container.add(this.mesh);

        this.root.scene.add(this.container);

        this.W = this.root.dimentions.w || 512;
        this.H = this.root.dimentions.h || 512;

        this.start();
        //this.load();

        if(this.debug){
            var geod = new THREE.PlaneBufferGeometry(this.size[0]*0.25, this.size[2]*0.25);
            this.m1 = new THREE.Mesh( geod, new THREE.MeshBasicMaterial( { color:0xFFFFFF } ) );
            this.m2 = new THREE.Mesh( geod, new THREE.MeshBasicMaterial( { color:0xFFFFFF } ) );
            this.m3 = new THREE.Mesh( geod, new THREE.MeshBasicMaterial( { color:0xFFFFFF } ) );
            this.container.add(this.m1);
            this.container.add(this.m2);
            this.container.add(this.m3);
            this.m2.position.set(0,0,this.size[0]*0.75);
            this.m1.position.set(-this.size[0]*0.25,0,this.size[0]*0.75);
            this.m3.position.set(this.size[0]*0.25,0,this.size[0]*0.75);
            this.m1.rotation.x = -Math.PI / 4;
            this.m2.rotation.x = -Math.PI / 4;
            this.m3.rotation.x = -Math.PI / 4;
            this.m1.visible = false;
            this.m2.visible = false;
            this.m3.visible = false;
        }

    },
    showHand:function(time, delay){
        this.tween = new TWEEN.Tween( {it:0.0} )
            .to( {it:maxHandDeep} , time*1000 || 1000 )
            .easing( TWEEN.Easing.Linear.None )
            .onUpdate( function () { this.setHandPower(this.it) } )
            .delay( delay*1000 || 0 ).start();
    },
    hideHand:function(time, delay){
        this.tween = new TWEEN.Tween( {it:maxHandDeep} )
            .to( {it:0.0} , time*1000 || 1000 )
            .easing( TWEEN.Easing.Linear.None )
            .onUpdate( function () { this.setHandPower(this.it) } )
            .delay( delay*1000 || 0 ).start();
    },
    setHandPower: function(v){
        shaderNoiseSettings[ 'handPower' ] = v;
        this.noiseShader.uniforms[ 'handPower' ].value = v;//shaderNoiseSettings[ 'handPower' ];
        this.terrainShader.uniforms[ 'handPower' ].value = v;
    },
    matChanger: function(){
        for (var e in shaderTerrainSettings) {
            if (e in this.terrainShader.uniforms)
                this.terrainShader.uniforms[ e ].value = shaderTerrainSettings[ e ];
        }

        for (var e in shaderNoiseSettings) {
            if (e in this.noiseShader.uniforms)
                this.noiseShader.uniforms[ e ].value = shaderNoiseSettings[ e ];
                if(e=='handPower')this.terrainShader.uniforms[ e ].value = shaderNoiseSettings[ e ];
        }
    },
    upColor : function(name){
        if(this.terrainShader.uniforms[name])this.terrainShader.uniforms[name].value.setHex('0x'+colorSettings[name].toString(16));
    },
    moveLight : function(name){
        if(this.terrainShader.uniforms[name]){
            this.terrainShader.uniforms[name].value.set(positionSettings[name+'X'], positionSettings[name+'Y'], positionSettings[name+'Z']);
        }
    },
    applyBaseSetting: function(){
        // color
        for (var e in colorSettings) {
             if(this.terrainShader.uniforms[e])this.terrainShader.uniforms[e].value.setHex('0x'+colorSettings[e].toString(16));
        }
        // position
        for (var e in positionSettings) {
            if(e=='pointPositionX') this.terrainShader.uniforms.pointPosition.value.x = positionSettings[e];
            if(e=='pointPositionY') this.terrainShader.uniforms.pointPosition.value.y = positionSettings[e];
            if(e=='pointPositionZ') this.terrainShader.uniforms.pointPosition.value.z = positionSettings[e];

            if(e=='directDirectionX') this.terrainShader.uniforms.directDirection.value.x = positionSettings[e];
            if(e=='directDirectionY') this.terrainShader.uniforms.directDirection.value.y = positionSettings[e];
            if(e=='directDirectionZ') this.terrainShader.uniforms.directDirection.value.z = positionSettings[e];
        }

    },
    animation:function(){
        if(shaderNoiseSettings.animation) this.animDeltaDir=1;
        else {this.animDeltaDir=0; this.animDelta =0;}
    },
    
    start:function() {

        if(this.isWithDepthTest){
            var size = this.div[0] * this.div[1];
            this.tmpData  = new Uint8Array(size*4);
        }

        this.sceneRenderTarget = new THREE.Scene();

        this.cameraOrtho = new THREE.OrthographicCamera( this.W / - 2, this.W / 2, this.H / 2, this.H / - 2, -10000, 10000 );
        this.cameraOrtho.position.z = 100;
        this.sceneRenderTarget.add( this.cameraOrtho );

        // NORMAL MAPS

        this.normalShader = V.TerrainNormal;

        //var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

        this.heightMap = new THREE.WebGLRenderTarget( this.div[0], this.div[1], pars );
        this.normalMap = new THREE.WebGLRenderTarget( this.div[0], this.div[1], pars );
        this.specularMap = new THREE.WebGLRenderTarget( this.div[0], this.div[1], pars );

        this.heightMap.generateMipmaps = false;
        this.normalMap.generateMipmaps = false;
        this.specularMap.generateMipmaps = false;

        this.normalShader.uniforms.height.value = 0.05;
        this.normalShader.uniforms.resolution.value.set(this.div[0], this.div[1]);
        this.normalShader.uniforms.scale.value.set( 1,1 );
        this.normalShader.uniforms.heightMap.value = this.heightMap;

        // NOISE
        this.noiseShader = V.TerrainNoise;
        // pourcentage de bruit 
        //this.noiseShader.uniforms.noisePower.value = this.noisePower;
        // random start noise
       // this.noiseShader.uniforms.time.value = V.rand(0,10);
        this.noiseShader.uniforms.offset.value.set(V.rand(-100,100), V.rand(-100,100));


        this.specularShader = V.TerrainLuminosity;
        this.specularShader.uniforms.tDiffuse.value = this.normalMap;

        // TERRAIN SHADER

        this.terrainShader = V.TerrainShader;




        this.matChanger();
        this.applyBaseSetting();

        /*for (var e in shaderTerrainSettings) {
            if (e in terrain.terrainShader.uniforms)
                terrain.terrainShader.uniforms[ e ].value = shaderTerrainSettings[ e ];
        }*/

        //this.terrainShader.uniforms[ 'combine' ].value = THREE.MixOperation;
        this.terrainShader.uniforms[ 'env' ].value = this.root.environment;//THREE.ImageUtils.loadTexture( './images/spherical/e_chrome.jpg');
        //this.terrainShader.uniforms[ 'tCube' ].value = this.main.sky;
        //this.terrainShader.uniforms[ 'reflectTop' ].value = 0.6;
        //this.terrainShader.uniforms[ 'reflectBottom' ].value = 0.2;
        //this.terrainShader.uniforms[ 'enableReflection' ].value = true;

        this.deepMap = this.textures[5];
        this.noiseShader.uniforms.heightMap.value = this.deepMap;
        this.terrainShader.uniforms.heightMap.value = this.deepMap;

        this.terrainShader.uniforms[ 'tNormal' ].value = this.normalMap;
        this.terrainShader.uniforms[ 'tDisplacement' ].value = this.heightMap;
        this.terrainShader.uniforms[ 'tSpecular' ].value = this.specularMap;

        this.terrainShader.uniforms[ 'fogmask' ].value = this.textures[0];
        this.terrainShader.uniforms[ 'tDiffuse1' ].value = this.textures[1];
        this.terrainShader.uniforms[ 'tDiffuse2' ].value = this.textures[2];
        
        this.terrainShader.uniforms[ 'tDetail' ].value = this.textures[3];
        this.terrainShader.uniforms[ 'tDetail2' ].value = this.textures[4];

        //this.terrainShader.uniforms[ 'occ1' ].value = this.textures[5];
        //this.terrainShader.uniforms[ 'occ2' ].value = this.textures[6];

        this.terrainShader.uniforms[ 'enableDiffuse1' ].value = true;
        this.terrainShader.uniforms[ 'enableDiffuse2' ].value = true;
        this.terrainShader.uniforms[ 'enableSpecular' ].value = true;

        //this.terrainShader.uniforms[ 'diffuse' ].value.setHex( 0xFFFFFF );
        //this.terrainShader.uniforms[ 'specular' ].value.setHex( 0x808080 );
        //this.terrainShader.uniforms[ 'ambient' ].value.setHex( 0x303030 );

        //this.terrainShader.uniforms[ 'shininess' ].value = 30;

        //this.terrainShader.uniforms[ 'profondeur' ].value = this.size[1];
        this.terrainShader.uniforms[ 'uRepeatOverlay' ].value.set( this.mapOffset, this.mapOffset*this.r );

        this.terrainShader.uniforms[ 'fogcolor' ].value = new THREE.Color( this.root.bgColor );
        

         if(this.debug){
            this.m1.material.map = this.heightMap;
            this.m2.material.map = this.normalMap;
            this.m3.material.map = this.specularMap;
            this.m1.material.needsUpdate = true;
            this.m2.material.needsUpdate = true;
            this.m3.material.needsUpdate = true;
            this.m1.visible = true;
            this.m2.visible = true;
            this.m3.visible = true;
         }

         //THREE.UniformsUtils.clone( terrainShader.uniforms );

        var params = [
            [ 'heightmap',  this.noiseShader.fs, this.noiseShader.vs, this.noiseShader.uniforms, false, this.noiseShader.attributes ],
            [ 'normal',     this.normalShader.fs,  this.normalShader.vs, this.normalShader.uniforms, false, this.normalShader.attributes  ],
            [ 'specular',   this.specularShader.fs,  this.specularShader.vs, this.specularShader.uniforms, false, this.specularShader.attributes  ],
            [ 'terrain',    this.terrainShader.fs, this.terrainShader.vs, this.terrainShader.uniforms, true, this.terrainShader.attributes  ]
        ];

        var material;
        var i = params.length;
        while(i--){
            material = new THREE.ShaderMaterial( {
                uniforms: params[ i ][ 3 ],
                //uniforms: THREE.UniformsUtils.clone(  params[ i ][ 3 ] ),
                //attributes:     params[ i ][ 5 ],
                vertexShader:   params[ i ][ 2 ],
                fragmentShader: params[ i ][ 1 ],
                lights:         false,
                fog:            false,
                } );
            this.mlib[ params[ i ][ 0 ] ] = material;
        }

        this.mlib.terrain.transparent = false;
        this.mlib.terrain.shading  = THREE.FlatShading;
        
        //this.mlib.terrain.wireframe = true;

        

        /*var speed = this.mlib.terrain.attributes.speed.value;
        for ( var i = 0; i < this.vlength; i++ ) {
            speed[ i ] = 0.0;
        }*/

        
        //this.mlib.terrain.attributes.speed.needsUpdate = true;*/
        



        var plane = new THREE.PlaneBufferGeometry( this.W, this.H );

        this.wireterrain = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, wireframe:true } );

        this.quadTarget = new THREE.Mesh( plane, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
        this.quadTarget.position.z = -500;
        this.sceneRenderTarget.add( this.quadTarget );

        this.mlib.terrain.isActive = true;
        if(this.debugTerrain) this.mesh.material = this.wireterrain;
        else this.mesh.material = this.mlib.terrain;
        this.mesh.visible = true;

        //if(env) env.add(terrain.mlib.terrain);

        this.fullLoaded = true;

        this.update();

    },
    
    setTerrainShaderValue:function(name, value){
        this.terrainShader.uniforms[ name ].value = value;
    },
    /*generateData : function (width, height, color) {
        var size = width * height;
        
        var data = new Uint8Array(size*4);

        var r = Math.floor(color.r * 255);
        var g = Math.floor(color.g * 255);
        var b = Math.floor(color.b * 255);

        for (var i = 0; i < size; i++) {
            if (i == size / 2 + width / 2) {
                data[i * 4] = 255;
                data[i * 4 + 1] = g;
                data[i * 4 + 2] = b;
                data[i * 4 + 3] = 255;
            } else {
                data[i * 4] = r;
                data[i * 4 + 1] = g;
                data[i * 4 + 2] = b;
                data[i * 4 + 3] = 255;
            }
        }
        this.tmpData = data;
    },*/
    setHeight:function(heightMap){
        if ( this.fullLoaded && !this.hset) {
            this.noiseShader.uniforms.heightMap.value = heightMap;
            this.terrainShader.uniforms.heightMap.value = heightMap;
            //this.normalShader.uniforms.heightMap.value = heightMap;
            //this.terrainShader.uniforms.tDisplacement.value = heightMap;
            this.hset = true;
        }
    },
    /*easing:function(){

        var key = this.main.nav.key;
        var delta = this.main.clock.getDelta();
        //var r = this.main.nav.cam.horizontal * (Math.PI / 180);
        var r = this.main.nav.cam.theta;

        if(key.shift)this.maxspeed=5;
        else this.maxspeed=1;

        //acceleration
        if (key.up) this.ease.y -= this.acc;
        if (key.down) this.ease.y += this.acc;
        if (key.left) this.ease.x -= this.acc;
        if (key.right) this.ease.x += this.acc;
        //speed limite
        if (this.ease.x > this.maxspeed) this.ease.x = this.maxspeed;
        if (this.ease.y > this.maxspeed) this.ease.y = this.maxspeed;
        if (this.ease.x < -this.maxspeed) this.ease.x = -this.maxspeed;
        if (this.ease.y < -this.maxspeed) this.ease.y = -this.maxspeed;
        //break
        if (!key.up && !key.down) {
            if (this.ease.y > this.dec) this.ease.y -= this.dec;
            else if (this.ease.y < -this.dec) this.ease.y += this.dec;
            else this.ease.y = 0;
        }
        if (!key.left && !key.right) {
            if (this.ease.x > this.dec) this.ease.x -= this.dec;
            else if (this.ease.x < -this.dec) this.ease.x += this.dec;
            else this.ease.x = 0;
        }

        if (this.ease.x === 0 && this.ease.z === 0) return;

        this.pos.x += (Math.sin(r) * this.ease.x + Math.cos(r) * this.ease.y)*0.01;
        this.pos.y += (Math.cos(r) * this.ease.x - Math.sin(r) * this.ease.y)*0.01;

        this.update(delta);
    },
    move:function(x,y,delta){
        this.pos.x=x;
        this.pos.y=y;
        this.update(delta);
    },*/
    upTest:function () {
        if ( this.fullLoaded ) {
            for ( var i = 0; i < this.vlength; i ++ ) {
                this.mlib.terrain.attributes.speed.value[ i ] = 10.0;
            }
            this.mlib.terrain.attributes.speed.needsUpdate = true;
        }

        //console.log(this.mlib.terrain.attributes)
    },
    update:function () {
        if ( this.fullLoaded ) {

            var delta = this.root.clock.getDelta();
            //

            if (  this.updateNoise ) {



                this.animDelta = THREE.Math.clamp( this.animDelta + 0.00075 * this.animDeltaDir, 0, 0.05 );
                this.noiseShader.uniforms.time.value += delta * this.animDelta;
                this.noiseShader.uniforms.offset.value.set(this.pos.x, this.pos.y);

                this.terrainShader.uniforms.uOffset.value.set(this.mapOffset*this.pos.x, this.mapOffset*this.pos.y);

                this.quadTarget.material =  this.mlib.heightmap;
                this.root.renderer.render( this.sceneRenderTarget, this.cameraOrtho, this.heightMap, true );

                 if(this.isWithDepthTest){
                    var gl = this.root.renderer.getContext();
                    gl.readPixels( 0, 0, this.div[0], this.div[1], gl.RGBA, gl.UNSIGNED_BYTE, this.tmpData );
                }

                this.quadTarget.material =  this.mlib.normal;
                this.root.renderer.render( this.sceneRenderTarget, this.cameraOrtho, this.normalMap, true );

                /*for ( var i = 0; i < this.vlength; i ++ ) {
                    this.mlib.terrain.attributes.speed.value[ i ] = 10.0;
                }
                this.mlib.terrain.attributes.speed.needsUpdate = true;*/

                this.quadTarget.material =  this.mlib.specular;
                this.root.renderer.render( this.sceneRenderTarget, this.cameraOrtho, this.specularMap, true );
            }
        }


    },
    anim:function () {
        this.animDeltaDir *= -1;
    },
    night:function () {
        this.lightDir *= -1;
    },
    getz:function (x, z) {
        if(this.tmpData==null) return 0;
        var colx = Math.floor((x / this.size[0] + .5) * ( this.div[0]));
        var colz = Math.floor((-z / this.size[2] + .5) * ( this.div[1]));
        var pixel = Math.floor(((colz-1)*this.div[0])+colx)*4;
        var result = this.tmpData[pixel+0]*this.ratio;// (this.tmpData[pixel+0]+this.tmpData[pixel+1]+this.tmpData[pixel+2])*this.ratio;
        //console.log(this.tmpData[pixel+0]);
        return result;
    },
    /*generatePhysicsData : function () {
        var pix, j, n;
        var np = 0;
        var i = this.div[0];
        while (i--) {
            //j = this.div[1];
            //while (j--) {
            for (j = 0; j < this.div[1]; j++) {
                n = ((i)*this.div[0])+(j+1);
                pix = n*4;
                np ++;
                this.hfFloatBuffer[np] = (this.tmpData[pix+0]+this.tmpData[pix+1]+this.tmpData[pix+2])*this.ratio;
            }
        }

        //UP_TERRAIN(this.hfFloatBuffer);
    }*/

}



V.TerrainNormal = {
    attributes : {},
    uniforms: {
        'heightMap':  { type: 't', value: null },
        'resolution': { type: 'v2', value: new THREE.Vector2( 128, 128 ) },
        'scale':      { type: 'v2', value: new THREE.Vector2( 0, 0 ) },
        'height':     { type: 'f', value: 0.05 }
    },

    vs: [

        'varying vec2 vUv;',

        'void main() {',

            'vUv = uv;',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '}'

    ].join('\n'),

    fs: [

        'uniform float height;',
        'uniform vec2 resolution;',
        'uniform sampler2D heightMap;',

        'varying vec2 vUv;',

        'void main() {',

            'float val = texture2D( heightMap, vUv ).x;',

            'float valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;',
            'float valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;',

            'gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );',

        '}'

    ].join('\n')

};


V.TerrainNoise = {
    attributes : {},
    uniforms:{ 
        heightMap:  { type: 't', value: null },
        handPower : { type: 'f', value: 1.0 },
        noisePower:   { type: 'f', value: 0.2 },
        time:   { type: 'f', value: 1.0 },
        scale:  { type: 'v2', value: new THREE.Vector2( 1.5, 1.5 ) },
        offset: { type: 'v2', value: new THREE.Vector2( 2.0, 10.0 ) },
    },
    fs: [
        'uniform sampler2D heightMap;',
        'uniform float handPower;',
        'uniform float noisePower;',
        'uniform float time;',
        'varying vec2 vUv;',
        'uniform vec2 scale;',
        'uniform vec2 offset;',

        'vec4 permute( vec4 x ) {',

            'return mod( ( ( x * 34.0 ) + 1.0 ) * x, 289.0 );',

        '}',

        'vec4 taylorInvSqrt( vec4 r ) {',

            'return 1.79284291400159 - 0.85373472095314 * r;',

        '}',

        'float snoise( vec3 v ) {',

            'const vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );',
            'const vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );',

            '// First corner',

            'vec3 i  = floor( v + dot( v, C.yyy ) );',
            'vec3 x0 = v - i + dot( i, C.xxx );',

            '// Other corners',

            'vec3 g = step( x0.yzx, x0.xyz );',
            'vec3 l = 1.0 - g;',
            'vec3 i1 = min( g.xyz, l.zxy );',
            'vec3 i2 = max( g.xyz, l.zxy );',

            'vec3 x1 = x0 - i1 + 1.0 * C.xxx;',
            'vec3 x2 = x0 - i2 + 2.0 * C.xxx;',
            'vec3 x3 = x0 - 1. + 3.0 * C.xxx;',

            '// Permutations',

            'i = mod( i, 289.0 );',
            'vec4 p = permute( permute( permute(',
                    ' i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) )',
                   '+ i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) )',
                   '+ i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );',

            '// Gradients',
            '// ( N*N points uniformly over a square, mapped onto an octahedron.)',

            'float n_ = 1.0 / 7.0; // N=7',

            'vec3 ns = n_ * D.wyz - D.xzx;',

            'vec4 j = p - 49.0 * floor( p * ns.z *ns.z );  //  mod(p,N*N)',

            'vec4 x_ = floor( j * ns.z );',
            'vec4 y_ = floor( j - 7.0 * x_ );    // mod(j,N)',

            'vec4 x = x_ *ns.x + ns.yyyy;',
            'vec4 y = y_ *ns.x + ns.yyyy;',
            'vec4 h = 1.0 - abs( x ) - abs( y );',

            'vec4 b0 = vec4( x.xy, y.xy );',
            'vec4 b1 = vec4( x.zw, y.zw );',


            'vec4 s0 = floor( b0 ) * 2.0 + 1.0;',
            'vec4 s1 = floor( b1 ) * 2.0 + 1.0;',
            'vec4 sh = -step( h, vec4( 0.0 ) );',

            'vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;',
            'vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;',

            'vec3 p0 = vec3( a0.xy, h.x );',
            'vec3 p1 = vec3( a0.zw, h.y );',
            'vec3 p2 = vec3( a1.xy, h.z );',
            'vec3 p3 = vec3( a1.zw, h.w );',

            '// Normalise gradients',

            'vec4 norm = taylorInvSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );',
            'p0 *= norm.x;',
            'p1 *= norm.y;',
            'p2 *= norm.z;',
            'p3 *= norm.w;',

            '// Mix final noise value',

            'vec4 m = max( 0.6 - vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );',
            'm = m * m;',
            'return 42.0 * dot( m*m, vec4( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 ), dot( p3, x3 ) ) );',

        '}',

        'float surface3( vec3 coord ) {',

            'float n = 0.0;',

            'n += 1.0 * abs( snoise( coord ) );',
            'n += 0.5 * abs( snoise( coord * 2.0 ) );',
            'n += 0.25 * abs( snoise( coord * 4.0 ) );',
            'n += 0.125 * abs( snoise( coord * 8.0 ) );',

            'return n;',

        '}',

        'void main( void ) {',

            //'vec3 coord = vec3( vUv, -time );',
            'vec3 coord = vec3( vUv * scale + offset, -time );',
            'float n = surface3( coord );',

            //'vec4 noise = vec4( vec3( n, n, n ), 1.0 );',
            'vec4 baseColor = vec4( vec3( 1.0 ), 1.0 );',
            'vec4 noise = vec4( vec3( n, n, n ), 1.0 );',
            'vec4 texture = texture2D( heightMap, vUv );',
            //'texture -= noise;',

            //'gl_FragColor = vec4( vec3( 1.0 ), 1.0 );',
            //'gl_FragColor = texture2D( heightMap, vUv );',

            //'gl_FragColor = mix ( texture, noise, noisePower);',
            'gl_FragColor = baseColor;',
            'gl_FragColor *= mix ( baseColor, noise, noisePower);',
            'gl_FragColor *= mix ( baseColor, texture, handPower);',
            //'gl_FragColor = texture;',

        '}'

    ].join('\n'),

    vs: [

        'varying vec2 vUv;',
        //'uniform vec2 scale;',
        //'uniform vec2 offset;',

        'void main( void ) {',
            'vUv = uv;',
            //'vUv = uv * scale + offset;',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '}',

    ].join('\n')
};


V.TerrainTexture = {
attributes : {},
uniforms: {
    'tDiffuse': { type: 't', value: null }
},
fs: [
    'uniform sampler2D tDiffuse;',
    'varying vec2 vUv;',
    'void main() {',
        'gl_FragColor = texture2D( tDiffuse, vUv );',
    '}'
].join('\n'),
vs: [
    'varying vec2 vUv;',
    'void main() {',
        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
].join('\n')
};



V.TerrainLuminosity = {
attributes : {},
uniforms: {
    'tDiffuse': { type: 't', value: null }
},
fs: [
    'uniform sampler2D tDiffuse;',
    'varying vec2 vUv;',
    'void main() {',
        'vec4 texel = texture2D( tDiffuse, vUv );',
        'vec3 luma = vec3( 0.299, 0.587, 0.114 );',
        'float v = dot( texel.xyz, luma );',
        'gl_FragColor = vec4( v, v, v, texel.w );',
    '}'
].join('\n'),
vs: [
    'varying vec2 vUv;',
    'void main() {',
        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
].join('\n')
};



V.TerrainShader = {
attributes : {
                speed: { type: 'f', value: [] },
                tangent: { type: 'v4', value: [] }
},
//uniforms: //THREE.UniformsUtils.merge( [

    //THREE.UniformsLib[ "fog" ],
   // THREE.UniformsLib[ "lights" ],
    //THREE.UniformsLib[ "shadowmap" ],

  // {
uniforms:{
        heightMap:  { type: 't', value: null },
        handPower : { type: 'f', value: 1.0 },

        env : { type: 't', value: null },
        enableReflection: { type: 'i', value: 0 },
        useRefract : { type: 'i', value: 0 },
        reflectTop : { type: 'f', value: 0.6 },
        reflectBottom : { type: 'f', value: 0.2 },
        refractionRatio : { type: 'f', value: 0.98 },
        combine : { type: 'i', value: 0 },
        fogcolor : { type: 'c', value:  new THREE.Color( 0xFF160e ) },
        enableOcc : { type: 'i', value: 1 },

        enableExtraLight : { type: 'i', value: 0 },
        enableAmbientLight : { type: 'i', value: 0 },
        enablePointLight : { type: 'i', value: 0 },
        enableDirectLight : { type: 'i', value: 0 },
        enableSpotLight : { type: 'i', value: 0 },

        pointPower : { type: 'f', value: 1.0 },
        pointColor : { type: 'c', value:  new THREE.Color( 0xFF160e ) },
        pointPosition : { type: 'v3', value:  new THREE.Vector3( 0,5,0 ) },

        directPower : { type: 'f', value: 1.0 },
        directColor : { type: 'c', value:  new THREE.Color( 0xFF160e ) },
        directDirection : { type: 'v3', value:  new THREE.Vector3( 0,5,0 ) },

        ambientColor: { type: 'c', value: new THREE.Color( 0x101010 ) },

        'exposure' : { type: 'f', value: 1.9 },
        'brightMax' : { type: "f", value: 1.0 }, 

        'enableDiffuse1'  : { type: 'i', value: 1 },
        'enableDiffuse2'  : { type: 'i', value: 1 },
        'enableSpecular'  : { type: 'i', value: 1 },

        'fogmask'  : { type: 't', value: null },
        'enableFog': { type: 'i', value: 1 },

        'tDiffuse1'    : { type: 't', value: null },
        'tDiffuse2'    : { type: 't', value: null },
        'tDetail'      : { type: 't', value: null },
        'tDetail2'     : { type: 't', value: null },
        'tNormal'      : { type: 't', value: null },
        'tSpecular'    : { type: 't', value: null },
        'tDisplacement': { type: 't', value: null },

        'occ1'    : { type: 't', value: null },
        'occ2'    : { type: 't', value: null },

        'normalScale': { type: 'f', value: 1.0 },

        'uDisplacementBias': { type: 'f', value: 0.0 },
        'profondeur': { type: 'f', value: 1.0 },

        'diffuse': { type: 'c', value: new THREE.Color( 0xeeeeee ) },
        'specular': { type: 'c', value: new THREE.Color( 0xFF1111 ) },
        //'ambient': { type: 'c', value: new THREE.Color( 0x050505 ) },
        'shininess': { type: 'f', value: 30 },
        'opacity': { type: 'f', value: 1 },

        'minMix': { type: 'f', value: 0.2 },

        //'vAmount': { type: 'f', value: 30 },

        'uRepeatBase'    : { type: 'v2', value: new THREE.Vector2( 1, 1 ) },
        'uRepeatOverlay' : { type: 'v2', value: new THREE.Vector2( 1, 1 ) },

        'uOffset' : { type: 'v2', value: new THREE.Vector2( 0, 0 ) }
    },

        //]),

        fs: [
            'uniform float brightMax;',
            'uniform float exposure;',
            //'precision highp float;',
            'uniform sampler2D heightMap;',
            'uniform float handPower;',
            'uniform sampler2D env;',

            'uniform bool useRefract;',
            'uniform float refractionRatio;',
            'uniform float reflectTop;',
            'uniform float reflectBottom;',
            'uniform bool enableReflection;',

            'uniform sampler2D fogmask;',
            'uniform bool enableFog;',

            //'varying float vAmount;',

            'uniform vec3 fogcolor;',

            
            //'uniform vec3 ambient;',
            'uniform vec3 diffuse;',
            'uniform vec3 specular;',
            'uniform float shininess;',
            'uniform float opacity;',

            'uniform bool enableDiffuse1;',
            'uniform bool enableDiffuse2;',
            'uniform bool enableSpecular;',

            'uniform sampler2D tDiffuse1;',
            'uniform sampler2D tDiffuse2;',
            'uniform sampler2D tDetail;',
            'uniform sampler2D tDetail2;',
            'uniform sampler2D tNormal;',
            'uniform sampler2D tSpecular;',
            'uniform sampler2D tDisplacement;',

            

            'uniform bool enableOcc;',
            'uniform sampler2D occ1;',
            'uniform sampler2D occ2;',

            'uniform float normalScale;',

            'uniform vec2 uRepeatOverlay;',
            'uniform vec2 uRepeatBase;',

            'uniform vec2 uOffset;',

            'varying vec3 vTangent;',
            'varying vec3 vBinormal;',
            'varying vec3 vNormal;',
            'varying vec2 vUv;',
            'varying vec2 vN;',
            'varying vec3 vUU;',


            'varying vec3 vViewPosition;',
            'varying vec3 vWorldPosition;',

            'uniform bool enableExtraLight;',
            'uniform bool enableAmbientLight;',
            'uniform bool enablePointLight;',
            'uniform bool enableDirectLight;',
            'uniform bool enableSpotLight;',

            'uniform float pointPower;',
            'uniform vec3 pointColor;',
            'uniform vec3 pointPosition;',

            'uniform float directPower;',
            'uniform vec3 directColor;',
            'uniform vec3 directDirection;',

            'uniform vec3 ambientColor;',

            'uniform float minMix;',

            


            'uniform vec3 spotColor;',

            


            //'uniform vec3 ambientLightColor;',
            'float saturate( in float a ) { return clamp( a, 0.0, 1.0 ); }',
            'vec2  saturate( in vec2 a )  { return clamp( a, 0.0, 1.0 ); }',
            'vec3  saturate( in vec3 a )  { return clamp( a, 0.0, 1.0 ); }',
            'vec4  saturate( in vec4 a )  { return clamp( a, 0.0, 1.0 ); }',
            'vec3 transformDirection( in vec3 normal, in mat4 matrix ) {',
                'return normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );',
            '}',
            'float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {',
                'if ( decayExponent > 0.0 ) { return pow( saturate( 1.0 - lightDistance / cutoffDistance ), decayExponent ); }',
                'return 1.0;',
            '}',

            'vec4 hdr( const in vec4 color ) {',
            '   vec4 res = color;',
            //'   vec4 res = color * color;',// remove gamma correction
            //'   float ri = pow( 2.0, res.w * 32.0 - 16.0 );',// decoded RI
            //'   res.xyz = res.xyz * ri;',// decoded HDR pixel
            // Perform tone-mapping
            //'   float Y = dot(vec4(0.30, 0.59, 0.11, 0.0), res);',
            '   float YD = exposure * (exposure/brightMax + 1.0) / (exposure + 1.0);',
            '   res *= YD;',
            //'   res.w = 1.0;',
            '   return res;',
            '}',
            

            'void main() {',
                
                'vec2 uvOverlay = uRepeatOverlay * vUv + uOffset;',
                'vec2 uvBase = uRepeatBase * vUv;',

                'vec3 outgoingLight = vec3( 0.0 );',
                "vec4 diffuseColor = vec4( diffuse, opacity );",
                'vec3 specularTex = vec3( 1.0 );',
                'vec3 occTex = vec3( 1.0 );',

                // DISPLACEMENT MAP

                'vec4 displaceBase = texture2D( tDisplacement, uvBase );',
                //'vec4 displaceBase = texture2D( heightMap, uvBase );',
                'float displaceN = abs(1.0- (displaceBase.x ));',
                'float displace = displaceN*0.1;',
                'displace = mix( displaceN, displace , clamp(1. - (minMix), 0., 1.));',
                //'float displace = displaceN*handPower;',
                //'displace = mix( displaceN, displace , clamp(1. - (minMix*handPower), 0., 1.));',

                //'float displacePlus = smoothstep(displace*handPower, displace, minMix);',
                //'displace *= handPower;',
                //'displace = mix(displaceN, displace, minMix);',
                //'displace += (minMix);',
                //'displace = max(displacePlus, displace);',
                'displace = min(1.0, displace);',
                //'vec4 displace = 1.0 - displaceBase;',
                //'displace = smoothstep(vec4(minMix), vec4(1.0), displace);',
                //'displace = smoothstep(displace, handPower, minMix);',

                // NORMAL MAP

                'vec4 colNorm1 = texture2D( tDetail, uvOverlay );',
                'vec4 colNorm2 = texture2D( tDetail2, uvOverlay );',
                //'vec4 normalMix = mix ( colNorm1, colNorm2, displace );',
                'vec3 normalMix = mix( colNorm1.xyz, colNorm2.xyz, displace );',

                'vec3 normalTex = normalMix * 2.0 - 1.0;',
                'normalTex.xy *= normalScale;',
                'normalTex = normalize( normalTex );',

                'mat3 tsb = mat3( vTangent, vBinormal, vNormal );',
                'vec3 finalNormal = tsb * normalTex;',

                'vec3 normal = normalize( finalNormal );',
                'vec3 viewPosition = normalize( vViewPosition );',

                //'vec3 viewPosition = vec3( 0.0 );',
                

                // DIFFUSE MAP

                'if( enableDiffuse1 && enableDiffuse2 ) {',

                    'vec4 colDiffuse1 = texture2D( tDiffuse1, uvOverlay );',
                    'vec4 colDiffuse2 = texture2D( tDiffuse2, uvOverlay );',

                    //'colDiffuse1.xyz = inputToLinear( colDiffuse1.xyz );',
                    //'colDiffuse2.xyz = inputToLinear( colDiffuse2.xyz );',

                    //"diffuseColor *= mix ( colDiffuse1, colDiffuse2, displace );",
                    "diffuseColor.xyz *= mix ( colDiffuse1.xyz, colDiffuse2.xyz, displace );",

                '} else if( enableDiffuse1 ) {',
                    'diffuseColor *= texture2D( tDiffuse1, uvOverlay );',
                '} else if( enableDiffuse2 ) {',
                    'diffuseColor *= texture2D( tDiffuse2, uvOverlay );',
                '}',

                // SPECULAR MAP

                'if( enableSpecular ) specularTex = texture2D( tSpecular, uvOverlay ).xyz;',

                // LIGHT SUPPORT

                'vec3 totalDiffuseLight = vec3( 0.0 );',
                'vec3 totalSpecularLight = vec3( 0.0 );',

                'if(enableExtraLight){',
                    'if(enableDirectLight){',
                        'vec3 dirVector = transformDirection( directDirection , viewMatrix );',
                        //'vec3 dirVector = directDirection;',
                        'vec3 dirHalfVector = normalize( dirVector + viewPosition );',

                        'float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );',
                        'float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );',

                        'float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, shininess ), 0.0 );',

                        'totalDiffuseLight += directPower * directColor * dirDiffuseWeight;',
                        'totalSpecularLight += directPower * directColor * specular * dirSpecularWeight * dirDiffuseWeight;',
                    '}',
                    'if(enablePointLight){',
                        'vec4 lPosition = viewMatrix * vec4( pointPosition, 1.0 );',
                        'vec3 lVector = lPosition.xyz + vViewPosition.xyz;',
                        //'float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[i] );',
                        'float attenuation = calcLightAttenuation( length( lVector ), 10.0, 0.0 );',

                        'lVector = normalize( lVector );',

                        'vec3 pointHalfVector = normalize( lVector + viewPosition );',

                        'float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );',
                        'float pointDiffuseWeight = max( dot( normal, lVector ), 0.0 );',

                        'float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, shininess ), pointPower );',

                        'totalDiffuseLight += attenuation * pointColor * pointDiffuseWeight;',
                        'totalSpecularLight += attenuation * pointColor * specular * pointSpecularWeight * pointDiffuseWeight;',
                    '}',

                    'outgoingLight += diffuseColor.xyz * ( totalDiffuseLight + ambientColor + totalSpecularLight );',
                    'diffuseColor.xyz = outgoingLight;',
                    //'diffuseColor.xyz *= ( totalDiffuseLight + ambientLightColor + totalSpecularLight );',
                '}',

                // OCCLUSION MAP

                /*'if( enableOcc ) {',
                    'vec4 colOcc1 = texture2D( occ1, uvOverlay );',
                    'vec4 colOcc2 = texture2D( occ2, uvOverlay );',
                    //"occTex = gl_FragColor.xyz * mix ( colOcc1, colOcc2, displace ).xyz;",
                    //"occTex = mix ( colOcc1, colOcc2, displace ).xyz;",
                    "occTex = mix ( colOcc1.xyz, colOcc2.xyz, displace );",
                    //'gl_FragColor.xyz *= occTex*0.8;',

                    'diffuseColor.xyz *= occTex*0.8;',
                    //'gl_FragColor.xyz = mix( gl_FragColor.xyz, occTex, 1.0 -displaceBase.x );',
                '}',*/



                

                /*'if( enableSpecular ){',
                    //??
                    //'vec3 dirHalfVector = normalize( finalNormal + vViewPosition );',
                    'float dirDotNormalHalf = 0.5 * dot( normal, r )+ 0.5;',
                    'specularTex = texture2D( tSpecular, uvBase ).xyz;',
                    'float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, shininess ), 0.0 );',
                    'gl_FragColor.xyz *= dirSpecularWeight;',
                    //'gl_FragColor.xyz *= specularTex * shininess;',
                '}',*/

                // SPHERICAL REFLECTION

                'if ( enableReflection ) {',
                    'vec3 r = reflect( vUU, normal );',
                    'float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z + 1.0 ) );',
                    'vec2 calculatedNormal = vec2( r.x / m + 0.5,  r.y / m + 0.5 );',
                
                    'vec4 ev = hdr(texture2D( env, vN*calculatedNormal ));',
                    //'vec3 ev = texture2D( env, vN*calculatedNormal ).rgb;',
                    //'vec3 reff1 = mix( gl_FragColor.xyz, ev.xyz, reflectTop );',
                    //'vec3 reff2 = mix( gl_FragColor.xyz, ev.xyz, reflectBottom );',
                    //'gl_FragColor.xyz = mix ( reff1.xyz, reff2.xyz, displace.x );',

                    'vec3 reff1 = mix( diffuseColor.xyz, ev.xyz, reflectTop );',
                    'vec3 reff2 = mix( diffuseColor.xyz, ev.xyz, reflectBottom );',
                    //'diffuseColor.xyz = mix( reff1.xyz, reff2.xyz, displace.x );',
                    //'diffuseColor = mix( vec4(reff1.xyz, 1.0), vec4(reff2.xyz, 1.0), displace );',
                    'diffuseColor.xyz = mix( reff1.xyz, reff2.xyz, displace );',

                    //'gl_FragColor.xyz *= ev;',
                    //'gl_FragColor.xyz = mix( gl_FragColor.xyz, ev.xyz, reflectivity );',
                '}',

                //THREE.ShaderChunk[ "shadowmap_fragment" ],
                //THREE.ShaderChunk[ "linear_to_gamma_fragment" ],


                // HDR TEST
                //'gl_FragColor = mix ( gl_FragColor, hdr( gl_FragColor ), 0.6 );',

                // FOG BITMAP

                'if(enableFog){',
                    'vec4 fogZone = texture2D( fogmask, uvBase );',
                    'diffuseColor.xyz = mix( fogcolor, diffuseColor.xyz , clamp(1. - fogZone.r, 0., 1.));',,
                '}',

                'gl_FragColor = vec4(diffuseColor.xyz, 1.);',

            '}'

        ].join('\n'),

        vs: [
            //'precision highp float;',
            
            'attribute vec4 tangent;',
            'attribute float speed;',

            'uniform vec2 uRepeatBase;',

            'uniform sampler2D tNormal;',

            'uniform sampler2D tDisplacement;',
            'uniform float profondeur;',
            'uniform float uDisplacementBias;',

            'varying vec3 vTangent;',
            'varying vec3 vBinormal;',
            'varying vec3 vNormal;',
            'varying vec2 vUv;',

            'varying vec3 vViewPosition;',
            'varying vec3 vWorldPosition;',
            //'varying float vAmount;',
            // spherical test
            'varying vec2 vN;',
            'varying vec3 vPos;',
            'varying vec3 vUU;',

            //THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

            'void main() {',

                'vNormal = normalize( normalMatrix * normal );',

                // tangent and binormal vectors

                'vTangent = normalize( normalMatrix * tangent.xyz );',

                'vBinormal = cross( vNormal, vTangent ) * tangent.w;',
                'vBinormal = normalize( vBinormal );',

                // texture coordinates

                'vUv = uv;',

                'vec4 bumpData = texture2D( tDisplacement, uv );',
                //'vAmount = bumpData.r;',

                'vec2 uvBase = uv * uRepeatBase;',

                // displacement mapping

                'vec3 dv = texture2D( tDisplacement, uvBase ).xyz;',
                'float df = profondeur * dv.x + uDisplacementBias;',
                //'vec3 newpos = position;',
                //'newpos.x = newpos.x - df;',
                'vec3 displacedPosition = normal * df + position;',
                //'speed = 9.0;',
                //'float e = speed;',
                //'displacedPosition.y-=profondeur;',
                //'vec3 displacedPosition = normal * df + newpos;',
                //'displacedPosition.z*=-1.0;',

                'vec4 worldPosition = modelMatrix * vec4( displacedPosition, 1.0 );',
                'vec4 mvPosition = modelViewMatrix * vec4( displacedPosition, 1.0 );',
                //'vec4 mvPosition = modelMatrix * vec4( displacedPosition, 1.0 );',


                'gl_Position = projectionMatrix * mvPosition;',

                'vWorldPosition = worldPosition.xyz;',
                'vViewPosition = -mvPosition.xyz;',
                'vViewPosition = -worldPosition.xyz;',

                'vec3 normalTex = texture2D( tNormal, uvBase ).xyz * 2.0 - 1.0;',
                'vNormal = normalMatrix * normalTex;',

                //'vec4 mvpos = modelViewMatrix * vec4( position, 1.0 );',
                'vec4 mvpos = modelMatrix * vec4( position, 1.0 );',
                'vUU = normalize( vec3( mvpos ) );',

                // spherical
               // 'vPos = vec3(0,0,0);',//normalize( vec3( mvPosition ) );',
                //'vPos = normalize( vec3( mvPosition ) );',
                'vPos = normalize( vec3( worldPosition ) );',
                //'vNormal = normalize( normalMatrix * normal );',
               // 'vNormal = normalTex.xyz;',
                'vec3 r = reflect( vPos, normalize(vNormal) );',
                'float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );',
                'vN = r.xy / m + .5;',

                //THREE.ShaderChunk[ "shadowmap_vertex" ],
            '}'

        ].join('\n')

    }

//};
//}
