#define RGB 0.0039215686274509803921568627451
#define PI_90 1.570796326794896
#define M_PI 3.14159265358979323846
#define TWO_PI 6.28318530717958647692
#define PHASE_TIME 0.1666666666666666667
#define DEG_TO_RAD 0.0174532925199432957

////////////////////////////
//       TWEEN BASE       //
////////////////////////////

// LINEAR
float linear( float k ) { return k; }
// QUAD
float inQuad(float k) { return k * k; }
float outQuad(float k) { return k * ( 2.0 - k );}
float inOutQuad(float k) {
    if ( ( k *= 2.0 ) < 1.0 ) return 0.5 * k * k;
    return - 0.5 * ( --k * ( k - 2.0 ) - 1.0 );
}
// CUBIC
float inCubic(float k) { return k * k * k; }
float outCubic(float k) { return --k * k * k + 1.0; }
float inOutCubic(float k) {
    if ( ( k *= 2.0 ) < 1.0 ) return 0.5 * k * k * k;
    return 0.5 * ( ( k -= 2.0 ) * k * k + 2.0 );
}
// QUART
float inQuart(float k) { return k * k * k * k; }
float outQuart(float k) { return 1.0 - ( --k * k * k * k ); }
float inOutQuart(float k) {
    if ( ( k *= 2.0 ) < 1.0) return 0.5 * k * k * k * k;
    return - 0.5 * ( ( k -= 2.0 ) * k * k * k - 2.0 );
}
// QUINT
float inQuint(float k) { return k * k * k * k * k; }
float outQuint(float k) { return --k * k * k * k * k + 1.0; }
float inOutQuint(float k) {
    if ( ( k *= 2.0 ) < 1.0 ) return 0.5 * k * k * k * k * k;
    return 0.5 * ( ( k -= 2.0 ) * k * k * k * k + 2.0 );
}
// SINE
float inSine(float k) { float j = k * PI_90; return 1.0 - cos( j ); }
float outSine(float k) { float j = k * PI_90; return sin( j ); }
float inOutSine(float k) { float j = k * M_PI; return 0.5 * ( 1.0 - cos( j ) ); }
// EXPO
float inExpo(float k) { return k == 0.0 ? 0.0 : pow( 1024.0, k - 1.0 ); }
float outExpo(float k) { return k == 1.0 ? 1.0 : 1.0 - pow( 2.0, - 10.0 * k ); }
float inOutExpo(float k) {
    if ( k == 0.0 ) return 0.0;
    if ( k == 1.0 ) return 1.0;
    if ( ( k *= 2.0 ) < 1.0 ) return 0.5 * pow( 1024.0, k - 1.0 );
    return 0.5 * ( - pow( 2.0, - 10.0 * ( k - 1.0 ) ) + 2.0 );
}
// CIRC
float inCirc(float k) { return 1.0 - sqrt( 1.0 - k * k ); }
float outCirc(float k) { return sqrt( 1.0 - ( --k * k ) ); }
float inOutCirc(float k) {
    if ( ( k *= 2.0 ) < 1.0) return - 0.5 * ( sqrt( 1.0 - k * k ) - 1.0 );
    return 0.5 * ( sqrt( 1.0 - ( k -= 2.0 ) * k ) + 1.0 );
}
// ELASTIC
float inElastic(float k) {
    float s;
    float a = 0.1;
    float p = 0.4;
    float tpi = TWO_PI;
    if ( k == 0.0 ) return 0.0;
    if ( k == 1.0 ) return 1.0;
    //if ( !a || a < 1.0 ) { a = 1.0; s = p / 4.0; }
    if ( a < 1.0 ) { a = 1.0; s = p / 4.0; }
    else s = p * asin( 1.0 / a ) / tpi;
    return - ( a * pow( 2.0, 10.0 * ( k -= 1.0 ) ) * sin( ( k - s ) * tpi / p ) );
}
float outElastic(float k) {
    float s;
    float a = 0.1; 
    float p = 0.4;
    float tpi = TWO_PI;
    if ( k == 0.0 ) return 0.0;
    if ( k == 1.0 ) return 1.0;
    //if ( !a || a < 1.0 ) { a = 1.0; s = p / 4.0; }
    if ( a < 1.0 ) { a = 1.0; s = p / 4.0; }
    else s = p * asin( 1.0 / a ) / tpi;
    return ( a * pow( 2.0, - 10.0 * k) * sin( ( k - s ) * tpi / p ) + 1.0 );
}
float inOutElastic(float k) {
    float s;
    float a = 0.1;
    float p = 0.4;
    float tpi = TWO_PI;
    if ( k == 0.0 ) return 0.0;
    if ( k == 1.0 ) return 1.0;
    //if ( !a || a < 1.0 ) { a = 1.0; s = p / 4.0; }
    if ( a < 1.0 ) { a = 1.0; s = p / 4.0; }
    else s = p * asin( 1.0 / a ) / tpi;
    if ( ( k *= 2.0 ) < 1.0 ) return - 0.5 * ( a * pow( 2.0, 10.0 * ( k -= 1.0 ) ) * sin( ( k - s ) * tpi / p ) );
    return a * pow( 2.0, -10.0 * ( k -= 1.0 ) ) * sin( ( k - s ) * tpi / p ) * 0.5 + 1.0;
}
// BACK
float inBack(float k) {
    float s = 1.70158;
    return k * k * ( ( s + 1.0 ) * k - s );
}
float outBack(float k) {
  float s = 1.70158;
  return --k * k * ( ( s + 1.0 ) * k + s ) + 1.0;
}
float inOutBack(float k) {
  float s = 1.70158 * 1.525;
  if ( ( k *= 2.0 ) < 1.0 ) return 0.5 * ( k * k * ( ( s + 1.0 ) * k - s ) );
  return 0.5 * ( ( k -= 2.0 ) * k * ( ( s + 1.0 ) * k + s ) + 2.0 );
}
// BOUNCE
float outBounce(float k) {
    if ( k < ( 1.0 / 2.75 ) ) return 7.5625 * k * k;
    else if ( k < ( 2.0 / 2.75 ) ) return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
    else if ( k < ( 2.5 / 2.75 ) ) return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
    else return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
}
float inBounce(float k) { return 1.0 - outBounce( 1.0 - k ); }
float inOutBounce(float k) {
    if ( k < 0.5 ) return inBounce( k * 2.0 ) * 0.5;
    return outBounce( k * 2.0 - 1.0 ) * 0.5 + 0.5;
}






