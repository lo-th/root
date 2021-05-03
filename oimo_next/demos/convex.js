
function demo() {

	// config physics setting
	phy.set( {substep:4, gravity:[0,-9.81,0]});

	// add static ground
	phy.add({ type:'plane', size:[300,1,300], visible:false });

    Pool.load( './assets/models/diamond.glb', onComplete );

}

function onComplete( cubeEnv ){

    var list = Pool.meshList('diamond');

    let mat = {}, n = 0, b;

    for( let m in list ){

        let cube = Main.getCube( list[m].geometry );

        mat[m] = new Diamond({
            color: n===0 ? 0xffffff : rand( 0x000000, 0xffffff ),
            envMap: Main.getEnvmap()
        },{
            normalCube: cube,
        });

        n++

    }

    n = 4;

    while( n-- ){
        for( let m in list ){

            b = phy.add( {

                type:'convex',
                shape: list[m].geometry,
                pos:[rand(-4,4), rand(3,20), rand(-4,4)],
                density:1,
                size:[30],
                material: mat[m],
                
            })

        }

    }

}
