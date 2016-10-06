'use strict';

var view = ( function () {

    var canvas, renderer, scene, scene2, camera, target, controls, loader, clock, debugPlane;
    var mousePlane, raycaster, mouse3D, contentMouse, mini = null;
    var time = 0.5, timeElapsed = 0;
    var speed = 3;

    var nextMessage = null;
    var nextImage = null;
    var isNewMessage = false;
    var isNewImage = false;
    var isImpact = false;
    var impactTime = 0;
    var impactStart = 0;
    var impactMax = 0;

    var tmpCall;

    view = function () {};

    //---------------------------------------------
    // initialise la vue three js 
    //---------------------------------------------

    view.init = function ( ) {

        loader = new THREE.TextureLoader();

        clock = new THREE.Clock();

        canvas = document.getElementById('canvas3d');

        renderer = new THREE.WebGLRenderer({ canvas:canvas, precision:"mediump", antialias:true, alpha:false });
        renderer.setClearColor(0x1a1a1a, 1);
        //renderer.setClearColor(0x1a1a1a, 0);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.sortObjects = false;

        scene = new THREE.Scene();
        //scene2 = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 70 , 1 , 0.1, 10000 );
        camera.position.set( 0, 0, 160 );
        controls = new THREE.OrbitControls( camera, canvas );
        controls.target.set( 0, 0, 0 );
        controls.enableKeys = false;
        controls.update();

        target = camera.target;

        // bug in chrome
        //
        this.addMousePlane();

        // event

        window.addEventListener( 'resize', view.resize, false );
        this.resize();

    };

    view.getMap = function ( name, callback ) {


        tmpCall = callback;
        //var map= loader..load( 'textures/bg.png', this.textureComplete.bind(this) );
        loader.load( name, view.textureComplete );

        //var map = 
        //map.magFilter = THREE.NearestFilter;
        //map.minFilter = THREE.NearestMipMapNearestFilter;
        //map.minFilter = THREE.LinearMipMapLinearFilter;

        //return map;

    };

    view.textureComplete = function( tex ){

        var name = tex.image.currentSrc.substring(tex.image.currentSrc.lastIndexOf('/')+1, tex.image.currentSrc.lastIndexOf('.'));
        tex.name = name;

        tex.magFilter = THREE.NearestFilter;
       // tex.minFilter = THREE.NearestMipMapNearestFilter;
        tex.minFilter = THREE.LinearMipMapLinearFilter;

        tmpCall(tex);

    };

    view.getScene = function () {

        return scene;

    };

    view.resize = function () {

        var h = window.innerHeight;
        var w = window.innerWidth;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize( w, h );

    };

    view.setSpeed = function (v) {

        speed = v;

    };

    view.render = function () {

        timeElapsed = clock.getElapsedTime();

        this.particleUpdate();

        renderer.render( scene, camera );
        //renderer.render( scene2, camera );

    };

    //---------------------------------------------
    // particle update
    //---------------------------------------------

    view.particleUpdate = function(){

        particle.setUniforms( 'elapsedTime', timeElapsed );

        if(isImpact){

            impactTime = (timeElapsed-impactStart);
            particle.setUniforms('impact', impactTime);

            if( impactTime > impactMax ) view.impactEnd();

            return;
        }

        if(!isNewMessage && !isNewImage) return;

        if(isNewMessage){
            var t = speed * 0.001;

            if(time > 1){
                time = 0;
                particle.changeWord( nextMessage );
            }

            if(time > (0.5-t) && time < (0.5+t)){
                
                time = 0.5;
                isNewMessage = false;
                
            }
        }

        if(isNewImage){
            var t = speed * 0.001;

            if(time > 1){
                time = 0;
                particle.changeImage( nextImage );
            }

            if(time > (0.5-t) && time < (0.5+t)){
                
                time = 0.5;
                isNewImage = false;
                
            }
        }

        time += t;
        particle.setUniforms( 'time', time );
        if(hub) hub.slide_update( time );

    };

    //---------------------------------------------
    // gestion de l'impact
    //---------------------------------------------

    view.impact = function ( pos ) {

        // pour choisir la position de l'impact
        if( pos !== undefined ) particle.setUniforms('impactPosition', new THREE.Vector3( pos.x, pos.y, 0 ));

        var o = particle.getOptions();

        impactStart = timeElapsed;
        //impactMax = 1.5 / o.impactSpeed;
        impactMax = ((1*o.expluseTime) + (1-o.fadeStart)) / o.impactSpeed;
        isImpact = true;

    };

    view.impactEnd = function ( ) {

        isImpact = false;
        view.directText('');
        particle.setUniforms( 'impact', 0 );
        hub.tell( 'impact end');

    };

    //---------------------------------------------
    // pour afficher les images
    //---------------------------------------------

    view.directImage = function ( src, max ) {

        var image = new Image();
        image.src = src;

        image.addEventListener( 'load', function(){ particle.changeImage( canvasPrepa.makeImage( image, max ) ); }, false);
        
    };

    view.setImage = function( image, max ) {

        nextImage = canvasPrepa.makeImage( image, max );
        time = 0.5+((speed*0.001)*2);
        isNewImage = true;

    };

    //---------------------------------------------
    // pour afficher les messages
    //---------------------------------------------

    view.directText = function ( message ) {

        particle.changeWord( canvasPrepa.makeText( message ) );
        
    };

    view.setMessage = function( message ) {

        nextMessage = canvasPrepa.makeText( message );
        time = 0.5+((speed*0.001)*2);
        isNewMessage = true;

    };

    //---------------------------------------------
    //  pour le raytest avec la souris
    //---------------------------------------------

    view.addMousePlane = function () {

        mouse3D = new THREE.Vector2();
        raycaster = new THREE.Raycaster();
        contentMouse = new THREE.Group();
        //contentMouse.position.set(0,0,-1000)
        scene.add( contentMouse );

        var emptyMat = new THREE.ShaderMaterial()

        mousePlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1000, 1000, 1, 1 ), emptyMat );
        mousePlane.material.visible = false;
  
        contentMouse.add(mousePlane);

        canvas.addEventListener( 'mousedown', view.rayTest, false );

    };

    view.rayTest = function (e) {

        mouse3D.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse3D.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse3D, camera );
        var intersects = raycaster.intersectObjects( contentMouse.children, true );
        if ( intersects.length) {
            var x = ~~intersects[0].point.x;
            var y = ~~intersects[0].point.y;
            hub.impact( x , y, e.clientX, e.clientY );
            particle.setUniforms('impactPosition', new THREE.Vector3( x, y, 0 ));
        }

    };

    return view;

})();