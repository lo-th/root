var terrain

function demo() {

	// config physics setting
	phy.set( {substep:4, gravity:[0,-9.81,0]});

	// add static ground
	phy.add({ type:'plane', size:[300,1,300], visible:false });

	// add dynamic box

	let j = 20;
	while(j--){
		phy.add({  size:[0.2,0.2,0.2], pos:[math.rand(-4,4),6,math.rand(-4,4)], density:1 });
		phy.add({ type:'sphere', size:[0.1], pos:[math.rand(-4,4),6,math.rand(-4,4)], density:1 });
	}
	

    // add terrain

    terrain = new Landscape({ 

    	size : [ 20, 5, 20 ],
    	sample : [ 32, 32 ],
    	frequency : [0.03,0.08,0.5],
    	expo: 2,
    	uv:10,
    	debuger:true,
    	callback: addLand

    })

   //phy.getScene( ).add( terrain );


}

function addLand (){

	let g = terrain.getTri().clone().toNonIndexed()

	//let index = g.index.array;
	let v = g.attributes.position.array;



	var shapes = []

	let n, vv

	for( let i=0; i<v.length/18; i++ ){

	//for( let i=0; i<index.length/3; i++ ){

		/*n = i*3;

		vv = [
		v[ index[n] ], v[ index[n]+1 ], v[ index[n]+2 ],
		v[ index[n+1] ], v[ index[n+1]+1 ], v[ index[n+1]+2 ],
		v[ index[n+2] ], v[ index[n+2]+1 ], v[ index[n+2]+2 ]
		]*/

		n = i*18;

		vv = [
		v[ n ], v[ n+1 ], v[ n+2 ],
		v[ n+3 ], v[ n+4 ], v[ n+5 ],
		v[ n+6 ], v[ n+7 ], v[ n+8 ],

		v[ n+9 ], v[ n+10 ], v[ n+11 ],
		v[ n+12 ], v[ n+13 ], v[ n+14 ],
		v[ n+15 ], v[ n+16 ], v[ n+17 ]
		]



		shapes.push( { type:'convex', v:vv, nogeo:true })

	}

	console.log( v.length/18 )


	phy.add({
        type:'compound',
        pos:[0,0,0 ],
        rot:[ 0,0,0],
        shapes: shapes,
        mesh:terrain,
    })
	 
}