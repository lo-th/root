import * as THREE from 'three';
import * as TWEEN from 'tween';

import { root } from '../root.js';

import { math } from './math.js';

import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';


export class Ring extends THREE.Group {

    constructor() {

        super()

        this.isComplete = false;
        this.mapN = 0

        this.px = 0
        this.oldpx = 0

        this.jumping = false
        this.turning = false


        this.oldKey = [0,0]

        this.matrixAutoUpdate = false;

        this.radius = 1
        this.perimetre = 2 * Math.PI * this.radius

        this.v = new THREE.Vector3();

        this.meshs = {}
        this.load()

    }

    shadow() {

        let map = new THREE.TextureLoader().load('./assets/textures/shadow.jpg' )

        let m = new THREE.MeshBasicMaterial({ /*map:map, transparent:true,blending:THREE.MultiplyBlending, toneMapped:false,  /*, color:0x000000, wireframe:true*/ })

        let g = new THREE.PlaneGeometry( 3.5, 3.5, 2, 2 )
        g.rotateX(-Math.PI/2) 

        this.shadow = new THREE.Mesh( g, m )
        this.add( this.shadow )

        this.shadow.position.y =0.1
        //this.shadow.position.z =-0.5

        //this.shadow.renderOrder = 100

    }

    debug() {

        this.debugMesh = new THREE.Group()

        let ma = new THREE.MeshBasicMaterial({color:0x000000, wireframe:true })

        let g = new THREE.CylinderGeometry( this.radius, this.radius, 0.24, 14)
        g.rotateZ(Math.PI/2) 

        let g2 = new THREE.CylinderGeometry( this.radius*0.9, this.radius*0.9, 0.55, 14)
        g2.rotateZ(Math.PI/2) 

        this.debugMesh.position.y = this.radius
        this.debugMesh.add( new THREE.Mesh( g, ma ) )
        this.debugMesh.add( new THREE.Mesh( g2, ma ) )

        this.add( this.debugMesh )


    }

    load() {

        let name = 'bague'
        const self = this
        const dracoLoader = new DRACOLoader().setDecoderPath( './src/libs/draco/' )
        const loader = new GLTFLoader().setPath( './assets/models/' )
        dracoLoader.setDecoderConfig( { type: 'wasm' } )
        loader.setDRACOLoader( dracoLoader )
        loader.load( name+'.glb', function ( glb ) {

            glb.scene.traverse( function ( child ) {

                if ( child.isMesh ) self.meshs[ child.name ] = child

            })
            self.ready()

        })

    }

    ready(){

        let map = new THREE.TextureLoader().load('./assets/textures/bague.jpg', this.upmap.bind(this) )
        let mapr = new THREE.TextureLoader().load('./assets/textures/bague_r.jpg', this.upmap0.bind(this) )
        let mapm = new THREE.TextureLoader().load('./assets/textures/bague_m.jpg', this.upmap0.bind(this) )
        let mapS = new THREE.TextureLoader().load('./assets/textures/shadow.jpg', this.upmap0.bind(this) )

        this.mat = new THREE.MeshStandardMaterial({ 
            map:map,
            roughnessMap:mapr,
            metalnessMap:mapm,
            metalness:1, roughness:1, //transparent:true,
            //depthTest: false,
            //depthWrite:false,
            //alphaToCoverage:true,
            //envMap : this.matcap
            //side:THREE.DoubleSide,

        })

        this.mat2 = new THREE.MeshStandardMaterial({ 
            map:map, 
            metalness:1, roughness:0.05, 
            transparent:true,opacity:0.7,
            //depthTest: false,
            //depthWrite:false,
        })

        

        this.matS = new THREE.MeshBasicMaterial({ map:mapS, transparent:true,blending:THREE.MultiplyBlending, toneMapped:false,  /*, color:0x000000, wireframe:true*/ })

        this.makeInstance() 

    }

    upmap (t){
        this.mapN ++ 
        t.encoding = THREE.sRGBEncoding;
        t.flipY = false;
    }

