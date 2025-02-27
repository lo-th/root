import { Vector2, Vector3, Plane, Line3 } from "three";

const _plane = /*@__PURE__*/ new Plane();
const _vector1 = /*@__PURE__*/ new Vector3();
//export const Tolerance = 1e6;
//export const Tolerance = 1e6;
export const Tolerance = 1e6;
/**
 * Returns true if the quad specified by the two diagonals a1->a2 and b1->b2 is convex
 * Quad is convex if a1->a2 and b1->b2 intersect each other
 * @param a1 Start point of diagonal A
 * @param a2 End point of diagonal A
 * @param b1 Start point of diagonal B
 * @param b2 End point of diagonal B
 * @returns
 */
export function isQuadConvex( a1, a2, b1, b2 ) {
    return linesIntersectInternal(a1, a2, b1, b2, true);
}

/**
 * Returns true if lines a1->a2 and b1->b2 intersect.
 * @param a1 Start point of line A
 * @param a2 End point of line A
 * @param b1 Start point of line B
 * @param b2 End point of line B
 * @returns
 */
export function linesIntersect( a1, a2, b1, b2 ) {
    return linesIntersectInternal(a1, a2, b1, b2, false);
}

/**
 * Returns true lines a1->a2 and b1->b2 is intersect
 * @param a1 Start point of line A
 * @param a2 End point of line A
 * @param b1 Start point of line B
 * @param b2 End point of line B
 * @param includeSharedEndpoints If set to true, intersection test returns true if lines share endpoints
 * @returns True if the two lines are intersecting
 */
function linesIntersectInternal( a1, a2, b1, b2, includeSharedEndpoints ) {

    let a12 = { x: a2.x - a1.x, y: a2.y - a1.y };
    let b12 = { x: b2.x - b1.x, y: b2.y - b1.y };

    // If any of the vertices are shared between the two diagonals,
    // the quad collapses into a triangle and is convex by default.
    const hashA1 = hash2(a1);
    const hashB1 = hash2(b1);

    // Return ASAP  to avoid computing other hashes
    if (hashA1 === hashB1) return includeSharedEndpoints;

    const hashA2 = hash2(a2);

    if (hashA2 === hashB1) return includeSharedEndpoints;

    const hashB2 = hash2(b2);

    if (hashA1 === hashB2) return includeSharedEndpoints;
    if (hashA2 === hashB2) return includeSharedEndpoints;

    // Compute cross product between each point and the opposite diagonal
    // Look at sign of the Z component to see which side of line point is on
    let a1xb = (a1.x - b1.x) * b12.y - (a1.y - b1.y) * b12.x;
    let a2xb = (a2.x - b1.x) * b12.y - (a2.y - b1.y) * b12.x;
    let b1xa = (b1.x - a1.x) * a12.y - (b1.y - a1.y) * a12.x;
    let b2xa = (b2.x - a1.x) * a12.y - (b2.y - a1.y) * a12.x;

    // Check that the points for each diagonal lie on opposite sides of the other
    // diagonal. Quad is also convex if a1/a2 lie on b1->b2 (and vice versa) since
    // the shape collapses into a triangle (hence >= instead of >)
    const intersecting =
       ((a1xb >= 0 && a2xb <= 0) || (a1xb <= 0 && a2xb >= 0)) &&
       ((b1xa >= 0 && b2xa <= 0) || (b1xa <= 0 && b2xa >= 0));

    return intersecting;
}

/**
 * Determines the intersection between the line segment a->b and the plane defined by the specified normal and point.
 * Returns an object containing a boolean indicating if an intersection exists,
 * and the intersection point and 's' value if it does.
 * @param a Start point of the line
 * @param b End point of the line
 * @param n Plane normal
 * @param p0 Plane origin
 * @returns Returns an object containing the intersection point `x` and the parameterization of `s`
 * where x = a + (b - a) * s. If no intersection exist, returns null
 */

 export function linePlaneIntersection0( a, b, n, p0 ) {
    
    let s = 0;
    let x = new Vector3();

    if (hash3(a) === hash3(b) || (n.x === 0 && n.y === 0 && n.z === 0)) {
        return null;
    }

    // Parameterization of the intersection where x = a + (b - a) * s
    s =
        ((p0.x - a.x) * n.x + (p0.y - a.y) * n.y + (p0.z - a.z) * n.z) /
        ((b.x - a.x) * n.x + (b.y - a.y) * n.y + (b.z - a.z) * n.z);

    /*if (s >= 0 && s <= 1) {
        x = new Vector3( a.x + (b.x - a.x) * s, a.y + (b.y - a.y) * s, a.z + (b.z - a.z) * s );
        return { x:x, s:s };
    } else {
        return null;
    }*/

    if ( s < 0 || s > 1 ) return null;
    x = new Vector3( a.x + (b.x - a.x) * s, a.y + (b.y - a.y) * s, a.z + (b.z - a.z) * s );
    return { x:x, s:s };
}

