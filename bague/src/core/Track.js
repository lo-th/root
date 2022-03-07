import * as THREE from 'three';

import { Terrain2D } from './Terrain2D.js';

export class Track {

    constructor( o = {} ) {

        o = o || {}

        this.parent = o.scene;

        this.frame = 0;

        this.px = 0;

        this.level = o.level || 0;
        this.x = 0;
        this.y = 0;

        this.middle = 0;
        this.min = -300;


        //this.w = o.w || 900;
        this.h = o.h || 1;
        this.s = o.size || 25;
        this.n = o.step || 30;
        this.w = 900;//this.n * this.n;
        this.d = o.d || 100;//-25;

        this.speed = 1/(this.n*0.5);//0.06;

        this.dx = -( this.w - this.n*0.5 );
        this.dy = this.h*0.5;//o.dy || 250;



        this.dy2 = this.h * 0.75;

        this.dz = 0;//this.d*0.5;
        this.dz2 = 70; //this.d + 20;

        this.zone = {
            l:this.w-(this.n+this.n*0.5),
            r:-this.w+(this.n+this.n*0.5)
        };

        this.terrain = new Terrain2D( this.w, this.h, this.s, this.n, [-1, 1] );
        this.terrainL = new Terrain2D( this.w, this.h, this.s, this.n, [-1, 1] );

        this.terrainZ = new Terrain2D( this.w, this.d, this.s*2, this.n, [-1, 1] );
        //this.terrain2 = new Terrain2D( this.w, this.h, this.s, this.n );

        //this.segments = null;//this.terrain.gen( this.x, this.y );

        /*this.limite = new Shape.line( [ 0.1, 0.1, 0.2 ], -this.dx, 0, 0, this.dx, 0, 0  );
        this.center = new Shape.line( [ 0.0, 0.2, 0.1 ], -this.dx, 0, 0, this.dx, 0, 0  );

        this.box = new Shape.box( [ 1.0, 0.2, 0.1 ], 0, 0, -60, 20, 10, 0  );
        this.limiteHl = new Shape.line( [ 1, 0.1, 0.2 ], this.zone.l, this.dy, 0, this.zone.l, -this.dy, 0 );
        this.limiteHr = new Shape.line( [ 1, 0.1, 1 ], this.zone.r, this.dy, 0, this.zone.r, -this.dy, 0 );
        */

        this.lines = [];
        this.linesL = [];

        this.setLimite( this.min );


        this.geoF1 = new THREE.PlaneBufferGeometry( this.w*2, 10 , (this.n*2)-3, 1 );
        this.geoF0 = new THREE.PlaneBufferGeometry( this.w*2, 10 ,(this.n*2)-3, 1 );

        this.geoW1 = new THREE.PlaneBufferGeometry( this.w*2, 10 , (this.n*2)-3, 1 );
        this.geoW0 = new THREE.PlaneBufferGeometry( this.w*2, 10 ,(this.n*2)-3, 1 );

        //var pos = this.geoF1.attributes.position;
        //console.log(pos);

        this.dd = 0.5;

        this.texture = this.makeTexture(0);
        //this.texture.repeat.set( this.n*2 - 2, 1 );
        this.texture.repeat.set( this.n , 1 );
        this.texture.offset.set( 0.5, 1 );
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;

        this.texture2 = this.makeTexture(1);
        this.texture2.repeat.set( this.n, 1 );
        this.texture2.offset.set( 0.5, 1 );
        this.texture2.wrapS = THREE.RepeatWrapping;
        this.texture2.wrapT = THREE.RepeatWrapping;

        //this.alphaMap = this.makeAlphaTexture();
        //this.alphaMap.repeat.set( 1, 1 );
        //this.alphaMap.offset.set( 1, 1 );
        //this.alphaMap.wrapS = THREE.RepeatWrapping;
        //this.alphaMap.wrapT = THREE.RepeatWrapping;

        this.mat = new THREE.MeshStandardMaterial( {
            color:0xFFFFFF, wireframe: true, map:this.texture,
           //lightMap:this.alphaMap, lightMapIntensity:0, alphaMap:this.alphaMap ,transparent: true
        })
        this.mat2 = new THREE.MeshStandardMaterial( {
            color:0x00FF75, wireframe: false, map:this.texture2,
            //lightMap:this.alphaMap ,lightMapIntensity:0, alphaMap:this.alphaMap, transparent: true
        })
        //this.matHide = new THREE.MeshBasicMaterial( {color:0x606060, wireframe: false, transparent: true, opacity: 0 })

        this.meshs = [

            new THREE.Mesh( this.geoF1, this.mat ),
            //new THREE.Mesh( this.geoF0, this.mat ),

            //new THREE.Mesh( this.geoW1, this.mat2 ),
           // new THREE.Mesh( this.geoW0, this.mat2 ),

        ];

        var i = this.meshs.length;
        while(i--){

            this.meshs[i].castShadow = true;
            this.meshs[i].receiveShadow = true;

            //view.addUV2( this.meshs[i] );
            this.parent.add( this.meshs[i] );

        }


       /* this.bbox = new THREE.Mesh( new THREE.BoxBufferGeometry(5, 20, 60), new THREE.MeshPhongMaterial( {color:0xff6060 }));
        this.bbox.position.x = 2000
        var eee = this.getY( 2000, 1 );

        this.bbox.position.y = eee.y + 10;
        this.bbox.position.z = eee.z;

        /*this.hidePlane = new THREE.Mesh( new THREE.BoxBufferGeometry(50, 70, 200), this.matHide );
        this.hidePlane.position.x = -1000
        this.hidePlane.position.y = this.getY( -1000 ) - 25;*/
        //this.hidePlane.frustumCulled = false;



        /*this.content = new THREE.Group();
        this.content.add( this.bbox );
       // this.content.add( this.hidePlane )
        this.parent.add( this.content )*/


        this.move();
        this.draw();

    }

