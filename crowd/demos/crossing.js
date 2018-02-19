function demo() {

    cam ({azim:0, polar:25, distance:60});

    set({ 
        fps:60, 
        forceStep:0.3,
        iteration:1, 
        precision:[ 10, 15, 10, 10 ], 
        patchVelocity:false 
    });

    var x, z, r = 2;
    for (var i = 0; i < 6; ++i) {
        for (var j = 0; j < 6; ++j) {

            x = 60 + i * 1;
            z = -20 + j * 5;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ -x, z ], n:1 });

            x = -60 - i * 1;
            z = -20 + j * 5;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ -x, z ], n:5 });

        }
    }

    //precision({ p:[10, 15, 10, 10] });// default
    //precision({ p:[100, 200, 50, 30] });
    precision({ p:[100, 100, 100, 100] });

    up();

};