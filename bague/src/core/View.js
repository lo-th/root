import * as THREE from 'three';
import * as TWEEN from 'tween';

import { Timer } from './Timer.js';

import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';
import { RGBELoader } from '../jsm/loaders/RGBELoader.js';
import { EXRLoader } from '../jsm/loaders/EXRLoader.js';
import * as BufferGeometryUtils from '../jsm/utils/BufferGeometryUtils.js';

export class View {

    constructor() {

    	this.timer = new Timer()

    	this.useHDR = false

    	this.size = {}
    	this.resize()

    	this.b28 = null
    	this.b42 = null
    	this.ring = null

    	this.x28 = null
    	this.x42 = null

    	this.meshs = {}

    	const scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xAAAAAA )

    	const renderer = new THREE.WebGLRenderer( { antialias: true } )
		renderer.setPixelRatio( 1 )
		renderer.setSize( 1,1 )
		renderer.toneMapping = THREE.ACESFilmicToneMapping
		renderer.toneMappingExposure = 1
		renderer.outputEncoding = THREE.sRGBEncoding
		//renderer.shadowMap.enabled = true;

		document.body.appendChild( renderer.domElement )

		let camera = new THREE.PerspectiveCamera( 60, 1, 1, 2000 )
		camera.position.set( 0, 40, 0 )

		const controls = new OrbitControls( camera, renderer.domElement )
		controls.target.set( 0, 0, 0 )
		controls.update()

		/*const hemiLight = new THREE.HemisphereLight( 0x808080, 0xFFFFFF, 4 );
		hemiLight.position.set( 0, 1, 0 );
		scene.add( hemiLight )*/

		const light = new THREE.DirectionalLight( 0xFFFFFF, 2 );
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

		scene.add( new THREE.AmbientLight( 0x808080 ) );

		this.renderer = renderer
		this.scene =  scene
		this.camera =  camera
		this.controls = controls
		this.light = light


		this.fps = document.createElement( 'div' );
		this.fps.style.cssText =  "font-size:24px; font-family:Tahoma; position:absolute; top:3px; left:10px; width:100px; color:#000;  pointer-events:none;"
        document.body.appendChild( this.fps )



		window.addEventListener( 'resize', this.resize.bind(this) )

	

