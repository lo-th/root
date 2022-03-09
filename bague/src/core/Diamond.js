import * as THREE from 'three';
import * as TWEEN from 'tween';

import { root } from '../root.js';

import { math } from './math.js';

import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';


export class Diamond extends THREE.Group {

    constructor() {

        super()

        this.max = 50

        this.isComplete = false;
        this.mapN = 0

        this.px = 0
        this.oldpx = 0

        this.ti = 1


        this.oldKey = [0,0]

        this.matrixAutoUpdate = false;

        this.radius = 1
        this.perimetre = 2 * Math.PI * this.radius

        this.v = new THREE.Vector3();

        this.dummy = new THREE.Object3D()

        this.meshs = {}
        this.load()

    }

    load() {

        let name = 'diam'
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

        let map = new THREE.TextureLoader().load('./assets/textures/diam.png', this.upmap.bind(this) )

        this.mat = new THREE.MeshStandardMaterial({ 
            map:map, 
            metalness:1, roughness:0.05, 
            transparent:true,opacity:0.7,
            side:THREE.DoubleSide
        })

        this.makeInstance() 

    }

    upmap (t){
        this.mapN ++ 
        t.encoding = THREE.sRGBEncoding;
        t.flipY = false;
    }

    makeInstance() {

        this.meshs.diam.geometry.scale(14,14,14)

        const matrix = new THREE.Matrix4();
        const matrix2 = new THREE.Matrix4();
        this.mesh = new THREE.InstancedMesh( this.meshs.diam.geometry, this.mat, 50 )
        this.mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage )
        let angle = (Math.PI*2) / 28

        for ( let i = 0; i < this.max; i ++ ) {

            //matrix2.makeTranslation( i*2,0,0 )
            //matrix.makeRotationY( angle * i ).premultiply(matrix2)
            this.mesh.setMatrixAt( i, matrix )

        }

        this.add( this.mesh )

    }

    move( delta ){

        if( !this.mesh ) return


        this.ti -= (root.speed * delta) * 0.05
        if(this.ti<0) this.ti = 1

        let i = this.max, p, t, q, s = 1/100, tt, x = 0

        while(i--){
            

            tt = this.ti - (i*s)

            if(tt < 0) tt = 0

            //console.log(tt)

            p = root.track.getPointAt(tt)
            t = root.track.getTangentAt(tt)
            q = root.track.getQuat(tt)

            x = 0
            if (i<10) x = -1.8
            else if (i>this.max-10) x = 1.8

            this.dummy.position.set( x, 0, 0 ).applyQuaternion( q ).add( p )
            //this.dummy.lookAt( this.v.copy( p ).sub( t ) );

            this.dummy.rotation.y += 0.0005
            this.dummy.updateMatrix()

            this.mesh.setMatrixAt( i, this.dummy.matrix );

        }


       this.mesh.instanceMatrix.needsUpdate = true;



       /* if( !this.ring ) return

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

        this.updateMatrix()*/

    }

}