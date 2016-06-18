

var ground = ( function () {

    'use strict';

    var res, lng, mul, mul2, size, pos;

    var geometry, mesh, material, perlin, perlin2, k1, k2;

    var h_data, colors, vertices;

    ground = {

        init : function ( o ) {

            o = o || {};

            pos = new THREE.Vector3( );

            size = new THREE.Vector3( 100, 40, 100 );

            res = o.res || 64;
            mul = o.mul || 60;
            mul2 = o.mul2 || 10;
            lng = res * res;

            h_data =  new Float32Array( lng );



            perlin = new Perlin();
            perlin2 = new Perlin();

            k1 = new kalman( 0.0001 );
            k2 = new kalman( 0.0001 );

            geometry = new THREE.PlaneBufferGeometry( size.x, size.z, res - 1, res -1 );
            geometry.rotateX( -Math.PI / 2 );

            colors = new Float32Array( lng * 3 );
            geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

            vertices = geometry.attributes.position.array

            
            material = new THREE.MeshPhongMaterial({ color:0x333333,  vertexColors: THREE.VertexColors, wireframe:false })

            mesh = new THREE.Mesh( geometry, material );
            //mesh.rotation.x = - Math.PI / 2;
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();

            view.add( mesh );

            view.addUpdate( ground.update )

            //this.update();

        },

        update : function () {

            pos.x += 0.1;

            //debug(pos.x);

            var i, x, y, n, c, d, f;

            var sc = 1 / mul;
            var sc2 = 1 / mul2;
            var r = 1 / res;
            var rx = (res - 1) / size.x;
            var rz = (res - 1) / size.z;

            i = lng;
            while(i--){

                n = i * 3;

                x = i % res;
                y = ~~ ( i * r );

                c = 0.5 + ( perlin.noise( (x+(pos.x*rx))*sc, (y+(pos.z*rz))*sc ) * 0.5); // from 0 to 1
                d = 0.5 + ( perlin2.noise( (x+(pos.x*rx))*sc2, (y+(pos.z*rz))*sc2 ) * 0.5); // from 0 to 1

               // c = k1.update( c );
                d = k2.update( d );

                f = Math.min(Math.max(c, d), c*d)//(Math.max( c, d ));
                h_data[ i ] = f * size.y; // final h size
                vertices[ n + 1 ] = h_data[i];
                colors[ n ] = f;
                colors[ n + 1 ] = 1-f+0.5;

                if(f<0.1) colors[ n + 2 ] = 1;
                else colors[ n + 2 ] = 0;
            }
            
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.color.needsUpdate = true;

            geometry.computeBoundingSphere();
            geometry.computeVertexNormals();

        },

        getData : function(){

            return h_data;

        },

    



    }

    return ground;

})();



