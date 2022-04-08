import * as THREE from 'three'
import * as TWEEN from 'tween'

import { root } from '../root.js'
import { pool } from './pool.js'
import { math } from './math.js'
import { mergeBufferGeometries } from '../jsm/utils/BufferGeometryUtils.js'

export class Diamond extends THREE.Group {

    constructor() {

        super()

        this.max = 50
        this.ti = 1

        this.matrixAutoUpdate = false;

        this.t = []
        this.l = []

        this.hideMatrix = new THREE.Matrix4()


        this.meshs = {}

        const self = this
        pool.getModel('diam').traverse( function ( child ) {

            if ( child.isMesh ) self.meshs[ child.name ] = child

        })

        this.ready()
        //this.load()

    }

    ready(){

        let map = new THREE.Texture( pool.getImage('diam') ); 
        this.upmap(map)

        //let map = new THREE.TextureLoader().load('./assets/textures/diam.png', this.upmap.bind(this) )

        this.mat2 = new THREE.MeshStandardMaterial({ 

            map:map, 
            metalness:1, roughness:0.0, 
            transparent:true, opacity:root.alpha,
            side:THREE.FrontSide,//DoubleSide,
            envMap:root.env.dimondEnv

        })

        this.mat = new THREE.MeshStandardMaterial({ 

            metalness:1, roughness:0.0, 
            side:THREE.BackSide

        })

        /*this.mat3 = new THREE.MeshBasicMaterial({ 

            map:map,
            transparent:true, 
            blending:THREE.MultiplyBlending, toneMapped:false,
            premultipliedAlpha:true,
            alphaToCoverage:true,
            //side:THREE.FrontSide,
            
        })*/

        root.materials.push(this.mat)

        this.makeInstance() 

    }

    upmap (t){

        t.encoding = THREE.sRGBEncoding
        t.flipY = false
        t.needsUpdate = true

    }

    makeInstance() {

        this.meshs.diam.geometry.scale(14,14,14)
        this.meshs.diam2.geometry.scale(14,14,14)

        const g = this.meshs.diam.geometry.clone()
        const g2 = this.meshs.diam2.geometry.clone()
        //const g3 = this.meshs.shadow.geometry.clone()

        g.clearGroups();
        g2.clearGroups();
        //g3.clearGroups();
        g.addGroup( 0, Infinity, 0 );
        g2.addGroup( 0, Infinity, 1 );
        //g3.addGroup( 0, Infinity, 2 );

        const gg = new mergeBufferGeometries([ g, g2 ], true)

        const matrix = new THREE.Matrix4();
        this.mesh = new THREE.InstancedMesh( gg, [this.mat, this.mat2], 50 )
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
                this.t[j] = 1 - (n*0.01)//.006
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

            if( t<(0.1+0.006) && t>(0.1-0.006) && this.l[i] === root.line && !root.view.ring.jumping ){
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