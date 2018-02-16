//var V = {};

var Model = function ( Character, meshs, txt ) {

    THREE.Group.call( this );

    this.visible = false;
    this.isFirstFrame = true;
    this.isFirstPlay = false;

    this.is3dNoz = false;

    this.character = Character;

    this.isLockHip = true;
    this.isSkeleton = false;

    this.rShadow = false;

    // sphere, tube, skin
    this.bodyType = 'sphere';


    this.txt = txt;
    this.mats = [];

    this.currentPlay = '';

    //this.decal = new THREE.Vector3();

    //this.position = new THREE.Vector3();

    this.baseMat = new THREE.MeshBasicMaterial();
    this.baseMatS = new THREE.MeshBasicMaterial({color:0x00ff00, skinning:true });

    this.tSize = 1.4;

    this.torad = 0.0174532925199432957;

    this.hipPos = new THREE.Vector3();
    

    // 1 - BONES

    

    if( this.character === 'Amina' ) this.mesh = meshs.skin_a.clone();
    else this.mesh = meshs.skin.clone();

    //this.add( this.mesh );

    this.mesh.material = this.baseMatS;

    this.bones = this.mesh.skeleton.bones;

    var i, name, bone, lng = this.bones.length;

    this.mtx = new THREE.Matrix4();
 //   this.matrixWorldInv = new THREE.Matrix4().getInverse( this.mesh.matrixWorld );
    this.matrixWorldInv = new THREE.Matrix4().getInverse( this.matrixWorld );
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
    //this.mesh.setTimeScale( 0.25 );
    //this.position.y = this.hipPos.y;

    // 2 - ROOT

    //this.root = new THREE.Group();

    // 3 - BODY

    this.dressMesh = null;
 
    switch( this.bodyType ){

        case 'sphere':
            this.bodygeo = new THREE.SphereBufferGeometry( 23.5, 24, 18 );
            this.bodygeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,0,1), 90*this.torad));
            this.bodygeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(1,0,0), -90*this.torad));
            this.bodygeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,1,0), -14*this.torad));
            this.bodygeo.applyMatrix( new THREE.Matrix4().makeTranslation(-2,0,0));
            if( this.character === 'Amina' ) this.bodygeo.applyMatrix( new THREE.Matrix4().makeScale(1,0.9,0.9));
            
            this.rondoMesh = new THREE.Mesh( this.bodygeo, this.baseMat );

            if( this.character === 'Amina' ){
            	var dress = new THREE.CylinderBufferGeometry(14,22, 24,24,1 )
            	dress.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,0,1), 90*this.torad));
            	dress.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(1,0,0), -90*this.torad));
            	dress.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,1,0), -14*this.torad));
            	//dress.applyMatrix( new THREE.Matrix4().makeTranslation(12,0,0));
            	this.dressMesh = new THREE.Mesh( dress, this.baseMat );
            	this.dressMesh.position.set( 10, 0,4);
            	 
            	this.rondoMesh.add(this.dressMesh);
            }

            this.attach( this.rondoMesh, this.b.chest );
            
        break;
        case 'tube': 
            this.tubeSize = 23;
            this.bodygeo = new THREE.Tubular( { start:[0,0,0], end:[0,40,0], numSegment:4 }, 30, this.tubeSize, 20 ,false, 'sphere' );
            this.rondoMesh = new THREE.Mesh( this.bodygeo, this.baseMat );
            this.cax = new THREE.Matrix4().makeTranslation(4,0,0);
            this.cbx = new THREE.Matrix4().makeTranslation(-8,0, 0);
            this.ccx = new THREE.Matrix4().makeTranslation(-10,0,0);
            this.cdx = new THREE.Matrix4().makeTranslation(-25,0,0);
        break;
        case 'skin': 
            this.rondoMesh = this.mesh;
        break;
    }

    this.rondoMesh.castShadow = true;
    this.rondoMesh.receiveShadow = this.rShadow;

    // 3 - HEAD

    var headGeo = new THREE.SphereBufferGeometry( 14.5, 20, 15 );
    var hearGeo = new THREE.SphereBufferGeometry( 1.6, 12, 9 );
    
    headGeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,0,1), 90*this.torad));
    headGeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(1,0,0), -90*this.torad));
    headGeo.applyMatrix( new THREE.Matrix4().makeTranslation(-14.5,0,0));

    this.headMesh = new THREE.Mesh(headGeo, this.baseMat );
    this.hearL = new THREE.Mesh(hearGeo, this.baseMat );
    this.hearR = new THREE.Mesh(hearGeo, this.baseMat );

    this.hearL.position.set(-14.5, 14.9, 0)
    this.hearR.position.set(-14.5, -14.9, 0)

    

    this.attach( this.headMesh, this.b.head );

    this.headMesh.castShadow = true;
    this.headMesh.receiveShadow = this.rShadow;

    if(this.is3dNoz){
    	this.headNoz = meshs.noz.clone();
    	this.headNoz.position.set(-14.5,0, 0)
    	this.headMesh.add( this.headNoz );
    }


    // 4 - EXTRA

    this.headExtra = null;
    this.headHair = null;

    if( this.character === 'Theo' ){ 

        this.headExtra = meshs.extra_man.clone();

        this.headMesh.add( this.headExtra );

    } else {

        //if(this.bodyType==='skin'){

            if(this.character === 'Cynthia') this.headHair = meshs.extra_hair_c.clone();
            if(this.character === 'Amina') this.headHair = meshs.extra_hair_a.clone();
            if(this.character === 'Eleanor') this.headHair = meshs.extra_hair_c.clone();
            this.headHair.skeleton = this.mesh.skeleton;
            this.add( this.headHair );

        /*}else{ 

            this.headExtra = meshs.extra_wom.clone();
            this.headMesh.add( this.headExtra );

        }*/
    }
    

    // 5 - FOOT

    var foot = meshs.foot;
    if( this.character === 'Amina' ){ foot = meshs.foot_w; this.tSize = 1; }

    

    this.footR = foot.clone();
    this.footL = foot.clone();

    this.attach( this.footR, this.b.rFoot );
    this.attach( this.footL, this.b.lFoot );

    this.footR.castShadow = true;
    this.footR.receiveShadow = this.rShadow;
    this.footL.castShadow = true;
    this.footL.receiveShadow = this.rShadow;

    // 6 - HAND

    var hand = new THREE.SphereBufferGeometry( 2.5, 12, 9 );
    hand.translate( -1.5,0,0 );

    this.handL = new THREE.Mesh( hand, this.baseMat );
    this.handR = new THREE.Mesh( hand, this.baseMat );

    this.attach( this.handL, this.b.lHand );
    this.attach( this.handR, this.b.rHand );

    this.handL.castShadow = true;
    this.handL.receiveShadow = this.rShadow;
    this.handR.castShadow = true;
    this.handR.receiveShadow = this.rShadow;

    
    

    // 7 - LEG

    this.legL = new THREE.Tubular( { start:[0,0,0], end:[0,-40,0], numSegment:3 }, 12, this.tSize );
    this.legmeshL = new THREE.Mesh( this.legL, this.baseMat );

    this.legR = new THREE.Tubular( { start:[0,0,0], end:[0,-40,0], numSegment:3 }, 12, this.tSize );
    this.legmeshR = new THREE.Mesh( this.legR, this.baseMat );

    this.ggg = new THREE.Matrix4().makeTranslation(0,0,-2);
    this.fff = new THREE.Matrix4()
    if( this.character === 'Amina' ) this.fff.makeTranslation(2,0,-3);

    // 8 - ARM

    this.arm = new THREE.Tubular( { start:[0,40,0], end:[0,0,0], numSegment:8 }, 20, this.tSize );
    this.armmesh = new THREE.Mesh( this.arm, this.baseMat );

    this.armmesh.castShadow = true;
    this.armmesh.receiveShadow = this.rShadow;

    var py = 2
    if( this.character === 'Amina' )py = 5;

    this.dda = new THREE.Matrix4().makeTranslation(-2,py,0);
    this.ddd = new THREE.Matrix4().makeTranslation(-2,-py,0);
    this.ddxr = new THREE.Matrix4().makeTranslation(-3,1,0);
    this.ddxl = new THREE.Matrix4().makeTranslation(-3,-1,0);

    this.legmeshL.castShadow = true;
    this.legmeshL.receiveShadow = this.rShadow;
    this.legmeshR.castShadow = true;
    this.legmeshR.receiveShadow = this.rShadow;



    // 9 - ADD
    
    this.headMesh.add( this.hearL );
    this.headMesh.add( this.hearR )

    this.addEyebow();
    this.addEyes();
    if( this.character !== 'Theo' ) this.addEarring();

    this.add( this.footR );
    this.add( this.footL );
    this.add( this.handR );
    this.add( this.handL );
    this.add( this.armmesh );
    this.add( this.legmeshL );
    this.add( this.legmeshR );
    this.add( this.headMesh );
   
    this.add( this.mesh );

    if( this.bodyType!=='skin' ){ 
        this.mesh.visible = false;
        this.add( this.rondoMesh );
    }
    
      
    this.setMaterial(3);

    //this.matrixWorld = this.mesh.matrixWorld;
    //this.matrixAutoUpdate = false;
    //this.matrixWorldNeedsUpdate = false;

    //this.position = this.mesh.position;

}


