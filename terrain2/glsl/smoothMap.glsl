uniform sampler2D texture;
uniform float blur;
uniform float resolution;

vec4 blurred( sampler2D map, vec2 UV, vec2 blur ){

    vec4 sum = vec4(0.0);
    sum += texture2D(map, vec2(UV.x - 4.0 * blur.x, UV.y - 4.0 * blur.y)) * 0.05;
    sum += texture2D(map, vec2(UV.x - 3.0 * blur.x, UV.y - 3.0 * blur.y)) * 0.09;
    sum += texture2D(map, vec2(UV.x - 2.0 * blur.x, UV.y - 2.0 * blur.y)) * 0.12;
    sum += texture2D(map, vec2(UV.x - blur.x, UV.y - blur.y)) * 0.15;
    sum += texture2D(map, vec2(UV.x, UV.y)) * 0.16;
    sum += texture2D(map, vec2(UV.x + blur.x, UV.y + blur.y)) * 0.15;
    sum += texture2D(map, vec2(UV.x + 2.0 * blur.x, UV.y + 2.0 * blur.y)) * 0.12;
    sum += texture2D(map, vec2(UV.x + 3.0 * blur.x, UV.y + 3.0 * blur.y)) * 0.09;
    sum += texture2D(map, vec2(UV.x + 4.0 * blur.x, UV.y + 4.0 * blur.y)) * 0.05;
    return sum;

}

void main() {

    float cellSize = 1.0 / resolution;//textureResolution.xy;

    vec2 uv = gl_FragCoord.xy * cellSize;

    // Computes the mean of texel and 4 neighbours
    vec4 textureValue = texture2D( texture, uv );
    textureValue += texture2D( texture, uv + vec2( 0.0, cellSize ) );
    textureValue += texture2D( texture, uv + vec2( 0.0, - cellSize ) );
    textureValue += texture2D( texture, uv + vec2( cellSize, 0.0 ) );
    textureValue += texture2D( texture, uv + vec2( - cellSize, 0.0 ) );

    textureValue /= 5.0;

    gl_FragColor = textureValue;

    //gl_FragColor = blurred( texture, uv, vec2( blur / resolution ) );

}