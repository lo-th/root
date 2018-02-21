/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2017
*    @author lo-th / https://github.com/lo-th/
*    @author Engine Samuel Girardin / http://www.visualiser.fr/
*
*    CROWD worker
*    Optimal Reciprocal Collision Avoidance
*
*/

'use strict';

//var Module = { TOTAL_MEMORY: 256*1024*1024 };

// MATH

var M = {}
var RAND_MAX = 32767;
var RVO_EPSILON = 0.0001;
var RVO_EPSILON_2 = 0.01;
M.rand = function ( low, high ) { return low + Math.random() * ( high - low ); };
M.randInt = function ( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); };
M.randCC =  function () { return M.randInt( 0, RAND_MAX ) }

M.normalizeAngle =  function ( angle ) { return Math.atan2(Math.sin(angle), Math.cos(angle)); }

M.TwoPI = 6.283185307179586;
M.Pi = 3.141592653589793;

M.unwrapRad = function( r ){

    r = r % M.TwoPI;
    if (r > M.Pi ) r -= M.TwoPI;
    if (r < - M.Pi ) r += M.TwoPI;
    return r;

};

M.lerp = function ( a, b, percent ) { 

    return a + (b - a) * percent;

};


//var useTransferrable = false;
var timestep = 0.3;
//var ar = null;
//var stop = true;
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
        case 'clear': crowd.clear(); break;

        case 'set': crowd.set( o ); break;

        case 'add': crowd.addAgent( o ); break;
        case 'remove': crowd.removeAgent( o ); break;
        case 'obstacle': crowd.addObstacle( o ); break;
        case 'way': crowd.addWay( o ); break;
        case 'speed': crowd.setSpeed( o ); break;
        case 'goal': crowd.setGoal( o ); break;

        case 'precision': crowd.setPrecision( o ); break;

        case 'stop': crowd.stop( data ); break;
        case 'play': crowd.play( data ); break;

        case 'up' : crowd.up(); break;
        
    }
}


//const torad = 0.0174532925199432957;
//const todeg = 57.295779513082320876;

var CROWD = {};

var Maxi = 1000;
var max, GrMax;

var isBuffer = false;
var patchVelocity = false;
var iteration = 1;

// 15 neighborDist    The default maximum distance (center point to center point) to other agents a new agent
//                    takes into account in the navigation. The larger this number, the longer he running
//                    time of the simulation. If the number is too low, the simulation will not be safe. Must be non-negative.
// 10 maxNeighbors    The default maximum number of other agents a new agent takes into account in the
//                    navigation. The larger this number, the longer the running time of the simulation.
//                    If the number is too low, the simulation will not be safe.
// 10 timeHorizon     The default minimal amount of time for which a new agent's velocities that are computed
//                    by the simulation are safe with respect to other agents. The larger this number, the
//                    sooner an agent will respond to the presence  of other agents, but the less freedom the
//                    agent has in choosing its velocities. Must be positive.
// 10 timeHorizonObst The default minimal amount of time for which  a new agent's velocities that are computed
//                    by the simulation are safe with respect to obstacles. The larger this number, the
//                    sooner an agent will respond to the presence of obstacles, but the less freedom the agent
//                    has in choosing its velocities. Must be positive.


var precision = [ 10, 15, 10, 10 ];

var updateType;


var isInit = false;

var dataReus;
var dataHeap;
var dataPtr, dataPtr2;
var data, data2;
var reus = 2;
var oldXYR = false;

var agents = [];
var obstacles = [];
var way = [];

// -----------------------------------
//
//  WORLD
//
// -----------------------------------

