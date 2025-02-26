import { Vector2, Vector3 } from "three";



import MeshVertex from "./entities/MeshVertex.js";
import EdgeConstraint from "./entities/EdgeConstraint.js";
import { ConstrainedTriangulator } from "./triangulators/ConstrainedTriangulator.js";




export function test() {

	test_MeshVertex()
	//test_EdgeConstraint()


    //test_triangulate_0()
    //test_triangulate_1()
    //test_triangulate_2()
	//test_triangulate_3()


}

function log( t, a, b ) {

     console.log(t, a, b)

}


function getAdjacentVertex(i, n) {
  if (i + 1 < n) {
    return i + 1;
  } else {
    // If i == n, adjacent vertex is i == 1
    return ((i + 1) % n) + 1;
  }
}


function test_MeshVertex() {

    let vertexA = new MeshVertex(new Vector3(1, 2, 3));
    let vertexB = new MeshVertex(new Vector3(1, 2, 3));
    log("same positions are equal", vertexA.equals(vertexB), true)

    vertexA = new MeshVertex(new Vector3(-1, 2, 3));
    vertexB = new MeshVertex(new Vector3(1, 2, 3));
    log("opposite x positions are not equal", vertexA.equals(vertexB), false)

    vertexA = new MeshVertex(new Vector3(1, 2, 3));
    vertexB = new MeshVertex(new Vector3(2, 2, 3));
    log("different x positions are not equal", vertexA.equals(vertexB), false)

    vertexA = new MeshVertex(new Vector3(1, 2, 3));
    vertexB = new MeshVertex(new Vector3(1, 3, 3));
    log("different y positions are not equal", vertexA.equals(vertexB), false)
    
    vertexA = new MeshVertex(new Vector3(1, 2, 3));
    vertexB = new MeshVertex(new Vector3(1, 2, 4));
    log("different z positions are not equal", vertexA.equals(vertexB), false)

}

function test_EdgeConstraint() {

    let edgeA = new EdgeConstraint(1, 2);
    let edgeB = new EdgeConstraint(1, 2);
    log("indentical edges are equal", edgeA.equals(edgeB), true)

    edgeA = new EdgeConstraint(1, 2);
    edgeB = new EdgeConstraint(3, 2);
    log("different v1 edge are not equal", edgeA.equals(edgeB), false)

    edgeA = new EdgeConstraint(1, 2);
    edgeB = new EdgeConstraint(1, 3);
    log("different v2 edge are not equal", edgeA.equals(edgeB), false)
    
    edgeA = new EdgeConstraint(1, 2);
    edgeB = new EdgeConstraint(2, 1);
    log("edges in opposite directions are equal", edgeA.equals(edgeB), true)

}

function test_triangulate_0() {
	var triangulator = new ConstrainedTriangulator(
      [],
      [],
      new Vector3(1, 0, 0),
    );
    let triangles = triangulator.triangulate();
    log("should handle empty input points and constraints", triangles.length, 0)
}

function test_triangulate_1() {
	let points = [
      new MeshVertex(new Vector3()),
      new MeshVertex(new Vector3(1, 1, 1)),
    ];

    let triangulator = new ConstrainedTriangulator(
      points,
      [],
      new Vector3(1, 0, 0),
    );
    let triangles = triangulator.triangulate();
    log("should not triangulate less than three input points", triangles.length, 0)
}


