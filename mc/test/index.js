var container = null;
var info = document.getElementById('info');
var list = null;
var radio = [], n;
var s = [];
var visualizer;

var radioList = [
  {name:"micro", rate:128, url:"micro"},
  {name:"Dark Ambient", rate:128, url:"http://212.72.187.16:22018"},
  {name:"Ambient Sleeping", rate:128, url:"http://50.7.96.138:8666"},
  {name:"Bassdrive", rate:128, url:"http://50.7.70.66:8200"},
  {name:"DnBHeaven", rate:128, url:"http://91.121.138.222:8000"},
  {name:"Plusuradio", rate:128, url:"http://46.165.204.135:8001"},
  {name:"DnNradio", rate:128, url:"http://78.46.75.50:10128/serv1"},
  {name:"Psychedelic", rate:128, url:"http://195.154.86.144:8002"},
  {name:"BestMusicEver", rate:128, url:"http://listen.radionomy.com/BestMusicEver"},
  {name:"psytrance", rate:128, url:"http://81.88.37.2:8030"}
];

window.onload = init;
function init(){

    container = document.createElement( 'div' );
    container.style.cssText = 'position:absolute; top:3px; left:3px; width:459px; height:459px; background-color:#222; pointer-events:none; border-radius:30px; border:1px solid #444;';
    document.body.appendChild(container);

    list = document.createElement( 'div' );
    list.style.cssText = 'position:absolute; top:20px; left:10px; width:180px; height:190px; border:none; text-align:center; display: block; overflow:hidden; overflow-x: hidden; overflow-y: auto; overflow : -moz-scrollbars-vertical; border:1px solid #444; pointer-events:auto;';
    container.appendChild(list);

    for(var i=0; i<radioList.length; i++){
    	radio[i] = document.createElement( 'div' );
    	radio[i].style.cssText = "height:20px; width:140px; border:2px solid #434343; position:relative; display:inline-block; background:#353535; margin: 2px 2px; padding: 5px 5px; cursor:pointer;";
    	radio[i].innerHTML = radioList[i].name;
    	radio[i].id = i;
    	radio[i].addEventListener( 'mousedown', function ( event ) { event.preventDefault(); playSound(this.id); this.style.backgroundColor =  "#fd9916";}, false );
    	radio[i].addEventListener( 'mouseover', function ( event ) { event.preventDefault(); this.style.backgroundColor = "#9d590e" }, false );
    	radio[i].addEventListener( 'mouseout', function ( event ) { event.preventDefault();  this.style.backgroundColor = "#353535"; }, false ); 
    	list.appendChild( radio[i] );
	}

	visualizer = new SOUND.Visualizer();

	s[0] = new UI.Slide(container, "lowGain", visualizer.changeGain, 100, [230,40, 150, 20]);
	s[1] = new UI.Slide(container, "midGain", visualizer.changeGain, 100, [230,80, 150, 20]);
	s[2] = new UI.Slide(container, "highGain", visualizer.changeGain, 100, [230,120, 150, 20]);
}



function error() {
    alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia = 
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}
function playSound(N){
    n = N;
    //visualizer.load(radioList[n].url+"");
    visualizer.load(radioList[n].url);//+"/;");
    //visualizer.load(radioList[n].url+"/;stream/1");
    //visualizer.load(radioList[n].url+"/;stream");
}

var SOUND = {};