var crowd = {

    init: function ( o ) {

        isBuffer = o.isBuffer || false;

        importScripts( o.blob );

         try {

            // Call C from JavaScript
            //var result = Module.ccall('int_sqrt', // name of C function
            //                          'number', // return type
            //                          ['number'], // argument types
            //                          [28]); // arguments

            //CROWD = {};

            CROWD.init = Module.cwrap('init', 'boolean', []);
            CROWD.run = Module.cwrap('run', '', ['number']);
            CROWD.deleteCrowd = Module.cwrap('deleteCrowd', '', []);
            CROWD.setTimeStep = Module.cwrap('setTimeStep', '', ['number']);
            CROWD.getTimeStep = Module.cwrap('getTimeStep', 'number', ['number']);

            CROWD.allocateMem_X_Y_RAD = Module.cwrap('allocateMem', '', ['number', 'number']);
            CROWD.allocateMemResusable = Module.cwrap('allocateMemReusable', '', ['number', 'number']);

            CROWD.addObstacle = Module.cwrap('addObstacle', '', ['number', 'number']);
            CROWD.processObstacles = Module.cwrap('processObstacles', 'number', []);
            CROWD.removeObstacles = Module.cwrap('removeObstacles', 'number', []);

            CROWD.addAgent = Module.cwrap('addAgent', '', ['number', 'number']);
            //CROWD.removeAgent = Module.cwrap('removeAgent', '', ['number']);
            CROWD.removeAgent = Module.cwrap('removeAgent', '', ['number']);
            //CROWD.removeAgent = Module.cwrap('removeAgent', 'number', ['number']);

            CROWD.addAgentGoal = Module.cwrap('addAgentGoal', '', ['number', 'number', 'number']);
            CROWD.addAgentsGoal = Module.cwrap('addAgentsGoal', '', ['number', 'number']);

            CROWD.addWayPoint = Module.cwrap('addWayPoint', '', ['number', 'number']);
            CROWD.recomputeRoadmap = Module.cwrap('recomputeRoadmap', '', []);

            CROWD.setAgentMaxSpeed = Module.cwrap('setAgentMaxSpeed', '', ['number', 'number']);
            CROWD.setAgentRadius = Module.cwrap('setAgentRadius', '', ['number', 'number']);
            //CROWD.setAgentMaxSpeed = Module.cwrap('setAgentMaxSpeed', '', ['number']);
            CROWD.setAgentMaxNeighbors = Module.cwrap('setAgentMaxNeighbors', '', ['number', 'number']);
            CROWD.setAgentNeighborDist = Module.cwrap('setAgentNeighborDist', '', ['number', 'number']);
            CROWD.setAgentTimeHorizon = Module.cwrap('setAgentTimeHorizon', '', ['number', 'number']);
            CROWD.setAgentTimeHorizonObst = Module.cwrap('setAgentTimeHorizonObst', '', ['number', 'number']);

            CROWD.setAgentPosition = Module.cwrap('setAgentPosition', '', ['number', 'number']);
            CROWD.setAgentPrefVelocity = Module.cwrap('setAgentPrefVelocity', '', ['number', 'number']);
            CROWD.setAgentVelocity = Module.cwrap('setAgentVelocity', '', ['number', 'number']);
            CROWD.setAgentUseRoadMap = Module.cwrap('setAgentUseRoadMap', '', ['number', 'number']);

            CROWD.getAgentRadius = Module.cwrap('getAgentRadius', 'number', ['number']);
            CROWD.getAgentMaxSpeed = Module.cwrap('getAgentMaxSpeed', 'number', ['number']);
            CROWD.getAgentMaxNeighbors = Module.cwrap('getAgentMaxNeighbors', 'number', ['number']);
            CROWD.getAgentNeighborDist = Module.cwrap('getAgentNeighborDist', 'number', ['number']);
            CROWD.getAgentTimeHorizon = Module.cwrap('getAgentTimeHorizon', 'number', ['number']);
            CROWD.getAgentTimeHorizonObst = Module.cwrap('getAgentTimeHorizonObst', 'number', ['number']);
            CROWD.getAgentPosition = Module.cwrap('getAgentPosition', 'number', ['number']);
            CROWD.getAgentPrefVelocity = Module.cwrap('getAgentPrefVelocity', 'number', ['number']);
            CROWD.getAgentVelocity = Module.cwrap('getAgentVelocity', 'number', ['number']);
            CROWD.getAgentUseRoadMap = Module.cwrap('getAgentUseRoadMap', 'number', ['number']);

            Maxi = o.Maxi || 1000; // number of agent max
            GrMax = Maxi * 5;
            max = Maxi * 3 ;

            //this.initEngine();
            //this.set( o );

            self.postMessage( { m:'init' } );
        }catch( error ) {}

    },

    clear: function () {
        var a, z, i = agents.length;
        //while( i-- ){ 
        while( agents.length > 0 ){ 

            agents.pop().remove();

            //a = agents.pop();
            //CROWD.setAgentRadius( a.id, 0 );
            //CROWD.setAgentMaxSpeed( a.id, 0 );
            
            //CROWD.removeAgent( i );

            //console.log('remove', z, a.id )
            //a = null;
        }

        agents = [];

        //CROWD.recomputeRoadmap();
        //console.log(CROWD.getAgentRadius(1))


        //while( obstacles.length > 0 ) obstacles.pop().remove();
        //CROWD.removeObstacles();

        //this.up();

        //stop = true;

    },

    up: function(){

        CROWD.processObstacles();
        CROWD.recomputeRoadmap();

    },

    reset: function () {

        //stop = true;

        if( !isBuffer ) Gr = new Float32Array( GrMax );

        //CROWD.run( iteration );

        //this.up()
        CROWD.deleteCrowd();

        isInit = false;
        

        agents = [];
        obstacles = [];

        this.initEngine();

        self.postMessage({ m:'start' });

    },

    initEngine: function (){

        //if(dataHeap) _free( dataHeap.byteOffset );
        //if(dataReus) _free( dataReus.byteOffset );

        // init

        isInit = CROWD.init();

        //console.log('r' + CROWD.getAgentRadius(1))

        

        // base setting
        this.set();

        // dataHeap
        //if( updateType === 0 ) 
        this.allocate_X_Y_RAD();
        
        // dataReus
        this.allocate_Resusable();

        

    },

    set: function ( o ) {

        o = o || {};

        timestep = o.timeStep !== undefined ? o.timeStep : 0.016;
        if( o.forceStep !== undefined ) timestep = o.forceStep;

        CROWD.setTimeStep( timestep );

        //console.log(CROWD.getTimeStep())

        iteration = o.iteration || 1;

        patchVelocity = o.patchVelocity || false;

        precision = o.precision || [ 10, 15, 10, 10 ];

        updateType = o.updateType !== undefined ? o.updateType : 1;

        //stop = false;

    },

    allocate_X_Y_RAD: function () {

     
        if( oldXYR ){ 
            //_free( dataPtr );
            _free( dataHeap.buffer )
        }

        data = new Float32Array( max );
        var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
        dataPtr = _malloc( nDataBytes );

        dataHeap = new Uint8Array( Module.HEAPU8.buffer, dataPtr, nDataBytes );
        dataHeap.set( new Uint8Array( data.buffer ) );

        CROWD.allocateMem_X_Y_RAD( dataHeap.byteOffset, data.length );

        //
        oldXYR = true;

        //console.log( data.length, dataHeap.length, max );

    },

    allocate_Resusable: function () {

        data2 = new Float32Array( reus );
        var nDataBytes2 = data2.length * data2.BYTES_PER_ELEMENT;
        dataPtr2 = _malloc( nDataBytes2 );

        dataReus = new Uint8Array( Module.HEAPU8.buffer, dataPtr2, nDataBytes2 );
        dataReus.set( new Uint8Array( data2.buffer ));

        CROWD.allocateMemResusable( dataReus.byteOffset, data2.length );

    },

    

    step: function () {

        //if(stop) return;
        if(!isInit) return;

        if( patchVelocity ) this.setPreferredVelocities( true );

        CROWD.run( iteration );
        //CROWD.X_Y_RAD = new Float32Array( dataHeap.buffer, dataHeap.byteOffset, max );

        this.stepAgents();

        if( isBuffer ) self.postMessage({ m:'step', Gr:Gr },[ Gr.buffer ]);
        else self.postMessage( { m:'step', Gr:Gr } );

    },

    setPreferredVelocities: function ( full ) {

        agents.forEach( function ( b, id ) {
             b.correctVelocity( full );
        });

    },

    stepAgents: function ( ) {

        if( updateType === 0 ) CROWD.XYR = new Float32Array( dataHeap.buffer, dataHeap.byteOffset, max );

        agents.forEach( function ( b, id ) {

            //b.correctVelocity( true );

            var n = b.id*5;
            var m = b.id*3;

            if( updateType === 0 ){

                b.setPosition( CROWD.XYR[ m ], CROWD.XYR[ m + 1 ] );
                //b.smoothOrientation();
                //b.setOrientation( CROWD.XYR[ m + 2 ] );
                b.getOrientation();

            } else {

                b.getPosition();
                b.getOrientation();

            }

            Gr[ n ] = b.currentSpeed;
            Gr[ n + 1 ] = b.position.x;
            Gr[ n + 2 ] = b.position.y;
            Gr[ n + 3 ] = b.orientation;

            // speed
            //Gr[ n ] = b.currentSpeed;//.getSpeed2();

            Gr[ n + 4 ] = b.getDistanceToGoal();

        });

    },


    

    

    addWay: function ( o ){

        if( o.pos ) CROWD.addWayPoint( o.pos[0], o.pos[2] );
        else CROWD.addWayPoint( o.x || 0, o.z || 0 );
        //CROWD.recomputeRoadmap();

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

        //var i = agents.length, a;

        if( o.id !== undefined ){
            agents[o.id].setGoal( o );
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

        //var obstacle = ;
        obstacles.push( new crowd.Obstacle( o ) );

    },

    addAgent: function ( o ) {

        agents.push( new crowd.Agent( o ) );
    
    },

    removeAgent: function ( o ) {
        
        agents[o.id].remove();
        agents.splice( o.id, 1 );

        var i = agents.length;
        while( i-- ){
            agents[i].setId( i );
        }

        this.up();

    },

    setIteration: function ( v ) {

        iteration = v;

    },

    setPrecision: function ( o ) {

        precision = o.p || [ 10, 15, 10, 10 ];

        /*switch ( v ) {

            case 1: precision = [ 10, 15, 10, 10 ]; break;
            case 2: precision = [ 100, 200, 50, 30 ]; break;
            case 3: precision = [ 100, 100, 100, 100 ]; break;

        }*/

        var i = agents.length, n, agent;
        while( i-- ){
            agents[i].setPrecision();
        }



    },

}



// -----------------------------------
//
//  AGENT
//
// -----------------------------------

crowd.Agent = function ( o ) {

    this.id = agents.length;

    //The radius of the agent. Must be non-negative.
    this.radius = o.radius || 2;

    this.speed = o.speed !== undefined ? o.speed : 1;
    this.isSelected = false;

    var pos = o.pos || [0,0,0];
    // The current position of the agent.
    this.position = new crowd.Vec2( pos[0], pos[2] );
    this.oldPos = new crowd.Vec2( pos[0], pos[2] );
    this.goal = new crowd.Vec2( pos[0], pos[2] );

    // The current velocity of the agent.
    this.velocity = new crowd.Vec2();
    // The current preferred velocity of the agent
    // This is the velocity the agent would take if no other agents or obstacles were around. 
    // The simulator computes an actual velocity for the agent that follows the preferred 
    // velocity as closely as possible, but at the same time guarantees collision avoidance
    this.prevVelocity = new crowd.Vec2();

    this.useRoadMap = o.useRoad || false;

    this.goalVector = new crowd.Vec2();
    this.tmpA = new crowd.Vec2();
    this.tmpB = new crowd.Vec2();

    this.orientation = 0;
    this.oldOrientation = 0;

    this.group = o.group || 0;


    this.currentSpeed = 0;


    CROWD.addAgent( this.position.x, this.position.y );

    CROWD.setAgentRadius( this.id, this.radius );
    CROWD.setAgentMaxSpeed( this.id, this.speed );
    CROWD.setAgentUseRoadMap( this.id, this.useRoadMap ? 1:0 );


    //console.log('agent id:'+this.id, 'radius:' + CROWD.getAgentRadius(this.id))

    this.setPrecision();
    this.setVelocity( 0,0 );
    this.setPrefVelocity( 0,0 );

    this.setGoal( o );

}

crowd.Agent.prototype = {

    constructor: crowd.Agent,

    remove: function () {

        var r = CROWD.removeAgent( this.id );

    },

    stop: function(){

        CROWD.setAgentMaxSpeed( this.id, 0 );

    },

    play: function(){

        CROWD.setAgentMaxSpeed( this.id, this.speed );

    },

    correctVelocity: function ( full ) {

        // Set the preferred velocity to be a vector of unit magnitude (speed) in the direction of the goal.
        this.goalVector.copy( this.goal );
        this.goalVector.sub( this.position );

        //if( this.goalVector.length() > 1.0 ) this.goalVector.normalize();

        if ( this.goalVector.lengthSq() < this.radius * this.radius ) this.goalVector.set( 0, 0 ); 
        else this.goalVector.normalize();

        if(full){
            // Perturb a little to avoid deadlocks due to perfect symmetry
            var angle = M.randCC() * 2.0 * Math.PI / RAND_MAX;
            var dist = M.randCC() * 0.0001 / RAND_MAX;
            this.tmpA.set( Math.cos(angle), Math.sin(angle) ).multiplyScalar(dist)
            this.goalVector.add( this.tmpA );
        }

        this.setPrefVelocity( this.goalVector.x, this.goalVector.y );

    },

    setOrientation: function ( r ) {

        this.oldOrientation = this.orientation;
        this.orientation = r;

    },

    getOrientation: function ( r ) {

        //var g = this.getVelocity().Normalize().angle()

        this.oldOrientation = this.orientation;

        var a, b 

        a = this.oldPos.angleTo( this.position )
        b = this.oldPos.distanceTo( this.position );
        if(b<0) b*=-1;

        if( a > this.orientation + M.Pi )  a -= M.TwoPI;
        if( a < this.orientation - M.Pi )  a += M.TwoPI;

        var tr = ( a - this.orientation ) * 0.1;

        if( b > RVO_EPSILON_2 ){ 
            this.orientation += tr;
            //M.lerp( a, this.orientation, 0.017 );
            this.currentSpeed = b;
        } else {
            this.currentSpeed = 0;
        }

    },

    /*getOrientation: function () {

        this.getVelocity();

        if(this.currentSpeed>1) this.orientation = M.lerp( this.orientation, this.getVelocity().orient(), 0.25 );
        return this.orientation;

    },*/

    /*smoothOrientation: function () {
                 
        this.tmpB.copy( this.getVelocity() );
        var r = Math.atan2(this.tmpB.x , this.tmpB.y);
        if(r > this.orientation + Math.PI)  r -= 2 * Math.PI;
        if(r < this.orientation - Math.PI)  r += 2 * Math.PI;

        var tr = ( r-this.orientation) * 0.01;//0.01 ;
        this.orientation += tr ; 
        return 1 ;
    },*/

    setPosition: function ( x, y ) {

        this.oldPos.copy( this.position );
        this.position.set( x, y );

    },

    getPosition : function () {

        this.oldPos.copy( this.position );

        CROWD.getAgentPosition( this.id );
        var arr = new Float32Array( dataReus.buffer, dataReus.byteOffset, reus );
        this.position.fromArray( arr );
        return this.position;

    },

    /*getSpeed2: function (){

        //this.getVelocity();

        this.currentSpeed = this.oldPos.distanceTo( this.position ) * 9.8;
        if( this.currentSpeed < 0.01 ) this.currentSpeed = 0;
        return this.currentSpeed;

    },

    getSpeed: function (){

        this.getVelocity();

        this.currentSpeed = this.velocity.length(); //Math.floor( this.oldPos.distanceTo( this.position )*10 );
        return this.currentSpeed;

    },*/

    setPrecision: function ( v ) {

        v = v || precision;

        //console.log(v)

        CROWD.setAgentMaxNeighbors( this.id, v[0] );
        CROWD.setAgentNeighborDist( this.id, v[1] );
        CROWD.setAgentTimeHorizon(  this.id, v[2] );
        CROWD.setAgentTimeHorizonObst( this.id, v[3] );

    },

    setGoal: function ( o ) {

        if( o.goal ) this.goal.set( o.goal[0], o.goal[1] );
        else this.goal.set( o.x || 0, o.z || 0 );

        CROWD.addAgentGoal( this.id, this.goal.x, this.goal.y );

    },

    getDistanceToGoal: function () {

        return this.position.distanceTo( this.goal );

    },

    setVelocity : function ( x, y ) {

        this.velocity.set( x, y );
        CROWD.setAgentVelocity( this.id, this.velocity.x, this.velocity.y );

    },

    getVelocity : function () {

        CROWD.getAgentVelocity( this.id );
        var arr = new Float32Array( dataReus.buffer, dataReus.byteOffset, reus );
        this.velocity.fromArray( arr );
        return this.velocity;

    },

    setPrefVelocity : function ( x, y ) {

        this.prevVelocity.set( x, y );
        CROWD.setAgentPrefVelocity( this.id, this.prevVelocity.x, this.prevVelocity.y );

    },

    getPrefVelocity : function () {

        CROWD.getAgentPrefVelocity( this.id );
        var arr = new Float32Array( dataReus.buffer, dataReus.byteOffset, reus );
        this.prevVelocity.fromArray( arr );
        return this.prevVelocity;

    },

    setId : function ( id ) {

        this.id = id;

    },


    getId : function () {

        return this.id;

    },


}

/*void Agent::update(),
    {
        velocity_ = newVelocity_;
        position_ += velocity_ * sim_->timeStep_;           

        smoothOrientation(velocity_.x(),velocity_.y()) ; 

    }
float Agent::smoothOrientation(float x, float y) {
        
    const float PI = 3.14159265358979323846f;       

    float r = atan2f (x , y) ;
    if(r> orientation_+PI)  r -= 2*PI ;
    if(r< orientation_-PI)  r += 2*PI ;

    float tr =( r-orientation_) /100 ;
    orientation_+=tr ; 
    return 1 ;
}*/

// -----------------------------------
//
//  OBSTACLE
//
// -----------------------------------

crowd.Obstacle = function ( o ) {

    // vertices in counterclockwise

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

        var cos = Math.cos(r);
        var sin = Math.sin(r);

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

            arr.push( vx, vy )

        }
        
        this.data = new Float32Array(arr);
      
        this.allocateMem();
        this.addToSimulation();

        _free( this.dataHeap.byteOffset );

        //console.log('box added', this.data)
    },
    addByClosedPolygon : function ( o ) {

        var index = 0;
        this.data = new Float32Array( o.arr.length * 2 );
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
    remove : function () {

        CROWD.removeObstacles( this.id );
    },
    addToSimulation : function () {

        CROWD.addObstacle( this.dataHeap.byteOffset, this.data.length );

        //CROWD.processObstacles();
        //CROWD.recomputeRoadmap();
        //BABYLON.CrowdPlugin.addObstacle(this.dataHeap.byteOffset, this.data.length);
    },

    allocateMem : function () {

        var nDataBytes = this.data.length * this.data.BYTES_PER_ELEMENT;
        var dataPtr = _malloc( nDataBytes );
        this.dataHeap = new Uint8Array( Module.HEAPU8.buffer, dataPtr, nDataBytes );
        this.dataHeap.set(new Uint8Array(this.data.buffer));

    }

}



