/**
 * @author Jaume Sanchez Elias / http://www.clicktorelease.com/
 * @author loth / http://3dflashlo.wordpress.com/
 *
 * Spherical Environment Shader
 */

THREE.SphericalShader =  function(o){
    o = o || {};
    var shader = THREE.Spherical;
    var uniforms = THREE.UniformsUtils.merge([
        shader.uniforms,
        THREE.UniformsLib[ "common" ],
        THREE.UniformsLib[ "fog" ]
    ]);
    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vs,
        fragmentShader: shader.fs,

        shading: THREE.SmoothShading,
        wrapping: THREE.ClampToEdgeWrapping,

        skinning : o.skinning || false,
        morphTargets : o.morphTargets || false,
        transparent: o.transparent || false,
        depthTest: o.depthTest || true,
        depthWrite: o.depthWrite || true,
        side: o.side || THREE.FrontSide,//DoubleSide,
        fog: o.fog || false
    });
    if(o.mapLight){
        material.uniforms.mapLight.value = o.mapLight;
        material.uniforms.useLightMap.value = 1.0;
    }
    if(o.map){
        material.uniforms.map.value = o.map;
        material.uniforms.useMap.value = 1.0;
    }
    if(o.normal){
        material.uniforms.tNormal.value = o.normal;
        material.uniforms.useNormal.value = 1.0;
    }
    if(o.displace){
        material.uniforms.tDisplacement.value = o.displace;
        material.uniforms.useDisplacement.value = 1.0;
    }

    material.uniforms.env.value = o.env || null;
    material.uniforms.reflection.value = o.reflection || 1;

    //material.uniforms.repeat.value = new THREE.Vector2(1.0,1.0);
    material.uniforms.repeat.value.set( 1, 1 );

    material.uniforms.diffuse.value = new THREE.Color( o.color || 0xFFFFFF );
    material.uniforms.opacity.value = o.opacity || 1;
    return material;
}


