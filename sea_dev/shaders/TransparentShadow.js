THREE.TransparentShadow = [

    "uniform vec3 diffuse;",
    "uniform float opacity;",

    THREE.ShaderChunk[ "common" ],
    THREE.ShaderChunk[ "color_pars_fragment" ],
    THREE.ShaderChunk[ "uv_pars_fragment" ],
    THREE.ShaderChunk[ "uv2_pars_fragment" ],
    THREE.ShaderChunk[ "map_pars_fragment" ],
    THREE.ShaderChunk[ "alphamap_pars_fragment" ],
    THREE.ShaderChunk[ "aomap_pars_fragment" ],
    THREE.ShaderChunk[ "envmap_pars_fragment" ],
    THREE.ShaderChunk[ "fog_pars_fragment" ],
    THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
    THREE.ShaderChunk[ "specularmap_pars_fragment" ],
    THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

    "void main() {",

    "   vec3 outgoingLight = vec3( 0.0 );",
    "   vec4 diffuseColor = vec4( diffuse, opacity );",
    "   vec3 totalAmbientLight = vec3( 1.0 );", // hardwired
    "   vec3 shadowMask = vec3( 1.0 );",

        THREE.ShaderChunk[ "logdepthbuf_fragment" ],
        THREE.ShaderChunk[ "map_fragment" ],
        THREE.ShaderChunk[ "color_fragment" ],
        THREE.ShaderChunk[ "alphamap_fragment" ],
        THREE.ShaderChunk[ "alphatest_fragment" ],
        THREE.ShaderChunk[ "specularmap_fragment" ],
        THREE.ShaderChunk[ "aomap_fragment" ],
        THREE.ShaderChunk[ "shadowmap_fragment" ],

    "   outgoingLight = diffuseColor.rgb * totalAmbientLight * shadowMask;",

        THREE.ShaderChunk[ "envmap_fragment" ],

        THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

        THREE.ShaderChunk[ "fog_fragment" ],

    "   gl_FragColor = vec4( outgoingLight, diffuseColor.a - outgoingLight.x );",

    "}"

].join( "\n" );


THREE.ShadowMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.ShaderLib['basic'].uniforms,
    vertexShader: THREE.ShaderLib['basic'].vertexShader,
    fragmentShader: THREE.TransparentShadow,
    transparent:true,
    depthWrite: false, 
    fog:false
});