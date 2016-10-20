var user = ( function () {
    
    'use strict';

    var touches = [];
    var starts = [];
    var times = [];
    var elapseds = [];
    var distances = [];

    var isMouseDown = false;

    user = {

        init: function ( dom ) {

            dom.addEventListener( 'mousemove', user.mouseMove, false );
            dom.addEventListener( 'mousedown', user.mouseDown, false );
            dom.addEventListener( 'touchend', user.touchEnd, false );
            dom.addEventListener( 'touchstart', user.touchStart, {capture: true, passive: false} );
            dom.addEventListener( 'touchmove', user.touchMove, {capture: true, passive: false} );

        },

        time: function () {

            return new Date().getTime();

        },


        // mouse

        mouseDown: function ( e ) {

            e.preventDefault();
            starts = [{ pageX:e.clientX, pageY:e.clientY }];
            times[0] = user.time();
            isMouseDown = true;

        },

        mouseMove: function ( e ) {

            e.preventDefault();
            touches = [{ pageX:e.clientX, pageY:e.clientY }];

            distances[0] = { x : touches[0].pageX - starts[0].pageX, y : touches[0].pageY - starts[0].pageY };

            if( Math.abs( distances[0].x ) > Math.abs( distances[0].y ) ){ // horizontal movement

            } else { // vertical movement

            }

        },

        mouseUp: function ( e ) {

            if(!isMouseDown) return;

            elapseds[0] = user.time() - times[0];

            isMouseDown = false;

        },

        // touche

        touchStart: function ( e ) {

            e.preventDefault();
            starts = e.touches;

        },

        touchMove: function ( e ) {

            e.preventDefault();
            touches = e.touches;

        },

        

        touchEnd: function ( e ) {

            touches = [];

        },

    }

    return user;

})();