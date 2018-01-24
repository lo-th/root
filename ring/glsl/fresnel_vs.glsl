//#define REFRACT_INDEX vec3 (2.407, 2.426, 2.451)
//#define REFRACT_INDEX vec3 (2.40, 2.43, 2.46)


//uniform sampler2D normalMap;
//uniform float mRefractionRatio;
//uniform float mFresnelBias;
//uniform float mFresnelScale;
//uniform float mFresnelPower;

varying vec3 vNormal;
//varying vec3 vPos;
varying vec3 vEye;
varying vec2 vUv;
varying vec3 vI;

void main() {

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

    vNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
    //vNormal = mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal;
    //vPos = worldPosition;
    vEye = cameraPosition;
    vUv = uv;
    vI = worldPosition.xyz - cameraPosition;

    gl_Position = projectionMatrix * mvPosition;

}