    setLimite ( v ) {

        this.min = v;
        //this.limite.v1.y = this.min;
        //this.limite.v2.y = this.min;

    }

    getPos ( x, n ) {

        var y, y2, diff;

        //x = x + this.n
        //ar x = ( x  ) / this.n;
        var x = ( (x * this.n) + this.w ) / this.n;
        if( n === 0 ) y = this.terrain.genY( x, this.y ) - this.dy;
        else {
            y2 = this.terrain.genY( x, this.y ) - this.dy;
            y = this.terrainL.genY( x, this.y ) - this.dy;

            diff = y - y2;
            if( diff >= 0 ) y = y2;
            else if ( diff < this.dy ) y -= diff + (diff * (diff/this.dy));
        }
        var z = this.terrainZ.genY( x, this.y ) + ( n === 0 ? this.dz : this.dz2 );
        return { x:( (x * this.n)- this.w) + (this.n*0.5), y:y, z:z }
       //return { x:( (x * this.n)) + (this.n*0.5), y:y, z:z }
         //return { x: (x ) + (this.n*0.5), y:y, z:z }

    }

    draw(){

        
        this.updateGeo();

    }

    updateGeo () {

        var m1 = this.geoF1.attributes.position;
        /*var m0 = this.geoF0.attributes.position;

        var w1 = this.geoW1.attributes.position;
        var w0 = this.geoW0.attributes.position;*/

        var pos = m1.array;
       /* var nos = m0.array;

        var wos = w1.array;
        var zos = w0.array;*/

        var lng = m1.count * 0.5;
        var i = lng, n, n2;
        var p1, p2;

        //for(i = 0;  i < lng; i++){

        while(i--){

            n = (i)*3;
            n2 = (i+lng)*3;

            p1 = this.lines[ i ].v2;
            p2 = this.linesL[ i ].v2;

            pos[n] = p1.x;
            pos[n+1] = p2.z//p1.y;
            pos[n+2] = p1.z - 30;
            pos[n2] = p1.x;
            pos[n2+1] = p2.z//p1.y;
            pos[n2+2] = p1.z + 30;

            /*nos[n] = p2.x;
            nos[n+1] = p2.y;
            nos[n+2] = p2.z - 30;
            nos[n2] = p2.x;
            nos[n2+1] = p2.y;
            nos[n2+2] = p2.z + 30;

            wos[n] = p1.x;
            wos[n+1] = p1.y;
            wos[n+2] = p1.z + 30;
            wos[n2] = p2.x;
            wos[n2+1] = p2.y;
            wos[n2+2] = p2.z - 30;

            zos[n] = p2.x;
            zos[n+1] = p2.y;
            zos[n+2] = p2.z + 30;
            zos[n2] = p2.x ;
            zos[n2+1] = p2.y - 60;
            zos[n2+2] = p2.z + 30;*/

        }

        m1.needsUpdate = true;
        /*m0.needsUpdate = true;
        w1.needsUpdate = true;
        w0.needsUpdate = true;*/

        //this.geoF1.computeBoundingSphere();
        this.geoF0.computeVertexNormals();
        /*this.geoF1.computeVertexNormals();
        this.geoW0.computeVertexNormals();
        this.geoW1.computeVertexNormals();*/
        //this.geoF1.computeFaceNormals();

    }