export function linePlaneIntersection( a, b, n, o ) {

    let line = new Line3(a,b);
    //let plane = new Plane( n );
    let target = new Vector3();

    //console.log('determ', o.dot( n ))

    _plane.set( n, 0 ).translate( o );

    const direction = line.delta( _vector1 );

    let denominator = _plane.normal.dot( direction );



    if ( denominator === 0 ) {
//console.log(denominator)
        // line is coplanar, return origin
        if ( _plane.distanceToPoint( line.start ) === 0 ) return { x:target.copy( line.start ), s:0 };

        // Unsure if this is the correct method to handle this case.
        return null;

    }

    const t = - ( line.start.dot( _plane.normal ) + _plane.constant ) / denominator;

    if ( t < 0 || t > 1 ) return null;
    return { x:target.copy( line.start ).addScaledVector( direction, t ), s:t };

}

/**
 * Returns true if the point `p` is on the left side of the directed line segment `i` -> `j`.
 * Useful for checking if a point is inside of a triangle defined in a CCW manner.
 * @param p Index of test point in `points` array
 * @param i Index of first vertex of the edge in the `points` array
 * @param j Index of second vertex of the edge in the `points` array
 * @returns True if the point `p` is on the left side of the line `i`->`j`
 */
export function isPointOnRightSideOfLine( p, i, j ) {
    // The <= is essential; if it is <, the whole thing falls apart
    return (i.x - p.x) * (j.y - p.y) - (i.y - p.y) * (j.x - p.x) <= 0 ? true : false;
}



/**
 * Calculates hash value of Vector2 using Cantor pairing
 */
export function hash2( v, tolerance = Tolerance ) {
    // Multiply by the inverse of the tolerance to avoid division
    const x = Math.floor(v.x * tolerance);
    const y = Math.floor(v.y * tolerance);
    return 0.5 * ((x + y) * (x + y + 1)) + y; // Pairing x and y
}

/**
 * Returns true if p1 and p2 are effectively equal.
 */
export function hash3(v, tolerance = Tolerance ) {
    // Multiply by the inverse of the tolerance to avoid division
    const x = Math.floor(v.x * tolerance);
    const y = Math.floor(v.y * tolerance);
    const z = Math.floor(v.z * tolerance);
    const xy = 0.5 * ((x + y) * (x + y + 1)) + y;
    return 0.5 * ((xy + z) * (xy + z + 1)) + z;
}


/*export function hash2( v, decal = 1000 ) {

    const x = extractAsInt(v.x+decal);
    const y = extractAsInt(v.y+decal);
    let hash = x;
    hash = (hash * 397) ^ y;
    return hash;
}
export function extractAsInt (value) {
    return parseInt(value.toString().replace(/\W/g, ""));
}
export function hash3( v, decal = 1000 ) {

    const x = extractAsInt(v.x+decal);
    const y = extractAsInt(v.y+decal);
    const z = extractAsInt(v.z+decal);
    let hash = x;
    hash = (hash * 397) ^ y;
    hash = (hash * 397) ^ z;
    return hash;
}*/

/**
 * Returns true if the point is either on or above the plane. "Above" is the side of the place in the direction of the normal.
 * @param p The test point
 * @param n The plane normal
 * @param o The plane origin
 * @returns
 */
export function isPointAbovePlane( p, n, o ) {
    return n.x * (p.x - o.x) + n.y * (p.y - o.y) + n.z * (p.z - o.z) < 0 ? false : true;
}

export function isPointAbovePlaneTest( p, n, o ) {
    let d = _plane.set( n, 0 ).translate( o ).distanceToPoint(p)
    
    return d >= 0 ? true : false;
}

export function rand ( low = 0, high = 1 ) { return low + Math.random() * ( high - low ) }

// debug

export function timeStart( name ) { return console.time(name) }
export function timeEnd( name ) { return console.timeEnd(name) }
