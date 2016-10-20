var world = ( function () {
    
    'use strict';

   
    var center, sphere;
    var isMouseDown = false;
    var torad = 0.0174532925199432957;
    var or = {x:0, y:0};
    var dr = {x:0, y:0};
    var normal;

    world = {

        init: function () {

            pool.load(['assets/textures/env.png', 'assets/textures/earth_metal.png', 'assets/textures/earth_rough.png', 'assets/textures/earth_n.png'], world.add );

        },

        add: function ( p ) {

            var env = new THREE.Texture( p.env );
            env.mapping = THREE.SphericalReflectionMapping;
            env.needsUpdate = true;

            var norm = new THREE.Texture( p.earth_n );
            norm.needsUpdate = true;

            var metal = new THREE.Texture( p.earth_metal );
            metal.needsUpdate = true;

            var rough = new THREE.Texture( p.earth_rough );
            rough.needsUpdate = true;

            sphere = world.createSphere( 1, 64, env, metal, rough, norm );

            //scene.setCenter( sphere );

            center = new THREE.Group();
            center.position.y = -1;
            center.add( sphere );
            scene.add( center );

            center.rotation.z = -21.4 * torad;

            document.addEventListener( 'mouseup', world.up, false );
            document.addEventListener( 'mousedown', world.down, false );
            document.addEventListener( 'mousemove', world.move, false );

            scene.addUpdate( world.update );

            menu.init( env );

        },

        createSphere : function ( radius, segments, env, metal, rough, norm ) {
            return new THREE.Mesh(
                new THREE.SphereGeometry(radius, segments, segments),
                //new THREE.MeshPhongMaterial({
                new THREE.MeshStandardMaterial({
                    color:0xFFFFFF,
                    envMap:env,
                    metalnessMap:metal,
                    roughnessMap:rough,
                    metalness:1,
                    roughness:0.8,

                    normalScale:new THREE.Vector2( 4, -4 ),
                    normalMap:norm,

                })
            );
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