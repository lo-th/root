var V = {};

V.Model = function ( type, meshs, txt, pos ) {

    this.isFirst = true;

    this.isSkin = false;
    //this.isHelper = false;
    this.debug = false;
    this.isLockHip = true;
    this.isSkeleton = false;

    this.preTime = 0;

    this.f = 0;

    this.txt = txt;
    this.type = type;

    this.mats = [];

    this.decalY = 0;

    this.decal = new THREE.Vector3();

    this.position = pos || new THREE.Vector3();

    var tSize = 1.4;

    var torad = 0.0174532925199432957;



    this.hipPos = new THREE.Vector3();

    this.mesh = type === 'man' ? meshs.man_skin.clone() : meshs.wom_skin.clone();
    this.mesh.name = type;

    this.mtx = new THREE.Matrix4();
    this.matrixWorldInv = new THREE.Matrix4().getInverse( this.mesh.matrixWorld );

    this.bones = this.mesh.skeleton.bones;

    var i, name, bone, lng = this.bones.length;

    this.poseMatrix = [];
    this.b = {};

    for( i=0; i<lng; i++){

        bone = this.bones[i];
        name = bone.name.substring(7);
        bone.name = name;

        //console.log( name )

        this.b[ name ] = bone;
        this.poseMatrix[i] = bone.matrixWorld.clone();

        if(name === 'hip') this.hipPos.setFromMatrixPosition( this.poseMatrix[i] );

    }

    this.mesh.userData.posY = this.hipPos.y;

    //console.log( this.hipPos )

    this.root = new THREE.Group();

    //this.fakeHead = new THREE.Group();

    this.head = type === 'man' ? meshs.man_head.clone() : meshs.wom_head.clone();
    this.head.position.set(0,0,0);
    this.head.rotation.set( 180*torad, 180*torad, 0 );

    /*this.headG= new THREE.Group();

    this.headG.add( this.head );
    this.root.add( this.headG );*/



    //this.fakeHead.rotation.set( 180*torad, 180*torad, 0 );

    

    //this.root.add( this.head );
     //this.b.head.add( this.fakeHead );


    this.b.head.add( this.head );

   // this.head.matrixWorldNeedsUpdate = true;
///this.head.matrixAutoUpdate = false;


    this.plus = type === 'man' ? meshs.man_plus.clone() : meshs.wom_plus.clone();
    if(type === 'man'){

        this.plus.position.set(0,0,0);
        this.plus.rotation.set( 0*torad, 0*torad, 0*torad );
        this.head.add( this.plus );

    } else {

        this.plus.skeleton = this.mesh.skeleton;

        this.neck = meshs.wom_neck.clone();
        this.neck.position.set(0,0,0);
        this.neck.rotation.set( 180*torad, 180*torad, 0 );
        this.b.neck.add( this.neck );

    }

    this.headMap = new V.Head( this.type, this.txt, meshs );
    
   

    this.setMaterial(1);
    this.mesh.position.copy( this.position ).add( this.decal );

    // hide model

    //this.root.visible = false;
    //this.mesh.visible = false;

    
    
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

    reset:function(){

        this.mesh.stopAll();

        var i, name, bone, lng = this.bones.length;


        for( i=0; i<lng; i++){

            bone = this.bones[i];
            bone.matrixWorld.copy( this.poseMatrix[i] );

        }



    },

    setTimescale: function ( v ) {

        this.mesh.setTimeScale( v );

    },

    removeFromScene: function( Scene ){

        Scene.remove( this.mesh );
        Scene.remove( this.root );

        if( this.type !== 'man') Scene.remove( this.plus );

        this.isFull = false;

    },

    addToScene: function ( Scene ){

        Scene.add( this.mesh );
        Scene.add( this.root );

        if( this.type !== 'man') Scene.add( this.plus );

        //if( !this.isSkin ) this.bodygeo.addDebug( Scene );

        this.isFull = true;

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

        var mtype;

        var i = this.mats.length;
        while(i--){
            this.mats[i].dispose();
        }

        if( n===1 ) mtype = 'MeshBasicMaterial';
        if( n===2 ) mtype = 'MeshToonMaterial';
        if( n===3 ) mtype = 'MeshStandardMaterial';

        this.mats[0] = new THREE[mtype]({ map:this.type === 'man' ? this.txt.corps_m : this.txt.corps_w });
        this.mats[1] = new THREE[mtype]({ map:this.type === 'man' ? this.txt.corps_m : this.txt.corps_w });// , skinning:true

        this.mats[2] = new THREE[mtype]({ map:this.headMap.renderTarget.texture });
        this.mats[3] = new THREE[mtype]({ color:0x1e0706 });// , skinning:true

        this.head.material = this.mats[2];
        this.mesh.material = this.mats[1];
        this.plus.material = this.mats[2];

        if( this.type !== 'man'){  
            this.neck.material = this.mats[2];
            this.plus.material = this.mats[3];

        }

    },

    getHipPos: function () {

        return this.b.hip.getWorldPosition();

    },

    setPosition: function ( pos ) {

        this.mesh.position.copy( this.position );

    },

    setDebug: function ( b ) {

        this.debug = b;

        this.addHelper( this.debug );

        var i = this.mats.length;
        while( i-- ) this.mats[i].wireframe = this.debug;
        
    },

    update: function (){



        //this.headMap.update( x, y );
        if( this.isSkeleton ) this.helper.update();
        if( this.isLockHip ){ 
            this.b.hip.position.x = 0;
            this.b.hip.position.z = 0;
        }

    }
}