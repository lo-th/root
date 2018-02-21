/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_|
*    @author lo.th / http://lo-th.github.io/labs/
*    @author Engine Samuel Girardin / http://www.visualiser.fr/
*
*    CROWD worker launcher
*/

var Gr;
var Maxi = 6000;
var GrMax = Maxi * 5;

var crowd = ( function () {

    'use strict';

    var worker, blob;
    var callback;
    var isBuffer = false;

    var timestep = 1/60;
    var timerate = timestep * 1000;

    var time = 0;
    var then = 0;
    var delta = 0;
    var temp = 0;
    var count = 0;
    var fps = 0;

    var R;

    var stop = true;


    var stepNext = false;
    var timer = undefined;

    crowd = {

        onUpdate: function () {},

        init: function ( Callback, max ){

            Maxi = max || 1000;
            GrMax = Maxi * 5;


            callback = Callback || function(){};

            worker = new Worker( './js/crowd.worker.js' );
            worker.onmessage = this.message;
            worker.postMessage = worker.webkitPostMessage || worker.postMessage;


            blob = document.location.href.replace(/\/[^/]*$/,"/") + "./build/Crowd.js";

            // test transferrables
           /* var ab = new ArrayBuffer(1);
            worker.postMessage( ab, [ab] );
            isBuffer = ab.byteLength ? false : true;*/
            
            worker.postMessage( { m: 'init', blob:blob, isBuffer:isBuffer, forceStep:0.3, Maxi:Maxi });

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
            //stop = false;

            // create tranfere array if buffer
            if( isBuffer ) Gr = new Float32Array( GrMax );

            if ( !timer ) timer = requestAnimationFrame( crowd.sendData );

        },


        step: function () {

            //if ( (time - 1000) > temp ){ temp = time; fps = count; count = 0; }; count++;

            //R = new Float32Array( Gr );
            //this.onUpdate( R );
            view.isNeedUpdate = true;

            stepNext = true;
            
        },

        sendData: function ( stamp ){

            //if(stop) return;

            timer = requestAnimationFrame( crowd.sendData );

            time = stamp;
            delta = time - then;

            if ( delta > timerate ) {

                then = time - ( delta % timerate );

                if( stepNext ){

                    if ( (time - 1000) > temp ){ temp = time; fps = count; count = 0; }; count++;
                    tell( 'three '+ view.fps + ' | crowd ' + fps );

                    if( isBuffer ) worker.postMessage( { m:'step', Gr:Gr }, [ Gr.buffer ] );
                    else worker.postMessage( { m:'step' } );
                    stepNext = false;


                }

            }

            
        },

        send: function ( m, o ) {

            if( m === 'set' ){ 
                o = o || {};
                if( o.fps !== undefined ) o.timeStep = 1/o.fps;
                timerate = o.timeStep === undefined ? 0.016 * 1000 : o.timeStep * 1000;
            }

            worker.postMessage( { m:m, o:o });

        },

        reset: function( full ) {

            //stop = true;

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