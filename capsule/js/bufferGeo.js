function bufferGeo ( geometry ) {

    var numVertices = geometry.vertices.length;
    var numFaces = geometry.faces.length;

    var bufferGeom = new THREE.BufferGeometry();
    var vertices = new Float32Array( numVertices * 3 );
    var normals = new Float32Array( numVertices * 3 );
    var uvs = new Float32Array( numFaces * 2 );
    var indices = new ( numFaces * 3 > 65535 ? Uint32Array : Uint16Array )( numFaces * 3 );

    for ( var i = 0; i < numVertices; i++ ) {

        var p = geometry.vertices[ i ];

        var i3 = i * 3;

        vertices[ i3 ] = p.x;
        vertices[ i3 + 1 ] = p.y;
        vertices[ i3 + 2 ] = p.z;

    }

    var goodNormal = [];

    for ( var i = 0; i < numFaces; i++ ) {

        var f = geometry.faces[ i ];

        var i3 = i * 3;
        var i6 = i * 6;

        indices[ i3 ] = f.a;
        indices[ i3 + 1 ] = f.b;
        indices[ i3 + 2 ] = f.c;

        var fv = geometry.faceVertexUvs[ 0 ][ i ];

        uvs[ i6 ] = fv[ 0 ].x;
        uvs[ i6 + 1 ] = fv[ 0 ].y;
        uvs[ i6 + 2 ] = fv[ 1 ].x;
        uvs[ i6 + 3 ] = fv[ 1 ].y;
        uvs[ i6 + 4 ] = fv[ 2 ].x;
        uvs[ i6 + 5 ] = fv[ 2 ].y;

        var na3 = f.a * 3;
        var nb3 = f.b * 3;
        var nc3 = f.c * 3;

        goodNormal[ na3 ] =  f.vertexNormals[0].x;//f.normal.x;
        goodNormal[ na3 + 1 ] = f.vertexNormals[0].y;///f.normal.y;
        goodNormal[ na3 + 2 ] = f.vertexNormals[0].z;//f.normal.z;

        goodNormal[ nb3 ] = f.vertexNormals[1].x;//f.normal.x;
        goodNormal[ nb3 + 1 ] = f.vertexNormals[1].y;//f.normal.y;
        goodNormal[ nb3 + 2 ] = f.vertexNormals[1].z;//f.normal.z;
        
        goodNormal[ nc3 ] = f.vertexNormals[2].x;//f.normal.x;
        goodNormal[ nc3 + 1 ] = f.vertexNormals[2].y;// f.normal.y;
        goodNormal[ nc3 + 2 ] = f.vertexNormals[2].z;//f.normal.z;
    }

    bufferGeom.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    bufferGeom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    bufferGeom.computeVertexNormals();

    console.log(geometry)

    //var goodNormal = bufferGeom.attributes.normal.array;

    //var i = numFaces;
    //while(i--){
    for ( var i = 0; i < numFaces; i++ ) {

        var f = geometry.faces[ i ];

        //var a = false;
        //var b = false;
        //var c = false;

        // Just overwrite normals and uvs

        //f.vertexNormals[0].x

        /*var na3 = f.a * 3;
        var nb3 = f.b * 3;
        var nc3 = f.c * 3;

        normals[ na3 ] =  f.vertexNormals[0].x;//f.normal.x;
        normals[ na3 + 1 ] = f.vertexNormals[0].y;///f.normal.y;
        normals[ na3 + 2 ] = f.vertexNormals[0].z;//f.normal.z;*/

        var a = testNormal(f.vertexNormals[0], goodNormal)

        //if(goodNormal[f.a] == normals[ f.a ] && goodNormal[f.a+1] == normals[ f.a+1 ] && goodNormal[f.a+2] == normals[ f.a+2 ] ) a = true;

       /* normals[ nb3 ] += f.vertexNormals[1].x;//f.normal.x;
        normals[ nb3 + 1 ] = f.vertexNormals[1].y;//f.normal.y;
        normals[ nb3 + 2 ] = f.vertexNormals[1].z;//f.normal.z;*/

        var b = testNormal(f.vertexNormals[1], goodNormal)

        //if(goodNormal[f.b] == normals[ f.b ] && goodNormal[f.b+1] == normals[ f.b+1 ] && goodNormal[f.b+2] == normals[ f.b+2 ] ) b = true;
        
        /*normals[ nc3 ] += f.vertexNormals[2].x;//f.normal.x;
        normals[ nc3 + 1 ] = f.vertexNormals[2].y;// f.normal.y;
        normals[ nc3 + 2 ] = f.vertexNormals[2].z;//f.normal.z;*/

        var c = testNormal(f.vertexNormals[2], goodNormal)

        //if(goodNormal[f.c] == normals[ f.c ] && goodNormal[f.c+1] == normals[ f.c+1 ] && goodNormal[f.c+2] == normals[ f.c+2 ] ) c = true;

        var fv = geometry.faceVertexUvs[ 0 ][ i ];

        var na = f.a * 2;
        var nb = f.b * 2;
        var nc = f.c * 2;


       // if(a){
       /* uvs[ na ] = fv[ 0 ].x;
        uvs[ na + 1 ] = fv[ 0 ].y;
       // }
        //if(b){
        uvs[ nb ] = fv[ 1 ].x;
        uvs[ nb + 1 ] = fv[ 1 ].y;
       // }
        //if(c){
        uvs[ nc ] = fv[ 2 ].x;
        uvs[ nc + 1 ] = fv[ 2 ].y;
        //}*/

    }

    console.log(indices)

    console.log(uvs)

   

    
    //bufferGeom.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
    bufferGeom.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

    console.log(numVertices, uvs.length/2)

    

    geometry.dispose();

    return bufferGeom;
}

function testNormal(p, ar){

    var i = ar.length/3;
    var n;
    while(i--){

        n = i*3;
        if(ar[n] == p.x && ar[n+1] == p.y && ar[n+2] == p.z) return true;
        //if(ar[n] == p.x || ar[n+1] == p.y || ar[n+2] == p.z) return true;

    }

    return false;

}