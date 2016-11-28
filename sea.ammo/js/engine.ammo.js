var ammo = ( function () {

    'use strict';

    var worker = null;
    var blob = null;
    var callbackInit = null, callback = null;
    var useTransferrable = false;

    // body transfer array
    var ar = new Float32Array( 1000 * 8 );

    ammo = {

        load: function ( CallbackInit, Callback ) {

            callbackInit = CallbackInit === undefined ? function(){} : CallbackInit;
            callback = Callback === undefined ? function(){} : Callback;

            var xml = new XMLHttpRequest();
            xml.responseType = 'arraybuffer';
            xml.onload = this.start;
            xml.open( 'GET', './js/worker/ammo.z', true );
            xml.send( null );

        },

        start: function ( e ) {

            var result = new TextDecoder("utf-8").decode( SEA3D.File.LZMAUncompress( e.target.response ) );
            blob = URL.createObjectURL( new Blob( [ result ], { type: 'application/javascript' } ) );

            worker = new Worker( './js/worker/worker.ammo.js' );
            worker.onmessage = ammo.onmessage;
            worker.postMessage = worker.webkitPostMessage || worker.postMessage;

            ammo.post( { message: 'init', blob: blob } );

        },

        add: function ( o ) {

            o.message = 'add';
            worker.postMessage( o );

        },

        post: function ( o, buffer ) {

            if( useTransferrable ) worker.postMessage( o, buffer );
            else worker.postMessage( o );

        },

        onmessage: function ( e ) {

            var data = e.data;

            switch( data.message ){
                case 'init':
                    URL.revokeObjectURL( blob );
                    callbackInit( 'ammo init' );
                    if( useTransferrable ) ammo.post( { message: 'start', useTransferrable: true, ar: ar }, [ ar.buffer ] );
                    else ammo.post( { message: 'start', useTransferrable: false, ar: ar } );
                break;
                case 'run':
                    ar = data.ar;
                    callback( ar );
                    if( useTransferrable ) crowd.post( { message: 'run', ar: ar }, [ ar.buffer ] );
                break;
            }

        }

    }

    

    return ammo;

})();