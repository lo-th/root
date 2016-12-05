var view = ( function () {
    
    'use strict';

    var container, renderer, scene, camera, cameraCC, controls, vsize, loader, mouse;

    var desk, ecran, site;

    var mat = {};
    var txt = {};

    var isToon = false;
    var torad = 0.0174532925199432957;

    view = {

        init: function ( toon ) {

            container = document.createElement( 'div' );
            document.body.appendChild( container );

            var w = window.innerWidth;
            var h = window.innerHeight

            vsize = { x: w, y: h, z: w/h, mx: w*0.5, my: h*0.5 };
            mouse = { x:0, y:0, ox:0, oy:0, down:false };

            renderer = new THREE.WebGLRenderer({ antialias:true });
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( vsize.x, vsize.y );
            renderer.setClearColor( 0x7EC0EE, 1 );

            renderer.gammaInput = true;
            renderer.gammaOutput = true;
            

            //effect = new THREE.OutlineEffect( renderer, { defaultThickness:0.01 } );
            //effect.setSize( vsize.x, vsize.y );

            container.appendChild( renderer.domElement );

            scene = new THREE.Scene();

            cameraCC = new THREE.Group();

            camera = new THREE.PerspectiveCamera( 60, vsize.z, 0.1, 1000 );
            camera.position.set( 0, 7 ,0 );

            cameraCC.add( camera );

            window.addEventListener( 'resize', view.resize, false );

            // MOUSEEVENT

            document.addEventListener( 'mousedown', this, false );
            document.addEventListener( 'mousemove', this, false );
            document.addEventListener( 'mouseout',  this, false );
            document.addEventListener( 'mouseup',   this, false );
            document.addEventListener( 'mouseover', this, false );

            this.render();
            //scene.add( new THREE.AmbientLight( 0xFFFFEE) );




           /* var light = new THREE.SpotLight( 0xFFFFEE, 0.5, 0, Math.PI/2, 1 );
                light.position.set(100,100,300);
                light.lookAt(new THREE.Vector3(0,40,0));
                scene.add( light );*/

            desk = new THREE.Group();
            scene.add( desk );

            mat['screen'] = new THREE.MeshBasicMaterial({ color:0x000000 });

            if(toon){

                isToon = true;
                renderer.autoClear = false;

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

            }


            loader = new THREE.SEA3D({ autoPlay:false, container: desk });
            pool.setSeaLoader( loader );

            var path = 'assets/'
            var assets = [

                path + 'textures/desk.jpg',
                path + 'textures/chair.jpg',
                path + 'textures/tv.jpg',
                path + 'textures/floor.jpg',
                path + 'textures/paddle.jpg',
                path + 'textures/cabinet.jpg',
                path + 'desktop.sea',

            ];

            pool.load( assets, view.desk );

        },

        //

        handleEvent : function( e ) {

            switch( e.type ) {
                case 'mousedown': this.down( e ); break;
                case 'mouseout': this.out( e ); break;
                case 'mouseover': this.over( e ); break;
                case 'mouseup': this.up( e ); break;
                case 'mousemove': this.move( e ); break;
            }

        },

        over: function ( e ) {

        },
        out: function ( e ) {

        },
        down: function ( e ) {

            mouse.down = true;
            mouse.ox = e.clientX;
            mouse.oy = e.clientY;
            mouse.cx = site.rotation.y
            mouse.cy = camera.rotation.x;

        },
        up: function ( e ) {

            mouse.down = false;

        },
        move: function ( e ) {

            mouse.x = e.clientX;
            mouse.y = e.clientY;

            if( mouse.down ){

                site.rotation.y = mouse.cx - ( mouse.x - mouse.ox ) * torad * 0.5;
                var x = mouse.cy - ( mouse.y - mouse.oy ) * torad * 0.5;

                x = x > 0.6 ? 0.6 : x;
                x = x < -1 ? -1 : x;

                camera.rotation.x = x;

                //console.log( camera.rotation.x )

            }

        },

        //

        render: function () {

            requestAnimationFrame( view.render );

            if(isToon){

                renderer.clear();

                scene.overrideMaterial = mat.outline;
                renderer.render( scene, camera );
                scene.overrideMaterial = mat.outlineIn;
                renderer.render( scene, camera );

                scene.overrideMaterial = null;
            }

            renderer.render( scene, camera );

        },

        resize: function () {

            var w = window.innerWidth;
            var h = window.innerHeight
            vsize = { x: w, y: h, z: w/h, mx: w*0.5, my: h*0.5 };

            camera.aspect = vsize.z;
            camera.updateProjectionMatrix();
            renderer.setSize( vsize.x, vsize.y );

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

            txt['cabinet'] = new THREE.Texture( p.cabinet );
            txt['cabinet'].flipY = false;
            txt['cabinet'].needsUpdate = true;


            // MATERIAL

            mat['desk'] = new THREE.MeshBasicMaterial({ map:txt.desk });
            mat['tv'] = new THREE.MeshBasicMaterial({ map:txt.tv });
            mat['chair'] = new THREE.MeshBasicMaterial({ map:txt.chair });
            mat['floor'] = new THREE.MeshBasicMaterial({ map:txt.floor });
            mat['paddle'] = new THREE.MeshBasicMaterial({ map:txt.paddle });
            mat['cabinet'] = new THREE.MeshBasicMaterial({ map:txt.cabinet });

            // MESH

            var i = desk.children.length, a, b, j;
            while(i--){
                a = desk.children[i];
                a.material.color.set( 0xFFFFFF );

                if( a.name === 'cabinet_1' ) a.material = mat.cabinet;
                if( a.name === 'cabinet_2' ) a.material = mat.cabinet;

                if( a.name === 'tv_pad' ) a.material = mat.tv;
                if( a.name === 'desk' ) a.material = mat.desk;
                if( a.name === 'chair_low' ) a.material = mat.chair;
                if( a.name === 'paddle' || a.name === 'phone' ) a.material = mat.paddle;
                if( a.name === 'floor' ) a.material = mat.floor;

                j = a.children.length;
                while(j--){
                    b = a.children[j];
                    b.material.color.set( 0xFFFFFF );

                    if( a.name === 'chair_low' ) b.material = mat.chair;
                    if( a.name === 'paddle' ) b.material = mat.paddle;

                    if( b.name === 'chair_top' ){ 
                        site = b;
                        site.add( cameraCC );
                    }

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