import { 
	root, math, geo, mat
} from './root.js';
import {
    Group, Mesh, Vector3
} from '../../build/three.module.js';

import { Item } from './Item.js';
import { ExtraGroup } from './ExtraGroup.js';
import { SphereBox, CapsuleGeometry, ChamferCyl, ChamferBox  } from '../jsm/lth/GeometryExtent.js';
import { ConvexGeometry } from '../jsm/geometry/ConvexGeometry.js';

export class Body extends Item {

	constructor () {

		super();

		this.type = 'body';

	}

	step ( AR, N ) {

		let i = this.list.length, b, n;
		
		while( i-- ){

			b = this.list[i];

			n = N + ( i * 8 );

			b.sleep = AR[n] === 1 ? true : false;

			//if ( !b.sleep && b.children[0].material.name === 'sleep') b.children[0].material = mat.body;
		    //if ( b.sleep && b.children[0].material.name === 'body') b.children[0].material = mat.sleep;

		    if ( !b.sleep && b.material.name === 'sleep') b.material = mat.body;
		    if ( b.sleep && b.material.name === 'body') b.material = mat.sleep;
			
			b.position.fromArray( AR, n + 1 );
	        b.quaternion.fromArray( AR, n + 4 );

	        if( !b.auto ) b.updateMatrix();

	       // console.log( AR[n], AR[n+2] )

		}

	}

	///

	geometry ( o = {}, b, material ) {

		let g, i, n;
		let t = o.type, s = o.size;
		let noScale = false, custom = false;

		if( o.radius ){
			if( t === 'box' ) t = 'ChamferBox';
		    if( t === 'cylinder' ) t = 'ChamferCyl';
		}

		if( o.geometry ){
			if( t === 'convex' ) o.shape = o.geometry;
			else t = 'direct';
		} 

		switch( t ){

			case 'direct':

			    g = o.geometry.clone();
			    if( o.size ) g.scale( o.size[0], o.size[1], o.size[2] );
			    custom = true;
			    noScale = true

			break;

			case 'convex':

			if( o.v ){ 

				let vv = [];
				i = Math.floor( o.v.length/3 );
				while( i-- ){
					n = i*3;
					vv.push( new Vector3( o.v[n], o.v[n+1], o.v[n+2] ) )
				}

				g = new ConvexGeometry( vv );
				custom = true;
				noScale = true;
			}

			if( o.shape ){
				g = o.shape.clone();
				if( o.size ) g.scale( o.size[0], o.size[1], o.size[2] );
				o.v = g.attributes.position.array;
				custom = true;
				noScale = true;
			}

			break;

			/*case 'highSphere':
				g = new SphereBox( s[ 0 ] );
				custom = true;
				noScale = true;
				o.type = 'sphere';
			break;*/

			case 'capsule':
				g = new CapsuleGeometry( s[ 0 ], s[ 1 ], o.seg || 24 );
				custom = true;
				noScale = true;
			break;

			case 'ChamferBox':
				g = new ChamferBox( s[ 0 ], s[ 1 ], s[ 2 ], o.radius, o.seg || 24 );
				custom = true;
				noScale = true;
			break;

			case 'ChamferCyl':
				g = new ChamferCyl( s[ 0 ], s[ 0 ], s[ 1 ], o.radius, o.seg || 24 );
				custom = true;
				noScale = true;
			break;

			default:
			    g = geo[ t ];
			break;

		}

		if(t==='highSphere') o.type = 'sphere';

		//g.rotateZ( -Math.PI*0.5 );

		let m = new Mesh( g, material );

		if( o.localRot ) o.localQuat = math.toQuatArray( o.localRot );
		if( o.localPos ) m.position.fromArray( o.localPos );
		if( o.localQuat ) m.quaternion.fromArray( o.localQuat );

    	if( !noScale ) m.scale.fromArray( o.size );

    	if( custom ) root.tmpGeo.push( g );

    	// add or not add
    	if( !o.meshRemplace || o.debug ) b.add( m );

    	if(o.shape) delete ( o.shape );
    	if(o.geometry) delete ( o.geometry );

	}

	add ( o = {} ) {

		let name = this.setName( o );

		o.type = o.type === undefined ? 'box' : o.type;

		// position
		o.pos = o.pos === undefined ? [ 0, 0, 0 ] : o.pos;

		// rotation is in degree or Quaternion
	    o.quat = o.quat === undefined ? [ 0, 0, 0, 1 ] : o.quat;
	    if( o.rot !== undefined ){ o.quat = math.toQuatArray( o.rot ); delete ( o.rot ); }

	    //o.size = o.size == undefined ? [ 1, 1, 1 ] : math.correctSize( o.size );
	    o.size = math.autoSize( o );

	    let material;

	    if ( o.material !== undefined ) {
	    	if ( o.material.constructor === String ) material = mat[o.material];
	    	else material = o.material;
	    } else {
	    	material = mat[this.type];
	    }

	    if(o.material) delete ( o.material );

	    let b = new ExtraGroup();

	    switch( o.type ){

	    	case 'compound':

	    	    for ( var i = 0, n; i < o.shapes.length; i ++ ) {

					n = o.shapes[ i ];

					n.type = n.type === undefined ? 'box' : n.type;
					//n.size = n.size === undefined ? [ 1, 1, 1 ] : math.correctSize( n.size );
					n.size = math.autoSize( n );

					if( n.pos ) n.localPos = n.pos;
					if( n.rot !== undefined ){ n.quat = math.toQuatArray( n.rot ); delete ( n.rot ); }
					if( n.quat ) n.localQuat = n.quat;
					
					n.debug = o.debug || false;
					n.meshRemplace = o.meshRemplace;

					this.geometry( n, b, material );

				}

	    	break;
	    	default:

			    this.geometry( o, b, material );

			break;

	    }


	    b.name = name;
	    b.type = o.type;
	    b.size = o.size;
		b.shapetype = o.type;

		b.visible = o.visible !== undefined ? o.visible : true


	    //let m = new Mesh( geo[o.type], mat[this.type] );
	    //m.scale.fromArray( o.size );

	    //b.add( m );

	    b.receiveShadow = b.visible;
	    b.castShadow = b.visible;

		// apply option
		this.set( o, b );

		// add to world
		this.addToWorld( b );

		// add to worker 
		root.post( { m:'add', o:o } );

		return b;

	}

	set ( o = {}, b = null ) {

		if( b === null ) b = this.byName( o.name );
		if( b === null ) return;

		if(o.pos) b.position.fromArray( o.pos );
	    if(o.quat) b.quaternion.fromArray( o.quat );

	    b.auto = o.auto || false;

	    if( !b.auto ) {
	    	b.matrixAutoUpdate = false;
		    b.updateMatrix();
		}

	}

}