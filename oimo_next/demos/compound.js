function demo() {

	// config physics setting
	phy.set( {substep:4, gravity:[0,-9.81,0]});

	// add static ground
	phy.add({ type:'plane', size:[300,1,300], visible:false });

	// prepa shape
	let tableShape = [
        { type:'box', pos:[0,0.37,0], size:[ 1.44,0.02,1.60 ] },
        { type:'box', pos:[0.6,-0.01,0.68], size:[ 0.09,0.74,0.09 ] },
        { type:'box', pos:[-0.6,-0.01,0.68], size:[ 0.09,0.74,0.09 ] },
        { type:'box', pos:[0.6,-0.01,-0.68], size:[ 0.09,0.74,0.09 ] },
        { type:'box', pos:[-0.6,-0.01,-0.68], size:[ 0.09,0.74,0.09 ] },
    ]

    let chairShape = [
        { type:'box', pos:[0,0,0], size:[ 0.56,0.06,0.56 ] },
        { type:'box', pos:[0.24,-0.22,0.24], size:[ 0.08,0.38,0.08 ] },
        { type:'box', pos:[-0.24,-0.22,0.24], size:[ 0.08,0.38,0.08 ] },
        { type:'box', pos:[0.24,-0.22,-0.24], size:[ 0.08,0.38,0.08 ] },
        { type:'box', pos:[-0.24,-0.22,-0.24], size:[ 0.08,0.38,0.08 ] },
        { type:'box', pos:[-0.23,0.11,0], size:[ 0.06,0.16,0.5 ] },
        { type:'box', pos:[0.23,0.11,0], size:[ 0.06,0.16,0.5 ] },
        { type:'box', pos:[0,0.315,-0.21], size:[ 0.45,0.25,0.1 ] },
    ]

    i = 30;
    while(i--){
        
        phy.add({ type:'compound', shapes:chairShape, pos:[ rand( -5, 5 ),5+(i*5), rand( -5, 5 )], density:1 });
        phy.add({ type:'compound', shapes:tableShape, pos:[ rand( -5, 5 ),5+(i*5), rand( -5, 5 )], density:1 });

    }

    phy.add({ type:'sphere', size:[0.6], pos:[0,20,0], density:1, restitution:0.5, friction:0.9 });

}