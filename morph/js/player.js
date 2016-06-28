var player = ( function () {

    'use strict';

    var heros = [];

    var model, material;

    var options = {
        age:1,
        height:0,
        mh:1,
    }

    var scalarTarget = [];
    var baseResult = {};

    var skeletonMorphs = {
        'dex' : [
            [ 1.0, 1.3, 1.0 ],// spine base
            [ 1.5, 1.3, 1.0 ],// spine mid
            [ 2.0, 1.3, 1.0 ],// spine up

            [ 2.0, 1.3, 1.0 ],// clavicle
            [ 1.1, 1.0, 1.0 ],// arm
            [ 1.1, 1.1, 1.1 ],// hand

            [ 1.1, 0.9, 1.1 ],// leg
            [ 1.0, 1.0, 0.9 ],// foot
        ],
        'ugg' : [
            [ 1.2, 1.2, 1.2 ],// spine base
            [ 1.7, 1.3, 1.3 ],// spine mid
            [ 1.7, 1.3, 1.3 ],// spine up

            [ 2.5, 1.0, 1.0 ],// clavicle
            [ 1.4, 1.0, 1.0 ],// arm
            [ 1.3, 1.3, 1.3 ],// hand

            [ 1.1, 1.1, 1.1 ],// leg
            [ 1.3, 1.3, 1.3 ],// foot

            [ 1.2, 1.2, 1.2 ],// pelvis
            [ 1.0, 0.8, 1.0 ],// neck
        ],
        'herc' : [
            [ 1.0, 1.2, 1.0 ], // s0
            [ 1.7, 1.2, 1.0 ], // s1
            [ 1.7, 1.3, 1.0 ], // s2

            [ 2.5, 1.0, 1.0 ], // clavicle
            [ 1.1, 1.0, 1.0 ], // arm
            [ 1.1, 1.1, 1.1 ], // hand

            [ 1.1, 0.9, 1.1 ], // leg
            [ 1.0, 1.0, 0.9 ], // foot
        ],
        'marv' : [
            [ 1.0, 1.2, 1.0 ], // s0
            [ 1.3, 1.2, 1.0 ], // s1
            [ 1.2, 1.2, 1.0 ], // s2

            [ 2.0, 1.0, 1.0 ], // clavicle
            [ 1.1, 1.0, 1.0 ], // arm
            [ 1.1, 1.1, 1.1 ], // hand

            [ 1.1, 0.9, 1.1 ], // leg
            [ 1.0, 1.0, 0.9 ], // foot
        ],
        'fred' : [
            [ 1.0, 1.2, 1.0 ], // s0
            [ 1.0, 1.2, 1.0 ], // s1
            [ 0.8, 1.2, 1.0 ], // s2

            [ 0.8, 1.0, 1.0 ], // clavicle
            [ 1.0, 1.0, 1.0 ], // arm
            [ 1.0, 1.0, 1.0 ], // hand

            [ 1.0, 1.0, 1.0 ], // leg
            [ 1.0, 1.0, 1.2 ], // foot
        ],
        'jill' : [
            [ 1.0, 0.9, 1.0 ], // s0
            [ 0.9, 0.9, 1.0 ], // s1
            [ 0.8, 0.9, 1.0 ], // s2

            [ 0.8, 1.0, 1.0 ], // clavicle
            [ 0.9, 1.0, 1.0 ], // arm
            [ 0.8, 0.8, 0.8 ], // hand

            [ 1.0, 0.9, 1.0 ], // leg
            [ 1.0, 1.0, 0.8 ], // foot
        ],
        'tina' : [
            [ 1.0, 1.0, 1.0 ], // s0
            [ 0.9, 0.9, 1.0 ], // s1
            [ 0.8, 0.9, 1.0 ], // s2

            [ 0.8, 1.0, 1.0 ], // clavicle
            [ 0.9, 1.0, 1.0 ], // arm
            [ 0.8, 0.8, 0.8 ], // hand

            [ 1.0, 0.9, 1.0 ], // leg
            [ 1.0, 1.0, 1.0 ], // foot
        ],
        'stella' : [
            [ 1.0, 0.9, 1.0 ], // s0
            [ 1.1, 0.9, 1.0 ], // s1
            [ 1.1, 0.9, 1.0 ], // s2

            [ 1.5, 1.0, 1.0 ], // clavicle
            [ 0.8, 1.0, 1.0 ], // arm
            [ 0.8, 0.8, 0.8 ], // hand

            [ 1.0, 0.9, 1.0 ], // leg
            [ 1.0, 1.0, 1.0 ] ,// foot
        ],
       
    };

    player = {

        getHeros : function( id ){
            return heros[ id ];
        },

        add: function ( o ) {

            var hero = new player.hero( o );
            heros.push( hero );

            return hero;

        },



        init: function( Model, map ){

            var tx = new THREE.Texture( map );
            tx.anisotropy = 4;
            tx.flipY = false;
            tx.needsUpdate = true;

            material = new THREE.MeshStandardMaterial({ map:tx, color:0xFFFFFF, skinning:true,  morphTargets:true, metalness:0.5, roughness:0.8, envMap : view.getEnv() });
            model = Model;

            var bones = model.skeleton.bones;

            var i = 11;
            while(i--) scalarTarget[i] = [];
            
            var i = bones.length, name;
            while(i--){

                name = bones[i].name.substring(2, 8);
                bones[i].scalling = new THREE.Vector3(1,1,1);

                switch( name ){

                    case 'spineb' : scalarTarget[0].push(i); break;
                    case 'spinem' : scalarTarget[1].push(i); break;
                    case 'spinec' : scalarTarget[2].push(i); break;

                    case 'clavic' : scalarTarget[3].push(i); break;
                    case 'elbow' : case 'uparm' : scalarTarget[4].push(i); break;
                    case 'hand' : case 'finger' : scalarTarget[5].push(i); break;

                    case 'thigh' : case 'knee' : scalarTarget[6].push(i); break;
                    case 'foot' : case 'toe' : scalarTarget[7].push(i); break;

                    case 'pelvis' : scalarTarget[8].push(i); break;
                    case 'neck' : scalarTarget[9].push(i); break;
                    case 'head' : scalarTarget[10].push(i); break;

                }

            }

        },

        setPosition: function( x, y, z ){

            //hero.position.set( x, y, z );

        },

        applyMorph: function ( hero ) {

            for(var t in hero.morphs){
                if( hero.morphs[t] ){ 
                    hero.skin.setWeight( t, hero.morphs[t] );
                }
            }

            this.skeletonScalling( hero );

        },

        skeletonScalling: function ( hero ) {

            var i, j, v, t, p, lng = scalarTarget.length, result = [], bone = hero.bones;

            i = lng;
            while(i--) result.push( [ 1.0, 1.0, 1.0 ] );
            
            for( t in hero.morphs ){

                i = lng;
                while(i--){

                    v = skeletonMorphs[t][i] || [ 1.0, 1.0, 1.0 ];
                    p = hero.morphs[t];

                    result[i][0] += (v[0] - 1) * p;
                    result[i][1] += (v[1] - 1) * p;
                    result[i][2] += (v[2] - 1) * p;

                    //if(i===6) leg += (v[1] - 1) * p;

                }
            }

            i = lng-1; // not head
            while(i--){

                result[i][0] *= hero.age;
                result[i][1] *= hero.age;
                result[i][2] *= hero.age;

            }

            hero.skin.position.y = hero.height * (result[6][1] + (1-hero.age)*0.11);

            i = lng;
            while(i--){
                j = scalarTarget[i].length;
                while(j--){
                    bone[ scalarTarget[i][j] ].scalling.fromArray( result[i] );
                }
            }


        },

        update: function () {

        }

    };


    //-----------------------
    // NEW HERO
    //----------------------- 

    player.hero = function( o ){

        o = o || {};
        o.pos = o.pos === undefined ? [ 0, 0, 0 ] : o.pos;
        o.size = o.size === undefined ? 0.01 : o.size;
        
        this.skin = model.clone();
        this.skin.position.copy( model.position ).multiplyScalar( o.size );
        this.skin.scale.multiplyScalar( o.size );
            
        this.skin.material = material;
        this.skin.castShadow = true;
        this.skin.receiveShadow = true;

        this.skin.rotation.y = Math.PI;

        this.bones = this.skin.skeleton.bones;
        var i = this.bones.length;
        while(i--) this.bones[i].scalling = new THREE.Vector3( 1, 1, 1 );

        this.mesh = new THREE.Group();
        this.mesh.add( this.skin );
        view.add( this.mesh );

        this.mesh.position.fromArray( o.pos );

        this.age = 1;
        this.height = this.skin.position.y;

        this.morphs = { 'dex': 0, 'ugg' : 0, 'herc': 0, 'marv': 0, 'fred': 0, 'jill': 0, 'tina': 0, 'stella': 0 };

        if(o.t) this.morphs.tina = 1;
        else this.morphs.marv = 1;
           

        if(o.t) this.skin.play('walk');
        else this.skin.play('run');

        this.applyMorph();

    };

    player.hero.prototype = {

        applyMorph: function(){
            player.applyMorph( this );
        },
        rotate: function( r ){
            this.skin.rotation.y = r;
        }


    };








    return player;

})();







