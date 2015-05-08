
V.Interface = function(root){
	this.cam = new V.CamInterface();
	this.scene = new V.SceneInterface(root, this);
    this.effect = new V.EffectInterface(root);
    this.logo = document.createElement('div');
    this.logo.style.cssText = 'position:absolute; left:50%; top:50%; width:256px; height:256px; margin-left:-128px; margin-top:-128px; pointer-events:none; transform:scale(0.5,0.5);';
    this.logo.innerHTML =  V.LogoMc();
    document.body.appendChild( this.logo );

}
V.Interface.prototype = {
    constructor: V.Interface,
    init:function(){
    	this.cam.init();
    	this.cam.show(v.currentCamera);
    	this.scene.init();
    },
    run:function(name){
    	this.scene.run(name);
    },
    noLogo:function(){
        if(this.logo){
            document.body.removeChild(this.logo);
            this.logo = null;
        }
    }
}

// CAMERA

V.CamInterface = function(){
	this.content = document.createElement( 'div' );
	this.content.style.cssText ='position:absolute; left:5px; top:5px; width:160px;';
	this.content.innerHTML = 'Cameras<br>';
	document.body.appendChild( this.content );
	this.b = [];
	this.prev = null;
	this.cam = null;
}

V.CamInterface.prototype = {
    constructor: V.CamInterface,
    init:function(){
    	var b;
    	for(var i=0; i<6; i++){
    		b = document.createElement('div');
    		b.style.cssText = 'display:inline-block; text-align:center; width:14px; height:14px; cursor:pointer; border:1px solid #888; margin-right:4px;';
    		if(i==3)b.style.marginRight = '8px';
    		//if(i==5)b.style.display = 'block';
    		b.innerHTML = i;
    		b.name = i;
    		b.onclick = function(e){ this.select(e)  }.bind(this);
    		this.content.appendChild( b );
    		this.b[i] = b;
    	}

    	this.cam = document.createElement('div');
    	this.cam.style.cssText = 'display:inline-block; text-align:center; width:55px; height:14px; cursor:pointer; border:1px solid #888; margin-top:4px; margin-right:6px;';
    	this.cam.innerHTML = 'limite';
    	if(v.camLimite) this.cam.style.background = '#FF00FF';
    	else this.cam.style.background = 'none';
    	this.cam.onclick = function(e){ this.limiteCam(e);  }.bind(this);
    	this.content.appendChild( this.cam );

    	this.prev = document.createElement('div');
    	this.prev.style.cssText = 'display:none; text-align:center; width:55px; height:14px; cursor:pointer; border:1px solid #888; margin-top:4px;';
    	this.prev.innerHTML = 'preview';
    	if(v.camPreview) this.prev.style.background = '#FF00FF';
    	else this.prev.style.background = 'none';
    	this.prev.onclick = function(e){ this.preview(e);  }.bind(this);
    	this.content.appendChild( this.prev );
    },
    limiteCam:function(e){
    	if(v.camLimite){
    		v.camLimite = false;
    		this.cam.style.background = 'none';
    	} else {
    		v.camLimite = true;
    		this.cam.style.background = '#FF00FF';
    	}
    	v.camHelper();
    },
    preview:function(e){
    	if(v.camPreview){
    		v.camPreview = false;
    		this.prev.style.background = 'none';
    	} else {
    		v.camPreview = true;
    		this.prev.style.background = '#FF00FF';
    	}
    },
    select:function(e){
    	var n = e.target.name * 1;
    	v.currentCamera = n;
    	this.show(n);
    },
    show:function(n){
    	var i = this.b.length;
    	while(i--){
    		this.b[i].style.background = 'none';
    		if(n==i)this.b[i].style.background = '#FF00FF';
    	}
    	if(n==4){
    		this.prev.style.display = 'inline-block';
    	} else {
    		this.prev.style.display = 'none';
    	}
    }
}

// SCENE

