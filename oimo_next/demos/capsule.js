function demo() {

	// config physics setting
	phy.set( { substep:4, gravity:[0,-9.81,0] });

	// add static ground
	phy.add({ type:'plane', size:[300,1,300], visible:false });

	// add dynamic capsule
    let i = 60;
    
    while(i--){
        
        phy.add({ type:'capsule', size:[ rand( 0.1, 0.3 ), 0.5], pos:[ rand( -5, 5 ),5+(i*0.5), rand( -5, 5 )], density:1, restitution:0.2, friction:0.2 });

    }

}