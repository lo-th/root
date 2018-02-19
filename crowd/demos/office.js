function demo() {

    cam ({azim:0, polar:25, distance:130});

    set({ 
        fps:60, 
        forceStep:0.3,
        iteration:1, 
        precision:[ 10, 15, 10, 10 ], 
        patchVelocity:false 
    });

    var x, z, r = 1;
    for (var i = 0; i < 16; ++i) {
        for (var j = 0; j < 16; ++j) {

            x = 205.0 + i * 1;
            z = j * 1;

            agent({ pos:[ x, 0, z ], radius: r, speed: 1, useRoad:true, goal:[ -150, z ] });

        }
    }

    way({x:140, z:0});
    way({x:160, z:0});

    way({x:205, z:-65});
    way({x:205, z:-45});

    way({x:205, z:65});
    way({x:205, z:45});

    way({x:145, z:65});
    way({x:145, z:-65});
    
    way({x:265, z:65});
    way({x:265, z:-65});

    way({x:140 - 400, z:0});
    way({x:160 - 400, z:0});
    way({x:205 - 400, z:-65});
    way({x:205 - 400, z:-45});
    way({x:205 - 400, z:65});
    way({x:205 - 400, z:45});
    way({x:145 - 400, z:65});
    way({x:145 - 400, z:-65});
    way({x:265 - 400, z:65});
    way({x:265 - 400, z:-65});

    var s = 2
    var y = 1;

    obstacle({size:[5, s, 52], pos:[150, y, 29]});
    obstacle({size:[5, s, 52], pos:[150, y, -29]});
    obstacle({size:[5, s, 110], pos:[260, y, 0]});
    obstacle({size:[52, s, 5], pos:[173.5, y, 55]});
    obstacle({size:[52, s, 5], pos:[236.5, y, 55]});
    obstacle({size:[52, s, 5], pos:[173.5, y, -55]});
    obstacle({size:[52, s, 5], pos:[236.5, y, -55]});
    
    obstacle({size:[5, s, 52], pos:[-300 + 50, y, 29]});
    obstacle({size:[5, s, 52], pos:[-300 + 50, y, -29]});
    obstacle({size:[5, s, 110], pos:[-190 + 50, y, 0]});
    obstacle({size:[52, s, 5], pos:[-276.5 + 50, y, 55]});
    obstacle({size:[52, s, 5], pos:[-213.5 + 50, y, 55]});
    obstacle({size:[52, s, 5], pos:[-276.5 + 50, y, -55]});
    obstacle({size:[52, s, 5], pos:[-213.5 + 50, y, -55]});

    up();

};