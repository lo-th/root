var V = {};

V.Model = function ( type, meshs, txt, pos, meshs2 ) {

    this.isFirst = true;

    this.isSkin = false;
    this.debug = false;

    this.preTime = 0;

    this.f = 0;

    this.txt = txt;
    this.type = type;

    this.mats = [];

    this.position = pos;

    var tSize = 1.4;
    

    this.mesh = type === 'man' ? meshs.man_skin.clone() : meshs.wom_skin.clone();
    this.mesh.name = type;

    this.bones = this.mesh.skeleton.bones;

    var i, name, bone, lng = this.bones.length;

    this.poseMatrix = [];
    this.b = {};

    for( i=0; i<lng; i++){

        bone = this.bones[i];
        name = bone.name.substring(7);
        bone.name = name;

        //console.log(name)

        this.b[ name ] = bone;
        this.poseMatrix[i] = bone.matrixWorld.clone();

    }

    this.root = new THREE.Group();

    this.head = type === 'man' ? meshs.man_head.clone() : meshs.wom_head.clone();
    this.head.position.set(0,0,0);
    this.head.rotation.set( 180*torad, 180*torad, 0 );
    this.b.head.add( this.head );

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
    
    this.helper = new THREE.SkeletonHelper( this.b.hip );
    this.helper.skeleton = this.mesh.skeleton;
    this.helper.visible = this.debug;
    this.root.add( this.helper );

    this.setMaterial(1);
    this.mesh.position.copy( this.position );

    // hide model

    //this.root.visible = false;
    //this.mesh.visible = false;

    
    
}


V.Model.prototype = {

    setSpeed: function ( v ) {

        this.mesh.setTimeScale( v );

    },

    addToScene: function ( Scene ){

        Scene.add( this.mesh );
        Scene.add( this.root );

        if( this.type !== 'man') Scene.add( this.plus );

        //if( !this.isSkin ) this.bodygeo.addDebug( Scene );

        this.isFull = true;

    },

    play: function ( name, a, b, c ){

        this.mesh.play( name, a, b, c );

    },

    setMaterial: function( n ){

        //this.initCanvas();

        var i = this.mats.length;
        while(i--){
            this.mats[i].dispose();
        }

        if( n===1 ) mtype = 'MeshBasicMaterial';
        if( n===2 ) mtype = 'MeshToonMaterial';
        if( n===3 ) mtype = 'MeshStandardMaterial';

        this.mats[0] = new THREE[mtype]({ map:this.type === 'man' ? this.txt.corps_m : this.txt.corps_w });
        this.mats[1] = new THREE[mtype]({ map:this.type === 'man' ? this.txt.corps_m : this.txt.corps_w, skinning:true });

        this.mats[2] = new THREE[mtype]({ map:this.headMap.renderTarget.texture });
        this.mats[3] = new THREE[mtype]({ color:0x1e0706, skinning:true });

        this.head.material = this.mats[2];
        this.mesh.material = this.mats[1];
        this.plus.material = this.mats[2];

        if( this.type !== 'man'){  
            this.neck.material = this.mats[2];
            this.plus.material = this.mats[3];

        }

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

        this.headMap.update(x,y);
        this.helper.update();

    }
}