
V.CamInterface = function(){
	this.content = document.createElement( 'div' );
	this.content.style.cssText ='position:absolute; left:5px; top:5px; width:160px;';
	this.content.innerHTML = 'Cameras<br>';
	document.body.appendChild( this.content );
	this.b = [];
	this.prev = null;
	this.cam = null;
	this.init();
	this.show(v.currentCamera);
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
    	this.cam.style.cssText = 'display:inline-block; text-align:center; width:55px; height:14px; cursor:pointer; border:1px solid #888; margin-top:4px; margin-right:4px;';
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