    upmap0 (t){
        this.mapN ++
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

        this.group = new THREE.Group()

        /*mesh28.castShadow = true
        mesh28.receiveShadow = true
        mesh42.castShadow = true
        mesh42.receiveShadow = true*/

        this.ring = this.meshs.ring
        this.shadow = this.meshs.shadow
        this.shadow.material = this.matS


        let s = 0.088
        this.ring.scale.set(s,s,s)
        this.shadow.scale.set(s,s,s)

        this.ring.position.y = this.radius
        this.shadow.position.y = 0.05

        this.ring.material = this.mat
        this.ring.castShadow = true
        this.ring.receiveShadow = true

        this.ring.add( mesh28 )
        this.ring.add( diam28 )
        this.ring.add( mesh42 )
        this.ring.add( diam42 )
        //this.ring.add( shadow )
        this.group.add( this.ring )
        this.group.add( this.shadow )

        this.add( this.group )
        this.group.visible = false

        //this.ring.renderOrder = 150

    }

    changeLine( dir ){

        let time = 800 - (200*root.speed)

        this.turning = true

        this.group.rotation.y = 0


        let t = new TWEEN.Tween( this.group.position )
            .to( { x:this.px }, time )
            .easing( TWEEN.Easing.Sinusoidal.InOut )
            .onComplete( function(){ this.turning = false }.bind(this) )
            .start()


        let t2 = new TWEEN.Tween( this.group.rotation )
            .to( { y:(30*dir)* math.torad }, time*0.5 )
            .repeat(1)
            .yoyo(true)
            .easing( TWEEN.Easing.Sinusoidal.InOut )
            .start()

    }

    jump(){

        this.jumping = true

        let time = 1000 - (200*root.speed)

        let t2 = new TWEEN.Tween( this.ring.position )
            .to( { y:3 }, time*0.5 )
            .repeat(1)
            .yoyo(true)
            .easing( TWEEN.Easing.Quadratic.InOut )
            .onUpdate( function(o){ let s = 0.088 - (o.y*0.01);  this.shadow.scale.set(s,s,s); }.bind(this) )
            .onComplete( function(){ this.jumping = false }.bind(this) )
            .start()

    }

    move( delta ){

        if( !this.ring ) return

        if( this.mapN===4 && !this.group.visible ) this.group.visible = true


        let key = root.key

        // left / right

        if( key[0]!==0 && !this.turning ){

            if( this.oldKey[0] !== key[0] ){

                switch(this.px){
                    case 0: this.px = -key[0]*1.8; break;
                    case -1.8: if(key[0]<0) this.px = 0; break;
                    case 1.8: if(key[0]>0) this.px = 0; break;

                }

                if( this.oldpx !== this.px ) this.changeLine( -key[0] )
                this.oldpx = this.px

            }

        }

        // jump

        if( key[1]===-1 && this.oldKey[1] !== key[1] && !this.jumping ) this.jump()



        this.oldKey = [ key[0], key[1] ]



        this.ring.rotation.x += root.speed * delta///(this.perimetre/(Math.PI*2))

        let p = root.track.getPointAt( 0.1 )
        let t = root.track.getTangentAt(0.1)
        let q = root.track.getQuat(0.1)

        //this.group.position.x = this.px

        this.position.set( 0, 0, 0 ).applyQuaternion( q ).add( p )

        //this.position.copy( p )
        //this.quaternion.copy( q )

        this.lookAt( this.v.copy( p ).sub( t ) );

        this.updateMatrix()

    }

}


/*
Distance for a full circle = 2*Pi*R

Distance for a certain angle = ((2*Pi*R)/360)*angle .. R being distance(object.x,object.y,pivot.x,pivot.y) ... on the moment of collision.

Speed = distance / time

It must travel at 20 pixels / tick

So for 1 tick .. ((2*Pi*R)/360)*angle should be = 20

((2*Pi*R)/360)*angle = 20 ... how much angle to rotate per tick ? (R is known)

((2*Pi*R)/360) / 20 = 1/angle ... or angle = 20 / ((2*Pi*R)/360)

Hope this stands, not that big of a math brain. Dont forget to 'dt'.
*/