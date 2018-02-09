var gui = ( function () {

'use strict';

var ui;
var content, main, menu, timebarre;
var isOpen = false;

var selectColor = '#db0bfa'

var BB = [ 'X', 'BASE', 'VIEW', 'VIDEO', 'ANIM', 'MORPH' ];

var effectset = {
    onlyAO: false,
    clamp:0.9,
    luma:0.5,
}

var current = 'none';
var tmp = null;


gui = {

    init: function ( container ) {

        content = document.createElement( 'div' );
        content.style.cssText = 'position: absolute; top:0; left:0; pointer-events:none; width:100%; height:100%;';
        container.appendChild( content );

        main = document.createElement( 'div' );
        main.style.cssText = 'position: absolute; top:50px; right:0; pointer-events:none; width:200px; height:100%; background:rgba(0,0,0,0); display:none;';
        content.appendChild( main );

        menu = document.createElement( 'div' );
        menu.style.cssText = 'position: absolute; top:10px; left:10px; pointer-events:none; background:none; ';
        content.appendChild( menu );

        timebarre = new Timebarre( content, selectColor );

        for(var i=0; i<BB.length; i++ ) this.addButton(i);

        ui = new UIL.Gui( { w:230, bg:'rgba(23,23,23,0)', close:false, parent:main, top:50, css:'right:0; transition:none;' } );

    },

    addButton: function ( i ) {

        var b = document.createElement('div');
        b.style.cssText =  'color:#CCC; font-weight:bold; font-size: 16px;  margin:5px 5px; padding: 0px 5px; line-height:30px; position:relative; pointer-events:auto; height:30px; display:inline-block; text-align:center; cursor:pointer; ';
        b.textContent = BB[i];
        b.id = i;

        b.addEventListener( 'mouseover', function(e){ this.style.color = selectColor; }, false );
        b.addEventListener( 'mouseout', function(e){ this.style.color = '#CCC';}, false );
        b.addEventListener( 'mousedown', function(e){ gui.select( this.id ); }, false );

        menu.appendChild(b);

    },

    close: function () {

        if(!isOpen) return;

        main.style.display = 'none';
        isOpen = false;

    },

    open: function () {

        if( isOpen ) return;

        main.style.display = 'block';
        isOpen = true;

    },

    select: function ( id ) {

        tmp = null;

        id = Number(id);
        ui.clear();
        timebarre.hide();
        gui.open();

        switch( id ){
            case 0: gui.close(); break;
            case 1: gui.basic(); break;
            case 2: gui.option(); break;
            case 3: gui.video(); break;
            case 4: gui.anim(); break;
            case 5: gui.morph(); break;
        }

    },

    basic: function () {

        ui.add('slide', { name:'framerate', min:24, max:60, value:60, precision:0, step:1, stype:1 }).onChange( view.setFramerate );
        ui.add('slide',  { name:'animation', min:-3, max:3, value:1, precision:2, stype:1 }).onChange( avatar.setSpeed );
        ui.add('Bool', { name:'MAN or WOMAN', value:avatar.getGender() ? false : true , p:60, h:20 } ).onChange(  avatar.switchModel );
        ui.add('button', { name:'LOAD', fontColor:'#D4B87B', h:40, drag:true, p:0 }).onChange( avatar.loadSingle );

    },

    option: function () {

        ui.add('Bool', { name:'MID RESOLUTION', value:view.pixelRatio === 1 ? false : true, p:60 } ).onChange( view.setPixelRatio );
        ui.add('Bool', { name:'GRID', value:view.isGrid, p:60 } ).onChange( view.addGrid );
        ui.add('Bool', { name:'SHADOW', value:view.isShadow, p:60 } ).onChange( view.addShadow );
        ui.add('Bool', { name:'SKELETON', value:avatar.getModel().isSkeleton, p:60 } ).onChange( avatar.addSkeleton );

        var gr1 = ui.add('group', { name:'POST EFFECT',  bg:'rgba(0,0,0,0.1)', line:false, h:30 });
        gr1.add('bool', { name:'ACIVATE', value:view.getEffect(), p:60 } ).onChange( function(b){ view.addEffect(b); view.updateEffect( effectset ); } );
        gr1.add( effectset, 'onlyAO', { type:'bool', p:60 } ).onChange( function(){ view.updateEffect( effectset );} );
        gr1.add( effectset, 'clamp', { min:0, max:1, stype:2 } ).onChange( function(){ view.updateEffect( effectset );} );
        gr1.add( effectset, 'luma', { min:0, max:2, stype:2 } ).onChange( function(){ view.updateEffect( effectset );} );

    },

    video: function () {

        ui.add('Bool', { name:'CAPTURE MODE', value:view.getCaptueMode(), p:60 } ).onChange( view.captureMode );
        ui.add('button', { name:'MULTY', h:20, value:[240, 360, 480, 720, 1080], p:0 }).onChange( view.setVideoSize );//.onChange( callback );;
        tmp = ui.add('number', { name:'resolution', value:view.videoSize, precision:0, step:10 }).onChange( view.setVideoSize );
        ui.add('button', { name:'START', h:20, p:0 }).onChange( view.startCapture );
        ui.add('button', { name:'STOP', h:20, p:0 }).onChange( view.saveCapture );

        ui.add('button', { name:'BACK', fontColor:'#D4B87B', h:40, drag:true, p:0 }).onChange( gui.setBakground );
        ui.add('number', { name:'maxFrame', value:0, precision:0, step:1, min:0 }).onChange( view.setVideoMaxFrame );
        
 
    },

    upRes: function( v ) {
        if(tmp){ 
            tmp.setValue(v[0], 0);
            tmp.setValue(v[1], 1);
        }
    },

    anim: function () {

        current = 'anim';
        ui.add('slide',  { name:'animation', min:-1, max:1, value:avatar.getTimescale(), precision:2, stype:1 }).onChange( avatar.setTimescale );
        ui.add('Bool', { name:'MAN or WOMAN', value:avatar.getGender() ? false : true , p:60, h:20 } ).onChange(  avatar.switchModel );
        ui.add('Bool', { name:'LOCK HIP', value:avatar.getModel().isLockHip, p:60 } ).onChange( avatar.lockHip );
        ui.add('number', { name:'position Y', value:avatar.getModel().getDecal(), precision:1, step:0.1 }).onChange( function(v){ avatar.getModel().setDecal(v); } );
        ui.add('button', { name:'LOAD', fontColor:'#D4B87B', h:40, drag:true, p:0 }).onChange( avatar.loadSingle );

        var an = avatar.getAnimations(), name;

        for(var i=0; i<an.length; i++){

            name = an[i];
            ui.add( 'button', { name:name, p:0 }).onChange( avatar.play );

        }

        timebarre.show();

    },

    addAnim: function( name ){

        if( current !== 'anim' ) return;
        ui.add( 'button', { name:name, p:0 }).onChange( avatar.play );

    },

    morph: function () {

        var mo = avatar.getMorph(), name;

        for(var i=0; i<mo.length; i++){

            name = mo[i];
            ui.add('slide',  { name:'eye '+name, min:0, max:1, value:0, precision:2 }).onChange( avatar.morphEye );

        }

        ui.add('slide',  { name:'eye size', min:0.5, max:2, value:1, precision:2 }).onChange( avatar.sizeEye );

        for(var i=0; i<mo.length; i++){

            name = mo[i];
            ui.add('slide',  { name:name, min:0, max:1, value:0, precision:2 }).onChange( avatar.morphMouth  );
        }

        ui.add('slide',  { name:'mouth size', min:0.5, max:2, value:1, precision:2 }).onChange( avatar.sizeMouth );
        

    },

    // PLAY BARRE

    resize: function () {

        if( timebarre ) timebarre.resize();

    },

    setTotalFrame: function ( v, ft ) {

        if( timebarre ) timebarre.setTotalFrame( v, ft );

    },

    updateTime: function ( f ) {

        if( timebarre ) timebarre.update( f );

    },

    inPlay:function(){
        if( timebarre ) timebarre.inPlay();
    },

    setBakground: function ( data, name, type ) {

        var back = document.getElementById('back');
        back.innerHTML = '';

        if( type === 'png' || type === 'jpg' ){
            var img = new Image();
            img.src = data;
            img.onload = function(){
                var w = this.width;
                var h = this.height;
                //console.log(w, h)
                img.style.cssText = 'position:absolute; top:50%; left:50%; pointer-events:none; ' + 'width:' + w + 'px; height:' + h + 'px; margin:' + (-h*0.5) + 'px ' + (-w*0.5) + 'px;';
                back.appendChild( img );
            }
        } else if ( type === 'mp4' || type === 'webm' || type === 'ogg' ){

            var video = document.createElement('video');
            
            
            video.src = data;


            video.onloadedmetadata = function(){
                var w = this.videoWidth;
                var h = this.videoHeight;
                //this.autoPlay = true;
                //console.log(w, h)
                video.style.cssText = 'position:absolute; top:50%; left:50%; pointer-events:none; ' + 'width:' + w + 'px; height:' + h + 'px; margin:' + (-h*0.5) + 'px ' + (-w*0.5) + 'px;';
                back.appendChild( video );

                video.loop = true;

                video.play()
            }


        }



    },




}



return gui;

})();


