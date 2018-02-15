var avatar = ( function () {

'use strict';

var path = './assets'

var names = [ 'Theo', 'Cynthia', 'Amina', 'Eleanor' ];

//var character = {};

var modelName = 'rondo2';
var textureName = ['corps_t', 'corps_c', 'corps_a', 'corps_e', 'head_t', 'head_c', 'head_a', 'head_e'];
var envName = 'smooth';

var assets = [

    '/models/'+modelName+'.sea',
    '/textures/'+envName+'.png',

];

var timescale = 0.25;

var man, woman, scene, bvhLoader, center = null;
var model = null;
var isHelper = false;
var currentPlay = '';
var isloaded = false;
var tmpname = '';

var frameTime = 0;

var animations = [];

avatar = {

    character:{},

    onComplete:function(){},

    init: function ( Path ) {

        if( Path !== undefined ) path = Path;

        var i;

        scene = view.getScene();
        bvhLoader = new THREE.BVHLoader();

        i = textureName.length;
        while(i--) {
            assets.push('/textures/rondo/'+textureName[i]+'.jpg');
        }

        assets.push('/bvh/base.z');

        i = assets.length;
        while(i--) {
            assets[i] = path + assets[i];
        }


     
        pool.load( assets, avatar.onLoad );

    },

    onLoad: function ( p ) {

        //console.log(p)

        

        // textures

        var txt = {}, i, name;

        txt['env'] = new THREE.Texture( p[envName] );
        txt['env'].mapping = THREE.SphericalReflectionMapping;
        txt['env'].needsUpdate = true;

        i = textureName.length;
        while(i--) {
            name = textureName[i]
            txt[name] = new THREE.Texture( p[name] );
            txt[name].needsUpdate = true;
        }

        // sea meshs

        var meshs = pool.meshByName ( modelName );

        // init Model

        i = names.length;
        while(i--){
            avatar.character[names[i]] = new Model( names[i], meshs, txt );
        }


        
        //avatar.switchModel( 'Theo' );

        avatar.addAnimation( 'base', p.base );

        //avatar.loadAnimation( path + '/bvh/base.z');

        isloaded = true;

    },

    setMaterial: function ( n, m, r, e ) {
        i = names.length;
        while(i--){
            avatar.character[names[i]].setMaterial( n, m, r, e );
        }
    },

    /*loadSingle: function ( data, name, type ) {

        var d = bvhLoader.parse( data );
        name = name.substring(0, name.lastIndexOf('.') );
        avatar.parseBvhAnimation( name, d );

    },*/

    loadAnimation: function ( file ) {

        //pool.reset();
        tmpname = file.substring( file.lastIndexOf('/')+1, file.lastIndexOf('.') );
        pool.load( file, avatar.getCompressAnimation );

    },

    /*getCompressAnimation: function ( p ) {

        avatar.parseBvhAnimation( tmpname, bvhLoader.parse( SEA3D.File.LZMAUncompress( p[tmpname] ) ) );

    },*/

    addAnimation: function ( name, buffer ) {

        avatar.parseBvhAnimation( name, bvhLoader.parse( buffer ) );

    },

    parseBvhAnimation: function ( name, result ){

        if( animations.indexOf( name ) !== -1 ) return;

        //console.log( name, result.clip.frameTime, result.clip.frames );

        var leg = result.leg || 0;
        //var manRatio = man.hipPos.y / Math.abs(leg);
        //var womRatio = woman.hipPos.y / Math.abs(leg);

        result.clip.name = name;
        var bvhClip = result.clip;
        var seq = null;
        var decale = avatar.character.Theo.hipPos.y;

        if( name === 'base' ) seq = [ ['idle', 5, 25], ['walk', 325, 355], ['run', 500, 530 ], ['crouch', 675, 705] ];

        var i = names.length, m;

        while(i--){
            m = avatar.character[names[i]];
            m.reset();
            bvhLoader.applyToModel( m.mesh, bvhClip, m.poseMatrix, seq, leg );
        }

        if( seq !== null ){  
            //avatar.play( seq[0][0] )
            for( var i=0; i<seq.length; i++ ){ 
                animations.push( seq[i][0] );
            }
        } /*else { 
            avatar.play( name );
            animations.push( name );
            gui.addAnim( name );
        }*/

        if( name === 'base' ) avatar.onComplete();

    },

    lockHip: function ( b ) {

        model.lockHip( b );

    },

    debug: function ( b ) {

        if( !model ) return;

        model.addSkeleton( b );
        model.setWirframe( b );

    },

    /*addSkeleton: function ( b ) {

        model.addSkeleton( b );

    },*/

    getModel: function (){

        return model;

    },

    addHelper: function ( b ) {

        isHelper = true;

        center = new THREE.Mesh( new THREE.CircleGeometry(25), new THREE.MeshBasicMaterial({ color:0x00FF00, wireframe:true }) );
        center.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI*0.5 ) );
        view.getScene().add( center );

    },

    /*getGender: function () {

        return isMan;

    },*/

    switchModel: function ( name, anim ) {

        if( model !== null ) view.scene.remove( model );

        if(anim!==undefined) currentPlay = anim;

        model = avatar.character[name];

        model.setSize(0.08);
        model.position.y = 0;
        model.position.x = 0;
        //model.rotation.y = Math.PI90
        //model.setPosition(0, 0, 0);
        //model.setRotation( Math.PI90, 0, 0)

        view.scene.add( model )

     

        avatar.setTimescale( timescale );

        if( currentPlay ) avatar.play( currentPlay );

    },


    getTimescale: function () {

        return timescale;

    },

    setTimescale: function ( v ) {

        if( v !== undefined ) timescale = v;
        model.setTimescale( timescale );

    },

    getAnimations: function () {

        return animations;

    },

    pause: function () {
        
        model.mesh.pauseAll();

    },

    unPause: function () {

        model.mesh.unPauseAll();

    },

    playOne: function ( f ) {

        var offset = f * frameTime;

        model.mesh.play( currentPlay, 0, offset, 1 );
        model.mesh.pauseAll();


    },

    play: function ( name, crossfade, offset, weight ) {

        model.stop();
        model.mesh.unPauseAll();
        model.play( name, crossfade, offset, weight );


        //var anim = model.mesh.animations
        //console.log(anim)
        currentPlay = name;

        avatar.getAnimationInfo( name );

    },

    update: function ( delta ) {

        if( !isloaded ) return;

        //THREE.SEA3D.AnimationHandler.update( 0.007 );
        THREE.SEA3D.AnimationHandler.update( delta );

        model.update();

        if( isHelper ){ 
            center.position.copy( model.getHipPos() );
            center.position.y = 0;
        }


    },

    getAnimationInfo: function ( name ) {

        var i = model.mesh.animations.length, n, anim;
        while(i--){

            n = model.mesh.animations[i];
            if( n.name === name ) anim = n;

        }

        if( anim ){ 

            frameTime = anim.clip.frameTime;
            
            var duration = anim.clip.duration;
            var frame = Math.round( duration / frameTime );
             //console.log( duration, frame );

            
        }



    },


}

return avatar;

})();