    getMin( l ){

        if(l === 0 ) return this.min;
        else return this.min;

    }

    getLine( l ){

        if(l === 0 ) return this.lines[ this.middle ];
        else return this.linesL[ this.middle ];

    }

    set ( x, y ){

        this.x = x !== undefined ? x : this.x;
        this.y = y !== undefined ? y : this.y;
        this.move();

    }

    smoothUnder(){

    }

    move( x, y ){

        if( x !== undefined ) this.x += x * this.speed;// / ((this.n*2) - 2);//*0.5
        if( y !== undefined ) this.y += y;

        //if( this.x > 0 ){ this.x = 0; return; }
        if( this.x < 0 ){ this.x = 0; return; }

        this.px = ( this.x * this.n ).toFixed(2) * -1;
        this.frame = Math.floor( this.x );

        if( x !== undefined ) this.dd += x * (1/(this.n+0.5));/// ((this.n*2) - 2);



        this.dd = this.dd > 1 ? 0 : this.dd;
        this.dd = this.dd < 0 ? 1 : this.dd;

        this.texture.offset.x = this.dd;
        this.texture2.offset.x = this.dd;

        //this.zone.l = -( this.x * this.n );

        this.lines = [];
        this.linesL = [];

        var segments  = this.terrain.gen( this.x, this.y );
        var segmentsL = this.terrainL.gen( this.x, this.y );
        var segmentsZ = this.terrainZ.gen( this.x, this.y );

        var lng = (segments.length*0.5), n, color, color2;

        //console.log(segments)

        this.middle = Math.floor(( lng )*0.5) - 1;
        var diff = 0;

       // if(this.x<-5) this.niv += 0.1;
       // this.niv = this.niv > 1 ? 1 : this.niv;

        // start middle y
        //var tmp =  ( 20 + this.x ) ;
        //var tmp2 = ( this.x ) ;

        var tmp =  ( 40 - this.x );
        var tmp2 = ( 60 - this.x );
        var lowery = 0

        var i, j = 1;
        //var margin = 10;

        //while( j-- ){

            for( i = 0; i < lng; i++ ){
            //while(i--){

                n = i*2;

                // start flat
                if( i < tmp ){
                    segments[n+1] = this.dy;
                    segmentsL[n+1] = this.dy;
                    segmentsZ[n+1] = this.dz;

                } else if( i < tmp2 ){ // begin slow down
                    lowery = (i-tmp) * 0.05;   //0;//( tmp + i ) * 0.05;
                    segments[n+1] = this.dy + (segments[n+1]-this.dy) * lowery;
                    segmentsL[n+1] = this.dy + (segmentsL[n+1]-this.dy) * lowery;
                    segmentsZ[n+1] = this.dz + (segmentsZ[n+1]-this.dz) * lowery;
                }

                diff = (segmentsL[n+1] - this.dy) - (segments[n+1] - this.dy);

                if( diff >= 0 ) segmentsL[n+1] = segments[n+1];
                else if ( diff < this.dy ) segmentsL[n+1] -= diff + (diff * (diff/this.dy));
                //else if( diff > 0 && diff < margin ) segmentsL[n+1] = segments[n+1] + diff*0.5//(diff * (diff/margin));//segments[n+1];

                //if( diff < margin && diff > 0 ) segmentsL[n+1] -= diff - diff * (diff/margin);
               // if( diff > -margin && diff < 0 ) segmentsL[n+1] +=  diff * (Math.abs(diff)/margin);
                //if( diff < margin ) segmentsL[n+1] = 0;
               // else if( diff < -margin ) segmentsL[n+1] += diff;

                //if(i==20) console.log(diff)
                /*var ey = ((diff)/margin);

                if( diff > 0 ){
                    if( diff < margin ) segmentsL[n+1] -= diff * ey;
                    else segmentsL[n+1] -= diff;
                }else if( diff < 0 ){
                    if( diff > -margin ) segmentsL[n+1] -= diff * ey;
                }*/




                /*if( segmentsL[n+1] > segments[n+1] - margin ){

                    diff = segmentsL[n+1] - segments[n+1];
                    if(diff>margin) segmentsL[n+1] -= diff;
                    else segmentsL[n+1] -= margin * ((margin-diff)/margin)

                    /*if(segmentsL[n-5]) segmentsL[n-5] -= diff*0.25;
                    if(segmentsL[n-3]) segmentsL[n-3] -= diff*0.5;
                    if(segmentsL[n-1]) segmentsL[n-1] -= diff*0.75;*/
                   // segmentsL[n+1] -= diff;
                    /*if(segmentsL[n+3]) segmentsL[n+3] -= diff*0.75;
                    if(segmentsL[n+5]) segmentsL[n+5] -= diff*0.5;
                    if(segmentsL[n+7]) segmentsL[n+7] -= diff*0.25;*/

               // }

            }
       // }

        //while(i--){

        for( i = 0; i<lng-2; i++ ){

            n = i*2;

            color = [0,1,0];
            color2 = [0,1,1];
            if( i === this.middle ){ color = [1,1,0]; color2 = [1,1,0]; }
            this.lines.push( new Shape.line( color, segments[n] + this.dx, segments[n+1] - this.dy, segmentsZ[n+1] + this.dz, segments[n+2] + this.dx, segments[n+3] - this.dy, segmentsZ[n+3] + this.dz ) );
            this.linesL.push( new Shape.line( color2, segmentsL[n] + this.dx, segmentsL[n+1] - this.dy, segmentsZ[n+1] + this.dz2, segmentsL[n+2] + this.dx, segmentsL[n+3] - this.dy, segmentsZ[n+3] + this.dz2 ) );

        }



        //tell( this.frame + "  " + this.px )

    }

