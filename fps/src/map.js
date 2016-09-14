

var map = ( function () {
    
    'use strict';

    var hit = { f:0, b:0, r:0, l:0 };
    var content, canvas, ctx, base_img;
    var maskCanvas, mask_ctx, mask_img;

    var pixel = [ 
        22, 23, 24, 25, 36, 37, 42, 43,// front
        66, 82, 97, 113, 129, 145, 162, 178,// right
        77, 93, 110, 126, 142, 158, 173, 189,// left
        212, 213, 218, 219, 230, 231, 232, 233,// back
        //51, 60, 195, 204,// corner
        //119, 120, 135, 136 // center
    ];

    var pixelRev = [ 
        230, 231, 232, 233, 212, 213, 218, 219,// front
        178,162,145,129, 113,97,82,66,// right
        189,173,158,142, 126, 110, 93, 77,// left
        36, 37, 42, 43, 22, 23, 24, 25,// back 
        //195, 204, 51, 60,// corner
        //135, 136, 119, 120 // center
    ];

    /*var pixelP = [
       87, 88, 103, 104,
       117, 118, 119, 120, 121, 122,
       133, 134, 135, 136, 137, 138,
       168, 167, 152, 151
    ]*/

    var pixelP = [
       87, 88,
       102, 103, 104, 105,
       117, 118, 121, 122,
       133, 134, 137, 138,
       150, 151, 152, 153,
       168, 167,
    ];

    var py = 0;
    var meshs = [];

    var ar8 = typeof Uint8Array !== "undefined" ? Uint8Array : Array;

    map = {

        init: function () {

            content = document.createElement('div');
            content.style.cssText = 'position:absolute; top:10px; right:10px; width:66px; height:66px; border:1px solid #74818b;';
            document.body.appendChild( content );

            /*canvas = document.createElement('canvas');
            canvas.width = canvas.height = 64;
            ctx = canvas.getContext('2d');
            base_img = ctx.getImageData(0, 0, 64, 64);
*/
            maskCanvas = document.createElement('canvas');
            maskCanvas.width = maskCanvas.height = 16;
            mask_ctx = maskCanvas.getContext('2d');
            mask_img = mask_ctx.getImageData(0, 0, 16, 16);

            //this.smooth( ctx );
            //this.smooth( mask_ctx );

            // draw center
            var i = pixelP.length, a;
            while(i--){
                a = pixelP[i] * 4;
                mask_img.data[a+0] = 255;
                mask_img.data[a+1] = 255;
                mask_img.data[a+2] = 0;
                mask_img.data[a+3] = 255;
            }

            //canvas.style.cssText = 'position:absolute; top:0px; left:0px; -moz-transform: scale(1, -1); -webkit-transform: scale(1, -1); -o-transform: scale(1, -1); transform: scale(1, -1);';
            maskCanvas.style.cssText = 'position:absolute; top:24px; left:24px; -moz-transform: scale(4, 4); -webkit-transform: scale(4, 4); -o-transform: scale(4, 4); transform: scale(4, 4);';
            
            //content.appendChild( canvas );
            content.appendChild( maskCanvas );

        },

        draw: function ( zz ) {

            var i = zz.length * 0.25, n;
            var data = base_img.data;
            while(i--){

                n = i * 4;
                data[n] = zz[n];
                data[n+1] = zz[n+1];
                data[n+2] = zz[n+2];
                data[n+3] = 255;

            }

            ctx.putImageData( base_img, 0, 0 );

        },

        testHit: function ( zone ) {


            //    n       f
            //  w-|-e   l-|-r
            //    s       b

            hit = { f:0, b:0, r:0, l:0 };

            var data = mask_img.data;
            var d, red, blue, h = 0; 
            var i = pixel.length, a, b;

            while(i--){

                d = Math.floor( i * 0.125 );
                a = pixel[i] * 4;
                b = pixelRev[i] * 4;

                red = zone[ b ];
                blue = zone[ b + 2 ];

                /*if( d === 4 ){ // height

                    

                    if( red < 1 ) h -= blue;
                    else h += red; 

                    data[a] = red;
                    data[a+1] = red;
                    data[a+3] = red;


                } else { // side*/

                    if( red === 255 && blue === 0 ){

                        if( d === 0 ) hit.f ++;
                        if( d === 1 ) hit.l ++;
                        if( d === 2 ) hit.r ++;
                        if( d === 3 ) hit.b ++;
                        
                        data[a] = 255;
                        data[a+1] = 255;
                        data[a+3] = 255;

                    } else {

                        data[a+3] = 0;

                    }
                //}  
            }

            //py = ( h * 0.25 ) * 0.10;
            mask_ctx.putImageData( mask_img, 0, 0 );
            
        },

        smooth: function( ctx, s ){

            s = s || false;
            ctx.imageSmoothingEnabled = s;
            ctx.mozImageSmoothingEnabled = s;
            ctx.webkitImageSmoothingEnabled = s;
            ctx.msImageSmoothingEnabled = s;

        },
        
        // GET ---------------------

        getPY: function () { return py; },
        getHit : function () { return hit; },

    }

    return map;

})();


var deepShader = {
    
};