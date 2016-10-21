var menu = ( function () {
    
    'use strict';

    var base, baseback, plane, iconGroup;
    var icons = [];
    var gicons = [];
    var size = 0.004;
    var torad = 0.0174532925199432957;
    var max = -90*torad;
    var isMouseDown = false;
    var or = {x:0, y:0};

    menu = {



        init: function ( ) {

            var p = pool.getResult();

            var mapp = new THREE.Texture( p.plane );
            mapp.needsUpdate = true;
            var mapb = new THREE.Texture( p.base );
            mapb.needsUpdate = true;



            var matBase = new THREE.MeshStandardMaterial({  color:0xFFFFFF, envMap:scene.getEnv(), metalness:0.5, roughness:0.5 }); 
            base = new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.54, 0.595, 0.28, 64, 1, true ), matBase );
            base.rotation.x = -28*torad;

            var matBack= new THREE.MeshStandardMaterial({ alphaMap:mapb, color:0xCCCCCC, envMap:scene.getEnv(), metalness:0.5, roughness:0.5, side:THREE.BackSide, transparent:true }); 
            baseback = new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.54, 0.595, 0.28, 64, 1, true ), matBack );
            //baseback.rotation.x = -28*torad;

            var matPlane = new THREE.MeshStandardMaterial({ alphaMap:mapp, color:0xFFFFFF, envMap:scene.getEnv(), metalness:0, roughness:0.3, transparent:true, wireframe:false }); 
            plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.6, 4, 1, 2 ), matPlane );
            plane.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0,1.71,0) );

            plane.rotation.x = -21*torad;

            base.add(plane)
            base.add(baseback)

            base.position.y = -0.46;
            base.castShadow = false;
            base.receiveShadow = true;

            

            iconGroup = new THREE.Group();

            iconGroup.rotation.x = -21*torad;
            iconGroup.position.y =  -0.46;

            var map = new THREE.Texture( p.icon );
            map.flipY = false;
            map.needsUpdate = true;

            var mat = new THREE.MeshStandardMaterial({ map:map, color:0xFFFFFF, envMap:scene.getEnv(), metalness:0.6, roughness:0.3, }) 

            icons[0] = p.icons.i0;//_know;
            icons[1] = p.icons.i1;//_collab;
            icons[2] = p.icons.i2;//_inov;
            icons[3] = p.icons.i3;//_event;


            for( var i = 0 ; i < 4; i++ ){

                gicons[i] = new THREE.Group();
                gicons[i].rotation.y = (30*i) * torad;
                icons[i].scale.multiplyScalar( size );
                icons[i].material = mat;
                icons[i].rotation.x = 10 * torad;

                icons[i].position.set(0,0.1,0.6);

                icons[i].castShadow = true;
                icons[i].receiveShadow = false;


                gicons[i].add( icons[i] );
                iconGroup.add( gicons[i] );

            }
           
            

        },

        add: function () {

            scene.add( base );
            scene.add( iconGroup );
            document.addEventListener( 'mouseup', menu.up, false );
            document.addEventListener( 'mousedown', menu.down, false );
            document.addEventListener( 'mousemove', menu.move, false );

        },

        clear: function () {

            scene.remove( base );
            scene.remove( iconGroup );
            document.removeEventListener( 'mouseup', menu.up, false );
            document.removeEventListener( 'mousedown', menu.down, false );
            document.removeEventListener( 'mousemove', menu.move, false );

        },

        up:function ( e ) {

            isMouseDown = false;

        },

        down:function ( e ) {

            isMouseDown = true;
            or.x = e.clientX;
            or.y = e.clientY;

        },

        move: function ( e ){

            if(!isMouseDown) return;

            var x = -( (window.innerWidth*0.5) - (window.innerWidth - e.clientX ) ) * 0.001
            var y = ( (window.innerHeight*0.5) - (window.innerHeight - e.clientY ) ) * 0.001

            for( var i = 0 ; i < 4; i++ ){

              //  icons[i].rotation.z = z;

            }
            

            var r = ((or.x - e.clientX)*0.01);

            r = r < 0 ? r : 0;
            r = r > max ? r : max;


            iconGroup.rotation.y = r;

        }





    }

    return menu;

})();