/**
* @author loth / http://3dflashlo.wordpress.com/
*
* Character game with map collision and height test
*/

'use strict';

var HeroGame = {};

HeroGame.ToRad = Math.PI/180;

HeroGame.Player = function( container, camera, scene, revers, debug ){
	this.revers = revers || false;
	this.obj = new THREE.Group();
	/*var shadow = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ),  new THREE.MeshBasicMaterial( { color:0x666666, transparent:true, opacity:0.5, blending:THREE.MultiplyBlending }) );
	shadow.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(90*HeroGame.ToRad));
	shadow.position.y = 0.05
	this.obj.add(shadow)*/
    this.obj.position.y = 0.5;
    scene.add(this.obj);

    this.velocity = new THREE.Vector3( 0, 0, 0 );
    this.rotation = new THREE.Vector3( 0, 0, 0 );
    this.newRotation = new THREE.Vector3( 0, 0, 0 );
    this.model = false;

    this.timeScale = 1;
    this.delta = 0;

    this.isMove = false;
    this.isJump = false;
    this.isFall = false;
    this.onGround = true;
    
    this.weights = {};

    this.levelOrigin = new THREE.Vector3(0,0,0);
    this.level = new THREE.Vector3(0,0,0);
    this.ease = new THREE.Vector3();
    this.easeRot = new THREE.Vector3();
    this.cfg = { speed:0.025, maxSpeed:0.25, g:9.8, posY:0, maxJump:4, maxHeight:4 };

    this.miniMap = new HeroGame.Minimap( this.revers, debug );

    this.navigation = new HeroGame.Navigation( container, camera, this.revers );
    this.navigation.target = this.getPosition().clone();
    this.navigation.target.add(new THREE.Vector3(0, 1.2, 0));
    this.navigation.moveCamera();
};

