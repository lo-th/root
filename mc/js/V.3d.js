/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

var canvas, info, debug;
var THREE, mainClick, mainDown, mainUp, mainMove, mainRay, v, shader, loader;

var V = {};
var TWEEN = TWEEN || null;
V.AR8 = typeof Uint8Array!="undefined"?Uint8Array:Array;
V.AR16 = typeof Uint16Array!="undefined"?Uint16Array:Array;
V.AR32 = typeof Float32Array!="undefined"?Float32Array:Array;

V.PI = Math.PI;
V.PI90 = V.PI*0.5;
V.PI270 = V.PI+V.PI90;
V.TwoPI = 2.0 * V.PI;
V.ToRad = V.PI / 180;
V.ToDeg = 180 / V.PI;
V.Resolution = { w:1600, h:900, d:200, z:10, f:40 };
V.sqrt = Math.sqrt;
V.abs = Math.abs;
V.max = Math.max;
V.pow = Math.pow;
V.floor = Math.floor;
V.round = Math.round;
V.lerp = function (a, b, percent) { return a + (b - a) * percent; }
V.rand = function (a, b, n) { return V.lerp(a, b, Math.random()).toFixed(n || 3)*1;}
V.randInt = function (a, b, n) { return V.lerp(a, b, Math.random()).toFixed(n || 0)*1;}
V.randColor = function () { return '#'+Math.floor(Math.random()*16777215).toString(16);}
V.randTColor = function () { return '0x'+Math.floor(Math.random()*16777215).toString(16);}
V.MeshList = [ 'plane', 'sphere', 'skull', 'skullhigh', 'head', 'woman', 'babe'];
V.Main = null;

V.View = function(h,v,d,f, emvmap){

    this.info = '';
    this.initScene = null;

    this.seriouseffect = false;
    this.seriousEditor = null;

    this.changeSource = false;

    this.currentScene = '';

    this.bgColor = scene_settings.bgColor;
    

    this.f = [0,0,0,0];
    this.follow = true;
    this.camPreview = false;
    this.camLimite = false;
    this.currentCamera = 4;

    this.dimentions = {w:window.innerWidth,  h:window.innerHeight, r:window.innerWidth/window.innerHeight };

	this.canvas = document.getElementById('three_canvas');//canvas;

    this.debug = debug;

    this.scene = new THREE.Scene();
    //this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );
    //this.scene.fog = null;//new THREE.Fog(('0x'+bgcolor)*1, 300, 1200);
    
    this.cameraGroup = new THREE.Group();
    this.scene.add(this.cameraGroup);

    this.previewGroup = new THREE.Group();
    this.cameraGroup.add(this.previewGroup);

    this.clock = new THREE.Clock();

    //this.mat = new THREE.MeshBasicMaterial({color:0xFFFFFF, wireframe:true});
    //this.geo = new THREE.CylinderGeometry( 0.4, 0, 1, 10, 1 )

    
    
    this.nav = new V.Nav(this,h,v,d,f);

    if(emvmap!==null){
        this.environment = THREE.ImageUtils.loadTexture( 'textures/'+ emvmap);
        this.environment.mapping = THREE.SphericalReflectionMapping;
    }

    //this.renderer = new THREE.WebGLRenderer({ precision:"mediump", canvas:this.canvas, antialias:false, alpha:false, stencil:false });
    this.renderer = new THREE.WebGLRenderer({ precision:"mediump", canvas:this.canvas, antialias:true, alpha:false});//, preserveDrawingBuffer: true});
    //this.renderer = new THREE.WebGLRenderer({ canvas:canvas});
    this.renderer.setSize( this.dimentions.w, this.dimentions.h );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor( this.bgColor , 1 );
    this.renderer.autoClear = true;

   // console.log(this.renderer)

    this.initCamera();


    this.texture = [];
    this.txtSetting = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat, stencilBuffer:false};//, depthBuffer:false };
    
    //this.initPreview();
    
	window.onresize = function(e) {this.resize(e)}.bind(this);
}

