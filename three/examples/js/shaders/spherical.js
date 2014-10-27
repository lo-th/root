THREE.SphereShader =  function(o){
    o = o || {};
    var shader = THREE.Spherical;
    var uniforms = THREE.UniformsUtils.merge([
        shader.uniforms,
        THREE.UniformsLib[ "common" ],
    ]);
    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vs,
        fragmentShader: shader.fs,
        shading: THREE.SmoothShading,

        skinning : o.skinning || false,
        morphTargets : o.morphTargets || false,
        transparent: o.transparent || false,
        depthTest: o.depthTest || true,
        depthWrite: o.depthWrite || true,
        side: o.side || THREE.FrontSide,//DoubleSide,
        fog: o.fog || false
    });

    if(o.map){
        material.uniforms.map.value = o.map;
        material.uniforms.useMap.value = 1.0;
    }
    material.uniforms.env.value = o.env || null;
    material.uniforms.diffuse.value = new THREE.Color( o.color || 0xFFFFFF );
    material.uniforms.opacity.value = o.opacity || 1;
    return material;
}


THREE.Spherical = {
    attributes:{},
    uniforms:{ 
    	env: {type: 't', value: null},
    	//map: {type: 't', value: null},
        color: {type: 'c', value: null},
        useMap: {type: 'f', value: 0},
        //opacity: {type: 'f', value: 0.3},
        useRim: {type: 'f', value: 0.5},
        rimPower: {type: 'f', value: 2},
        useExtraRim: {type: 'f', value: 0},
    },
    fs:[
        'uniform vec3 diffuse;',
		'uniform float opacity;',
		'uniform float useMap;',
        'uniform float useRim;',
        'uniform float rimPower;',
        'uniform float useExtraRim;',
        'uniform sampler2D env;',
        'uniform sampler2D map;',
        //'uniform vec3 color;',
        'varying vec2 vN;',
        'varying vec2 vU;',
        //'varying vec3 vEye;',
        'varying vec3 vNormal;',
        'varying vec3 vPos;',
        //THREE.ShaderChunk[ "color_pars_fragment" ],
        //THREE.ShaderChunk[ "map_pars_fragment" ],
        //THREE.ShaderChunk[ "alphamap_pars_fragment" ],
		//THREE.ShaderChunk[ "lightmap_pars_fragment" ],
		//THREE.ShaderChunk[ "envmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		//THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
		//THREE.ShaderChunk[ "specularmap_pars_fragment" ],
        THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],


        'void main() {',
            'vec3 base = diffuse;',
            'float alpha = opacity;',

            'if(useMap == 1.){',
                'vec3 mapping = texture2D( map, vU ).rgb;',
                "alpha *= texture2D( map, vU ).a;",
                'base *= mapping;',
            '}',

            'if( useRim > 0. ) {',
                'float f = rimPower * abs( dot( vNormal, vPos ) );',
                'f = useRim * ( 1. - smoothstep( 0.0, 1., f ) );',
                'base += vec3( f );',
            '}',
            'if( useExtraRim == 1. ) {',
                'float rim = max( 0., abs( dot( vNormal, -vPos ) ) );',
                'float r = smoothstep( .25, .75, 1. - rim );',
                'r -= smoothstep( .5, 1., 1. - rim );',
                'vec3 c = vec3( 168. / 255., 205. / 255., 225. / 255. );',
                'base *= c;',
            '}',

            // environment
            'vec3 ev = texture2D( env, vN ).rgb;',
            'base *= ev;',
            
            'gl_FragColor = vec4( base, alpha );',

            THREE.ShaderChunk[ "logdepthbuf_fragment" ],
            //THREE.ShaderChunk[ "map_fragment" ],
            //THREE.ShaderChunk[ "alphamap_fragment" ],
			//THREE.ShaderChunk[ "alphatest_fragment" ],
			//THREE.ShaderChunk[ "specularmap_fragment" ],
			//THREE.ShaderChunk[ "lightmap_fragment" ],
			//THREE.ShaderChunk[ "color_fragment" ],
			//THREE.ShaderChunk[ "envmap_fragment" ],
			//THREE.ShaderChunk[ "shadowmap_fragment" ],

			//THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

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

        'varying vec2 vN;',
        'varying vec2 vU;',
        //'varying vec3 vEye;',
        'varying vec3 vNormal;',
        'varying vec3 vPos;',

        'void main() {',
            //THREE.ShaderChunk[ "map_vertex" ],
           // THREE.ShaderChunk[ "lightmap_vertex" ],
			//THREE.ShaderChunk[ "color_vertex" ],
			THREE.ShaderChunk[ "skinbase_vertex" ],

			//"#ifdef USE_ENVMAP",

			//THREE.ShaderChunk[ "morphnormal_vertex" ],
			//THREE.ShaderChunk[ "skinnormal_vertex" ],
			//THREE.ShaderChunk[ "defaultnormal_vertex" ],

			//"#endif",

            THREE.ShaderChunk[ "morphtarget_vertex" ],
            THREE.ShaderChunk[ "skinning_vertex" ],
            THREE.ShaderChunk[ "default_vertex" ],
            THREE.ShaderChunk[ "logdepthbuf_vertex" ],
           
			THREE.ShaderChunk[ "worldpos_vertex" ],
			//THREE.ShaderChunk[ "envmap_vertex" ],
			//THREE.ShaderChunk[ "shadowmap_vertex" ],

            //'vec3 e = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );',
            'vPos = normalize( vec3( mvPosition ) );',
            'vNormal = normalize( normalMatrix * normal );',
            'vec3 r = reflect( vPos, vNormal );',
            'float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );',
            'vN = r.xy / m + .5;',
            'vU = uv;',
            //'vEye = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;',
            //'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1. );',
            'gl_Position = projectionMatrix * mvPosition;',
        '}'
    ].join("\n")
};