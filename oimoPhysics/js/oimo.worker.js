//var Module = { TOTAL_MEMORY: 256*1024*1024 };

var Ar, ArLng, ArPos, ArMax;
var key;
var timeStep = 1/60;
var isBuffer = false;
var world = null;
var test; 

// forces
var tmpForce = [];//null;

// kinematic
var tmpMatrix = [];
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

        case 'add': world.add( o ); break;
        case 'joint': world.addJoint( o ); break;
        //case 'vehicle': world.addVehicle( o ); break;
        //case 'motion': world.setMotionVector( o ); break;
        case 'force': world.addForce( o ); break;
        case 'forces': world.addForces( o ); break;
        case 'torque': world.addTorque( o ); break;
        case 'set': world.set( o ); break; //if(o.stepSize) self.postMessage( { m:'timerate', stepSize:o.stepSize } );

        //case 'terrain': world.updateTerrain( o ); break;
        //case 'control': world.takeControl( o ); break;

        case 'forces': tmpForce.push( o ); break;
        case 'matrix': tmpMatrix.push( o ); break;

    }

}

function step(){

    if( !world ) return;

    updateMatrix();
    updateForce();

    world.step( world.stepSize );
    //world.stepVehicle();
    world.stepRigidBody( Ar, ArPos[0] );


	if( isBuffer ) self.postMessage({ m:'step', Ar:Ar },[ Ar.buffer ]);
    else self.postMessage( { m:'step', Ar:Ar } );

}

function init ( o ) {

    isBuffer = o.isBuffer || false;

    //timeStep = o.timeStep !== undefined ? o.timeStep : timeStep;

    ArLng = o.settings[0];
    ArPos = o.settings[1];
    ArMax = o.settings[2];

    importScripts( o.blob );

    start();


}

function start(){

    world = new OIMO.World();
    world.set();
    world.bodys = [];
    world.byName = {};

    tmpPos = new OIMO.Vec3();
    tmpZero = new OIMO.Vec3();
    tmpMat = new OIMO.Mat3();
    tmpQuat = new OIMO.Quat();

    self.postMessage( { m:'initEngine' } );

}

function reset ( o ) {

    // create self tranfere array if no buffer
    if( !isBuffer ) Ar = new Float32Array( ArMax );

    world.reset();
    world.byName = {};

    tmpForce = [];
    tmpMatrix = [];

    self.postMessage({ m:'start' });

}


//--------------------------------------------------
//
//  KINEMATICS MATRIX SET
//
//--------------------------------------------------

function updateMatrix () {

    while( tmpMatrix.length > 0 ) applyMatrix( tmpMatrix.pop() );

}

function applyMatrix ( r ) {

    var b = world.byName[ r[0] ];

    if( b === undefined ) return;

    var isKinematic = b._type === OIMO.RigidBodyType._KINEMATIC;
    var rad = OIMO.MathUtil.TO_RADIANS;

    if( r[1] !== undefined ) { 
        tmpPos.fromArray( r[1] ); 
        b.setPosition( tmpPos ); 
        if(!isKinematic) b.setLinearVelocity( tmpZero ); 
    }
   
    if( r[2] !== undefined ) {
        if(r[2].length === 3 ) tmpQuat.setFromEuler( { x:r[2][0] * rad, y:r[2][1] * rad, z:r[2][2] * rad } );
        else tmpQuat.fromArray( r[2] ); 
        b.setRotation( tmpMat.fromQuat( tmpQuat ) ); 
        if(!isKinematic) b.setAngularVelocity( tmpZero );
    }

}

//--------------------------------------------------
//
//  FORCE APPLY
//
//--------------------------------------------------

function updateForce () {

}