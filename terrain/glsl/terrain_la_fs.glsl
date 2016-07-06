uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
//uniform sampler2D heightmap;

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
    #include <map_fragment>
    #include <color_fragment>

    diffuseColor.r = H;
    diffuseColor.g = 1.0- H*0.5;
    if(H<0.1) diffuseColor.b = 1.0;
    else diffuseColor.b = 0.0;

   // diffuseColor.r = pow( abs(diffuseColor.r), 1.0/2.2 );
   // diffuseColor.g = pow( abs(diffuseColor.g), 1.0/2.2 );
   // diffuseColor.b = pow( abs(diffuseColor.b), 1.0/2.2 );


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

}