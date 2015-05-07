var SimpleTest = {};


SimpleTest.NetWork = function(parent){

	this.name = 'simple';

	this.root = parent;

	this.initialized = false;
	this.loaded = false;
	this.lastTime = 0;

	this.load();

}
SimpleTest.NetWork.prototype = {
	constructor:SimpleTest.NetWork,
	load:function(){
		
		this.loaded = true;
	},
	init:function(){
		if (!this.loaded) return;

		this.root.currentScene = this.name;
		it.run(this.root.currentScene);

		this.content = new THREE.Group();
	    this.root.scene.add(this.content);

	

	//   this.content = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({transparent: true, opacity: 0.0}));
    	//this.root.scene.add(this.content);
    	//var env = this.root.environment;

	   // this.mat = new THREE.MeshBasicMaterial({color:0xFFFFFF, envMap:env, reflectivity:0.9});
	    //this.geo = new THREE.CylinderGeometry( 0.4, 0, 1, 10, 1 );//new THREE.SphereGeometry(30,12,10)

	    // this.ball = new THREE.Mesh( this.geo, this.mat);
	    //ball.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.3,0));
	   // this.content.add(this.ball);
	 //   this.root.scene.add(this.ball);

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
		/*this.terrain.clear();
		var i = this.content.children.length;
		while(i--){
		    this.content.remove(this.content.children[i]);
		}
		this.root.scene.remove(this.content);
		this.obj = [];*/
		//this.root.scene.remove(this.ball);
		//this.mat.dispose();
		//this.geo.dispose();

	},
	update:function(){
		if (!this.initialized) return;

		//if(this.ball)this.ball.rotation.y +=0.1

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