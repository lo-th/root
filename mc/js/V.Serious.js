/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_|
*    @author l.th / http://lo-th.github.io/labs/
*/

V.Serious = function(Parent, w, h, debug, gui){
    this.main = Parent;
    this.w = w;
    this.h = h;
    this.debug = debug || false;
    this.gui = gui || false;

    this.time = 0;
    this.nTime = 1;
    this.nextTime = 0;
    this.timestep1 = 10;
    this.timestep2 = 20;
    this.numCopy = 4;
    this.current = 0;

    this.tell = "";

    this.copy = [];
    this.acc = [];

    this.currentVideo = '';




    this.layers = [];


    this.init();
}

V.Serious.prototype = {
    constructor: V.Serious,
    init:function () {
        this.seriously = new Seriously();
        this.texture = new THREE.WebGLRenderTarget( w,h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, depthBuffer:false, stencilBuffer:false, anisotropy:1 } );
        this.texture.generateMipmaps = false;

        this.reformat = this.seriously.transform('reformat');
        this.reformat.width = this.w;
        this.reformat.height = this.h;
        this.reformat.mode = 'cover';

        this.acc[0] = this.seriously.effect('accumulator');
        this.acc[0].opacity = 0.1;
        this.acc[0].source = this.reformat;

        this.invert = this.seriously.effect('invert');
        this.invert.source = this.acc[0];


      

        this.blur1 = this.seriously.effect('blur');
        this.blur1.amount = 0.1;
        this.blur1.source = this.invert;

        this.blur2 = this.seriously.effect('blur');
        this.blur2.amount = 0.2;
        this.blur2.source = this.invert;

        this.blur3 = this.seriously.effect('blur');
        this.blur3.amount = 0.3;
        this.blur3.source = this.invert;


        this.colorselx = this.seriously.effect('color-select');
        //this.colorsel.saturationMax = 0.5;
        this.colorselx.lightnessMax = 0.07;
        this.colorselx.lightnessMin = 0.05;
        this.colorselx.mask = true;
        this.colorselx.source = this.blur2;

        this.blurx = this.seriously.effect('blur');
        this.blurx.amount = 0.4;//44;
        this.blurx.source = this.colorselx;


        this.blend = this.seriously.effect('blend');
        this.blend.bottom = this.blur1;
        this.blend.top = this.blur2;
        this.blend.opacity = 1.0;
        this.blend.mode ='Lighten';//'add';

        this.blend2 = this.seriously.effect('blend');
        this.blend2.bottom = this.blur1;
        this.blend2.top = this.blur3;
        this.blend2.opacity =  1.0;
        this.blend2.mode = 'phoenix';

        this.blend3 = this.seriously.effect('blend');
        this.blend3.bottom = this.blend;
        this.blend3.top = this.blend2;
        this.blend3.opacity =  0.3;
        this.blend3.mode = 'add';

        this.blend4 = this.seriously.effect('blend');
        this.blend4.bottom = this.blur3;
        this.blend4.top = this.blur2;

        this.blend4.opacity =  1.0;
        this.blend4.mode = 'difference';//'difference';//'subtract';

        this.invert2 = this.seriously.effect('invert');
        this.invert2.source = this.blend4;

        this.blend5 = this.seriously.effect('blend');
        this.blend5.bottom = this.blend3;
        this.blend5.top = this.invert2;
        this.blend5.opacity =  0.8;
        this.blend5.mode = 'multiply';

        this.chromaEnd = this.seriously.effect('brightness-contrast');
        this.chromaEnd.brightness = filterSettings.finalBrightness;
        this.chromaEnd.contrast = filterSettings.finalContrast;
        this.chromaEnd.source = this.blend5;

        this.chroma2 = this.seriously.effect('brightness-contrast');
        this.chroma2.brightness = filterSettings.innerBrightness;
        this.chroma2.contrast = filterSettings.innerContrast;
        this.chroma2.source = this.blurx;

        this.blend7 = this.seriously.effect('blend');
        this.blend7.bottom = this.chromaEnd;
        this.blend7.top = this.chroma2;
        this.blend7.opacity =  filterSettings.innerBlend;
        this.blend7.mode = 'lightercolor';

        this.target = this.seriously.target(this.texture, { canvas:this.main.canvas });
        this.target.source = this.blend7;

        this.seriously.go(function (now) {
              
            }.bind(this));

        if(this.debug) this.initDebug();
    },
    timeCopy:function(n){
        var layer =  this.seriously.effect('layers');
        layer.source = this.invert;
        this.copy[n]  = layer;

        this.target.source =layer;
        /*
        if(n>2){
            var blend = this.seriously.effect('blend');
            blend.bottom = this.copy[n-1];
            blend.top = this.copy[n];
            blend.opacity = 0.5;
            blend.mode ='normal';
            this.target.source = blend;
        }*/

        /*var blend = this.seriously.effect('blend');
        blend.bottom = this.invert;
        blend.top = this.invert;
        blend.opacity = 0.5;
        blend.mode ='Lighten';*/
    },
    changeSetting:function(){
        for (var e in filterSettings) {
            if(e=='finalBrightness') serious.chromaEnd.brightness = filterSettings[e];
            if(e=='finalContrast') serious.chromaEnd.contrast = filterSettings[e];
            if(e=='innerBrightness') serious.chroma2.brightness = filterSettings[e];
            if(e=='innerContrast') serious.chroma2.contrast = filterSettings[e];
            if(e=='innerBlend') serious.blend7.opacity = filterSettings[e];
        }
    },
    changeSource:function(){
        if(filterSettings.staticImage){

            serious.acc[0].clear= true;
            serious.colorselx.lightnessMax = 0.00;
            serious.colorselx.lightnessMin = 0.05;
            var img = document.createElement('img');
            img.src = 'textures/fingers.jpg';
            img.onload = function(e){
                serious.reformat.source = img;
            }
        }else{
            
            serious.acc[0].clear= false;
            serious.colorselx.lightnessMax = 0.07;
            serious.colorselx.lightnessMin = 0.05;
            serious.reformat.source = serious.video;
        }
    },
    initDebug:function(){
        if(filterSettings.debug){
            var plane = new THREE.PlaneBufferGeometry( serious.w*0.02, serious.h*0.02 );
            var mat = new THREE.MeshBasicMaterial( { map: serious.texture } );
            mat.needsUpdate = true;

            var test = new THREE.Mesh( plane,  mat);
            test.position.set(0,10,-20);
            v.scene.add( test );
        } else {

        }
    },
    update:function(){
        this.main.renderer.setRenderTarget(this.texture);
        this.main.renderer.resetGLState();
    },
    importVideo:function(url){
        this.video = document.createElement('video');
        this.video.src = "videos/"+url;
        this.video.autoPlay = true;
        this.video.loop = true;
        this.video.play();

        //vid.pause();
        //vid.currentTime = window.pageYOffset/400;

        //video.addEventListener("play", function() {console.log(video.currentTime)
      //}, false);
        this.video.onplay = function(){
            //console.log(video.currentTime)
        }
        //this.tt = this.seriously.effect('accumulator');
        //this.tt.source = video;
        this.reformat.source = this.video;
    },
    importImage:function(url){
        var img = document.createElement('img');
        img.src = url;
        img.onload = function(e){
            this.reformat.source = img;
        }
    },
    importCamera:function(){
        var camera = seriously.source('camera');
        this.reformat.source = camera;
    }
}


/*setTimeout(function(){
    document.getElementById("myVideo").play();
}, 5000)*/