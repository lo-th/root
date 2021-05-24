var ball, raytest;

function demo() {

    phy.set({ substep:1, gravity:[0,-9.81,0] })

    phy.add({ type:'box', size:[10,2,60], rot:[10,0,0], pos:[0,-1.2,0], friction:0.5, group:1, mask:2 });


    ball = phy.add({ type:'sphere', name:'ball', size:[2], pos:[0,20,-25], density:2, restitution:0.8, group:2, mask:1|2 });

    // ray can be add to scene
    var i = 20, x;
    while(i--){
        x = (i*0.5)-4.5;
        phy.add({ type:'ray', begin:[x,20,0], end:[x,0, 0], callback:Yoch, visible:true });
    }


    // or ray can be attach to any mesh

    /*var spherical = new THREE.Spherical();
    var p1 = new THREE.Vector3();
    var p2 = new THREE.Vector3();

    var i = 100;

    while( i-- ){

        var theta = math.rand( -180, 180 ) * math.torad;
        var phi = math.rand( -180, 180 )  * math.torad;
        spherical.set(4, phi, theta);
        p1.setFromSpherical(spherical);
        spherical.set(10, phi, theta);
        p2.setFromSpherical(spherical);

        phy.add({ type:'ray', name:'rr'+ i, pos:[0,0,0], start:p1.toArray(), end:p2.toArray(), callback:Yoch, visible:true, parent:ball, group: "solid" });

    } */


    // update after physic step
    phy.setPostUpdate ( update )

};


function Yoch( o ){

    //console.log( o.name )

}

function update () {

    // if ball position y is under 10, ball is replaved and velocity reset
    if( ball.position.y<-10 ) phy.update( { name:'ball', pos: [ math.rand(-4,4),20,-25 ], rot:[math.randInt(-180,180),0,math.randInt(-180,180)], reset:true } );



}