HeroGame.Player.prototype = {
    constructor: HeroGame.Player,

    addHero:function(m, size){
    	size = size || 0.023;
        this.hero = m;

        if( this.revers ){
            this.hero.scale.set(size,size,size);
            this.hero.rotation.y = 180 * HeroGame.ToRad;
        }
        else this.hero.scale.set(size,size,-size);

        this.animLength = this.hero.animations.length;
        var i = this.animLength, name;

        while(i--){
            name = this.hero.animations[i].name;

            this.weights[name] = 0;
            if(name=='idle') this.weights[name] = 1;

            this.hero.animations[i].play( 0, this.weights[name] );
        }

        this.obj.add(this.hero);
        this.model = true;
    },
    update:function(delta){
    	TWEEN.update();
    	this.delta = delta;
    	THREE.AnimationHandler.update( this.delta );
        this.move();
    },
    move:function(k) {
        var key = this.navigation.key;

        // jumping
        if( key[6] && this.onGround ){ this.isJump = true; this.onGround = false;}

        //acceleration and speed limite
        if (key[0] && this.onGround) this.ease.z = (this.ease.z > this.cfg.maxSpeed) ?  this.cfg.maxSpeed : this.ease.z+this.cfg.speed;
        if (key[1] && this.onGround) this.ease.z = (this.ease.z < -this.cfg.maxSpeed)? -this.cfg.maxSpeed : this.ease.z-this.cfg.speed;
        if(this.revers){
        	if (key[3] && this.onGround) this.ease.x = (this.ease.x > this.cfg.maxSpeed) ?  this.cfg.maxSpeed : this.ease.x+this.cfg.speed;
            if (key[2] && this.onGround) this.ease.x = (this.ease.x < -this.cfg.maxSpeed)? -this.cfg.maxSpeed : this.ease.x-this.cfg.speed;
        } else {
        	if (key[2] && this.onGround) this.ease.x = (this.ease.x > this.cfg.maxSpeed) ?  this.cfg.maxSpeed : this.ease.x+this.cfg.speed;
            if (key[3] && this.onGround) this.ease.x = (this.ease.x < -this.cfg.maxSpeed)? -this.cfg.maxSpeed : this.ease.x-this.cfg.speed;
        }
        
        //deceleration
        if (!key[0] && !key[1]) {
            if (this.ease.z > this.cfg.speed) this.ease.z -= this.cfg.speed;
            else if (this.ease.z < -this.cfg.speed) this.ease.z += this.cfg.speed;
            else this.ease.z = 0;
        }
        if (!key[2] && !key[3]) {
            if (this.ease.x > this.cfg.speed) this.ease.x -= this.cfg.speed;
            else if (this.ease.x < -this.cfg.speed) this.ease.x += this.cfg.speed;
            else this.ease.x = 0;
        }

        // ease
        var mx = 0;
        var mz = 0;
        if(this.ease.z!==0 || this.ease.x!==0){
            if(this.ease.z>0){this.WalkFront(); mz = 1;}
            else if(this.ease.z<0){this.WalkBack(); mz = -1;}
            if(!this.revers){
	            if(this.ease.x<0){this.stepLeft(mz);mx=-1}
	            else if(this.ease.x>0){this.stepRight(mz);mx=1;}
	        } else {
	        	if(this.ease.x<0){this.stepRight(mz);mx=-1}
	            else if(this.ease.x>0){this.stepLeft(mz);mx=1;}
	        }

        } else {
            this.stopWalk();
        }
        
        
        // stop if no move
        if (this.ease.x == 0 && this.ease.z == 0 && !this.navigation.mouse.down && this.onGround) return;
        
        //console.log(controls.object.rotation)

        // find direction of player
        this.easeRot.y = this.navigation.cam.h * HeroGame.ToRad;
        var rot =  this.navigation.unwrapDegrees(Math.round(this.navigation.cam.h));
        this.easeRot.x = Math.sin(this.easeRot.y) * this.ease.x + Math.cos(this.easeRot.y) * this.ease.z;
        this.easeRot.z = Math.cos(this.easeRot.y) * this.ease.x - Math.sin(this.easeRot.y) * this.ease.z;

        //this.setRotation(-(this.navigation.cam.h+90)*HeroGame.ToRad);
        this.setRotation(-(this.easeRot.y+(90*HeroGame.ToRad)));
        //this.setRotation(-(this.parent.nav.cam.h+90)*HeroGame.ToRad)

        //if(this.revers)this.level.x = this.levelOrigin.x + this.easeRot.x;
        //else 
        this.level.x = this.levelOrigin.x-this.easeRot.x;
        this.level.z = this.levelOrigin.z+this.easeRot.z;

        // update 2d map
        this.miniMap.drawMap();

        // test pixel collision
        var nohitx = 0;
        var nohitz = 0;
        var lock = this.miniMap.lock;

        if(this.revers){
	        if(rot >= 45 && rot <= 135){
	            if(this.level.z < this.levelOrigin.z) if(!lock[0] && !lock[4] && !lock[5]) nohitz = 1;
	            if(this.level.z > this.levelOrigin.z) if(!lock[1] && !lock[6] && !lock[7]) nohitz = 1;
	            if(this.level.x > this.levelOrigin.x) if(!lock[2] && !lock[4] && !lock[6]) nohitx = 1;
	            if(this.level.x < this.levelOrigin.x) if(!lock[3] && !lock[5] && !lock[7]) nohitx = 1;
	        } else if (rot <= -45 && rot >= -135){
	            if(this.level.z > this.levelOrigin.z) if(!lock[0] && !lock[4] && !lock[5]) nohitz = 1;
	            if(this.level.z < this.levelOrigin.z) if(!lock[1] && !lock[6] && !lock[7]) nohitz = 1;
	            if(this.level.x < this.levelOrigin.x) if(!lock[2] && !lock[4] && !lock[6]) nohitx = 1;
	            if(this.level.x > this.levelOrigin.x) if(!lock[3] && !lock[5] && !lock[7]) nohitx = 1;
	        } else if (rot < 45 && rot > -45){
	            if(this.level.z < this.levelOrigin.z) if(!lock[2] && !lock[4] && !lock[6]) nohitz = 1;
	            if(this.level.z > this.levelOrigin.z) if(!lock[3] && !lock[5] && !lock[7]) nohitz = 1;
	            if(this.level.x < this.levelOrigin.x) if(!lock[0] && !lock[4] && !lock[5]) nohitx = 1;
	            if(this.level.x > this.levelOrigin.x) if(!lock[1] && !lock[6] && !lock[7]) nohitx = 1;
	        } else {
	            if(this.level.z > this.levelOrigin.z) if(!lock[2] && !lock[4] && !lock[6]) nohitz = 1;
	            if(this.level.z < this.levelOrigin.z) if(!lock[3] && !lock[5] && !lock[7]) nohitz = 1;
	            if(this.level.x > this.levelOrigin.x) if(!lock[0] && !lock[4] && !lock[5]) nohitx = 1;
	            if(this.level.x < this.levelOrigin.x) if(!lock[1] && !lock[6] && !lock[7]) nohitx = 1;
	        }
	    } else {
	    	if(rot >= 45 && rot <= 135){
	            if(this.level.z < this.levelOrigin.z) if(!lock[0] && !lock[4] && !lock[5]) nohitz = 1;
	            if(this.level.z > this.levelOrigin.z) if(!lock[1] && !lock[6] && !lock[7]) nohitz = 1;
	            if(this.level.x < this.levelOrigin.x) if(!lock[2] && !lock[4] && !lock[6]) nohitx = 1;
	            if(this.level.x > this.levelOrigin.x) if(!lock[3] && !lock[5] && !lock[7]) nohitx = 1;
	        } else if (rot <= -45 && rot >= -135){
	            if(this.level.z > this.levelOrigin.z) if(!lock[0] && !lock[4] && !lock[5]) nohitz = 1;
	            if(this.level.z < this.levelOrigin.z) if(!lock[1] && !lock[6] && !lock[7]) nohitz = 1;
	            if(this.level.x > this.levelOrigin.x) if(!lock[2] && !lock[4] && !lock[6]) nohitx = 1;
	            if(this.level.x < this.levelOrigin.x) if(!lock[3] && !lock[5] && !lock[7]) nohitx = 1;
	        } else if (rot < 45 && rot > -45){
	            if(this.level.z > this.levelOrigin.z) if(!lock[2] && !lock[4] && !lock[6]) nohitz = 1;
	            if(this.level.z < this.levelOrigin.z) if(!lock[3] && !lock[5] && !lock[7]) nohitz = 1;
	            if(this.level.x < this.levelOrigin.x) if(!lock[0] && !lock[4] && !lock[5]) nohitx = 1;
	            if(this.level.x > this.levelOrigin.x) if(!lock[1] && !lock[6] && !lock[7]) nohitx = 1;
	        } else {
	            if(this.level.z < this.levelOrigin.z) if(!lock[2] && !lock[4] && !lock[6]) nohitz = 1;
	            if(this.level.z > this.levelOrigin.z) if(!lock[3] && !lock[5] && !lock[7]) nohitz = 1;
	            if(this.level.x > this.levelOrigin.x) if(!lock[0] && !lock[4] && !lock[5]) nohitx = 1;
	            if(this.level.x < this.levelOrigin.x) if(!lock[1] && !lock[6] && !lock[7]) nohitx = 1;
	        }
	    }

        

        this.level.y = this.miniMap.posY + this.cfg.posY;
        var diff = Math.abs(this.levelOrigin.y - this.level.y);

        //this.levelOrigin.y = this.level.y;
        if(this.levelOrigin.y>this.level.y){ // down
        	if(diff<this.cfg.maxHeight) this.levelOrigin.y = this.level.y;
        	else{ this.isFall = true; this.onGround=false;} 
        } else {
        	if(diff<this.cfg.maxHeight) this.levelOrigin.y = this.level.y;
        	//else {nohitz=0; nohitx=0}
        }

        if(nohitx)this.levelOrigin.x = this.level.x;
        if(nohitz)this.levelOrigin.z = this.level.z;

        /*var diff = Math.abs(this.levelOrigin.y - this.level.y);
        if(diff<this.cfg.maxHeight) this.levelOrigin.y = this.level.y;
        else{ this.isFall = true; this.onGround=false;} */


        // gravity
        if(this.isJump){
        	this.ease.y += this.cfg.g * this.delta;
            if(this.ease.y>this.cfg.maxJump){ this.isFall = true; this.isJump = false; }
        }
        if(this.isFall){
        	this.ease.y -= this.cfg.g * this.delta;
        	if(diff<this.cfg.maxHeight && this.ease.y<0){  this.isFall = false; this.ease.y = 0; this.onGround=true; }
        	//if(this.ease.y<0){ this.isFall = false; this.ease.y = 0; this.onGround=true; }
        }
       
        //if(this.ease.y>this.cfg.maxJump) this.ease.y -= this.cfg.g * this.delta;

        this.levelOrigin.y += this.ease.y;

        // update 2d map
        this.miniMap.updatePosition(this.levelOrigin.x, -this.easeRot.y, this.levelOrigin.z);

        //this.player.position.lerp(this.levelOrigin, 0.1);
        this.lerp(this.levelOrigin, 0.5);
        //this.lerp(this.levelOrigin, this.delta);

        this.navigation.target = this.getPosition().clone();
        this.navigation.target.add(new THREE.Vector3(0, 1.2, 0));
        this.navigation.moveCamera();
    },
    getPosition:function(){
    	return this.obj.position;
    },
    setPosition:function(x,y,z){
    	this.obj.position.set(x,y,z);
    },
    setRotation:function(y){
        this.rotation.y = y;
        if(this.isMove){
            this.newRotation.lerp(this.rotation, 0.25);
            this.obj.rotation.y = this.newRotation.y;
         }
    },
    lerp:function(v,f){
    	this.obj.position.lerp(v,f);
    },
    WalkFront:function(){
        if(this.model){
            this.timeScale=1;
            this.easing({idle:0, walk:1, step_left:0, step_right:0});    
        }
        this.isMove = true;
    },
    WalkBack:function(){
        if(this.model){
            this.timeScale=-1;
            this.easing({idle:0, walk:1, step_left:0, step_right:0});  
        }
        this.isMove = true;
    },
    stepLeft:function(){
        if(this.model){
            this.easing({idle:0, walk:0, step_left:1, step_right:0});
            
        }
        this.isMove = true;
    },
    stepRight:function(){
        if(this.model){
            this.easing({idle:0, walk:0, step_left:0, step_right:1});
        }
        this.isMove = true;
    },
    stopWalk:function(){
        if(this.model){
            if(this.weights['walk']!==0 || this.weights['step_right']!==0 || this.weights['step_left']!==0){ 
                this.easing({idle:1, walk:0, step_left:0, step_right:0});       
            }
        }
        this.isMove = false;
    },
    easing:function(newWeights){
    	var _this = this;
        this.tween = new TWEEN.Tween( this.weights )
            .to( newWeights, 200 )
            .easing( TWEEN.Easing.Linear.None )
            .onUpdate( function () {_this.weight()} )
            .start();
    },
    weight:function(t){
        var i = this.animLength, name;
        while(i--){
        	name = this.hero.animations[i].name;
        	this.hero.animations[i].weight = this.weights[name];
            if(name=='walk'){
                this.hero.animations[i].timeScale = this.timeScale;
            }
        }
    }

};

