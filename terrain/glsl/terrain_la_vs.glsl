

uniform float size;
uniform float height;
uniform float resolution;

uniform sampler2D heightmap;

varying float H;

#define LAMBERT

varying vec3 vLightFront;

#ifdef DOUBLE_SIDED

    varying vec3 vLightBack;

#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <bsdfs>
#include <lights_pars>
#include <color_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

vec3 makeNormal( vec2 uv ){

    float eps = 1.0 / resolution;
    float ratio = resolution / size;

    vec3 norm = vec3(0.0);
    norm.x = ( texture2D( heightmap, uv + vec2( - eps, 0 ) ).x - texture2D( heightmap, uv + vec2( eps, 0 ) ).x ) * height * ratio;
    norm.y = 1.0;
    norm.z = ( texture2D( heightmap, uv + vec2( 0, - eps ) ).x - texture2D( heightmap, uv + vec2( 0, eps ) ).x ) * height * ratio;
    return normalize( norm );

}

void main() {

    #include <uv_vertex>
    #include <uv2_vertex>
    #include <color_vertex>

    vec3 objectNormal = vec3( normal );

    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>

    #include <begin_vertex>

    // normal
    transformedNormal = makeNormal( uv );

    // new position
    float heightValue = texture2D( heightmap, uv ).x;
    H = heightValue;
    transformed = vec3( position.x, heightValue*height, position.z );

    
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>

    #include <worldpos_vertex>
    #include <envmap_vertex>

    #include <lights_lambert_vertex>
    #include <shadowmap_vertex>

}