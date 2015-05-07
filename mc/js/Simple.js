var SimpleTest = {};


SimpleTest.NetWork = function(parent){

	this.name = 'simple';

	this.root = parent;

	this.initialized = false;
	this.loaded = false;
	this.lastTime = 0;

	this.b = []

	//this.load();
}
SimpleTest.NetWork.prototype = {
	constructor:SimpleTest.NetWork,
	load:function(){
		this.loaded = true;
	},
	init:function(){
		//if (!this.loaded) return;

		//this.gl = this.root.renderer.getContext();

		this.root.currentScene = this.name;
		it.run(this.root.currentScene);

		this.content = new THREE.Group();
	    this.root.scene.add(this.content);

	

	    //this.content = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({transparent: true, opacity: 0.0}));
    	//this.root.scene.add(this.content);
    	var mtx = new THREE.Matrix4().makeScale(10, 10, 10);
    	this.geo = new THREE.SphereGeometry(1,10,8);
    	this.geo.applyMatrix(mtx);
    	//var env = this.root.environment;
    	//var mm = new THREE.MeshBasicMaterial({map:env, wireframe:true, fog:false, transparent: true });
    	this.mat = new THREE.MeshNormalMaterial({ shading: THREE.SmoothShading });

    	console.log( this.mat.id )
	    //this.mat = new THREE.MeshBasicMaterial({color:0xFF00FF, envMap:env, reflectivity:0.9});
	    //this.geo = new THREE.CylinderGeometry( 0.4, 0, 1, 10, 1 );//

	    var i = 100;
	    var b;
	    var x,y,z;
	    while(i--){
	    	x = V.randInt(-(300*0.5), (300*0.5));
	    	y = V.randInt(-(300*0.5), (300*0.5));
	    	z = V.randInt(-(300*0.5), (300*0.5));
	    	b = new THREE.Mesh( this.geo, this.mat);
	    	b.position.set(x,y,z)
	    	this.content.add(b);
	    	this.b[i] =  b;
	    }
	    

	   // this.ball = new THREE.Mesh( this.geo, mm);
	    //ball.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.3,0));
	   // this.content.add(this.ball);
	   // this.root.scene.add(this.ball);

		/*var w = 1000;
	    var h = 1000;
	    var r = h/w;
		this.terrain = new V.Terrain( this.root, { div:[256,256], size:[w, 100, h], debug:false, offset:6 });
		

		this.coneGeometry = new THREE.CylinderGeometry( 0.4, 0, 1, 10, 1 );
		this.coneGeometry.applyMatrix(new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ));
		this.mat = new THREE.MeshBasicMaterial({color:0xFF00FF, wireframe:true});

		this.obj = [];
		var m;
		var i = 100;
		while(i--){
			m = new Landscape.Entity(this.coneGeometry, this.mat);
			m.terra = this.terrain;
			this.content.add(m);
			this.obj[i] = m;
		}*/

		this.initialized = true;
	},
	clearAll:function(){
		this.initialized = false;
		/*this.terrain.clear();*/
		var i = this.content.children.length;
		while(i--){
		    this.content.remove(this.content.children[i]);
		}
		this.root.scene.remove(this.content);
		//this.root.scene.remove(this.ball);
		this.mat.dispose();
		this.geo.dispose();

	},
	update:function(){
		if (!this.initialized) return;

		this.content.rotation.y += 0.01;

		//var currentTime = Date.now();
        //var timeDelta = currentTime - this.lastTime;

		/*this.terrain.pos.y -= 0.001;
        this.terrain.update();
        var i = this.obj.length;
        while(i--){
        	this.obj[i].travel();
        }*/

        //this.lastTime = currentTime;
	}
}