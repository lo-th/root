
import {
    Group, MeshStandardMaterial, MeshBasicMaterial
} from '../../build/three.module.js';

import { root, math, mat } from './root.js';

import { Body } from './Body.js';
import { Solid } from './Solid.js';
import { Joint } from './Joint.js';

//import { engine } from '../oimo/engine.js';

let callback = null;
let Ar, ArPos = {}, ArMax = 0;

let worker = null;
let isWorker = false;
let isBuffer = false;


let directMessage = null;

const body = new Body();
const solid = new Solid();
const joint = new Joint();

let stat = {};



//let update = null;

//--------------
//  THREE SIDE 
//--------------

export class Motor {


	static message ( m ){

		let e = m.data;

		if( e.Ar ) Ar = e.Ar;
		if( e.stat ) stat = stat;
		Motor[ e.m ]( e.o );

	}

	static post ( e, buffer ){

		if( isWorker ) worker.postMessage( e, buffer );
		else directMessage( { data : e } );

	}

	static makeView () {

	}

	static setScene ( scene = new Group() ) { root.scene = scene; }
	static getScene ( scene ) { return root.scene; }

	static getMat () { return mat; }


	static init ( o = {} ){

		if(o.callback){ 
			callback = o.callback;
			delete ( o.callback );
		}

		Motor.initArray();

		o.ArPos = ArPos;
		o.ArMax = ArMax;


		Motor.setScene( o.scene );

		//root.scene = o.scene || new Group();
		root.post = Motor.post;

		if( !o.direct ){ // is worker version

			o.callback = null;

			worker = new Worker( './build/Oimo.min.js' );
			//worker = new SharedWorker( engine, { type: 'module' });
			//worker = navigator.serviceWorker.register('./oimo/engine.js', { type: 'module' });

			worker.postMessage = worker.webkitPostMessage || worker.postMessage;
			worker.onmessage = Motor.message;

			let ab = new ArrayBuffer( 1 );
			worker.postMessage( { m: 'test', ab: ab }, [ ab ] );
			isBuffer = ab.byteLength ? false : true;

			o.isBuffer = isBuffer;
			console.log( 'Worker Shared Buffer is', o.isBuffer ? 'enable' : 'disable' );

			isWorker = true;

		} else { // is direct version

			directMessage = o.direct;
			o.returnMessage = Motor.message;
			console.log( 'is direct' );

		}

		Motor.post({ m:'init', o:o });

	}

	static pause (){

		Motor.post({ m:'pause' });

	}

	static reset (){

		root.flow.tmp = [];
		root.flow.ray = [];
		root.flow.key = [];

		body.reset();
		solid.reset();
		joint.reset();

		// clear temporary geometry
		for( let i in root.tmpGeo ) root.tmpGeo[i].dispose()
		root.tmpGeo = [];

	    // clear temporary material
	    let name;
		for( let i in root.tmpMat ){ 
			name = root.tmpMat[i];
			if( mat[name] ){
				mat[name].dispose();
				delete ( mat[name] )
			} 
			
		}
		root.tmpMat = [];

		Motor.post({ m:'reset' });

	}

	static ready (){

		console.log( 'Motor is ready !!' )
		if( callback ) callback();

	}

	static start ( o = {} ){

		Motor.post({ m:'start', o:o });

	}

	static set ( o = {} ){

		Motor.post({ m:'set', o:o });

	}

	static step ( o ){

		Motor.stepItems();

		// finally post flow change to physx
		if( isBuffer ) root.post( { m:'poststep', flow:root.flow, Ar:Ar }, [ Ar.buffer ] );
		else root.post( { m:'poststep', flow:root.flow })

	}

	static stepItems () {

		body.step( Ar, ArPos.body );
		joint.step( Ar, ArPos.joint );

	}

	static update ( list ) {

		flow.tmp.push( ...list )

	}

	static initArray ( max = {} ) {

		let counts = {
			body: ( max.body || 2000 ) * 8,
            joint:( max.joint || 200 ) * 16
		};

        let prev = 0;

        for( let m in counts ){

            ArPos[m] = prev;
            ArMax += counts[m];
            prev += counts[m];

        }

	}

	static add ( o = {} ){

		let type = o.type || 'box', b;

		//if( o.mass !== undefined ) o.density = o.density;
		if( o.bounce !== undefined ) o.restitution = o.bounce;

		switch( type ){

			case 'joint':
			    b = joint.add( o );
			break;

			default: 
			    if ( !o.density && !o.kinematic ) b = solid.add( o );
			    else b = body.add( o ); 
			break;
			
		}

		return b;

	}

	static addMaterial ( o = {} ){

		let m = new MeshStandardMaterial( o );

		root.tmpMat.push( m.name );
		mat[ m.name ] = m;

		return m;

	}

	static byName ( name ){

		return Utils.byName( name );

	}

	// some math tools

	static rand ( low=0, high=1 ){ return math.rand( low, high ); }
	static randInt ( low=0, high=1 ){ return math.randInt( low, high ); }

	

}