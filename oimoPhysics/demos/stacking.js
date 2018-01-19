

function demo() {

    cam ( [0, 30, 35] );

    set({ 
        fps: 60,
        broadPhase: 2, // 1: BruteForce | 2: Bvh
        gravity: [ 0, -9.80665, 0 ],
    });

    var ground = add({size:[50, 10, 50], pos:[0,-5,0] });
    //var ground = add ({ type:'plane', size:[50,0,50]})

    // basic geometry body

    var i, j, k, pos;

    var d = 1;
    var s = 2;
    var x = 6, y = 10, z = 6;
    var m = 0.01;

    var decaleX = - ((x*0.5) * d) + (d*0.5);
    var decaleZ = - ((z*0.5) * d) + (d*0.5);

    for(k = 0; k<y; k++){
    for(j = 0; j<z; j++){
    for(i = 0; i<x; i++){
        pos = [ i*d + decaleX, (k*d + d)-0.5, j*d + decaleZ ];
        add ({ type:'box', size:[d-m,d-m,d-m], pos:pos, friction:0.4, restitution:0.1, move:true, sleep:0, density:1 });
        //add ({ type:'cylinder', size:[(d-m)*0.5,d-m,(d-m)*0.5], pos:pos, friction:0.4, restitution:0.1, move:true, sleep:0 });
        //add ({ type:'sphere', size:[(d-m)*0.5], pos:pos, friction:0.4, restitution:0.1, move:true, sleep:0 });
    }}}

    add({ type:'sphere', size:[s], pos:[0,100,0], density:10, friction:0.3, restitution:0.3 });

    // extra loop
    view.update = update;

};

function update () {

    var bodys = view.getBody();

    bodys.forEach( function ( b, id ) {

        if( b.position.y < -10 ){
            oimo.send( 'matrix', [ b.name, [Math.rand(-5,5), Math.rand(10,20), Math.rand(-5,5)] ] );
        }

    });

}
