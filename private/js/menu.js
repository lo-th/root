var menu = ( function () {
    
    'use strict';

    var iconGroup;
    var icons = [];
    var size = 0.0075;
    var envMap;

    menu = {

        init: function ( env ) {

            envMap = env;

            pool.load(['assets/models/icons.sea'], menu.add );
            
        },

        add: function ( p ) {

            iconGroup = new THREE.Group();

            var mat = new THREE.MeshStandardMaterial({ color:0xAAAAAA, envMap:envMap, metalness:0.5, roughness:0.5, }) 

            icons[0] = p.icons.i0_know;
            icons[1] = p.icons.i1_collab;
            icons[2] = p.icons.i2_inov;
            icons[3] = p.icons.i3_event;


            for( var i = 0 ; i < 4; i++ ){
                icons[i].position.multiplyScalar( size );
                icons[i].rotation.x = Math.PI * 0.5;
                
                icons[i].scale.multiplyScalar( size );
                icons[i].material = mat;

                iconGroup.add( icons[i] );
            }

           
            iconGroup.position.y = 0.25;

            scene.add( iconGroup );

            document.addEventListener( 'mousemove', menu.move, false );
            
        },

        move: function ( e ){

            var z = -( (window.innerWidth*0.5) - (window.innerWidth - e.clientX ) ) * 0.001
            var y = ( (window.innerHeight*0.5) - (window.innerHeight - e.clientY ) ) * 0.001

            for( var i = 0 ; i < 4; i++ ){

                icons[i].rotation.z = z;

            }

            iconGroup.rotation.x = y;

        }





    }

    return menu;

})();