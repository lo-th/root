
#ifdef USE_NORMALMAP

vec3 nWallFrequencies = wallFreq - wallsBias;
vec2 nuvn = vec2( 2.0, 4.0 );
vec3 Ntop = texture2D( normalMap, tileUV( fract( oP.xz * nWallFrequencies.xz ) , vec2(1.0,2.0), nuvn ) ).rgb;
vec3 Nleft = texture2D( normalMap, tileUV( fract( oP.zy * nWallFrequencies.zy ) , vec2(1.0,1.0), nuvn ) ).rgb;
vec3 Nfront = texture2D( normalMap, tileUV( fract( oP.xy * nWallFrequencies.xy ) , vec2(0.0,0.0), nuvn ) ).rgb;

float nn = abs(oN.z) > abs(oN.x) ? 1.0 : 0.0;
float nny = abs(oN.y) > ( abs(oN.x) + abs(oN.z) * 0.5 ) ? 1.0 : 0.0;

vec3 tmpNormal =  mix( Nleft, Nfront, nn );
tmpNormal =  mix( tmpNormal, Ntop, nny );
tmpNormal = tmpNormal * 2.0 - 1.0;


vec3 eye_pos = -vViewPosition;
vec3 surf_norm = normal;

vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
vec2 st0 = dFdx( vUv.st );
vec2 st1 = dFdy( vUv.st );

float scale = sign( st1.t * st0.s - st0.t * st1.s ); // we do not care about the magnitude

vec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );
vec3 T = normalize( ( - q0 * st1.s + q1 * st0.s ) * scale );
vec3 N = normalize( surf_norm );
mat3 tsn = mat3( S, T, N );

vec3 mapN = tmpNormal;//texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;

mapN.xy *= normalScale;
mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );

normal = normalize( tsn * mapN );

#endif