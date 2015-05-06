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

		var w = 1000;
	    var h = 1000;
	    var r = h/w;
		this.terrain = new V.Terrain( this.root, { div:[256,256], size:[w, 0, h], debug:false, offset:3 });

		this.initialized = true;

	},
	clearAll:function(){
		this.initialized = false;
		this.terrain.clear();

	},
	update:function(){
		if (!this.initialized) return;
		this.terrain.pos.y -=0.001
        this.terrain.update();
	}
}