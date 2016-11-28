/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2017
*    @author lo-th / https://github.com/lo-th
*    @author Engine Kripken / https://github.com/kripken/ammo.js/
*
*    AMMO worker
*
*    By default, Bullet assumes units to be in meters and time in seconds. 
*    Moving objects are assumed to be in the range of 0.05 units, about the size of a pebble, 
*    to 10, the size of a truck. 
*    The simulation steps in fraction of seconds (1/60 sec or 60 hertz), 
*    and gravity in meters per square second (9.8 m/s^2).
*
*/

'use strict';

//var Module = { TOTAL_MEMORY: 16*1024*1024 };

var useTransferrable = false;
var timer, step, timestep, substep;
var iteration = 3;
var ar = null;

self.onmessage = function ( e ) {

    var data = e.data;

    switch( data.message ){

        case 'init': ammo.init( data ); break;
        case 'add': ammo.add( data ); break;
        case 'start':
            useTransferrable = data.useTransferrable;
            ar = data.ar;
            if( useTransferrable ) timer = setTimeout( ammo.update, step );
            else timer = setInterval( ammo.update, step ); 
        break;
        case 'run': 
            ar = data.ar;
            timer = setTimeout( ammo.update, step ); 
        break;
        
    }

}

this.post = function ( o ) {

    self.postMessage( o );

}



// ammo 

const torad = 0.0174532925199432957;
const todeg = 57.295779513082320876;

var world = null;
var solver, solverSoft, collision, dispatcher, broadphase, worldInfo;

// temp
var v0, v1, v2, v3, q0, q1, q2, q3, t0, t1, t2, gravity;

var bodys = [];
var solids = [];

var ammo = {

    init: function ( o ) {

        if( world !== null ) return;

        importScripts( o.blob );

        this.setTime( o.fps || 60 );

        Ammo.btVector3.prototype.fromArray = function( array, offset ){

            if ( offset === undefined ) offset = 0;

            this.setValue( array[ offset ], array[ offset + 1 ], array[ offset + 2 ] );

        };

        Ammo.btVector3.prototype.toArray = function( array, offset ){

            if ( array === undefined ) array = [];
            if ( offset === undefined ) offset = 0;

            array[ offset ] = this.x();
            array[ offset + 1 ] = this.y();
            array[ offset + 2 ] = this.z();

            return array;

        }

        Ammo.btQuaternion.prototype.fromArray = function( array, offset ){

            if ( offset === undefined ) offset = 0;
            this.setValue( array[ offset ], array[ offset + 1 ], array[ offset + 2 ], array[ offset + 3 ] );

        };

        Ammo.btQuaternion.prototype.toArray = function( array, offset ){

            if ( array === undefined ) array = [];
            if ( offset === undefined ) offset = 0;

            array[ offset ] = this.x();
            array[ offset + 1 ] = this.y();
            array[ offset + 2 ] = this.z();
            array[ offset + 3 ] = this.w();

            return array;

        };

        // temp Vector
        v0 = new Ammo.btVector3();
        v1 = new Ammo.btVector3();
        v2 = new Ammo.btVector3();
        v3 = new Ammo.btVector3();
        gravity = new Ammo.btVector3();

        // temp Quaternion
        q0 = new Ammo.btQuaternion();
        q1 = new Ammo.btQuaternion();
        q2 = new Ammo.btQuaternion();
        q3 = new Ammo.btQuaternion();

        // temp Transform
        t0 = new Ammo.btTransform();
        t1 = new Ammo.btTransform();
        t2 = new Ammo.btTransform();

        // init world

        var isSoft = o.soft === undefined ? false : o.soft;

        solver = new Ammo.btSequentialImpulseConstraintSolver();
        solverSoft = isSoft ? new Ammo.btDefaultSoftBodySolver() : null;
        collision = isSoft ? new Ammo.btSoftBodyRigidBodyCollisionConfiguration() : new Ammo.btDefaultCollisionConfiguration();
        dispatcher = new Ammo.btCollisionDispatcher( collision );
     
        switch( o.broadphase === undefined ? 2 : o.broadphase ){

            //case 0: broadphase = new Ammo.btSimpleBroadphase(); break;
            case 1: var s = 1000; broadphase = new Ammo.btAxisSweep3( new Ammo.btVector3(-s,-s,-s), new Ammo.btVector3(s,s,s), 4096 ); break;//16384; 
            case 2: broadphase = new Ammo.btDbvtBroadphase(); break;
            
        }

        world = isSoft ? new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collision, solverSoft ) : new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collision );
        
        // gravity
        gravity.setValue( 0, -9.8, 0 );

        if( isSoft ){
            worldInfo = world.getWorldInfo();
            worldInfo.set_m_gravity( gravity );
        } else {
            world.setGravity( gravity );
        }

        post( { message:'init' } ); 

    },

    update: function () {

        world.stepSimulation( timestep, iteration );

        stepRigidBody();
        //stepCharacter();
        //stepVehicle();
        //stepSoftBody();

        if( useTransferrable ) post( { message:'run', ar:ar }, [ ar.buffer ] );
        else post( { message:'run', ar:ar } );


    },

    setTime: function ( t ){

        step = 1000 / t;
        timestep = step * 0.001;
        substep = 10;

    },

    add: function ( o ) {

        var body = new ammo.Body( o );

    },


}


// UPDATE

