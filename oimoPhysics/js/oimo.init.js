
var maxBody = 1000;

var Ar;

var ArLng = [ 
    maxBody * 8,
];

var ArPos = [ 
    0, 
];

var ArMax = ArLng[0];

var oimo = ( function () {

    'use strict';

    var worker, callback, blob;
    var isBuffer = false;

    var timestep = 1/60;
    var timerate = timestep * 1000;

    var isWasm = true;
    var time = 0;
    var then = 0;
    var delta = 0;
    var temp = 0;
    var count = 0;
    var fps = 0;

    var stepNext = false;
    var timer = undefined;

    oimo = {

        init: function ( Callback ) {

            callback = Callback;
            
            worker = new Worker('./js/oimo.worker.js');
            worker.onmessage = this.message;
            worker.postMessage = worker.webkitPostMessage || worker.postMessage;

            blob = document.location.href.replace(/\/[^/]*$/,"/") + "./build/oimo.min.js";

            // test transferrables
            var ab = new ArrayBuffer(1);
            worker.postMessage( ab, [ab] );
            isBuffer = ab.byteLength ? false : true;

            worker.postMessage( { m:'init', blob:blob, isBuffer:isBuffer, settings:[ ArLng, ArPos, ArMax ] });
            
        },

        message: function( e ) {

            var data = e.data;
            if( data.Ar ) Ar = data.Ar;

            switch( data.m ){
                case 'initEngine': oimo.initEngine(); break;
                case 'start': oimo.start( data ); break;
                case 'step': oimo.step(); break;
                //case 'timerate': timerate = data.stepSize * 1000; break;
            }

        },

        initEngine: function () {

            window.URL.revokeObjectURL( blob );
         
            blob = null;

            console.log( "OimoPhysics 1.1.2 worker init with Buffer: " + isBuffer );

            if( callback ) callback();

        },

        start: function ( o ) {

            stepNext = true;

            // create tranfere array if buffer
            if( isBuffer ) Ar = new Float32Array( ArMax );
            if ( !timer ) timer = requestAnimationFrame( oimo.sendData );
           
        },

        step: function () {

            if ( (time - 1000) > temp ){ temp = time; fps = count; count = 0; }; count++;

            view.needUpdate( true );

            stepNext = true;
            
        },

        sendData: function ( stamp ){

            timer = requestAnimationFrame( oimo.sendData );
            time = stamp === undefined ? now() : stamp;
            delta = time - then;

            if ( delta > timerate ) {

                then = time - ( delta % timerate );

                if( stepNext ){
                    if( isBuffer ) worker.postMessage( { m:'step', Ar:Ar }, [ Ar.buffer ] );
                    else worker.postMessage( { m:'step' } );
                    stepNext = false;
                }

                editor.tell( 'three '+ view.getFps() +' | oimo ' + fps );

            }

        },

        send: function ( m, o ) {

            if( m === 'set' ){ 
                o = o || {};
                if( o.fps !== undefined ) o.stepSize = 1/o.fps;
                timerate = o.stepSize === undefined ? 0.016 * 1000 : o.stepSize * 1000;
            }
            worker.postMessage( { m:m, o:o } );

        },

        reset: function( full ) {

             if ( timer ) {
               window.cancelAnimationFrame( timer );
               timer = undefined;
            }
            
            view.reset();
            
            worker.postMessage( { m:'reset', full:full });

        }
    }

    return oimo;

})();