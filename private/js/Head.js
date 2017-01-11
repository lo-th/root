
V.Head = function ( type, txt ) {

    this.t = 0;

    this.sett = {
        blink : 1,
    }

    var PI90 = 1.570796326794896;

    // [ skin, skin2, hair ];
    var colors = [ 0x895837, 0x70472B, 0x3A160A ];
    if(type === 'man' ) colors = [ 0xB1774F, 0xA36D47, 0x613207 ];


    this.w = 512;
    this.h = 256;
    this.mw = this.w * 0.5;
    this.mh = this.h * 0.5;

    // Material

    this.mat = {
        skin: new THREE.MeshBasicMaterial({ color:colors[0] }),
        skin2: new THREE.MeshBasicMaterial({ color:colors[1] }),
        eye : new THREE.MeshBasicMaterial({ color:0xFFFFFF }),
        pupil : new THREE.MeshBasicMaterial({ color:0x000000 }),
    };

    // Geometry

    this.geo = {
        eye: new THREE.CylinderBufferGeometry( 5,5,0.1,12,1 ),
        backEye: new THREE.CylinderBufferGeometry( 14,5,0.1,32,1 ),
        contEye: new THREE.TorusGeometry(16, 2, 4, 32),//CylinderBufferGeometry( 18,5,0.1,32,1 ),
        contEye2: new THREE.TorusGeometry(22, 4, 6, 32),
    };

    this.geo.eye.rotateX( -PI90 );
    this.geo.backEye.rotateX( -PI90 );
    //this.geo.contEye.rotateX( -PI90 );

    //

    this.camera = new THREE.OrthographicCamera( -this.mw, this.mw, this.mh, -this.mh, 0, 200 );
    this.camera.position.z = 100;

    this.scene  = new THREE.Scene();

    // mesh

    this.eyeL = this.addEye( -35 );
    this.eyeR = this.addEye( 35 );





    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( this.w, this.h ), new THREE.MeshBasicMaterial({map:type==='man'? txt.hman: txt.hwom}) );
    //this.quad.frustumCulled = false; // Avoid getting clipped
    this.scene.add( this.quad );

    var parameters = { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
    ///var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat, stencilBuffer: false, depthBuffer:true, anisotropy:1 };

    this.renderTarget = new THREE.WebGLRenderTarget( this.w, this.h, parameters );
    //this.renderTarget.texture.generateMipmaps = false;



    this.composer = new THREE.EffectComposer( renderer, this.renderTarget );

    var ssaaRenderPass = new THREE.SSAARenderPass( this.scene, this.camera );
    ssaaRenderPass.unbiased = false;
    ssaaRenderPass.sampleLevel = 2;
    this.composer.addPass( ssaaRenderPass );


    //'Level 0: 1 Sample': 0,
    //                'Level 1: 2 Samples': 1,
    //                'Level 2: 4 Samples': 2,
    //                'Level 3: 8 Samples': 3,
     //               'Level 4: 16 Samples': 4,
     //               'Level 5: 32 Samples': 5


    //this.composer.setSize( w, h );
    /*this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

    var copyShader = new THREE.ShaderPass(THREE.CopyShader);


    var effectHBlur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
    var effectVBlur = new THREE.ShaderPass( THREE.VerticalBlurShader );
    effectHBlur.uniforms[ 'h' ].value = 1 / (w*2) ;
    effectVBlur.uniforms[ 'v' ].value = 1 / (h*2) ;

    this.composer.addPass( effectHBlur );
    this.composer.addPass( effectVBlur );*/
    //this.composer.addPass(copyShader);

    //this.pass = new THREE.SMAAPass( w, h );
    //this.pass.renderToScreen = true;
    //this.composer.addPass( this.pass );


    //this.texture = this.renderTarget.texture;





}

V.Head.prototype = {

    addEye: function( x ){

        var eye = new THREE.Group();
        //eye.position.set( this.mw + x, this.mh, 2 );

        eye.position.set( x, 0, 2 );

        var eyec = new THREE.Mesh( this.geo.contEye, this.mat.skin2 );
        var eyet = new THREE.Mesh( this.geo.backEye, this.mat.eye );
        var pupil = new THREE.Mesh( this.geo.eye, this.mat.pupil );
        var eyec2 = new THREE.Mesh( this.geo.contEye2, this.mat.skin );

        eyet.position.z = 0;
        pupil.position.z = 0.1;

        eye.add( eyet );
        eye.add( eyec );
        eye.add( eyec2 );
        eye.add( pupil );

        this.scene.add( eye ); 

        return eye;

    },

    upEye: function (){

        this.eyeL.children[0].scale.y = this.sett.blink;
        this.eyeL.children[1].scale.y = this.sett.blink;
        this.eyeL.children[2].scale.y = this.sett.blink;

        this.eyeR.children[0].scale.y = this.sett.blink;
        this.eyeR.children[1].scale.y = this.sett.blink;
        this.eyeR.children[2].scale.y = this.sett.blink;

    },

    closeEye: function (){

        var _this = this;

        new TWEEN.Tween( this.sett ).to( { blink:0.2 }, 130 ).onUpdate( function(){ _this.upEye() } ).onComplete( function(){ _this.openEye()  }).start();
        //var b2 = new TWEEN.Tween( this.sett ).to( { blink:1 }, 200 ).delay( 200 ).onUpdate( function(){ _this.upEye() } ).start();



    },

    openEye: function (){

        var _this = this;

        new TWEEN.Tween( this.sett ).to( { blink:1 }, 130 ).onUpdate( function(){ _this.upEye() } ).start();

    },

    update: function(x,y){

        this.t++;

        this.eyeL.children[3].position.set( x*8, -(y*8), 1 );
        this.eyeR.children[3].position.set( x*8, -(y*8), 1 );

        if(this.t === 400 ) {
            this.closeEye();
            this.t = 0;
        }

        //this.eyeL.position.set( -(256 - (222+(x*8))), -(y*8), 2 );
        //this.eyeR.position.set( -(256 - (290+(x*8))), -(y*8), 2 );


        this.composer.render();
        //renderer.render( this.scene, this.camera, this.renderTarget, true );


    }
}