var Landscape = {};


Landscape.NetWork = function(parent){

	this.name = 'landscape';

	this.root = parent;

	this.initialized = false;
	this.loaded = false;

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
		this.initialized = true;

		this.coneGeometry = new THREE.CylinderGeometry( 0.4, 0, 1, 12, 1 );
		this.coneGeometry.applyMatrix(new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ));
		this.mat = new THREE.MeshBasicMaterial({color:0xFFF000, wireframe:true})

		this.obj = [];
		var m;
		var s = 10;
		var i = 100;
		while(i--){
			s = V.randInt(10, 30);
			m = new THREE.Mesh( this.coneGeometry, this.mat );
			m.scale.set(s,s,s);
			m.position.set(V.randInt(-400, 400), 0, V.randInt(-400, 400));

			this.content.add(m);

			this.obj[i] = m;
		}

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
		this.terrain.pos.y -=0.001
        this.terrain.update();
        var i = this.obj.length;
        while(i--){
        	//
        	this.obj[i].position.y = this.terrain.getz(this.obj[i].position.x,this.obj[i].position.z);
        }
	}
}