//-----------------------
// SEA3D hack
//----------------------- 

THREE.SEA3D.SkinnedMesh.prototype.setWeight = function( name, val ) {

    this.morphTargetInfluences[ this.morphTargetDictionary[ name ] ] = val;

};

THREE.SEA3D.SkinnedMesh.prototype.clone = function(){

    var c = new THREE.SEA3D.SkinnedMesh( this.geometry, this.material, this.useVertexTexture )

    //if ( this.animator ) c.animator = this.animator.clone( this );

    return c;

};

//-----------------------
// force local scalling
//-----------------------

THREE.Skeleton.prototype.update = ( function () {

    var offsetMatrix = new THREE.Matrix4();
    var scaleMatrix = new THREE.Matrix4();
    var pos = new THREE.Vector3();

    return function update() {

        // flatten bone matrices to array

        for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

            // compute the offset between the current and the original transform

            var matrix = this.bones[ b ] ? this.bones[ b ].matrixWorld: this.identityMatrix;

            // extra scalling vector

            if( this.bones[ b ].scalling && !this.isClone ){ 

                matrix.scale( this.bones[ b ].scalling );

                // update position of children

                for ( var i = 0, l = this.bones[ b ].children.length; i < l; i ++ ) {

                    scaleMatrix = matrix.clone();
                    scaleMatrix.multiply(this.bones[ b ].children[ i ].matrix.clone() );
                    pos.setFromMatrixPosition( scaleMatrix );
                    this.bones[ b ].children[ i ].matrixWorld.setPosition(pos);

                }

            }
            
            offsetMatrix.multiplyMatrices( matrix, this.boneInverses[ b ] );
            // only for three dev
            offsetMatrix.toArray( this.boneMatrices, b * 16 );

        }

        if ( this.useVertexTexture ) {

            this.boneTexture.needsUpdate = true;

        }

    };

} )();