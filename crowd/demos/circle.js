function demo() {

    cam ({azim:0, polar:25, distance:80});

    set({ 
        fps:60, 
        forceStep:0.3,
        iteration:1, 
        precision:[ 10, 15, 10, 5 ], 
        patchVelocity:true 
    });

    var x, z, a, max = 128, r = 2;

    for(var i=0; i<max; i++){ 

        a = i * 2 * Math.PI / max;
        x = max * Math.cos(a);
        z = max * Math.sin(a);

        agent({ 

            pos:[ x, 0, z ],
            radius: r,
            speed: 1,
            useRoad:true,
            goal:[-x,-z],

        })

    }

    up();

};