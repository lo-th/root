// INTERIOR MAPPING by Joost van Dongen
// http://interiormapping.oogst3d.net/
// email: joost@ronimo-games.com
// Twitter: @JoostDevBlog

vec3 wallFrequencies = wallFreq - wallsBias;

// calculate wall locations
vec3 wallFrame = floor( oP * wallFrequencies);
vec3 walls = ( wallFrame + step( vec3( 0.0 ), oI )) / wallFrequencies;

// how much of the ray is needed to get from the oE to each of the walls
vec3 rayFractions = ( walls - oE ) / oI;

// texture-coordinates of intersections
vec2 uvXY = fract((oE + rayFractions.z * oI).xy * wallFrequencies.xy);
vec2 uvXZ = fract((oE + rayFractions.y * oI).xz * wallFrequencies.xz);
vec2 uvZY = fract((oE + rayFractions.x * oI).zy * wallFrequencies.zy);

vec2 nuv = vec2( 2.0, 4.0 );

// floor / ceiling  

vec4 tmp_color_1 = texture2D( insideMap, tileUV( uvXZ, vec2(1.0,0.0), nuv ) );// floor
vec4 tmp_color_2 = texture2D( insideMap, tileUV( uvXZ, vec2(0.0,0.0), nuv ) );// ceilling
vec4 verticalColour = mix( tmp_color_1, tmp_color_2, step(0.0, oI.y));

tmp_color_1 = texture2D( insideMap, tileUV( uvXY, vec2(0.0,2.0), nuv ) ); // back
tmp_color_2 = texture2D( insideMap, tileUV( uvXY, vec2(1.0,2.0), nuv ) ); // front
vec4 wallXYColour = mix( tmp_color_1, tmp_color_2, step(oI.z, 0.0));

tmp_color_1 = texture2D( insideMap, tileUV( uvZY, vec2(0.0,3.0), nuv ) ); // left
tmp_color_2 = texture2D( insideMap, tileUV( uvZY, vec2(1.0,3.0), nuv ) ); // right
vec4 wallZYColour = mix( tmp_color_1, tmp_color_2, step(oI.x, 0.0) );

// add some noise

vec4 noiseColor = vec4( 0.0 );

if( isNoise ){
	float t = time*0.00000001;
	noiseColor.xyz = vec3( vec3( randomized(wallFrame.xy+t) ) + vec3( randomized(wallFrame.zy) ) + vec3( randomized(wallFrame.xz+t)) ) / 3.0;
	wallXYColour *= noiseColor;
    wallZYColour *= noiseColor;
    verticalColour *= noiseColor;
}

// intersect walls

vec4 insideColor = vec4(0.0);
if( isNoSection ){
	//insideColor = ( wallXYColour + wallZYColour + verticalColour ) / 3.0;
	///insideColor.a = alph;

	insideColor = mix( wallXYColour, wallZYColour, step(wallXYColour.a, wallZYColour.a) );
	insideColor = mix( insideColor, verticalColour, step(insideColor.a, verticalColour.a)  );
	//insideColor = verticalColour;
	//insideColor = mix( insideColor, verticalColour, insideColor.a );

} else {

    float xVSz = step( rayFractions.x, rayFractions.z );
	insideColor = mix( wallXYColour, wallZYColour, xVSz );

	float rayFraction_xVSz = mix( rayFractions.z, rayFractions.x, xVSz );
	float xzVSy = step( rayFraction_xVSz, rayFractions.y );
	insideColor = mix( verticalColour, insideColor, xzVSy );

}



// exterior

vec2 nuvo = vec2( 2.0, 4.0 );// texture reapeat

vec4 Ftop = texture2D( outsideMap, tileUV( fract( oP.xz * wallFrequencies.xz ) , vec2(1.0,2.0), nuv ) );
vec4 Fleft = texture2D( outsideMap, tileUV( fract( oP.zy * wallFrequencies.zy ) , vec2(1.0,1.0), nuv ) );
vec4 Ffront = texture2D( outsideMap, tileUV( fract( oP.xy * wallFrequencies.xy ) , vec2(0.0,0.0), nuv ) );

float n = abs(oN.z) > abs(oN.x) ? 1.0 : 0.0;
float ny = abs(oN.y) > ( abs(oN.x) + abs(oN.z) * 0.5 ) ? 1.0 : 0.0;

vec4 outsideColor =  mix( Fleft, Ffront, n );
outsideColor =  mix( outsideColor, Ftop, ny );


//vec4 building_color = mapTexelToLinear(vec4( mix( insideColor, outsideColor, outsideColor.a ).xyz, 1.0));
vec4 building_color = mapTexelToLinear( mix( insideColor, outsideColor, outsideColor.a ));

//if(building_color.a < 0.01) discard;
diffuseColor *= building_color;

//diffuseColor = insideColor;