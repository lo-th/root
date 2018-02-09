
V.Head = function ( type, txt, meshs ) {

    this.type = type;
    this.txt = txt;

    this.eyeY = -5;//this.type === 'man' ? -5.76 : -20.75

    this.multy = 1;
    this.sampling = 0;//4;

    this.t = 0;

    this.plane = new THREE.PlaneBufferGeometry( 33, 33 );

    this.mouthGroup = new THREE.Group();
    this.eyeRGroup = new THREE.Group();
    this.eyeLGroup = new THREE.Group();

    this.eyeRGroup.position.set( -34, this.eyeY, 0 );
    this.eyeLGroup.position.set( 34, this.eyeY, 0 );


    this.sett = {
        blink : 1,
    }

    var PI90 = 1.570796326794896;
    var PI = 3.141592653589793;

    // [ skin, skin2, hair ];
    var colors = [ 0x895837, 0x70472B, 0x3A160A, 0x24951b ];
    if(type === 'man' ) colors = [ 0xB1774F, 0xA36D47, 0x613207, 0x196895];


    this.w = 512 * this.multy;
    this.h = 512 * this.multy;
    this.mw = this.w * 0.5;
    this.mh = this.h * 0.5;

    var txtEye = this.makeMapEye();

    // Material

    this.mat = {

        skin: new THREE.MeshBasicMaterial({ color:colors[0] }),//map: this.type === 'man' ? this.txt.head_m : this.txt.head_w }),
        skinMorph: new THREE.MeshBasicMaterial({ color:colors[0], morphTargets:true, side: THREE.DoubleSide }),

        mapMouth: new THREE.MeshBasicMaterial({ map:this.txt.m_theo, morphTargets:true, transparent:true, depthWrite:false, depthTest:false }),
        mapEye: new THREE.MeshBasicMaterial({ map:this.txt.e_theo, morphTargets:true, transparent:true, side: THREE.DoubleSide }),

        colors: new THREE.MeshBasicMaterial({ map: this.type === 'man' ? this.txt.color_m : this.txt.color_w , side: THREE.DoubleSide }),
        Mcolors: new THREE.MeshBasicMaterial({ map: this.type === 'man' ? this.txt.color_m : this.txt.color_w , side: THREE.DoubleSide, morphTargets:true }),
        pup : new THREE.MeshBasicMaterial({ map:txtEye, alphaTest:0.5  }),
        black : new THREE.MeshBasicMaterial({ color:0x000000 }),
        white: new THREE.MeshBasicMaterial({ color:0xFFFFFF }),
        Mwhite: new THREE.MeshBasicMaterial({ color:0xFFFFFF, morphTargets:true, side: THREE.DoubleSide }),
        
    };

    //

    this.camera = new THREE.OrthographicCamera( -256, 256, 256, -256, 0, 200 );
    this.camera.position.z = 100;

    this.scene  = new THREE.Scene();

    this.scene.background = this.txtHead(colors[0]); 

    this.root = new THREE.Group();

    this.scene.add( this.root );
    this.root.add( this.camera );

    this.root.scale.set( this.multy, this.multy, this.multy );

    // mesh

    var m = {

        eyePupL: new THREE.Mesh( this.plane, this.mat.pup ),//meshs.pupil.clone(),
        eyePupR: new THREE.Mesh( this.plane, this.mat.pup ),// meshs.pupil.clone(),

        mouthMask: meshs.gg.clone(),
        mouth: meshs.gg.clone(),
        tooth: meshs.tooth.clone(),

        eyeMaskL: meshs.gg.clone(),
        eyeMaskR: meshs.gg.clone(),
        eyeL: meshs.gg.clone(),
        eyeR: meshs.gg.clone(),

        //eyeL: this.type === 'man' ? meshs.eye_m.clone() : meshs.eye_w.clone(),
        //eyeR: this.type === 'man' ? meshs.eye_m.clone() : meshs.eye_w.clone(),

        noz: this.type === 'man' ? meshs.noz_m.clone() : meshs.noz_w.clone(),
        //mouth: this.type === 'man' ? meshs.mouth_m.clone() : meshs.mouth_w.clone(),

    };

    // apply materials

    m.eyeMaskL.material = this.mat.skinMorph;
    m.eyeMaskR.material = this.mat.skinMorph;

    //m.eyePupL.material = this.mat.pup;
    //m.eyePupR.material = this.mat.pup;
    //m.eyePupL.children[0].material = this.mat.black;
   // m.eyePupR.children[0].material = this.mat.black;

    //m.eyePupL.scale.set( 2, 1, 2 );
    //m.eyePupR.scale.set( 2, 1, 2 );

    m.eyeL.material = this.mat.mapEye;
    m.eyeR.material = this.mat.mapEye;

    m.noz.material = this.mat.colors;
    m.mouth.material = this.mat.mapMouth;
    m.mouthMask.material = this.mat.skinMorph;
    m.tooth.material = this.mat.Mwhite;

    //m.eyeL.rotation.y = PI90 *2;
    //m.eyeR.rotation.y = PI90 *2;
    m.noz.rotation.y = PI90 *2;
    
    m.noz.position.set(0,0,0);

    //
    //m.eyeL.position.set( 40, this.eyeY, 0 );
   // m.eyeR.position.set( -40, this.eyeY, 0 );

    
    
    // add all object to scene

    //for ( var o in m )  this.root.add( m[o] );




    //var bgR = new THREE.Mesh(this.plane, this.mat.white );
    //var bgL = new THREE.Mesh(this.plane, this.mat.white );
    //bgR.scale.multiplyScalar(90);
    //bgL.scale.multiplyScalar(90);
    //bgR.position.set(0,0,5)
    //bgL.position.set(0,0,5)

   // m.eyeMaskL.position.set(0,0,7)
    //m.eyeMaskR.position.set(0,0,7)
    //m.eyeMaskL.scale.multiplyScalar(0.4);
    //m.eyeMaskR.scale.multiplyScalar(0.4);
    m.eyeMaskL.rotation.z = PI;
    m.eyeMaskR.rotation.z = PI;
    m.eyeMaskR.scale.x *= -1;

    m.eyeMaskL.position.set(0,0,-1)
    m.eyeMaskR.position.set(0,0,-1)

    m.eyeL.position.set(0,0,0)
    m.eyeR.position.set(0,0,0)
    //m.eyeL.scale.multiplyScalar(0.4);
    //m.eyeR.scale.multiplyScalar(0.4);
    m.eyeL.rotation.z = PI;
    m.eyeR.rotation.z = PI;
    m.eyeR.scale.x *= -1;

    //this.eyeLGroup.add( bgL );
    //this.eyeRGroup.add( bgR );
    this.eyeLGroup.add( m.eyeMaskL );
    this.eyeRGroup.add( m.eyeMaskR );

    //m.eyeMaskL.position.z = -5;
    //m.eyeMaskR.position.z = -5;
    m.eyePupL.position.z = -10;
    m.eyePupR.position.z = -10;

    this.eyeLGroup.add( m.eyePupL );
    this.eyeRGroup.add( m.eyePupR );
    this.eyeLGroup.add( m.eyeL );
    this.eyeRGroup.add( m.eyeR );

    this.eyeLGroup.scale.set( 0.4, 0.4, 1 );
    this.eyeRGroup.scale.set( 0.4, 0.4, 1 );

    this.eyeLGroup.position.z = 20;
    this.eyeRGroup.position.z = 20;


    //

    var bgM = new THREE.Mesh( this.plane, this.mat.black );
    bgM.position.set(0,0,1)

    //m.mouthMask.position.set(0,0,3)
    //m.mouthMask.rotation.z = PI;
    
    m.tooth.position.set(0,0,2);
    m.tooth.rotation.y = PI;

    m.mouth.position.set(0,0,0);
    m.mouth.rotation.z = PI;

    this.mouthGroup.position.y = 60;
    this.mouthGroup.position.z = 20;

    //this.mouthGroup.scale.set( 0.6, 0.6, 1 );
    this.mouthGroup.scale.set( 1, 1, 1 );
    //this.mouthGroup.add( bgM );
    //this.mouthGroup.add( m.mouthMask );
    this.mouthGroup.add( m.mouth );
    //this.mouthGroup.add( m.tooth );


    //

    //this.eyeRGroup.position.z=5;
    //this.eyeLGroup.position.z=5;



    this.root.add( this.eyeRGroup )//.position.set( 40, this.eyeY, 0 );
    this.root.add( this.eyeLGroup );
    this.root.add( this.mouthGroup );

    

    this.mesh = m;

    // background

    //this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 512, 512 ), this.mat.skin );
    //this.quad.frustumCulled = false; // Avoid getting clipped
    //this.root.add( this.quad );

    //

   // var parameters = { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
    var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false, depthBuffer:true, anisotropy:16 };

    this.renderTarget = new THREE.WebGLRenderTarget( this.w, this.h, parameters );
    //this.renderTarget.texture.generateMipmaps = false;



    /*this.composer = new THREE.EffectComposer( renderer, this.renderTarget );
    this.ssaaRenderPass = new THREE.SSAARenderPass( this.scene, this.camera );
    this.ssaaRenderPass.unbiased = false;
    this.ssaaRenderPass.sampleLevel = this.sampling * 0.5;
    this.composer.addPass( this.ssaaRenderPass );*/


    this.morphMouth( "close", 1 );



}

