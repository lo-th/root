function demo () {
    
    cam ([0, 60, 40]);

    hideGrid();

    // world setting
    set ({
        fps: 60,
        broadPhase: 2,
        gravity:[0,0,0],
    })

    /*add({ 
        type:'planet',
        name:'planet',
        radius:10,
        height:6,
        resolution:20,
        frequency : [0.1,0.5], // frequency of noise
        level : [1,0.25], // influence of octave
        expo: 2,

        density:0, 
        //friction:0.5, 
        //bounce:0.6 
    });*/
    
    var sx, sy, sz, x, y, z;
    for(var i = 0; i<200; i++){
        
        x = Math.rand(20, 100)*(Math.randInt(0, 1)? -1: 1);
        y = Math.rand(20, 100)*(Math.randInt(0, 1)? -1: 1);
        z = Math.rand(20, 100)*(Math.randInt(0, 1)? -1: 1);

        sx = Math.rand(0.6, 2);
        sy = Math.rand(0.6, 2);
        sz = Math.rand(0.6, 2);
        add({ type:'box', size:[sx,sy,sz], pos:[x,y,z], density:(sx+sy+sz)/3, autoSleep:true }); 

    }

    view.update = update;

};

function update() {

    var bodys = view.getBody();
    var p, m;
    var useLocal = false;

    var ar = [];

    bodys.forEach( function( b, id ) {

        p = b.position.clone().negate().normalize().multiplyScalar(3);
        // apply force to physics body
        oimo.send( 'force', [ b.name, 'force' , p.toArray() ] );

    });

};