var Timebarre = function( p, sel ){

    this.select = sel;

    this.playIcon = "<svg width='18px' height='17px'><path fill='#CCC' d='M 14 8 L 5 3 4 4 4 13 5 14 14 9 14 8 Z'/></svg>";
    this.pauseIcon = "<svg width='18px' height='17px'><path fill='#CCC' d='M 14 4 L 13 3 11 3 10 4 10 13 11 14 13 14 14 13 14 4 M 8 4 L 7 3 5 3 4 4 4 13 5 14 7 14 8 13 8 4 Z'/></svg>";

    this.playing = true;

    this.parent = p;

    this.down = false;
    this.isHide = true;

    this.width = window.innerWidth - 80;
    this.totalFrame = 0;
    this.frame = 0;
    this.ratio = 0;

    this.content = document.createElement('div');
    this.content.style.cssText = "position:absolute; bottom:0; left:0px; width:100%; height:50px; pointer-events:none; display:none; ";
    this.parent.appendChild( this.content );

    this.timeInfo = document.createElement('div');
    this.timeInfo.style.cssText = "position:absolute; bottom:36px; left:60px; width:200px; height:10px; pointer-events:none; color:#CCC; ";
    this.content.appendChild(this.timeInfo);

    this.timeline = document.createElement('div');
    this.timeline.style.cssText = "position:absolute; bottom:20px; left:60px; width:"+this.width+"px; height:5px; border:3px solid rgba(255,255,255,0.2); pointer-events:auto; cursor:pointer;";
    this.content.appendChild(this.timeline);

    this.framer = document.createElement('div');
    this.framer.style.cssText = "position:absolute; top:0px; left:0px; width:1px; height:5px; background:#CCC; pointer-events:none;";
    this.timeline.appendChild(this.framer);

    this.playButton = document.createElement('div');
    this.playButton.style.cssText = "position:absolute; top:5px; left:10px; width:18px; height:18px; pointer-events:auto; cursor:pointer; border:3px solid rgba(255,255,255,0.2); padding: 5px 5px;";
    this.content.appendChild( this.playButton );

    this.playButton.innerHTML = this.playing ? this.playIcon : this.pauseIcon;
    this.playButton.childNodes[0].childNodes[0].setAttribute('fill', '#CCC');



        //this.playButton.addEventListener('mouseover', editor.play_over, false );
        //this.playButton.addEventListener('mouseout', editor.play_out, false );
        

    var _this = this;
    //window.addEventListener( 'resize', function(e){ _this.resize(e); }, false );
    this.timeline.addEventListener( 'mouseover', function ( e ) { _this.tOver(e); }, false );
    this.timeline.addEventListener( 'mouseout', function ( e ) { _this.tOut(e); }, false );

    this.timeline.addEventListener( 'mousedown', function ( e ) { _this.tDown(e); }, false );
    document.body.addEventListener( 'mouseup', function ( e ) { _this.tUp(e); }, false );
    document.body.addEventListener( 'mousemove', function ( e ) { _this.tMove(e); }, false );

    this.playButton.addEventListener('mousedown',  function ( e ) { _this.play_down(e); }, false );
    this.playButton.addEventListener('mouseover',  function ( e ) { _this.play_over(e); }, false );
    this.playButton.addEventListener('mouseout',  function ( e ) { _this.play_out(e); }, false );
}



