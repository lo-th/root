import * as THREE from 'three';
import * as TWEEN from 'tween';

import { root } from '../root.js';

import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';


export class Ring extends THREE.Group {

    constructor() {

        super()


        this.radius = 1
        this.perimetre = 2 * Math.PI * this.radius


        //this.debug()

        this.meshs = {}
        this.load()

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

        let map = new THREE.TextureLoader().load('./assets/textures/bague.jpg', this.upmap )
        let mapr = new THREE.TextureLoader().load('./assets/textures/bague_r.jpg' )
        let mapm = new THREE.TextureLoader().load('./assets/textures/bague_m.jpg' )

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

    upmap (t){
        t.encoding = THREE.sRGBEncoding;
        t.flipY = false;
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

        let s = 0.088
        this.ring.scale.set(s,s,s)

        this.ring.position.y = this.radius

        this.ring.material = this.mat
        this.ring.castShadow = true
        this.ring.receiveShadow = true

        this.ring.add( mesh28 )
        this.ring.add( diam28 )
        this.ring.add( mesh42 )
        this.ring.add( diam42 )
        this.add( this.ring )

    }

    /*makeMerge() {

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

    }*/

    move( delta ){

        if(!this.ring) return

        let p = root.track.getPointAt( 0.1 )
        let q = root.track.getQuat(0.1)

        this.position.copy( p )
        this.quaternion.copy( q )

       // this.position.copy(root.track.getPointAt(0.1))
       // this.position.copy(root.track.getPointAt(0.1))

        this.ring.rotation.x += root.speed * delta///(this.perimetre/(Math.PI*2))



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