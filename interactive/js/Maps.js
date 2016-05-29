"use strict";


var maps = ( function () {

    var canvas;
    var m_canvas;
    var ctx;
    var ctx_end;
    var box = { l:0, r:0, t:0, b:0, w:512, h:512, d:0, m:2 };
    var contentStyle;
    var zoom = 1;
    var ratio = 1;

    var ox = 50;
    var oy = 50;

    var mx = 0;
    var my = 0;

    var extraUpdate = null;

    var nodes = [];
    //var points = [];
    var links = [];

    var drawTimer = null;

    var tmpLink = false;

    var dragging = false;
    var linking = false;
    var dragview = false;
    var selection = null;

    var dx = 0; // See mousedown and mousemove events for explanation
    var dy = 0;

    var tx = 0;
    var ty = 0;


    var action = '';

    maps = function () {};

    maps.init = function( o ) {

        o = o === undefined ? {} : o;

        /*box.t = o.top || 20;
        box.b = o.bottom || 20;
        box.l = o.left || 20;
        box.r = o.right || 20;*/

        //var content = NEO.DOM('NEO', 'div', 'top:'+box.t+'px; left:'+box.l+'px; pointer-events:auto; overflow:hidden; margin-left:-'+box.m+'px; margin-top:-'+box.m+'px; box-sizing:content-box; border:'+box.m+'px solid #888; ');
        //contentStyle = content.style;

        m_canvas = document.createElement( 'canvas' );
        canvas = document.createElement( 'canvas' );

        //m_canvas = NEO.DOM('NEO', 'canvas', '');

        //canvas = NEO.DOM('NEO', 'canvas', ' pointer-events:auto;', null, content);
        
        canvas.name = 'canvas';

        ctx = m_canvas.getContext("2d");

        ctx_end = canvas.getContext("2d");

        canvas.width = box.w;
        canvas.height = box.h;

        m_canvas.width = box.w;
        m_canvas.height = box.h;

        this.transform();
        this.draw();

        

        //NEO.Doc.body.appendChild( content );

        //this.activeEvents();
        //this.resize();

    };

    maps.getCanvas = function(){

        return canvas;

    };

    maps.setExtraUpdate = function( up ){

        extraUpdate = up;

    }

    // ----------------------
    //   Events dispatch
    // ----------------------

    maps.activeEvents = function(){

        var o = this.handleEvent;

        /*NEO.Doc.addEventListener('dblclick'  , o, false );
        NEO.Doc.addEventListener('mousedown'  , o, false );
        NEO.Doc.addEventListener('mousemove'  , o, false );
        NEO.Doc.addEventListener('mouseup'    , o, false );
        NEO.Doc.addEventListener('mousewheel' , o, false );
        NEO.Doc.addEventListener('contextmenu', o, false );
        

        window.addEventListener('resize', function(e){maps.resize(e)}, false );*/

    };

    maps.handleEvent = function( e ) {

        //e.preventDefault();

        switch( e.type ) {

            //case 'keydown': maps.keydown( e ); break;
            case 'contextmenu': maps.mouseMenu( e ); break;
            case 'mousewheel': maps.wheel( e ); break;

            case 'mousedown': maps.down( e ); break;
            case 'mousemove': maps.move( e ); break;
            case 'mouseup': maps.up( e ); break;
            case 'dblclick': maps.double( e ); break;

        }

    };

    maps.mouseMenu = function( e ){

        e.preventDefault();
        return false;

    };


    maps.double = function( e, x, y ){

        var mouse = this.getMouse( e, x, y );

        //console.log(mouse.x, mouse.y)

        var o = { x:mouse.x, y:mouse.y };

        this.add( o );

    };

    maps.up = function( e, x, y ){

        //e.preventDefault();

        if( (action === 'linkStart' || action === 'linkEnd') && selection !== null ){
            //if(selection === null) break;
            var mouse = this.getMouse(e, x, y);
            
            var i = nodes.length, sel = '';
            while(i--){
                sel = nodes[i].over( mouse.x, mouse.y );
                if( action === 'linkEnd' && sel === 'linkStart' ){
                    this.add({ type:'link', n2:nodes[i], n1:selection });
                    break;
                }
                if( action === 'linkStart' && sel === 'linkEnd' ){
                    this.add({ type:'link', n1:nodes[i], n2:selection });
                    break;
                }
            }

            linking = false;
            this.draw();
        }

        action = '';
        selection = null;

    };

    

    maps.down = function( e, x, y ){

        action = '';

        var mouse = this.getMouse( e, x, y );

        var i = nodes.length, sel = '';

        while(i--){
            action = nodes[i].over( mouse.x, mouse.y );
            
            if( action === 'linkStart' || action === 'linkEnd' ){
                selection = nodes[i];
                dx = selection.p.x;
                dy = selection.p.y;
                tx = mouse.x;
                ty = mouse.y;
                break;
            }else if( action === 'node' ){
                selection = nodes[i];
                dx = mouse.x - selection.x;
                dy = mouse.y - selection.y;
                break;
            }
        }

        if( action === '' ){//&& e.target.name === 'canvas' ){ 
            action = 'moveCanvas'
            dx = mouse.x;
            dy = mouse.y;
        }

        this.draw();

    };

    maps.move = function( e, x, y ){

        if(action === '') return;

        var mouse = this.getMouse( e, x, y );

        switch(action){
            case 'linkStart': case 'linkEnd':
                tx = mouse.x;
                ty = mouse.y;
                linking = true;
            break;
            case 'node':
                selection.move( mouse.x - dx, mouse.y - dy );
            break;
            case 'moveCanvas':
                ox += mouse.x - dx;
                oy += mouse.y - dy;
                this.transform();
            break;

        }

        this.draw();

    };

    maps.getMouse = function( e, x, y  ){

        //var x = (((e.clientX - box.l) - ox ) * ratio) - 256;
        //var y = (((e.clientY - box.t) - oy ) * ratio) - 256;

        var x = (((x - box.l) - ox ) * ratio);
        var y = (((y - box.t) - oy ) * ratio);

        return { x:x, y:y };

    };

    maps.wheel = function( e ){

        var mouse = this.getMouse(e);
        var mx = mouse.x;// - ox;
        var my = mouse.y;// - oy;
        var old = zoom;

        var delta = 0;
        if(e.wheelDeltaY) delta= e.wheelDeltaY*0.04;
        else if(e.wheelDelta) delta= e.wheelDelta*0.2;
        else if(e.detail) delta = -e.detail*4.0;
        zoom += delta * 0.05;

        zoom = zoom < 1 ? 1 : zoom;
        zoom = zoom > 4 ? 4 : zoom;

        ratio = 1/zoom;

        //mouse = this.getMouse(e);
        //var nx = mouse.x - ox;
        //var ny = mouse.y - oy;

        //ox = dx - nx;
        //oy = dx - ny

        //console.log(ox,oy)

        this.transform();

        this.draw();

    };

    // ----------------------
    //
    //   Add
    //
    // ----------------------


    maps.add = function( o ){

        o = o === undefined ? {} : o;
        var type = o.type || 'node';
        var id, n, p1, p2;

        switch(type){
            case 'node':
                o.id = nodes.length;
                n = new maps.Node( o );

                
                
                p1 = new maps.Point({ start:true });
                p2 = new maps.Point({  });
                n.points.push( p1 );
                n.points.push( p2 );

                nodes.push( n );

            break;
            case 'link':
                links.push( new maps.Link( o ) );
            break;
        }

        this.draw();

    };



    // ----------------------
    //
    //   Draw
    //
    // ----------------------

    maps.transform = function(){

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate( ox, oy );
        ctx.scale( zoom, zoom );
        
    }

    maps.draw = function(){

        ctx.save();

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0,0,box.w,box.h);

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect( 0,0, box.w, box.h);

        ctx.restore();
        
        this.origin();

        var i = nodes.length;
        while(i--) nodes[i].draw( ctx );
        i = links.length;
        while(i--) links[i].draw( ctx );

        this.drawTmpLink();

        this.render();

    }

    maps.render = function(){

        ctx_end.clearRect( 0, 0, box.w, box.h );
        ctx_end.drawImage( m_canvas, 0, 0 );

        if(extraUpdate) extraUpdate();

    };

    maps.distance = function(x1, x2, d) {
        d = d || 0.5;
        var x = x1>x2 ? x2+((x1-x2)*d ): x1+((x2-x1)*d);
        return x;
    };

    maps.findCurve = function( x1, y1, x2, y2, l ) {
        var p = [];

        var complex = false;

        if( l && x1 < x2) complex = true;
        if( !l && x1 > x2) complex = true;

        var x = l ? x1-x2 : x2-x1;//x2>x1 ? x2-x1 : x1-x2;
        var y = y2-y1;//y2>y1 ? y2-y1 : y1-y2;

        var ry = y < 0 ? true : false;
        y = y < 0 ? y*-1 : y;
        y *= 0.5;


        x = x<0 ? x*-1 : x;
        x *= 0.5;
        x = x < 10 ? 10 : x;
        x = y<x ? y : x;

        //x = x>40 ? 40 : x;
        var r1 = x * 0.5;
        

        var midx = l ? x1 - x : x1 + x;
        var xx = l ? midx - x2 : x2 - midx;
        var rx = xx < 0 ? ( l ? false : true) : (l ? true : false);
        xx = xx<0 ? xx*-1 : xx;
        xx*=0.5;
        xx = xx < 10 ? 10 : xx;
        xx = y<xx ? y : xx;
        var r2 = xx;



        //console.log(complex);

        if(!complex){
            p[0] = l ? midx + r1 : midx - r1;
            p[1] = midx;
            p[2] = rx ? midx - r2 : midx + r2;
            // y
            p[3] = ry ? y1 - r1 : y1 + r1;
            p[4] = ry ? y2 + r2 : y2 - r2;

        } else {
            p[0] = l ? midx + r1 : midx - r1;
            p[1] = midx;
            p[2] = rx ? midx - r2 : midx + r2;
            p[3] = rx ? x2 - r1 : x2 + r1;
            // y
            p[4] = ry ? y1 - r1 : y1 + r1;
            p[5] = ry ? (y1 - y)+r1 : (y1 + y)-r1//ry ? y2 + r2 : y2 - r2;
            p[6] = ry ? y2 + y : y2 - y
            p[7] = ry ? (y2 + y)-r1 : (y2 - y)+r1
            p[8] = ry ? y2 + r1 : y2 - r1; 
        }
        



        return p;
    };

    maps.drawTmpLink = function(){
        if(!linking) return;

        var left = false;
        if( action === 'linkStart') left = true;

        var c = left ? ["#FF0", "#0AA"] : ["#0FF", "#AA0"];

        ctx.lineWidth = 2;
        var grd = ctx.createLinearGradient(dx, dy, tx, ty);
        grd.addColorStop(0,c[0]);
        grd.addColorStop(1,c[1]);

        var p = maps.findCurve( dx, dy, tx, ty, left );


        ctx.strokeStyle = grd;
        ctx.beginPath();

        ctx.moveTo( dx, dy );
        if(p.length === 5){
            ctx.lineTo( p[0], dy );
            ctx.quadraticCurveTo(p[1], dy, p[1], p[3]);
            ctx.lineTo( p[1], p[4] );
            ctx.quadraticCurveTo(p[1], ty, p[2], ty);
        } else {
            ctx.lineTo( p[0], dy );
            ctx.quadraticCurveTo(p[1], dy, p[1], p[4]);
            ctx.lineTo( p[1], p[5] );
            ctx.quadraticCurveTo(p[1], p[6], p[0], p[6])
            ctx.lineTo( tx, p[6] );
            ctx.quadraticCurveTo( p[3], p[6], p[3], p[7])
            ctx.lineTo( p[3], p[8] );
            ctx.quadraticCurveTo(p[3], ty, tx, ty);
        }
        ctx.lineTo( tx, ty );
        ctx.stroke();

    };

    maps.origin = function(){

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 10);
        ctx.stroke();

    };





    



    /*maps.resize = function( e ){

        box.h = window.innerHeight - box.b - box.t;
        box.w = window.innerWidth - box.l - box.r;

        contentStyle.width = box.w + 'px';
        contentStyle.height = box.h + 'px';

        canvas.width = box.w;
        canvas.height = box.h;

        m_canvas.width = box.w;
        m_canvas.height = box.h;

        this.transform();
        this.draw();

        //clearTimeout( drawTimer );
        //drawTimer = setTimeout( this.draw.bind(this), 0 );

    };*/



    ///////////////////////////
    //
    //  NODE
    //
    ///////////////////////////

    maps.Node = function( o ){

        this.id = o.id || 0;
        this.name = o.name || 'node-'+ this.id;

        this.points = [];

        this.w = o.w || 80;
        this.h = o.h || 20;

        this.x = 10;
        this.y = 10;

        this.p = null;

        if(o.x) this.x = o.x - (this.w * 0.5);
        if(o.y) this.y = o.y - (this.h * 0.5);
        
        this.color = '#666';
        this.border = '#888';
        this.borderSel = '#AAA';
        this.select = false;

    };

    maps.Node.prototype = {

        draw:function(ctx){

            ctx.lineWidth = 1;
            ctx.strokeStyle = this.select ? this.borderSel : this.border;
            ctx.fillStyle = this.color;

            ctx.fillRect( this.x, this.y, this.w, this.h );
            ctx.strokeRect( this.x, this.y, this.w, this.h );

            var i = this.points.length;
            while( i-- ){
                if(i === 0) this.points[i].move( this.x, this.y + this.h*0.5 );
                if(i === 1) this.points[i].move( this.x + this.w, this.y + this.h*0.5 );
                this.points[i].draw( ctx );
            }

            ctx.font = "11px Lucida Console";
            ctx.fillStyle = "#FFF";
            ctx.textAlign = "center";
            ctx.fillText( this.name, this.x + this.w*0.5, this.y + this.h*0.5 );



        },

        over : function( x, y ){
            var i = this.points.length;
            this.p = null;

            while( i-- ){
                if( this.points[i].over( x, y ) ) this.p = this.points[i];
            }

            if( this.p !== null ){ 
                this.select = true;
                return 'link' + (this.p.start ? 'Start' : 'End');
            } else {
                this.select = (this.x <= x) && (this.x + this.w >= x) && (this.y <= y) && (this.y + this.h >= y);
                if( this.select ) return 'node';// (this.x <= x) && (this.x + this.w >= x) && (this.y <= y) && (this.y + this.h >= y);
            }

            return '';
        },
        move:function(x, y){
            this.x = x;
            this.y = y;
        }

    };

    ///////////////////////////
    //
    //  POINT
    //
    ///////////////////////////

    maps.Point = function( o ){

        this.x = o.x || 0;
        this.y = o.y || 0;
        this.r = 6;
        this.color = '#0AA';
        this.colorSel = '#0FF';
        this.select = false;
        this.start = o.start || false;
        this.id = o.id || 0;

        if(this.start){
            this.color = '#AA0';
            this.colorSel = '#FF0';
        }

    };

    maps.Point.prototype = {

        draw:function(ctx){

            ctx.beginPath();
            ctx.fillStyle = this.select ? this.colorSel : this.color;
            ctx.arc(this.x,this.y, this.r, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill();
            
        },
        over : function(x,y){
            this.select = (this.x-this.r <= x) && (this.x + this.r >= x) && (this.y-this.r <= y) && (this.y + this.r >= y);
            return this.select;
        },
        move:function(x, y){
            this.x = x;
            this.y = y;
        }

    }



    ///////////////////////////
    //
    //  LINK
    //
    ///////////////////////////

    maps.Link = function( o ){

        o.n1.points[1].select = false;
        o.n2.points[0].select = false;

        this.p1 = o.n1.points[1];
        this.p2 = o.n2.points[0];
        this.r = 3;

        this.color = '#FFF';

    };

    maps.Link.prototype = {

        draw:function(ctx){

            ctx.beginPath();
            ctx.fillStyle = "#0FF";
            ctx.arc(this.p1.x, this.p1.y, this.r, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = "#FF0";
            ctx.arc(this.p2.x, this.p2.y, this.r, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill();

            var dx = this.p1.x;
            var dy = this.p1.y;
            var tx = this.p2.x;
            var ty = this.p2.y;

            var p = maps.findCurve( dx,dy,tx,ty, false );

            ctx.lineWidth = 2;
            var grd = ctx.createLinearGradient(dx,dy,tx,ty);
            grd.addColorStop(0,"#0FF");
            grd.addColorStop(1,"#FF0");
            ctx.strokeStyle = grd;
            ctx.beginPath();

            ctx.moveTo( dx, dy );
            if(p.length === 5){
                ctx.lineTo( p[0], dy );
                ctx.quadraticCurveTo(p[1], dy, p[1], p[3]);
                ctx.lineTo( p[1], p[4] );
                ctx.quadraticCurveTo(p[1], ty, p[2], ty);
            } else {
                ctx.lineTo( p[0], dy );
                ctx.quadraticCurveTo(p[1], dy, p[1], p[4]);
                ctx.lineTo( p[1], p[5] );
                ctx.quadraticCurveTo(p[1], p[6], p[0], p[6])
                ctx.lineTo( tx, p[6] );
                ctx.quadraticCurveTo( p[3], p[6], p[3], p[7])
                ctx.lineTo( p[3], p[8] );
                ctx.quadraticCurveTo(p[3], ty, tx, ty);
            }
            ctx.lineTo( tx, ty );

            ctx.stroke();
            
        }

    }



   return maps;

})();