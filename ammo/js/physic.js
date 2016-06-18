

var physic = ( function () {

    'use strict';

    var world, solver, solverSoft, collision, dispatcher, broadphase, worldInfo;

    var trans, quat, pos, tmpPos, tmpQuat, tmpTrans;

    var tquat, tpos;

    var bodys = [];
    var solids = [];
    var bones = [];

    var skeletonBody;

    var ball_ptr = [];
    var bone_ptr = [];
    var collisions = [];
    var collisionCount = {};


    var substep = 10;
    var timestep = 1/60;

    var worldScale = 10; 

    var ground_data;

    physic = function () {};

    physic.update = function ( delta ) {


        requestAnimationFrame( physic.update );

        physic.updateGround();

        //physic.contact();

        //world.stepSimulation( delta, substep, timestep );
        world.stepSimulation( timestep, substep );

        

       // if(skeletonBody) skeletonBody.update();

        var meshs = view.getMeshBody(), mesh, s = worldScale;

        //console.log( meshs.length )

        bodys.forEach( function ( b, id ) {

            b.getMotionState().getWorldTransform( trans );
            pos = trans.getOrigin();
            quat = trans.getRotation();

            mesh = meshs[id];

            tpos.set( pos.x() * s, pos.y() * s, pos.z() * s );
            tquat.set( quat.x(), quat.y(), quat.z(), quat.w() );
            mesh.matrix.compose( tpos, tquat, mesh.scale );
            

            //mesh.position.set( pos.x() * s, pos.y() * s, pos.z() * s );
            //mesh.quaternion.set( quat.x(), quat.y(), quat.z(), quat.w() );

        });

        /*bones.forEach( function ( b, id ) {

            if( collisions.indexOf(b.ptr) > -1 ) collisionCount[b.name] += 1;

        });

        debug( JSON.stringify(collisionCount).replace(/,/g, '<br>').replace('{', '').replace('}', '') );*/

    };

    physic.contact = function () {

        var i, c, a, b, n;

        collisions = [];

        i = dispatcher.getNumManifolds();
        while(i--){

            c = dispatcher.getManifoldByIndexInternal(i);
            a = c.getBody0().ptr;
            b = c.getBody1().ptr;
            n = c.getNumContacts();

            if( n > 0 ){
                if( ball_ptr.indexOf(a) > -1 && bone_ptr.indexOf(b) > -1 ) collisions.push( b );
                else if( ball_ptr.indexOf(b) > -1 && bone_ptr.indexOf(a) > -1 ) collisions.push( a );
            }

        }

    };

    physic.init = function () {

        // three tmp

        tquat = new THREE.Quaternion();
        tpos = new THREE.Vector3();

        // active transform

        trans = new Ammo.btTransform();
        quat = new Ammo.btQuaternion();
        pos = new Ammo.btVector3();

        // tmp Transform

        tmpTrans = new Ammo.btTransform();
        tmpQuat = new Ammo.btQuaternion();
        tmpPos = new Ammo.btVector3();

        // init world solver

        solver = new Ammo.btSequentialImpulseConstraintSolver();
        solverSoft = new Ammo.btDefaultSoftBodySolver();
        //collision = new Ammo.btDefaultCollisionConfiguration();
        collision = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
        dispatcher = new Ammo.btCollisionDispatcher( collision );
        broadphase = new Ammo.btDbvtBroadphase();

        //world = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collision );
        world = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collision, solverSoft );

        tmpPos.setValue( 0, -9.8, 0 );
        world.setGravity( tmpPos );

        worldInfo = world.getWorldInfo();

        worldInfo.set_m_gravity( tmpPos );
        worldInfo.set_air_density( 1.2 );
        //worldInfo.set_water_density( 0 );
        //worldInfo.set_water_offset( 0 );
        //worldInfo.set_water_normal( vec3() );

        this.room();
        this.addGround();


        physic.update();

        document.addEventListener( 'dblclick', physic.addBall , false );



        

    };

    physic.room = function ( v ) {

        var w = 110;
        var p = 110;
        var h = 40;
        
        var m = 10;
        var mi = m * 0.5;
        var y = 0;

        var res = 1.0;
        var fri = 0.3;

        this.add({ type:'box', size:[w+m, m, p+m], pos:[0,-(m*0.5) + y,0], friction:fri, restitution:res, direct:true });
        this.add({ type:'box', size:[w+m, m, p+m], pos:[0,h+(m*0.5) + y,0], friction:fri, restitution:res, direct:true });

        this.add({ type:'box', size:[m, h, p+m], pos:[-w*0.5,(h*0.5)+y,0], friction:fri, restitution:res, direct:true });
        this.add({ type:'box', size:[m, h, p+m], pos:[w*0.5,(h*0.5)+y,0], friction:fri, restitution:res, direct:true });
        this.add({ type:'box', size:[w-m, h, m], pos:[0,(h*0.5)+y,-p*0.5], friction:fri, restitution:res, direct:true });
        this.add({ type:'box', size:[w-m, h, m], pos:[0,(h*0.5)+y, p*0.5], friction:fri, restitution:res, direct:true });

        var finalBox = new THREE.Mesh(new THREE.BoxBufferGeometry( w-m, h, p-m ));
        finalBox.position.y = (h*0.5)+y;
        var zone = new THREE.BoxHelper(finalBox);
        view.add(zone);

        zone.receiveShadow = false;
        zone.castShadow = false;

    };

    physic.addGround = function  ( o ) {

        // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
        var upAxis = 1;

        var s = 1 / worldScale

        o = o || {};
        o.size = o.size == undefined ? [100*s, 40*s, 100*s] : o.size;
        o.div = o.div == undefined ? [64,64] : o.div;
        o.pos = o.pos == undefined ? [0,0,0] : o.pos;
        o.quat = o.quat == undefined ? [0,0,0,1] : o.quat;
        o.mass = o.mass == undefined ? 0 : o.mass;

        // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
        var hdt = o.hdt || "PHY_FLOAT";

        // Set this to your needs (inverts the triangles)
        var flipEdge =  o.flipEdge !== undefined ? o.flipEdge : true;



        this.updateGround();

        var shape = new Ammo.btHeightfieldTerrainShape( o.div[0], o.div[1], ground_data, o.heightScale || 1, -o.size[1], o.size[1], upAxis, hdt, flipEdge ); 

        tmpPos.setValue( o.size[0]/o.div[0], 1, o.size[2]/o.div[1] );
        shape.setLocalScaling( tmpPos );

        if( o.margin !== undefined && shape.setMargin !== undefined ) shape.setMargin( o.margin );

        tmpPos.setValue(o.pos[0], o.pos[1], o.pos[2]);//.fromArray(o.pos);
        tmpQuat.setValue(o.quat[0], o.quat[1], o.quat[2], o.quat[3]);//.fromArray(o.quat);

        tmpTrans.setIdentity();
        tmpTrans.setOrigin( tmpPos );
        tmpTrans.setRotation( tmpQuat );

        tmpPos.setValue( 0,0,0 );
        var motionState = new Ammo.btDefaultMotionState( tmpTrans );

        var rbInfo = new Ammo.btRigidBodyConstructionInfo( o.mass, motionState, shape, tmpPos );
        o.friction = o.friction == undefined ? 0.5 : o.friction;
        o.restitution = o.restitution == undefined ? 0 : o.restitution;
        rbInfo.set_m_friction( o.friction || 0.5 );
        rbInfo.set_m_restitution( o.restitution || 0 );

        var body = new Ammo.btRigidBody( rbInfo );
        body.setCollisionFlags(o.flag || 1);
        world.addCollisionObject( body, o.group || 1, o.mask || -1 );

        //solids.push( body );

        Ammo.destroy( rbInfo );

        o = null;

    };

    physic.updateGround = function (){

        var s = 1 / worldScale

        var data = ground.getData();

        var i = data.length, n;
        // Creates height data buffer in Ammo heap
        if( !ground_data ) ground_data = Ammo._malloc( 4 * i );
        // Copy the javascript height data array to the Ammo one.
        
        while(i--){
            n = i * 4;
            Ammo.HEAPF32[ ground_data + n >> 2 ] = data[i]*s;
        }

    };

    physic.addBall = function ( v ) {

        view.addMesh({ 
            type:'sphere', 
            size:[1], 
            name:'sphere',  
            //pos:[view.randRange(-180, 180), view.randRange(100, 380), view.randRange(-180, 180)],
            pos:[0, 20, 0],
            //rot:[view.randRange(0, 360), view.randRange(0, 360), view.randRange(0, 360)],
            mass:0.45,
            state:4,
            friction:0.3,
            restitution:0.8 
        });

    };

    physic.add = function ( o ) {

        var s = 1 / worldScale;

        o.mass = o.mass == undefined ? 0 : o.mass;
        o.size = o.size == undefined ? [1,1,1] : o.size;
        o.pos = o.pos == undefined ? [0,0,0] : o.pos;
        o.quat = o.quat == undefined ? [0,0,0,1] : o.quat;
        o.dir = o.dir == undefined ? [0,1,0] : o.dir;

        var shape = null;

        switch( o.type ){

            case 'plane': 
                tmpPos.setValue( o.dir[0], o.dir[1], o.dir[2] ); 
                shape = new Ammo.btStaticPlaneShape( tmpPos, 0 );
            break;

            case 'box': 
                tmpPos.setValue( o.size[0] * 0.5 * s, o.size[1] * 0.5 * s, o.size[2] * 0.5 * s );  
                shape = new Ammo.btBoxShape( tmpPos );
            break;

            case 'sphere':  
                shape = new Ammo.btSphereShape( o.size[0] * s ); 
            break;

            case 'cylinder': 
                tmpPos.setValue( o.size[0] * s, o.size[1] * 0.5 * s, o.size[2] * 0.5 * s );
                shape = new Ammo.btCylinderShape( tmpPos );
            break;

        };

        if(o.margin !== undefined && shape.setMargin !== undefined ) shape.setMargin( o.margin );// 0.04

        tmpPos.setValue( o.pos[0] * s, o.pos[1] * s, o.pos[2] * s );
        tmpQuat.setValue( o.quat[0], o.quat[1], o.quat[2], o.quat[3] );

        tmpTrans.setIdentity();
        tmpTrans.setOrigin( tmpPos );
        tmpTrans.setRotation( tmpQuat );

        tmpPos.setValue( 0,0,0 );

        if ( o.mass !== 0 ) shape.calculateLocalInertia( o.mass, tmpPos );

        var motionState = new Ammo.btDefaultMotionState( tmpTrans );

        var rbInfo = new Ammo.btRigidBodyConstructionInfo( o.mass, motionState, shape, tmpPos );
        o.friction = o.friction == undefined ? 0.5 : o.friction;
        o.restitution = o.restitution == undefined ? 0 : o.restitution;
        rbInfo.set_m_friction( o.friction || 0.5 );
        rbInfo.set_m_restitution( o.restitution || 0 );
        var body = new Ammo.btRigidBody( rbInfo );

        if ( o.mass !== 0 ){

            body.setCollisionFlags( o.flag || 0 );
            world.addRigidBody( body, o.group || 1, o.mask || -1 );

            body.activate();
            
            // ACTIVE = 1; ISLAND_SLEEPING = 2; WANTS_DEACTIVATION = 3; DISABLE_DEACTIVATION = 4; DISABLE_SIMULATION = 5;    
            body.setActivationState( o.state || 1 );

            body.name = o.name;

            //if(o.name === 'ball' ){ 
                bodys.push( body );
               // ball_ptr.push( body.ptr );
            //} else {
            //    bones.push( body );
            //    bone_ptr.push( body.ptr );
            //}

        } else {

            body.setCollisionFlags( o.flag || 1 ); 
            var c = world.addCollisionObject( body, o.group || 1, o.mask || -1 );

            solids.push( body );

        }

        Ammo.destroy( rbInfo );

    };


    return physic;

})();