function stepRigidBody() {

    bodys.forEach( function ( b, id ) {

        var n = id * 8;
        ar[n] = b.isActive() ? 1 : 0;//b.getLinearVelocity().length() * 9.8;//b.isActive() ? 1 : 0;

        if ( ar[n] ) {

            b.getMotionState().getWorldTransform( t0 );
            t0.getOrigin().toArray( ar, n + 1 );
            t0.getRotation().toArray( ar, n + 4 );

        }

    });

};



// body

ammo.Body = function ( o, extra ) {

    o.mass = o.mass == undefined ? 0 : o.mass;
    o.size = o.size == undefined ? [1,1,1] : o.size;
    o.pos = o.pos == undefined ? [0,0,0] : o.pos;
    o.quat = o.quat == undefined ? [0,0,0,1] : o.quat;

    var shape = null;
    switch( o.type ){

        case 'plane': 
            v1.fromArray( o.dir || [0,1,0] ); 
            shape = new Ammo.btStaticPlaneShape( v1, 0 );
        break;

        case 'box': 
            v1.setValue( o.size[0]*0.5, o.size[1]*0.5, o.size[2]*0.5 );  
            shape = new Ammo.btBoxShape( v1 );
        break;

        case 'sphere': 
            shape = new Ammo.btSphereShape( o.size[0] ); 
        break;  

        case 'cylinder': 
            v1.setValue( o.size[0], o.size[1]*0.5, o.size[2]*0.5 );
            shape = new Ammo.btCylinderShape( v1 );
        break;

        case 'cone': 
            shape = new Ammo.btConeShape( o.size[0], o.size[1]*0.5 );
        break;

        case 'capsule': 
            shape = new Ammo.btCapsuleShape( o.size[0], o.size[1]*0.5 ); 
        break;
        
        case 'compound': 
            shape = new Ammo.btCompoundShape(); 
        break;

        case 'mesh':
            var mTriMesh = new Ammo.btTriangleMesh();
            var removeDuplicateVertices = true;
            var vx = o.v;
            for (var i = 0, fMax = vx.length; i < fMax; i+=9){
                v1.setValue( vx[i+0]*o.size[0], vx[i+1]*o.size[1], vx[i+2]*o.size[2] );
                v2.setValue( vx[i+3]*o.size[0], vx[i+4]*o.size[1], vx[i+5]*o.size[2] );
                v3.setValue( vx[i+6]*o.size[0], vx[i+7]*o.size[1], vx[i+8]*o.size[2] );
                mTriMesh.addTriangle( v1, v2, v3, removeDuplicateVertices );
            }
            if(o.mass == 0){ 
                // btScaledBvhTriangleMeshShape -- if scaled instances
                shape = new Ammo.btBvhTriangleMeshShape( mTriMesh, true, true );
            }else{ 
                // btGimpactTriangleMeshShape -- complex?
                // btConvexHullShape -- possibly better?
                shape = new Ammo.btConvexTriangleMeshShape( mTriMesh, true );
            }
        break;

        case 'convex':
            shape = new Ammo.btConvexHullShape();
            var vx = o.v;
            for (var i = 0, fMax = vx.length; i < fMax; i+=3){
                vx[i] *= o.size[0];
                vx[i+1] *= o.size[1];
                vx[i+2] *= o.size[2];

                v1.fromArray( vx , i );
                shape.addPoint( v1 );
            };
        break;
    }

    if(o.margin !== undefined && shape.setMargin !== undefined ) shape.setMargin( o.margin );

    if( extra == 'isShape' ) return shape;
    
    if( extra == 'isGhost' ){ 
        var ghost = new Ammo.btGhostObject();
        ghost.setCollisionShape( shape );
        return ghost;
    }

    v1.fromArray( o.pos );
    q1.fromArray( o.quat );

    t1.setIdentity();
    t1.setOrigin( v1 );
    t1.setRotation( q1 );

    v2.setValue( 0,0,0 );
    shape.calculateLocalInertia( o.mass, v2 );
    var motionState = new Ammo.btDefaultMotionState( t1 );

    var rbInfo = new Ammo.btRigidBodyConstructionInfo( o.mass, motionState, shape, v2 );
    rbInfo.set_m_friction( o.friction === undefined ? 0.5 : o.friction );
    rbInfo.set_m_restitution( o.restitution === undefined ? 0 : o.restitution );
    rbInfo.set_m_linearDamping( o.linearDamping === undefined ? 0 : o.linearDamping );
    rbInfo.set_m_angularDamping( o.angularDamping === undefined ? 0 : o.angularDamping );

    var body = new Ammo.btRigidBody( rbInfo );

    if ( o.mass !== 0 ){
        body.setCollisionFlags(o.flag || 0);
        world.addRigidBody( body, o.group || 1, o.mask || -1 );

        body.activate();
        /*
        AMMO.ACTIVE = 1;
        AMMO.ISLAND_SLEEPING = 2;
        AMMO.WANTS_DEACTIVATION = 3;
        AMMO.DISABLE_DEACTIVATION = 4;
        AMMO.DISABLE_SIMULATION = 5;
        */
        body.setActivationState( o.state || 1 );
    } else {
        body.setCollisionFlags( o.flag || 1 ); 
        world.addCollisionObject( body, o.group || 1, o.mask || -1 );
    }

    //if( o.name !== undefined ) this.name = o.name;
    
    //if( o.name ) byName[o.name] = body;


    if ( o.mass !== 0 ) bodys.push( body ); 
    else solids.push( body );

    Ammo.destroy( rbInfo );

    //console.log('add')

}