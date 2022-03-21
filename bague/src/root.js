export const root = {

	path:'./assets/',


	assets:[

	'bague.glb', 'bracelet.glb', 'diam.glb', 

	'diam_env_h.jpg', 
	'track.png', 'track_n.png', 'sheen.jpg',
	'bague_1.jpg', 'bague_2.jpg', 'bague_r.jpg', 'bague_m.jpg', 'shadow_1.jpg', 'shadow_2.jpg',
	'diam.png',

	],


	materials:[],

	scrore:0,

	view:null,
	scene:null,
	renderer:null,
	camera:null,
	track:null,
	env:null,

	alpha:0.8, // diamond opacity 

	speed:1,
	speedInc:0.05,

	tracking:0.9,

	lineX:1.8,
	line:1,

	getX: function(n) {
		switch(n){
            case 0: return root.lineX; break;
            case 1: return 0; break;
            case 2: return -root.lineX; break;
        }

	},

}