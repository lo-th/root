//#define RAY_LENGTH_MAX 20.0
//#define RAY_BOUNCE_MAX 10
//#define RAY_STEP_MAX 40
//#define COLOR vec3 (0.8, 0.8, 0.9)
//#define ALPHA 0.9
#define REFRACT_INDEX vec3 (2.407, 2.426, 2.451)
//#define REFRACT_INDEX vec3 (1.407, 1.426, 1.451)
//#define LIGHT vec3 (1.0, 1.0, -1.0)
//#define AMBIENT 0.2
//#define SPECULAR_POWER 3.0
//#define SPECULAR_INTENSITY 0.5
//#define DELTA 0.001
//#define PI 3.14159265359

uniform float aR;
uniform float aF;

uniform samplerCube envMap;
uniform float mRefractionRatio;
uniform float mFresnelBias;
uniform float mFresnelScale;
uniform float mFresnelPower;

//varying vec3 vReflect[1];
//varying vec3 vRefract[3];
//varying float vReflectionFactor;
varying vec3 vNormal;
varying vec3 vEye;
varying vec2 vUv;
varying vec3 vI;

vec3 lightDirection = vec3(0.0,1.0,0.0);

vec4 lerpV3( vec4 a, vec4 b, float p ){
    //vec4 T = vec4(0.0); 
    return a + (b - a) * p; 
}



void main() {

    vec4 color = vec4( 1.0,1.0,1.0, 1.0 );

    vec3 N2 = vNormal;
    vec3 I = vI;

   //vec3 N = normalize( mat3( matrix[0].xyz, matrix[1].xyz, matrix[2].xyz ) * texture2D(normalMap, vUv).xyz );//texture2D(normalMap, vUv).xyz;

    //vec3 N = perturbNormal2Arb( -vEye, N2);//texture2D(normalMap, vUv).xyz );
    //vec3 vReflect[1];
    //vec3 vRefract[3];
    //float vReflectionFactor;

    vec3 vReflect = reflect( I, N2 );

    ///vec3 vRefractR = refract( normalize( I ), N2, REFRACT_INDEX.x );
    //vec3 vRefractG = refract( normalize( I ), N2, REFRACT_INDEX.y );
    //vec3 vRefractB = refract( normalize( I ), N2, REFRACT_INDEX.z );

    vec3 vRefractR = refract( normalize( I ), N2, mRefractionRatio );
    vec3 vRefractG = refract( normalize( I ), N2, mRefractionRatio * 0.99 );
    vec3 vRefractB = refract( normalize( I ), N2, mRefractionRatio * 0.98 );

    //vRefractR *= refract( normalize( I ), N2, REFRACT_INDEX.x );
    //vRefractG *= refract( normalize( I ), N2, REFRACT_INDEX.y );
    //vRefractB *= refract( normalize( I ), N2, REFRACT_INDEX.z );

    float vReflectionFactor = mFresnelBias + mFresnelScale * pow( (1.0 + dot( normalize( I ), N2 )), mFresnelPower );


    vec4 reflectedColor = vec4( 1.0 );
    reflectedColor.rgb = textureCube( envMap, vec3( -vReflect.x, vReflect.yz ) ).rgb;
    //reflectedColor *= textureCube( envMap, vec3( -vReflect[1].x, vReflect[1].yz ) );
    //reflectedColor *= textureCube( envMap, vec3( -vReflect[2].x, vReflect[2].yz ) );

    vec4 refractedColor = vec4( 1.0 );
    refractedColor.r = textureCube( envMap, vec3( -vRefractR.x, vRefractR.yz ) ).r;
    refractedColor.g = textureCube( envMap, vec3( -vRefractG.x, vRefractG.yz ) ).g;
    refractedColor.b = textureCube( envMap, vec3( -vRefractB.x, vRefractB.yz ) ).b;

    refractedColor.xyz *= 1.0;
    reflectedColor.xyz *= 1.0;




    refractedColor.a = aF;
    reflectedColor.a = aR;

    vec4 finalColor = mix( refractedColor , reflectedColor , clamp( vReflectionFactor, 0.0, 1.0 ) );

    //float finalAlpha = refractedColor.a;

    
    //vec4 finalColor = mix( refractedColor , reflectedColor , clamp( vReflectionFactor, 0.0, 1.0 ) );

    gl_FragColor = vec4(color.rgb * finalColor.rgb, finalColor.a );

    //gl_FragColor *= texture2D(normalMap, vUv);

    //
    //gl_FragColor = 2.0 * Color * pow( lerpV3( Color * refractedColor * 5.0, reflectedColor * 2.0, vReflectionFactor).xyz, 1.8);

}