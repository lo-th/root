/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

    this.renderer = renderer;

    if ( renderTarget === undefined ) {

        var parameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        var size = renderer.getSize();
        renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );

    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.passes = [];

    if ( THREE.CopyShader === undefined )
        console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

    this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

Object.assign( THREE.EffectComposer.prototype, {

    swapBuffers: function() {

        var tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;

    },

    addPass: function ( pass ) {

        this.passes.push( pass );

        var size = this.renderer.getSize();
        pass.setSize( size.width, size.height );

    },

    insertPass: function ( pass, index ) {

        this.passes.splice( index, 0, pass );

    },

    render: function ( delta ) {

        var maskActive = false;

        var pass, i, il = this.passes.length;

        for ( i = 0; i < il; i ++ ) {

            pass = this.passes[ i ];

            if ( pass.enabled === false ) continue;

            pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

            if ( pass.needsSwap ) {

                if ( maskActive ) {

                    var context = this.renderer.context;

                    context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

                    this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

                    context.stencilFunc( context.EQUAL, 1, 0xffffffff );

                }

                this.swapBuffers();

            }

            if ( THREE.MaskPass !== undefined ) {

                if ( pass instanceof THREE.MaskPass ) {

                    maskActive = true;

                } else if ( pass instanceof THREE.ClearMaskPass ) {

                    maskActive = false;

                }

            }

        }

    },

    reset: function ( renderTarget ) {

        if ( renderTarget === undefined ) {

            var size = this.renderer.getSize();

            renderTarget = this.renderTarget1.clone();
            renderTarget.setSize( size.width, size.height );

        }

        this.renderTarget1.dispose();
        this.renderTarget2.dispose();
        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

    },

    setSize: function ( width, height ) {

        this.renderTarget1.setSize( width, height );
        this.renderTarget2.setSize( width, height );

        for ( var i = 0; i < this.passes.length; i ++ ) {

            this.passes[i].setSize( width, height );

        }

    }

} );


THREE.Pass = function () {

    // if set to true, the pass is processed by the composer
    this.enabled = true;

    // if set to true, the pass indicates to swap read and write buffer after rendering
    this.needsSwap = true;

    // if set to true, the pass clears its buffer before rendering
    this.clear = false;

    // if set to true, the result of the pass is rendered to screen
    this.renderToScreen = false;

};

Object.assign( THREE.Pass.prototype, {

    setSize: function( width, height ) {},

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        console.error( "THREE.Pass: .render() must be implemented in derived pass." );

    }

} );

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

    THREE.Pass.call( this );

    this.scene = scene;
    this.camera = camera;

    this.overrideMaterial = overrideMaterial;

    this.clearColor = clearColor;
    this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

    this.clear = true;
    this.needsSwap = false;

};

THREE.RenderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

    constructor: THREE.RenderPass,

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        var oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        this.scene.overrideMaterial = this.overrideMaterial;

        var oldClearColor, oldClearAlpha;

        if ( this.clearColor ) {

            oldClearColor = renderer.getClearColor().getHex();
            oldClearAlpha = renderer.getClearAlpha();

            renderer.setClearColor( this.clearColor, this.clearAlpha );

        }

        renderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );

        if ( this.clearColor ) {

            renderer.setClearColor( oldClearColor, oldClearAlpha );

        }

        this.scene.overrideMaterial = null;
        renderer.autoClear = oldAutoClear;
    }

} );


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

    THREE.Pass.call( this );

    this.scene = scene;
    this.camera = camera;

    this.clear = true;
    this.needsSwap = false;

    this.inverse = false;

};

THREE.MaskPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

    constructor: THREE.MaskPass,

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        var context = renderer.context;
        var state = renderer.state;

        // don't update color or depth

        state.buffers.color.setMask( false );
        state.buffers.depth.setMask( false );

        // lock buffers

        state.buffers.color.setLocked( true );
        state.buffers.depth.setLocked( true );

        // set up stencil

        var writeValue, clearValue;

        if ( this.inverse ) {

            writeValue = 0;
            clearValue = 1;

        } else {

            writeValue = 1;
            clearValue = 0;

        }

        state.buffers.stencil.setTest( true );
        state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
        state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
        state.buffers.stencil.setClear( clearValue );

        // draw into the stencil buffer

        renderer.render( this.scene, this.camera, readBuffer, this.clear );
        renderer.render( this.scene, this.camera, writeBuffer, this.clear );

        // unlock color and depth buffer for subsequent rendering

        state.buffers.color.setLocked( false );
        state.buffers.depth.setLocked( false );

        // only render where stencil is set to 1

        state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
        state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );

    }

} );


