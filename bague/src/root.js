export const root = {


	materials:[],

	scene:null,
	renderer:null,

	speed:1,
	speedInc:0.05,
	track: null,
	key:[0,0,0,0,0,0],

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