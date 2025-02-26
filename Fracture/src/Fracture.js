import { Vector3, Vector2 } from "three";
import { Fragment } from "./entities/Fragment.js";
import { UnionFind } from "./utils/UnionFind.js";
import { Slice } from "./Slice.js";
import { test } from "./test.js";
import { rand } from "./utils/MathUtils.js";
let tmpNormal = [];

export const option = {
    fragmentCount : 50,
    fracturePlanes : { x: true, y: true, z: true },
    fractureMode : "Convex", // "Non-Convex" or "Convex"
    textureScale : new Vector2(1, 1),
    textureOffset : new Vector2(),
}

/**
 * Fractures the mesh into multiple fragments
 * @param mesh The source mesh to fracture
 * @param options Options for fracturing
 */
export function Fracture( mesh, options ) {

    //test()

    tmpNormal = []

    const o = { ...option, ...options };

    // We begin by fragmenting the source mesh, then process each fragment in a FIFO queue
    // until we achieve the target fragment count.
    let fragments = [Fragment.fromGeometry(mesh.geometry)];
    let mode = o.fractureMode === "Convex" ? true:false;

      // Subdivide the mesh into multiple fragments until we reach the fragment limit
    while (fragments.length < o.fragmentCount) {

        const fragment = fragments.shift();
        //const fragment = fragments.shift()!;
        //if ( fragment===undefined || fragment===null ) continue;
        if (!fragment) continue;

        //fragment?.calculateBounds();
        fragment.calculateBounds();


        // Select an arbitrary fracture plane normal
        let normal = new Vector3(
            o.fracturePlanes.x ? 2.0 * Math.random() - 1 : 0,
            o.fracturePlanes.y ? 2.0 * Math.random() - 1 : 0,
            o.fracturePlanes.z ? 2.0 * Math.random() - 1 : 0,
        ).normalize();
        
        let center = new Vector3();
        fragment.bounds.getCenter(center);

        let size = fragment.size;
        size.multiplyScalar(0.01)



        
        //let size = new Vector3();
        //fragment.bounds.getSize(size);
        //console.log(size)

        center.add(new Vector3(rand(-size.x,size.x), rand(-size.y,size.y), rand(-size.z,size.z)))


        //center.add(new Vector3(Math.random()*0.0001, Math.random()*0.0001, -Math.random()*0.0001))

        // autotype is buggy ?? 
        //mode = fragment.convex;
        // console.log(mode)

        if ( mode ) {
            const { topSlice, bottomSlice } = Slice( fragment, normal, center, o.textureScale, o.textureOffset, true );

            fragments.push(topSlice);
            fragments.push(bottomSlice);

        } else {

            const { topSlice, bottomSlice } = Slice( fragment, normal, center, o.textureScale, o.textureOffset, false );

            const topfragments = findIsolatedGeometry(topSlice);
            const bottomfragments = findIsolatedGeometry(bottomSlice);


            // Check both slices for isolated fragments
            fragments.push(...topfragments);
            fragments.push(...bottomfragments);
        }
    }

    return fragments;

}

export function FragmentsToMesh( fragments, parent, internMaterial ) {

    const meshs = []
    fragments.map((fragment, index) => {
        meshs.push( fragment.toMesh( parent, internMaterial ) )
    })
    return meshs;

}

/**
 * Uses the union-find algorithm to find isolated groups of geometry
 * within a fragment that are not connected together. These groups
 * are identified and split into separate fragments.
 * @returns An array of fragments
 */
function findIsolatedGeometry( fragment ) {

    // Initialize the union-find data structure
    const uf = new UnionFind( fragment.vertexCount );
    // Triangles for each submesh are stored separately
    const rootTriangles = {};

    const N = fragment.vertices.length;
    const M = fragment.cutVertices.length;

    const adjacencyMap = new Map();

    // Hash each vertex based on its position. If a vertex already exists
    // at that location, union this vertex with the existing vertex so they are
    // included in the same geometry group.
    fragment.vertices.forEach((vertex, index) => {
        const key = vertex.hash();
        const existingIndex = adjacencyMap.get(key);
        if (existingIndex === undefined) {
            adjacencyMap.set(key, index);
        } else {
            uf.union(existingIndex, index);
        }
    });

    // First, union each cut-face vertex with its coincident non-cut-face vertex
    // The union is performed so no cut-face vertex can be a root.
    for (let i = 0; i < M; i++) {
        uf.union(fragment.vertexAdjacency[i], i + N);
    }

    // Group vertices by analyzing which vertices are connected via triangles
    // Analyze the triangles of each submesh separately
    const indices = fragment.triangles;
    for (let submeshIndex = 0; submeshIndex < indices.length; submeshIndex++) {
        for (let i = 0; i < indices[submeshIndex].length; i += 3) {
            const a = indices[submeshIndex][i];
            const b = indices[submeshIndex][i + 1];
            const c = indices[submeshIndex][i + 2];
            uf.union(a, b);
            uf.union(b, c);

            // Store triangles by root representative
            const root = uf.find(a);
            if (!rootTriangles[root]) {
                rootTriangles[root] = [[], []];
            }

            rootTriangles[root][submeshIndex].push(a, b, c);
        }
    }

    // New fragments created from geometry, mapped by root index
    const rootFragments = {};
    const vertexMap = Array(fragment.vertexCount);

    // Iterate over each vertex and add it to correct mesh
    for (let i = 0; i < N; i++) {
        const root = uf.find(i);

        // If there is no fragment for this root yet, create it
        if (!rootFragments[root]) {
            rootFragments[root] = new Fragment();
        }

        rootFragments[root].vertices.push(fragment.vertices[i]);
        vertexMap[i] = rootFragments[root].vertices.length - 1;
    }

    // Do the same for the cut-face vertices
    for (let i = 0; i < M; i++) {
        const root = uf.find(i + N);
        rootFragments[root].cutVertices.push(fragment.cutVertices[i]);
        vertexMap[i + N] =
          rootFragments[root].vertices.length +
          rootFragments[root].cutVertices.length -
          1;
    }

    // Iterate over triangles and add to the correct mesh
    for (const key of Object.keys(rootTriangles)) {

        let i = Number(key);

        // Minor optimization here:
        // Access the parent directly rather than using find() since the paths
        // for all indices have been compressed in the last two for loops
        let root = uf.parent[i];

        for (let submeshIndex = 0; submeshIndex < fragment.triangles.length; submeshIndex++ ) {
            for (const vertexIndex of rootTriangles[i][submeshIndex]) {
                const mappedIndex = vertexMap[vertexIndex];
                rootFragments[root].triangles[submeshIndex].push(mappedIndex);
            }
        }
    }

    return Object.values(rootFragments);
    
}






function equals( a, v, epsilon = Number.EPSILON ) {

    return ( ( Math.abs( v.x - a.x ) < epsilon ) && ( Math.abs( v.y - a.y ) < epsilon ) && ( Math.abs( v.z - a.z ) < epsilon ) );

}

function unicNormal() {
    
    let n = new Vector3().randomDirection().normalize();
    let tooNear = false;

    let i = tmpNormal.length;
    while(i--){

        if( equals(n, tmpNormal[i])){ tooNear = true; }
        if(tooNear) break
    }

    if(tooNear) return unicNormal()
    else{
        tmpNormal.push(n)
        return n;
    }

}

export { Slice } from './Slice.js';