Timebarre.prototype = {

    inPlay: function ( e ) {
        this.playing = true;
        this.playButton.innerHTML = this.playIcon;
    },

    play_down: function ( e ) {

        if( this.playing ){ 
            this.playing = false;
            avatar.pause();
        } else {
            this.playing = true;
            avatar.unPause();
        }

        this.playButton.innerHTML = this.playing ? this.playIcon : this.pauseIcon;

    },

    play_over: function ( e ) { 

        //this.playButton.style.border = "1px solid " + selectColor;
        //this.playButton.style.background = selectColor;
        this.playButton.childNodes[0].childNodes[0].setAttribute('fill', this.select );

    },

    play_out: function ( e ) { 

        //this.playButton.style.border = "1px solid #3f3f3f";
        //this.playButton.style.background = 'none';
        this.playButton.childNodes[0].childNodes[0].setAttribute('fill', '#CCC');

    },

    show: function () {

        if(!this.isHide) return;
        this.content.style.display = 'block';
        this.isHide = false;
    },

    hide:function () {

        if(this.isHide) return;
        this.content.style.display = 'none';
        this.isHide = true;

    },
    
    setTotalFrame:function( t, ft ){

        this.totalFrame = t;
        this.frameTime = ft;
        this.ratio = this.totalFrame / this.width;
        this.timeInfo.innerHTML = this.totalFrame + ' frames';

    },

    resize:function(e){

        this.width = window.innerWidth - 80;
        this.timeline.style.width = this.width+'px';
        this.ratio = this.totalFrame / this.width;

    },

    update:function( t ){

        if( this.isHide ) return;

        this.frame = Math.round( t / this.frameTime );
        this.timeInfo.innerHTML = this.frame + ' / ' + this.totalFrame;
        this.framer.style.width = this.frame / this.ratio + 'px';

    },

    tOut:function(e){

        if(!this.down) this.framer.style.background = "#CCC";

    },

    tOver:function(e){

        this.framer.style.background = this.select;

    },

    tUp:function(e){

        this.down = false;
        this.framer.style.background = "#CCC";

    },

    tDown:function(e){

        this.down = true;
        this.tMove(e);
        this.playing = false;
        this.playButton.innerHTML = this.playing ? this.playIcon : this.pauseIcon;
        this.framer.style.background = this.select;

    },

    tMove:function(e){

        if(this.down){
            var f = Math.floor((e.clientX-20)*this.ratio);
            if(f<0) f = 0;
            if(f>this.totalFrame) f = this.totalFrame; 
            this.frame = f;
            avatar.playOne( this.frame );
            //this.parent.gotoFrame(this.frame);
        }
    }

}