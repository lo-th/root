//uniform sampler2D map;

uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
uniform sampler2D texture4;
uniform sampler2D texture5;
uniform sampler2D texture6;
uniform sampler2D texture7;
uniform sampler2D texture8;
uniform sampler2D texture9;

uniform float textureRatio;

varying float vAlpha;
varying vec2 vUv;
varying float rot;
varying float mapid;

// angle in radian
vec2 rotationUV( vec2 uv, float angle ){
    float s = sin(angle);
    float c = cos(angle);
    mat2 r = mat2( c, -s, s, c);
    r *= 0.5; r += 0.5; r = r * 2.0 - 1.0;
    uv -= 0.5; uv = uv * r; uv += 0.5;
    return uv;
}

void main(){

    
    if ( vAlpha < 0.01 ) discard;
    // with rotation
    //vec2 moveUV = rotationUV(vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ), rot );
    //vec2 vv = ( moveUV * textureRatio )+vUv;

    vec2 vv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y )* textureRatio + vUv;
    vec4 color = vec4( 1.0, 1.0, 1.0, vAlpha );

    // texture switch
    float id = mapid;
    vec4 texture = texture2D( texture0, vv );
    if( id > 0.5 ) texture = texture2D( texture1, vv );
    if( id > 1.5 ) texture = texture2D( texture2, vv );
    if( id > 2.5 ) texture = texture2D( texture3, vv );
    if( id > 3.5 ) texture = texture2D( texture4, vv );
    if( id > 4.5 ) texture = texture2D( texture5, vv );
    if( id > 5.5 ) texture = texture2D( texture6, vv );
    if( id > 6.5 ) texture = texture2D( texture7, vv );
    if( id > 7.5 ) texture = texture2D( texture8, vv );
    if( id > 8.5 ) texture = texture2D( texture9, vv );

    gl_FragColor = color * texture;

    if ( gl_FragColor.a <= 0.001 ) discard;

}