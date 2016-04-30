

var shaderHack = ( function () {

    'use strict';

    shaderHack = function () {};

    shaderHack.init = function(){

        //textures = txt;
        //meshs = {};
        //materials = {};

        // VERTEX HACK

        this.shaderPush('physical', 'vertex', [ "uniform float glowC;", "uniform float glowP;", "varying float intensity;", "varying vec3 v_eyeNormal;" ] );

        var vm = [

        "vec3 vo = vNormal;", 
        "vec3 vn = normalize( (normalMatrix * cameraPosition) - (modelViewMatrix * vec4(position, 1.0 )).xyz );", 
        "intensity = pow( abs( glowC - dot(vo, vn) ), glowP );",

        ];

        this.shaderMain('physical', 'vertex', vm );

        // FRAGMENT HACK

        this.shaderRemplace('physical', 'fragment', '#include <metalnessmap_fragment>', 'float metalnessFactor = metalness;');

        var fa = [
        "uniform int cartoon;",
        "uniform float u_celShading;",
        "uniform vec3 u_specular;",
        "uniform float u_shine;",

        "uniform int glow;",
        "uniform vec3 glowColor;",
        "varying float intensity;",
        //"varying vec3 v_eyeNormal;",

        "float celShade(float d) {",
        "    float E = 0.05;",
        "    d *= u_celShading;",
        "    float r = 1.0 / (u_celShading-0.5);",
        "    float fd = floor(d);",
        "    float dr = d * r;",
        "    if (d > fd-E && d < fd+E) {",
        "        float last = (fd - sign(d - fd))*r;",
        "        return mix(last, fd*r, smoothstep((fd-E)*r, (fd+E)*r, dr));",
        "    } else {",
        "        return fd*r;",
        "    }",
        "}",
        ];
        
        this.shaderPush('physical', 'fragment', fa );

        var fm = [

        
        "vec3 basecolor = gl_FragColor.rgb;",

        "if( glow == 1 ){",

            "gl_FragColor.rgb = mix( basecolor, glowColor, intensity );",

        "}",

        "if( cartoon == 1 ){",

            "basecolor = gl_FragColor.rgb;",

            //"vec3 en = normalize( v_eyeNormal );",
            "vec3 en = normalize( geometry.normal );",
            "vec3 ln = normalize( directLight.direction );",
            "vec3 hn = normalize(ln + vec3(0, 0, 1));",
            "float E = 0.05;",
            'float df = max(0.0, dot(en, ln));',
            'float sf = max(0.0, dot(en, hn));',

            'float cdf = celShade( df );',
            "sf = pow( abs(sf), u_shine );",

            "if (sf > 0.5 - E && sf < 0.5 + E) {",
            "    sf = smoothstep(0.5 - E, 0.5 + E, sf);",
            "} else {",
            "   sf = step(0.5, sf);",
            "}",

            "float csf = sf;",
            //"vec3 color = directLight.color + cdf * basecolor + csf * u_specular;",
            //"vec3 color = basecolor + cdf * basecolor + csf * reflectedLight.directDiffuse;",
           // "vec4 mapping = texture2D( metalnessMap, vUv ); ",
           // "vec3 mapcolor = mapping.rgb * basecolor.rgb; ",
            "vec3 color =  basecolor.rgb + (cdf * basecolor) + (csf * u_specular);",

            
            //"color = texelMetalness.rgb;",

            "gl_FragColor.rgb = color;",

            //"gl_FragColor.rgb = reflectedLight.directSpecular + reflectedLight.indirectSpecular;",
            //"gl_FragColor.rgb = reflectedLight.directDiffuse;",//+ reflectedLight.indirectDiffuse;
            //"gl_FragColor.rgb = color;",

        "}",

        ];

        this.shaderMain('physical', 'fragment', fm );

        this.uniformPush('physical', 'cartoon', { type: "i", value: 1  });
        this.uniformPush('physical', 'u_celShading', { type: "f", value: 4 });
        this.uniformPush('physical', 'u_specular', { type: "c", value: new THREE.Color( 0x606060 ) } );
        this.uniformPush('physical', 'u_shine', { type: "f", value: 10 });

        this.uniformPush('physical', 'glow', { type: "i", value: 1 });
        this.uniformPush('physical', 'glowC', { type: "f", value: 0.8 });
        this.uniformPush('physical', 'glowP', { type: "f", value: 1.4 });
        this.uniformPush('physical', 'glowColor', { type: "c", value: new THREE.Color( 0x000000 ) } );

    };

    shaderHack.uniformPush = function( type, name, value ){

        type = type || 'physical';
        THREE.ShaderLib[type].uniforms[name] = value;

    };

    shaderHack.shaderRemplace = function( type, shad, word, re ){

        type = type || 'physical';
        shad = shad || 'fragment';

        THREE.ShaderLib[type][shad+'Shader'] = THREE.ShaderLib[type][shad+'Shader'].replace(word, re);

    };

    shaderHack.shaderPush = function( type, shad, add ){

        type = type || 'physical';
        shad = shad || 'fragment';

        add.push(" ");
        THREE.ShaderLib[type][shad+'Shader'] = add.join("\n") + THREE.ShaderLib[type][shad+'Shader'];

    };

    shaderHack.shaderMain = function( type, shad, add ){

        type = type || 'physical';
        shad = shad || 'fragment';

        add.push("} ");

        THREE.ShaderLib[type][shad+'Shader'] = THREE.ShaderLib[type][shad+'Shader'].substring( 0, THREE.ShaderLib[type][shad+'Shader'].length-2 );
        THREE.ShaderLib[type][shad+'Shader'] += add.join("\n");

    };

    return shaderHack;

})();