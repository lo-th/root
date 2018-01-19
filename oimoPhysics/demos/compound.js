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

};