import * as THREE from 'three'
import * as TWEEN from 'tween'

import { root } from '../root.js'
import { pool } from './pool.js'
import { math } from './math.js'


export class Ring extends THREE.Group {

    constructor() {

        super()

        this.matrixAutoUpdate = false;
        this.isComplete = false;
        this.mapN = 0
        this.mapMax = 6

        this.jumping = false
        this.downing = false
        this.turning = false

        this.line = 1

        this.slowing = 1 


        this.radius = 1
        this.perimetre = 2 * Math.PI * this.radius

        this.ringtype = math.randInt( 1, 2 )

        this.meshs = {}

        const self = this
        pool.getModel('bague').traverse( function ( child ) {

            if ( child.isMesh ) self.meshs[ child.name ] = child

        })

        this.ready()

    }

    debug() {

        this.debugMesh = new THREE.Group()

        let ma = new THREE.MeshStandardMaterial({color:0xFF0000 })

        let g = new THREE.CylinderGeometry( this.radius, this.radius, 0.24, 14)
        g.rotateZ(Math.PI/2) 

        let g2 = new THREE.CylinderGeometry( this.radius*0.9, this.radius*0.9, 0.55, 14)
        g2.rotateZ(Math.PI/2) 

        //this.debugMesh.position.y = this.radius
        this.debugMesh.add( new THREE.Mesh( g, ma ) )
        this.debugMesh.add( new THREE.Mesh( g2, ma ) )

        //this.add( )

        return this.debugMesh 


    }

    ready(){

        let map_1 = new THREE.Texture( pool.getImage('bague_1') ); this.upmap(map_1)
        let map_2 = new THREE.Texture( pool.getImage('bague_2') ); this.upmap(map_2)
        let mapr = new THREE.Texture( pool.getImage('bague_r') ); this.upmap0(mapr)
        let mapm = new THREE.Texture( pool.getImage('bague_m') ); this.upmap0(mapm)
        this.mapS1 = new THREE.Texture( pool.getImage('shadow_1') ); this.upmap0(this.mapS1)
        this.mapS2 = new THREE.Texture( pool.getImage('shadow_2') ); this.upmap0(this.mapS2)

        this.mat = new THREE.MeshStandardMaterial({ 
            map:this.ringtype === 1 ? map_1 : map_2,
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
            map:this.ringtype === 1 ? map_1 : map_2, 
            metalness:1, roughness:0.01, 
            transparent:true, opacity:root.alpha,
            //depthTest: false,
            //depthWrite:false,
            envMap:root.env.dimondEnv
        })

        

        this.matS = new THREE.MeshBasicMaterial({ 
            map:this.mapS1, 
            transparent:true, 
            blending:THREE.MultiplyBlending, 
            toneMapped:false,  /*, color:0x000000, wireframe:true*/ 
        })


        root.materials.push(this.mat)
        root.materials.push(this.mat2)
        //root.materials.push(this.matS)

        this.makeInstance() 

    }

    upmap (t){

        t.encoding = THREE.sRGBEncoding;
        t.flipY = false;
        t.needsUpdate = true;

    }

    upmap0 (t){

        t.needsUpdate = true

    }


    makeInstance() {

       /* const matrix = new THREE.Matrix4();
        let mesh28 = new THREE.InstancedMesh( this.meshs.b_28.geometry, this.mat, 28 )
        let diam28 = new THREE.InstancedMesh( this.meshs.d_28.geometry, this.mat2, 28 )
        let angle = (Math.PI*2) / 28

        for ( let i = 0; i < 28; i ++ ) {

            matrix.makeRotationX( angle * i )
            mesh28.setMatrixAt( i, matrix )
            diam28.setMatrixAt( i, matrix )

        }

        let mesh42, diam42

        if( this.ringtype === 1 ){

            mesh42 = new THREE.InstancedMesh( this.meshs.b_42.geometry, this.mat, 42 )
            diam42 = new THREE.InstancedMesh( this.meshs.d_42.geometry, this.mat2, 42 )
            angle = (Math.PI*2) / 42

            for ( let i = 0; i < 42; i ++ ) {

                matrix.makeRotationX( angle * i )
                mesh42.setMatrixAt( i, matrix )
                diam42.setMatrixAt( i, matrix )

            }
        }*/

        this.gring = new THREE.Group()
        this.group = new THREE.Group()

        /*this.ring = this.ringtype === 1 ? this.meshs.ring_v1 : this.meshs.ring_v4*/
        this.shadow = this.meshs.shadow
        this.shadow.material = this.matS

        let s = 0.088
        //this.ring.scale.set(s,s,s)
        this.shadow.scale.set(s,s,s)

        
        this.shadow.position.y = 0.05

        /*this.ring.material = this.mat
        this.ring.castShadow = true
        this.ring.receiveShadow = true

        this.ring.add( mesh28 )
        this.ring.add( diam28 )

        if( this.ringtype === 1 ){
            this.ring.add( mesh42 )
            this.ring.add( diam42 )
        }*/

        this.ring = this.debug()

        this.gring.add( this.ring )
        this.gring.position.y = this.radius
        

        this.group.add( this.gring )
        this.group.add( this.shadow )

        this.add( this.group )
        //this.group.visible = false

        //this.ring.renderOrder = 150

        

    }

