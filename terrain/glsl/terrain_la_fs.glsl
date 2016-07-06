uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
uniform int enableFog;
uniform vec3 fogColor;
uniform float fogStart;
//uniform sampler2D heightmap;

uniform sampler2D grass;

varying vec2 guv;

varying vec3 vLightFront;
varying float H;

#ifdef DOUBLE_SIDED

    varying vec3 vLightBack;

#endif

#include <common>
#include <packing>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_pars_fragment>
#include <bsdfs>
#include <lights_pars>
#include <fog_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

    #include <clipping_planes_fragment>

    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;

    #include <logdepthbuf_fragment>

    diffuseColor.r = H;
    diffuseColor.g = 1.0- H*0.5;
    if(H<0.1) diffuseColor.b = 1.0;
    else diffuseColor.b = 0.0;


    #include <map_fragment>
    #include <color_fragment>

    

    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <emissivemap_fragment>

    // accumulation
    reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );

    #include <lightmap_fragment>

    reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );

    #ifdef DOUBLE_SIDED

        reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;

    #else

        reflectedLight.directDiffuse = vLightFront;

    #endif

    reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();

    // modulation
    #include <aomap_fragment>

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

    #include <normal_flip>
    #include <envmap_fragment>

    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    //gl_FragColor.r = 1.0-H;

    #include <premultiplied_alpha_fragment>
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>

    if( enableFog == 1 ){
        float f_min = fogStart * 0.5;
        float f_max = 0.5;
        float f_r = f_max - f_min;
        vec2 nuv = guv - vec2( 0.5 );
        float f_dist = sqrt(dot(nuv, nuv));
        float ff = 0.0;
        if ( f_dist > f_min ) ff = ( f_dist - f_min ) / f_r;//((f_dist * 2.0) / f_r) - f_min;//((f_dist - f_min) * 2.0) * (f_min/f_max);//f_dist + f_min;//( f_dist - f_min ) * 5.0;
        if ( f_dist > f_max ) ff = 1.0;

        gl_FragColor.xyz = mix( gl_FragColor.xyz, fogColor, ff );

    }



}