V.Head.prototype = {

    txtHead: function () {

        var c = document.createElement("canvas");
        c.width = 512 * this.multy; c.height = 512 * this.multy;
        var ctx = c.getContext("2d");

        var grd=ctx.createLinearGradient(0,0,0,c.height);
        grd.addColorStop(0.56,"#000000");
        grd.addColorStop(0.55,"#B1774F");
grd.addColorStop(0.45,"#B1774F");
grd.addColorStop(0.42,"#a3714f");

        ctx.beginPath();
        ctx.rect(0, 0, c.width, c.height );
        ctx.fillStyle =grd;//'#B1774F';
        ctx.fill();

        var texture = new THREE.Texture(c);
        texture.needsUpdate = true;
        return texture;


    },

    makeMapEye: function () {
        var c = document.createElement("canvas");
        c.width = 64; c.height = 64;
        var ctx = c.getContext("2d");

        ctx.beginPath();
        ctx.rect(0, 0, 64, 64);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc( 32, 32, 30, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'white';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc( 32, 32, 12, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'black';
        ctx.fill();
        
        var texture = new THREE.Texture(c);
        texture.needsUpdate = true;
        return texture;
    },

    initMouth: function () {



    },

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
        this.mesh.eyeMaskR.setWeight( t, v );
        this.mesh.eyeMaskL.setWeight( t, v );

    },

    morphMouth: function ( t, v ) {

        this.mesh.mouth.setWeight( t, v );
        this.mesh.mouthMask.setWeight( t, v );
        this.mesh.tooth.setWeight( t, v );

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

        this.mesh.eyePupL.position.set( (x*8) * 2.5, (y*8) * 2, -5 );
        this.mesh.eyePupR.position.set( (x*8) * 2.5, (y*8) * 2, -5 );

        //this.mesh.eyePupL.position.set( -39 + x*8, this.eyeY+(y*8), 5 );
        //this.mesh.eyePupR.position.set( 39 + x*8, this.eyeY+(y*8), 5 );

        if(this.t === 400 ) {
            this.closeEye();
            this.t = 0;
        }

        //if( this.sampling !==0 ) this.composer.render();
        //else 

        renderer.render( this.scene, this.camera, this.renderTarget, true );


    }
}