function Planet( o, mat ) {

    o = o == undefined ? {} : o;

    this.radius = o.radius !== undefined ? o.radius : 100;
    this.resolution = o.resolution !== undefined ? o.resolution : 10;

    

    
    this.data = {
        level: o.level || [1,0.25],
        frequency: o.frequency || [0.1,0.5],
        expo: o.expo || 2,
        height: o.height || 4,
    }


    /*this.sample = o.sample == undefined ? [64,64] : o.sample;
    this.size = o.size == undefined ? [100,10,100] : o.size;

    /*this.o = {
        name: o.name || 'terrain',
        sample: this.sample,
        size: this.size,
    }*/

    /*this.colorBase = { r:1, g:0.7, b:0 };

    // for perlin
    this.complexity = o.complexity == undefined ? 30 : o.complexity;
    this.complexity2 = o.complexity2 == undefined ? null : o.complexity2;

    this.local = new THREE.Vector3();
    if(o.local) this.local.fromArray( o.local );

    this.lng = this.sample[0] * this.sample[1];
    this.heightData = new Float64Array( this.lng );

    this.perlin = perlin == undefined ? new Perlin() : perlin;

    this.colors = new Float32Array( this.lng * 3 );
    this.geometry = new THREE.PlaneBufferGeometry( this.size[0], this.size[2], this.sample[0] - 1, this.sample[1] - 1 );
    this.geometry.rotateX( -Math.PI90 );
    this.geometry.computeBoundingSphere();

    this.geometry.addAttribute( 'color', new THREE.BufferAttribute( this.colors, 3 ) );
    this.vertices = this.geometry.attributes.position.array;
    */

    this.material = new THREE.MeshStandardMaterial({ 
        normalScale: new THREE.Vector2(2,2),
        vertexColors: THREE.VertexColors, 
        name:'planet', 
        metalness:0.4, 
        roughness:0.4, 
        wireframe:false, 
        envMap: view.getEnvMap() 
    });

    this.uvx = [2,2];

    this.material.map = view.loadTexture('terrain/crater.jpg'), 
    this.material.map.repeat = new THREE.Vector2( this.uvx[0], this.uvx[1] );
    this.material.map.wrapS = THREE.RepeatWrapping;
    this.material.map.wrapT = THREE.RepeatWrapping;
    this.material.normalMap = view.loadTexture('terrain/crater_n.jpg'), 
    this.material.normalMap.wrapS = THREE.RepeatWrapping;
    this.material.normalMap.wrapT = THREE.RepeatWrapping;

    this.makeGeometry();

    //this.update();


    THREE.Mesh.call( this, this.geometry, this.material );

    this.name = o.name || 'planet';

    this.castShadow = false;
    this.receiveShadow = true;

};

Planet.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

    constructor: Planet,

    makeGeometry: function () {

        var n = 5;
       // var dim = Math.pow(2, n) + 1;

        //console.log(dim)

       // this.resolution = dim-1;
        this.roughness = 0.25*this.radius;

        

        

        //this.cubeTerrain(n, this.roughness);


        this.geo = new THREE.BoxGeometry( 1, 1, 1, this.resolution, this.resolution, this.resolution ), v;
        var i = this.geo.vertices.length, v;

        while( i-- ) {

            v = this.geo.vertices[ i ];
            v.normalize();
            v.multiplyScalar( this.radius );

        }



       // this.geometry = new THREE.BufferGeometry().fromGeometry( this.geo );

       // this.vertices = this.geometry.attributes.position.array;
        this.lng = this.geo.vertices.length;
        

        this.update()
        
       // geo.dispose();

    },

    update: function(){

        if(this.geometry) this.geometry.dispose();


        var i = this.lng, v, c, f, w = new THREE.Vector3()

        while(i--){

            v = this.geo.vertices[i];

            c =  Math.noise( v, this.data );

            c = Math.pow(c, this.data.expo);

            c = c>1 ? 1:c;
            c = c<0 ? 0:c;

            w.copy(v);
            v.add( w.normalize().multiplyScalar(c*this.data.height) );

            this.geo.colors[i] = new THREE.Color(c,c,c*0.2);

        }

        

        

        //this.geo.mergeVertices();
        this.geo.computeVertexNormals();

        i = this.geo.faces.length;
      //  console.log(i)
        while(i--){
            f = this.geo.faces[i]

           // if(i===0) console.log( this.geo.vertices[f.a] )
            f.vertexColors = [this.geo.colors[f.a],this.geo.colors[f.b],this.geo.colors[f.c]]
        }

        this.geo.colorsNeedUpdate = true;
        
        this.geometry = this.geo;//new THREE.BufferGeometry().fromGeometry( this.geo );

/*
        
        this.colors = this.geometry.attributes.color.array//new Float32Array( this.lng2 * 3 );
        var lng2 = this.colors.length/3;
        //this.geometry.addAttribute( 'color', new THREE.BufferAttribute( this.colors, 3 ) );
        console.log('result ' + lng2)
        //this.geometry.addAttribute( 'color', new THREE.BufferAttribute( this.colors, 3 ) );

        i = this.lng2
        while(i--){
            
            //h = scale+H[i];
            n = i * 3;
            h = 0.5;
            this.colors[n] = h;
            this.colors[n+1] = 0//h;
            this.colors[n+2] = 0;//h;
        }

       // this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
*/

        //this.geometry.computeVertexNormals();

    },

    dispose: function () {

        this.geometry.dispose();
        this.material.dispose();
        
    },

    setEnvMap: function ( map ) {

        this.material.envMap = map;
    },

   
});