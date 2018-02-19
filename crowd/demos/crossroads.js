function demo() {

    cam ({azim:0, polar:10, distance:50});

    set({ 
        fps:60, 
        forceStep:0.3,
        iteration:1, 
        precision:[ 10, 15, 10, 10 ], 
        //precision:[ 100, 200, 50, 30 ],
        //precision:[ 100, 100, 100, 100 ],
        patchVelocity:false 
    });

    var x, z, r = 1;
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {

            x = 40.0 + i * 1;
            z = j * 1;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ -x, z ], n:1 });

            x = -40.0 - i * 1;
            z = j * 1;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ -x, z ], n:2 });

            x = i * 1;
            z = 40.0 + j * 1;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ x, -z ], n:3 });

            x = i * 1;
            z = -40.0 - j * 1;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ x, -z ], n:5 });

        }
    }


    up();

};