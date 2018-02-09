var V = {};

V.Model = function ( type, meshs, txt, pos, meshs2 ) {

    this.isFirst = true;

    this.isSkin = true;
    this.debug = false;
    this.isLockHip = true;
    this.isSkeleton = false;

    this.preTime = 0;

    this.f = 0;

    this.txt = txt;
    this.type = type;

    this.mats = [];

    this.decal = new THREE.Vector3();

    this.position = pos || new THREE.Vector3();

    var tSize = 1.4;

    this.torad = 0.0174532925199432957;

    this.hipPos = new THREE.Vector3();
    

    this.mesh = meshs.skin.clone();
    this.mesh.name = type;

    this.bones = this.mesh.skeleton.bones;

    var i, name, bone, lng = this.bones.length;

    this.mtx = new THREE.Matrix4();
    this.matrixWorldInv = new THREE.Matrix4().getInverse( this.mesh.matrixWorld );

    this.poseMatrix = [];
    this.b = {};

    for( i=0; i<lng; i++){

        bone = this.bones[i];
        name = bone.name;

        //console.log(name)

        this.b[ name ] = bone;
        this.poseMatrix[i] = bone.matrixWorld.clone();

        if( name === 'hip' ) this.hipPos.setFromMatrixPosition( this.poseMatrix[i] );

    }

    this.mesh.userData.posY = this.hipPos.y;
    this.position.y = this.hipPos.y;

    //console.log( this.hipPos.y )

    this.root = new THREE.Group();

    var bodyGeo = new THREE.SphereBufferGeometry( 23.5, 32, 28 );
    var headGeo = new THREE.SphereBufferGeometry( 14.5, 32, 28 );
    var hearGeo = new THREE.SphereBufferGeometry( 1.6, 16, 12 );

    bodyGeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,0,1), 90*this.torad));
    bodyGeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(1,0,0), -90*this.torad));
    bodyGeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,1,0), -14*this.torad));
    bodyGeo.applyMatrix( new THREE.Matrix4().makeTranslation(-2,0,0));
    
    headGeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,0,1), 90*this.torad));
    headGeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(1,0,0), -90*this.torad));
    headGeo.applyMatrix( new THREE.Matrix4().makeTranslation(-14.5,0,0));


    this.rondoMesh = new THREE.Mesh(bodyGeo);

    this.headMesh = new THREE.Mesh(headGeo);
    this.hearL = new THREE.Mesh(hearGeo);
    this.hearR = new THREE.Mesh(hearGeo);

    this.hearL.position.set(-14.5, 14.9, 0)
    this.hearR.position.set(-14.5, -14.9, 0)

    this.headMesh.add(this.hearL);
    this.headMesh.add(this.hearR);

    //this.b.head.add( this.headMesh );

    this.headMesh.castShadow = true;
    this.headMesh.receiveShadow = true;

    this.rondoMesh.castShadow = true;
    this.rondoMesh.receiveShadow = true;

    this.headExtra = type === 'man' ? meshs.extra_man.clone() : meshs.extra_wom.clone()

    this.footR = meshs.foot.clone();
    this.footL = meshs.foot.clone();

    this.footR.rotation.set( 180*this.torad, 180*this.torad, 0 );
    this.footL.rotation.set( 180*this.torad, 180*this.torad, 0 );

    this.footR.material = this.mats[0];
    this.footL.material = this.mats[0];

    this.footR.castShadow = true;
    this.footR.receiveShadow = true;
    this.footL.castShadow = true;
    this.footL.receiveShadow = true;



    var hand = new THREE.SphereBufferGeometry( 2.5, 16, 12 );
    hand.translate( -1.5,0,0 );

    this.handL = new THREE.Mesh( hand, this.mats[3] );
    this.handR = new THREE.Mesh( hand, this.mats[3] );

    this.handL.castShadow = true;
    this.handL.receiveShadow = true;
    this.handR.castShadow = true;
    this.handR.receiveShadow = true;

    // test

    if( !this.isSkin ){

        var mtx =  new THREE.Matrix4();

        this.bodygeo = new THREE.Tubular( { start:[0,0,0], end:[0,40,0], numSegment:4 }, 30, 23, 20 ,false, 'sphere' );

        //this.bodygeo.setTension(0);

        this.bodyMesh = new THREE.Mesh( this.bodygeo, this.mats[2] );
        this.root.add( this.bodyMesh );

        this.bodyMesh.castShadow = true;
        this.bodyMesh.receiveShadow = true;

        this.cax = new THREE.Matrix4().makeTranslation(4,0,0);
        this.cbx = new THREE.Matrix4().makeTranslation(-8,0, 0);
        this.ccx = new THREE.Matrix4().makeTranslation(-10,0,0);
        //this.cdx = new THREE.Matrix4().makeTranslation(-15,0,15);
        this.cdx = new THREE.Matrix4().makeTranslation(-25,0,0)



        //mtx.identity().makeRotationAxis(new THREE.Vector3(0,0,1), 30*this.torad );
        //this.cbx.multiply( mtx );

        //mtx.identity().makeRotationAxis(new THREE.Vector3(0,0,1), -60*this.torad );
        //this.ccx.multiply( mtx );
        //mtx.identity().makeRotationAxis(new THREE.Vector3(0,0,1), 60*this.torad );
        //this.cdx.multiply( mtx );

    }

    

    // new Leg

    this.legL = new THREE.Tubular( { start:[0,0,0], end:[0,-40,0], numSegment:3 }, 12, tSize );
    this.legmeshL = new THREE.Mesh( this.legL, this.mats[2] );

    this.legR = new THREE.Tubular( { start:[0,0,0], end:[0,-40,0], numSegment:3 }, 12, tSize );
    this.legmeshR = new THREE.Mesh( this.legR, this.mats[2] );

    // new arm

    this.armL = new THREE.Tubular( { start:[0,40,0], end:[0,0,0], numSegment:4 }, 16, tSize );
    this.armmeshL = new THREE.Mesh( this.armL, this.mats[2] );

    this.armR = new THREE.Tubular( { start:[0,40,0], end:[0,0,0], numSegment:4 }, 16, tSize );
    this.armmeshR = new THREE.Mesh( this.armR, this.mats[2] );


    this.dda = new THREE.Matrix4().makeTranslation(-6,1,0);
    this.ddd = new THREE.Matrix4().makeTranslation(-6,-1,0);
    this.ddx = new THREE.Matrix4().makeTranslation(-6,0,0);

    this.armmeshL.castShadow = true;
    this.armmeshL.receiveShadow = true;
    this.armmeshR.castShadow = true;
    this.armmeshR.receiveShadow = true;

    this.legmeshL.castShadow = true;
    this.legmeshL.receiveShadow = true;
    this.legmeshR.castShadow = true;
    this.legmeshR.receiveShadow = true;


    /*this.helper = new THREE.SkeletonHelper( this.b.hip );
    this.helper.skeleton = this.mesh.skeleton;
    this.helper.visible = this.debug;*/


    //this.head = new V.Head( this.type, this.txt, meshs2 );

    this.setMaterial(1);

    this.headMesh.add( this.headExtra );

    

    this.root.add( this.footR );
    this.root.add( this.footL );
    this.root.add( this.handR );
    this.root.add( this.handL );
    this.root.add( this.armmeshL );
    this.root.add( this.armmeshR );
    this.root.add( this.legmeshL );
    this.root.add( this.legmeshR );
    this.root.add( this.headMesh );
    this.root.add( this.rondoMesh );
    
    //this.root.add( this.helper );
    this.attach( this.rondoMesh, this.b.chest );
    this.attach( this.headMesh, this.b.head );

    this.addEyes();
    this.addEyebow();


    this.mesh.position.copy( this.position ).add(this.decal);

   // if( this.isSkin ) this.mesh.visible = true;
  //  else  

        this.mesh.visible = false;

    // hide model

    //this.root.visible = false;
   // this.mesh.visible = false;
    
}


