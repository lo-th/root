var Landscape = {};


Landscape.NetWork = function(parent){

	this.name = 'landscape';

	this.root = parent;

	this.initialized = false;
	this.loaded = false;
	this.lastTime = 0;

	this.load();

}
Landscape.NetWork.prototype = {
	constructor:Landscape.NetWork,
	load:function(){
		this.loaded = true;
	},
	init:function(){
		if (!this.loaded) return;

		this.root.currentScene = this.name;
		it.run(this.root.currentScene);

		this.content = new THREE.Group();
	    this.root.scene.add(this.content);

		var w = 1000;
	    var h = 1000;
	    var r = h/w;
		this.terrain = new V.Terrain( this.root, { div:[256,256], size:[w, 100, h], debug:false, offset:6 });
		//this.initialized = true;

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
		}

		this.initialized = true;
		
	},
	clearAll:function(){
		this.initialized = false;
		this.terrain.clear();
		var i = this.content.children.length;
		while(i--){
		    this.content.remove(this.content.children[i]);
		}
		this.root.scene.remove(this.content);
		this.obj = [];
	},
	update:function(){
		if (!this.initialized) return;

		//var currentTime = Date.now();
        //var timeDelta = currentTime - this.lastTime;

		this.terrain.pos.y -= 0.001;
        this.terrain.update();
        var i = this.obj.length;
        while(i--){
        	this.obj[i].travel();
        }

        //this.lastTime = currentTime;
	}
}


// ENTITY

Landscape.Entity = function(geo, mat){
	THREE.Mesh.call(this, geo, mat);
	this.limit = {x:900, y:900};
	this.terra = null;

	var s = V.randInt(10, 30);
	this.radius = s;
	this.scale.set(s,s,s);
	var x = V.randInt(-(this.limit.x*0.5), (this.limit.x*0.5));
	var z = V.randInt(-(this.limit.y*0.5), (this.limit.y*0.5));
	this.position.set(x, -1000, z);
	this.angle = Math.PI * 2 * Math.random();
	this.velocity = V.randInt(1, 6);
	this.pos = new THREE.Vector3();
}
Landscape.Entity.prototype = Object.create(THREE.Mesh.prototype);
Landscape.Entity.prototype.travel = function () {
	    var x = this.position.x+(this.limit.x*0.5);
        var y = this.position.z+(this.limit.y*0.5);
        var angle = this.angle;
        var velocity = this.velocity;
        
        var nextX = x + Math.cos(angle) * velocity;// * (this.timeDelta / 1000);
        var nextY = y + Math.sin(angle) * velocity;// * (this.timeDelta / 1000);
        
        if (nextX + this.radius * 2 > this.limit.x){
            if ((angle >= 0 && angle < Math.PI / 2)) angle = Math.PI - angle;
            else if (angle > Math.PI / 2 * 3) angle = angle - (angle - Math.PI / 2 * 3) * 2
        }
        if (nextX < 0){
            if ((angle > Math.PI / 2 && angle < Math.PI)) angle = Math.PI - angle;
            else if (angle > Math.PI && angle < Math.PI / 2 * 3) angle = angle + (Math.PI / 2 * 3 - angle) * 2;
        }
        if (nextY + this.radius * 2 > this.limit.y){
            if ((angle > 0 && angle < Math.PI)) angle = Math.PI * 2 - angle;
        }
        if (nextY < 0){
            if ((angle > Math.PI && angle < Math.PI * 2)) angle = angle - (angle - Math.PI) * 2;
        }
        
        this.angle = angle;
        var nx = nextX-(this.limit.x*0.5);
        var nz = nextY-(this.limit.y*0.5);
        var ny = this.terra.getz(nx,nz)

        this.pos.set(nx,ny, nz);
        this.position.lerp(this.pos, 0.3);
}