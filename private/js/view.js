var view = ( function () {
    
    'use strict';

    var container, renderer, scene, camera, controls, vsize, loader, effect;

    var desk, ecran;

    var mat = {};
    var txt = {};

    view = {

        init: function () {

            container = document.createElement( 'div' );
            document.body.appendChild( container );

            vsize = new THREE.Vector3( window.innerWidth, window.innerHeight, 0);
            vsize.z = vsize.x / vsize.y;

            renderer = new THREE.WebGLRenderer({ antialias:true });
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( vsize.x, vsize.y );
            renderer.setClearColor( 0x7EC0EE, 1 );

            renderer.gammaInput = true;
            renderer.gammaOutput = true;
            renderer.autoClear = false;

            //effect = new THREE.OutlineEffect( renderer, { defaultThickness:0.01 } );
            //effect.setSize( vsize.x, vsize.y );

            container.appendChild( renderer.domElement );

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( 45, vsize.z, 0.1, 1000 );
            camera.position.set(0,20,30);

            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.target.set(0,7,0);
            controls.enableKeys = false;
            controls.update();

            window.addEventListener( 'resize', view.resize, false );

            this.render();
            //scene.add( new THREE.AmbientLight( 0xFFFFEE) );




           /* var light = new THREE.SpotLight( 0xFFFFEE, 0.5, 0, Math.PI/2, 1 );
                light.position.set(100,100,300);
                light.lookAt(new THREE.Vector3(0,40,0));
                scene.add( light );*/

            desk = new THREE.Group();
            scene.add( desk );

            mat['screen'] = new THREE.MeshBasicMaterial({ color:0x000000 });

            shaderHack.init();


            //mat['outline'] = new THREE.MeshBasicMaterial({ color:0x000000, side:THREE.BackSide });

            mat['outline'] = new THREE.ShaderMaterial({
                uniforms: {
                    color: {type: 'c', value: new THREE.Color(0x000000) },
                    power: {type: 'f', value: 0.05 },
                },
                vertexShader:[
                    'uniform float power;',
                    'void main(){',
                    '    vec3 pos = position + (normal * power);',
                    '    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos,1.0);',
                    '}'
                ].join('\n'),
                fragmentShader:[
                    'uniform vec3 color;',
                    'void main(){',
                    '    gl_FragColor = vec4( color, 1.0 );',
                    '}'
                ].join('\n'),
                depthTest:false, 
                depthWrite:false,
                side:THREE.DoubleSide
            });

            mat['outlineIn'] = new THREE.ShaderMaterial({
                uniforms: {
                    color: {type: 'c', value: new THREE.Color(0x000000) },
                    power: {type: 'f', value: 0.03 },
                },
                vertexShader:[
                    'uniform float power;',
                    'void main(){',
                    '    vec3 pos = position + (normal * power);',
                    '    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos,1.0);',
                    '}'
                ].join('\n'),
                fragmentShader:[
                    'uniform vec3 color;',
                    'void main(){',
                    '    gl_FragColor = vec4( color, 1.0 );',
                    '}'
                ].join('\n'),
                side:THREE.BackSide
            });


            loader = new THREE.SEA3D({ autoPlay:false, container: desk });
            pool.setSeaLoader( loader );

            var path = 'assets/'
            var assets = [

                path + 'textures/desk.jpg',
                path + 'textures/chair.jpg',
                path + 'textures/tv.jpg',
                path + 'textures/floor.jpg',
                path + 'textures/paddle.jpg',
                path + 'desktop.sea',

            ];

            pool.load( assets, view.desk );

        },

        render: function () {

            requestAnimationFrame( view.render );

            renderer.clear();

            scene.overrideMaterial = mat.outline;
            renderer.render( scene, camera );
            scene.overrideMaterial = mat.outlineIn;
            renderer.render( scene, camera );

            scene.overrideMaterial = null;

            //effect.render( scene, camera );
            renderer.render( scene, camera );

        },

        resize: function () {

            vsize.x = window.innerWidth;
            vsize.y = window.innerHeight;
            vsize.z = vsize.x / vsize.y;
            camera.aspect = vsize.z;
            camera.updateProjectionMatrix();
            renderer.setSize( vsize.x, vsize.y );

            //effect.setSize( vsize.x, vsize.y );

        },

        desk: function ( p ) {

            // TEXTURE

            txt['desk'] = new THREE.Texture( p.desk );
            txt['desk'].flipY = false;
            txt['desk'].needsUpdate = true;

            txt['chair'] = new THREE.Texture( p.chair );
            txt['chair'].flipY = false;
            txt['chair'].needsUpdate = true;

            txt['tv'] = new THREE.Texture( p.tv );
            txt['tv'].flipY = false;
            txt['tv'].needsUpdate = true;

            txt['floor'] = new THREE.Texture( p.floor );
            txt['floor'].flipY = false;
            txt['floor'].needsUpdate = true;

            txt['paddle'] = new THREE.Texture( p.paddle );
            txt['paddle'].flipY = false;
            txt['paddle'].needsUpdate = true;

            // MATERIAL

            mat['desk'] = new THREE.MeshBasicMaterial({ map:txt.desk });
            mat['tv'] = new THREE.MeshBasicMaterial({ map:txt.tv });
            mat['chair'] = new THREE.MeshBasicMaterial({ map:txt.chair });
            mat['floor'] = new THREE.MeshBasicMaterial({ map:txt.floor });
            mat['paddle'] = new THREE.MeshBasicMaterial({ map:txt.paddle });

            // MESH

            var i = desk.children.length, a, b, j;
            while(i--){
                a = desk.children[i];
                a.material.color.set( 0xFFFFFF );

                if( a.name === 'tv_pad' ) a.material = mat.tv;
                if( a.name === 'desk' ) a.material = mat.desk;
                if( a.name === 'chair_low' ) a.material = mat.chair;
                if( a.name === 'paddle' ) a.material = mat.paddle;
                if( a.name === 'floor' ) a.material = mat.floor;

                j = a.children.length;
                while(j--){
                    b = a.children[j];
                    b.material.color.set( 0xFFFFFF );

                    if( a.name === 'chair_low' ) b.material = mat.chair;
                    if( a.name === 'paddle' ) b.material = mat.paddle;

                    if( b.name === 'tv' ){
                        b.material = mat.tv;
                        ecran = b.children[0];
                        ecran.material = mat.screen;
                    }
                }

                
            }

            /*console.log( p.desk );

            var i = p.desk.length;
            while(i--){
                scene.add( p.desk[i] );
            }*/
        }





    }

    return view;

})();