Model.prototype = Object.assign( Object.create( THREE.Group.prototype ), {

	constructor: Model,

    //constructor: THREE.Group,
    //isGroup: true,

    setSize: function ( s ) {

    	if(this.character === 'Amina') s-=0.002;


        this.mesh.scale.set(s,s,s);
        if(this.headHair)this.headHair.scale.set(s,s,s);
        this.arm.radius = this.tSize*s;
        this.legR.radius = this.tSize*s;
        this.legL.radius = this.tSize*s;

        if( this.bodyType === 'tube') this.bodygeo.radius = this.tubeSize*s;

    },

    setPosition: function ( x, y, z ) {

        this.mesh.position.set(x,y,z);

    },

    setRotation: function ( x, y, z ) {

        this.mesh.rotation.set(x,y,z);

    },

    /*getDecal: function () {

        return this.decal.y;

    },

    setDecal: function ( v ) {

        this.decal.y = v;
        this.mesh.position.copy( this.position ).add( this.decal );

    },*/

    attach: function ( m, b ) {

        m.matrix = b.matrixWorld;
        m.matrixAutoUpdate = false;

    },

    addEarring: function () {

        var earringGeo;

        if(this.character === 'Cynthia') earringGeo = new THREE.SphereBufferGeometry( 0.8, 12, 9 );
        else earringGeo = new THREE.TorusBufferGeometry( 2, 0.2, 6, 20 );

        earringGeo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(1,0,0), -90*this.torad));


        this.earringL = new THREE.Mesh( earringGeo, this.baseMat );
        this.earringR = new THREE.Mesh( earringGeo, this.baseMat );

        this.earringL.position.set(-14.5+2, 14.9, -1)
        this.earringR.position.set(-14.5+2, -14.9,-1)

        this.headMesh.add( this.earringL );
        this.headMesh.add( this.earringR );

    },

    addEyebow: function () {

        var w = 2.5;
        var h = 0.6;
        var r = 0.75;

        var g = new THREE.CapsuleBufferGeometry( r, w );
        g.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,1,0), -90*this.torad));

        this.bowL = new THREE.Mesh( g, this.baseMat );
        this.bowR = new THREE.Mesh( g, this.baseMat );

        this.bowL.rotation.x = 26*this.torad;
        this.bowR.rotation.x = -26*this.torad;

        this.bowL.rotation.y = 12*this.torad;
        this.bowR.rotation.y = 12*this.torad;

        this.bowL.position.set( -19, 5.7,-12.3 );
        this.bowR.position.set( -19,-5.7,-12.3 );

        this.headMesh.add( this.bowL );
        this.headMesh.add( this.bowR );

    },

    addEyes : function () {

        var eye = new THREE.SphereBufferGeometry( 0.75, 8, 6 );
        var er = new THREE.Mesh( eye, this.baseMat );
        var el = new THREE.Mesh( eye, this.baseMat );

        er.position.set( -14.5,5.7,-13.4 );
        el.position.set( -14.5,-5.7,-13.4 );

        if( this.character !== 'Theo' ){

            var c = new THREE.CylinderBufferGeometry(0.14, 0.14, 1), mr, ml;
            c.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0,0,1), 90*this.torad));
            c.applyMatrix( new THREE.Matrix4().makeTranslation( -1.2, 0, 0 ));
            
            for(var i=0; i<3; i++){

                mr = new THREE.Mesh( c, this.baseMat );
                ml = new THREE.Mesh( c, this.baseMat );

                mr.rotation.z = -(i * 30) * this.torad;
                ml.rotation.z = (i * 30) * this.torad;

                er.add( mr );
                el.add( ml );

            }
        }

        this.headMesh.add( er );
        this.headMesh.add( el );

        this.eyeR = er;
        this.eyeL = el;

    },

    addSkeleton: function ( b ) {

        if( b ){
            this.isSkeleton = true;
            this.helper = new THREE.SkeletonHelper( this.b.hip );
            this.helper.skeleton = this.mesh.skeleton;
            this.add( this.helper );
        } else {
            if(this.isSkeleton){
                this.remove( this.helper );
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

    dispose: function (){



    },

    /*addToScene: function ( Scene ){

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

    },*/

    stop: function (){

        this.mesh.stopAll();

    },

    play: function ( name, crossfade, offset, weight ){

        if( name !== this.currentPlay ){

            this.currentPlay = name;
            this.mesh.play( this.currentPlay, crossfade, offset, weight );
            this.isFirstPlay = true;
            
        }
    },

    getTime: function () {

        return this.mesh.currentAnimationAction ? this.mesh.currentAnimationAction.time : false;

    },

    setWirframe: function ( b ) {

        i = this.mats.length;
        while(i--) this.mats[i].wireframe = b;

    },


    setMaterial: function( n, m, r, e ){

    	var i;

    	if(!n){ 

    		i = this.mats.length;
            while(i--){
                if( m !== undefined ) this.mats[i].metalness = m;
                if( r !== undefined ) this.mats[i].roughness = r;
                if( e !== undefined ) this.mats[i].emissiveIntensity = e;
            }
                
    		return;
    	}

    	var mtype = 'MeshBasicMaterial'

        this.colors = {
        //             [ 0 m_skin , 1 m_hair, 2 skin  , 3 hair  , 4 extra, 5 foot   , 6 arm   , 7 leg   , 8 earring, 9 noz ]
            'Theo' :   [ 'corps_t', 'head_t', 0xb1774f, 0x613207, 0x111111, 0x050505, 0x000044, 0x000044, 0xeeee00, 0xa36d47 ],
            'Amina' :  [ 'corps_a', 'head_a', 0x9d6743, 0x0a0704, 0x0a0704, 0x050505, 0x9d6743, 0x9d6743, 0xeeee00, 0x895a39 ],
            'Cynthia' :[ 'corps_c', 'head_c', 0x895837, 0x3a160a, 0x3a160a, 0x0f0f0f, 0x1c1c1c, 0x1c1c1c, 0xeeeeee, 0x70472b ],
            'Eleanor' :[ 'corps_e', 'head_e', 0x895837, 0x824683, 0x3a160a, 0x0f0f0f, 0xb8cdae, 0x1c1c1c, 0xeeee00, 0xa36d47 ],

        }

        var cc = this.colors[ this.character ];

        if( this.bodyType === 'skin' ) this.txt[cc[0]].flipY = false;

        i = this.mats.length;
        while(i--){
            this.mats[i].dispose();
        }

        if( n===1 ) mtype = 'MeshLambertMaterial';
        if( n===2 ) mtype = 'MeshToonMaterial';
        if( n===3 ) mtype = 'MeshStandardMaterial';

        this.mats[0] = new THREE[mtype]({ color: cc[4] });// extra
        this.mats[1] = new THREE[mtype]({ color: cc[5] });// foot
        this.mats[2] = new THREE[mtype]({ color: cc[6] });// arm
        this.mats[3] = new THREE[mtype]({ color: cc[2] });// skin
        this.mats[4] = new THREE[mtype]({ color:0xffffff, map: this.txt[cc[1]] });// head
        this.mats[5] = new THREE[mtype]({ color:0xffffff, map: this.txt[cc[0]] });// body
        this.mats[6] = new THREE[mtype]({ color: cc[7] });// arm
        this.mats[7] = new THREE[mtype]({ color: 0x020202 });// eye
        this.mats[8] = new THREE[mtype]({ color: cc[3] });// bow
        this.mats[9] = new THREE[mtype]({ color: cc[8] });// earring
        this.mats[10] = new THREE[mtype]({ color: cc[3] });// hair
        this.mats[11] = new THREE[mtype]({ color: cc[9] });// hair

        if( n===1 || n===3 ){

            i = this.mats.length;
            while(i--){

                if( i === 4 )this.mats[i].emissiveMap = this.txt[cc[1]];
                else if( i === 5 )this.mats[i].emissiveMap = this.txt[cc[0]];
            
                this.mats[i].emissive = this.mats[i].color;
                this.mats[i].emissiveIntensity = 0.5;

                if(n===3){
                    this.mats[i].metalness = m !== undefined ? m : 0.25;
                    this.mats[i].roughness = r !== undefined ? r : 0.5;
                    this.mats[i].envMap = this.txt.env //view.envmap; //
                }

            }
            
        }

        i = this.mats.length;
        while(i--) this.mats[i].shadowSide = false;


        if( this.character !== 'Theo' ) this.mats[10].skinning = true;
        if( this.bodyType === 'skin' ){ 
            
           
            this.mats[5].skinning = true;
            
        }

        this.headMesh.material = this.mats[4];
        this.hearL.material = this.mats[3];
        this.hearR.material = this.mats[3];

        this.footR.material = this.mats[1];
        this.footL.material = this.mats[1];
        this.handL.material = this.mats[3];
        this.handR.material = this.mats[3];

        if( this.headExtra ) this.headExtra.material = this.mats[0];
        if( this.headHair ) this.headHair.material = this.mats[10];

        this.armmesh.material = this.mats[2];
        this.legmeshL.material = this.mats[6];
        this.legmeshR.material = this.mats[6];

        this.rondoMesh.material = this.mats[5];

        this.bowL.material = this.mats[8];
        this.bowR.material = this.mats[8];

        this.eyeR.material = this.mats[7];
        this.eyeL.material = this.mats[7];

        if( this.is3dNoz ) this.headNoz.material = this.mats[11];

        if( this.dressMesh ) this.dressMesh.material = this.mats[7];

        i =  this.eyeR.children.length;

        while (i--){
            this.eyeR.children[i].material = this.mats[7];
            this.eyeL.children[i].material = this.mats[7];
        }

        if( this.character !== 'Theo' ){

             this.earringL.material = this.mats[9];
             this.earringR.material = this.mats[9];

        }

    },



    getHipPos: function () {

        return this.b.hip.getWorldPosition();

    },


    //----------------------------------------------------------


    updateMatrix: function () {

    	this.mesh.position.copy(this.position);
    	this.mesh.quaternion.copy(this.quaternion);

		//this.matrix.compose( this.position, this.quaternion, this.scale );
		//this.matrixWorldNeedsUpdate = true;

	},

    updateMatrixWorld: function ( force ){

        /*if( this.isLockHip ){ 
            this.b.hip.position.x = 0;
            this.b.hip.position.z = 0;
        }*/

        //

        if( this.dressMesh ){ 
        	this.dressMesh.rotation.y = -this.b.abdomen.rotation.y;//this.b.hip.rotation.y
        	//this.dressMesh.quaternion.copy(this.b.hip.quaternion)
        }

        if( this.bodyType === 'tube' ){

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

        this.legL.positions[0].setFromMatrixPosition( this.b.lThigh.matrixWorld );
        this.legL.positions[1].setFromMatrixPosition( this.b.lShin.matrixWorld.clone().multiply( this.ggg ) );
        this.legL.positions[2].setFromMatrixPosition( this.b.lFoot.matrixWorld.clone().multiply( this.fff ) );

        this.legL.updatePath();

        this.legR.positions[0].setFromMatrixPosition( this.b.rThigh.matrixWorld );
        this.legR.positions[1].setFromMatrixPosition( this.b.rShin.matrixWorld.clone().multiply( this.ggg ) );
        this.legR.positions[2].setFromMatrixPosition( this.b.rFoot.matrixWorld.clone().multiply( this.fff ) );

        this.legR.updatePath();

        this.arm.positions[0].setFromMatrixPosition( this.b.lHand.matrixWorld );
        this.arm.positions[1].setFromMatrixPosition( this.b.lForeArm.matrixWorld.clone().multiply(this.ddxl) );
        this.arm.positions[2].setFromMatrixPosition( this.b.lShldr.matrixWorld.clone().multiply(this.dda) );
        this.arm.positions[3].setFromMatrixPosition( this.b.lCollar.matrixWorld );
        this.arm.positions[4].setFromMatrixPosition( this.b.rCollar.matrixWorld );
        this.arm.positions[5].setFromMatrixPosition( this.b.rShldr.matrixWorld.clone().multiply(this.ddd) );
        this.arm.positions[6].setFromMatrixPosition( this.b.rForeArm.matrixWorld.clone().multiply(this.ddxr) );
        this.arm.positions[7].setFromMatrixPosition( this.b.rHand.matrixWorld );

        this.arm.updatePath();

        THREE.Group.prototype.updateMatrixWorld.call( this, force );

        if( !this.isFirstFrame && !this.visible ) this.visible = true; 
        if( this.isFirstPlay && !this.visible ) this.isFirstFrame = false;
        

    }
});