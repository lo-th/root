import * as THREE from 'three';
import * as TWEEN from 'tween';

import { Env } from './Env.js'
import { math } from './math.js'
import { root } from '../root.js';
//import { User } from './User.js'
import { Timer } from './Timer.js';
import { Track } from './Track.js';
import { Ring } from './Ring.js';
import { Diamond } from './Diamond.js';
import { Decor } from './Decor.js';
import { CameraFollow } from './CameraFollow.js';

import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';
import { RGBELoader } from '../jsm/loaders/RGBELoader.js';
import { EXRLoader } from '../jsm/loaders/EXRLoader.js';
import * as BufferGeometryUtils from '../jsm/utils/BufferGeometryUtils.js';





export class View {

    constructor() {

    	this.timer = new Timer( 60 )
    	//this.user = new User()

    	this.mouse = { x:0, y:0, down:false, line:1, up:0 }

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
		

    	const renderer = new THREE.WebGLRenderer( { antialias: true } )
		renderer.setPixelRatio( 1 )
		renderer.setSize( 1,1 )
		renderer.toneMapping = THREE.ACESFilmicToneMapping
		renderer.toneMappingExposure = 1
		renderer.outputEncoding = THREE.sRGBEncoding
		//renderer.shadowMap.enabled = true;

		document.body.appendChild( renderer.domElement )
		renderer.domElement.style.position = 'absolute'

		

		let camera = new THREE.PerspectiveCamera( 60, 1, 0.1, 10000 )
		camera.position.set( 0, 180, 80 )

		//const controls = new Controller( camera, renderer.domElement )
		const controls = new OrbitControls( camera, renderer.domElement )
		controls.target.set( 0, 0, 90 )
		controls.update()

		/*const hemiLight = new THREE.HemisphereLight( 0x808080, 0xFFFFFF, 4 );
		hemiLight.position.set( 0, 1, 0 );
		scene.add( hemiLight )*/

		const light = new THREE.DirectionalLight( 0xFFFFFF, 1 );
		light.position.set( -5, 20, -5 )
		/*light.castShadow = true
		let ss = 30
		//light.shadow.mapSize.x = light.shadow.mapSize.y = 1024;
		light.shadow.camera.top = light.shadow.camera.right = ss
		light.shadow.camera.bottom = light.shadow.camera.left = - ss
		light.shadow.camera.near = 1
		light.shadow.camera.far = 30
		light.shadow.bias = -0.0005
		light.shadow.autoUpdate = true*
		let shadowHelper = new THREE.CameraHelper( light.shadow.camera );
		scene.add( shadowHelper );*/

		scene.add( light )

		//scene.add( new THREE.AmbientLight( 0x333333 ) );

		this.renderer = renderer
		this.scene =  scene
		this.freecamera =  camera
		this.controls = controls
		this.light = light

		root.scene = scene
		root.renderer = renderer

		// dynamic envmap
		this.env = new Env()

		window.addEventListener( 'resize', this.resize.bind(this) )

		this.start()

    }

    showBackground(b){

    	this.env.addPreview(b)

    }

    start(){

    	this.track = new Track({ scene:this.scene })
    	this.scene.add( this.track )
    	root.track = this.track

    	this.camera = new CameraFollow( 60, 1, 0.1, 300 )
		this.scene.add( this.camera );

    	this.ring = new Ring()
    	this.scene.add( this.ring )

    	this.diam = new Diamond()
    	this.scene.add( this.diam )

    	this.decor = new Decor()
    	this.scene.add( this.decor )
    
    	this.setFollow( true )

    	this.render(0)
    }

    setFollow( b ){

    	if(b){
    		this.scene.fog = new THREE.Fog( this.bg, 60, 150 )
    		this.addInteraction()
    	} else {
    		this.scene.fog = null 
    		this.removeInteraction()
    	}

    	this.follow = b

    }

    removeInteraction(){

    	const dom = this.renderer.domElement

    	dom.removeEventListener( 'pointermove', this, false )
	    dom.removeEventListener( 'pointerdown', this, false )
	    document.removeEventListener( 'pointerup', this, false )

    }

    addInteraction(){

    	const dom = this.renderer.domElement

    	dom.addEventListener( 'pointermove', this, false )
	    dom.addEventListener( 'pointerdown', this, false )
	    document.addEventListener( 'pointerup', this, false )

    }

    handleEvent ( e ) {

    	if(!this.ring) return

    	const s = this.size
    	const m = this.mouse

    	switch(e.type){
    		case 'pointerdown': 
    		m.down = true;
    		break;
    		case 'pointerup': 
    		m.down = false;
    		break;
    		case 'pointermove': 

    		m.y = e.clientY / s.h
    		m.x = e.clientX / s.w

    		if(m.y>0.6){
    			m.up = 0 
    			if(m.x < 0.33 ) m.line = 0
	    		else if( m.x < 0.66 ) m.line = 1
	    		else m.line = 2
    		}else{
    			//m.line = root.line
    			m.up = 1
    		}

    		

    		break;
    	}

    	if( m.down ){

    			if( m.up ) this.ring.jump()
    			else this.ring.switchLine( m.line )

    	}

    	//console.log(m)

    	
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

    gameLogique(){

    	let p = math.randInt(0, 666)
    	if( p === 3 ) this.decor.addDeco()

    	let d = math.randInt(0, 100)
        if( d === 20 ){

        	this.diam.addDiam()

        }

    }

    render( time = 0 ) {

    	requestAnimationFrame( this.render.bind(this) )

    	//this.user.update()

    	if( !this.timer.up( time ) ) return

    	//this.timer.up(time)

        if( window.gui ) gui.fps.innerHTML = this.timer.fps


    	let s = this.size

    	if(s.up){
    		s.up = false
    		this.renderer.setSize( s.w, s.h )
			this.freecamera.aspect = s.r
			this.freecamera.updateProjectionMatrix()
			this.camera.aspect = s.r
			this.camera.updateProjectionMatrix()

    	}

    	let delta = this.timer.delta


    	this.env.move()

    	//this.sph.material.map.needsUpdate = true

    	/*let i = root.materials.length
    	while(i--){ 
    		root.materials[i].envMap = this.env.texture
    		root.materials[i].envMap.needsUpdate = true// = this.env.texture
    		//root.materials[i].needsUpdate = true
    	}*/

    	TWEEN.update( time )

    	this.gameLogique()

    	this.track.move( delta )
    	this.ring.move( delta )
    	this.diam.move( delta )
    	this.decor.move( delta )
    	this.camera.move( delta )



    	


    	this.renderer.render( this.scene, this.follow ? this.camera : this.freecamera )


    	

    }



}

