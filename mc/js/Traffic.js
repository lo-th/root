var Traffic = {};


Traffic.NetWork = function(parent){

	this.name = 'traffic';
	
	this.root = parent;

	this.initialized = false;
	this.loaded = false;

	this.timeFactor = 5;

	this.meshes = {};
	this.load();
}

Traffic.NetWork.prototype = {
	constructor:Traffic.NetWork,
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

		this.cars = [];
		this.roads = [];
		this.inter = [];
		this.streets = [];

		this.addGrid();
		this.addStreets();

		this.initialized = true;
	},
	clearAll:function(){

		this.initialized = false;

		var obj, i;
		var i = this.content.children.length;
		while(i--){
		    this.content.remove(this.content.children[i]);
		}
		this.root.scene.remove(this.content);
		this.world.clear();
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

	},

	// MATERIALS

	initGeometry:function(){
		this.inter_geo = new THREE.PlaneBufferGeometry( this.grid, this.grid );
		this.inter_geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));

		this.road_geo = new THREE.PlaneGeometry( this.grid, this.grid );
		this.road_geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));

		this.street_geo = new THREE.PlaneGeometry( (this.grid*5) + (this.grid*0.5), (this.grid*5) + (this.grid*0.5) );
		this.street_geo = new THREE.PlaneGeometry( (this.grid*6) , (this.grid*6)  );
		this.street_geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
	},


	// MATERIALS

	initMaterial:function(){
		var env = this.root.environment;

		

		// cars material
		this.car_mat = []
		this.car_mat[0] = new THREE.MeshBasicMaterial( { envMap:env, reflectivity:0.9 } );
        this.car_mat[1] = new THREE.MeshBasicMaterial( { envMap:env, reflectivity:0.9 } );
        this.car_mat[2] = new THREE.MeshBasicMaterial( { envMap:env, reflectivity:0.9 } );

		var img = new Image();
	    img.onload = function(){
	        this.generateRandomColor(img, this.car_mat[0]);
	        this.generateRandomColor(img, this.car_mat[1]);
	        this.generateRandomColor(img, this.car_mat[2]);
	    }.bind(this);
	    img.src = 'textures/cars.png';

	    // street material
	    this.street_mat = [];
		for(var i=0; i<16;i++){
			this.street_mat[i] = new THREE.MeshBasicMaterial( { color:0xFFFFFF, transparent:true, opacity:0.6} );///, blending:THREE.MultiplyBlending } );
		}
	    var img2 = new Image();
	    img2.onload = function(){
	    	this.generateStreet(img2);
	    }.bind(this);
	    img2.src = 'textures/street.jpg';

	    this.inter_mat = new THREE.MeshBasicMaterial( { map:THREE.ImageUtils.loadTexture( 'textures/roadx.png' ), transparent:true, opacity:0.6} );
	    this.road_mat = new THREE.MeshBasicMaterial( { map:THREE.ImageUtils.loadTexture( 'textures/road.png' ), transparent:true, opacity:0.6 } );

	    this.loaded = true;
	},

	// GRID

	addGrid:function(){
		var t = (7*4)+1
		var g = new THREE.PlaneGeometry(this.grid*t,this.grid*t, t,t);
		g.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
		var g_mat = new THREE.MeshBasicMaterial( { color: 0x303030, wireframe:true, fog:false } );
		var ground = new THREE.Mesh( g, g_mat );
		this.content.add(ground);
		var d = this.grid*0.5;
		ground.position.set(d, -0.2, d);
		ground.position.add(this.decal);
	},

	// ADD

	addStreets:function (){
		//var g = new THREE.Geometry();
		//var m = new THREE.Matrix4();
		var dc = (this.grid*4)//+ this.grid*0.5;
		var x = -2;
		var z = -2;
		var s;
		var i = 4*4;
		while(i--){
			s = new THREE.Mesh( this.street_geo, this.street_mat[i] );
			//s.position.set((x*(this.grid*6))+dc, 0,( z*(this.grid*6))+dc)
			s.position.set((x*(this.grid*7))+dc,  0,( z*(this.grid*7))+dc);
			s.position.add(this.decal);
			//s.position.sub(this.decal);
			this.content.add( s );
			this.streets[i] = s;
			x++;
			if(x==2){
				z++;
				x = -2
			}

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
    		var cubic = this.randInt(0,1);
    		var c = new THREE.Mesh( this.getGeometry('cars', TRAFFIC.TYPE_OF_CARS[car.type].m), this.car_mat[r] );
    		c.position.set(11000, 0,0);
    		c.scale.set(2, 2, -2);

    		if(cubic){
    			var b = new THREE.BoxHelper(c);
    			b.material.color.set(0XFF00FF)
    			this.content.add( b );
    			c.visible = false;

    			//this.cars[id] = c;
    		} 
    		//else{
    		    this.content.add( c );
    		    this.cars[id] = c;
    		//}
    		
    		//c.scale.set(car.length, car.length/2, car.width);
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


    //________________________________________________________________
    generateStreet:function(img){
    	
		//var tx;
		var x = 0;
		var y = 0;
		for(var i=0; i<16;i++){
			var canvas = document.createElement( 'canvas' );
		canvas.width = canvas.height = 256;
		var ctx = canvas.getContext('2d');
			/*ctx.beginPath();
			ctx.fillStyle = this.randCarColor();ctx.fill();*/
			//ctx.rect(0, 0, 256, 256);
			
			ctx.drawImage(img, x*256, y*256, 256,256, 0, 0, 256, 256);
			var tx = new THREE.Texture(canvas);
			tx.magFilter = THREE.NearestFilter;
			tx.minFilter = THREE.LinearMipMapLinearFilter;
			tx.needsUpdate = true;
			this.street_mat[i].map = tx;
			this.street_mat[i].needsUpdate = true;
			x++
			if(x==4){ x=0; y++; }
			//this.street_mat[i] = new THREE.MeshBasicMaterial( { map:tx } );
		}

    },
	
	generateRandomColor:function(img, mat){
		var canvas = document.createElement( 'canvas' );
		canvas.width = canvas.height = 1024;
		var ctx = canvas.getContext('2d');
		i = 16;
		var n=0,j=0;
		for(i=0; i<16;i++){
			ctx.beginPath();
			if(i!==11 && i!==15) ctx.fillStyle = this.randCarColor();
			ctx.rect(n*256, j*256, 256, 256);
			ctx.fill();
			n++
			if(n==4){ n=0; j++; }
		}
		ctx.drawImage(img, 0, 0, 1024,1024);
        tx = new THREE.Texture(canvas);
        tx.needsUpdate = true;
        tx.flipY = false;
        mat.map = tx;
        mat.needsUpdate = true;
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
	},


	// LOADING


	// load model
    load:function(){
    	var name = 'cars';
        var list = "";
        var loader = new THREE.SEA3D( true );
        loader.onComplete = function( e ) {
            this.meshes[name] = {};
            var i = loader.meshes.length, m;
            while(i--){
                m = loader.meshes[i];
                this.meshes[name][m.name] = m;
                list+=m.name+',';
            }
           

            this.initMaterial();
            //this.init();
        }.bind(this);

        loader.parser = THREE.SEA3D.DEFAULT;
        loader.load( 'models/cars.sea' );
    },
    getGeometry:function(obj, name){
        var g = this.meshes[obj][name].geometry;
        //var mtx = new THREE.Matrix4().makeScale(1, 1, -1);
        //g.applyMatrix(mtx);
        return g;
    },
	
}