"use strict";

var camera, videoCanvas, threeCanvas, test;
var three;

var obj = {}; 
var hideMaterial, defMaterial;

var setting = {

	onFrame:false,

    debug:false,

    fov:40,

    pivotY : 0.4,
    pivotZ : 0.2,
    tweakY : 0.15,
    rotateX : 0,

    sensibility:0.75,//sensibility, between 0 and 1. Less -> more sensitive
    range: 0.05,

}

// callback : launched if a face is detected or lost. TODO : add a cool particle effect WoW !
function detect_callback(faceIndex, isDetected) {
    if (isDetected) {
    	test.style.background = '#00FF00';
        //console.log('INFO in detect_callback() : DETECTED');
    } else {
    	test.style.background = '#FF0000';
        //console.log('INFO in detect_callback() : LOST');
    }
}

// build the 3D. called once when Jeeliz Face Filter is OK
function init_threeScene(spec) {

    three = THREE.JeelizHelper.init( spec, detect_callback );

    

    applySetting();

    //CREATE THE ENVMAP
    var path = './Bridge2/';
    var format = '.jpg';
    var envMap = new THREE.CubeTextureLoader().load( [
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format
    ]);


    hideMaterial = new THREE.ShaderMaterial({
        vertexShader: THREE.ShaderLib.basic.vertexShader,
        fragmentShader: "precision lowp float;\n void main(void){\n gl_FragColor=vec4(1.,0.,0.,1.);\n }",
        uniforms: THREE.ShaderLib.basic.uniforms,
        colorWrite: false
    });

    defMaterial = new THREE.MeshStandardMaterial({color:0xAAAAAA, transparent:true, opacity:0.25, envMap:envMap, metalness:0.3, roughness:0.8});//


    var cubeGeometry = new THREE.BoxGeometry(0.05,0.05,0.06);
    var cubeMaterial = new THREE.MeshNormalMaterial();
    var threeCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    var threeCube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    threeCube.position.set(0.688,-0.11,-0.33);
    threeCube.frustumCulled=false;

    threeCube2.position.set(-0.68,-0.11,-0.33);
    threeCube2.frustumCulled=false;

    three.faceObject.add(threeCube);
    three.faceObject.add(threeCube2);

    //IMPORT THE SEA MODEL

    var model = {};

    var loader = new THREE.SEA3D();
    loader.onComplete = function () {

        var i = loader.meshes.length, m;
        while(i--){

            m = loader.meshes[i];
            if(m.name!=='verre'){
                m.frustumCulled = false;
                m.scale.multiplyScalar(0.084);
                m.position.set(0, 0.1,-0.04);
            }
        
            model[m.name] = m;

        }


        var face = model['face_ok'];
        
        face.material = hideMaterial;
        face.renderOrder=-1;
        three.faceObject.add( face );

        obj['face'] = face;

        obj['faceplus'] = face.clone();
        obj.faceplus.material = new THREE.MeshBasicMaterial({ color:0x202020, wireframe:true });
        three.faceObject.add( obj.faceplus );
        obj.faceplus.visible = false;

       // three.create_threejsOccluder( face )

        var lunette = model['lunette'];
        lunette.material = new THREE.MeshStandardMaterial({color:0xd4af37, wireframe:false, envMap:envMap, metalness:0.9, roughness:0.4});
        three.faceObject.add( lunette );

        model.verre.material = new THREE.MeshStandardMaterial({color:0x60ccff, transparent:true, opacity:0.25, envMap:envMap, metalness:1, roughness:0.1});

        obj['lunette'] = lunette;

    }

    loader.load( './face.sea' );


    

    

    //CANVASELEMENT = document.getElementById('jeeFaceFilterCanvas');

    resize();

    gui();


    window.addEventListener('resize', resize, false);
    //set_fullScreen();

} // end init_threeScene()

function setDebug(){

    if(setting.debug){
        obj.face.material = defMaterial;
        obj.faceplus.visible = true;
    }else{
        obj.face.material = hideMaterial;
        obj.faceplus.visible = false;
    }

}