    right(){

        this.line++
        this.line = this.line > 2 ? 2 : this.line
        this.switchLine( this.line )

    }

    left(){

        this.line--
        this.line = this.line < 0 ? 0 : this.line
        this.switchLine( this.line )

    }

    switchLine( n ){

        if( !this.ring ) return
        if( this.turning ) return
        if( n === root.line ) return

        let time = 700 - (200*root.speed)

        this.turning = true

        this.group.rotation.y = 0

        let dir = n>root.line ? -1:1

        root.line = -1

        let x = root.getX(n)


        const t1 = new TWEEN.Tween( this.group.position )
            .to( { x:x }, time )
            .easing( TWEEN.Easing.Sinusoidal.InOut )
            .onComplete( function(){ 
                this.turning = false 
                root.line = n
            }.bind(this) )
            .start()


        const t2 = new TWEEN.Tween( this.group.rotation )
            .to( { y:(30*dir)* math.torad }, time*0.5 )
            .repeat(1)
            .yoyo(true)
            .easing( TWEEN.Easing.Sinusoidal.InOut )
            .start()

    }

    jump(){

        if( !this.ring ) return
        if( this.jumping ) return

        this.jumping = true

        let time = 1000 - (200*root.speed)

        const t1 = new TWEEN.Tween( this.ring.position )
            .to( { y:3 }, time*0.5 )
            .repeat(1)
            .yoyo(true)
            .easing( TWEEN.Easing.Quadratic.InOut )
            .onUpdate( function(o){ let s = 0.088 - (o.y*0.01);  this.shadow.scale.set(s,s,s); this.slowing = this.radius - (o.y*0.01);}.bind(this) )
            .onComplete( function(){ this.jumping = false }.bind(this) )
            .start()

    }

    down(){

        if( !this.ring ) return
        if( this.downing ) return

        this.downing = true
        this.matS.map = this.mapS2

        let time = 1000 - (200*root.speed)

        const t1 = new TWEEN.Tween( this.gring.rotation )
            .to( { z:90*math.torad }, time*0.5 )
            .repeat(1)
            .yoyo(true)
            .easing( TWEEN.Easing.Exponential.InOut )
            .start()

        const t2 = new TWEEN.Tween( this.gring.position )
            .to( { y:0.4 }, time*0.5 )
            .repeat(1)
            .yoyo(true)
            .easing( TWEEN.Easing.Exponential.InOut )
            .onUpdate( function(o){ 
                //let s1 = 0.088+((1-o.y)*0.088*2.3);
                let s = 0.088+((1-o.y)*0.088*1.6);
                this.shadow.scale.set(s,s,s); 
                this.slowing = this.radius - (o.y*0.01); 
            }.bind(this) )
            .onComplete( function(){ 
                this.matS.map = this.mapS1
                this.downing = false 
            }.bind(this) )
            .start()

    }

    move( delta ){

        if( !this.ring ) return

        //if( this.mapN===this.mapMax && !this.group.visible ) this.group.visible = true

        this.ring.rotation.x += root.speed * delta * this.slowing///(this.perimetre/(Math.PI*2))

        /*
        let p = root.track.getPointAt( 0.1 )
        let t = root.track.getTangentAt(0.1)
        let q = root.track.getQuat(0.1)

        this.position.set( 0, 0, 0 ).applyQuaternion( q ).add( p )
        this.lookAt( this.v.copy( p ).sub( t ) );
        this.updateMatrix()
        */

        this.matrix.copy( root.track.getMatrix( 0.1, { look:true }))

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