var V = {};

V.Model = function ( Scene, type, meshs, txt, pos ) {

    this.f = 0;

    this.txt = txt;
    this.type = type;

    this.mats = [];

    this.position = pos;

    var tSize = 1.4;
    this.debug = false;



    
    //this.root = Scene;//new THREE.Group();

    this.mesh = meshs.skin.clone();

    this.mesh.name = type;

    //this.root = this.mesh;//new THREE.Group();
   // Scene.add( this.root )
    //this.root.position.copy( this.position );
    //this.mesh.position.copy( this.position );


    this.bones = this.mesh.skeleton.bones;

    var i, name, bone, lng = this.bones.length;

    this.poseMatrix = [];
    this.b = {};

    for( i=0; i<lng; i++){

        bone = this.bones[i];
        name = bone.name;
        this.b[ name ] = bone;
        //if( name === 'root' ) bone.position.copy( this.position );
        this.poseMatrix[i] = bone.matrixWorld.clone();

    }

    //this.mesh.position.copy( this.position );

    this.matrixWorldInv = new THREE.Matrix4().getInverse( this.mesh.matrixWorld );

    //this.root = this.b.root;
    //this.root.position.copy(this.position);

    var headGeo = new THREE.SphereBufferGeometry( 14.5, 32, 28 );
    var hearGeo = new THREE.SphereBufferGeometry( 1.6, 16, 12 );

    //headGeo.rotateZ( 90*torad );
    //headGeo.rotateY( 90*torad )
    
    headGeo.applyMatrix( new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0,0,1), 90*torad))
    headGeo.applyMatrix( new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1,0,0), -90*torad))
    headGeo.applyMatrix( new THREE.Matrix4().makeTranslation(-14.5,0,0))

    this.headSelf = new THREE.Mesh(headGeo);
    this.hearL = new THREE.Mesh(hearGeo);
    this.hearR = new THREE.Mesh(hearGeo);

    this.hearL.position.set(-14.5, 14.9, 0)
    this.hearR.position.set(-14.5, -14.9, 0)

    this.headSelf.add(this.hearL);
    this.headSelf.add(this.hearR);

   

    //this.head = meshs.head_mesh.clone();
    //this.head.rotation.set( 180*torad, 180*torad, 0 );

    this.a2 = type === 'man' ? meshs.extra_man.clone() : meshs.extra_wom.clone()

    // material

    

    //this.mapSkinMat = new THREE.MeshBasicMaterial({ map:type === 'man' ? txt.man : txt.wom, skinning:true, wireframe:debug });
    //this.mats.push( new THREE.MeshBasicMaterial({ map:this.type === 'man' ? this.txt.man : this.txt.wom }) );
    //this.mats.push( this.mats[0].clone() );
    //this.mats.push( new THREE.MeshBasicMaterial({ color: this.type === 'man' ? 0x010044 : 0x1c1c1c }) );
    //this.mats.push( new THREE.MeshBasicMaterial({ color: this.type === 'man' ? 0xb1774f : 0x895837 }) );
    //this.debugMat = new THREE.MeshBasicMaterial({ color:0xFF0000, wireframe:true });

    //this.mats[1].skinning = true;

    //this.head.material = this.mats[0];
    //this.a2.material = this.mats[0];
    //this.mesh.material = this.mats[1];

    

    /*if(type === 'man') this.mesh.play(0);
    else this.mesh.play(1);*/

    //this.mesh.position.copy( this.position );
    //this.b.root.position.copy( this.position );

    //

   

    this.footR = meshs.foot.clone();
    this.footL = meshs.foot.clone();

    this.footR.rotation.set( 180*torad, 180*torad, 0 );
    this.footL.rotation.set( 180*torad, 180*torad, 0 );

    this.footR.material = this.mats[0];
    this.footL.material = this.mats[0];

    //this.b.rFoot.add( this.footR );
    //this.b.lFoot.add( this.footL );

    

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

    //this.b.rHand.add( this.handR );
    //this.b.lHand.add( this.handL );

    


    // new Leg

    this.legL = new THREE.Tubex( { start:[0,0,0], end:[0,1,0], numSegment:3 }, 12, tSize );
    this.legmeshL = new THREE.Mesh( this.legL, this.mats[2] );

    this.legR = new THREE.Tubex( { start:[0,0,0], end:[0,1,0], numSegment:3 }, 12, tSize );
    this.legmeshR = new THREE.Mesh( this.legR, this.mats[2] );

    

    // new arm

    this.armL = new THREE.Tubex( { start:[0,0,0], end:[0,1,0], numSegment:4 }, 16, tSize );
    this.armmeshL = new THREE.Mesh( this.armL, this.mats[2] );

    this.armR = new THREE.Tubex( { start:[0,0,0], end:[0,1,0], numSegment:4 }, 16, tSize );
    this.armmeshR = new THREE.Mesh( this.armR, this.mats[2] );

    


    this.dda = new THREE.Matrix4().makeTranslation(-6,1,0);
    this.ddd = new THREE.Matrix4().makeTranslation(-6,-1,0);
    this.ddx = new THREE.Matrix4().makeTranslation(-6,0,0)


    this.armmeshL.castShadow = true;
    this.armmeshL.receiveShadow = true;
    this.armmeshR.castShadow = true;
    this.armmeshR.receiveShadow = true;

    this.legmeshL.castShadow = true;
    this.legmeshL.receiveShadow = true;
    this.legmeshR.castShadow = true;
    this.legmeshR.receiveShadow = true;

    //console.log(this.leg.positions)

    

    //this.helper = new THREE.SkeletonHelper( this.mesh );
    this.helper = new THREE.SkeletonHelper( this.b.hip );
    this.helper.skeleton = this.mesh.skeleton;
    this.helper.visible = this.debug;

    
    //this.root.add( this.mesh );

    this.head = new V.Head( this.type, this.txt );

    this.setMaterial(1);

    //this.head.add( this.a2 );
    this.headSelf.add( this.a2 );

    this.root = new THREE.Group();
    //this.b.abdomen.add( a0 );
    //this.root.add( this.head );
    this.root.add( this.footR );
    this.root.add( this.footL );
    this.root.add( this.handR );
    this.root.add( this.handL );
    this.root.add( this.armmeshL );
    this.root.add( this.armmeshR );
    this.root.add( this.legmeshL );
    this.root.add( this.legmeshR );

    this.root.add( this.headSelf );
    
    Scene.add( this.helper );

    //this.root.add( this.mesh );
    Scene.add( this.mesh );
    Scene.add( this.root );


    this.mesh.position.copy( this.position );

    //this.makehead();


    
    
}