////////////////////////////
//        NOISE 2D        //
////////////////////////////

vec3 mod289(vec3 x){
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x){
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x){
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r){
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t){
   return t*t*t*(t*(t*6.0-15.0)+10.0);
}

vec2 fade2d(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise 2D
float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;  
  g01 *= norm.y;  
  g10 *= norm.z;  
  g11 *= norm.w;  

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade2d(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

//////////////////////////////////

float rand( vec2 co ){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }
float lerp( float a, float b, float p ){ return a + (b - a) * p; }
vec3 posLerp( vec3 p1, vec3 p2, float p ){ return vec3( lerp( p1.x, p2.x, p ), lerp( p1.y, p2.y, p ), lerp( p1.z, p2.z, p ) ); }

vec3 Orbite( vec3 pos, float distance, float phi, float theta, float elapsedTime, float thetaInc, float phyInc ){

    theta *= DEG_TO_RAD;
    phi *= DEG_TO_RAD;

    theta += elapsedTime*thetaInc;
    phi += elapsedTime*phyInc;

    pos.x = distance * sin(phi) * cos(theta);
    pos.y = distance * cos(phi);
    pos.z = distance * sin(phi) * sin(theta);

    return pos;

}

vec3 BigNoise( vec3 pos, float internTime, float bigNoize, float noizeComplexity, float vibration, float vibrationSize ){

    //float x = pos.x + time;
    //float y = pos.y + time;
    //float z = pos.z;

    float dd = internTime * 5.0;//0.005;//10.0;

    vec3 decal = vec3(0.0);
    vec3 np = pos + ( vec3(internTime) * vibrationSize );

    //decal.x = sin( y * 3.0 ) * cos( z * 11.0 ) * dd;
    //decal.y = sin( x * 5.0 ) * cos( z * 13.0 ) * dd;
    //decal.z = sin( x * 7.0 ) * cos( y * 17.0 ) * dd;

    //float x = pos.x + internTime * 5.0;
    //float y = pos.y + internTime * 4.0;
    //float z = pos.z;// + internTime * 4.0;

    //decal.z += sin( y * 3.3 ) * cos( z * 3.7 ) * vibration;// * 4.0;
    //decal.y += sin( x * 3.5 ) * cos( x * 3.5 ) * vibration;// * 4.0;
    //decal.x += sin( x * 3.7 ) * cos( y * 3.3 ) * vibration;// * 4.0;

    decal.z += sin( np.y * 3.3 ) * cos( np.z * 3.7 ) * vibration;// * 4.0;
    decal.y += sin( np.x * 3.5 ) * cos( np.x * 3.5 ) * vibration;// * 4.0;
    decal.x += sin( np.x * 3.7 ) * cos( np.y * 3.3 ) * vibration;// * 4.0;

    float n = cnoise( noizeComplexity * pos.xy + vec2(internTime)) * bigNoize;
    //float n = cnoise( noizeComplexity * np.xy ) * bigNoize;
    //float n = cnoise( noizeComplexity * pos.xy ) * bigNoize;
    //n *= dd;

    pos.x += n; //* perlinIntensity;
    pos.y += n; //* perlinIntensity;
    pos.z += n;
    pos += decal;// * dd;

    return pos;
}

float normAngle(float a){
    return mod(a,TWO_PI);
}

// ANGLE 2D
float anglePP(vec2 v1, vec2 v2){
    vec2 result = v1 - v2;
    float a = M_PI + atan( result.y, result.x );
    return normAngle(a);
}

vec3 impactResult( vec3 pos, vec3 impactPosition, float internTime, float totalTime, float impactForce, float gravity ){

    //float r = rand(pos.xy);//
    float r = 1.0 + cnoise( 0.1 * pos.xy );
    r *= 0.5;

    float rz = cnoise( 0.1 * vec2(pos.y, pos.x) );


    float a = anglePP( impactPosition.xy, pos.xy ) + (rz*PI_90);
    float d = impactForce * (r + 0.3);// * impact;

    vec3 v = vec3( cos(a) * d, sin(a) * d, rz * 50.0 );

    // applique la gravité
    v.y -= gravity * totalTime * 10.0;

    //pos += v * internTime;

    pos += v;

    return pos;
}

//attribute vec4 colors;
attribute vec4 setting;
attribute vec2 pos_uv;
attribute vec3 angle;
attribute float alpha;
attribute float alphaMul;
attribute float lock;
attribute float mapID;

uniform float elapsedTime;
//uniform float deltaTime;
uniform float timeScale;
uniform float time;
uniform float scale;
uniform float size;
uniform float pixelRatio;
uniform float perlinFrequency;
uniform float perlinIntensity;

uniform float textureRatio;

uniform float bigNoize;
uniform float noizeComplexity;
uniform float vibration;
uniform float vibrationSize;

uniform float thetaInc;
uniform float phyInc;


uniform vec3 impactPosition;
uniform float impactForce;
uniform float impactSpeed;
uniform float impact;
uniform float gravity;

uniform float fadeStart;
uniform float expluseTime;
uniform float fadeTime;


//varying vec4 vColor;
varying float vAlpha;
varying vec2 vUv;
varying vec3 pos;
//varying vec3 velocity;
varying float rot;
varying float sizer;

varying float mapid;

varying float time_Orbital;
varying float time_Noizy;
varying float time_Impact;
varying float time_after_Impact;
varying float time_total_Impact;

void main(){

    // intern rotation texture
    float side = 1.0;
    if( angle.y == 0.0 ) side = -1.0;
    rot = angle.x * side;
    rot *= DEG_TO_RAD; 
    rot *= (elapsedTime*0.5) * (angle.z*0.1) ;

    vUv = pos_uv * textureRatio;

    pos = position;
    sizer = size;

    mapid = mapID;
    //velocity = vec3(0.0);

    float t = 5.0;
    float t2 = 0.2;

    if( time < 0.5 ) {
        time_Orbital = 1.0 - ( time * t );
        time_Noizy = 1.0 - ( ( time - t2 ) * t );
    } else {
        time_Orbital = ( time - ( t2 * 4.0 ) ) * t;
        time_Noizy = ( time - ( t2 * 3.0 ) ) * t;
    }

    time_Orbital = time_Orbital < 0.0 ? 0.0 : time_Orbital;
    time_Noizy = time_Noizy < 0.0 ? 0.0 : time_Noizy;
    time_Noizy = time_Noizy > 1.0 ? 1.0 : time_Noizy;

    //vAlpha = alpha * RGB;
    float time_Text = 1.0 - time_Noizy;
    float am = alphaMul * 0.01;
    float baseAlpha = 1.0 * am;
    float newAlpha = 0.0;

    if( lock == 0.0 ){
        vAlpha = baseAlpha;
        // cache les points non voulu
        vAlpha *= (time_Orbital - 0.5);
    } else {
        newAlpha = alpha * RGB;
        newAlpha *= am;

        vAlpha = lerp( newAlpha, baseAlpha, time_Text );
    }

    // animation position

    vec3 pos_Orbital = Orbite( pos, setting.x, setting.y, setting.z, elapsedTime, thetaInc, phyInc );
    vec3 pos_Noisy = BigNoise( pos, time_Noizy, bigNoize, noizeComplexity, vibration, vibrationSize );

    // intern noise

    float move = ( elapsedTime * timeScale );
    vec3 noise = vec3(0.0);

    if(setting.w > 0.5){
        noise.x = cnoise(perlinFrequency * pos.xy - vec2(move, 0.0)) * perlinIntensity;
        noise.y = cnoise(perlinFrequency * pos.xy - vec2(0.0, move)) * perlinIntensity;
    } else {
        noise.x = cnoise(perlinFrequency * pos.xy + vec2(move, 0.0)) * perlinIntensity;
        noise.y = cnoise(perlinFrequency * pos.xy + vec2(0.0, move)) * perlinIntensity;
    }

    time_total_Impact = impact * impactSpeed;

    if( time_total_Impact > 0.0 ){

        time_Impact = time_total_Impact * expluseTime;
        time_Impact = time_Impact > 1.0 ? 1.0 : time_Impact;

        time_after_Impact = (time_total_Impact - fadeStart)*fadeTime;
        time_after_Impact = time_after_Impact < 0.0 ? 0.0 : time_after_Impact;
        time_after_Impact = time_after_Impact > 1.0 ? 1.0 : time_after_Impact;

        vec3 pos_Impact = impactResult( pos, impactPosition, time_Impact, time_total_Impact, impactForce, gravity );
        
        pos = posLerp( pos, pos_Impact, outQuart(time_Impact));

        sizer = lerp( size, 0.1, outQuart(time_after_Impact));

    } else {
        pos = posLerp( pos, pos_Noisy, time_Noizy );
        pos = posLerp( pos, pos_Orbital, time_Orbital );
        pos += noise;
    }



    // final position et taille
    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
    gl_PointSize = pixelRatio * sizer * ( scale / length( mvPosition.xyz ) );
    gl_Position = projectionMatrix * mvPosition;

}