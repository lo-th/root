var world = ( function () {
    
    'use strict';
   
    var center, sphere, material;
    var isMouseDown = false;
    var torad = 0.0174532925199432957;
    var or = {x:0, y:0};
    var dr = {x:0, y:0};
    var normal;

    world = {

        init: function () {

            var p = pool.getResult();    

            var norm = new THREE.Texture( p.earth_n );
            norm.needsUpdate = true;

            var metal = new THREE.Texture( p.earth_metal );
            metal.needsUpdate = true;

            var rough = new THREE.Texture( p.earth_rough );
            rough.needsUpdate = true;

            material = new THREE.MeshStandardMaterial({
                metalness:1,
                roughness:0.8,
                color:0xFFFFFF,
                envMap: scene.getEnv(),
                metalnessMap:metal,
                roughnessMap:rough,
                normalScale:new THREE.Vector2( 4, -4 ),
                normalMap:norm,
            })

            sphere = new THREE.Mesh( new THREE.SphereBufferGeometry( 1, 64, 48 ), material );

            center = new THREE.Group();
            center.position.y = -1;
            center.rotation.z = -21.4 * torad;
            center.add( sphere );

        },

        add: function () {

            scene.add( center );

            document.addEventListener( 'mouseup', world.up, false );
            document.addEventListener( 'mousedown', world.down, false );
            document.addEventListener( 'mousemove', world.move, false );

            scene.addUpdate( world.update );

        },

        clear: function () {

            scene.remove( center );
            document.removeEventListener( 'mouseup', world.up, false );
            document.removeEventListener( 'mousedown', world.down, false );
            document.removeEventListener( 'mousemove', world.move, false );

            scene.clearUpdate();

        },

        update: function () {

            sphere.rotation.y -= 0.005;

        },

        up:function ( e ) {

            isMouseDown = false;


        },

        down:function ( e ) {

            isMouseDown = true;
            or.x = e.clientX;
            or.y = e.clientY;

        },


        move:function ( e ) {

            if(!isMouseDown) return;

            sphere.rotation.y -= (( or.x - e.clientX )*0.01);
            //center.rotation.x -= (( or.y - e.clientY )*0.01);

            or.x = e.clientX;
            or.y = e.clientY;

        },

    }

    return world;

})();