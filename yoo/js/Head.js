
V.Head = function ( type, txt, meshs ) {

    this.renderer = view.getRenderer();

    this.type = type;
    this.txt = txt;

    this.eyeY =  this.type === 'man' ? -5.76 : -20.75

    this.multy = 1;//isMobile ? 0.5 : 1;
    this.sampling = isMobile ? 0 : 4;

    this.t = 0;

    this.sett = {
        blink : 1,
    }

    var PI90 = 1.570796326794896;

    // [ skin, skin2, hair ];
    var colors = [ 0x895837, 0x70472B, 0x3A160A, 0x24951b ];
    if(type === 'man' ) colors = [ 0xB1774F, 0xA36D47, 0x613207, 0x196895];


    this.w = 512 * this.multy;
    this.h = 512 * this.multy;
    this.mw = this.w * 0.5;
    this.mh = this.h * 0.5;

    // Material

    this.mat = {

        skin: new THREE.MeshBasicMaterial({ map: this.type === 'man' ? this.txt.head_m : this.txt.head_w }),
        colors: new THREE.MeshBasicMaterial({ map: this.type === 'man' ? this.txt.color_m : this.txt.color_w , side: THREE.DoubleSide}),
        Mcolors: new THREE.MeshBasicMaterial({ map: this.type === 'man' ? this.txt.color_m : this.txt.color_w , side: THREE.DoubleSide, morphTargets:true }),
        pup : new THREE.MeshBasicMaterial({ color:this.type === 'man' ? 0x280d04 : 0x280d04 }),
        black : new THREE.MeshBasicMaterial({ color:0x000000 }),
        
    };

    //

    this.camera = new THREE.OrthographicCamera( -256, 256, 256, -256, 0, 200 );
    this.camera.position.z = 100;

    this.scene  = new THREE.Scene();

    this.root = new THREE.Group();

    this.scene.add( this.root );
    this.root.add(this.camera);

    this.root.scale.set( this.multy, this.multy, this.multy );

    // mesh

    var m = {

        eyePupL: meshs.pupil.clone(),
        eyePupR: meshs.pupil.clone(),

        eyeL: this.type === 'man' ? meshs.eye_m.clone() : meshs.eye_w.clone(),
        eyeR: this.type === 'man' ? meshs.eye_m.clone() : meshs.eye_w.clone(),

        noz: this.type === 'man' ? meshs.noz_m.clone() : meshs.noz_w.clone(),
        mouth: this.type === 'man' ? meshs.mouth_m.clone() : meshs.mouth_w.clone(),

    };

    // apply materials

    m.eyePupL.material = this.mat.pup;
    m.eyePupR.material = this.mat.pup;
    m.eyePupL.children[0].material = this.mat.black;
    m.eyePupR.children[0].material = this.mat.black;

    m.eyeL.material = this.mat.Mcolors;
    m.eyeR.material = this.mat.Mcolors;

    m.noz.material = this.mat.colors;
    m.mouth.material = this.mat.Mcolors;

    m.eyeL.rotation.y = PI90 *2;
    m.eyeR.rotation.y = PI90 *2;
    m.noz.rotation.y = PI90 *2;
    m.mouth.rotation.y = PI90 *2;

    m.mouth.position.set(0,0,0);
    m.noz.position.set(0,0,0);

    this.revers( m.eyeR );
    m.eyeL.position.set( 40, this.eyeY, 0 );
    m.eyeR.position.set( -40, this.eyeY, 0 );

    
    
    // add all object to scene

    for ( var o in m )  this.root.add( m[o] );

    

    this.mesh = m;

    // background

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 512, 512 ), this.mat.skin );
    //this.quad.frustumCulled = false; // Avoid getting clipped
    this.root.add( this.quad );

    //

    var parameters = { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
    //var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false, depthBuffer:true, anisotropy:1 };

    this.renderTarget = new THREE.WebGLRenderTarget( this.w, this.h, parameters );
    //this.renderTarget.texture.generateMipmaps = false;



    this.composer = new THREE.EffectComposer( this.renderer, this.renderTarget );
    this.ssaaRenderPass = new THREE.SSAARenderPass( this.scene, this.camera );
    this.ssaaRenderPass.unbiased = false;
    this.ssaaRenderPass.sampleLevel = this.sampling * 0.5;
    this.composer.addPass( this.ssaaRenderPass );


    //this.morphMouth( "close", 1 );

    this.update();



}

V.Head.prototype = {

    setSize: function ( v ) {
        var n;

        if(v ==='512') n = 1;
        if(v ==='1024') n = 2;


        if( this.multy!==n ) this.multy = n;
        else return;

        this.w = 512 * this.multy;
        this.h = 512 * this.multy;
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

        //var morph = ['_open', '_close', '_sad', '_happy' ];
        var morph = ['_close' ];

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

        this.mesh.eyeL.setWeight( t, v );
        this.mesh.eyeR.setWeight( t, v );

        this.update();

    },

    morphMouth: function ( t, v ) {

        this.mesh.mouth.setWeight( t, v );

        this.update();


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

        x = x || 0;
        y = y || 0;

        this.t++;

        this.mesh.eyePupL.position.set( -39 + x*8, this.eyeY+(y*8), 5 );
        this.mesh.eyePupR.position.set( 39 + x*8, this.eyeY+(y*8), 5 );

        /*if(this.t === 400 ) {
            this.closeEye();
            this.t = 0;
        }*/

        if( this.sampling !==0 ) this.composer.render();
        else this.renderer.render( this.scene, this.camera, this.renderTarget, true );


    },

    setEyeSize:function ( s ){

        this.mesh.eyeL.scale.set( s, s, s);
        this.mesh.eyeR.scale.set( -s, s, s);
        
    },

    setMouthSize:function ( s ){

        this.mesh.mouth.scale.set( s, s, s);
        this.mesh.mouth.position.y = ((1-s) * 80)
        
    }
}