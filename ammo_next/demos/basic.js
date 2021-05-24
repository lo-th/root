function demo() {

	// config physics setting
	phy.set( {substep:2, gravity:[0,-9.81,0]});


	// add static plane 
	phy.add({ type:'plane', size:[300,1,300], visible:false });

	// add dynamic sphere
	phy.add({ type:'highSphere', size:[0.4], pos:[0,20,0], density:1, restitution:0.2, friction:0.2 });

	// creat building
	building({ block:0.3, height:10, length:5, deep:5 });

}

function building( o ){

	let i, j, k, pos;

	let s = o.block || 1;
	let space = o.space || 0;
    let d = s + space;
    let x = o.length || 6, y = o.height || 10, z = o.deep || 6;

    let dx = - ((x*0.5) * d) + (d*0.5);
    let dz = - ((z*0.5) * d) + (d*0.5);

    for(k = 0; k<y; k++){
    for(j = 0; j<z; j++){
    for(i = 0; i<x; i++){
        pos = [ i*d + dx, (k*d + d)-(s*0.5), j*d + dz ];
        phy.add({
            type:'box',
            radius:0.01,// box chanfer
            size:[s,s,s],
            pos:pos,
            density:0.3,
            friction:0.4,
            restitution:0.6,
            sleep:true,
        });
    }}}

}