    makeAlphaTexture (){

        var canvas = document.createElement( 'canvas' );
        canvas.width = 1024;
        canvas.height = 16;

        var context = canvas.getContext( '2d' );

        context.fillStyle = '#FFFFFF';
        context.fillRect(0,0,1024,16);

        context.fillStyle = '#000000';
        context.fillRect(624,0,1024,16);

        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;
        return texture;

    }

    makeTexture ( n ){

        var canvas = document.createElement( 'canvas' );
        canvas.width = 256;
        canvas.height = 256;
        var context = canvas.getContext( '2d' );
        var grd = context.createLinearGradient(0, 0, 256,0);
        
        grd.addColorStop(0, '#4E19AA');
        grd.addColorStop(1, '#FF0055');
        //context.fillStyle = grd;
        
        context.fillStyle = '#FF0055';
        context.fillRect(0,0,256,256);
        
        if(n===0) {

            //context.fillRect(128,120,128,16);

        } else {
            context.fillStyle = 'white';
            context.fillRect(0,0,256,256);
        }
        //context.fill();

        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;
        return texture;

    }

}


// SHAPES

const Shape = {};

Shape.line = function( color, x1, y1, z1, x2, y2, z2 ) {

    this.color = color || [0,1,0];

    this.v1 = new THREE.Vector3( x1, y1, z1 );
    this.v2 = new THREE.Vector3( x2, y2, z2 );
    
    this.draw = function () {

        var ctx = main.getCtx();
        ctx.insertLine( this.v1, this.v2, this.color );

    };
};

Shape.circle = function( color, r, x, y, z ) {

    this.color = color || [0,1,1];
    this.v = new THREE.Vector3( x, y, z );
    this.radius = r || 1;
    
    this.draw = function() {

        var ctx = main.getCtx();
        ctx.insertCircleVertices( this.radius, this.v, this.color );

    };
};

Shape.box = function ( color, x, y, z, w, h, angle ) {

    this.color = color || [1,0.5,0];
    this.v = new THREE.Vector3( x, y, z );

    this.w = w || 0;
    this.h = h || 0;

    this.mw = this.w * 0.5;
    this.mh = this.h * 0.5;

    this.angle = angle || 0;

    this.rot = function( p, c, s ) {

        var n = {};
        n.x = c * p.x - s * p.y + this.v.x;
        n.y = s * p.x + c * p.y + this.v.y;
        n.z = p.z
        return n;

    },
    
    this.draw = function() {

        var x1 = -this.mw;
        var x2 = this.mw;
        var y1 = -this.mh;
        var y2 = this.mh;
        var v = this.v;

        var s = Math.sin( this.angle );
        var c = Math.cos( this.angle );

        var p = [

            {x:x1, y:y1, z:v.z}, {x:x2, y:y1, z:v.z },
            {x:x1, y:y1, z:v.z}, {x:x1, y:y2, z:v.z },
            {x:x2, y:y2, z:v.z}, {x:x1, y:y2, z:v.z },
            {x:x2, y:y2, z:v.z}, {x:x2, y:y1, z:v.z },

        ];

        var i = p.length;
        while(i--) p[i] = this.rot( p[i], c, s );

        var ctx = main.getCtx();

        ctx.insertLine( p[0], p[1], this.color );
        ctx.insertLine( p[2], p[3], this.color );
        ctx.insertLine( p[4], p[5], this.color );
        ctx.insertLine( p[6], p[7], this.color );

    };

};