THREE.ClearMaskPass = function () {

    THREE.Pass.call( this );

    this.needsSwap = false;

};

THREE.ClearMaskPass.prototype = Object.create( THREE.Pass.prototype );

Object.assign( THREE.ClearMaskPass.prototype, {

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        renderer.state.buffers.stencil.setTest( false );

    }

} );


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

    THREE.Pass.call( this );

    this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

    if ( shader instanceof THREE.ShaderMaterial ) {

        this.uniforms = shader.uniforms;

        this.material = shader;

    } else if ( shader ) {

        this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

        this.material = new THREE.ShaderMaterial( {

            defines: shader.defines || {},
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader

        } );

    }

    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

    constructor: THREE.ShaderPass,

    render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        if ( this.uniforms[ this.textureID ] ) {

            this.uniforms[ this.textureID ].value = readBuffer.texture;

        }

        this.quad.material = this.material;

        if ( this.renderToScreen ) {

            renderer.render( this.scene, this.camera );

        } else {

            renderer.render( this.scene, this.camera, writeBuffer, this.clear );

        }

    }

} );



/**
 * @author spidersharma / http://eduperiment.com/
 Inspired from Unreal Engine::
 https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/
 */

THREE.UnrealBloomPass = function ( resolution, strength, radius, threshold ) {

    THREE.Pass.call( this );

    this.strength = ( strength !== undefined ) ? strength : 1;
    this.radius = radius;
    this.threshold = threshold;
    this.resolution = ( resolution !== undefined ) ? new THREE.Vector2(resolution.x, resolution.y) : new THREE.Vector2(256, 256);

    // render targets
    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;
    var resx = Math.round(this.resolution.x/2);
    var resy = Math.round(this.resolution.y/2);

    this.renderTargetBright = new THREE.WebGLRenderTarget( resx, resy, pars );
    this.renderTargetBright.texture.generateMipmaps = false;

    for( var i=0; i<this.nMips; i++) {

        var renderTarget = new THREE.WebGLRenderTarget( resx, resy, pars );

        renderTarget.texture.generateMipmaps = false;

        this.renderTargetsHorizontal.push(renderTarget);

        var renderTarget = new THREE.WebGLRenderTarget( resx, resy, pars );

        renderTarget.texture.generateMipmaps = false;

        this.renderTargetsVertical.push(renderTarget);

        resx = Math.round(resx/2);

        resy = Math.round(resy/2);
    }

    // luminosity high pass material

    if ( THREE.LuminosityHighPassShader === undefined )
        console.error( "THREE.UnrealBloomPass relies on THREE.LuminosityHighPassShader" );

    var highPassShader = THREE.LuminosityHighPassShader;
    this.highPassUniforms = THREE.UniformsUtils.clone( highPassShader.uniforms );

    this.highPassUniforms[ "luminosityThreshold" ].value = threshold;
    this.highPassUniforms[ "smoothWidth" ].value = 0.01;

    this.materialHighPassFilter = new THREE.ShaderMaterial( {
        uniforms: this.highPassUniforms,
        vertexShader:  highPassShader.vertexShader,
        fragmentShader: highPassShader.fragmentShader,
        defines: {}
    } );

    // Gaussian Blur Materials
    this.separableBlurMaterials = [];
    var kernelSizeArray = [3, 5, 7, 9, 11];
    var resx = Math.round(this.resolution.x/2);
    var resy = Math.round(this.resolution.y/2);

    for( var i=0; i<this.nMips; i++) {

        this.separableBlurMaterials.push(this.getSeperableBlurMaterial(kernelSizeArray[i]));

        this.separableBlurMaterials[i].uniforms[ "texSize" ].value = new THREE.Vector2(resx, resy);

        resx = Math.round(resx/2);

        resy = Math.round(resy/2);
    }

    // Composite material
    this.compositeMaterial = this.getCompositeMaterial(this.nMips);
    this.compositeMaterial.uniforms["blurTexture1"].value = this.renderTargetsVertical[0].texture;
    this.compositeMaterial.uniforms["blurTexture2"].value = this.renderTargetsVertical[1].texture;
    this.compositeMaterial.uniforms["blurTexture3"].value = this.renderTargetsVertical[2].texture;
    this.compositeMaterial.uniforms["blurTexture4"].value = this.renderTargetsVertical[3].texture;
    this.compositeMaterial.uniforms["blurTexture5"].value = this.renderTargetsVertical[4].texture;
    this.compositeMaterial.uniforms["bloomStrength"].value = strength;
    this.compositeMaterial.uniforms["bloomRadius"].value = 0.1;
    this.compositeMaterial.needsUpdate = true;

    var bloomFactors = [1.0, 0.8, 0.6, 0.4, 0.2];
    this.compositeMaterial.uniforms["bloomFactors"].value = bloomFactors;
    this.bloomTintColors = [new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1)
                                                ,new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1)];
    this.compositeMaterial.uniforms["bloomTintColors"].value = this.bloomTintColors;

    // copy material
    if ( THREE.CopyShader === undefined )
        console.error( "THREE.BloomPass relies on THREE.CopyShader" );

    var copyShader = THREE.CopyShader;

    this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );
    this.copyUniforms[ "opacity" ].value = 1.0;

    this.materialCopy = new THREE.ShaderMaterial( {
        uniforms: this.copyUniforms,
        vertexShader: copyShader.vertexShader,
        fragmentShader: copyShader.fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        transparent: true
    } );

    this.enabled = true;
    this.needsSwap = false;

    this.oldClearColor = new THREE.Color();
    this.oldClearAlpha = 1;

    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

};

