'use strict';
importScripts("../build/oimo.min.js");
var world;
var timer;
var upTime = 1e3 / 60;
var infos = [];

self.onmessage = function (e) {
	var p = e.data.tell;

	if(p == "INIT"){
		//importScripts(e.data.url);
		// Init world
        OIMO.WORLD_SCALE = 1;
        OIMO.INV_SCALE = 1;
        world = new OIMO.World(1/60, 2, 8);
        world.gravity.init(0,-10,0);
        //timer = setInterval(update, 1000/60); 

        update();
	}
}

var update = function(){
	world.step();
	infos[0] = world.performance.fpsint;
	self.postMessage({tell:"RUN", infos:infos});
	setTimeout(update, upTime);
}