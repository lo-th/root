/**
 * @author lo.th / https://github.com/lo-th
 */


THREE.GLSLLoader = function GLSLLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.loader = new THREE.FileLoader( this.manager );
	this.loader.setResponseType('text');
	this.shader = {};

}

THREE.GLSLLoader.prototype = {

	constructor: THREE.GLSLLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		this.urls = [];
		if ( typeof url === 'string' || url instanceof String ) this.urls.push( url );
        else this.urls = this.urls.concat( url );

        this.onLoad = onLoad || function(){};
        this.onProgress = onProgress;
        this.onError = onError;

		this.loadOne();

	},

	loadOne: function () {

		var url = this.urls[0];
		var name = url.substring( url.lastIndexOf('/')+1, url.lastIndexOf('.') );

		var scope = this;

		//var loader = new THREE.FileLoader( scope.manager );
		this.loader.setPath( scope.path );
		this.loader.load( url, function ( text ) {

			scope.shader[ name ] = text;
			scope.next();

		}, scope.onProgress, scope.onError );

	},

	next: function () {

		this.urls.shift();

		if( this.urls.length === 0 ) this.onLoad();
		else this.loadOne();

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	},

};
