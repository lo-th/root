
V.Head = function ( type, txt, meshs ) {

    this.type = type;

    this.multy = 1;
    this.sampling = 4;

    this.t = 0;

    this.sett = {
        blink : 1,
    }

    var PI90 = 1.570796326794896;

    // [ skin, skin2, hair ];
    var colors = [ 0x895837, 0x70472B, 0x3A160A, 0x24951b ];
    if(type === 'man' ) colors = [ 0xB1774F, 0xA36D47, 0x613207, 0x196895];


    this.w = 512 * this.multy;
    this.h = 256 * this.multy;
    this.mw = this.w * 0.5;
    this.mh = this.h * 0.5;

    // Material

    this.mat = {

        skin: new THREE.MeshBasicMaterial({ color:colors[0] }),
        skin2: new THREE.MeshBasicMaterial({ color:colors[1] }),
        hair: new THREE.MeshBasicMaterial({ color:colors[2] }),
        pup : new THREE.MeshBasicMaterial({ color:colors[3] }),
        white : new THREE.MeshBasicMaterial({ color:0xFFFFFF, side: THREE.DoubleSide }),
        black : new THREE.MeshBasicMaterial({ color:0x000000 }),
        inmouth : new THREE.MeshBasicMaterial({ color:0x4f1903 }),

        Mskin: new THREE.MeshBasicMaterial({ color:colors[0], morphTargets:true, side: THREE.DoubleSide }),
        Mskin2: new THREE.MeshBasicMaterial({ color:colors[1], morphTargets:true, side: THREE.DoubleSide  }),
        Mhair: new THREE.MeshBasicMaterial({ color:colors[2], morphTargets:true, side: THREE.DoubleSide  }),
        Mpup : new THREE.MeshBasicMaterial({ color:colors[3], morphTargets:true, side: THREE.DoubleSide  }),
        Mwhite : new THREE.MeshBasicMaterial({ color:0xFFFFFF, morphTargets:true, side: THREE.DoubleSide  }),
        Mblack : new THREE.MeshBasicMaterial({ color:0x000000, morphTargets:true, side: THREE.DoubleSide  }),

        
    };

    //

    //this.camera = new THREE.OrthographicCamera( -this.mw, this.mw, this.mh, -this.mh, 0, 200 );
    this.camera = new THREE.OrthographicCamera( -256, 256, 128, -128, 0, 200 );
    this.camera.position.z = 100;

    this.scene  = new THREE.Scene();

    this.root = new THREE.Group();

    this.scene.add( this.root );
    this.root.add(this.camera);

    this.root.scale.set( this.multy, this.multy, this.multy );

    // mesh

    var m = {

        noz: meshs.noz.clone(),
        hair: this.type === 'man' ? meshs.hair_m.clone() : meshs.hair_w.clone(),
        eyeBrowL: meshs.eyebrow.clone(),
        eyeBrowR: meshs.eyebrow.clone(),

        eyeL: meshs.eye.clone(),
        eyecL: meshs.eyec.clone(),
        eyebL: meshs.eyeb.clone(),
        eyePupL: meshs.pupil.clone(),

        eyeR: meshs.eye.clone(),
        eyecR: meshs.eyec.clone(),
        eyebR: meshs.eyeb.clone(),
        eyePupR: meshs.pupil.clone(),

        mouth: meshs.mouth.clone(),
        lips: meshs.lips.clone(),
        mback: meshs.mback.clone(),
        tooth: meshs.tooth.clone(),

    };

    // apply materials

    m.noz.material = this.mat.skin2;
    m.hair.material = this.mat.hair;
    m.eyeBrowL.material = this.mat.Mhair;
    m.eyeBrowR.material = this.mat.Mhair;

    m.eyeL.material = this.mat.Mskin;
    m.eyeR.material = this.mat.Mskin;

    m.eyecL.material = this.mat.Mskin2;
    m.eyecR.material = this.mat.Mskin2;

    m.eyebL.material = this.mat.white;
    m.eyebR.material = this.mat.white;

    m.eyePupL.material = this.mat.pup;
    m.eyePupR.material = this.mat.pup;

    m.mouth.material = this.mat.Mskin;
    m.lips.material = this.mat.Mskin2;
    m.tooth.material = this.mat.Mwhite;

    m.mback.material = this.mat.inmouth;

    m.eyePupL.children[0].material = this.mat.black;
    m.eyePupR.children[0].material = this.mat.black;

    // revers right eye

    this.revers( m.eyeBrowR );
    this.revers( m.eyeR );
    this.revers( m.eyecR );
    this.revers( m.eyebR );
    
    // add all object to scene

    for ( var o in m ){

        this.root.add( m[o] );

    }

    // define morph mesh

    this.morphE = [ m.eyeL, m.eyeR, m.eyecL, m.eyecR, m.eyeBrowL, m.eyeBrowR ];
    this.morphM = [ m.mouth, m.lips, m.tooth ];


    this.mesh = m;

    // background

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 512, 256 ), this.mat.skin );
    //this.quad.frustumCulled = false; // Avoid getting clipped
    this.root.add( this.quad );

    //

    var parameters = { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
    //var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false, depthBuffer:true, anisotropy:1 };

    this.renderTarget = new THREE.WebGLRenderTarget( this.w, this.h, parameters );
    //this.renderTarget.texture.generateMipmaps = false;



    this.composer = new THREE.EffectComposer( renderer, this.renderTarget );
    this.ssaaRenderPass = new THREE.SSAARenderPass( this.scene, this.camera );
    this.ssaaRenderPass.unbiased = false;
    this.ssaaRenderPass.sampleLevel = this.sampling * 0.5;
    this.composer.addPass( this.ssaaRenderPass );


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


    this.morphMouth("close", 1 );
    //this.morphEye("close", 1 );





}

