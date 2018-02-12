/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2017
*    @author lo-th / https://github.com/lo-th/
*    @author Engine Samuel Girardin / http://www.visualiser.fr/
*
*    CROWD worker
*
*/

'use strict';

//var useTransferrable = false;
var timer, step, timestep;
//var ar = null;

var Gr, GrMax;

self.onmessage = function ( e ) {

    var data = e.data;
    var m = data.m;
    var o = data.o;

    // ------- buffer data
    if( data.Gr ) Gr = data.Gr;

    switch( m ){

        case 'init': crowd.init( data ); break;
        case 'step': crowd.step( data ); break;
        case 'reset': crowd.reset( data ); break;

        case 'set': crowd.set( o ); break;

        case 'add': crowd.addAgent( o ); break;
        case 'obstacle': crowd.addObstacle( o ); break;
        case 'way': crowd.addWay( o ); break;
        case 'speed': crowd.setSpeed( o ); break;
        case 'goal': crowd.setGoal( o ); break;

        case 'stop': crowd.stop( data ); break;
        case 'play': crowd.play( data ); break;

        /*case 'start':
            useTransferrable = data.useTransferrable;
            ar = data.ar;
            if( useTransferrable ) timer = setTimeout( crowd.update, step );
            else timer = setInterval( crowd.update, step ); 
        break;
        case 'run': 
            ar = data.ar;
            timer = setTimeout( crowd.update, step ); 
        break;*/
        
    }
}


/*this.post = function ( o, buffer ){

    if( useTransferrable ) self.postMessage( o, buffer );
    else self.postMessage( o );

}*/


// crowd


//const torad = 0.0174532925199432957;
//const todeg = 57.295779513082320876;

var CROWD;

var Maxi = 100;
var GrMax = Maxi * 5;
var max = 6000;
var reus = 2;

var isBuffer = false;


var iteration = 1;
var precision = [ 10, 15, 10, 10 ];


var dataReus;
var dataHeap;

var agents = [];
var obstacles = [];
var way = [];

/*function initARRAY(){

    ar = new Float32Array( 100 * 5 );

}*/

var crowd = {

    init: function ( o ) {

        isBuffer = o.isBuffer || false;

        if( !CROWD ) importScripts( o.blob );

        iteration = o.iteration || 1;

        CROWD.init();

        Maxi = o.Maxi || 100;
        GrMax = Maxi * 5;
        max = Maxi * 3 ;

        // dataHeap

        var data = new Float32Array( max );
        var nDataBytes = max * data.BYTES_PER_ELEMENT;
        var dataPtr = _malloc( nDataBytes );

        dataHeap = new Uint8Array( Module.HEAPU8.buffer, dataPtr, nDataBytes );
        dataHeap.set( new Uint8Array( data.buffer ) );

        CROWD.allocateMem_X_Y_RAD( dataHeap.byteOffset, max );

        // dataReus

        var data2 = new Float32Array( reus );
        var nDataBytes2 = reus * data2.BYTES_PER_ELEMENT;
        var dataPtr2 = _malloc( nDataBytes2 );

        dataReus = new Uint8Array( Module.HEAPU8.buffer, dataPtr2, nDataBytes2 );
        dataReus.set( new Uint8Array( data2.buffer ));

        CROWD.allocateMemResusable( dataReus.byteOffset, reus );

        //

        CROWD.setTimeStep( o.timeStep || 0.016 );//0.3?

        //
        
        if( !isBuffer ) Gr = new Float32Array( GrMax );

        //initARRAY();

        self.postMessage( { m:'init' } );

    },

    step: function () {

        CROWD.run( iteration );
        CROWD.X_Y_RAD = new Float32Array( dataHeap.buffer, dataHeap.byteOffset, max );

        stepAgents();

        if( isBuffer ) self.postMessage({ m:'step', Gr:Gr },[ Gr.buffer ]);
        else self.postMessage( { m:'step', Gr:Gr } );

    },

    /*setTime: function ( t ){

        step = 1000 / t;
        timestep = step * 0.001;

    },*/

    reset: function () {

       // clearInterval( timer );
        CROWD.deleteCrowd();

        if( !isBuffer ) Ar = new Float32Array( ArMax );

        self.postMessage({ m:'start' });

    },

    set: function ( o ) {

        o = o || {};

        var timstep = o.timeStep !== undefined ? o.timeStep : 0.016;
        CROWD.setTimeStep( timstep );

        iteration = o.iteration || 1;

        if(o.precision !== undefined) crowd.setPrecision(o.precision);

    },

    /*update: function () {

        CROWD.run( iteration );
        CROWD.X_Y_RAD = new Float32Array( dataHeap.buffer, dataHeap.byteOffset, max );

        stepAgents( ar );

        if( useTransferrable ) post( { message:'run', ar:ar }, [ ar.buffer ] );
        else post( { message:'run', ar:ar } );

    },*/


    addWay: function ( o ){

        CROWD.addWayPoint( o.x, o.y );
        CROWD.recomputeRoadmap();

    },

    stop: function( o ){

        agents[ o.id ].stop();

    },

    play: function( o ){

        agents[ o.id ].play();

    },

    setSpeed:function( o ){

        CROWD.setAgentMaxSpeed( o.id, o.speed );
        
    },

    setGoal:function( o ){

        var i = agents.length, a;

        if( o.id !== undefined ){
            agents[o.id].addGoal( o );
        }


        /*if( o.group !== undefined ){
            //var i = agents.length, a;
            while(i--){
                a = agents[i]
                if( a.group === o.group ) a.addGoal( o );
            }
        } else {
            CROWD.addAgentsGoal( o.x, o.z );
        }*/

        
        CROWD.recomputeRoadmap();

    },

    addObstacle: function ( o ) {

        var obstacle = new crowd.Obstacle( o );
        obstacles.push( obstacle );

    },

    addAgent: function ( o ) {

        var agent = new crowd.Agent( o );
        

    },

    removeAgent: function ( id ) {
        
        agents[id].remove();
        agents.splice( id, 1 );

        var i = agents.length;
        while( i-- ){
            agents[i].setId( i );
        }

    },

    setIteration: function ( v ) {

        iteration = v;

    },

    setPrecision: function ( v ) {

        switch ( v ) {

            case 1: precision = [ 10, 15, 10, 10 ]; break;
            case 2: precision = [ 100, 200, 50, 30 ]; break;
            case 3: precision = [ 100, 100, 100, 100 ]; break;

        }

        var i = agents.length, n, agent;
        while( i-- ){
            agents[i].setPrecision();
        }

    },

}



