import {
    Object3D, Vector3,
} from '../../build/three.module.js';


export class ExtraGroup extends Object3D {

    constructor() {

	    super();

		this.type = 'ExtraGroup';

		this.shapetype = 'box';
		this.data = {};
		this._size = new Vector3();

		// only for high mesh
		this.mesh = null;

		// if object is link by joint
		this.linked = [];

		Object.defineProperty( this, 'size', {
		    get: function() { return this._size.toArray(); },
		    set: function( value ) { this._size.fromArray( value ); }
		});

		Object.defineProperty( this, 'material', {
		    get: function() { return this.children[0].material; },
		    set: function( value ) { this.children.forEach( function ( b ) { if( b.isMesh ) b.material = value; }); }
		});

		Object.defineProperty( this, 'receiveShadow', {
		    get: function() { return this.children[0].receiveShadow; },
		    set: function( value ) { this.children.forEach( function ( b ) {  if( b.isMesh ) b.receiveShadow = value; }); }
		});

		Object.defineProperty( this, 'castShadow', {
		    get: function() { return this.children[0].castShadow; },
		    set: function( value ) { this.children.forEach( function ( b ) {  if( b.isMesh ) b.castShadow = value; }); }
		});
	}


	select ( b ) {

    }


}

ExtraGroup.prototype.isGroup = true;