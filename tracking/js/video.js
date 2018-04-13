var video = ( function () {

    "use strict";

    var ua = window.navigator.userAgent;
	var isIOS11 = (ua.indexOf("iPad") > 0 || ua.indexOf("iPhone") > 0) && ua.indexOf("OS 11_") > 0;

	var source, mediaStream, constraints;
	var content, canvas, canvasOver, ctx, ctxOver, timebare, timebareIn;

	var width = 640;
	var height = 480;
	var ratio = 1;
	var invratio = 1;
	var px = 0;
	var isVideo = false;
	var isRever = false;
	var isDown = false;
	var isPlaying = false;
	var callback = null;

	var resolution = { width:width, height:height };
	var videoRes = { width:width, height:height };

    video = {

	setting: {
		isIOS11: isIOS11,
		width:width, 
		height:height,
		zoom:1,
		midX:320,
		midY:240,
		top:false,
	},

	init: function () {

		source = document.createElement('video');
		//mediaSource = new MediaSource();
		//this.constraints = { audio: false, video: {width: w, height: h, frameRate: 30}  };
		constraints = { audio: false, video: {frameRate: 30}  };

		content = document.createElement('div');
		content.style.cssText = 'position:absolute; left:50%; opacity: 0.25; margin-left:-320px; width:640px; height:480px;'

		canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		canvas.style.cssText = 'position:absolute; left:0; top:0px opacity: 0.25;';
		ctx = canvas.getContext("2d");

		canvasOver = document.createElement('canvas');
		canvasOver.width = width;
        canvasOver.height = height;
		canvasOver.style.cssText = 'position:absolute; left:0; top:0px opacity: 1;';
		ctxOver = canvasOver.getContext("2d");

		content.appendChild(canvas);
		content.appendChild(canvasOver);

		document.body.appendChild( content );
		this.resize()

	},

	reset: function () {

		if(!isPlaying) return;

		source.stop();

	},

	load: function ( Callback, url ) {

		callback = Callback || function(){}

		source.src = url;
		source.format = 'video/mp4';
		source.play();
		isVideo = true;
		isRever = false;
		isPlaying = true;
		
		video.takeDimension();

	},

	webcam: function ( Callback ) {

		callback = Callback || function(){}

		navigator.mediaDevices.getUserMedia(constraints)
		.then( function( stream ){ mediaStream = stream;  source.srcObject = mediaStream; } )
		.catch( function(error){ console.log('getUserMedia error: ' + error.name, error); }.bind(this) );
		source.play();
		isVideo = false;
		isRever = true;
		isPlaying = true;

		video.takeDimension();

	},

	restartWebcam: function(){

		if(isVideo) return;

		navigator.mediaDevices.getUserMedia(constraints)
		.then( function( stream ){ mediaStream = stream;  source.srcObject = mediaStream; } )
		.catch( function(error){ console.log('getUserMedia error: ' + error.name, error); }.bind(this) );

		source.play();
		isPlaying = true;

	},

	takeDimension: function(){

		if (source.videoWidth === 0) {
			setTimeout( video.takeDimension, 100);
		} else {

			console.log(source.videoWidth, source.videoHeight)

			videoRes.width = source.videoWidth
			videoRes.height = source.videoHeight

			// on iOS we want to close the video stream first and
			// wait for the heavy BRFv4 initialization to finish.
			// Once that is done, we start the stream again.
			// Otherwise the stream will just stop and won't update anymore.

			if(isIOS11 && !isVideo) {
				source.pause();
				source.srcObject.getTracks().forEach(function(track) { track.stop(); });
				isPlaying = false;
			}

			if(isVideo) video.addBare();

			if( videoRes.width > resolution.width ){
				video.setting.midX = Math.floor(videoRes.width*0.5)
			}

			if( videoRes.height > resolution.height ){
				video.setting.midY = Math.floor(videoRes.height*0.5)
			}

			callback()

		}

	},

	resize: function(){

		if(content)px = content.getBoundingClientRect().left;

	},

	mouseMove: function(e){

		if(!isDown) return;
    	var x = Math.floor(e.pageX - px - 10); 
    	x = x<0?0:x;
    	x = x>630?630:x;
    	source.currentTime = x*invratio;

	},

	addBare: function(){

		ratio = 630 / source.duration;
		invratio = source.duration / 630  ;

		timebare = document.createElement('div');
	    timebare.style.cssText = 'position:absolute; left:0px; top:0px; width:640px; height:40px; background:rgba(255,255,255,0); pointer-event:auto; cursor:pointer;'

	    timebareIn = document.createElement('div');
	    timebareIn.style.cssText = 'position:absolute; left:5px; top:5px; width:0px; height:10px; background:#f80; pointer-event:none;'

	    timebare.addEventListener('mouseover', function(e) { timebareIn.style.background ='#f00' }.bind(this), false );
        timebare.addEventListener('mouseout', function(e) { timebareIn.style.background ='#f80' }.bind(this), false );
	    timebare.addEventListener("mousedown", function(e) { isDown = true; source.pause(); video.mouseMove(e);}.bind(this));
	    timebare.addEventListener("mouseup", function(e) { isDown = false; source.play() }.bind(this));

	    timebare.addEventListener("mousemove", video.mouseMove );

		source.addEventListener("timeupdate", function() { timebareIn.style.width = (ratio * source.currentTime)+'px'; }.bind(this));

		timebare.appendChild(timebareIn);
		content.appendChild(timebare);

	},

	getImage: function(){

		if(!isPlaying) return null;


		var z = 1 / this.setting.zoom;

		var x = Math.floor(this.setting.midX-((resolution.width*z)*0.5))
		var y = Math.floor(this.setting.midY-((resolution.height*z)*0.5))
		if(this.setting.top) y = Math.floor(((resolution.height*z)*0.25))

		ctx.clearRect(0, 0, resolution.width, resolution.height );

	    if(isRever) ctx.setTransform(-1.0, 0, 0, 1, resolution.width, 0); // mirrored for draw of video
		ctx.drawImage( source, x, y, resolution.width*z, resolution.height*z, 0, 0, resolution.width, resolution.height);
		if(isRever) ctx.setTransform( 1.0, 0, 0, 1, 0, 0);
	
		return ctx.getImageData(0, 0, resolution.width, resolution.height).data;

	},

	// DRAW

	drawRects: function ( r, color ){

		ctxOver.clearRect(0, 0, resolution.width, resolution.height );

		ctxOver.strokeStyle = color || "#00a0ff"
		ctxOver.lineWidth = 2;
		ctxOver.rect(r.x, r.y, r.width, r.height);
		ctxOver.stroke();

	},

	drawFace: function ( v, color ){

		ctxOver.strokeStyle = color || "#00a0ff"

		for(var k = 0; k < v.length; k += 2) {
			ctxOver.beginPath();
			ctxOver.arc(v[k], v[k + 1], 2, 0, 2 * Math.PI);
			ctxOver.stroke();
		}

	},

}

return video;

})();