		if(!this.useHDR ){



			let envmap = new THREE.TextureLoader().load('./assets/textures/river.jpg', this.upmap2 )
			scene.environment = envmap;
			//scene.background = this.matcap;


			this.loadBague()
			this.render(0)

		} else {
			const self = this;

			new RGBELoader().setPath( './assets/textures/' )
				.load( 'river.hdr', function ( texture ) {
					texture.mapping = THREE.EquirectangularReflectionMapping;
					//scene.background = texture;
					scene.environment = texture;

					self.render(0)
					self.loadBague()
			})
		}

    }

    loadBague() {

    	let name = 'bague'
    	const self = this;
		const dracoLoader = new DRACOLoader().setDecoderPath( './src/libs/draco/' );
		const loader = new GLTFLoader().setPath( './assets/models/' );
		dracoLoader.setDecoderConfig( { type: 'wasm' } );
		loader.setDRACOLoader( dracoLoader );
		loader.load( name+'.glb', function ( glb ) {

			glb.scene.traverse( function ( child ) {

				if ( child.isMesh ) {

					self.meshs[ child.name ] = child



					/*if( child.name === 'b_28') self.b28 = child
					if( child.name === 'b_42') self.b42 = child

					if( child.name === 'ring') self.ring = child*/

					//if( child.name === 'x_28') self.x28 = child
					//if( child.name === 'x_42') self.x42 = child

				}

			})
			self.ready()

        })

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

	ready(){

		let map = new THREE.TextureLoader().load('./assets/textures/bague.jpg', this.upmap )
		let mapr = new THREE.TextureLoader().load('./assets/textures/bague_r.jpg' )
		let mapm = new THREE.TextureLoader().load('./assets/textures/bague_m.jpg' )

		/*this.mat = new THREE.MeshMatcapMaterial( {

			map:map,

			//color: new THREE.Color().setHex( API.color ).convertSRGBToLinear(),
			matcap: this.matcap,
			//normalMap: normalmap

			});
*/

        //this.mat = new THREE.MeshLambertMaterial({ 
		this.mat = new THREE.MeshStandardMaterial({ 
			map:map,
			roughnessMap:mapr,
			metalnessMap:mapm,
			metalness:1, roughness:1, //transparent:true,

			//alphaToCoverage:true,
			//envMap : this.matcap
			//side:THREE.DoubleSide,

		})

		this.mat2 = new THREE.MeshStandardMaterial({ 
			map:map, 
			metalness:1, roughness:0.05, 
			transparent:true,opacity:0.7
		})


		

		this.makeInstance()	
		//this.makeMerge()	

	}

	smoothNormal() {

		let a = this.x42.geometry.attributes.position
		let b = this.b42.geometry.attributes.position

		let an = this.x42.geometry.attributes.normal
		let bn = this.b42.geometry.attributes.normal

		let i = a.count, j, n, m

		while(i--){
			n = i*3
			j = b.count
			while(j--){
				m = j*3
				if(b.array[m] === a.array[n] && b.array[m+1] === a.array[n+1] && b.array[m+2] === a.array[n+2]){
					bn.array[m] = an.array[n]
					bn.array[m+1] = an.array[n+1]
					bn.array[m+2] = an.array[n+2]
				}
			}

		}


	}

	makeMerge() {

		let k, angle
		const geometries = []
		const geometries2 = []
		const matrix = new THREE.Matrix4()

		angle = (Math.PI*2) / 28

		for ( let i = 0; i < 28; i ++ ) {

			matrix.makeRotationX( angle * i )
			k = this.b28.geometry.clone()
			k.applyMatrix4( matrix )

			geometries.push( k );

		}

		angle = (Math.PI*2) / 42

		for ( let i = 0; i < 42; i ++ ) {

			matrix.makeRotationX( angle * i )
			k = this.b42.geometry.clone();
			k.applyMatrix4( matrix )
			geometries2.push( k );

		}

		let mergedGeometry = BufferGeometryUtils.mergeBufferGeometries( geometries )
		let geom = BufferGeometryUtils.mergeVertices( mergedGeometry, 0.01 )
		//geom.computeBoundingBox()
		//geom.computeVertexNormals();
		//geom.normalizeNormals()

		//console.log( mergedGeometry, geom )

		

		let mergedGeometry2 = BufferGeometryUtils.mergeBufferGeometries( geometries2 )
		let geom2 = BufferGeometryUtils.mergeVertices( mergedGeometry2, 0.01 )
		//geom2.computeBoundingBox()
		//geom2.computeVertexNormals();
		//geom2.normalizeNormals()



		this.mesh28 = new THREE.Mesh( geom, this.mat )
		this.mesh42 = new THREE.Mesh( geom2, this.mat )

		this.mesh28.castShadow = true
        this.mesh28.receiveShadow = true
		this.mesh42.castShadow = true
        this.mesh42.receiveShadow = true

        this.ring.material = this.mat
        this.ring.castShadow = true
        this.ring.receiveShadow = true

        this.scene.add( this.mesh28 )
		this.scene.add( this.mesh42 )
		this.scene.add( this.ring )

	}

	makeInstance() {

		const matrix = new THREE.Matrix4();
		let mesh28 = new THREE.InstancedMesh( this.meshs.b_28.geometry, this.mat, 28 )
		let diam28 = new THREE.InstancedMesh( this.meshs.d_28.geometry, this.mat2, 28 )
		let angle = (Math.PI*2) / 28

		for ( let i = 0; i < 28; i ++ ) {

			matrix.makeRotationX( angle * i )
			mesh28.setMatrixAt( i, matrix )
			diam28.setMatrixAt( i, matrix )

		}
		

		let mesh42 = new THREE.InstancedMesh( this.meshs.b_42.geometry, this.mat, 42 )
		let diam42 = new THREE.InstancedMesh( this.meshs.d_42.geometry, this.mat2, 42 )
		angle = (Math.PI*2) / 42

		for ( let i = 0; i < 42; i ++ ) {

			matrix.makeRotationX( angle * i )
			mesh42.setMatrixAt( i, matrix )
			diam42.setMatrixAt( i, matrix )

		}

		/*mesh28.castShadow = true
        mesh28.receiveShadow = true
		mesh42.castShadow = true
        mesh42.receiveShadow = true*/

        this.ring = this.meshs.ring

        this.ring.material = this.mat
        this.ring.castShadow = true
        this.ring.receiveShadow = true

        this.ring.add( mesh28 )
		this.ring.add( diam28 )
		this.ring.add( mesh42 )
		this.ring.add( diam42 )
		this.scene.add( this.ring )

		this.tween()

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

    	this.timer.up(time)

    	this.fps.innerHTML = this.timer.fps

    	let s = this.size

    	if(s.up){
    		s.up = false
    		this.renderer.setSize( s.w, s.h )
			this.camera.aspect = s.r
			this.camera.updateProjectionMatrix()
    	}

    	TWEEN.update()



    	this.renderer.render( this.scene, this.camera )

    }



}