function test_triangulate_2() {
	for (let n = 3; n <= 20; n++) {
        let points = [];
        // Add an additional center point
        points.push(new MeshVertex(new Vector3(0, 0, 0)));

        for (let i = 0; i < n; i++) {
	        let angle = (i / n) * 2 * Math.PI;
	        points.push(
	            new MeshVertex(new Vector3(Math.cos(angle), Math.sin(angle), 0)),
	        );
        }

        const triangulator = new ConstrainedTriangulator(
	        points,
	        [],
	        new Vector3(0, 0, 1),
	    );
        const triangles = triangulator.triangulate();

         // Verify the triangulation has the correct number of triangles
        log("hould correctly triangulate for n = 3 to n = 20", triangles.length, 3 * n);

        for (let i = 0; i < triangles.length; i += 3) {
	        // Verify each contains the origin point
	        log('Verify each contains the origin point', triangles[i] === 0 || triangles[i + 1] === 0 || triangles[i + 2] === 0, true)
	        

	        // Verify the other two vertices are adjacent and wound clockwise
	        if (triangles[i] === 0) {
	        	log('Verify the other two vertices are adjacent and wound clockwise',triangles[i + 2], getAdjacentVertex(triangles[i + 1], points.length) )
	        } else if (triangles[i + 1] === 0) {
	        	log('Verify the other two vertices are adjacent and wound clockwise',triangles[i], getAdjacentVertex(triangles[i + 2], points.length) )
	          
	        } else if (triangles[i + 2] === 0) {
	        	log('Verify the other two vertices are adjacent and wound clockwise',triangles[i+1], getAdjacentVertex(triangles[i], points.length) )
	          
	        }
        }
    }
}




function test_triangulate_3() {

	const inputPoints = [
      new MeshVertex(new Vector3(0, 0, 0), new Vector3(0, 1, 0), new Vector2()),
      new MeshVertex(new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector2()),
      new MeshVertex(
        new Vector3(0.5, 0, 0.5),
        new Vector3(0, 1, 0),
        new Vector2(),
      ),
      new MeshVertex(new Vector3(0, 0, 1), new Vector3(0, 1, 0), new Vector2()),

      new MeshVertex(new Vector3(2, 0, 0), new Vector3(0, 1, 0), new Vector2()),
      new MeshVertex(new Vector3(2, 0, 1), new Vector3(0, 1, 0), new Vector2()),
      new MeshVertex(new Vector3(1, 0, 1), new Vector3(0, 1, 0), new Vector2()),
      new MeshVertex(
        new Vector3(1.5, 0, 0.5),
        new Vector3(0, 1, 0),
        new Vector2(),
      ),
    ];

    const constraints = [
      new EdgeConstraint(0, 1),
      new EdgeConstraint(1, 2),
      new EdgeConstraint(2, 3),
      new EdgeConstraint(3, 0),
      new EdgeConstraint(4, 5),
      new EdgeConstraint(5, 6),
      new EdgeConstraint(6, 7),
      new EdgeConstraint(7, 4),
    ];

    const triangulator = new ConstrainedTriangulator(
      inputPoints,
      constraints,
      new Vector3(0, -1, 0),
    );
    const triangles = triangulator.triangulate();


    log("should correctly triangulate two separate triangles", triangles.toString(), "7,4,5,7,5,6,2,0,1,3,0,2")




}

/*
function test_triangulate_4() {
	const inputPoints = [
      new MeshVertex(new Vector3(0, 0, 0), new Vector3(0, 1, 0), new Vector2()),
      new MeshVertex(new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector2()),
      new MeshVertex(new Vector3(2, 0, 0), new Vector3(0, 1, 0), new Vector2()),
      new MeshVertex(new Vector3(2, 0, 1), new Vector3(0, 1, 0), new Vector2()),
      new MeshVertex(new Vector3(1, 0, 1), new Vector3(0, 1, 0), new Vector2()),
      new MeshVertex(new Vector3(0, 0, 1), new Vector3(0, 1, 0), new Vector2()),
    ];

    const constraints = [
      new EdgeConstraint(0, 1),
      new EdgeConstraint(1, 5),
      new EdgeConstraint(5, 0),
      new EdgeConstraint(2, 3),
      new EdgeConstraint(3, 4),
      new EdgeConstraint(4, 2),
    ];

    const triangulator = new ConstrainedTriangulator(inputPoints, constraints, new Vector3(0, -1, 0));
    const triangles = triangulator.triangulate();
    log("should correctly triangulate two separate triangles", triangles.toString(), '4,2,3,1,5,0')
}*/