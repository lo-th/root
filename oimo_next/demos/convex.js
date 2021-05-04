
function demo() {

	// config physics setting
	phy.set( {substep:4, gravity:[0,-9.81,0]});

	// add static ground
	phy.add({ type:'plane', size:[300,1,300], visible:false });

    Pool.load( './assets/models/diamond.glb', onComplete );

}

function onComplete(){

    var list = Pool.meshList('diamond');

    let mat = {}, n = 0, b;

    for( let m in list ){

        mat[m] = new Diamond({
            color: n===0 ? 0xffffff : rand( 0x000000, 0xffffff ),
        },{
            geometry:list[m].geometry,
            renderer: Main.getRenderer()
        });

        n++

    }

    n = 4;

    let bodys = []

    while( n-- ){
        for( let m in list ){

            b = phy.add( {
                type:'convex',
                shape: list[m].geometry,
                pos:[rand(-4,4), rand(3,20), rand(-4,4)],
                density:1,
                size:[30],
                material: mat[m],
                //auto:true    
            })

            bodys.push( b );

        }

    }

    var sparkle = new Sparkle({ objectList:bodys, controler:Main.getControler() });
    phy.addDirect( sparkle );

}