function gui (){

    var ui = new UIL.Gui({ width:300, bg:'rgba(0,0,0,0.5)' });
    ui.add('fps',    { h:30 });

    ui.add( setting, 'onFrame', {type:'bool' }).onChange( applyOnFrame );
    ui.add( setting, 'debug', {type:'bool' }).onChange( setDebug );
    ui.add( setting, 'fov', {min:0, max:120, color:'#7BB8D4' }).onChange( applySetting );
    ui.add( setting, 'pivotY', {min:-2, max:2 }).onChange( applySetting );
    ui.add( setting, 'pivotZ', {min:-2, max:2 }).onChange( applySetting );
    ui.add( setting, 'tweakY', { min:-1, max:1 }).onChange( applySetting );
    ui.add( setting, 'rotateX', { min:-180, max:180 }).onChange( applySetting );

    ui.add( setting, 'sensibility', { min:0, max:1, color:'#D4B87B' }).onChange( applySetting );
    ui.add( setting, 'range', { min:0, max:0.5, color:'#D4B87B' }).onChange( applySetting );

    //ui.add('fps',    { h:30 });


}

function applyOnFrame (b) {

	THREE.JeelizHelper.setOnFrame(b)
}

function applySetting () {

    three.camera.fov = setting.fov;

    three.option.pivotY = setting.pivotY;
    three.option.pivotZ = setting.pivotZ;
    three.option.tweakY = setting.tweakY;
    three.option.rotateX = setting.rotateX * THREE.Math.DEG2RAD;

    three.option.sensibility = setting.sensibility;
    three.option.range = setting.range;

}

function resize ( e ) {

	var w = window.innerWidth;
	var h = window.innerHeight;
	var ratio = w/h;

	videoCanvas.width=w;
	videoCanvas.height=h;

	//threeCanvas.width=w;
	//threeCanvas.height=h;

	JEEFACEFILTERAPI.resize();
    
}

//launched by body.onload() :
function main(){

	threeCanvas = document.getElementById('threeCanvas');
    videoCanvas = document.getElementById('jeeFaceFilterCanvas');
    test = document.getElementById('test');

    resize();

    init_faceFilter();


} //end main()

function init_faceFilter( ){

    JEEFACEFILTERAPI.init({
    	//
    	videoSettings:{ //increase the default video resolution since we are in full screen
    	    //videoElement:document.getElementById('video'),
            'idealWidth': 1920,  //ideal video width in pixels
            'idealHeight': 1080, //ideal video height in pixels
            'maxWidth': 1920,   //max video width in pixels
            'maxHeight': 1080,   //max video height in pixels
            'minWidth': 960,    //min video width in pixels
            'minHeight': 540,   //min video height in pixels
        },
        followZRot: true,
        //videoSettings: videoSettings,
        canvasId: 'jeeFaceFilterCanvas',
        
        NNCpath: 'https://appstatic.jeeliz.com/faceFilter/NNC.json', //root of NNC.json file
        //NNCpath: '../../../dist/', // root of NNC.json file
        maxFacesDetected: 1,

        callbackReady: function(errCode, spec){
          if (errCode){
            console.log('AN ERROR HAPPENS. ERR =', errCode);
            return;
          }

          //console.log('INFO : JEEFACEFILTERAPI IS READY', spec);


          spec.threejsCanvasId = 'threeCanvas';
          //spec.isDebugPivotPoint = true;
          spec.maxWidth = 1920;
          spec.maxHeight = 1080;
          spec.fov = 40;
          init_threeScene(spec);

        }, //end callbackReady()



        //called at each render iteration (drawing loop) :
        callbackTrack: function(detectState){
          THREE.JeelizHelper.render( detectState );
        } //end callbackTrack()
    }); //end JEEFACEFILTERAPI.init call

    /*JEEFACEFILTERAPI.set_scanSettings({

        minScale:0.15,
        maxScale:0.6,
        borderWidth:0.2,
        borderHeight:0.2,
        nStepsX:6,
        nStepsY:5,
        nStepsScale:3,
        nDetectsPerLoop:-1,

    });*/

    JEEFACEFILTERAPI.set_stabilizationSettings({

        translationFactorRange:[0.0015, 0.005],
        rotationFactorRange:[0.003, 0.02],
        qualityFactorRange:[0.9, 0.98],
        alphaRange:[.05, 1],

    });



} // end main()

