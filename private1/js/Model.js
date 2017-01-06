var V = {};

V.Model = function ( Scene, type, meshs, mat, pos ) {

    var tSize = 1.4;

    


    //this.mesh = meshs.body.clone();
    this.mesh = meshs.skin.clone();

    this.bones = this.mesh.skeleton.bones;

    var i, name, bone, lng = this.bones.length;

    this.b = {};

    for( i=0; i<lng; i++){
        bone = this.bones[i];
        name = bone.name;
        this.b[ name ] = bone;
        //if(type === 'man') console.log(i, this.bones[i].name )
    }

    //console.log(this.b.head)
    //console.log(this.b.rHand)

    //var a0 = meshs.corps.clone();
    //a0.rotation.set( 180*torad,180*torad, 0*torad );

    var a1 = meshs.head_mesh.clone();
    a1.rotation.set( 180*torad,180*torad, 0*torad );

    var a2 = type === 'man' ? meshs.extra_man.clone() : meshs.extra_wom.clone()

    

    // material

    this.baseMat = type === 'man' ? mat.base0 : mat.base1;
    this.pullMat = new THREE.MeshBasicMaterial({ color: type === 'man' ? 0x010044 : 0x1c1c1c, wireframe:false });
    this.skinMat = new THREE.MeshBasicMaterial({ color: type === 'man' ? 0xb1774f : 0x895837, wireframe:false });




    this.mesh.material = type === 'man' ? mat.skin0 : mat.skin1;
    //a0.material = type === 'man' ? mat.base0 : mat.base1;
    a1.material = this.baseMat
    a2.material = this.baseMat;

    a1.add( a2 );
    //this.b.abdomen.add( a0 );
    this.b.head.add( a1 );

    if(type === 'man') this.mesh.play(0);
    else this.mesh.play(1);

    this.mesh.position.copy( pos );

    var pos = []

    var mat = new THREE.MeshBasicMaterial({ color:0xFF0000, wireframe:true });

    this.footR = meshs.foot.clone();
    this.footL = meshs.foot.clone();

    this.footR.rotation.set( 180*torad,180*torad, 0*torad );
    this.footL.rotation.set( 180*torad,180*torad, 0*torad );

    this.footR.material = this.baseMat;
    this.footL.material = this.baseMat;

    //this.b.rFoot.add( this.footR );
    //this.b.lFoot.add( this.footL );

    Scene.add( this.footR );
    Scene.add( this.footL );



    var hand = new THREE.SphereBufferGeometry( 2.5, 16, 12 );
    hand.translate( 0,-1.5,0 );

    this.handL = new THREE.Mesh( hand, this.skinMat );
    this.handR = new THREE.Mesh( hand, this.skinMat );

    //this.b.rHand.add( this.handR );
    //this.b.lHand.add( this.handL );

    Scene.add( this.handR );
    Scene.add( this.handL );


    // new Leg

    this.legL = new THREE.Tubex( { start:[0,0,0], end:[0,1,0], numSegment:3 }, 12, tSize );
    this.legmeshL = new THREE.Mesh( this.legL, this.pullMat );

    this.legR = new THREE.Tubex( { start:[0,0,0], end:[0,1,0], numSegment:3 }, 12, tSize );
    this.legmeshR = new THREE.Mesh( this.legR, this.pullMat );

    Scene.add( this.legmeshL );
    Scene.add( this.legmeshR );

    // new arm

    this.armL = new THREE.Tubex( { start:[0,0,0], end:[0,1,0], numSegment:4 }, 16, tSize );
    this.armmeshL = new THREE.Mesh( this.armL, this.pullMat );

    this.armR = new THREE.Tubex( { start:[0,0,0], end:[0,1,0], numSegment:4 }, 16, tSize );
    this.armmeshR = new THREE.Mesh( this.armR, this.pullMat );

    Scene.add( this.armmeshL );
    Scene.add( this.armmeshR );

    this.dcs = type === 'man' ? new THREE.Vector3(0,-1,0) : new THREE.Vector3(0,-3,0);

    //console.log(this.leg.positions)

    

    //this.helper = new THREE.SkeletonHelper( this.mesh );
    this.helper = new THREE.SkeletonHelper( this.b.hip );
    this.helper.skeleton = this.mesh.skeleton;

    this.helper.visible = false;

    Scene.add( this.helper );
    Scene.add( this.mesh );
    
}

V.Model.prototype = {
    update: function ( ){

        this.legL.positions[0].setFromMatrixPosition( this.b.lThigh.matrixWorld );
        this.legL.positions[1].setFromMatrixPosition( this.b.lShin.matrixWorld );
        this.legL.positions[2].setFromMatrixPosition( this.b.lFoot.matrixWorld );

        this.footL.position.setFromMatrixPosition( this.b.lFoot.matrixWorld );
        this.footL.quaternion.setFromRotationMatrix( this.b.lFoot.matrixWorld );

        this.legL.updatePath();

        this.legR.positions[0].setFromMatrixPosition( this.b.rThigh.matrixWorld );
        this.legR.positions[1].setFromMatrixPosition( this.b.rShin.matrixWorld );
        this.legR.positions[2].setFromMatrixPosition( this.b.rFoot.matrixWorld );

        this.footR.position.setFromMatrixPosition( this.b.rFoot.matrixWorld );
        this.footR.quaternion.setFromRotationMatrix( this.b.rFoot.matrixWorld );

        this.legR.updatePath();

        this.armL.positions[0].setFromMatrixPosition( this.b.lCollar.matrixWorld );
        this.armL.positions[1].setFromMatrixPosition( this.b.lShldr.matrixWorld  ).add(this.dcs);
        this.armL.positions[2].setFromMatrixPosition( this.b.lForeArm.matrixWorld  );
        this.armL.positions[3].setFromMatrixPosition( this.b.lHand.matrixWorld  );

        this.handL.position.setFromMatrixPosition( this.b.lHand.matrixWorld );

        this.armL.updatePath();

        this.armR.positions[0].setFromMatrixPosition( this.b.rCollar.matrixWorld );
        this.armR.positions[1].setFromMatrixPosition( this.b.rShldr.matrixWorld ).add(this.dcs);
        this.armR.positions[2].setFromMatrixPosition( this.b.rForeArm.matrixWorld );
        this.armR.positions[3].setFromMatrixPosition( this.b.rHand.matrixWorld );

        this.handR.position.setFromMatrixPosition( this.b.rHand.matrixWorld );

        this.armR.updatePath();


        this.helper.update();

    }
}
