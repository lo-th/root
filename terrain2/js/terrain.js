var terrain = ( function () {

    'use strict';

    var u = {
        size : 100,
        height : 10,
        resolution : 256,
        complexity : 2,
        type : 1,
        fog: 1,
        fogStart : 0.5,
        repeat : 20,
        blur:1,
    };

    var maxspeed = 1;
    var acc = 0.01;
    var dec = 0.01;

    var pos, ease;

    var material = null;
    var mesh = null;
    var geometry = null;
    var compute = null;

    var uniforms_terrain = null;
    var uniforms_height = null;

    var heightmapVariable, smoothShader;
    var heightTexture = null;

    var needsUpdate = false;
    var currentResolution = u.resolution;


    terrain = {

        getData : function () {
            return u;
        },

        init : function ( w ) {

            u.resolution = w || 256;

            pos = new THREE.Vector3();
            ease = new THREE.Vector2();

            //pool.load( ['textures/terrain/level4mm.jpg', 'textures/terrain/normal.jpg', 'glsl/terrain_la_vs.glsl', 'glsl/terrain_la_fs.glsl', 'glsl/noiseMap.glsl'], terrain.create );
            pool.load( [
                'textures/terrain/grass.jpg', 'textures/terrain/rock.jpg',
                'textures/terrain/sand.jpg', 'textures/terrain/snow.jpg',
                'glsl/terrain_ph_vs.glsl', 'glsl/terrain_ph_fs.glsl', 'glsl/noiseMap.glsl', 'glsl/smoothMap.glsl'
            ], terrain.create );

        },

        create : function () {

            terrain.makeHeightTexture();

            var tx = {};
            var tname = ['grass', 'rock', 'sand', 'snow'];
            var i = tname.length, n;
            while(i--){
                n = tname[i];
                tx[n] =  new THREE.Texture( pool.get( n ) );
                tx[n].wrapS = tx[n].wrapT = THREE.RepeatWrapping;
                tx[n].needsUpdate = true;

            }

            var uniformPlus = {
                    size: { value: u.size },
                    height: { value: u.height },
                    resolution: { value: u.resolution },
                    heightmap: { value: null },
                    enableFog: { value: null },
                    fogColor: { value: null },
                    fogStart: { value: null },
                    blur: { value: null },
                    
                    repeat: { value: null },
                    ratioUV: { value: null },
                    pos: { value: null },

                    snow: { value: null },
                    rock: { value: null },
                    grass: { value: null },
                    sand: { value: null },
            };

            /*material = new THREE.ShaderMaterial( {
                uniforms: THREE.UniformsUtils.merge( [ THREE.ShaderLib[ 'lambert' ].uniforms, uniformPlus ] ),
                vertexShader: pool.get( 'terrain_la_vs' ),
                fragmentShader: pool.get( 'terrain_la_fs' ),
                //wireframe : true,
            });*/

            material = new THREE.ShaderMaterial( {
                uniforms: THREE.UniformsUtils.merge( [ THREE.ShaderLib[ 'standard' ].uniforms, uniformPlus ] ),
                vertexShader: pool.get( 'terrain_ph_vs' ),
                fragmentShader: pool.get( 'terrain_ph_fs' ),

                //shading:THREE.SmoothShading,
                //wireframe : true,
            });

            material.lights = true;
            //material.map = tx;
            //material.normalMap = tx2;

            uniforms_terrain = material.uniforms;

            //uniforms_terrain.map.value = material.map;
            //uniforms_terrain.normalMap.value = material.normalMap

            //uniforms_terrain.repeat.value = u.repeat;
            uniforms_terrain.ratioUV.value = 1.0 / (u.size/u.repeat);
            uniforms_terrain.pos.value = pos;
            //uniforms_terrain.blur.value = u.blur;

            uniforms_terrain.snow.value = tx.snow;
            uniforms_terrain.rock.value = tx.rock;
            uniforms_terrain.grass.value = tx.grass;
            uniforms_terrain.sand.value = tx.sand;


            //uniforms_terrain.offsetRepeat.value = new THREE.Vector4(u.repeat,u.repeat,u.repeat,u.repeat);

            uniforms_terrain.roughness.value = 0.9;
            uniforms_terrain.metalness.value = 0.2;

            uniforms_terrain.heightmap.value = heightTexture.texture;

            //uniforms_terrain.enableFog.value = u.fog;
            //uniforms_terrain.fogStart.value = u.fogStart;
            uniforms_terrain.fogColor.value = view.getBgColor();//new THREE.Color(0x2c2c26);


            
            //geometry.rotateY( -Math.PI / 2 );
            terrain.makeGeometry();

            mesh = new THREE.Mesh( geometry, material );
            mesh.matrixAutoUpdate = false;

            //mesh.castShadow = true;
            //mesh.receiveShadow = true;

            //mesh.updateMatrix();
            view.add( mesh );


            view.addUpdate( terrain.update );

            terrain.setUniform();
            //view.addUpdate( terrain.easing );



        },

        makeGeometry : function(){

            if(geometry) geometry.dispose();

            geometry = new THREE.PlaneBufferGeometry2( u.size, u.size, u.resolution - 1, u.resolution -1 );
            geometry.rotateX( -Math.PI / 2 );

        },

        makeHeightTexture : function(){

            compute = new GPUComputationRenderer( u.resolution, u.resolution, view.getRenderer() );
            heightmapVariable = compute.addVariable( "heightmap", pool.get( 'noiseMap' ), compute.createTexture() );

            smoothShader = compute.createShaderMaterial( pool.get( 'smoothMap' ), { texture: { value: null } , blur: { value: u.blur }, resolution: { value: u.resolution } } );
            smoothShader.defines.textureResolution = 'vec2( ' + u.resolution + ', ' + u.resolution + " )";

            compute.init();

            uniforms_height = heightmapVariable.material.uniforms;

            uniforms_height.pos = { value: 0 };;
            uniforms_height.size = { value: 0 };
            uniforms_height.resolution = { value: 0 };
            uniforms_height.type = { value: 0 };
            uniforms_height.complexity = { value: 0 };

            uniforms_height.pos.value = pos;
            //uniforms_height.size.value = u.size;
            //uniforms_height.resolution.value = u.resolution;
            //uniforms_height.type.value = u.type;
           // uniforms_height.complexity.value = 1 / ( u.complexity * 100 );



            //compute.compute();
            //terrain.smoothTerrain();
            heightTexture = compute.getCurrentRenderTarget( heightmapVariable );

        },

        smoothTerrain : function () {

            var currentRenderTarget = compute.getCurrentRenderTarget( heightmapVariable );
            var alternateRenderTarget = compute.getAlternateRenderTarget( heightmapVariable );

            var i = u.blur;

            while(i--){

                smoothShader.uniforms.texture.value = currentRenderTarget.texture;
                compute.doRenderTarget( smoothShader, alternateRenderTarget );

                smoothShader.uniforms.texture.value = alternateRenderTarget.texture;
                compute.doRenderTarget( smoothShader, currentRenderTarget );

            }
            
        },

        setUniform: function () {

            uniforms_height.type.value = u.type;
            uniforms_height.size.value = u.size;
            uniforms_height.resolution.value = u.resolution;
            uniforms_height.complexity.value = 1 / ( u.complexity * 100 );

            uniforms_terrain.size.value = u.size;
            uniforms_terrain.resolution.value = u.resolution;
            uniforms_terrain.height.value = u.height;
            uniforms_terrain.enableFog.value = u.fog;
            uniforms_terrain.fogStart.value = u.fogStart;
            uniforms_terrain.repeat.value = u.repeat;
            
            uniforms_terrain.ratioUV.value = 1.0 / (u.size/u.repeat);

            needsUpdate = true;

        },

        update: function () {

            terrain.easing();

            if(!needsUpdate) return;

            compute.compute();

            terrain.smoothTerrain();

            needsUpdate = false;

        },

        getHeight: function ( x, y ) {

            if(!heightTexture) return 0;

            var r = view.getPixel( heightTexture, x || u.resolution*0.5, y || u.resolution*0.5 );
            return r[ 0 ] * u.height;

        },

        easing: function () {

            var key = user.getKey();
            var r = -view.getControls().getAzimuthalAngle();

            if( key[7] ) maxspeed = 1.5;
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

            if ( !ease.x && !ease.y ) return;

            pos.z += Math.sin(r) * ease.x + Math.cos(r) * ease.y;
            pos.x += Math.cos(r) * ease.x - Math.sin(r) * ease.y;

            needsUpdate = true;

        },



    }

    return terrain;

})();