V.View.prototype = {
    constructor: V.View,
    render:function(){
        //if(this.changeSource) return;

        

        
        // this.renderer.render( this.scene, this.cameras[this.currentCamera] );
        if(this.initScene!==null){
            //this.renderer.resetGLState();
            //this.renderer.render( this.scene, this.cameras[this.currentCamera] );
            this.initScene.init();
            this.initScene=null;
           // console.log(this.renderer)
        }

        

       


        //if(this.seriouseffect){
            //this.renderer.resetGLState();
            /*this.renderer.setRenderTarget(null);
            this.renderer.render( this.scene, this.cameras[this.currentCamera], this.textureSerious, true);
            
            this.ssource.update();
            this.seriousEditor.render();*/

            //this.renderer.clearTarget(this.texture[4]);
            //


        //}else{
        //    this.renderer.render( this.scene, this.cameras[this.currentCamera] );
        //}


        if(!this.seriouseffect){
            //this.renderer.clear();
            this.renderer.setClearColor( this.bgColor , 1 );
            this.renderer.render( this.scene, this.cameras[this.currentCamera] );
        }

        

        


        if(this.currentCamera==4 && this.camPreview){
            this.previewGroup.visible = true;
            var i = this.mat.length;
            while(i--){
                //if(this.seriouseffect)this.renderer.setRenderTarget(null);
                this.mat[i].map = this.dummyTexture;
                this.renderer.render( this.scene, this.cameras[i], this.texture[i], true );
                this.mat[i].map = this.texture[i];
            }
        }else{
            this.previewGroup.visible = false;
        }




        
        var f = this.f;
        f[0] = Date.now();
        if (f[0]-1000 > f[1]){ f[1] = f[0]; f[3] = f[2]; f[2] = 0; } f[2]++;

        this.getInfo();

        
    },
    getInfo:function(){
        var r = this.renderer.info;
        this.info = 'fps:' + this.f[3];
        this.info += ' Memory:{p:'+r.memory.programs+' g:'+r.memory.geometries+' t:'+r.memory.textures+'}';
        this.info += ' Render:{c:'+r.render.calls+' v:'+ r.render.vertices+' f:'+r.render.faces+ ' p:'+r.render.points+'}';
    },
    stopSeriously:function(){
        this.seriouseffect = false;
        this.seriousEditor.seriously.stop();
    },
    setSeriously:function(ed){
        //this.changeSource = true;
        if(this.seriousEditor==null){

            this.seriousEditor = ed;

            
            
            //console.log(this.seriousEditor.seriously)
            //this.renderer.setRenderTarget(null);
            //this.renderer = new THREE.WebGLRenderer({canvas:this.canvas, antialias:false, alpha:false });
            //this.textureSerious = new THREE.WebGLRenderTarget( this.dimentions.w, this.dimentions.h, this.txtSetting );
            //this.renderer.render( this.scene, this.cameras[this.currentCamera], this.textureSerious, true);

            this.textureSerious = new THREE.WebGLRenderTarget( this.dimentions.w, this.dimentions.h, this.txtSetting );
           // this.renderer.render( this.scene, this.cameras[this.currentCamera], this.textureSerious, true);
            this.ssource = this.seriousEditor.add('texture', {id:0, texture:this.textureSerious});

            

            //this.ssource = this.seriousEditor.add('texture', {id:0, texture:this.textureSerious});
            this.ssource.update();

            this.seriousEditor.root_source = this.ssource.name;

            this.sfilter = this.seriousEditor.add('ascii');
            this.sfilter2 = this.seriousEditor.add('tvglitch');
            this.sfilter3 = this.seriousEditor.add('pixelate');


            this.starget = this.seriousEditor.add('canvas-3D', {canvas:this.canvas});

            this.seriousEditor.root_target = this.starget.name;

            this.seriousEditor.current_source_node = this.starget.name;


            

            //this.sfilter.source = this.ssource;

            //this.ssource.tt = this.sfilter.name;

            //this.currentSource =  this.sfilter.name;


            this.starget.source = this.ssource;//this.sfilter;
            //this.currentSource =  this.starget.name;

            //this.starget.width = this.dimentions.w;
            //this.starget.height = this.dimentions.h;
           

            //console.log(this.starget)

            //this.ssource.update();
            //this.seriousEditor.render();
        }

        
        this.seriouseffect = true;
        this.camPreview = false

        this.seriousEditor.seriously.go(function (now) {

            this.renderer.setRenderTarget(null);
            this.renderer.setClearColor( this.bgColor , 1 );
            this.renderer.render( this.scene, this.cameras[this.currentCamera], this.textureSerious, true);        
            this.ssource.update();
        }.bind(this));

        this.resize();

        //console.log(this.ssource);

        

       // 
        //this.changeSource = false;
        
    },
    updateBG:function(){
        this.bgColor = scene_settings.bgColor;
        this.renderer.setClearColor(this.bgColor , 1 );
    },
    resize:function(){
        this.dimentions.w = window.innerWidth;
        this.dimentions.h = window.innerHeight;
        this.dimentions.r = this.dimentions.w/this.dimentions.h;
        this.renderer.setSize( this.dimentions.w, this.dimentions.h );
        //this.renderer2.setSize( this.dimentions.w, this.dimentions.h );
        this.cameras[4].aspect = this.dimentions.r;
        this.cameras[4].updateProjectionMatrix();

        this.cameras[5].aspect = this.dimentions.r;
        this.cameras[5].updateProjectionMatrix();

        if(this.seriouseffect){
           //var tmpsrc = this.ssource.tt;
            
            // this.changeSource = true;
            this.ssource.destroy();
            this.textureSerious = new THREE.WebGLRenderTarget( this.dimentions.w, this.dimentions.h, this.txtSetting );
            this.ssource = this.seriousEditor.add('texture', {id:0, texture:this.textureSerious});

            //console.log('yooo',this.ssource)

            //this.seriousEditor.seriously.texture = this.texture[4];
            //this.ssource.initialized = true;
            //this.ssource.allowRefresh = true;
            //this.ssource.setReady()

            this.starget.width = this.dimentions.w;
            this.starget.height = this.dimentions.h;

           // this.changeSource = false;
           //this.sfilter.source = this.ssource;
           //this.starget.source = this.sfilter;

           this.seriousEditor.byNAME(this.seriousEditor.current_source_node).source = this.ssource;
        }

        
    },
    orbit:function(v, h, d, ref){
        var p = new THREE.Vector3();
        var phi = v*V.ToRad;
        var theta = h*V.ToRad;
    
        p.x = d * Math.sin(phi) * Math.cos(theta);
        p.y = d * Math.cos(phi);
        p.z = d * Math.sin(phi) * Math.sin(theta);
        if(ref)p.add(ref);
        return p
    },
    initCamera:function(){
        var look = new THREE.Vector3();
        this.cameras = [];
        this.camerasHelper = [];
        var fox = 13/10;
        var foy = 13/10;
        var r = 13/5.4;

        for(var i=0; i<4; i++){
            this.cameras[i] =  new THREE.PerspectiveCamera( 19.525, r, 0.1, 2000);
            look = this.orbit(90, (i*45)+22.5, 10);
            this.cameras[i].position.set(0,0,0);
            this.cameras[i].lookAt(look);
            this.camerasHelper[i] = new THREE.CameraHelper( this.cameras[i] ); 
            
            this.cameraGroup.add(this.cameras[i]);
            this.scene.add( this.camerasHelper[i] );
        }

        this.cameras[4] = this.nav.camera;

        this.cameraTop = new THREE.PerspectiveCamera( 50, this.dimentions.r, 0.1, 2000 );
        this.cameraTop.position.y = 1000;
        this.cameraTop.lookAt(new THREE.Vector3());
        this.cameras[5] = this.cameraTop;

        this.camHelper();
    },
    camHelper:function(){
        var i = this.camerasHelper.length;
        while(i--){
            this.camerasHelper[i].visible = this.camLimite;
        }

    },
    initPreview:function(){
        var decal = 0.1
        var frontGeo = new THREE.PlaneBufferGeometry( 10.8, 5.4 );
        var sideGeo = new THREE.PlaneBufferGeometry( 13, 5.4 );
        this.dummyTexture = new THREE.WebGLRenderTarget( 2, 2, this.txtSetting );//new THREE.Texture();
        this.renderer.render( this.scene, this.cameras[this.currentCamera], this.dummyTexture, true);

       
        var resolution = {w:1000, h:600};

        
        this.mat = [];
        this.screen = [];

        var i = 4;
        while(i--){
            this.texture[i] = new THREE.WebGLRenderTarget( resolution.w, resolution.h, this.txtSetting );
            this.mat[i] = new THREE.MeshBasicMaterial( { map: this.dummyTexture } );
            //this.mat[i] = new THREE.MeshBasicMaterial( { map: this.texture[i] } );
            switch(i){
                case 0: // left
                this.screen[i] = new THREE.Mesh( sideGeo, this.mat[i] );
                this.screen[i].position.set(-10.8-(decal+(decal*0.5)), 0, 6.5);
                this.screen[i].rotation.y = V.PI90;
                break;
                case 1: // front left
                this.screen[i] = new THREE.Mesh( frontGeo, this.mat[i] );
                this.screen[i].position.x = -5.4-(decal*0.5);
                break;
                case 2: // front right
                this.screen[i] = new THREE.Mesh( frontGeo, this.mat[i] );
                this.screen[i].position.x = 5.4+(decal*0.5);
                break;
                case 3: // right
                this.screen[i] = new THREE.Mesh( sideGeo, this.mat[i] );
                this.screen[i].position.set(10.8+(decal+(decal*0.5)), 0, 6.5);
                this.screen[i].rotation.y = -V.PI90;
                break;
            }
            this.previewGroup.add( this.screen[i] );
        }
        this.previewGroup.rotation.y = V.PI;
        this.previewGroup.rotation.x = -20*V.ToRad;
        this.previewGroup.position.set(0,12,26);
        this.previewGroup.visible = false;
    }
       
}


