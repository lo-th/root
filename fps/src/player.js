

var player = ( function () {
    
    'use strict';

    var degtorad = 0.0174532925199432957;
    var radtodeg = 57.295779513082320876;

    var mesh, skin;
    var velocity, rotation, newRotation, ease, easeRot, level, origin;


    var maxSpeed = 0.25
    var speed = 0.025;
    var maxJump = 4;
    var maxHeight = 4;
    var g = 9.8;
    var py = 0;

    var timeScale = 1;

    var isMove = false;
    var isJump = false;
    var isFall = false;
    var onGround = true;

    var raycast;

    var oldRot = -100;

    var weights = {};
    var anim_num = 0;

    var mixer;

    var count = 0;




  

    player = {

        init: function ( model, y ) {

            raycast = new THREE.Raycaster();
            raycast.ray.direction.set( 0, -1, 0 );



            mesh = new THREE.Group();
            velocity = new THREE.Vector3();
            rotation = new THREE.Vector3();
            newRotation = new THREE.Vector3();
            origin = new THREE.Vector3();
            level = new THREE.Vector3();
            ease = new THREE.Vector3();
            easeRot = new THREE.Vector3();

            var box = new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.5, 0.5, 2, 8, 1 ), new THREE.MeshBasicMaterial({color:0x000000, wireframe:true}) );
            box.geometry.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI * 0.125 ) )
            box.position.y = 1;


            skin = model;
            var s = 0.023;
            skin.scale.set(s,s,s);
            skin.position.set(0,0.9,0)//.y = 0.9;
            skin.rotation.y = Math.PI;
            skin.material = new THREE.MeshLambertMaterial({ color:0xDDDD00, skinning:true })

            anim_num = skin.animations.length;

            var i = anim_num, name;
            while(i--){
                name = skin.animations[i].name;
                weights[name] = 0;
                if( name === 'idle') weights[name] = 1;
                //skin.play( name, 0, 0, weights[name] );
            }

            mixer = skin.mixer;

            //skin.play("walk");


            //console.log( skin )

            //console.log( mixer.clipAction( skin.animations[0] ) )


            mesh.add( skin );
            mesh.add( box );

            view.add( mesh );

            view.addUpdate( player.move );

        },

        weight: function (w) {
            var i = anim_num, name;
            while(i--){
                name = skin.animations[i].name;

                //mixer.clipAction( skin.animations[i] ).setEffectiveWeight( w[name] );
                //mixer.clipAction( skin.animations[i] ).play();
                skin.play( name, 0, undefined, w[name] );
                //skin.animations[i].setEffectiveWeight ( weights[name] );
                if( name==='walk' ){
                    skin.animations[i].timeScale = timeScale;
                }
            }
        },

        easing: function( newWeights ){

            weights = newWeights;
            player.weight(newWeights);

        },

        walkFront:function(){

            timeScale=1;
            player.easing({idle:0, walk:1, step_left:0, step_right:0, run:0, crouch_idle:0, crouch_walk:0 });
            isMove = true;
        },
        walkBack:function(){

            timeScale=-1;
            player.easing({idle:0, walk:1, step_left:0, step_right:0, run:0, crouch_idle:0, crouch_walk:0});  
            isMove = true;

        },
        stepLeft:function(){
                
            player.easing({idle:0, walk:0, step_left:1, step_right:0, run:0, crouch_idle:0, crouch_walk:0});
            isMove = true;

        },
        stepRight:function(){

            player.easing({idle:0, walk:0, step_left:0, step_right:1, run:0, crouch_idle:0, crouch_walk:0});
            isMove = true;

        },
        stopWalk:function(){

            if(weights['walk']!==0 || weights['step_right']!==0 || weights['step_left']!==0){ 
                player.easing({idle:0, walk:1, step_left:0, step_right:0, run:0, crouch_idle:0, crouch_walk:0});       
            }
            
            isMove = false;
        },

        raytest: function () {

            var ground = view.getGround();

            raycast.ray.origin.copy( origin );
            raycast.ray.origin.y += 2;
            var hits = raycast.intersectObject( ground, true );

            if( ( hits.length > 0 ) && ( hits[0].face.normal.y > 0 ) ){

                var h = hits[0].distance;
                if(h<100) origin.y += 2-h;
                else origin.y -= ( h - 2);
                //trace( h )

                level.y = origin.y;
            }

        },

        move : function () {

            count++;

            

            var delta = 0.017;

            THREE.SEA3D.AnimationHandler.update( delta );

            var key = user.getKey();

             // jumping
            //if( key[4] !== 0 && onGround ){ isJump = true; onGround = false; }

            //acceleration and speed limite
            if ( onGround ){ 
                ease.z += -key[0] * speed;
                ease.x += key[1] * speed;
            }

            ease.z = ease.z > maxSpeed ? maxSpeed : ease.z;
            ease.z = ease.z < -maxSpeed ? -maxSpeed : ease.z;

            ease.x = ease.x > maxSpeed ? maxSpeed : ease.x;
            ease.x = ease.x < -maxSpeed ? -maxSpeed : ease.x;

            //deceleration
            if (!key[0]) {
                if (ease.z > speed) ease.z -= speed;
                else if (ease.z < -speed) ease.z += speed;
                else ease.z = 0;
            }
            if (!key[1]) {
                if (ease.x > speed) ease.x -= speed;
                else if (ease.x < -speed) ease.x += speed;
                else ease.x = 0;
            }

            // ease
            var mx = 0;
            var mz = 0;

            //skin.timeScale = 1;

            if(ease.z!==0 || ease.x!==0){
                if(ease.x>0){
                    skin.play("walk", .25);
                    //skin.timeScale = -1;
                    skin.animations[1].timeScale = -1;
                    //player.walkFront(); mz = 1;
                }
                else if(ease.x<0){
                    skin.play("walk", .25);
                    skin.animations[1].timeScale = 1;
                    //player.walkBack(); mz = -1;
                }
                if(ease.z<0){
                    skin.play("step_left", .25);
                    
                    //player.stepLeft(mz);mx=-1
                }
                else if(ease.z>0){
                    skin.play("step_right", .25);
                    //player.stepRight(mz);mx=1;
                }
            } else {
                //player.stopWalk();
                skin.play("idle", .25);
            }


            // find direction of player
            easeRot.y = -view.getAzimut();

            mesh.rotation.y = -easeRot.y;
            //view.rotateTopCamera( -easeRot.y );
            map.rotateCamera( -easeRot.y );

            var ry = oldRot - easeRot.y;


            /*if( count===3 ){
                count = 0;
            } else { return }
*/
  
            if( ease.z === 0 && ease.x === 0 ) return;

            // find direction of player
            //easeRot.y = -view.getAzimut();
            easeRot.x = Math.sin( easeRot.y ) * ease.x + Math.cos( easeRot.y ) * ease.z;
            easeRot.z = Math.cos( easeRot.y ) * ease.x - Math.sin( easeRot.y ) * ease.z;

            oldRot = easeRot.y;

            level.x = origin.x - easeRot.x;
            level.z = origin.z + easeRot.z;


            if( level.y > 2 ) view.setLevel(1);
            else view.setLevel(0);



            view.testPosition( level );

            player.raytest();

            //if( level.y > 2 ) view.setLevel(1);
            //else view.setLevel(0);
            

            var b = map.getHit();

            // quadrant
            //   \ /
            //    X
            //   / \
            var q = Math.floor((( -easeRot.y * radtodeg ) + 225) / 90 ); 
            if( q === 4 ) q = 0;

            // diff
            var dx = origin.x - level.x;
            var dz = origin.z - level.z;

            var nohitx = 0;
            var nohitz = 0;

            //trace( nohitx + " | " + nohitz + ' || ' + dz +' | ' + dx + ' || ' + q ); 

            var m = 2; // max pixel
            switch( q ) {
                case 0: 
                if( dz < 0 && b.f > m ) nohitz = 1;
                if( dz > 0 && b.b > m ) nohitz = 1;
                if( dx < 0 && b.l > m ) nohitx = 1;
                if( dx > 0 && b.r > m ) nohitx = 1;
                break;
                case 1:
                if( dz < 0 && b.r > m ) nohitz = 1;
                if( dz > 0 && b.l > m ) nohitz = 1;
                if( dx < 0 && b.f > m ) nohitx = 1;
                if( dx > 0 && b.b > m ) nohitx = 1;
                break;
                case 2:
                if( dz < 0 && b.b > m ) nohitz = 1;
                if( dz > 0 && b.f > m ) nohitz = 1;
                if( dx < 0 && b.r > m ) nohitx = 1;
                if( dx > 0 && b.l > m ) nohitx = 1;
                break;d
                case 3:
                if( dz < 0 && b.l > m ) nohitz = 1;
                if( dz > 0 && b.r > m ) nohitz = 1;
                if( dx < 0 && b.b > m ) nohitx = 1;
                if( dx > 0 && b.f > m ) nohitx = 1;
                break;
            }

            if( !nohitx ) origin.x = level.x;
            if( !nohitz ) origin.z = level.z;

            /*level.y = map.getPY() + py;
            var diff = Math.abs( origin.y - level.y );

            if( level.y > 2 ) view.setLevel(1);
            else view.setLevel(0);

            if( origin.y>level.y){ // down
                if( diff < maxHeight ) origin.y = level.y;
                else{ isFall = true; onGround=false;} 
            } else {
                if( diff < maxHeight ) origin.y = level.y;
                //else {nohitz=0; nohitx=0}
            }*/

            //if( nohitx < 4 ) origin.x = level.x;
            //if( nohitz < 4 ) origin.z = level.z;


            // gravity
            /*if(isJump){
                ease.y += g * delta;
                if( ease.y > maxJump ){ isFall = true; isJump = false; }
            }
            if(isFall){
                ease.y -= g * delta;
                if( diff < maxHeight && ease.y < 0 ){  isFall = false; ease.y = 0; onGround = true; }
                //if(this.ease.y<0){ this.isFall = false; this.ease.y = 0; this.onGround=true; }
            }

            origin.y += ease.y;*/

            // update 2d map
            //map.updatePosition( origin, -easeRot.y );

            //mesh.position.lerp( origin, 0.5 );
            mesh.position.copy( origin );

            view.moveCamera( origin );

            //mesh.rotation.y = -easeRot.y;

            //if( mesh.position.y > 2 ) map.setLevel(1);
            //else map.setLevel(0);


        },

    }

    return player;

})();