function stepAgents( ) {

    var XYR = CROWD.X_Y_RAD;

    agents.forEach( function ( b, id ) {

        var n = id*5;
        var m = id*3;
        // position
        b.setPosition( XYR[ m ], XYR[ m + 1 ] );
        Gr[ n + 1 ] = b.position.x;
        Gr[ n + 2 ] = b.position.y;

        Gr[ n ] = b.getSpeed();
        // rotation
        //b.orientation = XYR[ m + 2 ]//Gr[ n + 3 ] = XYR[ m + 2 ];
  Gr[ n + 3 ] = XYR[ m + 2 ];
        
         //console.log('agent', b.position.x)
       // Gr[ n + 3 ] = b.getOrientation();
        Gr[ n + 4 ] = b.getDistanceToGoal();

        
   
    });

};

// Vector 2

crowd.Vec2 = function( x, y ) {

    this.x = x || 0;
    this.y = y || 0;

}

crowd.Vec2.prototype = {

    constructor: crowd.Vec2,

    set: function ( x, y ){

        this.x = x;
        this.y = y;

    },

    length: function () {

        return Math.sqrt( this.x * this.x + this.y * this.y );

    },

    lerp: function ( v, alpha ) {

        this.x += ( v.x - this.x ) * alpha;
        this.y += ( v.y - this.y ) * alpha;
        return this;

    },

    angle: function(v) {

        return Math.atan2( v.y - this.y, v.x - this.x );

    },

    orient: function(){

        return Math.atan2( this.x , this.y );

    },

    distanceTo: function( v ) {

        var dx = this.x - v.x;
        var dy = this.y - v.y;
        return Math.sqrt( dx * dx + dy * dy );

    },

    copy: function( v ){

        this.x = v.x;
        this.y = v.y;

    },

    sub:function( v ){

        this.x -= v.x;
        this.y -= v.y;

    },

}








// Agent

crowd.Agent = function ( o ) {

    this.id = agents.length;

    this.radius = o.radius || 4;
    this.speed = o.speed || 1;
    this.isSelected = false;

    this.goal = new crowd.Vec2( o.gx || 0, o.gz || 0 );

    this.position = new crowd.Vec2( o.x || 0, o.z || 0 );
    this.oldPos = new crowd.Vec2( o.x || 0, o.z || 0 );
    this.velocity = new crowd.Vec2();
    this.useRoadMap = o.useRoadMap || false;

    this.orientation = 0;

    this.group = o.group || 0;


    this.currentSpeed = 0;



    

    // 

    CROWD.addAgent( this.position.x, this.position.y );

    // 

    //

    CROWD.setAgentRadius( this.id, this.radius );
    CROWD.setAgentMaxSpeed( this.id, this.speed );
    CROWD.setAgentUseRoadMap( this.id, this.useRoadMap );


    //console.log(this.id, o.radius, this.useRoadMap)

    //this.setPrecision();


    agents.push( this );



    

}

