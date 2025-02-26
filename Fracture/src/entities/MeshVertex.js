import { Vector2, Vector3 } from "three";

/**
 * Data structure containing position/normal/UV data for a single vertex
 */
export default class MeshVertex {

    constructor( position = new Vector3(),  normal = new Vector3(), uv = new Vector2() ) {
        this.position = position;
        this.normal = normal;
        this.uv = uv;
    }

    /**
    * Uses Cantor pairing to hash vertex position into a unique integer
    * @param inverseTolerance The inverse of the tolerance used for spatial hashing
    * @returns
    */

    hash( inverseTolerance = 1e6 ) {

        // Szudzik's Elegant Pairing Function ?? 

        //return MathUtils.generateUUID()
        //return hash3(this.position);
        // Use inverse so we can multiply instead of divide to save a few ops
        const x = Math.floor(this.position.x * inverseTolerance);
        const y = Math.floor(this.position.y * inverseTolerance);
        const z = Math.floor(this.position.z * inverseTolerance);
        const xy = 0.5 * ((x + y) * (x + y + 1)) + y; // Pairing x and y
        //return (0.5 * ((xy + z) * (xy + z + 1))) / 2 + z;
        return 0.5 * ((xy + z) * (xy + z + 1)) + z;
    }

    /**
    * Returns true if this vertex and another vertex share the same position
    * @param other
    * @returns
    */
    equals( other) {
        return this.hash() === other.hash();
    }

    toString() {
        return `Position = ${this.position.x}, ${this.position.y}, ${this.position.z}, Normal = ${this.normal.x}, ${this.normal.y}, ${this.normal.z}, UV = ${this.uv.x}, ${this.uv.y}`;
    }
}
