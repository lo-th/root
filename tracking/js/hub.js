var hub = ( function () {

	var unselectable = '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select: none; pointer-event:none;';
    var button =  'background:#666; color:#fff; line-height: 30px; text-align:center; font-size: 14px;  font-weight: 500; border-radius:6px; pointer-event:auto; cursor:pointer;';

	var content, b1, b2, info, gui, gr0;

    var isWebcam = false;
    var isVideo = false;

	hub = {

    


    init: function () { 

        info = document.createElement('div');
        info.style.cssText = 'position:absolute; left:10px; top:100px; width:400px, height:400px; text-align:left;'
        document.body.appendChild( info );

    	content = document.createElement( 'div' );
    	content.style.cssText = unselectable + 'position:absolute; left:10px; top:10px; width:100px; height:100px;';
    	document.body.appendChild( content );

    	b1 = document.createElement( 'div' );
    	b1.style.cssText = unselectable + button +'position:absolute; left:0px; top:0px; width:100px; height:30px;';
    	b1.innerHTML = 'WEBCAM';

    	content.appendChild( b1 );

        b2 = document.createElement( 'div' );
        b2.style.cssText = unselectable + button +'position:absolute; left:0px; top:40px; width:100px; height:30px;';
        b2.innerHTML = 'VIDEO';

        content.appendChild( b2 );

        b1.addEventListener('mouseover', hub.over, false );
        b1.addEventListener('mouseout', hub.out, false );
        b1.addEventListener('click', hub.webcam, false );

        b2.addEventListener('mouseover', hub.over, false );
        b2.addEventListener('mouseout', hub.out, false );
        b2.addEventListener('click', hub.video, false );

        gui = new UIL.Gui( { w:300, h:20 } );//.onChange();
        gr0 = gui.add('group', { name:'Video', h:30 });
        gr0.add( video.setting, 'zoom', { min:0.5, max:2, step:0.1, precision:2 } ).listen();
        gr0.add( video.setting, 'midX', { min:0, max:1920, precision:0 } ).listen();
        gr0.add( video.setting, 'midY', { min:0, max:1080, precision:0 } ).listen();
        //gr0.add('slide',  { name:'zoom', min:1, max:2, value:1, step:0.1, precision:2, stype:1 });

    },

    log: function ( txt ) {

        info.innerHTML = txt;

    },


    over:function(e){

        e.target.style.background = '#060';

    },
    out:function(e){

        e.target.style.background = '#666';

    },

    webcam:function(e){

        startWebcam();
        e.target.style.background = '#640';
        e.target.style.pointerEvent = 'none';
        isWebcam = true;

    },

    video:function(e){

        startVideo();
        e.target.style.background = '#640';
        e.target.style.pointerEvent = 'none';
        isVideo = true;

    },

}

return hub;

})();