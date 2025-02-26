/**
 * Represents an edge constraint between two vertices in the triangulation
 */
export default class EdgeConstraint {
    /**
    * v1:Index of the first end point of the constraint
    * v2:Index of the second end point of the constraint
    * t1: Index of the triangle prior to the edge crossing (v1 -> v2)
    * t2:Index of the triangle after the edge crossing (v1 -> v2)
    * t1Edge:Index of the edge on the t1 side
    */

    // Creates a new edge constraint with the given end points
    constructor( v1, v2, triangle1, triangle2, edge1 ) {
        this.v1 = v1;
        this.v2 = v2;
        /*this.t1 = triangle1 ?? -1;
        this.t2 = triangle2 ?? -1;
        this.t1Edge = edge1 ?? 0;*/

        this.t1 = triangle1 !== undefined ? triangle1 : -1;
        this.t2 = triangle2 !== undefined ? triangle2 : -1;
        this.t1Edge = edge1 !== undefined ? edge1 : 0;
    }
    // Determines whether the specified object is equal to the current object
    equals(other) {
        return ( (this.v1 === other.v1 && this.v2 === other.v2) || (this.v1 === other.v2 && this.v2 === other.v1) );
    }
    // Returns a string that represents the current object
    toString() {
        return `Edge: T${this.t1}->T${this.t2} (V${this.v1}->V${this.v2})`;
    }

}
