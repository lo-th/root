import * as THREE from 'three';
import * as TWEEN from 'tween';

import ZingTouch from '../libs/zingtouch/ZingTouch.js';

import { pool } from './pool.js'
import { Gui } from './Gui.js'

import { Env } from './Env.js'
import { math } from './math.js'
import { root } from '../root.js';
import { Timer } from './Timer.js';
import { Track } from './Track.js';
import { Ring } from './Ring.js';
import { Diamond } from './Diamond.js';
import { Decor } from './Decor.js';
import { Camera } from './Camera.js';


import { OrbitControls } from '../jsm/controls/OrbitControls.js';


export class View {

    constructor( Container, withUI = false, Q = true ) {


    	this.quadrant = Q

    	this.container = Container

    	this.withUI = withUI

    	this.useZing = false

    	this.timer = new Timer( 60 )
    	//this.user = new User()

    	this.mouse = { x:0, y:0, down:false, line:1, up:0, oldy:0, isD:false }

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
		renderer.toneMappingExposure = 1.0
		renderer.outputEncoding = THREE.sRGBEncoding
		//renderer.shadowMap.enabled = true;

		this.container.appendChild( renderer.domElement )
		//renderer.domElement.style.position = 'absolute'

		

		let camera = new THREE.PerspectiveCamera( 60, 1, 0.1, 10000 )
		camera.position.set( 0, 180, 89 )

		const controls = new OrbitControls( camera, renderer.domElement )
		controls.target.set( 0, 0, 90 )
		controls.update()

		/*const hemiLight = new THREE.HemisphereLight( 0x808080, 0xFFFFFF, 4 );
		hemiLight.position.set( 0, 1, 0 );
		scene.add( hemiLight )*/

		const light = new THREE.DirectionalLight( 0xFFFFFF, 1 );//0xfbea1f
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
		root.view = this 

		window.addEventListener( 'resize', this.resize.bind(this) )


		this.fps = document.createElement( 'div' );
        this.fps.style.cssText =  "font-size:24px; font-family:Tahoma; position:absolute; bottom:3px; left:10px; width:100px; color:#fff;  pointer-events:none;"
        document.body.appendChild( this.fps )

        this.db = document.createElement( 'div' );
        this.db.style.cssText =  "font-size:24px; font-family:Tahoma; padding: 10px 10px; position:absolute; top:10px; left:0px; width:100%; color:#0ff;  pointer-events:none;"
        document.body.appendChild( this.db )






		this.loadAssets()

    }

    loadAssets(){

    	pool.load( root.assets, this.start.bind(this) )

    }

    showBackground(b){

    	this.env.addPreview( b )

    }



    start(){

    	// dynamic envmap
		this.env = new Env()
		root.env = this.env

    	this.track = new Track({ scene:this.scene })
    	this.scene.add( this.track )
    	root.track = this.track

    	this.camera = new Camera( 80, this.size.r, 0.1, 300 )
		this.scene.add( this.camera );
		//this.scene.add( this.camera.helper );

		root.camera = this.camera

		// hub 
		//this.hub = new Hub()

		//this.timeline = new Timeline()

    	this.ring = new Ring()
    	this.scene.add( this.ring )

    	this.diam = new Diamond()
    	this.scene.add( this.diam )

    	this.decor = new Decor()
    	this.scene.add( this.decor )
    
    	this.setFollow( true )

    	if( this.withUI ) window.gui = new Gui()

    	this.render(0)
    }

    setFollow( b ){

    	if(b){
    		this.scene.fog = new THREE.Fog( this.bg, 20, 150 )
    		//this.scene.fog = new THREE.FogExp2( this.bg, 0.04  )
    		this.addInteraction()
    	} else {
    		this.scene.fog = null 
    		this.removeInteraction()
    	}

    	this.follow = b

    }

    setAlpha(){

    	this.ring.mat2.opacity = root.alpha
    	this.diam.mat2.opacity = root.alpha

    }

    removeInteraction(){

    	const dom = this.renderer.domElement

    	dom.removeEventListener( 'pointermove', this, false )
	    dom.removeEventListener( 'pointerdown', this, false )
	    dom.removeEventListener( 'pointercancel', this, false);
	    dom.removeEventListener( 'pointerup', this, false )

    }

    addInteraction(){

    	//if( this.useZing ){

		/*		this.counter = 0

			//this.region = new ZingTouch.Region( document.body )//this.renderer.domElement ) // )
		this.region = new ZingTouch.Region( this.container )
			this.swipe = new ZingTouch.Swipe({ numInputs: 1, maxRestTime: 100, escapeVelocity: 0.1 })

			this.region.bind( this.renderer.domElement, this.swipe, function(e) {

				let angle = Math.floor( e.detail.data[0].currentDirection * math.todeg ) + 90//e.detail.data[0].currentDirection * math.todeg;
				let velocity = e.detail.data[0].velocity.toFixed(3)*1;
				let h = math.quadrant( angle )

				let distance = e.detail.data[0].distance.toFixed(3)*1;
				let duration = e.detail.data[0].duration.toFixed(3)*1;
				//const x = e.detail.events[0].x;
				//const y = e.detail.events[0].y;

				//
				this.db2.innerHTML =JSON.stringify(e.detail.data[0])

				this.db2.innerHTML = 'd:'+ distance + ' k:'+ h +' r:' + angle + ' v:'+velocity + ' d:' + duration

			}.bind(this))*/

			/*this.region.bind(this.renderer.domElement, 'pan', function(e){
			    this.counter++;
			    console.log( "Input currently panned: " + this.counter + " times");
			}.bind(this))*/
			
		//} else {

	    	const dom = this.renderer.domElement
	    	dom.addEventListener( 'pointermove', this, false )
		    dom.addEventListener( 'pointerdown', this, false )
		    dom.addEventListener( 'pointercancel', this, false);
		    dom.addEventListener( 'pointerup', this, false )

		//}

    }

