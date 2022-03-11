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

        this.ti = 1

        this.matrixAutoUpdate = false;

        this.t = []
        this.l = []

        this.hideMatrix = new THREE.Matrix4()


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
            transparent:true, opacity:0.7,
            side:THREE.DoubleSide
        })

        root.materials.push(this.mat)

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
        this.mesh = new THREE.InstancedMesh( this.meshs.diam.geometry, this.mat, 50 )
        this.mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage )
        let angle = (Math.PI*2) / 28

        let i = this.max

        while(i--){

            this.mesh.setMatrixAt( i, matrix )
            this.t[i] = 0
            this.l[i] = 0

        }

        this.add( this.mesh )

    }

    addDiam(){


        let line = math.randInt(0, 2), j, t
        let n = math.randInt(2, 5)

        while( n-- ){ 

            j = this.findFree()

            if( j !== -1 ){
                this.t[j] = 1 - (n*0.006)
                this.l[j] = line
            }

        }

    }

    findFree(){

        let j = this.max, n = -1
        while( j-- ){
            if(this.t[j] === 0){ 
                n = j
                break
            }
        }
        return n

    }

    move( delta ){

        if( !this.mesh ) return

        let speed = (root.speed * delta) * root.speedInc

        let i = this.max, p, q, s = 1/100, t, m, x = 0

        while(i--){

            t = this.t[i]

            t -= speed
            if(t <= 0) t = 0

            if( t<(0.1+0.006) && t>(0.1-0.006) && this.l[i] === root.line){
                t = 0
                root.view.catchDiam()
            }

            if(t!==0){

                x = root.getX( this.l[i] )
                m = root.track.getMatrix( t, { x:x, y:0.05, incRy:0.0005 })
                this.mesh.setMatrixAt( i, m );

            } else {
                this.mesh.setMatrixAt( i, this.hideMatrix )
            }
            this.t[i] = t

        }

        this.mesh.instanceMatrix.needsUpdate = true

    }

}