V.SceneInterface = function(root, tt){
    this.root = root;
    this.pp = tt;
	this.content = document.createElement( 'div' );
	this.content.style.cssText ='position:absolute; left:5px; top:60px; width:160px;';
	this.content.innerHTML = 'Scenes<br>';
	document.body.appendChild( this.content );
	this.b = [];

	this.current = -1;
	//this.run(v.currentScene);
}
V.SceneInterface.prototype = {
    constructor: V.SceneInterface,
    init:function(){
    	var b;
    	for(var i=0; i<scenes.length; i++){
    		b = document.createElement('div');
    		b.style.cssText = 'display:block; text-align:left; width:120px; height:14px; cursor:pointer; border:1px solid #888; margin-top:4px;';
    		b.innerHTML = i+'-'+scenes[i].name;
    		b.name = i;
    		b.onclick = function(e){ this.select(e); }.bind(this);
    		this.content.appendChild( b );
    		this.b[i] = b;
    	}
    },
    run:function(name){
    	for(var i=0; i<scenes.length; i++){
    		if(scenes[i].name==name)this.show(i);
    	}
    },
    select:function(e){
    	var n = e.target.name * 1;
    	if(n!==this.current){
    		if(this.current!==-1)scenes[this.current].clearAll();

            this.root.initScene = scenes[n];
    		//scenes[n].init();
    	}else{
            if(this.current!==-1)scenes[this.current].clearAll();
            this.current = -1;
            this.show(-1);
        }
    },
    show:function(n){
    	this.current = n;
    	var i = this.b.length;
    	while(i--){
    		this.b[i].style.background = 'none';
    		if(n==i){
                this.pp.noLogo();
                this.b[i].style.background = '#FF00FF';
            }
    	}
    }
}

// EFFECT

V.EffectInterface = function(root){
    this.root = root;
    this.content = document.createElement( 'div' );
    this.content.style.cssText ='position:absolute; left:5px; top:160px; width:160px;';
    this.content.innerHTML = 'Effects<br>';
    document.body.appendChild( this.content );
    
    var b = document.createElement('div');
    b.style.cssText = 'display:block; text-align:center; width:120px; height:14px; cursor:pointer; border:1px solid #888; margin-top:4px;';
    b.innerHTML = 'Active effect';
    b.onclick = function(e){ this.select(); }.bind(this);
    this.content.appendChild( b );
    this.b = b;
}

V.EffectInterface.prototype = {
    constructor: V.EffectInterface,
    select:function(){
        if(isWithEffect){
            isWithEffect = false;
            stopEffect();
            this.b.style.background = 'none';
        }else{
            isWithEffect = true;
            startEffect();
            this.b.style.background = '#FF00FF';
        }
    }
}

// LOGO SVG

V.LogoMc = function(){
    var color = 'FFF';
    var width = 256;
    var Kwidth = '0 0 256 256';
    var t = [];
    t[0] = "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='"+width+"px' height='"+width+"px' viewBox='"+Kwidth+"';'><g>";
    t[1] = "<path fill='#"+color+"' d='M 3 253 L 253 253 253 3 3 3 3 253 M 251 251 L 5 251 5 5 251 5 251 251 M 11 245 L 245 245 245 11 11 11 11 245 M 243 243 L 13 243 13 13 243 13 243 243 M 19 237 L 237 237 237 19 19 19 19 237 M 235 235 L 21 235 21 21 235 21 235 235 M 27 229 L 229 229 229 27 27 27 27 229 M 227 227 L 29 227 29 29 227 29 227 227 M 35 221 L 221 221 221 35 35 35 35 221 M 219 219 L 37 219 37 37 219 37 219 219 M 43 213 L 213 213 213 43 43 43 43 213 M 211 211 L 45 211 45 45 211 45 211 211 M 179 141 L 179 147 83 147 83 173 205 173 205 115 109 115 109 109 205 109 205 83 83 83 83 141 179 141 M 181 149 L 181 139 85 139 85 85 203 85 203 107 107 107 107 117 203 117 203 171 85 171 85 149 181 149 M 187 133 L 187 155 91 155 91 165 197 165 197 123 101 123 101 101 197 101 197 91 91 91 91 133 187 133 M 189 157 L 189 131 93 131 93 93 195 93 195 99 99 99 99 125 195 125 195 163 93 163 93 157 189 157 M 205 77 L 205 51 51 51 51 205 205 205 205 179 77 179 77 77 205 77 M 203 53 L 203 75 75 75 75 181 203 181 203 203 53 203 53 53 203 53 M 197 69 L 197 59 59 59 59 197 197 197 197 187 69 187 69 69 197 69 M 195 61 L 195 67 67 67 67 189 195 189 195 195 61 195 61 61 195 61 Z'/>";
    t[2] = "</g></svg>";
    return t.join("\n");
}