    handleEvent ( e ) {

    	if(!this.ring) return

    	const s = this.size
    	const m = this.mouse

    	let px, py

	    if ( e.pointerType === 'touch' ) {

	      px = e.screenX
	      py = e.screenY

	    } else {

	      px = e.clientX
	      py = e.clientY

	    }


    	switch( e.type ){

    		case 'pointerdown':
    		m.ox = px / s.w
    		m.oy = py / s.h
    		m.down = true
    		break;

    		case 'pointermove': 

    		m.y = py / s.h
    		m.x = px / s.w

    		if( m.down ){

	    		m.dx = m.x-m.ox 
	    		m.dy = m.y-m.oy

	    		let distance = Math.sqrt( m.dx*m.dx + m.dy*m.dy )

	    		if( this.quadrant ){

		    		let angle = ( Math.PI + Math.atan2( m.dy, m.dx ) )
		    	    let c = math.quadrant( angle, true )
		    		
		    		if( distance < 0.03 ) return

		    		if( c === 1 ) this.ring.right()
		    		if( c === 2 ) this.ring.down()
		    		if( c === 3 ) this.ring.left()
		    		if( c === 4 ) this.ring.jump()

		    		this.db.innerHTML = 'd:'+ distance + ' k:'+ c 

		    	} else {

		    		if( distance < 0.03 ) return

		    		if(Math.abs(m.dx) > Math.abs(m.dy)){
			            if(m.dx > 0) return this.ring.right()
			            else this.ring.left()
			        }
			        else if(Math.abs(m.dx) < Math.abs(m.dy)){
			            if(m.dy > 0) this.ring.down()
			            else this.ring.jump()
			        }

			        this.db.innerHTML = 'd:'+ distance

		    	}
	    		
	    		m.down = false

	    	   

	    	}
	    		
    		break;
    		default:
	        //console.log( e.type)
	        m.down = false
    	}
    	
    }

    /*handleEvent ( e ) {

    	if(!this.ring) return

    	const s = this.size
    	const m = this.mouse

    	switch(e.type){
    		case 'pointerdown':
    		if(!m.isD) m.oldy = e.clientY / s.h
    		m.down = true;
    		m.isD = true
    		break;
    		case 'pointerup': 
    		m.down = false;
    		break;
    		case 'pointermove': 

    		/*m.y = e.clientY / s.h
    		m.x = e.clientX / s.w

    		if(m.y>0.6){
    			m.up = 0 
    			if(m.x < 0.33 ) m.line = 0
	    		else if( m.x < 0.66 ) m.line = 1
	    		else m.line = 2
    		}else{
    			//m.line = root.line
    			m.up = 1
    		}*/

    		

    /*		break;
    	}


    	m.y = e.clientY / s.h
    	m.x = e.clientX / s.w

    	if(m.x < 0.33 ) m.line = 0
	    else if( m.x < 0.66 ) m.line = 1
	    else m.line = 2

    	if( m.down ){
    		this.ring.switchLine( m.line )
    	}

    	if( !m.down && m.isD ){ 
    		if( m.oldy-m.y > 0.1 ) this.ring.jump()
    		if( m.oldy-m.y < -0.1 ) this.ring.down()
    		m.isD = false
    	}
    	
    }*/

	upmap (t){

		t.encoding = THREE.sRGBEncoding
		t.flipY = false

	}

    resize( e ) {

    	const s = this.size
		s.w = window.innerWidth 
		s.h = window.innerHeight
		s.r = s.w / s.h
		s.up = true

    }

    doResize() {

    	const s = this.size

    	if( s.up ){

    		s.up = false
    		this.renderer.setSize( s.w, s.h )
			this.freecamera.aspect = s.r
			this.freecamera.updateProjectionMatrix()
			this.camera.aspect = s.r
			this.camera.updateProjectionMatrix()
			//this.hub.resize()

    	}

    }

    gameLogique(){

    	let p = math.randInt(0, 666)
    	if( p === 3 ) this.decor.addDeco()

    	let d = math.randInt(0, 100)
        if( d === 20 ){

        	this.diam.addDiam()

        }

    }

    catchDiam(){

    	root.scrore++
    	//this.hub.scrore.innerHTML = root.scrore

    }

    render( time = 0 ) {

    	requestAnimationFrame( this.render.bind(this) )

    	if( !this.timer.up( time ) ) return

    	//this.timer.up(time)

        this.fps.innerHTML = this.timer.fps

        this.doResize()

    	let delta = this.timer.delta


    	this.env.move()

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

