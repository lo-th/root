THREE.NormalMaker = function( renderer ){

    this.renderer = renderer;

    this.settings = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } 

    this.renderTarget = new THREE.WebGLRenderTarget( 512, 512, this.settings );

    this.texture = this.renderTarget.texture;

    this.material = new THREE.MeshNormalMaterial();
    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.camera.position.z = 1;
    this.scene = new THREE.Scene();
    this.plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.material );
   // var sph2 = new THREE.Mesh( new THREE.SphereBufferGeometry(0.8, 30, 30), this.material );
    this.scene.add( this.plane );
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
            var ctx = canvas.getContext("2d");

            ctx.drawImage(img,0,0);
            this.makeTerrain( ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height );

        }.bind(this);

        img.src = url;

    },

    makeTerrain:function( data, w, h ){

        this.scene.remove( this.plane );
        var g = new THREE.PlaneBufferGeometry( 2, 2, w-1, h-1 );
        var vertices = g.attributes.position.array;

        var i = vertices.length/3;
        var n3, n4;

        while(i--){
            n3 = i*3;
            n4 = i*4;
            vertices[n3+2] = (data[n4] / 255);
        }

        g.computeVertexNormals();

        this.plane = new THREE.Mesh( g, this.material );
        this.scene.add( this.plane );

        this.render();

    },

    render : function(){

        this.renderer.render( this.scene, this.camera, this.renderTarget, true );

    }

}