// ----------------------- Minimap

HeroGame.Minimap = function(revers, debug){
	this.revers = revers || false;
	//this.wsize = {w:window.innerWidth, h:window.innerHeight} 
	//this.rr = renderer;
	this.debug = debug || false;
    this.ar8 = typeof Uint8Array!="undefined"?Uint8Array:Array;
    this.miniSize = { w:64, h:64, f:0.25 };
    this.cc = {r:255, g:0, b:0, a:255}; 

    this.miniGlCanvas = document.createElement('canvas');
    this.miniTop = document.createElement('canvas');
    this.mapTest = document.createElement('canvas');

    this.mmCanvas = document.createElement('canvas');
    this.mmCanvas.width = this.mmCanvas.height = 64;
    this.tmCanvas = document.createElement('canvas');
    this.tmCanvas.width = this.tmCanvas.height = 16;


    this.miniGlCanvas.width = this.miniTop.width = this.miniSize.w;
    this.miniGlCanvas.height = this.miniTop.height = this.miniSize.h;
    this.mapTest.width = 16;
    this.mapTest.height = 16;

    this.miniGlCanvas.style.cssText = 'position:absolute; bottom:10px; left:10px; border:3px solid #74818b;';
    this.miniTop.style.cssText = 'position:absolute; bottom:13px; left:13px;';
    this.mapTest.style.cssText = 'position:absolute; bottom:35px; left:35px;';
    this.mmCanvas.style.cssText = 'position:absolute; bottom:100px; left:10px; border:3px solid #74818b;';

    var body = document.body;

    body.appendChild( this.miniGlCanvas );
    body.appendChild( this.miniTop );
    body.appendChild( this.mapTest );

    if(this.debug)body.appendChild( this.mmCanvas );

    this.posY = 0;
    this.oldColors = [];

    this.init();
};