V.Head.prototype = {

    setSize: function ( v ) {
        var n;

        if(v ==='512') n = 1;
        if(v ==='1024') n = 2;


        if( this.multy!==n ) this.multy = n;
        else return;

        this.w = 512 * this.multy;
        this.h = 256 * this.multy;
        this.mw = this.w * 0.5;
        this.mh = this.h * 0.5;

        //this.camera = new THREE.OrthographicCamera( -this.mw, this.mw, this.mh, -this.mh, 0, 200 );
        //var parameters = { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
        //this.renderTarget = new THREE.WebGLRenderTarget( this.w, this.h, parameters );
        this.root.scale.set( this.multy, this.multy, this.multy );

        //this.composer = new THREE.EffectComposer( renderer, this.renderTarget );
        //this.composer.addPass( this.ssaaRenderPass );

        this.composer.setSize(this.w, this.h);

    },

    setSampling: function ( v ) {

        var n;
        
        if(v ==='x0') n = 0;
        if(v ==='x2') n = 2;
        if(v ==='x4') n = 4;

        console.log(n)

        this.sampling = n;
        this.ssaaRenderPass.sampleLevel = this.sampling * 0.5;

    },

    correctMorph: function ( name, meshs ){

        var morph = ['_open', '_close', '_sad', '_happy' ];

        for( var i=0; i < morph.length; i++ ) {

            meshs[name].geometry.morphAttributes.position[i].array = meshs[name+morph[i]].geometry.attributes.position.array;
            meshs[name].geometry.morphAttributes.normal[i].array = meshs[name+morph[i]].geometry.attributes.normal.array;

        }

    },

    revers: function ( o ) {

        o.position.x *= -1;
        o.scale.x *= -1;

    },

    morph: function ( t, v ) {

        this.morphEye( t, v );
        this.morphMouth( t, v );
        
    },

    morphEye: function ( t, v ) {

        var i = this.morphE.length;
        while(i--){
            this.morphE[i].setWeight( t, v );
        }

    },

    morphMouth: function ( t, v ) {

        var i = this.morphM.length;
        while(i--){
            this.morphM[i].setWeight( t, v );
        }

    },

    closeEye: function (){

        var _this = this;
        new TWEEN.Tween( this.sett ).to( { blink:1 }, 200 ).onUpdate( function(){ _this.blinkEye(); } ).start();
        new TWEEN.Tween( this.sett ).to( { blink:0 }, 200 ).delay( 200 ).onUpdate( function( v ){ _this.blinkEye(); } ).start();
    },

    blinkEye: function (){

        this.morphEye( 'close', this.sett.blink );

    },

    update: function(x,y){

        this.t++;

        this.mesh.eyePupL.position.set( -35 + x*8, -(y*8), 5 );
        this.mesh.eyePupR.position.set( 35 + x*8, -(y*8), 5 );

        if(this.t === 400 ) {
            this.closeEye();
            this.t = 0;
        }

        if( this.sampling !==0 ) this.composer.render();
        else renderer.render( this.scene, this.camera, this.renderTarget, true );


    }
}