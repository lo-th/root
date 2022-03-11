import * as THREE from 'three';

import { root } from '../root.js';
import { math } from './math.js';


export class Camera extends THREE.PerspectiveCamera {

    constructor( fov = 50, aspect = 1, near = 0.1, far = 2000 ) {

        super( fov, aspect, near, far  )

        //this.pos = new THREE.Vector3(0,6,-7)
        //this.target = new THREE.Vector3(0,2,0)
        this.fov = 60
        this.zoom = 0.6

        this.pos = new THREE.Vector3(0,5,-5)
        this.target = new THREE.Vector3(0,3,-1)
        this.v0 = new THREE.Vector3()
        this.v = new THREE.Vector3()

        //this.helper = new THREE.CameraHelper( this );

    }

    up(){
        this.updateProjectionMatrix()
    }

    move( delta ){
        
        let p = root.track.getPointAt( 0.1 )
        let t = root.track.getTangentAt( 0.1 )
        let q = root.track.getQuat( 0.1 )

        this.v0.copy( this.pos ).applyQuaternion( q ).add( p )


        //this.position.copy(this.v0)

        this.position.lerp( this.v0, root.tracking )

        this.lookAt( this.v.copy( this.target ).add( p ).sub( t ) )

        //this.helper.update();

    }

}