var V = {};

V.Model = function ( Scene, type, meshs, txt, pos ) {

    this.position = pos;

    var tSize = 1.4;
    this.debug = false;

    //this.root = new THREE.Group();

    this.mesh = meshs.skin.clone();

    this.mesh.name = type;

    this.bones = this.mesh.skeleton.bones;

    var i, name, bone, lng = this.bones.length;

    this.poseMatrix = [];
    this.b = {};

    for( i=0; i<lng; i++){

        bone = this.bones[i];
        name = bone.name;
        this.b[ name ] = bone;
        this.poseMatrix[i] = bone.matrixWorld.clone();

    }

    var a1 = meshs.head_mesh.clone();
    a1.rotation.set( 180*torad, 180*torad, 0 );

    var a2 = type === 'man' ? meshs.extra_man.clone() : meshs.extra_wom.clone()

    // material

    //this.mapSkinMat = new THREE.MeshBasicMaterial({ map:type === 'man' ? txt.man : txt.wom, skinning:true, wireframe:debug });
    this.mapMat = new THREE.MeshBasicMaterial({ map:type === 'man' ? txt.man : txt.wom, wireframe:this.debug });
    this.mapSkinMat = this.mapMat.clone();
    this.mapSkinMat.skinning = true;

    this.pullMat = new THREE.MeshBasicMaterial({ color: type === 'man' ? 0x010044 : 0x1c1c1c, wireframe:this.debug });
    this.skinMat = new THREE.MeshBasicMaterial({ color: type === 'man' ? 0xb1774f : 0x895837, wireframe:this.debug });
    //this.debugMat = new THREE.MeshBasicMaterial({ color:0xFF0000, wireframe:true });

    this.mesh.material = this.mapSkinMat;
    a1.material = this.mapMat;
    a2.material = this.mapMat;

    a1.add( a2 );
    //this.b.abdomen.add( a0 );
    this.b.head.add( a1 );

    /*if(type === 'man') this.mesh.play(0);
    else this.mesh.play(1);*/

    //this.mesh.position.copy( pos );

    this.mesh.position.copy( this.position );

   

    this.footR = meshs.foot.clone();
    this.footL = meshs.foot.clone();

    this.footR.rotation.set( 180*torad, 180*torad, 0 );
    this.footL.rotation.set( 180*torad, 180*torad, 0 );

    this.footR.material = this.mapMat;
    this.footL.material = this.mapMat;

    //this.b.rFoot.add( this.footR );
    //this.b.lFoot.add( this.footL );

    Scene.add( this.footR );
    Scene.add( this.footL );



    var hand = new THREE.SphereBufferGeometry( 2.5, 16, 12 );
    hand.translate( -1.5,0,0 );

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


    this.dda = new THREE.Matrix4().makeTranslation(-6,1,0);
    this.ddd = new THREE.Matrix4().makeTranslation(-6,-1,0);
    this.ddx = new THREE.Matrix4().makeTranslation(-6,0,0)

    //console.log(this.leg.positions)

    

    //this.helper = new THREE.SkeletonHelper( this.mesh );
    this.helper = new THREE.SkeletonHelper( this.b.hip );
    this.helper.skeleton = this.mesh.skeleton;
    this.helper.visible = this.debug;

    Scene.add( this.helper );
    //this.root.add( this.mesh );

    Scene.add( this.mesh );
    
}


V.Model.prototype = {

    setPosition: function(pos){

        if(pos) this.position = pos;
        this.mesh.position.copy( this.position );

    },

    setDebug: function(b){

        this.debug = b;

        this.helper.visible = this.debug;
        this.mapMat.wireframe = this.debug;
        this.mapSkinMat.wireframe = this.debug;
        this.pullMat.wireframe = this.debug;
        this.skinMat.wireframe = this.debug;

    },

    update: function ( ){

        var m;

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
        this.armL.positions[1].setFromMatrixPosition( this.b.lShldr.matrixWorld.clone().multiply(this.dda) );
        this.armL.positions[2].setFromMatrixPosition( this.b.lForeArm.matrixWorld.clone().multiply(this.ddx) );

        m = this.b.lHand.matrixWorld;

        this.armL.positions[3].setFromMatrixPosition( m );
        this.handL.position.setFromMatrixPosition( m );
        this.handL.quaternion.setFromRotationMatrix( m );

        this.armL.updatePath();

        this.armR.positions[0].setFromMatrixPosition( this.b.rCollar.matrixWorld );
        this.armR.positions[1].setFromMatrixPosition( this.b.rShldr.matrixWorld.clone().multiply(this.ddd) );
        this.armR.positions[2].setFromMatrixPosition( this.b.rForeArm.matrixWorld.clone().multiply(this.ddx) );

        m = this.b.rHand.matrixWorld;

        this.armR.positions[3].setFromMatrixPosition( m );
        this.handR.position.setFromMatrixPosition( m );
        this.handR.quaternion.setFromRotationMatrix( m );

        this.armR.updatePath();

        this.helper.update();

    }
}
