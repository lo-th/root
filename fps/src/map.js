

var map = ( function () {
    
    'use strict';

    var is3d = false;
    var isDebug = true;

    var hit = { f:0, b:0, r:0, l:0 };
    var content, canvas, ctx, base_img;
    var maskCanvas, mask_ctx, mask_img;
    var mapCanvas, map_ctx, map_img;

    var testCanvas, test_ctx, test_img;

    var cam, camera, scene, renderer, plane, texture;

    var po, pp, pf, pr=0;

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

            canvas = document.createElement('canvas');
            canvas.width = canvas.height = 16;
            ctx = canvas.getContext('2d');
            base_img = ctx.getImageData(0, 0, 16, 16);

            maskCanvas = document.createElement('canvas');
            maskCanvas.width = maskCanvas.height = 16;
            mask_ctx = maskCanvas.getContext('2d');
            mask_img = mask_ctx.getImageData(0, 0, 16, 16);

            this.smooth( ctx );
            this.smooth( mask_ctx );

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
            canvas.style.cssText = 'position:absolute; top:24px; left:24px; -moz-transform: scale(4, 4); -webkit-transform: scale(4, 4); -o-transform: scale(4, 4); transform: scale(4, 4);';
            maskCanvas.style.cssText = 'position:absolute; top:24px; left:24px; -moz-transform: scale(4, 4); -webkit-transform: scale(4, 4); -o-transform: scale(4, 4); transform: scale(4, 4);';
            
            content.appendChild( canvas );
            content.appendChild( maskCanvas );


            this.init3d();

        },

        initTestCanvas: function () {

            testCanvas = document.createElement( 'canvas' );
            testCanvas.width = 512;
            testCanvas.height = 512;

            test_ctx = testCanvas.getContext( '2d' );
            //test_ctx.fillStyle = '#FFFF00';
            //test_ctx.fillRect( 0, 0, 512, 512 );

            testCanvas.style.cssText = 'position:absolute; bottom:-118px; left:-118px;  -moz-transform: scale(0.5, 0.5); -webkit-transform: scale(0.5, 0.5); -o-transform: scale(0.5, 0.5); transform: scale(0.5, 0.5);';
            document.body.appendChild( testCanvas );

            /*

            testCanvas = document.createElement( 'canvas' );
            testCanvas.width = 512;
            testCanvas.height = 512;

            test_ctx = testCanvas.getContext( '2d' );
            //test_ctx.fillStyle = '#FFFF00';
            //test_ctx.fillRect( 0, 0, 512, 512 );

            testCanvas.style.cssText = 'position:absolute; bottom:10px; left:10px; ';
            document.body.appendChild( testCanvas );*/

            //map_img = map_ctx.getImageData( 0, 0, 512, 512 );

        },

        drawTest: function() {

            //pf.x = (256 - 8) + (( pp.x - po.x ) * 16 );
            //pf.y = (256 - 8) - (( pp.y - po.y ) * 16 );*
            test_ctx.clearRect(0, 0, 512, 512);

            test_ctx.save();
            test_ctx.setTransform(1, 0, 0, 1, 0, 0);

            test_ctx.translate(pf.x+8, pf.y+8);
            test_ctx.rotate( pr );
            test_ctx.translate(-8, -8);

            test_ctx.beginPath();
            test_ctx.lineWidth="1";
            test_ctx.strokeStyle="yellow";
            test_ctx.rect(0,0,16,16);
            test_ctx.rect(7,8,2,8);
            test_ctx.stroke();



            //test_ctx.drawImage( mapCanvas, pf.x, pf.y, 16, 16, -8, -8, 16, 16 );
            test_ctx.restore();

        },

        

        init3d: function () {

            mapCanvas = document.createElement( 'canvas' );
            mapCanvas.width = 512;
            mapCanvas.height = 512;

            map_ctx = mapCanvas.getContext( '2d' );
            //map_ctx.fillStyle = '#FFFF00';
            //map_ctx.fillRect( 0, 0, 512, 512 );

            map_img = map_ctx.getImageData( 0, 0, 512, 512 );

            if(isDebug){
                mapCanvas.style.cssText = 'position:absolute; bottom:-118px; left:-118px; opacity:0.25; -moz-transform: scale(0.5, 0.5); -webkit-transform: scale(0.5, 0.5); -o-transform: scale(0.5, 0.5); transform: scale(0.5, 0.5);';
                document.body.appendChild( mapCanvas );

                map.initTestCanvas();
            }


            //

            //


            po = new THREE.Vector2(-1000, -1000);
            pp = new THREE.Vector2( 0 , 0 );
            pf = new THREE.Vector2( 0 , 0 );

            //

            if(is3d){

                scene = new THREE.Scene();

                cam = new THREE.Group();

                var w = 0.5;
                camera = new THREE.OrthographicCamera( -w , w , w , -w , 1, 5 );
                camera.position.set( 0, 3, 0 );
                camera.lookAt( new THREE.Vector3() );

                cam.add( camera );
                scene.add( cam );

                renderer = new THREE.CanvasRenderer( { canvas:canvas } );
                renderer.setClearColor( 0xff0000 );
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize( 16, 16 );
                //renderer.setSize( 64, 64 );

                var geometry = new THREE.PlaneGeometry( 32, 32, 1, 1 );
                geometry.rotateX( - Math.PI / 2 );
                //geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI * 0.5 ) )
                

                texture = new THREE.CanvasTexture( mapCanvas );
                var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5, side: THREE.BackSide } );

                //var material = new THREE.MeshBasicMaterial( { color: 0x00FF00, overdraw: 0.5 } );

                plane = new THREE.Mesh( geometry, material );
                scene.add( plane );

                plane.position.set(-1000, 0, -1000);

                plane.scale.set(1, 1, -1);

            }

            //this.render();

            //this.drawTest();

        },

        testDistance: function(){

            var x = po.x - pp.x;
            var y = po.y - pp.y;
            var d = Math.sqrt( x * x + y * y );

            var ll = view.checkNewLevel();

            if( d > 14 || ll ){

                po.copy( pp );

                if(is3d){
                    plane.position.x = po.x;
                    plane.position.z = po.y;
                }

                // take new map
                view.snapShoot();

            }

            //trace( d );

        },

        moveCamera: function ( v ) {

            pp.set( v.x, v.z );

            if( is3d ) cam.position.set(pp.x, 0, pp.y);


            map.testDistance();

            //map.drawTest();

        },

        rotateCamera: function ( r ) {

            pr = r;
            if( is3d ) cam.rotation.y = pr;

            if( isDebug ) map.drawTest();

            //map.drawTest();
        },

        drawLand: function ( data ) {

            var d = map_img.data;
            var lng = 512 * 512 * 4;

            var i = lng;
            while ( i-- ) {
                d[i] = data[i];
            }

            map_ctx.putImageData( map_img, 0, 0 );
            if( is3d ) texture.needsUpdate = true;
            //this.render();

        },

        render: function(){

            if( is3d ) renderer.render( scene, camera );
            else {

                pf.x = (256 - 8) + (( pp.x - po.x ) * 16 );
                pf.y = (256 - 8) - (( pp.y - po.y ) * 16 );

                //ctx.clearRect(0, 0, 16, 16);
                ctx.fillStyle = '#FF0000';
                ctx.fillRect( 0, 0, 16, 16 );

                ctx.save();
                ctx.setTransform(1, 0, 0, -1, 0, 16);
                ctx.translate(8, 8);
                ctx.rotate( -pr );

                ctx.drawImage( mapCanvas, pf.x, pf.y, 16, 16, -8, -8, 16, 16 );
                ctx.restore();

                if( isDebug ) map.drawTest();
            }
            //base_img = ctx.getImageData(0, 0, 16, 16);
            //console.log(base_img.data)

        },

     

        /*draw: function ( zz ) {

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

        },*/

        testHit: function () {

            map.render();
            //if(is3d) renderer.render( scene, camera );

            var zone = ctx.getImageData( 0, 0, 16, 16 ).data;


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
                //b = pixelRev[i] * 4;

                red = zone[ a ];
                blue = zone[ a + 2 ];

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