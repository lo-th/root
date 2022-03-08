import * as THREE from 'three';
import * as TWEEN from 'tween';

import { math } from './math.js'
import { root } from '../root.js';

import { Timer } from './Timer.js';
import { Track } from './Track.js';
import { Ring } from './Ring.js';
import { Controller } from './Controller.js';

import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';
import { RGBELoader } from '../jsm/loaders/RGBELoader.js';
import { EXRLoader } from '../jsm/loaders/EXRLoader.js';
import * as BufferGeometryUtils from '../jsm/utils/BufferGeometryUtils.js';





export class View {

    constructor() {

    	this.timer = new Timer( 60 )

    	this.bg = 0x5b9ab7

    	this.useHDR = false

    	this.follow = false

    	this.size = {}
    	this.resize()

    	this.b28 = null
    	this.b42 = null
    	this.ring = null

    	this.x28 = null
    	this.x42 = null

    	this.meshs = {}

    	const scene = new THREE.Scene();
		scene.background = new THREE.Color( this.bg )
		scene.fog = new THREE.Fog( this.bg, 30, 150 )

    	const renderer = new THREE.WebGLRenderer( { antialias: true } )
		renderer.setPixelRatio( 1 )
		renderer.setSize( 1,1 )
		renderer.toneMapping = THREE.ACESFilmicToneMapping
		renderer.toneMappingExposure = 1
		renderer.outputEncoding = THREE.sRGBEncoding
		//renderer.shadowMap.enabled = true;

		document.body.appendChild( renderer.domElement )

		let camera = new THREE.PerspectiveCamera( 60, 1, 0.1, 300 )
		camera.position.set( 0, 4, -5 )

		const controls = new Controller( camera, renderer.domElement )
		controls.target.set( 0, 2, 0 )
		controls.update()

		/*const hemiLight = new THREE.HemisphereLight( 0x808080, 0xFFFFFF, 4 );
		hemiLight.position.set( 0, 1, 0 );
		scene.add( hemiLight )*/

		const light = new THREE.DirectionalLight( 0xFFFFFF, 1 );
		light.position.set( -50, 100, 50 )
		//light.castShadow = true
		/*let ss = 100
		light.shadow.mapSize.x = light.shadow.mapSize.y = 4096;
		light.shadow.camera.top = light.shadow.camera.right = ss
		light.shadow.camera.bottom = light.shadow.camera.left = - ss
		light.shadow.camera.near = 1
		light.shadow.camera.far = 200
		light.shadow.bias = -0.0005
		light.shadow.autoUpdate = true*/
		
		scene.add( light )

		scene.add( new THREE.AmbientLight( 0x333333 ) );

		this.renderer = renderer
		this.scene =  scene
		this.camera =  camera
		this.controls = controls
		this.light = light


		


		this.fps = document.createElement( 'div' );
		this.fps.style.cssText =  "font-size:24px; font-family:Tahoma; position:absolute; top:3px; left:10px; width:100px; color:#000;  pointer-events:none;"
        document.body.appendChild( this.fps )



		window.addEventListener( 'resize', this.resize.bind(this) )

		let env = ['colors', 'river', 'room', 'japan', 'snow']
		let mm = env[ math.randInt(0, env.length-1)]


		if(!this.useHDR ){

			let envmap = new THREE.TextureLoader().load('./assets/textures/'+mm+'.jpg', this.upmap2 )
			scene.environment = envmap;
			//scene.background = envmap;


			this.start()

		} else {
			const self = this;

			new RGBELoader().setPath( './assets/textures/' )
				.load( 'river.hdr', function ( texture ) {
					texture.mapping = THREE.EquirectangularReflectionMapping;
					//scene.background = texture;
					scene.environment = texture;

					
					self.start()
			})
		}

    }

    start(){

    	this.track = new Track({ scene:this.scene })
    	this.scene.add( this.track )

    	root.track = this.track

    	this.ring = new Ring()
    	this.scene.add( this.ring )

    	
    	this.setFollow( true )

    	this.render(0)
    }

    setFollow( b ){

    	if(b){
    		this.controls.startFollow(this.ring, {distance:8,  height:2})
    	} else {
    		this.controls.resetFollow()
    	}

    	this.follow = b

    }

	upmap2 (t){
		t.encoding = THREE.sRGBEncoding;
		t.mapping =THREE.EquirectangularReflectionMapping
		//t.mapping =THREE.SphericalReflectionMapping
		t.needsUpdate = true;
		//t.flipY = false;
	}

	upmap (t){
		t.encoding = THREE.sRGBEncoding;
		t.flipY = false;
	}

    resize( e ) {

    	let s = this.size
		s.w = window.innerWidth 
		s.h = window.innerHeight
		s.r = s.w / s.h
		s.up = true

    }

    rand( low, high ) { 
    	return low + Math.random() * ( high - low ) 
    }

    tween(){
    	const self = this;
    	let t = new TWEEN.Tween( self.ring.rotation )
            .to( {x:self.rand(-Math.PI*2, Math.PI*2), z:self.rand(-Math.PI*0.5, Math.PI*0.5)}, 1000 )
            .easing( TWEEN.Easing.Quadratic.Out )
            //.onUpdate( function( o ) { self.circle1.geometry.change(o.r,o.c); } )
            .onComplete( function() { self.tween(); } )
            .start();
    }

    render( time = 0 ) {

    	requestAnimationFrame( this.render.bind(this) )

    	if( !this.timer.up( time ) ) return

    	//this.timer.up(time)

    	this.fps.innerHTML = this.timer.fps

    	let s = this.size

    	if(s.up){
    		s.up = false
    		this.renderer.setSize( s.w, s.h )
			this.camera.aspect = s.r
			this.camera.updateProjectionMatrix()
    	}

    	let delta = this.timer.delta

    	TWEEN.update( delta )

    	this.track.move( delta )
    	this.ring.move( delta )

    	if( this.follow ) this.controls.follow( delta )


    	this.renderer.render( this.scene, this.camera )

    }



}

