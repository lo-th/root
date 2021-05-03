
import { Utils } from './root.js';

export class Item {

	constructor () {

		this.id = 0;
		this.list = [];
		this.type = 'item';

	}

	reset () {

		let i = this.list.length;
		while( i-- ) this.dispose( this.list[i] );

		this.id = 0;
		this.list = [];

	}

	dispose ( b ) {

		Utils.remove( b );

	}

	///

	byName ( name ) {

		return Utils.byName( name );

	}

	setName ( o = {} ) {

		let name = o.name !== undefined ? o.name : this.type + this.id ++;

		// clear old item if existe
		this.remove( name ); 

		return name;

	}

	addToWorld ( b ) {

		Utils.add( b );

		this.list.push( b );

	}

	remove ( name ) {

		let b = this.byName( name );
		if( !b ) return;

		let n = this.list.indexOf( b );

		if ( n === - 1 ) return;

		this.list.splice( n, 1 );
		this.dispose( b );

	}

	add ( o = {} ) { }

	set ( o = {} ) { }

	step ( AR, N ) { }

}