var avatar = ( function () {

'use strict';

var path = './assets'

var assets = [
    
    '/textures/medium.jpg',
    '/textures/corps_m.jpg', 
    '/textures/corps_w.jpg',
    '/textures/head_m.jpg', 
    '/textures/head_w.jpg',

    '/textures/color_m.jpg', 
    '/textures/color_w.jpg',

    '/models/h-character.sea',

];

var man, woman, scene, bvhLoader, center = null;
var model = null;
var isMan = false;
var isHelper = false;
var currentPlay = '';
var isloaded = false;
var tmpname = '';

var frameTime = 0;

var animations = [];
var morphs = ['close', 'happy', 'sad', 'open' ];

avatar = {

    init: function ( Path ) {

        if( Path !== undefined ) path = Path;

        scene = view.getScene();
        bvhLoader = new THREE.BVHLoader();

        var i = assets.length;
        while(i--) {
            assets[i] = path + assets[i];
        }

     
        pool.load( assets, avatar.onLoad );

    },

    onLoad: function ( p ) {

        // textures

        var txt = {};

        txt['env'] = new THREE.Texture( p.medium );
        txt['env'].mapping = THREE.SphericalReflectionMapping;
        txt['env'].needsUpdate = true;

        txt['corps_m'] = new THREE.Texture( p.corps_m );
        txt['corps_m'].flipY = false;
        txt['corps_m'].needsUpdate = true;

        txt['corps_w'] = new THREE.Texture( p.corps_w );
        txt['corps_w'].flipY = false;
        txt['corps_w'].needsUpdate = true;

        txt['head_m'] = new THREE.Texture( p.head_m );
        txt['head_m'].flipY = false;
        txt['head_m'].needsUpdate = true;

        txt['head_w'] = new THREE.Texture( p.head_w );
        txt['head_w'].flipY = false;
        txt['head_w'].needsUpdate = true;

        txt['color_m'] = new THREE.Texture( p.color_m );
        txt['color_m'].flipY = false;
        txt['color_m'].needsUpdate = true;

        txt['color_w'] = new THREE.Texture( p.color_w );
        txt['color_w'].flipY = false;
        txt['color_w'].needsUpdate = true;

        // sea meshs

        var meshs = pool.meshByName ( 'h-character' );

        // morph hack

        avatar.correctMorph('mouth_w', meshs );
        avatar.correctMorph('mouth_m', meshs );
        avatar.correctMorph('eye_m', meshs );
        avatar.correctMorph('eye_w', meshs );

        // init Model

        man = new V.Model( 'man', meshs, txt );
        woman = new V.Model( 'wom', meshs, txt );

        avatar.switchModel();

        avatar.loadAnimation( path + '/bvh/base.z');


        isloaded = true;

        //avatar.addHelper()

    },

    loadSingle: function ( data, name, type ) {

        var d = bvhLoader.parse( data );
        name = name.substring(0, name.lastIndexOf('.') );
        avatar.parseBvhAnimation( name, d );

    },

    loadAnimation: function ( file ) {

        pool.reset();
        tmpname = file.substring( file.lastIndexOf('/')+1, file.lastIndexOf('.') );
        pool.load( file, avatar.getCompressAnimation );

    },

    getCompressAnimation: function ( p ) {

        avatar.parseBvhAnimation( tmpname, bvhLoader.parse( SEA3D.File.LZMAUncompress( p[tmpname] ) ) );

    },

    parseBvhAnimation: function ( name, result ){

        if( animations.indexOf( name ) !== -1 ) return;

        //console.log( name, result.clip.frameTime, result.clip.frames );

        result.clip.name = name;
        var bvhClip = result.clip;
        var seq = null;
        var decale = 40;

        if( name === 'base' ) seq = [ ['idle', 5, 25], ['walk', 325, 355], ['run', 500, 530 ], ['crouch', 675, 705] ];

        man.reset();
        woman.reset();

        //man.stop();
        //woman.stop();

        bvhLoader.applyToModel( man.mesh, bvhClip, man.poseMatrix, seq, decale );
        bvhLoader.applyToModel( woman.mesh, bvhClip, woman.poseMatrix, seq, decale );

        if( seq !== null ){  
            avatar.play( seq[0][0] )
            for( var i=0; i<seq.length; i++ ){ 
                animations.push( seq[i][0] );
                gui.addAnim( seq[i][0] );
            }
        } else { 
            avatar.play( name );
            animations.push( name );
            gui.addAnim( name );
        }

    },

    lockHip: function ( b ) {

        model.lockHip( b );

    },

    addSkeleton: function ( b ) {

        model.addSkeleton( b );

    },

    getModel: function (){

        return model;

    },

    addHelper: function ( b ) {

        isHelper = true;

        center = new THREE.Mesh( new THREE.CircleGeometry(25), new THREE.MeshBasicMaterial({ color:0x00FF00, wireframe:true }) );
        center.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI*0.5 ) );
        view.getScene().add( center );

    },

    switchModel: function () {

        if( model !== null ) model.removeFromScene( scene );

        if( isMan ){

            isMan = false;
            model = woman;
            model.addToScene( scene );

        } else {

            isMan = true;
            model = man;
            model.addToScene( scene );

        }

        if( currentPlay ) avatar.play( currentPlay );

    },

    correctMorph: function (  name, meshs  ) {
        
        for( var i=0; i < morphs.length; i++ ) {

            meshs[name].geometry.morphAttributes.position[i].array = meshs[name+'_'+morphs[i]].geometry.attributes.position.array;
            meshs[name].geometry.morphAttributes.normal[i].array = meshs[name+'_'+morphs[i]].geometry.attributes.normal.array;

        }


    },

    setSpeed: function (v) {

        model.setSpeed(v);

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
        model.mesh.play( name, crossfade, offset, weight );

        gui.inPlay();

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

        gui.updateTime( model.getTime() );

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

            gui.setTotalFrame( frame, frameTime );
            
        }



    },

    // MORPH

    getMorph: function(){

        return morphs;

    },

    morphEye: function ( v ){

        model.headMap.morphEye( this.name.substring(4), v );

    },

    morphMouth: function ( v ){

        model.headMap.morphMouth( this.name, v );

    },

    sizeMouth: function ( v ) {

        model.headMap.setMouthSize( v );
        model.headMap.update();

    },

    sizeEye: function ( v ) {

        model.headMap.setEyeSize( v );
        model.headMap.update();

    },


}

return avatar;

})();