V.Model.prototype = {

    getDecal: function () {

        return this.decal.y;

    },

    setDecal: function ( v ) {

        this.decal.y = v;
        this.mesh.position.copy( this.position ).add( this.decal );

    },

    attach: function ( mesh, bone ) {

        mesh.matrix = bone.matrixWorld;
        mesh.matrixAutoUpdate = false;

    },

    addEyebow: function () {



        var w = 2.5;
        var h = 0.6;
        var r = 0.75;

        var g = new THREE.CapsuleBufferGeometry( r, w )

        /*var l = new THREE.CylinderGeometry( r,r, h, 16, 1, false,  0, 180 * this.torad );
        l.applyMatrix( new THREE.Matrix4().makeTranslation(w*0.5,0,0));
        var s = new THREE.CylinderGeometry( r, r, h, 16, 1, false,  0, 180 * this.torad);
        s.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,1,0), 180*this.torad));
        s.applyMatrix( new THREE.Matrix4().makeTranslation(-w*0.5,0,0));
        var b = new THREE.BoxGeometry( w, h, r*2 );
        var g = new THREE.Geometry();
        g.merge( b );
        g.merge( l );
        g.merge( s );*/

        //g.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,0,1), 90*this.torad));
        g.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,1,0), -90*this.torad));

        var bowL = new THREE.Mesh( g, this.mats[7] );
        var bowR = new THREE.Mesh( g, this.mats[7] );

        bowL.rotation.x = 26*this.torad;
        bowR.rotation.x = -26*this.torad;

        bowL.rotation.y = 12*this.torad;
        bowR.rotation.y = 12*this.torad;

        bowL.position.set( -19, 5.7,-12.7 );
        bowR.position.set( -19,-5.7,-12.7 );

        this.headMesh.add( bowL );
        this.headMesh.add( bowR );

    },

    addEyes : function () {

        var eye = new THREE.SphereBufferGeometry( 0.75, 16, 12 );
        var er = new THREE.Mesh( eye, this.mats[6] );
        var el = new THREE.Mesh( eye, this.mats[6] );

        er.position.set( -14.5,5.7,-13.4 );
        el.position.set( -14.5,-5.7,-13.4 );

        if( this.type !== 'man' ){
            var c = new THREE.CylinderBufferGeometry(0.14, 0.14, 1), mr, ml;
            c.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,0,1), 90*this.torad));
            c.applyMatrix( new THREE.Matrix4().makeTranslation( -1.2, 0, 0 ));
            for(var i=0; i<3; i++){

                mr = new THREE.Mesh( c, this.mats[6] );
                ml = new THREE.Mesh( c, this.mats[6] );

                mr.rotation.z = -(i * 30) * this.torad;
                ml.rotation.z = (i * 30) * this.torad;

                er.add( mr );
                el.add( ml );

            }
        }

        this.headMesh.add( er );
        this.headMesh.add( el );

    },

    addSkeleton: function ( b ) {

        if( b ){
            this.isSkeleton = true;
            this.helper = new THREE.SkeletonHelper( this.b.hip );
            this.helper.skeleton = this.mesh.skeleton;
            this.root.add( this.helper );
        } else {
            if(this.isSkeleton){
                this.root.remove( this.helper );
                this.isSkeleton = false;
            }
        }

    },

    lockHip: function ( b ) {

        this.isLockHip = b;

    },

    setTimescale: function ( v ) {

        this.mesh.setTimeScale( v );

    },

    reset:function(){

        this.mesh.stopAll();

        var i, name, bone, lng = this.bones.length;


        for( i=0; i<lng; i++){

            bone = this.bones[i];
            bone.matrixWorld.copy( this.poseMatrix[i] );

        }

    },

    addToScene: function ( Scene ){

        Scene.add( this.mesh );
        Scene.add( this.root );

        //if( !this.isSkin ) this.bodygeo.addDebug( Scene );

        this.isFull = true;

    },

    removeFromScene: function( Scene ){

        Scene.remove( this.mesh );
        Scene.remove( this.root );

        //if( this.type !== 'man') Scene.remove( this.plus );

        this.isFull = false;

    },

    stop: function (){

        this.mesh.stopAll();

    },

    play: function ( name, crossfade, offset, weight ){

        this.mesh.play( name, crossfade, offset, weight );

    },

    getTime: function () {

        return this.mesh.currentAnimationAction ? this.mesh.currentAnimationAction.time : false;

    },


    setMaterial: function( n ){

        //this.initCanvas();

        var i = this.mats.length;
        while(i--){
            this.mats[i].dispose();
        }

        if( n===1 ) mtype = 'MeshLambertMaterial';
        if( n===2 ) mtype = 'MeshToonMaterial';
        if( n===3 ) mtype = 'MeshStandardMaterial';

        this.mats[0] = new THREE[mtype]({ map:this.type === 'man' ? this.txt.man : this.txt.wom });
        this.mats[1] = new THREE[mtype]({ map:this.type === 'man' ? this.txt.man : this.txt.wom, wireframe:true });//, skinning:true
        this.mats[2] = new THREE[mtype]({ color: this.type === 'man' ? 0x010044 : 0x1c1c1c });
        this.mats[3] = new THREE[mtype]({ color: this.type === 'man' ? 0xb1774f : 0x895837 });
        this.mats[4] = new THREE[mtype]({ map: this.type === 'man' ? this.txt.head_m : this.txt.head_w });//map:this.head.renderTarget.texture });
        this.mats[5] = new THREE[mtype]({ map:this.type === 'man' ? this.txt.corps_m : this.txt.corps_w });
        this.mats[6] = new THREE[mtype]({ color: 0x222222 });
        this.mats[7] = new THREE[mtype]({ color: this.type === 'man' ? 0x603208 : 0x3a1609 });

        if( n===3 ){
            var i = this.mats.length;
            while(i--){
                this.mats[i].envMap = this.txt.env;
            }
        }

        if(n===1){
            this.mats[0].emissiveMap = this.type === 'man' ? this.txt.man : this.txt.wom;
            this.mats[1].emissiveMap = this.type === 'man' ? this.txt.man : this.txt.wom;
            this.mats[4].emissiveMap = this.type === 'man' ? this.txt.head_m : this.txt.head_w;
            this.mats[5].emissiveMap = this.type === 'man' ? this.txt.corps_m : this.txt.corps_w;



            var i = this.mats.length;
            while(i--){
                this.mats[i].emissive =  this.mats[i].color;
                this.mats[i].emissiveIntensity = 0.5;
            }
            
        }

        this.headMesh.material = this.mats[4];
        this.hearL.material = this.mats[3];
        this.hearR.material = this.mats[3];

        this.footR.material = this.mats[0];
        this.footL.material = this.mats[0];
        this.handL.material = this.mats[3];
        this.handR.material = this.mats[3];
        //this.head.material = this.mats[0];
        this.headExtra.material = this.mats[0];
        this.mesh.material = this.mats[1];
        this.armmeshL.material = this.mats[2];
        this.armmeshR.material = this.mats[2];
        this.legmeshL.material = this.mats[2];
        this.legmeshR.material = this.mats[2];

        this.rondoMesh.material = this.mats[5];

        if( !this.isSkin ) this.bodyMesh.material = this.mats[5];

    },

    getHipPos: function () {

        return this.b.hip.getWorldPosition();

    },

    setPosition: function(pos){

        this.mesh.position.copy( this.position );

    },

    setDebug: function(b){

        this.debug = b;

        this.helper.visible = this.debug;

        var i = this.mats.length;
        while(i--){
            this.mats[i].wireframe = this.debug;
        }

    },

    update: function ( x,y ){

        //this.head.update(x,y);

        var m;

        if( this.isLockHip ){ 
            this.b.hip.position.x = 0;
            this.b.hip.position.z = 0;
        }

        //

        if( !this.isSkin ){

            this.bodygeo.rotations[0].setFromRotationMatrix( this.b.hip.matrixWorld.clone().multiply( this.cax ) );
            this.bodygeo.rotations[1].setFromRotationMatrix( this.b.abdomen.matrixWorld.clone().multiply( this.cbx ) );
            this.bodygeo.rotations[2].setFromRotationMatrix( this.b.chest.matrixWorld.clone().multiply( this.ccx ) );
            this.bodygeo.rotations[3].setFromRotationMatrix( this.b.chest.matrixWorld.clone().multiply( this.cdx ) );

            this.bodygeo.positions[0].setFromMatrixPosition( this.b.hip.matrixWorld.clone().multiply( this.cax ) );
            this.bodygeo.positions[1].setFromMatrixPosition( this.b.abdomen.matrixWorld.clone().multiply( this.cbx ) );
            this.bodygeo.positions[2].setFromMatrixPosition( this.b.chest.matrixWorld.clone().multiply( this.ccx ) );
            this.bodygeo.positions[3].setFromMatrixPosition( this.b.chest.matrixWorld.clone().multiply( this.cdx ) );

            this.bodygeo.updatePath( false );

        }





        //

        //this.headMesh.position.setFromMatrixPosition( this.b.head.matrixWorld );
        //this.headMesh.quaternion.setFromRotationMatrix( this.b.head.matrixWorld );

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

        if( this.isSkeleton ) this.helper.update();

        /*if(this.preTime<10) this.preTime ++; 
        else if( this.preTime===10 ){
            this.root.visible = true;
            if( this.isSkin ) this.mesh.visible = true;
        }*/

    }
}