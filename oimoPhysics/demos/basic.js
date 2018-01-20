function demo() {

    cam ([0, 20, 50]);

    // reset oimo world to default setting
     
    set({

        fps: 60,
        broadPhase: 2, // 1: BruteForce | 2: Bvh
        gravity: [ 0, -9.80665, 0 ],

    });

    // basic geometry box
    var w = 20, h = 25, m = 1;
    add({
        type:[ 'box', 'box', 'box', 'box', 'box' ],
        Rsize:[ [w-(2*m), m, w-(m)], [m,h, w-(2*m)], [m,h, w-(2*m)], [w,h, m], [w,h, m] ],
        Rpos:[ [0,m*0.5, 0], [(w*0.5)-(m*0.5),h*0.5,0], [(-w*0.5)+(m*0.5),h*0.5,0], [0,h*0.5,(w*0.5)-(m*0.5)], [0,h*0.5,(-w*0.5)+(m*0.5)] ],
    });

    var i = 200, pos = [], s, d, rot = [0,0,90];
    
    while( i-- ) {

        
        d = Math.rand(0.5,2);
        h = Math.rand(0.5,6);

        pos[0] = Math.rand(-5,5); 
        pos[1] = Math.rand(2,20) + ( i*h );
        pos[2] = Math.rand(-5,5);

        rot[2] = Math.rand(-90,90);

        switch( Math.randInt(0,4) ){

            case 0 : add({ type:'box', size:[d,h,d], pos:pos, density:0.2}); break;
            case 1 : add({ type:'cone', size:[d,h], pos:pos, density:0.2}); break;
            case 2 : add({ type:'sphere', size:[d], pos:pos, density:0.2}); break; 
            case 3 : add({ type:'cylinder', size:[d,h,d], rot:rot, pos:pos, density:0.2}); break;
            case 4 : add({ type:'capsule',  size:[d,h,d], rot:rot, pos:pos, density:0.2}); break;

        }
    }

};