SOUND.Visualizer = function () {

	this.v = {l:1, m:1, h:1};

	this.context =  new (window.AudioContext || window.webkitAudioContext || window.MozAudioContext || window.oAudioContext || window.msAudioContext)();
	this.init_BandFilter();
	this.analyser = this.context.createAnalyser();

    this.w = 212;//437;
    this.h = 208;//260;
    this.inPlay = false;
    
    this.audio = null;
    this.timer = null;
    this.data = null;

    this.canvas =  document.createElement("canvas");
    this.canvas.style.cssText = 'position:absolute; bottom:10px; left:10px; width:'+this.w+'px; height:'+this.h+'px; border:1px solid #444; pointer-events:none;  border-radius : 30px;';
    
    this.canvas2 =  document.createElement("canvas");
    this.canvas2.style.cssText = 'position:absolute; bottom:10px; right:10px; width:'+this.w+'px; height:'+this.h+'px; border:1px solid #444; pointer-events:none; border-radius : 30px;';

    this.ctx = this.canvas.getContext("2d");
    this.ctx2 = this.canvas2.getContext("2d");

    container.appendChild(this.canvas2);
    container.appendChild(this.canvas);

    this.tempCanvas = document.createElement("canvas");
	this.tempCtx = this.tempCanvas.getContext("2d");

    this.canvas.width = this.canvas2.width = this.tempCanvas.width = this.w;
    this.canvas.height = this.canvas2.height = this.tempCanvas.height = this.h;

    this.fillBlack(this.ctx);
    this.fillBlack(this.ctx2);
    this.fillBlack(this.tempCtx); 
}

