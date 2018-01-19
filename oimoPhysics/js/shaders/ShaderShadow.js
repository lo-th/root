THREE.ShaderShadow = {

    uniforms: Object.assign( {}, //[

        //THREE.UniformsLib[ "lights" ],
        THREE.UniformsLib.lights,
        THREE.UniformsLib.fog,

        {

            "diffuse": { value: new THREE.Color( 0xeeeeee ) },
            "specular": { value: new THREE.Color( 0x111111 ) },
            "emissive": { value: new THREE.Color( 0x000000 ) },
            "opacity": { value: 0.4 },

        }

    //] 
    ),

    fragmentShader: [

        "uniform float opacity;",
        "varying vec2 vUv;",

        THREE.ShaderChunk[ "common" ],
        THREE.ShaderChunk[ "packing" ],
        THREE.ShaderChunk[ "bsdfs" ],
        
        THREE.ShaderChunk[ "lights_pars" ],
        //THREE.ShaderChunk[ "fog_pars_fragment" ],
        //THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
        //THREE.ShaderChunk[ "shadowmask_pars_fragment" ],

        "void main() {",

            //"   float mask = getShadowMask();",
            "   vec4 pp = vec4(1.0);",
            "   vec4 mapping = vec4( pp.rgb, pp.a * opacity );",
            //"   mapping.a *= mapAlpha;",
            //"   vec4 shadowing = vec4( vec3(0.0), opacity * (1.0 - mask) );",
            //"   gl_FragColor = mix( mapping, shadowing, 1.0 - mask );",
            "   gl_FragColor = mapping;",
            //"   gl_FragColor += mapping;",

            //THREE.ShaderChunk[ "fog_fragment" ],

        "}"

    ].join( "\n" ),

    vertexShader: [

        "varying vec2 vUv;",

        THREE.ShaderChunk[ "common" ],
        THREE.ShaderChunk[ "bsdfs" ],
        THREE.ShaderChunk[ "lights_pars" ],
        //THREE.ShaderChunk[ "fog_pars_vertex" ],
        
        //THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
        //THREE.ShaderChunk[ "skinning_pars_vertex" ],
        THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
        

        "void main() {",

           // THREE.ShaderChunk[ "begin_vertex" ],
           // THREE.ShaderChunk[ "skinning_vertex" ],
           // THREE.ShaderChunk[ "project_vertex" ],
           // THREE.ShaderChunk[ "logdepthbuf_vertex" ],
           // THREE.ShaderChunk[ "clipping_planes_vertex" ],
           // THREE.ShaderChunk[ "worldpos_vertex" ],

            "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
            "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

            "vUv = uv;",

            "gl_Position = projectionMatrix * mvPosition;",

            //THREE.ShaderChunk[ "lights_lambert_vertex" ],
            THREE.ShaderChunk[ "shadowmap_vertex" ],
            //THREE.ShaderChunk[ "fog_vertex" ],

        "}"

    ].join( "\n" ),

    lights: true,
    transparent:true,
    depthWrite:false,
    fog:true

}

THREE.ShadowPCSS = [

    "#ifdef USE_SHADOWMAP",
    "#define LIGHT_WORLD_SIZE 0.005",
    "#define LIGHT_FRUSTUM_WIDTH 3.75",
    "#define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)",
    "#define NEAR_PLANE 9.5",
    " ",
    "#define NUM_SAMPLES 17",
    "#define NUM_RINGS 11",
    "#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES",
    "#define PCF_NUM_SAMPLES NUM_SAMPLES",
    " ",
    "vec2 poissonDisk[NUM_SAMPLES];",
    " ",
    "void initPoissonSamples( const in vec2 randomSeed ) {",
    "   float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );",
    "   float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );",

    // jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
    "   float angle = rand( randomSeed ) * PI2;",
    "   float radius = INV_NUM_SAMPLES;",
    "   float radiusStep = radius;",

    "   for( int i = 0; i < NUM_SAMPLES; i ++ ) {",
    "       poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );",
    "       radius += radiusStep;",
    "       angle += ANGLE_STEP;",
    "   }",
    "}",

    "float penumbraSize( const in float zReceiver, const in float zBlocker ) { ",// Parallel plane estimation
    "   return (zReceiver - zBlocker) / zBlocker;",
    "}",

    "float findBlocker( sampler2D shadowMap, const in vec2 uv, const in float zReceiver ) {",
        // This uses similar triangles to compute what
        // area of the shadow map we should search
    "   float searchRadius = LIGHT_SIZE_UV * ( zReceiver - NEAR_PLANE ) / zReceiver;",
    "   float blockerDepthSum = 0.0;",
    "   int numBlockers = 0;",

    "   for( int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++ ) {",
    "       float shadowMapDepth = unpackRGBAToDepth(texture2D(shadowMap, uv + poissonDisk[i] * searchRadius));",
    "       if ( shadowMapDepth < zReceiver ) {",
    "           blockerDepthSum += shadowMapDepth;",
    "           numBlockers ++;",
    "       }",
    "   }",

    "    if( numBlockers == 0 ) return -1.0;",

    "    return blockerDepthSum / float( numBlockers );",
    "}",

    "float PCF_Filter(sampler2D shadowMap, vec2 uv, float zReceiver, float filterRadius ) {",
    "    float sum = 0.0;",
    "    for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {",
    "        float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + poissonDisk[ i ] * filterRadius ) );",
    "        if( zReceiver <= depth ) sum += 1.0;",
    "    }",
    "    for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {",
    "        float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + -poissonDisk[ i ].yx * filterRadius ) );",
    "        if( zReceiver <= depth ) sum += 1.0;",
    "    }",
    "    return sum / ( 2.0 * float( PCF_NUM_SAMPLES ) );",
    "}",

    "float PCSS ( sampler2D shadowMap, vec4 coords ) {",
    "    vec2 uv = coords.xy;",
    "    float zReceiver = coords.z;", // Assumed to be eye-space z in this code

    "    initPoissonSamples( uv );",
        // STEP 1: blocker search
    "    float avgBlockerDepth = findBlocker( shadowMap, uv, zReceiver );",

        //There are no occluders so early out (this saves filtering)
    "    if( avgBlockerDepth == -1.0 ) return 1.0;",

        // STEP 2: penumbra size
    "    float penumbraRatio = penumbraSize( zReceiver, avgBlockerDepth );",
    "    float filterRadius = penumbraRatio * LIGHT_SIZE_UV * NEAR_PLANE / zReceiver;",
        
        // STEP 3: filtering
        // return avgBlockerDepth;
    "    return PCF_Filter( shadowMap, uv, zReceiver, filterRadius );",
    "}",

].join( "\n" );