V.Model.prototype = {

    /*makehead: function(){

        canvg( this.canvas, this.type === 'man' ? SVGman:SVGwom );
        this.headTexture.needsUpdate = true;

    },

    initCanvas: function(){

        if( this.canvas ) return;

        this.canvas = document.createElement("canvas");
        this.canvas.width = 512;
        this.canvas.height = 256;
        this.headTexture = new THREE.Texture( this.canvas );

    },*/

    setMaterial: function( n ){

        //this.initCanvas();

        var i = this.mats.length;
        while(i--){
            this.mats[i].dispose();
        }

        if( n===1 ) mtype = 'MeshBasicMaterial';
        if( n===2 ) mtype = 'MeshToonMaterial';
        if( n===3 ) mtype = 'MeshStandardMaterial';

        this.mats[0] = new THREE[mtype]({ map:this.type === 'man' ? this.txt.man : this.txt.wom });
        this.mats[1] = new THREE[mtype]({ map:this.type === 'man' ? this.txt.man : this.txt.wom, skinning:true });
        this.mats[2] = new THREE[mtype]({ color: this.type === 'man' ? 0x010044 : 0x1c1c1c });
        this.mats[3] = new THREE[mtype]({ color: this.type === 'man' ? 0xb1774f : 0x895837 });

        this.mats[4] = new THREE[mtype]({ map:this.head.renderTarget.texture });

        if( n===3 ){
            var i = this.mats.length;
            while(i--){
                this.mats[i].envMap = this.txt.env;
            }
        }

        this.headSelf.material = this.mats[4];
        this.hearL.material = this.mats[3];
        this.hearR.material = this.mats[3];

        this.footR.material = this.mats[0];
        this.footL.material = this.mats[0];
        this.handL.material = this.mats[3];
        this.handR.material = this.mats[3];
        //this.head.material = this.mats[0];
        this.a2.material = this.mats[0];
        this.mesh.material = this.mats[1];
        this.armmeshL.material = this.mats[2];
        this.armmeshR.material = this.mats[2];
        this.legmeshL.material = this.mats[2];
        this.legmeshR.material = this.mats[2];

    },

    setPosition: function(pos){

        this.mesh.position.copy( this.position );

        //if(pos) this.position = pos;
        //this.mesh.position.copy( this.position );
        //this.root.position.copy(this.position);

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

        this.head.update(x,y);



        var m;

        this.headSelf.position.setFromMatrixPosition( this.b.head.matrixWorld );
        this.headSelf.quaternion.setFromRotationMatrix( this.b.head.matrixWorld );

        //this.head.position.setFromMatrixPosition( this.b.head.matrixWorld );
        //this.head.quaternion.setFromRotationMatrix( this.b.head.matrixWorld );


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

var SVGman = [
"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='512px' height='256px' viewBox='0 0 512 256'>",
"<path id='skin' fill='#B1774F' stroke='none' d='M 512 256 L 512 0 0 0 0 256 512 256 Z'/>",
"<path id='noz' stroke='#A36D47' stroke-width='8' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 256 92 L 256 162'/>",
"<ellipse cx='222' cy='128' rx='14' ry='14' style='fill:white;stroke:#A36D47;stroke-width:4' />",
"<ellipse cx='290' cy='128' rx='14' ry='6' style='fill:white;stroke:#A36D47;stroke-width:4' />",
"<ellipse cx='222' cy='128' rx='4' ry='4' style='fill:black;' />",
"<ellipse cx='290' cy='128' rx='4' ry='4' style='fill:black' />",
"<ellipse cx='256' cy='190' rx='14' ry='6' style='fill:black;stroke:#A36D47;stroke-width:4' />",
"<path id='eyebrow' stroke='#613207' stroke-width='8' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 283 87 L 301 87 M 211 87 L 229 87'/>",
"<path id='hair' fill='#613207' stroke='none' d='M 512 122 L 512 0 0 0 0 122 Q 34.56171875 122.8705078125 71 135 113.206640625 139.20703125 132 120 143.885546875 76.9451171875 183 55 L 329 55 Q 370.0564453125 79.7216796875 380 120 394.8259765625 136.671484375 438 135 480.665234375 122.834765625 512 122 Z'/>",
"</svg>",
].join( "\n" );

var SVGwom = [
"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='512px' height='256px' viewBox='0 0 512 256'>",
"<path id='skin' fill='#895837' stroke='none' d='M 512 256 L 512 0 0 0 0 256 512 256 Z'/>",
"<path id='noz' stroke='#70472B' stroke-width='8' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 256 92 L 256 162'/>",
"<ellipse cx='222' cy='128' rx='14' ry='14' style='fill:white;stroke:#70472B;stroke-width:4' />",
"<ellipse cx='290' cy='128' rx='14' ry='14' style='fill:white;stroke:#70472B;stroke-width:4' />",
"<ellipse cx='222' cy='128' rx='4' ry='4' style='fill:black;' />",
"<ellipse cx='290' cy='128' rx='4' ry='4' style='fill:black;' />",
"<ellipse cx='256' cy='190' rx='14' ry='10' style='fill:black;stroke:#70472B;stroke-width:4' />",
"<path id='eyebrow' stroke='#3A160A' stroke-width='8' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 283 87 L 301 87 M 211 87 L 229 87'/>",
"<path id='hair' fill='#3A160A' stroke='none' d='M 512 166 L 512 0 0 0 0 170 Q 23.2884765625 183.2939453125 53 192 74.7611328125 200.3693359375 102 206 122.924609375 209.0083984375 120 197 116.5833984375 165.0119140625 120 134 122.9181640625 115.5015625 140 112 168.8966796875 108.988671875 188 97 216.7982421875 82.7875 228 50 244.8962890625 78.833203125 283 100 324.001953125 112.8609375 369 112 393.0203125 111.997265625 390 140 386.901953125 158.942578125 387 181 384.373046875 200.77421875 413 198 462.5 190.35 512 166 Z'/>",
"</svg>",
].join( "\n" );