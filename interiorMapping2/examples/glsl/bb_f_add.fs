float randomized( vec2 co ){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 tileUV( vec2 uv, vec2 pos, vec2 ntile ){

	pos.y = ntile.y-pos.y-1.0;
	vec2 div = 1.0/ntile;

	vec2 v = vec2(uv*div)+(pos*div);
	
	return v;
}

varying vec3 oP; // surface position in object space
varying vec3 oE; // position of the eye in object space
varying vec3 oI; // incident ray direction in object space
varying vec3 oN; // surface normal

uniform vec3 wallFreq;
uniform float wallsBias;

uniform sampler2D insideMap;
uniform sampler2D outsideMap;

uniform float time;
