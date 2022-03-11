export const root = {


	materials:[],

	scrore:0,

	view:null,
	scene:null,
	renderer:null,
	camera:null,
	track:null,

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