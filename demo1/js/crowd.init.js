/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_|
*    @author lo.th / http://lo-th.github.io/labs/
*    CROWD worker launcher
*/
var Gr;
var Maxi = 100;
var GrMax = Maxi * 5;


var crowd = ( function () {

    'use strict';

    var worker, blob;
    var callback, upCallback;
    var isBuffer = false;

    var timestep = 1/60;
    var timerate = timestep * 1000;

    var time = 0;
    var then = 0;
    var delta = 0;
    var temp = 0;
    var count = 0;
    var fps = 0;


    var stepNext = false;
    var timer = undefined;

    // transfer array
    //var ar = new Float32Array( 100 * 5 );

    crowd = {

        init: function ( Callback, UpCallback ){


            callback = Callback || function(){};
            upCallback = UpCallback || function(){};

            worker = new Worker( './js/crowd.worker.js' );
            worker.onmessage = this.message;
            worker.postMessage = worker.webkitPostMessage || worker.postMessage;


            blob = document.location.href.replace(/\/[^/]*$/,"/") + "./build/crowd.js";

            // test transferrables
            var ab = new ArrayBuffer(1);
            worker.postMessage( ab, [ab] );
            isBuffer = ab.byteLength ? false : true;
            
            worker.postMessage( { m: 'init', blob:blob, isBuffer:isBuffer, timestep:timestep, iteration:10, Maxi:Maxi });

        },

        message: function ( e ) {

            var data = e.data;
            if( data.Gr ) Gr = data.Gr;

            switch( data.m ){
                case 'init': crowd.initEngine(); break;
                case 'start': crowd.start( data ); break;
                case 'step': crowd.step(); break;
            }

        },

        initEngine: function () {

            window.URL.revokeObjectURL( blob );
            blob = null;

            console.log( "CROWD worker init with Buffer: " + isBuffer );
            
            callback();

        },

        start: function () {

            stepNext = true;

            // create tranfere array if buffer
            if( isBuffer ) Gr = new Float32Array( GrMax );

            if ( !timer ) timer = requestAnimationFrame( crowd.sendData );


           
        },


        step: function () {

            if ( (time - 1000) > temp ){ temp = time; fps = count; count = 0; }; count++;

            upCallback();

            stepNext = true;
            
        },

        sendData: function ( stamp ){

            timer = requestAnimationFrame( crowd.sendData );
            time = stamp === undefined ? now() : stamp;
            delta = time - then;

            if ( delta > timerate ) {

                then = time - ( delta % timerate );

                if( stepNext ){
                    if( isBuffer ) worker.postMessage( { m:'step', Gr:Gr }, [ Gr.buffer ] );
                    else worker.postMessage( { m:'step' } );
                    stepNext = false;
                }

                tell( 'three '+ view.getFps() + ' | crowd ' + fps );

            }

        },

        send: function ( m, o ) {

            if( m === 'set' ){ 
                o = o || {};
                if( o.fps !== undefined ) o.timeStep = 1/o.fps;
                timerate = o.timeStep == undefined ? 0.016 * 1000 : o.timeStep * 1000;
            }

            worker.postMessage( { m:m, o:o });

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

    return crowd;

})();