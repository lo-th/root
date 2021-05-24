function demo() {

	// setting and start oimophysics
	phy.set( { substep:1 });


	// add static plane 
	phy.add({ type:'plane', size:[ 300,1,300 ], visible:false });

	// add gears
	createGear([1, 3, 0.5], 1.0, 0.3);
    createGear([3, 3, 0.5], 1.0, 0.3);
    createGear([-0.5, 3, 0], 0.5, 1.6);
    createGear([1.5, 3, -0.5], 1.5, 0.3);
    createGear([-2, 3, 0], 1.0, 0.3, [ 180, 50 ]);
    createGear([-3.5, 3, 0], 0.5, 0.3);

    // add random object
    let i=20;
    while(i--){
        phy.add({ type:'box', size:[ 0.4 ], pos:[ rand( -4, 4 ), rand( 8, 10 ), rand( -1, 1 ) ], density: 0.3 });
        phy.add({ type:'sphere', size:[ 0.3 ], pos:[ rand( -4, 4 ), rand( 8, 10 ), rand( -1, 1 ) ], density: 0.3 });
    }

}4


function createGear(center, radius, thickness, lm) {

    lm = lm || null;

    let toothInterval = 0.4;
    let toothLength = toothInterval / 1.5;
    let numTeeth = Math.round( ( Math.PI * 2 ) * radius / toothInterval) + 1;
    if (numTeeth % 2 == 0) numTeeth--;
    if (numTeeth < 2) numTeeth = 2;

    let toothVertices = createGearTooth(toothLength / 2, thickness * 0.5, toothInterval / 3, radius - toothLength / 4 );

    let r = 360 / numTeeth;
    let shapes = [];

    shapes.push( { type:'cylinder', size: [ radius - toothLength / 2, (thickness * 0.48)*2] })

    let i = numTeeth;
    while(i--){
        shapes.push( { type:'convex', v:toothVertices, rot:[0, r * i, 0 ], margin:0, restitution:0 });
    }

    let g = phy.add({ type:'compound', shapes:shapes, pos:center, density:1, restitution:0, rot:[-90,0,0] });//, canSleep:false
    let f = phy.add({ type:'cylinder', size:[ toothInterval / 4, (thickness * 0.52)*2 ], pos:center, density:0, rot:[-90,0,0] });

    phy.add({ type:'joint', b1:g.name, b2:f.name, worldAnchor:center, worldAxis:[0,0,1], motor:lm });

}

function createGearTooth( hw, hh, hd, x ) {

    var scale = 0.3;
    return [
        x-hw, -hh, -hd,
        x-hw, -hh, hd,
        x-hw, hh, -hd,
        x-hw, hh, hd,
        x+hw, -hh, -hd * scale,
        x+hw, -hh, hd * scale,
        x+hw, hh, -hd * scale,
        x+hw, hh, hd * scale
    ];
    
}