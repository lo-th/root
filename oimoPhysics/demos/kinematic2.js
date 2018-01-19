var paddle, r=0;

function demo() {

    cam ( [0, 30, 40] );

    set({ 
        fps: 60,
        broadPhase: 2, // 1: BruteForce | 2: Bvh
        gravity: [ 0, -9.80665, 0 ],
    });

    var ground = add({size:[50, 10, 50], pos:[0,-5,0] });

    paddle = add({ type:'box', size:[50, 2, 2], pos:[0,1,0], density:1, kinematic:true, material:'kinematic', name:'paddle' });

    // basic geometry body

    var i = 60, d, h, w, x, z;
    
    while( i-- ) {

        w = Math.rand(1,3);
        h = Math.rand(1,3);
        d = Math.rand(1,3);
        x = Math.rand(-10,10);
        z = Math.rand(-10,10);

        add( { type:'box', size:[w,h,d], pos:[x,h*0.5,z], density:1 } );

    }

    // extra loop
    view.update = update;

};

function update () {

    var bodys = view.getBody();

    r++;

    bodys.forEach( function ( b, id ) {

            if( b.name === 'paddle' ){

                oimo.send( 'matrix', [ b.name, [0, 1, 0], [0,r,0] ] );

            }else{
                if( b.position.y < -10){
                    oimo.send( 'matrix', [ b.name, [Math.rand(-5,5), Math.rand(10,20), Math.rand(-5,5)] ] );
                }

            }


    });

}