//var Module = { TOTAL_MEMORY: 256*1024*1024 };

var Ar, ArLng, ArPos, ArMax;
var key;
var timeStep = 1/60;
var isBuffer = false;
var world = null;
var test; 

// forces
//var tmpForce = [];//null;

// kinematic
//var tmpMatrix = [];
var tmpPos, tmpZero;
var tmpMat, tmpQuat;


self.onmessage = function ( e ) {

	var data = e.data;
    var m = data.m;
    var o = data.o;

    // ------- buffer data
    if( data.Ar ) Ar = data.Ar;
    if( data.key ) key = data.key;

    switch( m ){

    	case 'init': init( data ); break;
        case 'step': step(); break;
        case 'start': start(); break;
        case 'reset': reset(); break;

        case 'set': world.set( o ); break;
        case 'add': world.add( o ); break;
        case 'joint': world.joint( o ); break;
        //case 'vehicle': world.addVehicle( o ); break;
        //case 'motion': world.setMotionVector( o ); break;
        

        //case 'terrain': world.updateTerrain( o ); break;
        //case 'control': world.takeControl( o ); break;

        case 'force': world.tmpForce.push( o ); break;
        case 'matrix': world.tmpMatrix.push( o ); break;

    }

}

function step(){

    if( !world ) return;

    world.updateMatrix();
    world.updateForce();

    world.step( world.stepSize );
    //world.stepVehicle();
    world.stepRigidBody( Ar, ArPos[0] );


	if( isBuffer ) self.postMessage({ m:'step', Ar:Ar },[ Ar.buffer ]);
    else self.postMessage( { m:'step', Ar:Ar } );

}

function init ( o ) {

    isBuffer = o.isBuffer || false;

    ArLng = o.settings[0];
    ArPos = o.settings[1];
    ArMax = o.settings[2];

    importScripts( o.blob );

    start();


}

function start(){

    world = new OIMO.World();

    world.set();
    
    self.postMessage( { m:'initEngine' } );

}

function reset ( o ) {

    // create self tranfere array if no buffer
    if( !isBuffer ) Ar = new Float32Array( ArMax );

    world.reset();
    
    self.postMessage({ m:'start' });

}


