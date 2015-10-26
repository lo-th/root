
THREE.MeshPhysicalMaterial.prototype.exposure = 1;
THREE.MeshPhysicalMaterial.prototype.gammaoffset = 0;

THREE.ShaderLib.physical = {
//'physical': {

        uniforms: THREE.UniformsUtils.merge( [

            THREE.UniformsLib[ "common" ],
            THREE.UniformsLib[ "aomap" ],
            THREE.UniformsLib[ "lightmap" ],
            THREE.UniformsLib[ "emissivemap" ],
            THREE.UniformsLib[ "bumpmap" ],
            THREE.UniformsLib[ "normalmap" ],
            THREE.UniformsLib[ "displacementmap" ],
            THREE.UniformsLib[ "roughnessmap" ],
            THREE.UniformsLib[ "reflectivitymap" ],
            THREE.UniformsLib[ "metalnessmap" ],
            THREE.UniformsLib[ "fog" ],
            THREE.UniformsLib[ "lights" ],
            THREE.UniformsLib[ "shadowmap" ],

            {
                "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
                "roughness": { type: "f", value: 0.5 },
                "metalness": { type: "f", value: 0 },

                "exposure": { type: "f", value: 1 },
                "gammaoffset": { type: "f", value: 0 },

                "envMapIntensity" : { type: "f", value: 1 } // temporary
            }

        ] ),

        vertexShader: [

            "#define PHYSICAL",

            "varying vec3 vViewPosition;",

            "#ifndef FLAT_SHADED",

            "   varying vec3 vNormal;",

            "#endif",

            THREE.ShaderChunk[ "common" ],
            THREE.ShaderChunk[ "uv_pars_vertex" ],
            THREE.ShaderChunk[ "uv2_pars_vertex" ],
            THREE.ShaderChunk[ "displacementmap_pars_vertex" ],
            THREE.ShaderChunk[ "envmap_pars_vertex" ],
            THREE.ShaderChunk[ "lights_phong_pars_vertex" ], // use phong chunk for now
            THREE.ShaderChunk[ "color_pars_vertex" ],
            THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
            THREE.ShaderChunk[ "skinning_pars_vertex" ],
            THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
            THREE.ShaderChunk[ "specularmap_pars_fragment" ],
            THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

            "void main() {", // PHYSICAL

                THREE.ShaderChunk[ "uv_vertex" ],
                THREE.ShaderChunk[ "uv2_vertex" ],
                THREE.ShaderChunk[ "color_vertex" ],

                THREE.ShaderChunk[ "beginnormal_vertex" ],
                THREE.ShaderChunk[ "morphnormal_vertex" ],
                THREE.ShaderChunk[ "skinbase_vertex" ],
                THREE.ShaderChunk[ "skinnormal_vertex" ],
                THREE.ShaderChunk[ "defaultnormal_vertex" ],

            "#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

            "   vNormal = normalize( transformedNormal );",

            "#endif",

                THREE.ShaderChunk[ "begin_vertex" ],
                THREE.ShaderChunk[ "displacementmap_vertex" ],
                THREE.ShaderChunk[ "morphtarget_vertex" ],
                THREE.ShaderChunk[ "skinning_vertex" ],
                THREE.ShaderChunk[ "project_vertex" ],
                THREE.ShaderChunk[ "logdepthbuf_vertex" ],

            "   vViewPosition = - mvPosition.xyz;",

                THREE.ShaderChunk[ "worldpos_vertex" ],
                THREE.ShaderChunk[ "envmap_vertex" ],
                THREE.ShaderChunk[ "lights_phong_vertex" ], // use phong chunk for now
                THREE.ShaderChunk[ "shadowmap_vertex" ],

            "}"

        ].join( "\n" ),

        fragmentShader: [

            "#define PHYSICAL",

            "uniform vec3 diffuse;",
            "uniform vec3 emissive;",
            "uniform float roughness;",
            "uniform float metalness;",
            "uniform float opacity;",

            "uniform float exposure;",
            "uniform float gammaoffset;",

            "uniform float envMapIntensity;", // temporary

            THREE.ShaderChunk[ "common" ],
            THREE.ShaderChunk[ "color_pars_fragment" ],
            THREE.ShaderChunk[ "uv_pars_fragment" ],
            THREE.ShaderChunk[ "uv2_pars_fragment" ],
            THREE.ShaderChunk[ "map_pars_fragment" ],
            THREE.ShaderChunk[ "alphamap_pars_fragment" ],
            THREE.ShaderChunk[ "aomap_pars_fragment" ],
            THREE.ShaderChunk[ "lightmap_pars_fragment" ],
            THREE.ShaderChunk[ "emissivemap_pars_fragment" ],
            THREE.ShaderChunk[ "envmap_pars_fragment" ],
            THREE.ShaderChunk[ "fog_pars_fragment" ],
            THREE.ShaderChunk[ "lights_pars" ],
            THREE.ShaderChunk[ "lights_phong_pars_fragment" ], // use phong chunk for now
            THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
            THREE.ShaderChunk[ "bumpmap_pars_fragment" ],
            THREE.ShaderChunk[ "normalmap_pars_fragment" ],
            THREE.ShaderChunk[ "roughnessmap_pars_fragment" ],
            //THREE.ShaderChunk[ "reflectivitymap_pars_fragment" ],
            THREE.ShaderChunk[ "metalnessmap_pars_fragment" ],
            THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],


            "vec3 applyGamma(vec3 color, float offset) {",
                "return pow(color, vec3(1.0/2.2 + offset));",
            "}",


            "#define OGS_EXPOSURE (1.0/0.18)",
            // Best fit of John Hable's generalized filmic function parameters to the Canon curve
            "vec3 applyLMVToneMap(vec3 x) {",
                "x *= OGS_EXPOSURE;",

                "const float A = 0.2;",    // shoulder strength
                "const float B = 0.34;",   // linear strength
                "const float C = 0.002;",  // linear angle
                "const float D = 1.68;",   // toe strength
                "const float E = 0.0005;", // toe numerator
                "const float F = 0.252;",  // toe denominator (E/F = toe angle)
                "const float scale = 1.0/0.833837;",

                "return (((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F) * scale;",
            "}",






            "void main() {",

            "   vec3 outgoingLight = vec3( 0.0 );",
            "   vec4 diffuseColor = vec4( diffuse, opacity );",
            "   vec3 totalAmbientLight = ambientLightColor;",
            "   vec3 totalEmissiveLight = emissive;",
            "   vec3 shadowMask = vec3( 1.0 );",

                THREE.ShaderChunk[ "logdepthbuf_fragment" ],
                THREE.ShaderChunk[ "map_fragment" ],
                THREE.ShaderChunk[ "color_fragment" ],
                THREE.ShaderChunk[ "alphamap_fragment" ],
                THREE.ShaderChunk[ "alphatest_fragment" ],
                THREE.ShaderChunk[ "specularmap_fragment" ],
                THREE.ShaderChunk[ "roughnessmap_fragment" ],
                //THREE.ShaderChunk[ "reflectivitymap_fragment" ],
                THREE.ShaderChunk[ "metalnessmap_fragment" ],
                THREE.ShaderChunk[ "normal_phong_fragment" ], // use phong chunk for now
                THREE.ShaderChunk[ "lightmap_fragment" ],
                THREE.ShaderChunk[ "hemilight_fragment" ],
                THREE.ShaderChunk[ "aomap_fragment" ],
                THREE.ShaderChunk[ "emissivemap_fragment" ],

                THREE.ShaderChunk[ "lights_physical_fragment" ],
                THREE.ShaderChunk[ "shadowmap_fragment" ],

                "totalDiffuseLight *= shadowMask;",
                "totalSpecularLight *= shadowMask;",

                "outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;",

                THREE.ShaderChunk[ "envmap_physical_fragment" ],

                //THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

                // color correction
                "outgoingLight *= exposure;",
                //"outgoingLight = outgoingLight*1.0;",//applyEnvExposure(outgoingLight);",
                "outgoingLight = applyLMVToneMap(outgoingLight);",
                "outgoingLight = applyGamma(outgoingLight, gammaoffset);",

                THREE.ShaderChunk[ "fog_fragment" ],

            "   gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

            "}"

        ].join( "\n" )

  //  }
}