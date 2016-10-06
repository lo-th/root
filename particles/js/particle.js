'use strict';

var particle = ( function () {

    var geometry, material, max, active, callback;

    var positions, pos_uv, colors, setting, angles, alphas, lock, mapID, alphaMul;

    var vertexShader, fragmentShader, nShaders = 0;

    var imageCount = 0;
    var maxImageSize = 256;
    var textureSize = 2048;
    var maxImageParLigne = 8;
    var maxImageParTexture = 64;
    var textureRatio = maxImageSize/textureSize;

    // for loading images
    var imagesList = [];
    var imagesPath = '';
    var imagesCallback = null;

    var imageData = [];

    var options = {

        size : 4,
        perlinFrequency: 1.5,
        perlinIntensity: 1.5,
        timeScale: 0.7,
        
        thetaInc: 3,
        phyInc:2,

        bigNoize:2,
        noizeComplexity:0.01,
        vibration:0.05,
        vibrationSize:4,

        impactForce:100,
        gravity:9.8,
        impactSpeed:0.4,
        fadeStart:0.5,
        expluseTime:1,
        fadeTime:1,

    };

    var rdata;

    var canvasTextures = [];
    var textures = [];

    particle = function () {};

    //---------------------------------------------
    // initialise les particle et definie les données aleatoire
    //---------------------------------------------

    particle.init = function ( Max, Callback ) {

        callback = Callback;

        max = Max || 20000;

        rdata = new Int16Array( max * 9 );

        var i = max, n;

        while(i--){

            n = i * 9;

            rdata[n] = Math.randInt( 0, 100 ); // alpha multyplier
            //
            rdata[n+1] = Math.randInt( 40, 200 ); // distance
            rdata[n+2] = Math.randInt( 0, 360 ); // phy
            rdata[n+3] = Math.randInt( 0, 360 ); // theta
            //
            rdata[n+4] = Math.rand( 0, 1 ) > 0.5 ? 1 : 0;// noise side
            //
            rdata[n+5] = Math.randInt( 0, 25 ); // uv sprite type
            //
            rdata[n+6] = Math.randInt( 0, 360 ); // local rotation start
            rdata[n+7] = Math.rand( 0, 1 ) > 0.5 ? 1 : 0;// rotation side
            rdata[n+8] = Math.randInt( 1, 10 ); // rotation speed

        };

        particle.loadShader();

    };

    //---------------------------------------------
    // charge le shaders vertex et fragement
    //---------------------------------------------

    particle.loadShader = function () {

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if ( xhr.readyState == 4 ){
                if(nShaders == 0){
                    vertexShader = xhr.responseText;
                    nShaders ++;
                    particle.loadShader();
                } else {
                    fragmentShader = xhr.responseText;

                    particle.create();
                    //particle.loadTexture();
                }
            }
        }
        if( nShaders == 0 ) xhr.open( "GET", 'js/point_vert.glsl', true );
        if( nShaders == 1 ) xhr.open( "GET", 'js/point_frag.glsl', true );
        xhr.send();

    };

    /*particle.loadTexture = function () {
        view.getMap( 'textures/particules.png', particle.endLoadTexture )
    };

    particle.endLoadTexture = function ( tex ) {

        texture = tex
        particle.create();

    };*/

    //---------------------------------------------
    // chargement des images de reference
    //---------------------------------------------

    particle.loadImageList = function ( list, path, callback ) {

        imagesList = list;
        imagesPath = path;
        imagesCallback = callback;

        this.loadImage( imagesPath + imagesList.pop() );

    };

    particle.loadImage = function ( url ) {

        var image = new Image();
        image.src = url;

        image.addEventListener( 'load', function(){

            particle.addImagetoTexure( image );

            if( imagesList.length ) particle.loadImage( imagesPath + imagesList.pop() );
            else {
                //console.log(imageData)
                imagesCallback();
            }

        }, false);

    };

    //---------------------------------------------
    // gestion des canvas pour les textures
    //---------------------------------------------

    particle.addCanvas = function ( id, color ) {

        var canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;

        if( color ){
            var ctx = canvas.getContext('2d');
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = color;
            ctx.fill();
        }
        

        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;

        canvasTextures[id] = canvas;
        textures[id] = texture;

    };

    particle.addImagetoTexure = function ( image ) {

        var w = image.width;
        var h = image.height;

        var x = 0;
        var y = 0;

        var o = this.findImagesPosition();

        var mw, mh, dx = 0, dy = 0;

        if(w > h){
            mw = maxImageSize;
            mh = h * (mw/w);
            dy = (mw-mh)*0.5;
        } else {
            mh = maxImageSize;
            mw = w * (mh/h);
            dx = (mh-mw)*0.5;
        }

        var ctx = canvasTextures[o.texID].getContext('2d');
        ctx.drawImage( image, o.x + dx, o.y + dy, mw, mh );
        textures[o.texID].needsUpdate = true;

        // prend la valeur hls moyenne
        o.color = this.averageColour( ctx.getImageData( o.x + dx, o.y + dy, mw, mh ) );

        //console.log( o )

        imageData.push( o );

    };

    particle.setImageSize = function(s, s2){

        maxImageSize = s || 256;
        textureSize = s2 || 2048;

        textureRatio = maxImageSize / textureSize;

        maxImageParLigne = textureSize / maxImageSize;
        maxImageParTexture = Math.pow(maxImageParLigne, 2);

        //console.log(maxImageParTexture)

        this.createCanvasTexture();

    };

    particle.createCanvasTexture = function(){

        for(var i=0; i<10; i++){
            particle.addCanvas( i );
        }

    };

    particle.findImagesPosition = function  () {

        var id = Math.floor( imageCount / maxImageParTexture );
        var p = imageCount - (id*maxImageParTexture);
        var y = Math.floor(p / maxImageParLigne) 
        var x = p -(y*maxImageParLigne);

        x *= maxImageSize;
        y *= maxImageSize;

        imageCount ++;

        return { x:x, y:y, texID:id, imID:p }

    };

    particle.averageColour = function  ( imageData ) {

        var d = imageData.data;
        var rgb = [ 0, 0, 0 ];
        var i = ~~ d.length/4, count = 0, n;
        while(i--){
            n = i * 4;
            if (d[n+3] > 250 ){
                rgb[0] += d[n+0];
                rgb[1] += d[n+1];
                rgb[2] += d[n+2];
                count ++;
            }
        }

        // All empty
        if (count == 0) return null;

        // Final colour
        var invCont = 1/count;
        rgb[0] = Math.round( rgb[0]*invCont );
        rgb[1] = Math.round( rgb[1]*invCont );
        rgb[2] = Math.round( rgb[2]*invCont );

        return Math.rgbToHsl( rgb[0], rgb[1], rgb[2] );

    };


    //---------------------------------------------
    // initialisation des particules
    //---------------------------------------------

    particle.create = function () {

        this.setImageSize();

        //texture = view.getMap( 'textures/particules.png' );

        geometry = new THREE.BufferGeometry();

        positions = new Float32Array( max * 3 );
        //colors = new Float32Array( max * 4 );
        setting = new Float32Array( max * 4 );
        pos_uv = new Float32Array( max * 2 );
        angles = new Float32Array( max * 3 );
        alphas = new Float32Array( max * 1 );
        alphaMul = new Float32Array( max * 1 );
        lock = new Float32Array( max * 1 ); 
        mapID = new Float32Array( max * 1 ); 

        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'setting', new THREE.BufferAttribute( setting, 4 ) );
        geometry.addAttribute( 'pos_uv', new THREE.BufferAttribute( pos_uv, 2 ) );

        geometry.addAttribute( 'angle', new THREE.BufferAttribute( angles, 3 ) );
        geometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
        geometry.addAttribute( 'alphaMul', new THREE.BufferAttribute( alphaMul, 1 ) );
        geometry.addAttribute( 'lock', new THREE.BufferAttribute( lock, 1 ) );

        geometry.addAttribute( 'mapID', new THREE.BufferAttribute( mapID, 1 ) );

        material = new THREE.ShaderMaterial( {
            uniforms:{
                textureRatio: { type: 'f', value: textureRatio },

                texture0: { type: 't', value: textures[0] },
                texture1: { type: 't', value: textures[1] },
                texture2: { type: 't', value: textures[2] },
                texture3: { type: 't', value: textures[3] },

                //map: { type: 't', value: textures[0] },

                time :  { type: 'f', value: 0.5 },
                scale :  { type: 'f', value: 400.0 },
                size :  { type: 'f', value: options.size },
                pixelRatio: { type: 'f', value: window.devicePixelRatio },
               
                perlinFrequency: { type: 'f', value: options.perlinFrequency },
                perlinIntensity: { type: 'f', value: options.perlinIntensity },
                timeScale: { type: 'f', value: options.timeScale },
                elapsedTime: { type: 'f', value: 0 },

                thetaInc: { type: 'f', value: options.thetaInc },
                phyInc: { type: 'f', value: options.phyInc },

                bigNoize: { type: 'f', value: options.bigNoize },
                noizeComplexity: { type: 'f', value: options.noizeComplexity },
                vibration: { type: 'f', value: options.vibration },
                vibrationSize: { type: 'f', value: options.vibrationSize },

                impactPosition: { type: 'v3', value: new THREE.Vector3() },
                impactForce: { type: 'f', value: options.impactForce },
                impactSpeed: { type: 'f', value: options.impactSpeed },
                gravity: { type: 'f', value: options.gravity },
                impact: { type: 'f', value: 0 },
                
                expluseTime: { type: 'f', value: options.expluseTime },
                fadeTime: { type: 'f', value: options.fadeTime },
                fadeStart: { type: 'f', value: options.fadeStart },

            },
            fragmentShader:fragmentShader,
            vertexShader:vertexShader,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            //blending:blending
        });

        this.initGeometry();

        //geometry.computeBoundingSphere();

        var particlesCloud = new THREE.Points( geometry, material );
        particlesCloud.frustumCulled = false;

        particlesCloud.renderOrder = 1;

        view.getScene().add( particlesCloud );

        callback();

    };

    particle.setuv = function(n){

        var y = Math.floor(n/8);
        var x = n-(y*8);
        y = 7-y;
        return [x,y];

    };

    particle.getOptions = function() {

        return options;

    };

    particle.updateUniforms = function( ) {

        for (var o in options){
            particle.setUniforms( o, options[o] );
        }

    };

    particle.setUniforms = function( name, value ) {

        material.uniforms[name].value = value;

    };

    particle.getOptions = function( ) {

        return options;

    };

    //---------------------------------------------
    // cree une nouvelle image
    //---------------------------------------------

    particle.changeImage = function ( data ) {

        active = ~~ (data.length / 3);

        //console.log(active)
        var i, n2, n3, n4, n9, uv;

        var min_d,  min_i, color, uv;

        for( i = 0; i < active; i ++ ) {

            n2 = i * 2;
            n3 = i * 3;
            n4 = i * 4;
            n9 = i * 9;

            color = data[n3+2];

            min_d = 10000;
            min_i = 0;

            for(var o in imageData){
                var d = Math.colorDistance ( color, imageData[o].color );
                if (d < min_d){
                    min_d = d;
                    min_i = o;
                }
            }

            // final word position
            positions[n3] = data[n3];
            positions[n3 + 1] = data[n3+1];
            positions[n3 + 2] = 0;
            // alpha
            alphas[i] = color[3];
            lock[i] = 1;

            // id
            mapID[i] = imageData[min_i].texID;
            uv = this.setuv( imageData[min_i].imID );

            pos_uv[n2+0] = uv[0];
            pos_uv[n2+1] = uv[1];

        }

        // reset old
        for( i = active; i < max; i ++ ) {

            n3 = i * 3;
            n4 = i * 4;
            n9 = i * 9;

            positions[n3] = 0;
            positions[n3 + 1] = 0;
            positions[n3 + 2] = 0;

            alphas[i] = 0;
            lock[i] = 0;

            mapID[i] = 0;

        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.alpha.needsUpdate = true;
        geometry.attributes.lock.needsUpdate = true;
        geometry.attributes.mapID.needsUpdate = true;
        geometry.attributes.pos_uv.needsUpdate = true;

    };

    //---------------------------------------------
    // cree un nouveau message
    //---------------------------------------------

    particle.changeWord = function ( data ) {

        active = ~~ (data.length / 3);
        var i, n2, n3, n4, n9, uv;

        for( i = 0; i < active; i ++ ) {

            n3 = i * 3;
            n4 = i * 4;
            n9 = i * 9;

            // final word position
            positions[n3] = data[n3];
            positions[n3 + 1] = data[n3+1];
            positions[n3 + 2] = 0;
            // alpha
            alphas[i] = data[n3+2][3];
            lock[i] = 1;

            // id
            mapID[i] = 0;

        }

        // reset old
        for( i = active; i < max; i ++ ) {

            n3 = i * 3;
            n4 = i * 4;
            n9 = i * 9;

            positions[n3] = 0;
            positions[n3 + 1] = 0;
            positions[n3 + 2] = 0;

            alphas[i] = 0;
            lock[i] = 0;

            mapID[i] = 0;

        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.alpha.needsUpdate = true;
        geometry.attributes.lock.needsUpdate = true;
        //geometry.attributes.mapID.needsUpdate = true;

    };

    //---------------------------------------------
    // applique toutes les données aleatoire
    //---------------------------------------------

    particle.initGeometry = function () {

        active = 0;

        var i, n2, n3, n4, n9, uv;

        for( i = 0; i < max; i ++ ) {

            n2 = i * 2;
            n3 = i * 3;
            n4 = i * 4;
            n9 = i * 9;

            setting[n4] = rdata[n9+1];// distance
            setting[n4 + 1] = rdata[n9+2];// angle phy
            setting[n4 + 2] = rdata[n9+3];// angle theta
            setting[n4 + 3] = rdata[n9+4];// noise side

            // uv map
            uv = particle.setuv( rdata[n9+5] );// uv sprite type
            pos_uv[n2] = uv[0];
            pos_uv[n2+1] = uv[1];

            // rotation
            angles[n3] = rdata[n9+6];// start angle
            angles[n3+1] = rdata[n9+7];// side
            angles[n3+2] = rdata[n9+8];// increment

            //alphas[i] = 127 + rdata[n9];

            //mapID[i] = 2.0;

            alphaMul[i] = rdata[n9];

        }

        geometry.attributes.setting.needsUpdate = true;
        geometry.attributes.pos_uv.needsUpdate = true;
        geometry.attributes.angle.needsUpdate = true;
        geometry.attributes.alphaMul.needsUpdate = true;
        //geometry.attributes.mapID.needsUpdate = true;

    };


    return particle;

})();