//---------------------------------------------------
//   NAVIGATION
//---------------------------------------------------

V.Nav = function(parent, h, v, d, f){
	this.isFocus = false;
    this.isRevers = false;
    this.cammode = 'normal';
    this.EPS = 0.000001;
	this.root = parent;

	this.cursor = new V.Cursor();
    this.lockView = false;

	this.camera = new THREE.PerspectiveCamera( f||40, this.root.dimentions.r, 0.1, 2000 );
    //this.helper = new THREE.CameraHelper( this.camera );
    //this.root.scene.add(this.helper) 
    this.root.scene.add(this.camera)
	this.mouse3d = new THREE.Vector3();
	this.selectName = '';

	this.rayVector = new THREE.Vector3( 0, 0, 1 );
	this.raycaster = new THREE.Raycaster();
	this.target = new THREE.Vector3();
    this.position = new THREE.Vector3();
	this.cam = { horizontal:h||0, vertical:v||90, distance:d||20, automove:false, theta:0, phi:0 };
    this.mouse = { x:0, y:0, ox:0, oy:0, h:0, v:0, mx:0, my:0, px:0, py:0, pz:0, r:0, down:false, move:true, button:0 };

    this.key = { up:0, down:0, left:0, right:0, ctrl:0, action:0, space:0, shift:0 };
    //this.imput = new V.UserImput(this);

    this.moveCamera();

    
    this.root.canvas.oncontextmenu = function(e){e.preventDefault()};
    this.root.canvas.onclick = function(e) {this.onMouseClick(e)}.bind( this );
    this.root.canvas.onmousemove = function(e) {this.onMouseMove(e)}.bind( this );
    this.root.canvas.onmousedown = function(e) {this.onMouseDown(e)}.bind( this );
    this.root.canvas.onmouseout = function(e) {this.onMouseOut(e)}.bind( this );
    this.root.canvas.onmouseup = function(e) {this.onMouseUp(e)}.bind( this );
    this.root.canvas.onmousewheel = function(e) {this.onMouseWheel(e)}.bind( this );
    //this.root.canvas.onDOMMouseScroll = function(e) {this.onMouseWheel(e)}.bind( this );
    this.root.canvas.addEventListener('DOMMouseScroll', function(e){this.onMouseWheel(e)}.bind( this ), false );
}