THREE.UnrealBloomPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

    constructor: THREE.UnrealBloomPass,

    dispose: function() {
        for( var i=0; i< this.renderTargetsHorizontal.length(); i++) {
            this.renderTargetsHorizontal[i].dispose();
        }
        for( var i=0; i< this.renderTargetsVertical.length(); i++) {
            this.renderTargetsVertical[i].dispose();
        }
        this.renderTargetBright.dispose();
    },

    setSize: function ( width, height ) {

        var resx = Math.round(width/2);
        var resy = Math.round(height/2);

        this.renderTargetBright.setSize(resx, resy);

        for( var i=0; i<this.nMips; i++) {

            this.renderTargetsHorizontal[i].setSize(resx, resy);
            this.renderTargetsVertical[i].setSize(resx, resy);

            this.separableBlurMaterials[i].uniforms[ "texSize" ].value = new THREE.Vector2(resx, resy);

            resx = Math.round(resx/2);
            resy = Math.round(resy/2);
        }
    },

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        this.oldClearColor.copy( renderer.getClearColor() );
        this.oldClearAlpha = renderer.getClearAlpha();
        var oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        renderer.setClearColor( new THREE.Color( 0, 0, 0 ), 0 );

        if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

        // 1. Extract Bright Areas
        this.highPassUniforms[ "tDiffuse" ].value = readBuffer.texture;
        this.highPassUniforms[ "luminosityThreshold" ].value = this.threshold;
        this.quad.material = this.materialHighPassFilter;
        renderer.render( this.scene, this.camera, this.renderTargetBright, true );

        // 2. Blur All the mips progressively
        var inputRenderTarget = this.renderTargetBright;

        for(var i=0; i<this.nMips; i++) {

            this.quad.material = this.separableBlurMaterials[i];

            this.separableBlurMaterials[i].uniforms[ "colorTexture" ].value = inputRenderTarget.texture;

            this.separableBlurMaterials[i].uniforms[ "direction" ].value = THREE.UnrealBloomPass.BlurDirectionX;

            renderer.render( this.scene, this.camera, this.renderTargetsHorizontal[i], true );

            this.separableBlurMaterials[i].uniforms[ "colorTexture" ].value = this.renderTargetsHorizontal[i].texture;

            this.separableBlurMaterials[i].uniforms[ "direction" ].value = THREE.UnrealBloomPass.BlurDirectionY;

            renderer.render( this.scene, this.camera, this.renderTargetsVertical[i], true );

            inputRenderTarget = this.renderTargetsVertical[i];
        }

        // Composite All the mips
        this.quad.material = this.compositeMaterial;
        this.compositeMaterial.uniforms["bloomStrength"].value = this.strength;
        this.compositeMaterial.uniforms["bloomRadius"].value = this.radius;
        this.compositeMaterial.uniforms["bloomTintColors"].value = this.bloomTintColors;
        renderer.render( this.scene, this.camera, this.renderTargetsHorizontal[0], true );

        // Blend it additively over the input texture
        this.quad.material = this.materialCopy;
        this.copyUniforms[ "tDiffuse" ].value = this.renderTargetsHorizontal[0].texture;

        if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

        renderer.render( this.scene, this.camera, readBuffer, false );

        renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
        renderer.autoClear = oldAutoClear;
    },

    getSeperableBlurMaterial: function(kernelRadius) {

        return new THREE.ShaderMaterial( {

            defines: {
                "KERNEL_RADIUS" : kernelRadius,
                "SIGMA" : kernelRadius
            },

            uniforms: {
                "colorTexture": { value: null },
                "texSize":              { value: new THREE.Vector2( 0.5, 0.5 ) },
                "direction":                { value: new THREE.Vector2( 0.5, 0.5 ) },
            },

            vertexShader:
                "varying vec2 vUv;\n\
                void main() {\n\
                    vUv = uv;\n\
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                }",

            fragmentShader:
                "#include <common>\
                varying vec2 vUv;\n\
                uniform sampler2D colorTexture;\n\
                uniform vec2 texSize;\
                uniform vec2 direction;\
                \
                void main() {\n\
                    vec2 invSize = 1.0 / texSize;\
                    float fSigma = float(SIGMA);\
                    float weightSum = gaussianPdf(0.0, fSigma);\
                    vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;\
                    for( int i = 1; i < KERNEL_RADIUS; i ++ ) {\
                        float x = float(i);\
                        float w = gaussianPdf(x, fSigma);\
                        vec2 uvOffset = direction * invSize * x;\
                        vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);\
                        vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);\
                        diffuseSum += (sample1 + sample2) * w;\
                        weightSum += 2.0 * w;\
                    }\
                    gl_FragColor = vec4(diffuseSum.rgb/weightSum, diffuseSum.a/weightSum );\n\
                }"
        } );

        /*return new THREE.ShaderMaterial( {

            defines: {
                "KERNEL_RADIUS" : kernelRadius,
                "SIGMA" : kernelRadius
            },

            uniforms: {
                "colorTexture": { value: null },
                "texSize":              { value: new THREE.Vector2( 0.5, 0.5 ) },
                "direction":                { value: new THREE.Vector2( 0.5, 0.5 ) },
            },

            vertexShader:
                "varying vec2 vUv;\n\
                void main() {\n\
                    vUv = uv;\n\
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                }",

            fragmentShader:
                "#include <common>\
                varying vec2 vUv;\n\
                uniform sampler2D colorTexture;\n\
                uniform vec2 texSize;\
                uniform vec2 direction;\
                \
                void main() {\n\
                    vec2 invSize = 1.0 / texSize;\
                    float fSigma = float(SIGMA);\
                    float weightSum = gaussianPdf(0.0, fSigma);\
                    vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;\
                    for( int i = 1; i < KERNEL_RADIUS; i ++ ) {\
                        float x = float(i);\
                        float w = gaussianPdf(x, fSigma);\
                        vec2 uvOffset = direction * invSize * x;\
                        vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;\
                        vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;\
                        diffuseSum += (sample1 + sample2) * w;\
                        weightSum += 2.0 * w;\
                    }\
                    gl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n\
                }"
        } );*/
    },

    getCompositeMaterial: function(nMips) {

        return new THREE.ShaderMaterial( {

            defines:{
                "NUM_MIPS" : nMips
            },

            uniforms: {
                "blurTexture1": { value: null },
                "blurTexture2": { value: null },
                "blurTexture3": { value: null },
                "blurTexture4": { value: null },
                "blurTexture5": { value: null },
                "dirtTexture": { value: null },
                "bloomStrength" : { value: 1.0 },
                "bloomFactors" : { value: null },
                "bloomTintColors" : { value: null },
                "bloomRadius" : { value: 0.0 }
            },

            vertexShader:
                "varying vec2 vUv;\n\
                void main() {\n\
                    vUv = uv;\n\
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                }",

            fragmentShader:
                "varying vec2 vUv;\
                uniform sampler2D blurTexture1;\
                uniform sampler2D blurTexture2;\
                uniform sampler2D blurTexture3;\
                uniform sampler2D blurTexture4;\
                uniform sampler2D blurTexture5;\
                uniform sampler2D dirtTexture;\
                uniform float bloomStrength;\
                uniform float bloomRadius;\
                uniform float bloomFactors[NUM_MIPS];\
                uniform vec3 bloomTintColors[NUM_MIPS];\
                \
                float lerpBloomFactor(const in float factor) { \
                    float mirrorFactor = 1.2 - factor;\
                    return mix(factor, mirrorFactor, bloomRadius);\
                }\
                \
                void main() {\
                    gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) + \
                                                 lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) + \
                                                 lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) + \
                                                 lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) + \
                                                 lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );\
                }"
        } );
    }

} );

