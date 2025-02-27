/**
 * Data structure that holds triangulation adjacency data for a quad
 */
export default class Quad {
    //               q3
    //      *---------*---------*
    //       \       / \       /
    //        \ t2L /   \ t2R /
    //         \   /     \   /
    //          \ /   t2  \ /
    //        q1 *---------* q2
    //          / \   t1  / \
    //         /   \     /   \
    //        / t1L \   / t1R \
    //       /       \ /       \
    //      *---------*---------*
    //               q4

    // The indices of the quad vertices q1 q2 q3 q4;
    // The triangles that make up the quad t1 t2;
    // Triangle adjacency data t1L t1R t2L t2R;

    constructor( q1, q2, q3, q4, t1, t2, t1L, t1R, t2L, t2R ) {
        this.q1 = q1;
        this.q2 = q2;
        this.q3 = q3;
        this.q4 = q4;
        this.t1 = t1;
        this.t2 = t2;
        this.t1L = t1L;
        this.t1R = t1R;
        this.t2L = t2L;
        this.t2R = t2R;
    }

    toString() {
        return `T${this.t1}/T${this.t2} (V${this.q1},V${this.q2},V${this.q3},V${this.q4})`;
    }
}
