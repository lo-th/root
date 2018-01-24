#define RAY_LENGTH_MAX 20.0
#define RAY_BOUNCE_MAX 10
#define RAY_STEP_MAX 40
#define COLOR vec3 (0.8, 0.8, 0.9)
#define ALPHA 0.9
#define REFRACT_INDEX vec3 (2.407, 2.426, 2.451)
#define LIGHT vec3 (1.0, 1.0, -1.0)
#define AMBIENT 0.2
#define SPECULAR_POWER 3.0
#define SPECULAR_INTENSITY 0.5
#define DELTA 0.001
#define PI 3.14159265359



uniform samplerCube tCube;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;
varying vec4 vNormal;
varying vec3 vPosition;

vec3 lightDirection = vec3(0.0,1.0,0.0);

float raycast(in vec3 origin, in vec3 direction, in vec4 normal, in float color, in vec3 channel) {
    color *= 1.0 - ALPHA;
    float intensity = ALPHA;
    float distanceFactor = 1.0;
    float refractIndex = dot(REFRACT_INDEX, channel);
    for (int rayBounce = 1; rayBounce < RAY_BOUNCE_MAX; ++rayBounce) {

        vec3 refraction = refract(direction, normal.xyz, distanceFactor > 0.0 ? 1.0 / refractIndex : refractIndex);
        if (dot(refraction, refraction) < DELTA) 
        {
            direction = reflect(direction, normal.xyz);
            origin += direction * DELTA * 2.0;
        } else {
            direction = refraction;
            distanceFactor = -distanceFactor;
        }
        float dist = RAY_LENGTH_MAX;
        for (int rayStep = 0; rayStep < RAY_STEP_MAX; ++rayStep) {

            dist = distanceFactor;// * getDistance(origin);
            float distMin = max(dist, DELTA);
            normal.w += distMin;
            if (dist < 0.0 || normal.w > RAY_LENGTH_MAX) break;
             origin += direction * distMin;
        }
        if (dist >= 0.0) break;
        
        normal.xyz = distanceFactor * normal.xyz;//getNormal(origin);
        if (distanceFactor > 0.0) {
            float relfectionDiffuse = max(0.0, dot(normal.xyz, lightDirection));
            float relfectionSpecular = pow(max(0.0, dot(reflect(direction, normal.xyz), lightDirection)), SPECULAR_POWER) * SPECULAR_INTENSITY;
            float localColor = (AMBIENT + relfectionDiffuse) * dot(COLOR, channel) + relfectionSpecular;
            color += localColor * (1.0 - ALPHA) * intensity;
            intensity *= ALPHA;
        }
    }
    float backColor = 1.0;//dot(textureCube(tCube, direction).rgb, channel);
    return color + backColor * intensity;
}


void main() {

    vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
    vec4 refractedColor = vec4( 1.0 );

    refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;
    refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;
    refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;

    refractedColor.a = 0.7;
    reflectedColor.a = 0.7;

    gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );

}