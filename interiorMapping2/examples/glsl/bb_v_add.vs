mat4 InverseMatrix( mat4 A ) {

	float s0 = A[0][0] * A[1][1] - A[1][0] * A[0][1];
	float s1 = A[0][0] * A[1][2] - A[1][0] * A[0][2];
	float s2 = A[0][0] * A[1][3] - A[1][0] * A[0][3];
	float s3 = A[0][1] * A[1][2] - A[1][1] * A[0][2];
	float s4 = A[0][1] * A[1][3] - A[1][1] * A[0][3];
	float s5 = A[0][2] * A[1][3] - A[1][2] * A[0][3];
 
	float c5 = A[2][2] * A[3][3] - A[3][2] * A[2][3];
	float c4 = A[2][1] * A[3][3] - A[3][1] * A[2][3];
	float c3 = A[2][1] * A[3][2] - A[3][1] * A[2][2];
	float c2 = A[2][0] * A[3][3] - A[3][0] * A[2][3];
	float c1 = A[2][0] * A[3][2] - A[3][0] * A[2][2];
	float c0 = A[2][0] * A[3][1] - A[3][0] * A[2][1];
 
	float invdet = 1.0 / (s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0);
 
	mat4 B;
 
	B[0][0] = ( A[1][1] * c5 - A[1][2] * c4 + A[1][3] * c3) * invdet;
	B[0][1] = (-A[0][1] * c5 + A[0][2] * c4 - A[0][3] * c3) * invdet;
	B[0][2] = ( A[3][1] * s5 - A[3][2] * s4 + A[3][3] * s3) * invdet;
	B[0][3] = (-A[2][1] * s5 + A[2][2] * s4 - A[2][3] * s3) * invdet;
 
	B[1][0] = (-A[1][0] * c5 + A[1][2] * c2 - A[1][3] * c1) * invdet;
	B[1][1] = ( A[0][0] * c5 - A[0][2] * c2 + A[0][3] * c1) * invdet;
	B[1][2] = (-A[3][0] * s5 + A[3][2] * s2 - A[3][3] * s1) * invdet;
	B[1][3] = ( A[2][0] * s5 - A[2][2] * s2 + A[2][3] * s1) * invdet;
 
	B[2][0] = ( A[1][0] * c4 - A[1][1] * c2 + A[1][3] * c0) * invdet;
	B[2][1] = (-A[0][0] * c4 + A[0][1] * c2 - A[0][3] * c0) * invdet;
	B[2][2] = ( A[3][0] * s4 - A[3][1] * s2 + A[3][3] * s0) * invdet;
	B[2][3] = (-A[2][0] * s4 + A[2][1] * s2 - A[2][3] * s0) * invdet;
 
	B[3][0] = (-A[1][0] * c3 + A[1][1] * c1 - A[1][2] * c0) * invdet;
	B[3][1] = ( A[0][0] * c3 - A[0][1] * c1 + A[0][2] * c0) * invdet;
	B[3][2] = (-A[3][0] * s3 + A[3][1] * s1 - A[3][2] * s0) * invdet;
	B[3][3] = ( A[2][0] * s3 - A[2][1] * s1 + A[2][2] * s0) * invdet;
 
	return B;
	
}

varying vec3 oP; // surface position in object space
varying vec3 oE; // position of the eye in object space
varying vec3 oI; // incident ray direction in object space
varying vec3 oN; // surface normal

uniform float time;
uniform bool twisted;