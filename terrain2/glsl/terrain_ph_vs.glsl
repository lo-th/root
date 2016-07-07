uniform float size;
uniform float height;
uniform float resolution;

uniform sampler2D heightmap;
uniform float blur;
uniform float repeat;
uniform float ratioUV;
uniform vec3 pos;

varying float H;
varying vec2 guv;
varying vec3 gn;

#define PHYSICAL

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>


float HH( vec2 p ){

    return texture2D( heightmap, p ).x;// * height;// * ratio;

}

float HH2( vec2 p ){

    //vec4 rr= mapTexelToLinear(vec4(0.0));

    //return abs(texture2D( heightmap, p ).x);// * height;// * ratio;
    return texture2D( heightmap, p ).x;

}

vec3 makeNormal0( vec2 uv ){

    //float ratio = resolution / size;
    float eps = 1.0 / resolution;
    
    vec3 norm = vec3(0.0);

    vec3 off = vec3(eps, 0.0, eps);
    float hL = HH(uv - off.xy );
    float hR = HH(uv + off.xy );
    float hD = HH(uv - off.yz );
    float hU = HH(uv + off.yz );

    // deduce terrain normal
    norm.x = (hL - hR);
    norm.y = (hD - hU);
    norm.z = 1.0 / (height+0.0001);

    return normalize( norm );

}

vec3 makeNormal1( vec2 uv ){

    float eps = 1.0 / resolution;
    vec3 norm = vec3(0.0);

    norm.x = -( texture2D( heightmap, uv + vec2( - eps, 0 ) ).x - texture2D( heightmap, uv + vec2( eps, 0 ) ).x );// * height;// * ratio;
    norm.y = 1.0 / height;
    norm.z = -( texture2D( heightmap, uv + vec2( 0, - eps ) ).x - texture2D( heightmap, uv + vec2( 0, eps ) ).x );// * height;// * ratio;

    return normalize( norm );

}

vec3 makeNormal2( vec2 uv ){

    float ts =  1.0 / resolution;
    float normalStrength = 8.0;

    float tl = HH2( uv + ts * vec2(-1, -1) );   // top left
    float  l = HH2( uv + ts * vec2(-1,  0) );   // left
    float bl = HH2( uv + ts * vec2(-1,  1) );   // bottom left
    float  t = HH2( uv + ts * vec2( 0, -1) );   // top
    float  b = HH2( uv + ts * vec2( 0,  1) );   // bottom
    float tr = HH2( uv + ts * vec2( 1, -1) );   // top right
    float  r = HH2( uv + ts * vec2( 1,  0) );   // right
    float br = HH2( uv + ts * vec2( 1,  1) );  // bottom right

    float dX = tr + 2.0*r + br -tl - 2.0*l - bl;
    float dY = bl + 2.0*b + br -tl - 2.0*t - tr;

    return normalize( vec3( dX, dY, 1.0 / height ) );

}

vec4 blurred(sampler2D map, vec2 UV, vec2 blur){

    vec4 sum = vec4(0.0);
    sum += texture2D(map, vec2(UV.x - 4.0 * blur.x, UV.y - 4.0 * blur.y)) * 0.05;
    sum += texture2D(map, vec2(UV.x - 3.0 * blur.x, UV.y - 3.0 * blur.y)) * 0.09;
    sum += texture2D(map, vec2(UV.x - 2.0 * blur.x, UV.y - 2.0 * blur.y)) * 0.12;
    sum += texture2D(map, vec2(UV.x - blur.x, UV.y - blur.y)) * 0.15;
    sum += texture2D(map, vec2(UV.x, UV.y)) * 0.16;
    sum += texture2D(map, vec2(UV.x + blur.x, UV.y + blur.y)) * 0.15;
    sum += texture2D(map, vec2(UV.x + 2.0 * blur.x, UV.y + 2.0 * blur.y)) * 0.12;
    sum += texture2D(map, vec2(UV.x + 3.0 * blur.x, UV.y + 3.0 * blur.y)) * 0.09;
    sum += texture2D(map, vec2(UV.x + 4.0 * blur.x, UV.y + 4.0 * blur.y)) * 0.05;
    return sum;

}

void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>

    //objectNormal = makeNormal( uv );

	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

	//transformedNormal = normalMatrix * makeNormal( uv );
    transformedNormal = makeNormal0( uv );

    gn = transformedNormal;

#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

	vNormal = normalize( transformedNormal );

#endif


	#include <begin_vertex>

	// new position
    float heightValue = texture2D( heightmap, uv ).x;
    //float heightValue = blurred( heightmap, uv, vec2( blur / resolution ) ).x;
    transformed = vec3( position.x, heightValue * height, position.z );

    H = heightValue;
    guv = uv;
    
	#include <displacementmap_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <shadowmap_vertex>

}