// WayPoint
/*
crowd.WayPoint = function ( x, y ) {

    CROWD.addWayPoint( x, y );

}

crowd.WayPoint.prototype = {

    constructor: crowd.WayPoint,

    remove : function ( id ) {
    },

}
*/



// -----------------------------------
//
//  VECTOR2
//
// -----------------------------------

crowd.Vec2 = function( x, y ) {

    this.x = x || 0;
    this.y = y || 0;

}

crowd.Vec2.prototype = {

    constructor: crowd.Vec2,

    /*x: function () {
        return this.x;
    },

    y: function () {
        return this.y;
    },*/

    set: function ( x, y ){

        this.x = x;
        this.y = y;
        return this;

    },

    length: function () {

        return Math.sqrt( this.x * this.x + this.y * this.y );

    },

    lengthSq: function () {

        return this.x * this.x + this.y * this.y;

    },

    manhattanLength: function () {

        return Math.abs( this.x ) + Math.abs( this.y );

    },

    normalize: function () {

        var norm = this.length();
        if (norm === 0) return this;
        this.x /= norm;
        this.y /= norm;
        return this;

    },

    lerp: function ( v, alpha ) {

        this.x += ( v.x - this.x ) * alpha;
        this.y += ( v.y - this.y ) * alpha;
        return this;

    },

    angleTo: function ( v ) {

        var angle = Math.atan2( this.y - v.y, this.x - v.x );
        //if ( angle < 0 ) angle += 2 * Math.PI;
        return angle;

    },

    angle: function(){

        // computes the angle in radians with respect to the positive x-axis
        var angle = Math.atan2( this.y , this.x );
        if ( angle < 0 ) angle += 2 * Math.PI;
        return angle;

    },

    distanceTo: function( v ) {

        return Math.sqrt( this.distanceToSquared( v ) );

    },

    distanceToSquared: function ( v ) {

        var dx = this.x - v.x, dy = this.y - v.y;
        return dx * dx + dy * dy;

    },

    manhattanDistanceTo: function ( v ) {

        return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y );

    },

    copy: function( v ){

        this.x = v.x;
        this.y = v.y;
        return this;

    },

    clone: function () {

        return new this.constructor( this.x, this.y );

    },

    sub:function( v ){

        this.x -= v.x;
        this.y -= v.y;
        return this;

    },

    multiplyScalar: function ( s ) {

        this.x *= s;
        this.y *= s;
        return this;

    },

    multiply: function ( v ) {

        this.x *= v.x;
        this.y *= v.y;
        return this;

    },

    add: function( v ) {

        this.x += v.x;
        this.y += v.y;
        return this;

    },

    divide: function ( v ) {

        this.x /= v.x;
        this.y /= v.y;
        return this;

    },

    rotateAround: function ( center, angle ) {

        var c = Math.cos( angle ), s = Math.sin( angle );

        var x = this.x - center.x;
        var y = this.y - center.y;

        this.x = x * c - y * s + center.x;
        this.y = x * s + y * c + center.y;

        return this;

    },

    fromArray: function ( array, offset ) {

        if ( offset === undefined ) offset = 0;

        this.x = array[ offset ];
        this.y = array[ offset + 1 ];

        return this;

    },

    toArray: function ( array, offset ) {

        if ( array === undefined ) array = [];
        if ( offset === undefined ) offset = 0;

        array[ offset ] = this.x;
        array[ offset + 1 ] = this.y;

        return array;

    },

}