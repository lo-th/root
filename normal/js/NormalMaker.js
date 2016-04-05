THREE.NormalMaker = function( renderer ){

    this.sharpen = 0;
    this.blur = 0;
    this.emboss = 0;

    this.pixels = null;
    this.finalPixels = null;

    this.renderer = renderer;

    this.settings = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } 

    this.renderTarget = new THREE.WebGLRenderTarget( 512, 512, this.settings );

    this.texture = this.renderTarget.texture;

    this.material = new THREE.MeshNormalMaterial();
    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.camera.position.z = 1;
    this.scene = new THREE.Scene();
    this.plane = null;//new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.material );
   // var sph2 = new THREE.Mesh( new THREE.SphereBufferGeometry(0.8, 30, 30), this.material );
    //this.scene.add( this.plane );
    //this.scene.add( sph2 );
}

THREE.NormalMaker.prototype = {

    resolution : function( size ){

        this.renderTarget.dispose();
        this.renderTarget = new THREE.WebGLRenderTarget( size, size, this.settings );
        this.texture = this.renderTarget.texture;

        this.scene.remove( this.plane );
        this.plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2, size-1, size-1 ), this.material );
        this.scene.add( this.plane );

    },

    load : function( url ){

        var img = new Image();
        img.onload = function(){

            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            this.ctx = canvas.getContext("2d");

            this.ctx.drawImage(img,0,0);

            this.pixels = this.ctx.getImageData(0, 0, canvas.width, canvas.height);

            
            this.makeTerrain();

        }.bind(this);

        img.src = url;

    },

    convolute : function( weights, opaque) {
        var side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side/2);
        var src = this.pixels.data;
        var sw = this.pixels.width;
        var sh = this.pixels.height;
        // pad output by the convolution matrix
        var w = sw;
        var h = sh;
        this.finalPixels = this.ctx.createImageData(w, h);
        var dst = this.finalPixels.data;
        // go through the destination image pixels
        var alphaFac = opaque ? 1 : 0;
        for (var y=0; y<h; y++) {
            for (var x=0; x<w; x++) {
                var sy = y;
                var sx = x;
                var dstOff = (y*w+x)*4;
                // calculate the weighed sum of the source image pixels that
                // fall under the convolution matrix
                var r=0, g=0, b=0, a=0;
                for (var cy=0; cy<side; cy++) {
                   for (var cx=0; cx<side; cx++) {
                        var scy = sy + cy - halfSide;
                        var scx = sx + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = (scy*sw+scx)*4;
                            var wt = weights[cy*side+cx];
                            r += src[srcOff] * wt;
                            g += src[srcOff+1] * wt;
                            b += src[srcOff+2] * wt;
                            a += src[srcOff+3] * wt;
                        }
                    }
                }
               dst[dstOff] = r;
               dst[dstOff+1] = g;
               dst[dstOff+2] = b;
               dst[dstOff+3] = a + alphaFac*(255-a);
            }
        }

        //this.finalPixels = output;
        //return output;
    },

    makeTerrain:function( ){
        if( this.emboss !== 0 ) this.convolute( [  -2, -1,  0, -1,  1, 1, 0, 1,  2 ], false );
        if( this.sharpen !== 0 ) this.convolute( [  0, -1,  0, -1,  5, -1, 0, -1,  0 ], false );
        if( this.blur !== 0 ){ 
            var b = 1 / ( this.blur * this.blur );
            this.convolute( [ b, b, b, b, b, b, b, b, b ], false );
        }

        if(this.blur===0 && this.sharpen === 0) this.finalPixels = this.pixels;

        var g = new THREE.PlaneBufferGeometry( 2, 2, this.pixels.width-1, this.pixels.height-1 );
        var vertices = g.attributes.position.array;

        var i = vertices.length/3;
        var n3, n4, v;
        var data = this.finalPixels.data;

        while(i--){
            n3 = i*3;
            n4 = i*4;
            // CIE luminance for the RGB
            v = 0.2126*data[n4] + 0.7152*data[n4+1] + 0.0722*data[n4+2];
            vertices[n3+2] = v / 255;
        }

        g.computeVertexNormals();

        this.plane = new THREE.Mesh( g, this.material );
        this.scene.add( this.plane );

        this.render();

    },

    render : function(){

        this.renderer.render( this.scene, this.camera, this.renderTarget, true );

        this.scene.remove( this.plane );
        this.plane.geometry.dispose();

    }

}