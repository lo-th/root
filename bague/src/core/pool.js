import * as THREE from 'three';

import { root } from '../root.js';

import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';

let inLoad = false

const tmp = [];
const imgs = {}
const sounds = {}
const models = {}

export class pool {

	static load ( Urls, Callback ) {

		let urls = []
		let callback = Callback || function(){}
		let start = ( typeof performance === 'undefined' ? Date : performance ).now()

        if ( typeof Urls === 'string' || Urls instanceof String ) urls.push( Urls )
        else urls = urls.concat( Urls )

        tmp.push( { urls:urls, callback:callback, start:start } );

        if( !inLoad ) pool.loadOne();

	}

	static loadOne () {

		inLoad = true

		let url = tmp[0].urls[0]
        let name = url.substring( url.lastIndexOf('/')+1, url.lastIndexOf('.') )
        let type = url.substring( url.lastIndexOf('.')+1 ).toLowerCase()

        if( pool.exist( name, type ) ) pool.next()
        else pool.loading( url, name, type )

	}

	static exist ( name, type ) {

		switch( type ){

			case 'mp3': case 'wav': case 'ogg': sounds[ name ] ? true : false;  break;
			case 'jpg': case 'png': imgs[ name ] ? true : false;  break;
			case 'glb': models[ name ] ? true : false;  break;

		}

		return false;

	}

	static loading ( url, name, type ) {

		switch( type ){

			case 'glb': pool.loadModel( root.path + 'models/'+ url, name );  break;
			case 'jpg': case 'png': pool.loadImage( root.path + 'textures/'+ url, name );  break;
			case 'mp3': case 'wav': case 'ogg': pool.loadSound( root.path + 'sounds/'+ url, name );  break;

		}

	}

	static next () {

		tmp[0].urls.shift();

		if( tmp[0].urls.length === 0 ){

			let end = Math.floor(( typeof performance === 'undefined' ? Date : performance ).now() - tmp[0].start);

			tmp[0].callback();

            tmp.shift();

            if( tmp.length > 0 ) pool.loadOne();
            else inLoad = false;

        } else {

            pool.loadOne();

        }

	}

	// GET

	static getImage( name ) {
	
		return imgs[name] || null;
	
	}

	static getModel( name ) {
	
		return models[name] || null;
	
	}

	// LOAD

	static loadImage( url, name ) {

    	let img = document.createElement("img")
    	img.onload = function(){ 

    		imgs[name] = img
    		pool.next()

    	}
    	img.src = url

    }

    static loadModel( url, name ) {

        const self = this
        const dracoLoader = new DRACOLoader().setDecoderPath( './src/libs/draco/' )
        const loader = new GLTFLoader().setPath( './assets/models/' )
        dracoLoader.setDecoderConfig( { type: 'wasm' } )
        loader.setDRACOLoader( dracoLoader )
        loader.load( name+'.glb', function ( glb ) {

        	models[name] = glb.scene
            pool.next()

        })

    }

    static loadSound ( url, name ) {

		const loader = new XMLHttpRequest();
		loader.open('GET', url, true );
		loader.responseType = "arraybuffer";

        loader.onreadystatechange = function () {

        	if ( loader.readyState === 4 ) {
                if ( loader.status === 200 || loader.status === 0 ) {

                	AudioContext.getContext().decodeAudioData(
	                    response.slice( 0 ),
	                    function( buffer ){ 
	                    	sounds[name] = buffer;
	                    	pool.next()
	                    },
	                    function( error ){ console.error('decodeAudioData error', error); }
	                )
                	
                }
                else console.error( "Couldn't load ["+ name + "] [" + loader.status + "]" );
            }

        }

        loader.send( null );

	}

	 /*static loadJson( url, callback ) {

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status >= 300) {
                    console.log("Error, status code = " + xhr.status)
                } else {
                    callback( JSON.parse(  xhr.responseText ) )
                }
            }
        }
        xhr.open('get', url, true)
        xhr.overrideMimeType("application/json");
        xhr.send();
       
    }*/

}