THREE.UnrealBloomPass.BlurDirectionX = new THREE.Vector2( 1.0, 0.0 );
THREE.UnrealBloomPass.BlurDirectionY = new THREE.Vector2( 0.0, 1.0 );





// SHADER //////////////////:




/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

    uniforms: {

        "tDiffuse": { value: null },
        "opacity":  { value: 1.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform float opacity;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

            "vec4 texel = texture2D( tDiffuse, vUv );",
            "gl_FragColor = opacity * texel;",

        "}"

    ].join( "\n" )

};

/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

THREE.FXAAShader = {

    uniforms: {

        "tDiffuse":   { value: null },
        "resolution": { value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

    },

    vertexShader: [

        "void main() {",

            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform vec2 resolution;",

        "#define FXAA_REDUCE_MIN   (1.0/128.0)",
        "#define FXAA_REDUCE_MUL   (1.0/8.0)",
        "#define FXAA_SPAN_MAX     8.0",

        "void main() {",

            "vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;",
            "vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;",
            "vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;",
            "vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;",
            "vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );",
            "vec3 rgbM  = rgbaM.xyz;",
            "vec3 luma = vec3( 0.299, 0.587, 0.114 );",

            "float lumaNW = dot( rgbNW, luma );",
            "float lumaNE = dot( rgbNE, luma );",
            "float lumaSW = dot( rgbSW, luma );",
            "float lumaSE = dot( rgbSE, luma );",
            "float lumaM  = dot( rgbM,  luma );",
            "float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );",
            "float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );",

            "vec2 dir;",
            "dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));",
            "dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));",

            "float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );",

            "float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );",
            "dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),",
                  "max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),",
                        "dir * rcpDirMin)) * resolution;",
            "vec4 rgbA = (1.0/2.0) * (",
            "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (1.0/3.0 - 0.5)) +",
            "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (2.0/3.0 - 0.5)));",
            "vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (",
            "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (0.0/3.0 - 0.5)) +",
            "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (3.0/3.0 - 0.5)));",
            "float lumaB = dot(rgbB, vec4(luma, 0.0));",

            "if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {",

                "gl_FragColor = rgbA;",

            "} else {",
                "gl_FragColor = rgbB;",

            "}",

        "}"

    ].join( "\n" )

};



/**
 * @author bhouston / http://clara.io/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityHighPassShader = {

  shaderID: "luminosityHighPass",

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "luminosityThreshold": { type: "f", value: 1.0 },
        "smoothWidth": { type: "f", value: 1.0 },
        "defaultColor": { type: "c", value: new THREE.Color( 0x000000 ) },
        "defaultOpacity":  { type: "f", value: 0.0 },

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",

            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform vec3 defaultColor;",
        "uniform float defaultOpacity;",
        "uniform float luminosityThreshold;",
        "uniform float smoothWidth;",

        "varying vec2 vUv;",

        "void main() {",

            "vec4 texel = texture2D( tDiffuse, vUv );",

            "vec3 luma = vec3( 0.299, 0.587, 0.114 );",

            "float v = dot( texel.xyz, luma );",

            "vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );",

            "float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );",

            "gl_FragColor = mix( outputColor, texel, alpha );",

        "}"

    ].join("\n")

};


/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

    defines: {

        "KERNEL_SIZE_FLOAT": "25.0",
        "KERNEL_SIZE_INT": "25",

    },

    uniforms: {

        "tDiffuse":        { value: null },
        "uImageIncrement": { value: new THREE.Vector2( 0.001953125, 0.0 ) },
        "cKernel":         { value: [] }

    },

    vertexShader: [

        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform float cKernel[ KERNEL_SIZE_INT ];",

        "uniform sampler2D tDiffuse;",
        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

            "vec2 imageCoord = vUv;",
            "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

            "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

                "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
                "imageCoord += uImageIncrement;",

            "}",

            "gl_FragColor = sum;",

        "}"


    ].join( "\n" ),

    buildKernel: function ( sigma ) {

        // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

        function gauss( x, sigma ) {

            return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

        }

        var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

        if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
        halfWidth = ( kernelSize - 1 ) * 0.5;

        values = new Array( kernelSize );
        sum = 0.0;
        for ( i = 0; i < kernelSize; ++ i ) {

            values[ i ] = gauss( i - halfWidth, sigma );
            sum += values[ i ];

        }

        // normalize the kernel

        for ( i = 0; i < kernelSize; ++ i ) values[ i ] /= sum;

        return values;

    }

};