HeroGame.Minimap.prototype = {
    constructor: HeroGame.Minimap,
    init:function() {
        this.setMapTestSize(8);
        this.renderer = new THREE.WebGLRenderer({ canvas:this.miniGlCanvas, precision: "lowp", antialias: false });
        this.renderer.setSize( this.miniSize.w, this.miniSize.h );
        //this.renderer.sortObjects = false;
        //this.renderer.sortElements = false;
        this.renderer.setClearColor( 0xff0000, 1 );
        this.scene = new THREE.Scene();

        //this.tTexture = new THREE.WebGLRenderTarget(this.miniSize.w, this.miniSize.h, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });

        var w = 3;//6;// 500*this.miniSize.f;
        this.camera = new THREE.OrthographicCamera( -w , w , w , -w , 0.1, 400 );
        this.camera.position.x = 0;
        this.camera.position.z = 0;
        this.camera.position.y = 100;//(200)*this.miniSize.f;
        if(this.revers) this.camera.scale.x = -1;
        this.camera.lookAt( new THREE.Vector3(0,0,0) );

        this.player = new THREE.Object3D();
        this.player.position.set(0,0,0);
        this.scene.add(this.player);
        this.player.add(this.camera);

        this.gl = this.renderer.getContext();
        //this.gl = this.rr.getContext();
        this.initTopMap();

        this.deepShader = new THREE.ShaderMaterial({
            uniforms: HeroGame.deepShader.uniforms,
            vertexShader: HeroGame.deepShader.vs,
            fragmentShader: HeroGame.deepShader.fs
        });
    },
    addGeometry:function(geo){
        var mesh = new THREE.Mesh( geo, this.deepShader);
        //mesh.scale.set(1,1,-1);
        mesh.position.set(0,0,0);
        this.scene.add(mesh);
    },
    add:function(mesh){
        //var mesh = new THREE.Mesh( geo, );
        mesh.material = this.deepShader;
        if(!this.revers)mesh.scale.set(1,1,-1);
        mesh.position.set(0,0,0);
        this.scene.add(mesh);
    },

    updatePosition:function(x,y,z){
        this.player.position.x = x;
        this.player.position.z = z;
        this.player.rotation.y = y;
    },
    drawMap:function(){
        this.renderer.render( this.scene, this.camera );
        this.gl.readPixels(this.zsize[0], this.zsize[1], this.zsize[2], this.zsize[2], this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.zone);

        /*this.rr.setSize( this.miniSize.w, this.miniSize.h );
        this.rr.setClearColor( 0xff0000, 1 );
        this.rr.render( this.scene, this.camera );//, this.tTexture, true);
        this.rr.getContext().readPixels(this.zsize[0], this.zsize[1], this.zsize[2], this.zsize[2], this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.zone);
        this.rr.setSize( this.wsize.w, this.wsize.h );*/

        //this.drawMiniMap();

        if(this.debug){
        	// revers y pixel data
	        var m = 0, n =  0;
	        for(var y = 15; y>=0; y--){
	            for(var x = 0; x<16; x++){
	                n = ((y*16)*4)+(x*4);
	                this.zoneInv[m+0] = this.zone[n+0];
	                this.zoneInv[m+1] = this.zone[n+1];
	                this.zoneInv[m+2] = this.zone[n+2];
	                this.zoneInv[m+3] = this.zone[n+3];
	                m+=4
	            }
	        }
	        this.drawBIGMap();
	    }

        // collision
        var i = 9;
        while(i--){ this.lock[i] = this.colorTest(this.pp[i]); }

        // height
        this.posY = this.zone[this.pp[8]+1]/10;
        this.player.position.y = this.posY;


        if(this.ctxTest) this.drawMapTest();
        
    },
    /*drawMiniMap:function(){
    	var ctx = this.miniGlCanvas.getContext('2d');
    	//ctx.drawImage(this.tTexture.image,0,0, 64, 64);
    	var imageObject=new Image();
        imageObject.onload=function(){
            ctx.clearRect(0,0,64,64);
            ctx.drawImage(imageObject,0,0, 64, 64);
        }
        imageObject.src=this.rr.domElement.toDataURL();
    },*/
    drawBIGMap:function(){
        var c = this.mmCanvas;
        var ctx2 = c.getContext('2d');
        var ctx = this.tmCanvas.getContext('2d');
        var image = ctx.getImageData(0, 0, 16, 16);
        var i = this.zoneInv.length;
        while(i--) image.data[i] = this.zoneInv[i];
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0, 16, 16);
        ctx.putImageData(image, 0, 0);
        var imageObject=new Image();
        imageObject.onload=function(){
            ctx2.clearRect(0,0,64,64);
            ctx2.drawImage(imageObject,0,0, 64, 64);
        }
        imageObject.src=this.tmCanvas.toDataURL();
    },
    colorTest:function(n){
        var b=0, z=this.zone, c=this.cc, w = this.oldColors[n] || 0;

        // test out
        if(z[n]==c.r && z[n+1]==c.g && z[n+2]==c.b && z[n+3]==c.a) b = 1;
        // test max height
        if((z[n]-w) > 10) b = 1;
        else this.oldColors[n] = z[n];

        return b;
    },
    /*heightTest:function(n){
        return this.zone[n] || 0;
    },*/
    setMapTestSize:function(s){
        //this.zsize = [(this.miniSize.w*0.5)-s, (this.miniSize.h*0.5)-s, s*2];
        this.zsize = [(this.miniSize.w*0.5)-s, (this.miniSize.h*0.5)-s, s*2];
        this.lock =  [0,0,0,0, 0,0,0,0];
        var max =((s*2)*(s*2))*4;

        //[          front,  back,  left,        right,                fl,   fr,     bl,  br,       middle];
        //             0       1      2             3                  4     5       6    7         8
        this.pp = [max-(s*4), s*4, max*0.5, max*0.5 + (((s*4)*2)-4), 211*4, 222*4, 34*4, 45*4,  max*0.5+(s*4)];//+ (s*4)];
        this.zone = new this.ar8(max);
        this.zoneInv = new this.ar8(max);
    },
    initTopMap:function(){
        var ctx3 = this.miniTop.getContext("2d");
        ctx3.fillStyle = 'black';
        ctx3.fillRect(0, 0, 1, this.miniSize.h);
        ctx3.fillRect(this.miniSize.w-1, 0, 1, this.miniSize.h);
        ctx3.fillRect(1, 0, this.miniSize.w-2, 1);
        ctx3.fillRect(1,this.miniSize.h-1, this.miniSize.w-2, 1);
        ctx3.save();
        ctx3.translate((this.miniSize.w*0.5), (this.miniSize.h*0.5));
        this.drawPlayer(ctx3);
        ctx3.restore();

        this.ctxTest = this.mapTest.getContext("2d");
    },
    drawMapTest:function() {
        this.ctxTest.clearRect ( 0 , 0 , 16 , 16 );
        var id = this.ctxTest.createImageData(16,16);
        var d  = id.data;
        var i = 7;
        while(i--)d[i] = 0;

        if(this.lock[1]) this.dp(d, this.pp[0]);
        if(this.lock[0]) this.dp(d, this.pp[1]);
        if(this.lock[2]) this.dp(d, this.pp[2]);
        if(this.lock[3]) this.dp(d, this.pp[3]);
        if(this.lock[6]) this.dp(d, this.pp[4]);
        if(this.lock[7]) this.dp(d, this.pp[5]);
        if(this.lock[4]) this.dp(d, this.pp[6]);
        if(this.lock[5]) this.dp(d, this.pp[7]);

        this.ctxTest.putImageData( id, 0, 0);
    },
    dp:function(d, p) {
        d[p] = 255;
        d[p+1] = 255;
        d[p+3] = 255;
    },
    drawPlayer:function(ctx) {
        ctx.fillStyle = "rgba(255,255,200,0.2)";
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(30, -30);
        ctx.lineTo(-30, -30);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(200,200,100,1)";
        ctx.fillRect(-2, -2, 4, 4);
    }
};