THREE.Spherical = {
    attributes:{},
    uniforms:{ 
    	repeat: {type: 'v2', value: new THREE.Vector2( 1, 1 )},
    	env: {type: 't', value: null},
    	//map: {type: 't', value: null},
    	mapLight: {type: 't', value: null},
    	tNormal: {type: 't', value: null},
        color: {type: 'c', value: null},
        useMap: {type: 'f', value: 0},
        useLightMap: {type: 'f', value: 0},
        useNormal: {type: 'f', value: 0},
        //opacity: {type: 'f', value: 0.3},
        useRim: {type: 'f', value: 0.5},
        rimPower: {type: 'f', value: 2},
        useExtraRim: {type: 'f', value: 0},
        reflection: {type: 'f', value: 1.0},

        useNoise: {type: 'f', value: 0},
        noise: {type: 'f', value: 0.4},

        normalScale: {type: 'f', value: 0.8},
        normalRepeat: {type: 'f', value: 1},

        useScreen: {type: 'f', value: 0},

        useDisplacement: {type: 'f', value: 0},
        tDisplacement: {type: 't', value: null},
        uDisplacementScale: {type: 'f', value: 2.4},
        uDisplacementBias: {type: 'f', value:0.},
    },
    fs:[
        'uniform vec3 diffuse;',
		'uniform float opacity;',
		'uniform float useMap;',
        'uniform float useRim;',
        'uniform float rimPower;',
        'uniform float useExtraRim;',
        'uniform float useNormal;',
        'uniform sampler2D env;',
        'uniform sampler2D map;',
        'uniform sampler2D mapLight;',
        'uniform sampler2D tNormal;',
        'uniform float normalScale;',
        'uniform float normalRepeat;',
        'uniform float useLightMap;',
        'uniform float reflection;',
        'uniform float useScreen;',

        'uniform float useNoise;',
        'uniform float noise;',
        //'uniform vec3 color;',
        'varying vec2 vUv;',
        'varying vec3 vTangent;',
        'varying vec3 vBinormal;',
        'varying vec2 vN;',
        'varying vec3 vU;',
        //'varying vec2 vX;',
        //'varying vec3 vEye;',
        'varying vec3 vNormal;',

        'float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}',
        //'varying vec3 vPos;',
        //THREE.ShaderChunk[ "color_pars_fragment" ],
        //THREE.ShaderChunk[ "map_pars_fragment" ],
        THREE.ShaderChunk[ "alphamap_pars_fragment" ],
		//THREE.ShaderChunk[ "lightmap_pars_fragment" ],
		//THREE.ShaderChunk[ "envmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		//THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
		//THREE.ShaderChunk[ "specularmap_pars_fragment" ],
        THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],


        'void main() {',
            'vec3 finalNormal = vNormal;',
			'vec2 calculatedNormal = vN;',
			//'vec2 calculatedNormal = vX;',

			'if( useNormal == 1. ) {',
				'vec3 normalTex = texture2D( tNormal, vUv * normalRepeat ).xyz * 2.0 - 1.0;',
				//'vec3 normalTex = texture2D( tNormal, vU ).xyz * 2.0 - 1.0;',
				'normalTex.xy *= normalScale;',
				'normalTex.y *= -1.;',
				'normalTex = normalize( normalTex );',
				'mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );',
				'finalNormal = tsb * normalTex;',

				'vec3 r = reflect( vU, normalize( finalNormal ) );',
				'float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z + 1.0 ) );',
				'calculatedNormal = vec2( r.x / m + 0.5,  r.y / m + 0.5 );',
				
			'}',
			   

            'vec3 base = diffuse;',
            'float alpha = opacity;',

            'if(useMap == 1.){',
                'vec3 mapping = texture2D( map, vUv ).rgb;',
                'alpha *= texture2D( map, vUv ).a;',
                'base *= mapping;',
            '}',

            'if( useRim > 0. ) {',
                'float f = rimPower * abs( dot( finalNormal, vU ) );',
                'f = useRim * ( 1. - smoothstep( 0.0, 1., f ) );',
                'base += vec3( f );',
            '}',
            //'if( useExtraRim == 1. ) {',
            //    'float rim = max( 0., abs( dot( finalNormal, -vU ) ) );',
            //    'float r = smoothstep( .25, .75, 1. - rim );',
            //    'r -= smoothstep( .5, 1., 1. - rim );',
            //    'vec3 c = vec3( 168. / 255., 205. / 255., 225. / 255. );',
            //    'base *= c;',
            //'}',

            // screen blending
	        'if( useScreen == 1. ) {',
				'base = vec3( 1. ) - ( vec3( 1. ) - base ) * ( vec3( 1. ) - base );',
			'}',


			'if( useNoise == 1. ) {',
			    'base += noise * ( .5 - random( vec3( 1. ), length( gl_FragCoord ) ) );',
			'}',

            // environment
            //'vec3 ev = texture2D( env, vN ).rgb;',
            //'base *= ev;',
            
            'gl_FragColor = vec4( base, alpha );',

            // environment
            'vec3 reflectMap = texture2D( env, calculatedNormal ).rgb;',
            'vec4 reflectif = vec4( reflectMap, reflection );',
            'gl_FragColor.xyz = mix( gl_FragColor.xyz, gl_FragColor.xyz * reflectMap.xyz, reflection );',

            'if(useLightMap == 1.){',
	            'gl_FragColor.xyz = gl_FragColor.xyz * texture2D( mapLight, vUv ).xyz;',
            '}',

            THREE.ShaderChunk[ "logdepthbuf_fragment" ],
            //THREE.ShaderChunk[ "map_fragment" ],
            //THREE.ShaderChunk[ "alphamap_fragment" ],
			THREE.ShaderChunk[ "alphatest_fragment" ],
			//THREE.ShaderChunk[ "specularmap_fragment" ],
			//THREE.ShaderChunk[ "lightmap_fragment" ],
			//THREE.ShaderChunk[ "color_fragment" ],
			//THREE.ShaderChunk[ "envmap_fragment" ],
			//THREE.ShaderChunk[ "shadowmap_fragment" ],

			THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

			THREE.ShaderChunk[ "fog_fragment" ],
        '}'
    ].join("\n"),
    vs:[
        //THREE.ShaderChunk[ "map_pars_vertex" ],
		//THREE.ShaderChunk[ "lightmap_pars_vertex" ],
		//THREE.ShaderChunk[ "envmap_pars_vertex" ],
		//THREE.ShaderChunk[ "color_pars_vertex" ],
		THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
		THREE.ShaderChunk[ "skinning_pars_vertex" ],
		//THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
        THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],
        'attribute vec4 tangent;',
        'uniform float useNormal;',
        'uniform vec2 repeat;',

        'uniform float useDisplacement;',
        'uniform sampler2D tDisplacement;',
		'uniform float uDisplacementScale;',
		'uniform float uDisplacementBias;',

        'varying vec2 vUv;',
        'varying vec2 vN;',
        'varying vec3 vU;',

        'varying vec3 vNormal;',
        'varying vec3 vPos;',

        'varying vec3 vTangent;',
        'varying vec3 vBinormal;',



        'void main() {',
            //THREE.ShaderChunk[ "map_vertex" ],
           // THREE.ShaderChunk[ "lightmap_vertex" ],
			//THREE.ShaderChunk[ "color_vertex" ],
			THREE.ShaderChunk[ "skinbase_vertex" ],

			//"#ifdef USE_ENVMAP",

			THREE.ShaderChunk[ "morphnormal_vertex" ],
			THREE.ShaderChunk[ "skinnormal_vertex" ],
			THREE.ShaderChunk[ "defaultnormal_vertex" ],

			//"#endif",

            THREE.ShaderChunk[ "morphtarget_vertex" ],
            THREE.ShaderChunk[ "skinning_vertex" ],
            THREE.ShaderChunk[ "default_vertex" ],
            THREE.ShaderChunk[ "logdepthbuf_vertex" ],
           
			THREE.ShaderChunk[ "worldpos_vertex" ],

			'vUv = repeat * uv;',
			'vec3 pos = vec3( 0. );',

			'#ifdef USE_MORPHTARGETS',
			    'pos = morphed.xyz;',
			'#else',
				'pos = position;',
			'#endif',

			'#ifdef USE_SKINNING',
			    'pos = skinned.xyz;',
			'#else',
				'pos = position;',
			'#endif',

			'vec3 displacedPosition = pos;',
			'if( useDisplacement == 1. ) {',
				'vec3 dv = texture2D( tDisplacement, vUv ).xyz;',
				'float df = uDisplacementScale * dv.x + uDisplacementBias;',
				'displacedPosition = pos + normalize( normal ) * df;',
			'}',

			'vec4 mvpos = modelViewMatrix * vec4( displacedPosition, 1.0 );',

			//THREE.ShaderChunk[ "envmap_vertex" ],
			//THREE.ShaderChunk[ "shadowmap_vertex" ],
			//'vU = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );',
			//'vU = normalize( vec3( mvPosition ) );',
			'vU = normalize( vec3( mvpos ) );',
            'vNormal = normalize( normalMatrix * normal );',

            'if( useNormal == 0. ) {',
	            'vec3 r = reflect( vU, vNormal );',
	            'float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );',
	            'vN = r.xy / m + .5;',
	        '} else {',
				'vN = vec2( 0. );',
			'}',

			'if( useNormal == 1. ) {',
				'vTangent = normalize( normalMatrix * tangent.xyz );',
				'vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );',
			'} else {',
				'vTangent = vec3( 0. );',
				'vBinormal = vec3( 0. );',
			'}',

			
            'gl_Position = projectionMatrix * mvpos;',
        '}'
    ].join("\n")
};