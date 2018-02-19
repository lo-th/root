function demo() {

    cam ({azim:0, polar:25, distance:100});

    set({ 
        fps:60, 
        forceStep:0.3,
        iteration:1, 
        precision:[ 10, 15, 10, 10 ], 
        patchVelocity:false 
    });

    var x, z, r = 1;
    for (var i = 0; i < 7; ++i) {
        for (var j = 0; j < 7; ++j) {

            x = 55.0 + i * 10.0;
            z = 55.0 + j * 10.0;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ -x, -z ], n:1 });

            x = -55.0 - i * 10.0;
            z = 55.0 + j * 10.0;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ -x, -z ], n:2 });

            x = 55.0 + i * 10.0;
            z = -55.0 - j * 10.0;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ -x, -z ], n:3 });

            x = -55.0 - i * 10.0;
            z = -55.0 - j * 10.0;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ -x, -z ], n:5 });

        }
    }

    way({x:-42.1, z:-42.2});
    way({x:-42.3, z:-8.4});
    way({x:-42.1, z:8.21});
    way({x:-42.21, z:42.0});
    way({x:-8.1, z:-42.0});
    way({x:-8.12, z:-8.0});
    way({x:-8.05, z:8.0});
    way({x:-8.05, z:42.0});
    way({x:8.08, z:-42.0});
    way({x:8.07, z:-8.09});
    way({x:8.09, z:8.0});
    way({x:8.08, z:42.0});
    way({x:42.02, z:-42.09});
    way({x:42.01, z:-8.09});
    way({x:42.04, z:8.09});
    way({x:42.08, z:42.09});


    obstacle({size:[30,8,30], pos:[25, 4, 25]});
    obstacle({size:[30,8,30], pos:[-25, 4, 25]});
    obstacle({size:[30,8,30], pos:[-25, 4, -25]});
    obstacle({size:[30,8,30], pos:[25, 4, -25]});

    up();

};