

uniform float size;
uniform float height;
uniform float resolution;

uniform int enableFog;
uniform vec3 fogColor;
uniform float fogStart;

uniform float repeat;
uniform float ratioUV;
uniform vec3 pos;

uniform sampler2D snow;
uniform sampler2D rock;
uniform sampler2D grass;
uniform sampler2D sand;

varying float H;
varying vec2 guv;
varying vec3 gn;


#define PHYSICAL

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;

#ifndef STANDARD
	uniform float clearCoat;
	uniform float clearCoatRoughness;
#endif

uniform float envMapIntensity; // temporary

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

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
#include <fog_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <lights_pars>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>

	//diffuseColor.r = H;
    //diffuseColor.g = 1.0- H*0.5;
    //if(H<0.1) diffuseColor.b = 1.0;
    //else diffuseColor.b = 0.0;
    
	#include <map_fragment>

    vec2 tuv = guv * vec2( repeat ) + vec2( pos.x * ratioUV, -pos.z * ratioUV );

    

    float mx = gn.x;
    float my = gn.y;//1.0 - H;
    float mz = gn.z;

    //gn.y = H;
    vec3 dirtTX = texture2D(rock,tuv).rgb * mx;//mx;
    vec3 dirtTY = texture2D(rock,tuv).rgb * my;//mx;

    vec3 sandTX = texture2D(sand,tuv).rgb* mz;
    //vec3 dirtTX = texture2D(rock,tuv).rgb * my;//mx;
    vec3 grassTY = texture2D(grass,tuv).rgb * my;
    vec3 grassTZ = texture2D(grass,tuv).rgb * mz;
    vec3 grassCol = texture2D(grass,tuv).rgb * mx + grassTY + grassTZ;
    vec3 dirtCol = dirtTX + texture2D(rock,tuv).rgb * my + texture2D(rock,tuv).rgb * mz;
    //vec3 color = dirtTX + grassTY + grassTZ;
    vec3 color = dirtTX + dirtTY + grassTZ;
    float slope = H;//1.0 - my;
    vec3 cliffCol;
    vec3 sandy;
    
    if (slope < .5) cliffCol = grassCol;
    
    if ((slope<.8) && (slope >= .5)) cliffCol = mix( grassCol , dirtCol, (slope - .5) * (1. / (.8 - .5)));
    if (slope >= .8) cliffCol = dirtCol;

    if (slope < .2) cliffCol = mix( sandTX, grassCol, slope * (1.0/0.2) );

    diffuseColor.xyz =  mapTexelToLinear( vec4(( color + cliffCol )/2.0, 1.0) ).xyz;

    //diffuseColor.xyz =  mapTexelToLinear( vec4(( color  ), 1.0) ).xyz;


    //vec3 sandColor = texture2D( sand , tcX ).rgb * gn.x;

    //vec4 grassColor = texture2D( grass, tuv );

    //grassColor = mapTexelToLinear( grassColor );
   // diffuseColor *= grassColor;
    //diffuseColor.xyz *= sandColor;




	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_flip>
	#include <normal_fragment>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_physical_fragment>
	#include <lights_template>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

	gl_FragColor = vec4( outgoingLight, diffuseColor.a );

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


    //gl_FragColor = vec4( packNormalToRGB( gn ), 1.0 );

}
