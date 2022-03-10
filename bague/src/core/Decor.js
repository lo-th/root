import * as THREE from 'three';
import * as TWEEN from 'tween';

import { root } from '../root.js';

import { math } from './math.js';

import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';


export class Decor extends THREE.Group {

    constructor() {

        super()

        this.matrixAutoUpdate = false;

        this.mat = new THREE.MeshStandardMaterial({ 
            metalness:1, roughness:0,
        })

        root.materials.push(this.mat)

        this.geo = {
            donut1: new THREE.TorusGeometry( 8, 2, 8, 32 ),
            donut2: new THREE.TorusGeometry( 6, 1, 8, 28, Math.PI * 1.5 ),
            donut3: new THREE.TorusGeometry( 6, 1.4, 8, 10, Math.PI * 0.5 ),
        }

        this.items = []

        //this.addItem()

    }

    addDeco(){

        let type = math.randInt(0,2), g

        if(type === 0) g = this.geo.donut1
        if(type === 1) g = this.geo.donut2
        if(type === 2) g = this.geo.donut3

        let m = new THREE.Mesh( g, this.mat )
        m.matrixAutoUpdate = false;
        m.userData = { t:1, rz: type !== 0 ? 0.5 : 0 }
        this.items.push( m )

        this.add(m)

    }

    removeItem( id ){

        this.remove(this.items[id])
        this.items.splice( id, 1 )
      
    }

    move( delta ){

        let trash = []

        let speed = ( root.speed * delta ) * root.speedInc

        let i = this.items.length, u, t

        while(i--){

            u = this.items[i]

            t = u.userData.t

            t -= speed
            if(t < 0) t = 0

            if( t !==0 ){ 
                if( u.userData.rz !== 0 ) u.userData.rz += 0.005
                u.matrix.copy( root.track.getMatrix( t, u.userData ))
            }
            else trash.push( i )
            u.userData.t = t
                
        }

        i = trash.length
        while(i--){
            this.removeItem( trash[i] )
        }

    }

}