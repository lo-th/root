import { Box3, Vector2, Vector3, BufferGeometry, Sphere, Mesh, BufferAttribute } from "three";
import MeshVertex from "./MeshVertex.js";
import {timeStart, timeEnd} from "../utils/MathUtils.js";
//import EdgeConstraint from "./EdgeConstraint.js";

// The enum can be directly translated
export const SlicedMeshSubmesh = { Default : 0, CutFace : 1 };
/*export let SlicedMeshSubmesh

;(function(SlicedMeshSubmesh) {
  SlicedMeshSubmesh[(SlicedMeshSubmesh["Default"] = 0)] = "Default"
  SlicedMeshSubmesh[(SlicedMeshSubmesh["CutFace"] = 1)] = "CutFace"
})(SlicedMeshSubmesh || (SlicedMeshSubmesh = {}))
*/
// The class definition is translated into TypeScript
export class Fragment {

    constructor() {

        this.vertices = [];
        this.cutVertices = [];
        this.triangles = [[], []];
        this.constraints = [];
        this.indexMap = [];
        this.bounds = null//new Box3();
        this.vertexAdjacency = [];
        this.convextested = false;


    }

    static fromGeometry( geometry ) {

        const positions = geometry.attributes.position.array;
        const normals = geometry.attributes.normal.array;
        const uvs = geometry.attributes.uv.array;

        const count = geometry.attributes.position.count;
        let n, n2, i = count;

        const data = new Fragment();

        for (let i = 0; i < count; i++) {
            n = i*3;
            n2 = i*2;

            data.vertices.push(new MeshVertex(
                new Vector3( positions[n], positions[n+1], positions[n+2] ), 
                new Vector3( normals[n], normals[n+1], normals[n+2] ), 
                new Vector2(uvs[n2], uvs[n2+1])
            ));

        }

        //data.triangles = [Array.from(geometry.index?.array as Uint32Array), []];
        //data.triangles = [Array.from(geometry.index), []];
        //data.triangles = [new Uint32Array(geometry.index.array), []];
        data.triangles = [[...geometry.index.array], []];
        //data.triangles = [Array.from(geometry.index?.array), []]
        //data.triangles = [Array.from(geometry.index?.array), []];

        //timeStart('geometry')
        
        data.calculateBounds();
        //data.convex = data.isConvex()

        //console.log("Object is Convex", data.convex)

        //timeEnd('geometry')

        return data;
    }

    get size() {
        if(!this.bounds) this.calculateBounds()
            let sz = new Vector3()
        return this.bounds.getSize( sz )
    }

    get convex() {
        if(!this.convextested) this.cc = this.isConvex()
        return this.cc;
    }

    /**
    * Gets the total number of triangles across all sub meshes
    */
    get triangleCount() {
        return (this.triangles[0].length + this.triangles[1].length) / 3;
    }

    /**
    * Gets the total number of vertices in the geometry
    */
    get vertexCount() {
        return this.vertices.length + this.cutVertices.length;
    }

    /**
    * Adds a new cut face vertex
    * @param position The vertex position
    * @param normal The vertex normal
    * @param uv The vertex UV coordinates
    */
    addCutFaceVertex(position, normal, uv) {
        const vertex = new MeshVertex(position, normal, uv);
        this.vertices.push(vertex);
        this.cutVertices.push(vertex);

        // Track which non-cut-face vertex this cut-face vertex is mapped to
        this.vertexAdjacency.push(this.vertices.length - 1);
    }

    /**
    * Adds a new vertex to this mesh that is mapped to the source mesh
    * @param vertex Vertex data
    * @param sourceIndex Index of the vertex in the source mes
    * */
    addMappedVertex(vertex, sourceIndex) {
        this.vertices.push(vertex);
        this.indexMap[sourceIndex] = this.vertices.length - 1;
    }

    /**
    * Adds a new triangle to this mesh. The arguments v1, v2, v3 are the indexes of the
    * vertices relative to this mesh's list of vertices; no mapping is performed.
    * @param v1 Index of the first vertex
    * @param v2 Index of the second vertex
    * @param v3 Index of the third vertex
    * @param subMesh The sub-mesh to add the triangle to
    */
    addTriangle( v1, v2, v3, subMesh ) {
       this.triangles[subMesh].push(v1, v2, v3);
    }

    /**
    * Adds a new triangle to this mesh. The arguments v1, v2, v3 are the indices of the
    * vertices in the original mesh. These vertices are mapped to the indices in the sliced mesh.
    * @param v1 Index of the first vertex
    * @param v2 Index of the second vertex
    * @param v3 Index of the third vertex
    * @param subMesh The sub-mesh to add the triangle to
    */
    addMappedTriangle( v1, v2, v3, subMesh ) {
        this.triangles[subMesh].push(
            this.indexMap[v1],
            this.indexMap[v2],
            this.indexMap[v3],
        );
    }

    /**
     * 
     * 
     * MAYBE BUG HERE !!!!
     * 
     * 
     * 
     * 
    * Finds coincident vertices on the cut face and welds them together.
    */
    weldCutFaceVertices() {
        // Temporary array containing the unique (welded) vertices
        // Initialize capacity to current number of cut vertices to prevent
        // unnecessary reallocations
        const weldedVerts = [];
        // Need to update adjacency as well
        const weldedVertsAdjacency = [];

        // We also keep track of the index mapping between the skipped vertices
        // and the index of the welded vertex so we can update the edges
        const indexMap = []//new Array(this.cutVertices.length);


        // Number of welded vertices in the temp array
        let k = 0;

        // Perform spatial hashing of vertices
        const adjacencyMap = new Map();
        this.cutVertices.forEach((vertex, i) => {
            const key = vertex.hash();

            //console.log( key)

            if (!adjacencyMap.has(key)) {
                indexMap[i] = k;
                adjacencyMap.set(key, k);
                weldedVerts.push(this.cutVertices[i]);
                weldedVertsAdjacency.push(this.vertexAdjacency[i]);
                k++;
            } else {
                indexMap[i] = adjacencyMap.get(key);
                //indexMap[i] = adjacencyMap.get(key)!;
            }
        });

        // Update the edge constraints to point to the new welded vertices
        for (let i = 0; i < this.constraints.length; i++) {
            const edge = this.constraints[i];
            edge.v1 = indexMap[edge.v1];
            edge.v2 = indexMap[edge.v2];
        }

        // Update the cut vertices
        this.cutVertices = weldedVerts;
        this.vertexAdjacency = weldedVertsAdjacency;

    }

