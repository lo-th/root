import {
	Mesh, BoxGeometry, Matrix4, Quaternion, Vector3,
    Object3D,  Line, Float32BufferAttribute
} from '../../build/three.module.js';


export class ExtraJoint extends Object3D {

	constructor( g, material = undefined ) {

	    super();

	    this.matrixAutoUpdate = false;

	    //let g = new BoxGeometry(0.2,0.2,0.2);

	    let m = new Mesh( g, material )
	    this.add(m)

	    this.m2 = new Mesh( g, material )
	    this.add( this.m2 );
	    this.m2.matrixAutoUpdate = false;

	}

	up () {
		this.updateMatrix();
		//this.mtx.copy( this.matrix ).invert().multiply( this.m2.matrix )
		//this.mtx.decompose( this.v, this.q, this.s );
	}

}

ExtraJoint.prototype.isJoint = true;