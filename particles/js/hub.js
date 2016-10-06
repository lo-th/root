'use strict';

var hub = ( function () {

    var slider, timer, middle, input, gui, debug, impoint, pointTime,  time = 0.5;
    var lod1, lod2;
    var inputs = [];

    hub = function () {};

    //---------------------------------------------
    // initialise du hub
    //---------------------------------------------

    hub.init = function () {

        impoint = document.createElement( 'div' );
        impoint.style.cssText = 'position:absolute; top:-20px; left:-20px; width:20px; height:20px; border:2px solid rgba(255,255,255,0); border-radius:100px; margin-left:-10px; margin-top:-10px;  pointer-events:none; transition:border-color 0.3s, margin 0.3s, width 0.3s, height 0.3s, transform 0.3s;';
        document.body.appendChild( impoint );

        pointTime = null;

        debug = document.createElement( 'div' );
        debug.className = 'debug';
        document.body.appendChild( debug );

        slider = document.createElement( 'div' );
        slider.className = 'timeSlider';
        document.body.appendChild( slider );

        middle = document.createElement( 'div' );
        middle.className = 'middle';
        document.body.appendChild( middle );

        timer = document.createElement( 'div' );
        timer.className = 'timer';
        slider.appendChild( timer );

        for(var i=0; i<3; i++){
            inputs[i] = document.createElement("input");
            inputs[i].type = 'text';
            inputs[i].className = 'input';
            //inputs[i].value = 'Hello World';
            if( i==0 ) inputs[i].style.bottom = 70 + 'px';
            if( i==1 ) inputs[i].style.bottom = 40 + 'px';
            document.body.appendChild( inputs[i] );

            //inputs[i].addEventListener('change', hub.input_text, false );
        }

        inputs[1].value = 'Hello World';

        input = document.createElement("input");

        slider.addEventListener('mousedown', hub.slide_down, false );

        // images loader
        lod1 = new LoadorDrag( miniImage, 'Mini Image', 10, true );
        lod2 = new LoadorDrag( bigImage, 'Big Image', 70, false );

        this.initGUI();

    };

    //---------------------------------------------
    // initialise le GUI
    //---------------------------------------------

    hub.initGUI = function () {

        var mm = {
            impact : function(){ view.impact(); },
            play : function(){ view.setMessage( hub.getText() ); },
            
            speed : 3,

        }

        gui = new dat.GUI();
        var G0 = gui.addFolder('Times');
        G0.add(mm, 'impact');
        G0.add(mm, 'play');
        G0.add( mm, 'speed', 0.1, 10, 0.1 ).onChange( function(v){ view.setSpeed(v); } );
        G0.open();

        var G1 = gui.addFolder('Particles');
        var G2 = gui.addFolder('impact');
        var options = particle.getOptions();

        var min = 0, max = 1, prec = 0.1;
        var g = 1;

        for (var o in options){

            if(o == 'size'){ min = 0.1; max = 5 };
            if(o == 'bigNoize'){ min = 0; max = 4 };
            if(o == 'noizeComplexity'){ min = 0; max = 1 };
            if(o == 'vibration'){ min = 0; max = 3 };
            if(o == 'vibrationSize'){ min = 0; max = 10 };

            if(o == 'impactForce'){ min = 0; max = 1000; prec = 1; g=2; };
            if(o == 'impactSpeed'){ min = 0; max = 1; prec = 0.01; g=2; };
            if(o == 'gravity'){ min = -10; max = 10; prec = 0.1; g=2; };
            if(o == 'expluseTime'){ min = 0; max = 4; prec = 0.1; g=2; };
            if(o == 'fadeTime'){ min = 0; max = 4; prec = 0.1; g=2; };
            if(o == 'fadeStart'){ min = 0; max = 1; prec = 0.01; g=2; };

            if(g==1) G1.add( options, o, min, max, prec ).onChange( particle.updateUniforms );
            if(g==2) G2.add( options, o, min, max, prec ).onChange( particle.updateUniforms );

        }

        G1.open();
        G2.open();

    };

    hub.slide_down = function ( e ) {

        hub.slide_find( e.clientX );
        document.addEventListener('mouseup', hub.slide_up, false );
        document.addEventListener('mousemove', hub.slide_move, false );

    };

    hub.slide_up = function ( e ) {

        document.removeEventListener('mouseup', hub.slide_up, false );
        document.removeEventListener('mousemove', hub.slide_move, false );

    };

    hub.slide_move = function ( e ) {

        hub.slide_find( e.clientX );

    };

    hub.slide_find = function ( x ) {

        var rect = slider.getBoundingClientRect();
        var n = x - rect.left;
        if( n < 0 ) n = 0;
        if( n > 400 ) n = 400;
        time = n * 0.0025;
        timer.style.width = ( time*100 ) + '%';

        particle.setUniforms( 'time', time );

        hub.testTime();

    };

    hub.slide_update = function ( t ) {

        time = t;
        timer.style.width = ( time*100 ) + '%';
        hub.testTime();

    };

    hub.testTime = function () {

        var time_Noizy, time_Orbite;

        var t = 5;
        var t2 = 0.2;

        if( time < 0.5 ){
            time_Orbite = 1.0 - ( time * t );
            time_Noizy = 1.0 - ( ( time - t2 ) * t );
        } else {
            time_Orbite = ( time - ( t2 * 4 ) ) * t;
            time_Noizy = ( time - ( t2 * 3 ) ) * t;
        }
        
        time_Orbite = time_Orbite < 0 ? 0 : time_Orbite;
        time_Noizy = time_Noizy < 0 ? 0 : time_Noizy;
        time_Noizy = time_Noizy > 1 ? 1 : time_Noizy;

        hub.tell( 'orbital: '+time_Orbite.toFixed(4)+'<br>noizy: '+time_Noizy.toFixed(4)+'<br><br>time: '+ time.toFixed(4) );

    };

    hub.impact = function(x,y, x2, y2){


        this.tell( 'impact point x:' + x + ' y:' + y );

        impoint.style.top =  y2 + 'px';
        impoint.style.left = x2 + 'px';

        impoint.style.width =  60 + 'px';
        impoint.style.height = 60 + 'px';
        impoint.style.marginLeft = -30 + 'px';
        impoint.style.marginTop = -30 + 'px';
        impoint.style.borderColor = 'rgba(255,255,255,0.4)';

        pointTime = setInterval(function(){
            clearInterval(pointTime);
            impoint.style.width =  20 + 'px';
            impoint.style.height = 20 + 'px';
            impoint.style.marginLeft = -10 + 'px';
            impoint.style.marginTop = -10 + 'px';
            impoint.style.borderColor = 'rgba(255,255,255,0)';
        }, 300);



    };

    //hub.input_text = function () {

        //console.log( input.value );
        //view.test0('', 60, 512, 256);

    //};

    hub.getTime = function () {

        return time;

    };

    hub.tell = function (s) {

        debug.innerHTML = s;

    };

    hub.getText = function () {
        var max = inputs.length;
        var txt = '';
        var n = 0;
        for(var i=0; i<max; i++){
            if( inputs[i].value.length !== 0 ){
                if(n>0) txt += '\n' + inputs[i].value;
                else txt += inputs[i].value;
                n++;
            }
        }

        return txt;

    };

    return hub;

})();