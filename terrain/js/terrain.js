var terrain = ( function () {

    'use strict';

    var u = {
        size : 100,
        height : 20,
        resolution : 256,
        complexity : 1,
        type : 1,
    };

    var maxspeed = 1;
    var acc = 0.01;
    var dec = 0.01;

    var pos, ease;

    var material = null;
    var mesh = null;
    var compute = null;

    var uniforms_terrain = null;
    var uniforms_height = null;

    var heightmapVariable;
    var heightTexture = null;


    terrain = {

        getData : function () {
            return u;
        },

        init : function ( o ) {

            pos = new THREE.Vector3();
            ease = new THREE.Vector2();

            pool.load( ['glsl/terrain_la_vs.glsl', 'glsl/terrain_la_fs.glsl', 'glsl/noiseMap.glsl'], terrain.create );

        },

        create : function () {

            terrain.makeHeightTexture();

            

            var uniformPlus = {
                    size: { value: u.size },
                    height: { value: u.height },
                    resolution: { value: u.resolution },
                    heightmap: { value: null },
            };

            material = new THREE.ShaderMaterial( {
                uniforms: THREE.UniformsUtils.merge( [ THREE.ShaderLib[ 'lambert' ].uniforms, uniformPlus ] ),
                vertexShader: pool.get( 'terrain_la_vs' ),
                fragmentShader: pool.get( 'terrain_la_fs' ),
            });

            material.lights = true;

            uniforms_terrain = material.uniforms;

            uniforms_terrain.heightmap.value = heightTexture.texture;


            var geometry = new THREE.PlaneBufferGeometry( u.size, u.size, u.resolution - 1, u.resolution -1 );
            geometry.rotateX( -Math.PI / 2 );

            mesh = new THREE.Mesh( geometry, material );
            mesh.matrixAutoUpdate = false;
            //mesh.updateMatrix();
            view.add( mesh );

            view.addUpdate( terrain.easing );

        },

        makeHeightTexture : function(){

            compute = new GPUComputationRenderer( u.resolution, u.resolution, view.getRenderer() );
            heightmapVariable = compute.addVariable( "heightmap", pool.get( 'noiseMap' ), compute.createTexture() );
            compute.init();

            uniforms_height = heightmapVariable.material.uniforms;

            uniforms_height.pos = { value: 0 };;
            uniforms_height.size = { value: 0 };
            uniforms_height.resolution = { value: 0 };
            uniforms_height.type = { value: 0 };
            uniforms_height.complexity = { value: 0 };

            uniforms_height.pos.value = pos;
            uniforms_height.size.value = u.size;
            uniforms_height.resolution.value = u.resolution;
            uniforms_height.type.value = u.type;
            uniforms_height.complexity.value = 1 / ( u.complexity * 100 );

            compute.compute();
            heightTexture = compute.getCurrentRenderTarget( heightmapVariable );

        },

        update: function () {

            uniforms_height.pos.value = pos;

            uniforms_height.type.value = u.type;
            uniforms_height.size.value = u.size;
            uniforms_height.resolution.value = u.resolution;
            uniforms_height.complexity.value = 1 / ( u.complexity * 100 );

            uniforms_terrain.size.value = u.size;
            uniforms_terrain.resolution.value = u.resolution;
            uniforms_terrain.height.value = u.height;

            compute.compute();

        },

        getHeight: function ( x, y ) {

            if(!heightTexture) return 0;

            var r = view.getPixel( heightTexture, x || u.resolution*0.5, y || u.resolution*0.5 );
            return r[ 0 ] * u.height;

        },

        easing: function () {

            var key = user.getKey();
            var r = -view.getControls().getAzimuthalAngle();

            if(key[7]) maxspeed = 1.5;
            else maxspeed = 0.25;

            //acceleration
            ease.y += key[1] * acc; // up down
            ease.x += key[0] * acc; // left right
            //speed limite
            ease.x = ease.x > maxspeed ? maxspeed : ease.x;
            ease.x = ease.x < -maxspeed ? -maxspeed : ease.x;
            ease.y = ease.y > maxspeed ? maxspeed : ease.y;
            ease.y = ease.y < -maxspeed ? -maxspeed : ease.y;
            //break
            if (!key[1]) {
                if (ease.y > dec) ease.y -= dec;
                else if (ease.y < -dec) ease.y += dec;
                else ease.y = 0;
            }
            if (!key[0]) {
                if (ease.x > dec) ease.x -= dec;
                else if (ease.x < -dec) ease.x += dec;
                else ease.x = 0;
            }

            //debug(Math.floor(r*57.295779513082320876) + '__x:' + pos.x + '__z:'+pos.z)

            if ( !ease.x && !ease.y ) return;

            pos.z += Math.sin(r) * ease.x + Math.cos(r) * ease.y;
            pos.x += Math.cos(r) * ease.x - Math.sin(r) * ease.y;

            terrain.update();

        },



    }

    return terrain;

})();