SOUND.Visualizer.prototype = {
    constructor: SOUND.Visualizer,
    load : function (url) {
    	var _this = this;
        if(this.inPlay)this.stop();

        this.audio = document.createElement("audio");

        

        //var errorCallback =  function(e) { console.log('error')}

        if(url=='micro'){
             getUserMedia({audio: true}, function(stream) {
                this.source = this.context.createMediaStreamSource(stream);
                this.play();
            }.bind(this));
        }else{
            //new Audio();
            this.audio.src = url+'/;stream.ogg';
            this.audio.autoplay = 'autoplay';

            //window.addEventListener('load', this.onload.bind(this), false);
           // window.addEventListener('load', function(){this.onload();}.bind(this), false);
            //this.audio.preload = 'metadata';
          // this.source = this.context.createMediaElementSource( this.audio );
           // this.play()
            //this.audio.onloadedmetadata = function(e) {
               // this.source = this.context.createMediaStreamSource(this.audio);//
                //this.source = this.context.createMediaElementSource( this.audio );
                //this.play();
            //}.bind(this)
        }

       

        



        
        
       
        //this.source = this.context.createMediaStreamSource( this.audio );
        //this.source = this.context.createBufferSource();
    },
    onload  : function () {
        this.source = context.createMediaElementSource(this.audio);
        this.play();
    },
    init_BandFilter : function () {
    	this.gainDb = 0;//-40;//-40.0;
	    this.bandSplit = [1000,3600]//[360,3600];//

	    this.volume = this.context.createBiquadFilter();
        this.volume.type = "highshelf";
        this.volume.frequency.value = 1000;
        this.volume.gain.value = 0;

	    //this.bandSplit = [1000,3600];
    	this.hBand = this.context.createBiquadFilter();
		this.hBand.type = "lowshelf";
		this.hBand.frequency.value = this.bandSplit[0];
		this.hBand.gain.value = this.gainDb;

		this.hInvert = this.context.createGain();
		this.hInvert.gain.value = -1.0;

		this.mBand = this.context.createGain();

		this.lBand = this.context.createBiquadFilter();
		this.lBand.type = "highshelf";
		this.lBand.frequency.value = this.bandSplit[1];
		this.lBand.gain.value = this.gainDb;

		this.lInvert = this.context.createGain();
		this.lInvert.gain.value = -1.0;
    },
    set_BandFilter : function () {

		this.source.connect(this.lBand);
		this.source.connect(this.mBand);
		this.source.connect(this.hBand);

		this.hBand.connect(this.hInvert);
		this.lBand.connect(this.lInvert);

		this.hInvert.connect(this.mBand);
		this.lInvert.connect(this.mBand);

		this.lGain = this.context.createGain();
		this.mGain = this.context.createGain();
		this.hGain = this.context.createGain();

		this.lGain.gain.value = this.v.l;
		this.mGain.gain.value = this.v.m;
		this.hGain.gain.value = this.v.h;

		this.lBand.connect(this.lGain);
		this.mBand.connect(this.mGain);
		this.hBand.connect(this.hGain);

		this.sum = this.context.createGain();
		this.lGain.connect(this.sum);
		this.mGain.connect(this.sum);
		this.hGain.connect(this.sum);
		this.sum.connect(this.analyser);
		//this.sum.connect(this.context.destination);

		//this.source.connect(this.volume);
		//this.volume.connect(this.context.destination);
		

    },
    changeGain : function (v,type,t) {
    	if(!t.inPlay) return;
    	var value = v/100.0;
    	switch(type){
		    case 'lowGain': t.lGain.gain.value = value; t.v.l = value; break;
		    case 'midGain': t.mGain.gain.value = value; t.v.m = value;break;
		    case 'highGain': t.hGain.gain.value = value; t.v.h = value; break;
		    //case 'volume': this.volume.gain.value = value; break;
		}
		console.log(t.lGain.gain.value);
    },
    play : function () {
    	if(this.source){
                this.source.connect( this.analyser );
                this.analyser.connect( this.context.destination );
                this.set_BandFilter();
                this.audio.play();
                var _this = this;
                this.data = new Uint8Array( this.analyser.frequencyBinCount );
                this.timer = setInterval(function() { _this.update(); }, 1000 / 60);
                this.inPlay=true;
            }
    },
    stop :function() {
        this.audio.pause();
        this.audio.src = '';
        clearInterval(this.timer);
        
        this.fillBlack(this.ctx);
        this.fillBlack(this.ctx2);
        this.fillBlack(this.tempCtx);

        this.inPlay=false;
    },
    update : function () {
        
        this.analyser.getByteTimeDomainData(this.data);
        this.time_domain_render();
        this.analyser.getByteFrequencyData( this.data );
        this.frequency_render();
        this.spectrogram_render();
    },
    fillBlack : function(c){
    	c.clearRect( 0, 0, this.w, this.h );
    	c.beginPath();
    	c.fillStyle = '#000000';
    	c.fillRect(0,0,this.w, this.h);
    },
    time_domain_render : function () {
        this.ctx.clearRect( 0, 0, this.w, this.h );
        this.ctx.beginPath();
        
        var i =  this.data.length;
        var max = i-1;
        
        while(i--){
            var val = this.data[i];
            var x = i * ( this.w / 1024 );
            var y = this.h-(val*this.h)/255;
            if( i == max ) this.ctx.moveTo(x,y);
            else this.ctx.lineTo(x,y);
            
        }
        this.ctx.strokeStyle = "#0020FF";
        this.ctx.stroke();
    },
    frequency_render : function () {
        
        this.ctx.beginPath();
        
        var i = this.data.length;
        var max = i-1;
        
        while(i--){
            var val = this.data[i];
            var x = i * ( this.w / 1024 );
            var y = this.h-(val*this.h)/255;
            if( i == max ) this.ctx.moveTo(x,y);
            else this.ctx.lineTo(x,y);
        }

        this.ctx.strokeStyle = "#00FFFF";
        this.ctx.stroke();
    },
    spectrogram_render : function () {

    	this.tempCtx.drawImage(this.canvas2, 0, 0, this.w, this.h);
        this.ctx2.clearRect ( 0 , 0 , this.w, this.h );
        var i = this.data.length;
        while(i--){
            //var val = this.data[i];//
            var val = this.data[i]; 
            var y = this.h-((i*100)/this.h);
            //var x = i * ( this.canvas_w / 1024 );
            //var y = this.canvas_h - val;
            
            if(val<100)this.ctx2.fillStyle = 'rgba('+0+','+0+','+val+', 1)';//'#'+val.toString(16);//this.hot.getColor(val).hex();
            else if(val<200)this.ctx2.fillStyle = 'rgba('+0+','+(val-100)+','+val+', 1)';
            else this.ctx2.fillStyle = 'rgba('+(val-200)+','+val+','+val+', 1)';
            //this.ctx2.fillRect(250 - 1, 400 - i, 1, 1);
            //this.ctx2.fillRect( this.w - 1,  this.h - i, 1, 1);
            this.ctx2.fillRect( this.w - 1,  y, 1, 1);
        }
        this.ctx2.translate(-1, 0);
        this.ctx2.drawImage( this.tempCanvas, 0, 0, this.w, this.h, 0, 0, this.w, this.h);
        // reset the transformation matrix
        this.ctx2.setTransform(1, 0, 0, 1, 0, 0);

    }
}