V.Nav.prototype = {
	constructor: V.Nav,
	moveCamera:function(){
        this.orbit();
        this.camera.position.copy(this.position);
        this.camera.lookAt(this.target);

       // console.log(this.camera.up)

        if(this.root.follow){
            this.root.cameraGroup.position.copy(this.position);
            this.root.cameraGroup.lookAt(this.target);
        }
    },
    moveSmooth:function(){
        this.orbit();
        this.camera.position.lerp(this.position, 0.3);
        this.camera.lookAt(this.target);
    },
    revers:function(){
        this.isRevers = true;
        this.camera.scale.x = -1; 
    },
    orbit:function(){
        var p = this.position;
        var d = this.cam.distance;
        var phi = this.cam.vertical*V.ToRad;
        var theta = this.cam.horizontal*V.ToRad;
        phi = Math.max( this.EPS, Math.min( Math.PI - this.EPS, phi ) );
        this.cam.theta = theta;
        this.cam.phi = phi;
        p.x = d * Math.sin(phi) * Math.cos(theta);
        p.y = d * Math.cos(phi);
        p.z = d * Math.sin(phi) * Math.sin(theta);
        p.add(this.target);
    },
    mode:function(){
        if(this.cammode == 'normal'){
            this.cammode = 'fps';
            this.cam.distance = 0.1;
        }else{
            this.cammode = 'normal';
            this.cam.distance = 20;
        }
        this.moveSmooth();
    },
    move:function(v){
        this.target.copy(v);
        this.moveCamera();
    },
    moveto:function(x,y,z){
        this.target.set(x,y,z);
        this.moveCamera();
    },
    onMouseClick:function(e){
        e.preventDefault();
        if (typeof mainClick == 'function') { mainClick(); }
    },
    onMouseDown:function(e){
        this.mouse.down = true;
        this.mouse.button = e.which;
        //console.log(e.which)
        this.mouse.ox = e.clientX;
        this.mouse.oy = e.clientY;
        this.mouse.h = this.cam.horizontal;
        this.mouse.v = this.cam.vertical;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.px = this.target.x;
        this.mouse.pz = this.target.z;
        this.mouse.py = this.target.y;
        
	    //this.rayTest();
        //if (typeof mainDown == 'function') { mainDown(); }
        e.preventDefault();
        e.stopPropagation();
        //document.body.contentEditable=true
        //window.top.focus();
    },
    onMouseUp:function(e){
        this.mouse.down = false;
        this.cursor.change();
        if (typeof mainUp == 'function') { mainUp(); }
        e.preventDefault();
        e.stopPropagation();
    },
    onMouseOut:function(e){
    	this.isFocus = false;
        this.mouse.down = false;
        this.cursor.change();
        if (typeof mainUp == 'function') { mainUp(); }
        e.preventDefault();
        e.stopPropagation();
    },
    onMouseMove:function(e){
    	if(!this.isFocus){
    		self.focus();
    		//window.top.main.blur();
    		this.isFocus = true;
    	}
        if (this.mouse.down && this.mouse.move && !this.lockView) {
            if(this.mouse.button==3){
                this.cursor.change('drag');
                var px = -((e.clientX - this.mouse.ox) * 0.3);
                if(this.isRevers){
                    this.target.x = -(Math.sin(this.cam.theta) * px) +  this.mouse.px;
                    this.target.z = (Math.cos(this.cam.theta) * px) +  this.mouse.pz;
                }else{
                    this.target.x = (Math.sin(this.cam.theta) * px) +  this.mouse.px;
                    this.target.z = -(Math.cos(this.cam.theta) * px) +  this.mouse.pz;
                }
                this.target.y = ((e.clientY - this.mouse.oy) * 0.3) + this.mouse.py;
            }else{
                this.cursor.change('rotate');
                if(this.isRevers) this.cam.horizontal = -((e.clientX - this.mouse.ox) * 0.3) + this.mouse.h;
                else this.cam.horizontal = ((e.clientX - this.mouse.ox) * 0.3) + this.mouse.h;
                this.cam.vertical = (-(e.clientY - this.mouse.oy) * 0.3) + this.mouse.v;
                if (this.cam.vertical < 0){ this.cam.vertical = 0; }
            }
            this.moveCamera();
        }
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        //this.rayTest();
        //if (typeof mainMove == 'function') { mainMove(); }
        e.preventDefault();
        e.stopPropagation();
    },
    onMouseWheel:function(e){
        if(this.cammode=='fps') return;
        var delta = 0;
        if(e.wheelDeltaY){delta=e.wheelDeltaY*0.01;}
        else if(e.wheelDelta){delta=e.wheelDelta*0.05;}
        else if(e.detail){delta=-e.detail*1.0;}
        this.cam.distance -= delta;
        if(this.cam.distance<0.5)this.cam.distance = 0.5;
        this.moveCamera();
        e.preventDefault();
        e.stopPropagation();
    }
}

//---------------------------------------------------
//   CURSOR
//---------------------------------------------------

V.Cursor = function(){
	this.current = 'auto';
	this.type = {
		drag : 'move',
        rotate  : 'move',
		move : 'move',
		auto : 'auto'
	}
}

V.Cursor.prototype = {
	constructor: V.Cursor,
	change: function(name){
		name = name || 'auto';
		if(name!==this.current){
			this.current = name;
			document.body.style.cursor = this.type[this.current];
		}
	}
}