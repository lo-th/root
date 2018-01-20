function demo() {

    cam ( [0,30, 100] );

    // reset oimo world to default setting
     
    set({

        fps: 60,
        broadPhase: 2, // 1: BruteForce | 2: Bvh
        gravity: [ 0, -9.80665, 0 ],

    });

    // basic geometry body

    var l = 20;
    var h = 40;
    add({size:[l, 8, l], pos:[0,-4,0]});

    var i = 100;
    var z = Math.rand(-5,5); 
    
    while(i--){

        z = Math.rand(-5,5);

         add({ 

            pos:[0,20 + (i*2.5),z], 
            rot:[0, 0, 45],

            type:['box', 'box', 'box'],

            size:[2,2,2, 1,4,1, 4,1,1], 
            Rpos:[ [0,0,0], [0,2,0], [2,0,0] ],
            
            density:0.2
        });
     }

    /*add({type:'box', pos:[l*0.5,h*0.5,0], size:[1,h, l+1]});
    add({type:'box', pos:[-l*0.5,h*0.5,0], size:[1,h, l+1]});
    add({type:'box', pos:[0,h*0.5,l*0.5], size:[l-1,h, 1]});
    add({type:'box', pos:[0,h*0.5,-l*0.5], size:[l-1,h, 1]});

    var i = 200, pos = [], s, d, rot = [0,0,90];
    
    while( i-- ) {

        
        d = Math.rand(0.1,1);
        h = Math.rand(0.1,4);

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
    }*/

};