var UI = {};

UI.Slide = function(target, name, endFunction, value, set , max, min, type, num){
this.colors = ['rgba(220,220,220,1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)', 'rgba(200,200,200,0.6)', 'rgba(200,200,200,1)'];
this.radius = "-moz-border-radius: 16px; -webkit-border-radius: 16px; border-radius: 16px;";
this.num = num || 0;
this.min = min || 0;
this.max = max || 100;
this.name = name || "slider";
this.type = type || '%';
this.valueRange = this.max - this.min;
this.set = set || [20,100,180,20];
this.endFunction = endFunction || null; 
this.w = this.set[2]-10;
this.value = value || 0;
this.add(target);
};

UI.Slide.prototype = {
constructor: UI.Slide,
add:function(target){
    var _this = this;
    var txt = document.createElement( 'div' );
    var bg = document.createElement( 'div' );
    var sel = document.createElement( 'div' );
    bg.style.cssText = this.radius+'position:absolute; left:'+this.set[0]+'px; top:'+this.set[1]+'px; padding:0; cursor:w-resize; pointer-events:auto; width:'+this.set[2]+'px; height:'+this.set[3]+'px; background-color:'+ this.colors[1]+';';
    txt.style.cssText ='position:absolute; left:0px; top:-18px; pointer-events:none; width:'+this.set[2]+'px; height:20px; font-size:12px; color:'+this.colors[0]+'; text-align:center;';
    sel.style.cssText = this.radius+'position:absolute; pointer-events:none; margin:5px; width:100px; height:10px; background-color:'+this.colors[3]+';';
    
    bg.appendChild( sel );
    bg.appendChild( txt );
    bg.name = this.name;
    bg.id = this.name;

    target.appendChild( bg );
    bg.className = "up";
    bg.addEventListener( 'mouseout',  function(e){ e.preventDefault(); this.className = "up"; this.style.backgroundColor = _this.colors[1]; this.childNodes[0].style.backgroundColor = _this.colors[3]; }, false );
    bg.addEventListener( 'mouseover', function(e){ e.preventDefault(); this.style.backgroundColor = _this.colors[2]; this.childNodes[0].style.backgroundColor = _this.colors[4];}, false );
    bg.addEventListener( 'mouseup',   function(e){ e.preventDefault(); this.className = "up"; }, false );
    bg.addEventListener( 'mousedown', function(e){ e.preventDefault(); this.className = "down"; _this.drag(this, e.clientX); }, false );
    bg.addEventListener( 'mousemove', function(e){ e.preventDefault(); _this.drag(this, e.clientX); } , false );

    this.sel = sel;
    this.txt = txt;
    this.updatePosition();
},

updatePosition:function(){
    this.sel.style.width = (this.w * ((this.value-this.min)/this.valueRange))+'px';
    this.txt.innerHTML = this.name+" "+this.value+this.type;
},

drag:function(t, x){
    if(t.className == "down"){
        var rect = t.getBoundingClientRect();
        this.value = ((((x-rect.left-4)/this.w)*this.valueRange+this.min).toFixed(this.num))/1;
        if(this.value<this.min) this.value = this.min;
        if(this.value>this.max) this.value = this.max;
        this.updatePosition();
        if(this.endFunction!==null)this.endFunction(this.value, this.name, visualizer);
    }
}
};