crowd.Agent.prototype = {

    constructor: crowd.Agent,

    remove: function () {

        CROWD.removeAgent( this.id );

    },

    stop: function(){

        CROWD.setAgentMaxSpeed( this.id, 0 );

    },

    play: function(){

        CROWD.setAgentMaxSpeed( this.id, this.speed );

    },

    setPosition: function ( x, y ) {

        this.oldPos.copy( this.position );
        this.position.set( x, y );

    },

    getSpeed: function (){

        this.getVelocity();

        //this.currentSpeed =

        this.currentSpeed = this.velocity.length(); //Math.floor( this.oldPos.distanceTo( this.position )*10 );
        return this.currentSpeed;
    },

    setPrecision: function ( v ) {

        v = v || precision;

        CROWD.setAgentMaxNeighbors( this.id, v[0] );
        CROWD.setAgentNeighborDist( this.id, v[1] );
        CROWD.setAgentTimeHorizon(  this.id, v[2] );
        CROWD.setAgentTimeHorizonObst( this.id, v[3] );

    },

    addGoal: function ( o ) {

        this.goal.set( o.x, o.z );
        CROWD.addAgentGoal( this.id, o.x, o.z );

    },

    getDistanceToGoal: function () {

        return this.position.distanceTo( this.goal );

    },

    getOrientation: function () {

        this.getVelocity();

        if(this.currentSpeed>1) this.orientation = this.lerp( this.orientation, this.getVelocity().orient(), 0.25 );
        return this.orientation;

    },

    getVelocity : function () {

        CROWD.getAgentVelocity( this.id );
        var a = new Float32Array( dataReus.buffer, dataReus.byteOffset, reus );
        this.velocity.set( a[0], a[1] );
        return this.velocity;

    },

    lerp : function (a, b, percent) { 

        return a + (b - a) * percent;

    },

    setId : function ( id ) {

        this.id = id;

    },


    getId : function () {

        return this.id;

    },


}

// Obstacle

crowd.Obstacle = function ( o ) {

    this.id = obstacles.length;

    this.dataHeap = null;
    this.data = null;

    o.type = o.type || 'box';
    if(o.type === 'box') this.addByBoundingBox(o);
    else this.addByClosedPolygon(o);
    


}

crowd.Obstacle.prototype = {

    constructor: crowd.Obstacle,

    addByBoundingBox : function ( o ) {
        var pos = o.pos || [0,0,0];
        var size = o.size || [32,32,32];

        var x = pos[0];
        var y = pos[2];
        var mw = size[0]*0.5;
        var mh = size[2]*0.5;

        var r = o.r || 0;

        var cos = Math.cos(o.r);
        var sin = Math.sin(o.r);

        var px = 0;
        var py = 0;

        var vx = 0;
        var vy = 0;

        var arr = []

        for(var i=0; i<4; i++){

            if(i===0) {px = mw; py = mh;}
            if(i===1) {px = -mw; py = mh;}
            if(i===2) {px = -mw; py = -mh;}
            if(i===3) {px = mw; py = -mh;}

            vx = (cos * px) + (sin * py) + x,
            vy = (cos * py) - (sin * px) + y;

            arr.push(vx, vy)

        }
        

        //var min = {x:x+mw, z:y+mh }
        //var max = {x:x-mh, z:y-mh }

        //var min = {x:-20, z:-20 }
        //var max = {x:20, z:20 }

        //this.data = new Float32Array([x+mw, y+mh, x-mw, y+mh, x-mw, y-mh, x+mw, y-mh]);
        this.data = new Float32Array(arr);
        //this.data = new Float32Array([max.x, max.z, min.x, max.z, min.x, min.z, max.x, min.z]);
      
        this.allocateMem();
        this.addToSimulation();

        _free( this.dataHeap.byteOffset );

        //console.log('box added', this.data)
    },
    addByClosedPolygon : function ( o ) {
        var index = 0;
        this.data = new Float32Array( o.arr.length * 2);
        for (var i = 0; i < o.arr.length; i++) {
            this.data[index++] = o.arr[i].x;
            this.data[index++] = o.arr[i].y;
        }

        this.allocateMem();
        this.addToSimulation();
        _free(this.dataHeap.byteOffset);
    },
    rebuild : function () {
        this.allocateMem();
        //this.addToSimulation();
        _free( this.dataHeap.byteOffset );
    },
    remove : function ( id ) {
       // if (this.mesh) this.mesh.dispose();
        //Obstacle.ObstaclesOrder.splice(index, 1);
        //Obstacle.NumObstacles--;
    },
    addToSimulation : function () {

        CROWD.addObstacle( this.dataHeap.byteOffset, this.data.length );

        CROWD.processObstacles();
        CROWD.recomputeRoadmap();
        //BABYLON.CrowdPlugin.addObstacle(this.dataHeap.byteOffset, this.data.length);
    },

    allocateMem : function () {

        var nDataBytes = this.data.length * this.data.BYTES_PER_ELEMENT;
        var dataPtr = _malloc( nDataBytes );
        this.dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        this.dataHeap.set(new Uint8Array(this.data.buffer));

    }

}



// WayPoint

crowd.WayPoint = function ( x, y ) {

    CROWD.addWayPoint( x, y );

}

crowd.WayPoint.prototype = {

    constructor: crowd.WayPoint,

}