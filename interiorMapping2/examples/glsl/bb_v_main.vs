vec3 transformed = vec3( position );

if(twisted){
	float theta = sin( time + position.y ) / 10.0;
	float c = cos( theta );
	float s = sin( theta );
	mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
	transformed = vec3( position ) * m;
	vNormal = vNormal * m;
}




mat4 modelViewMatrixInverse = InverseMatrix( modelViewMatrix );

// surface position in object space
oP = position;

// position of the eye in object space
oE = modelViewMatrixInverse[3].xyz;

// incident ray direction in object space
oI = oP - oE;

// surface normal
oN = normalize( vec3( normal ) );