var Traffic = {};


Traffic.NetWork = function(parent){

	this.name = 'traffic';
	
	this.root = parent;

	this.initialized = false;
	this.loaded = false;

	this.timeFactor = 5;

	this.meshes = {};

	this.maps = ['cars.png', 'street.jpg', 'road.png', 'carstop.png'];
	this.mapLoad = 0;
	this.imgs = [];

	this.load();
}

Traffic.NetWork.prototype = {
	constructor:Traffic.NetWork,
	load:function(){
    	var name = 'cars';
        var loader = new THREE.SEA3D( true );
        var mtx = new THREE.Matrix4().makeScale(2,2,-2);
        loader.onComplete = function( e ) {
            this.meshes[name] = {};
            var i = loader.meshes.length, m;
            while(i--){
                m = loader.meshes[i];
                g = m.geometry;
				g.applyMatrix(mtx);
                this.meshes[name][m.name] = m;
            }
            this.loadImages();
        }.bind(this);

        loader.parser = THREE.SEA3D.DEFAULT;
        loader.load( 'models/cars.sea' );
    },
    loadImages:function(){
        var PATH = 'textures/';
        var img = new Image();
        img.onload = function(){
        	this.imgs[this.mapLoad] = img;
        	this.mapLoad++;
        	if(this.mapLoad == this.maps.length) this.loaded = true;
        	else this.loadImages();
        }.bind(this);
        img.src = PATH+this.maps[this.mapLoad];
    },
    getGeometry:function(obj, name){
        var g = this.meshes[obj][name].geometry;
        return g;
    },
    getHighGeometry:function(obj, ref){
    	var name = ref.m;
    	var num = name.substring(3,name.length);

    	var g = new THREE.Geometry();

    	var body = this.meshes[obj]['m'+name].geometry;
    	g.merge( body );

    	// bottom car
    	//var bottom = this.meshes[obj]['down'+num].geometry;
        //g.merge( bottom );

        var wheel;
    	switch(ref.wRadius){
    		case 0.36: wheel = this.meshes[obj]['lw001'].geometry; break;
    		case 0.40: wheel = this.meshes[obj]['lw002'].geometry; break;
    		case 0.46: wheel = this.meshes[obj]['lw003'].geometry; break;
    		case 0.57: wheel = this.meshes[obj]['lw004'].geometry; break;
    		case 0.64: wheel = this.meshes[obj]['lw005'].geometry; break;
    	}
    	var i = ref.nWheels;
    	var mz2 = 0;
    	if(i>4) mz2 = ref.wPos[3]*2;
    	var m = new THREE.Matrix4();
    	var mx = ref.wPos[0]*2;
    	var mz = ref.wPos[2]*2;
    	var my = ref.wRadius*2;
    	var dc = ref.wPos[1]*2;
    	while(i--){
    		if(i==0) m.makeTranslation(mx, my, mz);
    		if(i==1) m.makeTranslation(-mx, my, mz);
    		if(i==2) m.makeTranslation((mx+dc), my, -mz);
    		if(i==3) m.makeTranslation(-(mx+dc), my, -mz);
    		if(i==4) m.makeTranslation(mx, my, -mz2);
    		if(i==5) m.makeTranslation(-mx, my, -mz2);

    		if(i==0 || i==2 || i==4) m.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
    		
    		g.merge( wheel, m );
    	}
        return g;
    },

    


	init:function(){
		if (!this.loaded) return;

		this.root.currentScene = this.name;
		it.run(this.root.currentScene);

		this.content = new THREE.Group();
	    this.root.scene.add(this.content);

		this.world = new TRAFFIC.World();
		this.world.generateMap(2,2,7, 1);
		this.world.carsNumber = 100;
		this.previousTime = 0;
		this.lastUpdate = 0;

		this.grid = TRAFFIC.settings.gridSize;

		this.decal = new THREE.Vector3(-this.grid*0.5, -7 , -this.grid*0.5);

		this.initGeometry();

		this.generateMaterial();

		this.cars = [];
		this.roads = [];
		this.inter = [];
		this.streets = [];

		//this.addGrid();
		this.addStreets();
		//this.addBackGround();

		this.initialized = true;
	},




	clearAll:function(){

		this.initialized = false;

		this.world.clear();

		var i = this.content.children.length;
		while(i--){ 
			if(this.content.children[i].geometry) this.content.children[i].geometry.dispose();
			this.content.remove(this.content.children[i]);
		}
		this.root.scene.remove(this.content);

		this.cars = null;
		this.roads = null;
		this.inter = null;
		this.streets = null;

		this.inter_geo.dispose();
		this.road_geo.dispose();
		//this.street_geo.dispose();

		// del material

		this.inter_mat.dispose();
	    this.road_mat.dispose();
	    this.inter_mat = null;
	    this.road_mat = null;

	    i = this.street_mat.length;
	    while(i--) this.street_mat[i].dispose();
	    this.street_mat = null;

	    i = this.car_mat.length;
	    while(i--) this.car_mat[i].dispose();
	    this.car_mat = null;

	    this.grid_mat.dispose();
	    this.grid_mat = null;

	    this.box_car_mat.dispose();
	    this.box_car_mat = null;

	    this.back_mat.dispose();
	    this.back_mat = null;

	    // del texture

	    i = this.car_txt.length;
	    while(i--) this.car_txt[i].dispose();
	    this.car_txt = null;

    	i = this.street_txt.length;
    	while(i--) this.street_txt[i].dispose();
	    this.street_txt = null;

    	i = this.road_txt.length;
    	while(i--) this.road_txt[i].dispose();
	    this.road_txt = null;

	},
	update:function(){
		if (!this.initialized) return;

		var now = Date.now();
		var dt = now - this.lastUpdate;
		this.lastUpdate = now;
		var time = Date.now();


		var delta = (time - this.previousTime) || 0;
		//if (delta > 1) {
		if (delta > 100) { delta = 100;  }
		this.previousTime = time;
		this.world.onTick(this.timeFactor * delta / 1000);

		var o0, o1, o2, o3, id;

		o0 = this.world.intersections.all();
		for (id in o0) {
			this.addInter(o0[id]);
        }
        o1 = this.world.roads.all();
        for (id in o1) {
            this.addRoad(o1[id]);
            this.addSignals(o1[id]);
        }
        /*o2 = this.world.roads.all();
        for (id in o2) {
        	//road = _ref2[id];
        	this.drawSignals(road);
        }*/

        // remove car 
        var i = this.world.toRemove.length;
        while(i--){ this.removeCar(this.world.toRemove[i]); };
        this.world.clearTmpRemove();

		o3 = this.world.cars.all();
		for (id in o3) {
            this.addCar(o3[id], id);
        }


       // this.groundMirror.render();
	},

	// MATERIALS

    generateMaterial:function(){
    	this.car_txt = [];
    	this.street_txt = [];
    	this.road_txt = [];
    	this.generateRandomColors(this.imgs[0], this.imgs[3]);
    	this.generateStreet(this.imgs[1]);
    	this.generateRoad(this.imgs[2]);

    	var env = this.root.environment;

		// road material
		this.inter_mat = new THREE.MeshBasicMaterial( { map:this.road_txt[1], transparent:true, opacity:0.6 } );
	    this.road_mat = new THREE.MeshBasicMaterial( { map:this.road_txt[0], transparent:true, opacity:0.6 } );

	    // street material
	    this.street_mat = [];
	    var i = 16;
	    while(i--) this.street_mat[i] = new THREE.MeshBasicMaterial( { map:this.street_txt[i], transparent:true, opacity:0.6} );

	    this.stx_mat = new THREE.MeshFaceMaterial(this.street_mat);

	    // cars material
		this.car_mat = []
		i = 3;
		while(i--) this.car_mat[i] = new THREE.MeshBasicMaterial( { map:this.car_txt[i], envMap:env, reflectivity:0.5 } );

		// grid mat
		this.grid_mat = new THREE.MeshBasicMaterial( { color: 0x303030, wireframe:true, fog:false } );

		// box car mat 
		this.box_car_mat = new THREE.LineBasicMaterial( { color: 0XFF00FF } );


		this.back_mat = new THREE.MeshBasicMaterial( { color: 0XFF00FF } );

    },

    // GEOMETRY

	initGeometry:function(){
		

		this.inter_geo = new THREE.PlaneBufferGeometry( this.grid, this.grid );
		this.inter_geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));

		this.road_geo = new THREE.PlaneGeometry( this.grid, this.grid );
		this.road_geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));

		//this.street_geo = new THREE.PlaneGeometry( (this.grid*6) , (this.grid*6)  );
		//this.street_geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
	},

	addBackGround:function(){
		var t = (((7*4)+1)*this.grid);
		var g = new THREE.PlaneBufferGeometry( t, t*0.5 );
		var pos = [
		    [  0, (t*0.25)+this.decal.y, -t*0.5],
		    [  0, (t*0.25)+this.decal.y, t*0.5],
		    [ -t*0.5, (t*0.25)+this.decal.y, 0],
		    [ t*0.5, (t*0.25)+this.decal.y, 0]
		]

		var settings = { 
            clipBias: 0.005, 
            textureWidth:this.root.dimentions.w, 
            textureHeight:this.root.dimentions.h, 
            //color: 0x77FF77, 
            //alpha: 0.5, 
            power: 1, 
            radius:1.0, 
            //debugMode:true,
        };

		//this.groundMirror = new THREE.Mirror( this.root.renderer,this.root.cameras[this.root.currentCamera], settings );

		this.groundMirror1 = new THREE.Mirror( this.root.renderer,this.root.nav.camera, settings );
		this.groundMirror2 = new THREE.Mirror( this.root.renderer,this.root.nav.camera, settings );
		this.groundMirror3 = new THREE.Mirror( this.root.renderer,this.root.nav.camera, settings );
		this.groundMirror4 = new THREE.Mirror( this.root.renderer,this.root.nav.camera, settings );

		/*this.groundMirror1 = new THREE.Mirror( this.root.renderer,null, settings, pos[0] );
		this.groundMirror2 = new THREE.Mirror( this.root.renderer,null, settings, pos[1] );
		this.groundMirror3 = new THREE.Mirror( this.root.renderer,null, settings, pos[2] );
		this.groundMirror4 = new THREE.Mirror( this.root.renderer,null, settings, pos[3] );*/

		//var myMirror = new THREE.FlatMirror(this.root.renderer,this.root.nav.camera, {clipBias: 0.005, textureWidth: this.root.dimentions.w, textureHeight: this.root.dimentions.h } );
		

		//this.back_mat = this.groundMirror.material;
		
		var bg1 = new THREE.Mesh( g, this.groundMirror1.material );
		var bg2 = new THREE.Mesh( g, this.groundMirror2.material );
		var bg3 = new THREE.Mesh( g, this.groundMirror3.material );
		var bg4 = new THREE.Mesh( g, this.groundMirror4.material );

		bg1.add(this.groundMirror1);
		bg2.add(this.groundMirror2);
		bg3.add(this.groundMirror3);
		bg4.add(this.groundMirror4);


		this.root.mirror.push(this.groundMirror1);
		this.root.mirror.push(this.groundMirror2);
		this.root.mirror.push(this.groundMirror3);
		this.root.mirror.push(this.groundMirror4);
		
		this.content.add(bg1);
		this.content.add(bg2);

		this.content.add(bg3);
		this.content.add(bg4);


		bg2.rotation.y = V.PI;

		bg3.rotation.y = V.PI*0.5;
		bg4.rotation.y = -V.PI*0.5;

		bg1.position.set( 0, (t*0.25)+this.decal.y, -t*0.5);
		bg2.position.set( 0, (t*0.25)+this.decal.y, t*0.5);
		bg3.position.set( -t*0.5, (t*0.25)+this.decal.y, 0);
		bg4.position.set( t*0.5, (t*0.25)+this.decal.y, 0);
		/*bg1.position.set( 0,this.decal.y, -t*0.5);
		bg2.position.set( 0, this.decal.y, t*0.5);
		bg3.position.set( -t*0.5, this.decal.y, 0);
		bg4.position.set( t*0.5, this.decal.y, 0);*/
	},

	// GRID

	addGrid:function(){
		var t = (7*4)+1;
		var g = new THREE.PlaneGeometry(this.grid*t,this.grid*t, t,t);
		g.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
		var ground = new THREE.Mesh( g, this.grid_mat );
		this.content.add(ground);
		var d = this.grid*0.5;
		ground.position.set(d, -0.2, d);
		ground.position.add(this.decal);
	},

	// ADD

	addStreets:function (){

		var dc = (this.grid*4);
		var x = -2;
		var z = -2;
		var s;
		var posdd = this.grid*7;
		var i = 16, j;
		var g = new THREE.Geometry();
		var mg;
		var m = new THREE.Matrix4();
		while(i--){
			mg = new THREE.PlaneGeometry( (this.grid*6) , (this.grid*6)  );
			j = mg.faces.length;
			while(j--){
				mg.faces[j].materialIndex = i;
			}
			m.makeTranslation((x*posdd)+dc,  0,(z*posdd)+dc);
			m.multiply(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
			g.merge( mg, m );

			x++;
			if(x==2){ z++; x = -2 }
		}

		i = 9;
		x=-1;
		z=-1;
		posdd = (((7*4))*this.grid);
		dc = 0;
		while(i--){
			s = new THREE.Mesh( g, this.stx_mat );
			s.position.set((x*posdd)+dc, 0,( z*posdd)+dc);
			s.position.add(this.decal);
			this.content.add( s );
			x++;
			if(x==2){ z++; x = -1 }
		}
	},

	addSignals:function (cc, id){
	},
	addRoad:function(road){
		if ((road.source == null) || (road.target == null)) throw Error('invalid road');
		var id = road.id.substring(4);
		if(this.roads[id]==null){
			var p0 = road.source.rect.center();
			var p1 = road.target.rect.center();
			var lngx = ((p1.x-p0.x)/this.grid);
			var lngy = ((p1.y-p0.y)/this.grid);
			var side = 0;
			var dir = 1;

			if(lngy!=0) side=1;
			var i;

			if(side==0){
				i = Math.abs(lngx)-1;
				if(lngx<0) dir = -1;
			}else{
				i = Math.abs(lngy)-1;
				if(lngy<0) dir = -1;
			}

			var g = new THREE.Geometry();
			var m = new THREE.Matrix4();

			while(i--){
				if(side==0){
					m.makeTranslation((p0.x+(this.grid*dir)+((i*this.grid)*dir)), 0, p0.y);
					m.multiply(new THREE.Matrix4().makeRotationY(Math.PI*0.5));
				}else{ 
					m.makeTranslation(p0.x, 0, (p0.y+(this.grid*dir)+((i*this.grid)*dir)));
				}
				g.merge( this.road_geo, m );
			}
			var c = new THREE.Mesh( g, this.road_mat );
			c.position.add(this.decal);
			this.content.add( c );
			this.roads[id] = c;
		}
	},
	addCar : function (car){
    	var id = car.id.substring(3);
    	if(this.cars[id]==null){
    		var r = this.randInt(0,2);
    		var cubic = this.randInt(0,2);
    		//var c = new THREE.Mesh( this.getGeometry('cars', TRAFFIC.TYPE_OF_CARS[car.type].m), this.car_mat[r] );
    		
    		var c;

    		
    		
    		//c.scale.set(2, 2, -2);

    		if(cubic==2){
    			c = new THREE.Mesh( this.getGeometry('cars', TRAFFIC.TYPE_OF_CARS[car.type].m), this.car_mat[r] );
    			var b = new THREE.BoxHelper(c);
    			b.material = this.box_car_mat;
    			this.content.add( b );
    			c.visible = false;
    		}else{
    			c = new THREE.Mesh( this.getHighGeometry('cars', TRAFFIC.TYPE_OF_CARS[car.type]), this.car_mat[r] );
    		}
    		    this.content.add( c );
    		    this.cars[id] = c;
    		//}
    		
    		//c.scale.set(car.length, car.length/2, car.width);
    		c.position.set(8000, 0,0);
    		this.cars[id] = c;
    	} else {
    		var p = car.coords;
    		var r = car.direction;
    		this.cars[id].position.set(p.x,0,p.y);
    		this.cars[id].position.add(this.decal);
    		this.cars[id].rotation.y = -r+(Math.PI*0.5);
    	}
    },
    removeCar : function (id){
    	var id = id.substring(3);
    	if(this.cars[id]!=null){
    		this.content.remove( this.cars[id] );
    		this.cars[id] = null;
    	}
    },
    addInter : function (intersection){
    	var id = intersection.id.substring(12);
    	if(this.inter[id]==null){
    		this.inter[id] = new THREE.Mesh( this.inter_geo, this.inter_mat );
    		this.content.add( this.inter[id] );
    		var type = intersection.roads.length;
    		var c = intersection.rect.center();
    		this.inter[id].position.set(c.x,0,c.y);
    		this.inter[id].position.add(this.decal);
    	} else {
    		var l = intersection.controlSignals.state[0];
    	}
    },


    // TEXTURE GENERATOR

    generateStreet:function(img){
		var x = 0;
		var y = 0;
		for(var i=0; i<16;i++){
			var canvas = document.createElement( 'canvas' );
			canvas.width = canvas.height = 256;
			var ctx = canvas.getContext('2d');

			ctx.drawImage(img, x*256, y*256, 256,256, 0, 0, 256, 256);
			var tx = new THREE.Texture(canvas);
			//tx.magFilter = THREE.NearestFilter;
			//tx.minFilter = THREE.LinearMipMapLinearFilter;
			tx.needsUpdate = true;
			this.street_txt[i] = tx;
			x++
			if(x==4){ x=0; y++; }
			canvas = null;
			ctx = null;
		}
    },

    generateRoad:function(img){
		var x = 0;
		for(var i=0; i<2;i++){
			var canvas = document.createElement( 'canvas' );
			canvas.width = canvas.height = 128;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, x*128, 0, 128,128, 0, 0, 128, 128);
			var tx = new THREE.Texture(canvas);
			//tx.magFilter = THREE.NearestFilter;
			//tx.minFilter = THREE.LinearMipMapLinearFilter;
			tx.needsUpdate = true;
			this.road_txt[i] = tx;
			x++;
			canvas = null;
			ctx = null;
		}

    },
	
	generateRandomColors:function(img, img2){
		for(var i=0; i<3;i++){
			var canvas = document.createElement( 'canvas' );
			canvas.width = canvas.height = 1024;
			var ctx = canvas.getContext('2d');
			var x=0,y=0;
			for(var j=0; j<16;j++){
				ctx.beginPath();
				if(j!==11 && j!==15) ctx.fillStyle = this.randCarColor();
				ctx.rect(x*256,y*256,256,256);
				ctx.fill();
				x++
				if(x==4){ x=0; y++; }
			}
			ctx.globalCompositeOperation = "multiply";
			//ctx.globalCompositeOperation = "overlay";
			ctx.drawImage(img, 0, 0, 1024,1024);
			ctx.globalCompositeOperation = "normal";
			ctx.drawImage(img2, 0, 0, 1024,1024);
	        tx = new THREE.Texture(canvas);
	        tx.needsUpdate = true;
	        tx.flipY = false;
	        //tx.magFilter = THREE.NearestFilter;
			//tx.minFilter = THREE.LinearMipMapLinearFilter;
	        this.car_txt[i] = tx;
	        canvas = null;
			ctx = null;
	    }
	},

	lerp : function (a, b, percent) { return a + (b - a) * percent; },
	randInt : function (a, b) { return this.lerp(a, b, Math.random()).toFixed(0)*1;},
	randColor : function () { return '#'+Math.floor(Math.random()*16777215).toString(16); },
	randCarColor : function () {
		var carcolors = [
			[0xFFFFFF, 0xD0D1D3, 0XEFEFEF, 0xEEEEEE],//white
			[0x252122, 0x302A2B, 0x27362B, 0x2F312B],//black
			[0x8D9495, 0xC1C0BC, 0xCED4D4, 0xBEC4C4],//silver
			[0x939599, 0x424242, 0x5A5A5A, 0x747675],//gray
			[0xC44920, 0xFF4421, 0x600309, 0xD9141E],//red
			[0x4AD1FB, 0x275A63, 0x118DDC, 0x2994A6],//blue
			[0xA67936, 0x874921, 0xD7A56B, 0x550007],//brown
			[0x5FF12C, 0x188047, 0x8DAE29, 0x1AB619],//green
			[0xFFF10A, 0xFFFFBD, 0xFCFADF, 0xFFBD0A],//yellow/gold
			[0xB92968, 0x5C1A4F, 0x001255, 0xFFB7E7]//other
		];
		var l;
		var p = this.randInt(0,100), base=0xFFFFFF;
		var n = this.randInt(0,3);

		if(p<23)l=0;
		else if(p<44)l=1;
		else if(p<62)l=2;
		else if(p<76)l=3;
		else if(p<84)l=4;
		else if(p<90)l=5;
		else if(p<96)l=6;
		else if(p<97)l=7;
		else if(p<98)l=8;
		else l=9;

		var base = carcolors[l][n];
	    var resl = base.toString(16);
	    if(resl.length<6) resl = '#0'+resl;
	    else resl = '#'+resl;
		return resl;
	}
}