    /**
    * Calculates the bounds of the mesh data
    */
    calculateBounds_( full=false ) {

        if ( !this.vertices.length ) return;
        if ( this.bounds === null ) this.bounds = new Box3();

        let vertexCount = this.vertices.length
        if( full ) vertexCount += this.cutVertices.length;

        const positions = []
        let n = -1;

        for (const vert of this.vertices) {
            positions[n++] = vert.position;
        }

        if(full){
            for (const vert of this.cutVertices) {
                positions[n++] = vert.position;
            }
        }
        

        this.bounds.setFromPoints(positions);

    }


    /**
    * Calculates the bounds of the mesh data
    */
    calculateBounds() {

        if ( !this.vertices.length ) return
        if ( this.bounds === null ) this.bounds = new Box3();

        // Initialize min and max vectors with the first vertex in the array
        let min = this.vertices[0].position.clone();
        let max = min.clone();

        // Iterate over the vertices to find the min and max x, y, and z
        this.vertices.forEach((vertex) => {
            min.x = Math.min(min.x, vertex.position.x);
            min.y = Math.min(min.y, vertex.position.y);
            min.z = Math.min(min.z, vertex.position.z);

            max.x = Math.max(max.x, vertex.position.x);
            max.y = Math.max(max.y, vertex.position.y);
            max.z = Math.max(max.z, vertex.position.z);
        });

        this.bounds.set(min, max);

    }

    /**
    * Converts this to a Mesh
    */

    toMesh( parent, internMaterial = null ) {

        const center = new Vector3();
        const size = new Vector3();

        let g = this.toGeometry();
        //g.computeBoundingBox();
        g.boundingBox.getCenter( center );
        g.boundingBox.getSize( size )
        g.translate( -center.x, -center.y, -center.z );
        g.boundingSphere = new Sphere( new Vector3(), size.length() * 0.5 );

        let material = parent.material;
        if( internMaterial ) material = [ parent.material, internMaterial];

        const mesh =  new Mesh( g, material );
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        center.applyQuaternion(parent.quaternion);

        mesh.position.copy(parent.position).add(center);
        mesh.quaternion.copy(parent.quaternion);

        mesh.userData = {
            origin: mesh.position.clone(),
            direction: center.normalize(),
            size: size,
        }

        return mesh

    }

    /**
    * Converts this to a BufferGeometry object
    */
    toGeometry() {

        const geometry = new BufferGeometry();

        const positions = [];
        const normals = [];
        const uvs = [];

        // Add the positions, normals and uvs for the non-cut-face geometry
        this.vertices.forEach((vert) => {
            positions.push( vert.position.x, vert.position.y, vert.position.z )
            normals.push( vert.normal.x, vert.normal.y, vert.normal.z )
            uvs.push( vert.uv.x, vert.uv.y )
        })

        // Next, add the positions, normals and uvs for the cut-face geometry
        this.cutVertices.forEach((vert) => {
            positions.push( vert.position.x, vert.position.y, vert.position.z )
            normals.push( vert.normal.x, vert.normal.y, vert.normal.z )
            uvs.push( vert.uv.x, vert.uv.y )
        })

        geometry.addGroup(0, this.triangles[0].length, 0);
        geometry.addGroup(this.triangles[0].length, this.triangles[1].length, 1);

        geometry.setAttribute( "position", new BufferAttribute(new Float32Array(positions), 3) );
        geometry.setAttribute( "normal", new BufferAttribute(new Float32Array(normals), 3) );
        geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex( new BufferAttribute(new Uint32Array(this.triangles.flat()), 1) );

        geometry.computeBoundingBox();

        return geometry;
    }

    isConvex( threshold = 0.001 ){

        this.convextested = true;

        let n = 0
        const maxTriangles = this.triangleCount;
        const triangles = [...this.triangles[0], ...this.triangles[1]]//this.triangles.flat()[0];
        const vertices = [...this.vertices, ...this.cutVertices];
        const vLength = vertices.length;

        //console.log(maxTriangles, vLength)

        if(maxTriangles===0 || vLength===0 ) return false

        const A = new Vector3(), B = new Vector3(), C = new Vector3()
        const BCNorm = new Vector3()
        const check = new Vector3()
        let checkPoint, dist;


        for ( let i = 0; i < maxTriangles; i++ ) {

            n = i*3;

            check.copy(vertices[0].position)

            A.copy(vertices[triangles[n]].position);
            B.copy(vertices[triangles[n+1]].position);
            C.copy(vertices[triangles[n+2]].position);
            B.sub(A)
            C.sub(A)

            BCNorm.copy(B).cross(C).normalize();

            checkPoint = check.sub(A).dot(BCNorm);

            for ( let j = 0; j < vLength; j++ ) {

                dist = check.copy(vertices[j].position).sub(A).dot(BCNorm);
            
                if((Math.abs(checkPoint) > threshold) && (Math.abs(dist) > threshold) && (checkPoint * dist < 0)) {
                    return false;
                }
            }

        }

        return true;

    }

}
