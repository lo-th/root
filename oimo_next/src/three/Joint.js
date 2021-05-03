import { 
	root, math, geo, mat
} from './root.js';
import { Item } from './Item.js';
import { ExtraJoint } from './ExtraJoint.js';
import {
    Matrix4, Quaternion, Vector3
} from '../../build/three.module.js';



export class Joint extends Item {

	constructor () {

		super();

		this.type = 'joint';

		this.mtx = new Matrix4();
		this.mtx2 = new Matrix4();

	}

	step ( AR, N ) {

		let i = this.list.length, j, n;
		
		while( i-- ){

			j = this.list[i];

			n = N + ( i * 16 );

			j.position.fromArray( AR, n );
			j.quaternion.fromArray( AR, n + 6 );

			j.m2.position.fromArray( AR, n+3 );
			j.m2.quaternion.fromArray( AR, n+10 );


			j.updateMatrix();
			j.m2.updateMatrix();

			//this.mtx2.compose( j.m2.position, j.m2.quaternion, {x:1,y:1,z:1} );
			this.mtx.copy( j.matrix ).invert().multiply( j.m2.matrix )
			this.mtx.decompose( j.m2.position, j.m2.quaternion, {x:1,y:1,z:1} );

			j.m2.updateMatrix();

		}

	}

	///

	add ( o = {} ) {

		let name = this.setName( o );

		let j = new ExtraJoint( geo.joint, mat.joint );



		// add to world
		this.addToWorld( j );

		// add to worker 
		root.post( { m:'add', o:o } );

		return j;

	}

	set ( o = {} ) {

	}

}