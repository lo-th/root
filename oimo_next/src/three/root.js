
import {
    SphereGeometry,
    PlaneGeometry,
    CylinderGeometry,
    BoxGeometry,
    Euler,
    Quaternion,
    MeshStandardMaterial,
    MeshBasicMaterial
} from '../../build/three.module.js';


export const map = new Map();

export const root = {

	scene : null,
	post : null,
	tmpGeo : [],
	tmpMat : [],
	flow:{
		ray:[],
		tmp:[],
		key:[],
	},

};


export class Utils {

	static byName ( name ) {

		if ( !map.has( name ) ) return null;
		return map.get( name );

	}

	static add ( b ) {

		switch( b.type ){
			default: root.scene.add( b ); break;
		}

		map.set( b.name, b );

	}

	static remove ( b ) {

		switch( b.type ){
			default: root.scene.remove( b ); break;
		}

		map.delete( b.name );

	}

}

export const geo = {

	plane: new PlaneGeometry(1,1),
	box: new BoxGeometry(1,1,1),
	sphere: new SphereGeometry( 1, 16, 12 ),
	cylinder: new CylinderGeometry( 1, 1, 1 , 16 ),
	cone: new CylinderGeometry( 0.001, 1, 1 , 16 ),
	highSphere: new SphereGeometry( 1, 32, 24 ),
	joint: new BoxGeometry(0.1,0.1,0.1),

}

geo.plane.rotateX( -Math.PI * 0.5 );


export const mat = {

	debug: new MeshBasicMaterial({ name:'debug', color:0xffFF00,  wireframe:true }),
	body: new MeshStandardMaterial({ name:'body', color:0xff8800 }),
	sleep: new MeshStandardMaterial({ name:'sleep', color:0x888888 }),
	solid: new MeshStandardMaterial({ name:'solid', color:0x0088ff }),
	joint: new MeshStandardMaterial({ name:'solid', color:0xFFFF00 }),

}


export const torad = Math.PI / 180;
export const todeg = 180 / Math.PI;

export const euler = new Euler();
export const quat = new Quaternion();

export class math {

	static int (x) { return Math.floor(x); }
	static lerp ( x, y, t ) { return ( 1 - t ) * x + t * y; }
	static rand ( low, high ) { return low + Math.random() * ( high - low ); }
	static randInt ( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); }

	static autoSize ( o = {} ) {

		let s = o.size === undefined ? [ 1, 1, 1 ] : o.size;
		if ( s.length === 1 ) s[ 1 ] = s[ 0 ];

		let type = o.type === undefined ? 'box' : o.type;
		let radius =  s[0];
		let height =  s[1];

		if( type === 'sphere' ) s = [ radius, radius, radius ];
		if( type === 'cylinder' || type === 'wheel' || type === 'capsule' ) s = [ radius, height, radius ];
		if( type === 'cone' || type === 'pyramid' ) s = [ radius, height, radius ];

	    if ( s.length === 2 ) s[ 2 ] = s[ 0 ];
	    return s;

	}

	static toQuatArray ( rot = [0,0,0] ) { // rotation array in degree

		return quat.setFromEuler( euler.fromArray( math.vectorad( rot ) ) ).toArray();

	}

	static vectorad ( r ) {

		let i = 3, nr = [];
	    while ( i -- ) nr[ i ] = r[ i ] * torad;
	    nr[3] = r[3];
	    return nr;

	}


}