function demo() {

    cam ([0, 20, 20]);

    // reset oimo world to default setting
     
    set({

        fps: 60,
        broadPhase: 2, // 1: BruteForce | 2: Bvh
        gravity: [ 0, -9.80665, 0 ],

    });

    // basic geometry box
    var w = 20, h = 30, m = 2;
    add({size:[40, 2, 40], pos:[0,-1,0]});

    var pos = { x:0, y:0, z:0 };

    var i = 30;
    while(i--){
        pos.x = Math.rand(-10,10);
        pos.y = 10;
        pos.z = Math.rand(-10,10);
        ragdoll( 0, pos );
    }

    

};

function ragdoll ( n, p ) {

    var p = p || {x:0, y:0, z:0};

    var headHeight = 0.3;
    var upperBody = 0.35;
    var lowerBody = 0.35;
    var bodyRadius = 0.2;
    var legRadius = 0.1;
    var legInterval = 0.15;
    var upperLeg = 0.5;
    var lowerLeg = 0.5;
    var armRadius = 0.075;
    var upperArm = 0.35;
    var lowerArm = 0.35;

    var type = 'capsule';
    var density = 0.2;

    add({ name:'head' + n, type:type, density:density, size:[ headHeight / 2 * 0.8, headHeight / 2 * 0.2 ], pos:[p.x, p.y + lowerBody + upperBody + bodyRadius + headHeight / 2, p.z] });
    add({ name:'body1' + n, type:type, density:density, size:[ bodyRadius, upperBody / 2 ], pos:[p.x, p.y +  lowerBody + upperBody / 2, p.z] });
    add({ name:'body2' + n, type:type, density:density, size:[ bodyRadius, lowerBody / 2 ], pos:[p.x, p.y +  lowerBody / 2, p.z] });

    add({ name:'legL1' + n, type:type, density:density, size:[ legRadius, upperLeg / 2 ], pos:[p.x-legInterval,p.y -upperLeg / 2 - legInterval, p.z] });
    add({ name:'legL2' + n, type:type, density:density, size:[ legRadius, lowerLeg / 2 ], pos:[p.x-legInterval,p.y -upperLeg - lowerLeg / 2 - legInterval, p.z] });

    add({ name:'legR1' + n, type:type, density:density, size:[ legRadius, upperLeg / 2 ], pos:[p.x+legInterval,p.y -upperLeg / 2 - legInterval, p.z] });
    add({ name:'legR2' + n, type:type, density:density, size:[ legRadius, lowerLeg / 2 ], pos:[p.x+legInterval,p.y -upperLeg - lowerLeg / 2 - legInterval, p.z] });

    add({ name:'armL1' + n, type:type, density:density, size:[ armRadius, upperArm / 2 ], pos:[p.x-bodyRadius - upperArm / 2, p.y + lowerBody + upperBody, p.z], rot:[0,0,90] });
    add({ name:'armL2' + n, type:type, density:density, size:[ armRadius, lowerArm / 2 ], pos:[p.x-bodyRadius - upperArm - lowerArm / 2, p.y + lowerBody + upperBody, p.z], rot:[0,0,90] });

    add({ name:'armR1' + n, type:type, density:density, size:[ armRadius, upperArm / 2 ], pos:[p.x+bodyRadius + upperArm / 2, p.y + lowerBody + upperBody, p.z], rot:[0,0,90] });
    add({ name:'armR2' + n, type:type, density:density, size:[ armRadius, lowerArm / 2 ], pos:[p.x+bodyRadius + upperArm + lowerArm / 2, p.y + lowerBody + upperBody, p.z], rot:[0,0,90] });

    var x = [ 1, 0, 0 ];
    var y = [ 0, 1, 0 ];
    var z = [ 0, 0, 1 ];
    var xn = [ -1, 0, 0 ];
    var yn = [ 0, -1, 0 ];
    var zn = [ 0, 0, -1 ];
    var spring = [ 10 , 1 ];
    var lm180 = [ -90, 90];
    var lm90 = [ -45, 45 ];
    var lmElbow = [ 0, 160 ];
    var lmKnee = [ 0, 160 ];

    // joint type: ragdoll, revolute, spherical, cylindrical, prismatic, universal 

    joint({ type:'ragdoll', b1:'body1'+n, b2:'head'+n, anchor:[p.x, p.y + lowerBody + upperBody + bodyRadius, p.z], axis1:y, axis3:x, sp1:spring, sp2:spring, ma1:90, ma2:70, lm1:lm180  });
    joint({ type:'ragdoll', b1:'body1'+n, b2:'body2'+n, anchor:[p.x, p.y + lowerBody, p.z], axis1:y, axis3:x, sp1:spring, sp2:spring, ma1:60, ma2:45, lm1:lm90  });

    joint({ type:'ragdoll', b1:'body1'+n, b2:'armL1'+n, anchor:[p.x-bodyRadius, p.y+lowerBody + upperBody, p.z], axis1:x, axis3:z, sp1:spring, sp2:spring, ma1:90, ma2:90, lm1:lm180 });
    joint({ type:'ragdoll', b1:'body1'+n, b2:'armR1'+n, anchor:[p.x+bodyRadius, p.y+lowerBody + upperBody, p.z], axis1:xn, axis3:z, sp1:spring, sp2:spring, ma1:90, ma2:90, lm1:lm180 });

    joint({ type:'revolute', b1:'armL1'+n, b2:'armL2'+n, anchor:[p.x-bodyRadius - upperArm, p.y+lowerBody + upperBody, p.z], axis1:y, sp1:spring, lm1:lmElbow  });
    joint({ type:'revolute', b1:'armR1'+n, b2:'armR2'+n, anchor:[p.x+bodyRadius + upperArm, p.y+lowerBody + upperBody, p.z], axis1:yn, sp1:spring, lm1:lmElbow  });

    joint({ type:'ragdoll', b1:'body2'+n, b2:'legL1'+n, anchor:[p.x-legInterval, p.y-legInterval, p.z], axis1:y, axis3:x, axis2:zn, sp1:spring, sp2:spring, ma1:90, ma2:70, lm1:lm180 });
    joint({ type:'ragdoll', b1:'body2'+n, b2:'legR1'+n, anchor:[p.x+legInterval, p.y-legInterval, p.z], axis1:y, axis3:x, axis2:zn, sp1:spring, sp2:spring, ma1:90, ma2:70, lm1:lm180 });

    joint({ type:'revolute', b1:'legL1'+n, b2:'legL2'+n, anchor:[p.x-legInterval, p.y-legInterval - upperLeg, p.z], axis1:x, sp1:spring, lm1:lmKnee });
    joint({ type:'revolute', b1:'legR1'+n, b2:'legR2'+n, anchor:[p.x+legInterval, p.y-legInterval - upperLeg, p.z], axis1:x, sp1:spring, lm1:lmKnee });


}