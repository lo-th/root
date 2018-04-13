var brf4 = ( function () {

    "use strict";

    var todeg = 57.295779513082320876;

    var isBlink = false;
    var blinkTimeOut = -1;

    
    var brfv4 = null;
    var brfManager = null;
    var resolution = null;
    var callback = null;

    var face = null;

    var debug = true;
    var info = '';

    var data = {
        lipContraction:0,
        mouthDist:0,
        lipDist:0,
        browL:0,
        browR:0,
        lidL:0,
        lidR:0,
    }

	brf4 = {

        v:[],
        o:[],

        position:{x:0,y:0},
        rotation:{x:0,y:0,z:0},
        scale:100,

        state:0,

        influences: {
        
            rightEyebrow:0, leftEyebrow:0, rightEyelid:0, leftEyelid:0, yawn:0, smile:0, lipSync:0,

        },

       init: function ( Callback ) {

            ///video = Webcam;
            callback = Callback || function(){}

            

            this.waitSDK();

        },

        reset: function (){

            brfManager.reset();

            this.position.x = resolution.width * 0.5;
            this.position.y = resolution.height * 0.5;

            this.rotation.x = 0;
            this.rotation.y = 0;
            this.rotation.z = 0;

            var i = 68;
            while(i--){
                this.v[i] = new V2();
                this.o[i] = new V2();
            }

        },

        waitSDK: function () {

            if(brfv4 === null) {
                brfv4 = { locateFile: function(fileName) { return "js/libs/brf_asmjs/"+fileName; } };
                initializeBRF( brfv4 );
            }

            if(brfv4.sdkReady) {
                brf4.initSDK();
            } else {
                setTimeout( brf4.waitSDK, 100);
            }

        },

        initSDK: function () {

            resolution = new brfv4.Rectangle(0, 0, video.setting.width, video.setting.height );
            brfManager = new brfv4.BRFManager();

            this.setConfig( 2 )

            brfManager.init( resolution, resolution, "com.lo-th");

            this.reset();


            callback();

        },

        setConfig: function ( n ) {

            brfManager.setNumFacesToTrack( 1 ) ;
            brfManager.setFaceDetectionRoi( resolution );
            brfManager.setMode( brfv4.BRFMode.FACE_TRACKING );

            var max = resolution.width < resolution.height ? resolution.width : resolution.height;

            switch(n){
                case 0:
                brfManager.setFaceDetectionParams(max * 0.1, max, 12, 4);
                brfManager.setFaceTrackingStartParams(.1 * max, max, 90, 90, 90);
                brfManager.setFaceTrackingResetParams(.1 * max, max, 90, 90, 90);
                break;
                case 1:// less strict
                brfManager.setFaceDetectionParams(       max * 0.20, max * 1.00, 12, 8);
                brfManager.setFaceTrackingStartParams(   max * 0.20, max * 1.00, 32, 46, 32);
                brfManager.setFaceTrackingResetParams(   max * 0.15, max * 1.00, 40, 55, 32)
                break;
                case 2:// more strict
                brfManager.setFaceDetectionParams(        max * 0.30, max * 1.00, 12, 8);
                brfManager.setFaceTrackingStartParams(    max * 0.30, max * 1.00, 22, 26, 22);
                brfManager.setFaceTrackingResetParams(    max * 0.25, max * 1.00, 40, 55, 32);
                break;
                case 3:// stinkmoji.cool
                brfManager.setFaceDetectionParams(        max * 0.20, max * 1.00, 12, 8);
                brfManager.setFaceTrackingStartParams(    max * 0.20, max * 1.00, 90, 90, 90);
                brfManager.setFaceTrackingResetParams(    max * 0.15, max * 1.00, 90, 90, 90);
                break;

            }

        },

        update: function() {

            var img = video.getImage();
            if( img === null ) return;

            brfManager.update( img );


            var state = 0;

            face = brfManager.getFaces()[0];
            
            switch( face.state ){
                case brfv4.BRFState.RESET: state = 0; break;//This face was reset because of a call to reset or because it exceeded the reset parameters.
                case brfv4.BRFState.FACE_DETECTION: state = 1; break;//BRFv4 is looking for a face, still nothing found.
                case brfv4.BRFState.FACE_TRACKING_START: state = 2; break;//BRFv4 found a face and tries to align the face tracking to the identified face. In this state the candide3 model and 3D position might not be correct yet.
                case brfv4.BRFState.FACE_TRACKING: state = 3; break;//BRFv4 aligned the face and is now tracking it.
            }

            this.state = state;
            
            if( state > 2 ) {

                this.position.x = face.translationX;
                this.position.y = face.translationY;

                this.rotation.x = face.rotationX;
                this.rotation.y = -face.rotationY;
                this.rotation.z = -face.rotationZ;

                this.scale = face.scale;

                this.copyVertrices( face.vertices );
                if(this.o.length === 0) this.copy();

                this.blinkTest();
                this.pointTest();

                if( debug ){ 

                    video.drawRects( face.bounds, state === 3 ? '#ff0':'#f00');
                    video.drawFace( face.vertices, state === 3 ? '#0f0' : '#08f' );
                    this.setInfo();

                }


                // old vertrices
                this.copy();
     
            }

            if( state === 0 ) { 
                this.reset()
            }

        },

        getFace: function (){
            return face;
        },

        blinkTest: function(){

            var v = this.v;
            var o = this.o;

            var k, l, yLE, yRE;

            // Left eye movement (y)

            for(k = 36, l = 41, yLE = 0; k <= l; k++) {
                yLE += v[k].y - o[k].y;
            }
            yLE /= 6;

            // Right eye movement (y)

            for(k = 42, l = 47, yRE = 0; k <= l; k++) {
                yRE += v[k].y - o[k].y;
            }

            yRE /= 6;

            var yN = 0;

            // Compare to overall movement (nose y)
            yN += v[27].y - o[27].y;
            yN += v[28].y - o[28].y;
            yN += v[29].y - o[29].y;
            yN += v[30].y - o[30].y;
            yN /= 4;

            var blinkRatio = Math.abs((yLE + yRE) / yN);

            if((blinkRatio > 12 && (yLE > 0.4 || yRE > 0.4))) {
                this.blink();
            }

        },

        getInfo: function () {

            return info;

        },

        setInfo: function () {

            info = '';
            info +='SCALE: ' +  M.fix(this.scale,1) + '<br>';
            info +='X: ' +  M.fix(this.position.x,1) + ' Y: ' +  M.fix(this.position.y,1) +'<br>';
            info += 'RX: ' +  M.fix(this.rotation.x*M.todeg,1) + ' RY: ' +  M.fix(this.rotation.y*M.todeg, 1) + ' RZ: ' +  M.fix(this.rotation.z*M.todeg,1) +'<br>';
            info += 'BLINK: ' +isBlink+'<br>';
            info += 'STATE: ' + this.state+'<br><br>';

            info += 'mouthDist: ' + data.mouthDist +'<br>';
            info += 'lipDist: ' + data.lipDist +'<br>';
            info += 'lipContraction: ' + data.lipContraction +'<br>';

            info += 'browL: ' + data.browL +'<br>';
            info += 'browR: ' + data.browR +'<br>';

            info += 'lidL: ' + data.lidL +'<br>';
            info += 'lidR: ' + data.lidR +'<br>';


            //this.info += 'LNG: ' +face.vertices.length;

        },

        blink: function () {

            isBlink = true;
            if(blinkTimeOut > -1) { clearTimeout(blinkTimeOut); }
            blinkTimeOut = setTimeout(function(){ isBlink = false; }, 150);

        },

        copyVertrices: function ( v ){
            
           // var u = vertices;
            var i = 68, n;
            var r = 100 / this.scale;
            var x = this.position.x;
            var y = this.position.y;

            while(i--){

                n = i*2;
                this.v[i].set( ( v[n]-x)*r, (- v[n+1]+y)*r );

            }

            // no rotation Z

            i = 68
            while(i--){

                if(i!==27){
                    this.v[i].rotationTo(this.v[27], -this.rotation.z );
                }

            }

        },

        copy: function () {

            var i = 68, n;

            while( i-- ){

                this.o[i].copy( this.v[i] );

            }

        },



        pointTest: function(){

            var v = this.v;
            var s = 1 / 100;
            var s2 = 1 / (100*2);

            data.lipDist = M.fix( M.lng( [ M.dist( v[61], v[67] ), M.dist( v[62], v[66] ), M.dist( v[63], v[65] ) ] ) * s2 );
            data.mouthDist = M.fix( M.lng( [ M.dist( v[50], v[58] ), M.dist( v[51], v[57] ), M.dist( v[52], v[56] ) ] ) * s2 );
            data.lipContraction = M.fix( M.lng( [ M.dist( v[48], v[54] ), M.dist( v[49], v[53] ), M.dist( v[59], v[55] ) ] ) * s );

            data.browL = M.fix( M.lng( [ M.dist( v[21], v[39] ), M.dist( v[20], v[39] ), M.dist( v[19], v[39] ) ] ) * s2 );
            data.browR = M.fix( M.lng( [ M.dist( v[22], v[42] ), M.dist( v[23], v[42] ), M.dist( v[24], v[42] ) ] ) * s2 );

            data.lidL =  M.fix( M.dist( v[37], v[41] ) * s2 );
            data.lidR =  M.fix( M.dist( v[44], v[46] ) * s2 );

        },



}

return brf4;

})();