// ----------------------- Navigation

HeroGame.Navigation = function(container, camera, revers){
	this.revers = revers || false;
    this.camera = camera;
    this.container = container;
    this.cam = { h:90, v:90, distance:200, automove:false, vmax:179.99, vmin:0.01  };
    this.mouse = { x:0, y:0, ox:0, oy:0, h:0, v:0, mx:0, my:0, down:false, over:false, moving:true, button:0 };
    this.vsize = { w:window.innerWidth, h:window.innerHeight};
    this.target = new THREE.Vector3();
    this.key = [0,0,0,0,0,0,0];
    this.rayTest = null;

    this.initEvents(true); 
    this.initCamera();
}

HeroGame.Navigation.prototype = {
    constructor: HeroGame.Navigation,
    initCamera : function (h,v,d) {
        this.cam.h = h || 90;
        this.cam.v = v || 90;
        this.cam.distance = d || 3;
        this.moveCamera();
    },
    moveCamera : function () {
        this.camera.position.copy(this.Orbit(this.target, this.cam.h, this.cam.v, this.cam.distance));
        this.camera.lookAt(this.target);
    },
    Orbit : function (origine, h, v, distance) {
        origine = origine || new THREE.Vector3();
        var p = new THREE.Vector3();
        var phi = v*HeroGame.ToRad;
        var theta = h*HeroGame.ToRad;
        p.x = (distance * Math.sin(phi) * Math.cos(theta)) + origine.x;
        p.z = (distance * Math.sin(phi) * Math.sin(theta)) + origine.z;
        p.y = (distance * Math.cos(phi)) + origine.y;
        return p;
    },
    unwrapDegrees:function(r){
        r = r % 360;
        if (r > 180) r -= 360;
        if (r < -180) r += 360;
        return r;
    },
    initEvents : function (isWithKey){
        var _this = this;
        // disable context menu
        document.addEventListener("contextmenu", function(e){ e.preventDefault(); }, false);

        this.container.addEventListener( 'mousemove', function(e) {_this.onMouseMove(e)}, false );
        this.container.addEventListener( 'mousedown', function(e) {_this.onMouseDown(e)}, false );
        this.container.addEventListener( 'mouseout',  function(e) {_this.onMouseUp(e)}, false );
        this.container.addEventListener( 'mouseup', function(e) {_this.onMouseUp(e)}, false );

        if (typeof window.ontouchstart !== 'undefined') {
            this.container.addEventListener( 'touchstart', function(e) {_this.onMouseDown(e)}, false );
            this.container.addEventListener( 'touchend', function(e) {_this.onMouseUp(e)}, false );
            this.container.addEventListener( 'touchmove', function(e) {_this.onMouseMove(e)}, false );
        }

        this.container.addEventListener( 'mousewheel', function(e) {_this.onMouseWheel(e)}, false );
        this.container.addEventListener( 'DOMMouseScroll', function(e) {_this.onMouseWheel(e)}, false );

        if(isWithKey) this.bindKeys();
    },
    onMouseRay : function(x,y){
        this.mouse.mx = ( this.mouse.x / this.vsize.w ) * 2 - 1;
        this.mouse.my = - ( this.mouse.y / this.vsize.h ) * 2 + 1;
        this.rayTest();
    },
    onMouseMove : function(e){
        e.preventDefault();
        var px, py;
        if(e.touches){
            this.mouse.x = e.clientX || e.touches[ 0 ].pageX;
            this.mouse.y = e.clientY || e.touches[ 0 ].pageY;
        } else {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        }
        if(this.rayTest !== null) this.onMouseRay();
        if (this.mouse.down ) {
            document.body.style.cursor = 'move';
            if(this.revers) this.cam.h = (-(this.mouse.x - this.mouse.ox) * 0.3) + this.mouse.h;
            else this.cam.h = ((this.mouse.x - this.mouse.ox) * 0.3) + this.mouse.h;
            this.cam.v = (-(this.mouse.y - this.mouse.oy) * 0.3) + this.mouse.v;
            if(this.cam.v<this.cam.vmin) this.cam.v = this.cam.vmin;
            if(this.cam.v>this.cam.vmax) this.cam.v = this.cam.vmax;
            this.moveCamera();
        }
    },
    onMouseDown : function(e){
        e.preventDefault();
        var px, py;
        if(e.touches){
            px = e.clientX || e.touches[ 0 ].pageX;
            py = e.clientY || e.touches[ 0 ].pageY;
        } else {
            px = e.clientX;
            py = e.clientY;
            // 0: default  1: left  2: middle  3: right
            this.mouse.button = e.which;
        }
        this.mouse.ox = px;
        this.mouse.oy = py;
        this.mouse.h = this.cam.h;
        this.mouse.v = this.cam.v;
        this.mouse.down = true;
        if(this.rayTest !== null) this.onMouseRay(px,py);
    },
    onMouseUp : function(e){
        this.mouse.down = false;
        document.body.style.cursor = 'auto';
    },
    onMouseWheel : function (e) {
        var delta = 0;
        if(e.wheelDeltaY){delta=e.wheelDeltaY*0.01;}
        else if(e.wheelDelta){delta=e.wheelDelta*0.05;}
        else if(e.detail){delta=-e.detail*1.0;}
        this.cam.distance-=(delta*10)*0.01;
        this.moveCamera();   
    },
    // ACTIVE KEYBOARD
    bindKeys:function(){
        var _this = this;
        document.onkeydown = function(e) {
            e = e || window.event;
            switch ( e.keyCode ) {
                case 38: case 87: case 90: _this.key[0] = 1; break; // up, W, Z
                case 40: case 83:          _this.key[1] = 1; break; // down, S
                case 37: case 65: case 81: _this.key[2] = 1; break; // left, A, Q
                case 39: case 68:          _this.key[3] = 1; break; // right, D
                case 17: case 67:          _this.key[4] = 1; break; // ctrl, C
                case 69:                   _this.key[5] = 1; break; // E
                case 32:                   _this.key[6] = 1; break; // space
                case 16:                   _this.key[7] = 1; break; // shift
            }
        }
        document.onkeyup = function(e) {
            e = e || window.event;
            switch( e.keyCode ) {
                case 38: case 87: case 90: _this.key[0] = 0; break; // up, W, Z
                case 40: case 83:          _this.key[1] = 0; break; // down, S
                case 37: case 65: case 81: _this.key[2] = 0; break; // left, A, Q
                case 39: case 68:          _this.key[3] = 0; break; // right, D
                case 17: case 67:          _this.key[4] = 0; break; // ctrl, C
                case 69:                   _this.key[5] = 0; break; // E
                case 32:                   _this.key[6] = 0; break; // space
                case 16:                   _this.key[7] = 0; break; // shift
            }
        }
        //self.focus();
    }
}



/**
* @author loth / http://3dflashlo.wordpress.com/
*
* Simple deep y shader
*/

HeroGame.deepShader={
    attributes:{},
    uniforms:{ 
    	deep: {type: 'f', value: 0.03904}
    },
    fs:[
        'precision lowp float;',
        'varying vec4 vc;',
        'void main(void) { gl_FragColor = vc; }'
    ].join("\n"),
    vs:[
        'uniform float deep;',
        'varying float dy;',
        'varying vec4 vc;',
        'void main(void) {',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            'dy = position.y*deep;',
            'vc = vec4(dy,dy,dy, 1.0);',
        '}'
    ].join("\n")
};