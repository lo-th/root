import * as UIL from '../build/uil.module.js'
import * as THREE from '../build/three.module.js';
import * as TWEEN from '../build/tween.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';

import { HDRCubeTextureLoader } from './jsm/loaders/HDRCubeTextureLoader.js';

import { Shader } from '../src/jsm/lth/Shader.js';
import { Reflector } from '../src/jsm/lth/Reflector.js';
import { Env } from '../src/jsm/lth/Env.js';
import { Pool } from '../src/jsm/lth/Pool.js';
import { math } from '../src/jsm/lth/math.js';
import { hub } from '../src/jsm/lth/hub.js';
import { Timer } from '../src/jsm/lth/Timer.js';

import { Diamond } from '../src/jsm/lth/Diamond.js';

import { Motor } from './Motor.js';



export class Main {

	static start ( option = {} ){

		let o = { ...option };
		o.callback = init;
		Motor.init( o );

	}



	static getCube( geometry ){
		return Shader.CubeNormal( { geometry:geometry, renderer:renderer })
	}

	static getEnvmap( geometry ){
		return scene.environment;//envmap;
	}

}


let camera, controls, scene, renderer, stats, txt, light, envmap;

const Demos = [ 'start', 'basic', 'joint', 'capsule', 'compound', 'bridge', 'gears', 'convex' ];

//const timer = new Timer(60);
const size = { w:0, h:0, r:0 };

window.rand = Motor.rand;

window.phy = Motor;
window.Main = Main;
window.Pool = Pool;
window.THREE = THREE;

window.HDRCubeTextureLoader = HDRCubeTextureLoader;
window.Diamond = Diamond

const options = {

	demo:'Basic',
	substep:1,
	fps:60,
	gravity:[0,-9.80665,0],

	Exposure: 1,
	Shadow:0.5,//0.25,

	ShadowGamma:1,
	ShadowLuma: 0.75,//0,
    ShadowContrast: 2.5,//1,
	
}


function init() {

	size.w = window.innerWidth;
	size.h = window.innerHeight;
	size.r = size.w / size.h;

	Shader.init( options );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000000 );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( size.w, size.h );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.physicallyCorrectLights = true;
	renderer.toneMappingExposure = 0;

	document.body.appendChild( renderer.domElement );

	// LIGHT

	light = new THREE.DirectionalLight( 0xFFFFFF, 4 );
	light.position.set( 1, 8, 0 );

	let s = light.shadow;
	
	s.mapSize.x = s.mapSize.y = 2048;//; 4096
	s.camera.top = s.camera.right = 10;
	s.camera.bottom = s.camera.left = - 10;
	s.camera.near = 0.5;
	s.camera.far = 30;

	s.bias = -0.0001;
	s.radius = 4;

	//console.log(s.bias, s.radius)
	

	light.castShadow = true;
	renderer.shadowMap.enabled = true;
	//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	//renderer.shadowMap.type = THREE.VSMShadowMap;

	scene.add( light );
	// debug light
	//scene.add( new THREE.CameraHelper( s.camera ) );

	// CAMERA / CONTROLER

	camera = new THREE.PerspectiveCamera( 45, size.r, 1, 1000 );
	camera.position.set( 0, 8, 20 );
	camera.lookAt( 0, 2, 0 );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.target.y = 2;
	controls.update();

	//scene.add( camera );


	

	window.addEventListener( 'resize', onResize );

	Env.load( './assets/textures/equirectangular/basic.hdr', renderer, scene, next );
	//Env.load( './assets/textures/equirectangular/tomoco.hdr', renderer, scene, next );

	hub.init( camera, size, 'WORKER OIMO 1.2.2' );

}

function next () {

	let mat = Motor.getMat();

	// custom shadow for default motor material
	for(let m in mat ){ 
		mat[m].metalness = 0.5;
		mat[m].roughness = 0.25
		Shader.add( mat[m] );
	}

	let info = Env.getData();

	light.position.copy( info.pos ).multiplyScalar( 20 );
	light.color.copy( info.sun );

	envmap = info.envmap;

	// add reflect ground
	let reflector = new Reflector({

		size: 50,
    	textureSize: 2048,
        clipBias: 0.003,
        encoding:true,
        reflect:0.8,
        color:info.fog,
        round:true

    });
    scene.add( reflector );
    //reflector.renderDepth = -1;

	scene.add( Motor.getScene() );

	render();

	var hash = location.hash.substr( 1 );
    if( hash !== '' ) options.demo = hash;

    initGUI();

    hub.endLoading();

	new TWEEN.Tween( { a:0 } ).to( { a:options.Exposure }, 3000 ).onUpdate(function(o){ renderer.toneMappingExposure = math.toFixed(o.a,3); }).easing( TWEEN.Easing.Quadratic.In ).start();

	loadDemo( options.demo );

}

function loadDemo( name ){

	// reset physics engine
	phy.reset();

	options.demo = name;

	//Pool.load( './demos/' + name + '.js', inject );

	setTimeout( function(){Pool.load( './demos/' + name + '.js', inject );}, 10 );

}

function inject(){

	// start physics engine
	//phy.start( options );

	location.hash = options.demo;

	let script = document.createElement("script");
    script.language = "javascript";
    script.type = "text/javascript";
    script.id = "scr" + 0;
    script.innerHTML = Pool.get( options.demo );
    document.body.appendChild( script );

    window['demo']();

}

function onResize() {

	size.w = window.innerWidth;
	size.h = window.innerHeight;
	size.r = size.w / size.h;

	camera.aspect = size.r;
	camera.updateProjectionMatrix();

	renderer.setSize( size.w, size.h );

	hub.update( size, '' );

}


function render ( stamp ) {

	requestAnimationFrame( render );

	//if( timer.up( stamp ) ){

		TWEEN.update();

		renderer.render( scene, camera );

		//hub.setFps( timer.fps )
	//}

}

function initGUI () {

	UIL.Tools.setStyle({

		background:'none',
		backgroundOver:'none',
		fontShadow:'#000000',

	})

	var ui = new UIL.Gui( { w:200, h:20, close:false, bottomText:['OPTIONS', 'CLOSE'] } );

	ui.add( 'empty', {h:17});
	ui.add( 'button', { name:'PAUSE', onName:'RUN', p:0, h:30 }).onChange( Motor.pause );
	ui.add( 'empty', {h:7});


	ui.add( options, 'demo', { type:'grid', values:Demos, selectable:true, h:30 } ).onChange( loadDemo )

	ui.add( options, 'Exposure', {min:0, max:4} ).onChange( function( v ){ renderer.toneMappingExposure = v; } )

	ui.add( options, 'Shadow', {min:0, max:1} ).onChange( function(){ Shader.up( options ); } )
	/*ui.add( options, 'ShadowGamma', {rename:'gamma', min:0, max:2} ).onChange( function(){ Shader.up( options ); } )
	ui.add( options, 'ShadowLuma', {rename:'luma', min:0, max:2} ).onChange( function(){ Shader.up( options ); } )
	ui.add( options, 'ShadowContrast', {rename:'contrast', min:0, max:4} ).onChange( function(){ Shader.up( options ); } )*/

}


