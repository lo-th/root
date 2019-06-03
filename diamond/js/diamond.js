//var DiamondNormalMaterial = new THREE.ShaderMaterial( NormalMapCaptureShader );


// --------------------------------
//  DIAMOND MATERIAL
// --------------------------------

var Diamond = function ( geometry, envMap, env, renderer, camera ) {

    this.sparkles = [];
    this.geometry = geometry;
    this.geometry.computeBoundingBox();
    this.offset = new THREE.Vector3();
    this.geometry.boundingBox.getCenter( this.offset );
    this.geometry.computeBoundingSphere();
    this.boundingRadius = this.geometry.boundingSphere.radius;

    this.material = new DiamondMaterial( geometry, envMap );
    this.material.uniforms.centreOffset.value.copy( this.offset );
    this.material.uniforms.radius.value = this.boundingRadius;
    this.material.uniforms.envMap.value = envMap;
    this.material.envMap = envMap;

    this.camera = camera;

    this.needUp = true;

    this.settings = {

        mFresnelBias: 0.02,
        mFresnelScale: 0.1,
        mFresnelPower: 1,
        aberration: .012,
        refraction: 2.417,
        normalOffset: 0,
        squashFactor: 0.98,
        distanceOffset: 0,
        geometryFactor: 0.28,
        absorbption: [0, 0, 0],
        correction: [1, 1, 1],
        boost:[.892, .892, .98595025],

    }

    //his.material = this.tmpMaterial//.clone();

	THREE.Mesh.call( this, this.geometry, this.material );

}

Diamond.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

	constructor: Diamond,

    updateMaterial: function () {

        for( var n in this.settings ){

            //console.log(n)

            if( n==='absorbption' || n==='correction' || n==='boost' ) this.material.uniforms[n].value.setRGB(this.settings[n][0], this.settings[n][1], this.settings[n][2])//console.log(this.settings[n])
            else this.material.uniforms[n].value = this.settings[n];
        }



    },

	updateMatrixWorld: function ( force ) {
		THREE.Mesh.prototype.updateMatrixWorld.call( this, force );
        if(this.needUp){
            this.material.uniforms.invMat.value = new THREE.Matrix4().getInverse( this.matrixWorld );
            this.needUp = false;
        }

        this.update();
		
	},

	update: function () {

        var t = new THREE.Vector3();

        for (var o = 0; o < this.sparkles.length; o++) {

            this.sparkles[o].syncWithTransform( this.matrixWorld );
            t.copy(this.camera.position);
            t.sub( this.sparkles[o].position );
            t.normalize();
            var i = t.x + t.y + t.z;
            this.sparkles[o].setRotation( i * this.sparkles[o].rotationSpeedFactor );
            this.sparkles[o].alignWithCamera( this.camera );

        }

    },

    addSparkles: function( n, s ) {

        var loader = new THREE.TextureLoader();
        var tx = loader.load( Math.random() >0.5? './assets/textures/sparkle1.png': './assets/textures/sparkle0.png' );
        var noise = loader.load( './assets/textures/noise.png' );

        while(n--){
            var sp = new Sparcle( tx, noise );
            var y = this.offset.y+this.geometry.boundingBox.max.y;// + (Math.random() - 0.5) * this.boundingRadius;
            var x = this.offset.x + (Math.random() - 0.5) * this.boundingRadius;
            var z = this.offset.z + (Math.random() - 0.5) * this.boundingRadius;
            sp.setPositionOffset(x, y, z);
            let scale = s * (Math.random()*this.boundingRadius/5 + this.boundingRadius/5);
            sp.setScale(scale);
            this.add(sp)
            this.sparkles.push( sp );
        }

    }

});

// --------------------------------
//  DIAMOND MATERIAL
// --------------------------------

var DiamondMaterial = function ( geometry ) {

    //this.envMap = envMap;
    this.cubeCamera = new THREE.CubeCamera( 0.1, 100, 1024, { format: THREE.RGBAFormat, magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter } );
    //this.cubeCamera.renderTarget.texture.generateMipmaps = false
    this.localScene = new THREE.Scene();
    this.localScene.add( this.cubeCamera );

    this.normalBakeHelperMesh = new THREE.Mesh( geometry.clone(), new THREE.ShaderMaterial( NormalMapCaptureShader ) )
    this.normalBakeHelperMesh.geometry.center();

    this.geometry = this.normalBakeHelperMesh.geometry;
    this.geometry.computeVertexNormals()
    this.geometry.computeBoundingBox();
    this.offset = new THREE.Vector3();
    this.geometry.boundingBox.getCenter( this.offset );
    this.geometry.computeBoundingSphere();
    this.normalBakeHelperMesh.position.set(0, 0, 0);
    this.normalBakeHelperMesh.rotation.set(0, 0, 0);
    this.normalBakeHelperMesh.quaternion.set(0, 0, 0, 1);
    this.normalBakeHelperMesh.scale.set(1, 1, 1);

    this.localScene.add( this.normalBakeHelperMesh );

    THREE.ShaderMaterial.call( this, DiamondShader );

    this.uniforms = THREE.UniformsUtils.clone( this.uniforms );
    //this.uniforms.envMap.value = this.envMap;
    this.prepareNormalsCubeMap( renderer );


}

DiamondMaterial.prototype = Object.assign( Object.create( THREE.ShaderMaterial.prototype ), {

	/*clone: function () {
        var m = new THREE.ShaderMaterial();
        m.uniforms = THREE.UniformsUtils.clone( this.uniforms );
        //m.extensions = this.extensions;
        m.defines = this.defines;
        m.uniforms.tCubeMapNormals.value = this.cubeCamera.renderTarget.texture;
        m.uniforms.envMap.value = this.envMap;
        m.envMap = this.envMap;
        m.vertexShader = this.vertexShader;
        m.fragmentShader = this.fragmentShader;
        m.needsUpdate = true;
        return m;
    },*/

    prepareNormalsCubeMap: function ( renderer ) {

        //if( !this.needsNormalsUpdate ) return;

        this.cubeCamera.update( renderer, this.localScene );
        this.uniforms.tCubeMapNormals.value = this.cubeCamera.renderTarget.texture;
        //this.material.uniforms.invMat.value = new THREE.Matrix4().getInverse( this.mesh.matrixWorld )
        this.needsUpdate = true;
       // this.needsNormalsUpdate = false;

    },

});

// --------------------------------
// SPARCLE
// --------------------------------
var Sparcle = function ( texture, noiseTexture ) {
    
    this.geometry = new THREE.PlaneGeometry(1, 1, 0), 
    this.material = new THREE.ShaderMaterial( SparkleShader );
    this.material.uniforms = THREE.UniformsUtils.clone( SparkleShader.uniforms ); 
    this.material.uniforms.sparkleTexture.value = texture || null;
    this.material.uniforms.noiseTexture.value = noiseTexture || null;

    this.modelViewMatrix = new THREE.Matrix4();
    this.positionOffset = new THREE.Vector3(Math.random()+2, Math.random()+2, Math.random()+2);
    //void 0 !== this.texture && (this.material.uniforms.sparkleTexture.value = e);
    //void 0 !== this.noiseTexture && (this.material.uniforms.noiseTexture.value = t);
    //this.mesh = new THREE.Mesh( this.geometry, this.material );
    
    this.rotationSpeedFactor = 5;

    THREE.Mesh.call( this, this.geometry, this.material );

}

Sparcle.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {
    /*shallowCopy: function () {
        var t = new e(this.texture, this.noiseTexture);
        return t.mesh.positionOffset = new THREE.Vector3, t.mesh.positionOffset.copy(this.mesh.positionOffset), t.material.uniforms.scale.value = this.material.uniforms.scale.value, t.material.uniforms.rotation.value = this.material.uniforms.rotation.value, t.material.uniforms.intensity.value = this.material.uniforms.intensity.value, t.material.uniforms.screenTexture.value = this.material.uniforms.screenTexture.value, t.material.uniforms.noiseTexture.value = this.material.uniforms.noiseTexture.value, t.material.uniforms.ModelViewMatrix.value.copy(this.material.uniforms.ModelViewMatrix.value), t.rotationSpeedFactor = this.rotationSpeedFactor, t
    },*/
    setScale: function (e) {
        this.material.uniforms.scale.value = e;
    },
    setIntensity: function (e) {
        this.material.uniforms.intensity.value = e;
    },
    setRotation: function (e) {
        this.material.uniforms.rotation.value = e;
    },
    setRotationSpeedFactor: function (e) {
        this.rotationSpeedFactor = e;
    },
    setPositionOffset: function (e, t, o) {
        this.positionOffset.x = e;
        this.positionOffset.y = t;
        this.positionOffset.z = o;
        this.position.copy( this.positionOffset );
        this.updateMatrix();
    },
    alignWithCamera: function ( e ) {
        this.modelViewMatrix.multiplyMatrices( e.matrixWorldInverse, this.matrix );
        this.material.uniforms.ModelViewMatrix.value.copy( this.modelViewMatrix );
    },
    syncWithTransform: function (mat, pos) {
        this.position.copy( this.positionOffset );
        //this.position.add(pos);
        this.position.applyMatrix4(mat);
        this.updateMatrix();
    },
});
// --------------------------------
// SHADERS
// --------------------------------

var NormalMapCaptureShader = {
    vertexShader: ["varying vec3 vNormalm;", "void main() {", "vNormalm = normal;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["varying vec3 vNormalm;", "void main() {", "vec3 color = normalize(vNormalm);", "color = color * 0.5 + 0.5;", "gl_FragColor = vec4( color.x, color.y, color.z, 1.0 );", "}"].join("\n"),
    side: THREE.DoubleSide
}

var DiamondShader = {
    defines: {
        RAY_BOUNCES: 5
    },
    uniforms: {
        tCubeMapNormals: { value: null },
        envMap: { value: null },
        bDebugBounces: { value: 0 },
        //envRefractionMap: {  value: null },
        sphereMap: { value: null },
        envMapIntensity: { value: 1 },
        //maxBounces: { value: 5 },//1
        //tanAngleSqCone: { value: 0 },//0
        //coneHeight: { value: 0 },//0

        mFresnelBias: { value: 0.02 },//0.1
        mFresnelScale: { value:0.1},//1
        mFresnelPower: { value: 1 },//2

        //glowStart: { value: 0.1 },//2
        //glowEnd: { value: 0.8 },//2
        
        aberration: { value: .012 },//.012
        refraction: { value: 2.417 },//2.4
        
        normalOffset: { value: 0 },
        squashFactor: { value: .98 },//.98
        distanceOffset: { value: 0 }, // 0
        geometryFactor: { value: 0.28 },//.28
        absorbption: { value: new THREE.Color(0, 0, 0) },
        correction: { value: new THREE.Color(1, 1, 1) },
        boost: { value: new THREE.Color(.892, .892, .98595025) },
        // from geometry
        radius: { value: 1 },
        centreOffset: { value: new THREE.Vector3(0, 0, 0)  },
        invMat: { value: new THREE.Matrix4() },
    },
    vertexShader: [
        "varying vec2 vUv;", 
        "varying vec3 vNormal;", 
        "varying vec3 worldNormal;",
        "varying vec3 vecPos;", 
        //"varying vec3 viewPos;", 
        "varying vec3 vI;",
        "varying vec3 vEye;",

        "void main() {", 
            "vUv = uv;",
            "vNormal = normalize(normal);",
            //"vNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",
            //"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
            
            

            "worldNormal = (modelMatrix * vec4(normal,0.0)).xyz;",
            "vecPos = (modelMatrix * vec4(position, 1.0 )).xyz;",

            "vEye = normalize(-cameraPosition);",//cameraPosition;",
            "vI = vecPos - cameraPosition;",
            //"viewPos = (modelViewMatrix * vec4(position, 1.0 )).xyz;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),
    fragmentShader: [
        
        "varying vec2 vUv;", 
        "varying vec3 vNormal;", 
        "varying vec3 worldNormal;", 
        "varying vec3 vecPos;", 
        //"varying vec3 viewPos;",
        "varying vec3 vI;",
        "varying vec3 vEye;",

        "uniform samplerCube tCubeMapNormals;", 
        "uniform samplerCube envMap;", 
        //"uniform samplerCube envRefractionMap;", 
        "uniform sampler2D sphereMap;", 
        "uniform float envMapIntensity;", 
        //"uniform float tanAngleSqCone;", 
        //"uniform float coneHeight;", 
        //"uniform int maxBounces;", 
        "uniform mat4 modelMatrix;", 
        "uniform mat4 invMat;", 
        //"uniform mat4 invModelMatrix;", 
        "uniform float refraction;", 
        "uniform float radius;", 
        "uniform bool bDebugBounces;", 
        "uniform float aberration;", 
        "uniform float normalOffset;", 
        "uniform float squashFactor;", 
        "uniform float distanceOffset;", 
        "uniform float geometryFactor;", 
        "uniform vec3 absorbption;", 
        "uniform vec3 correction;", 
        "uniform vec3 boost;", 
        "uniform vec3 centreOffset;", 

        "uniform float mFresnelBias;",
        "uniform float mFresnelScale;",
        "uniform float mFresnelPower;",

        //"uniform float glowStart;",
        //"uniform float glowEnd;",

        /*"mat4 inverseMAT4(mat4 m) {",

            "float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3], a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3], a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3], a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],",

            "b00 = a00 * a11 - a01 * a10,",
            "b01 = a00 * a12 - a02 * a10,",
            "b02 = a00 * a13 - a03 * a10,",
            "b03 = a01 * a12 - a02 * a11,",
            "b04 = a01 * a13 - a03 * a11,",
            "b05 = a02 * a13 - a03 * a12,",
            "b06 = a20 * a31 - a21 * a30,",
            "b07 = a20 * a32 - a22 * a30,",
            "b08 = a20 * a33 - a23 * a30,",
            "b09 = a21 * a32 - a22 * a31,",
            "b10 = a21 * a33 - a23 * a31,",
            "b11 = a22 * a33 - a23 * a32,",

          "det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;",

          "return mat4( a11 * b11 - a12 * b10 + a13 * b09, a02 * b10 - a01 * b11 - a03 * b09, a31 * b05 - a32 * b04 + a33 * b03, a22 * b04 - a21 * b05 - a23 * b03, a12 * b08 - a10 * b11 - a13 * b07,",
              "a00 * b11 - a02 * b08 + a03 * b07, a32 * b02 - a30 * b05 - a33 * b01, a20 * b05 - a22 * b02 + a23 * b01, a10 * b10 - a11 * b08 + a13 * b06, a01 * b08 - a00 * b10 - a03 * b06,",
              "a30 * b04 - a31 * b02 + a33 * b00, a21 * b02 - a20 * b04 - a23 * b00, a11 * b07 - a10 * b09 - a12 * b06, a00 * b09 - a01 * b07 + a02 * b06, a31 * b01 - a30 * b03 - a32 * b00,",
              "a20 * b03 - a21 * b01 + a22 * b00) / det;",
        "}",*/

        "vec3 BRDF_Specular_GGX_EnvironmentTest( const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float roughness ) {",
            "float dotNV = abs( dot( normal, viewDir ) );",
            "const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );", 
            "const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );", 
            "vec4 r = roughness * c0 + c1;", 
            "float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;", 
            "vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;", 
            "return specularColor * AB.x + AB.y;", 
        "}", 

        "vec4 SampleSpecularReflectionTest( vec4 specularColor, vec3 direction ) {",
            "direction.x *= -1.0;", "direction.z *= -1.0;",
            "vec3 tempDir = normalize(vec3(0., 0., 1.) + direction);", 
            "vec4 sampleColorRGB = envMapIntensity * envMapTexelToLinear( textureCube( envMap, direction ) );", 
            "vec4 sampleColorRefraction = envMapIntensity * ( texture2D( sphereMap, tempDir.xy * 0.5 + 0.5 ) );", 
            "vec3 toneMappedColor = pow(abs(toneMapping(sampleColorRGB.rgb)),vec3(1./1.));", 
            "return vec4(toneMappedColor, 1.0);", 
        "}", 

        "vec4 SampleSpecularContributionTest(vec4 specularColor, vec3 direction ) {", 
            "direction = normalize(direction);", 
            "direction.x *= -1.0;", 
            "direction.z *= -1.0;", 
            "vec4 sampleColorRGB = envMapIntensity * envMapTexelToLinear( textureCube( envMap, direction ) );", 
            "vec3 tempDir = normalize(vec3(0., 0., 1.) + direction);", 
            "float m = 2.8284271247461903 * sqrt( direction.z+1.0 );", 
            "vec4 sampleColorRefraction = envMapIntensity * texture2D( sphereMap, clamp(direction.xy / m + 0.45, vec2(0.), vec2(1.)) );",
            "vec3 toneMappedColor = pow(abs(toneMapping( sampleColorRGB.rgb )),vec3(1./1.));", 
            "return vec4(toneMappedColor, 1.0);", 
        "}", 

        "vec3 intersectSphereTest(vec3 origin, vec3 direction) {", 
            "origin -= centreOffset;", "direction.y /= squashFactor;", 
            "float A = dot(direction, direction);",
            "float B = 2.0*dot(origin, direction);", 
            "float C = dot(origin, origin) - radius * radius;", 
            "float disc = B*B - 4.0 * A * C;", 
            "if(disc > 0.0){", 
                "disc = sqrt(disc);", 
                "float t1 = (-B + disc)*geometryFactor/A;", 
                "float t2 = (-B - disc)*geometryFactor/A;", 
                "float t = (t1 > t2) ? t1 : t2;", 
                "direction.y *= squashFactor;", 
                "return vec3(origin + centreOffset + direction * t);",
             "}", 
             "return vec3(0.0);", 
        "}", 

        "vec3 debugBounces(int count) {", 
            "vec3 color = vec3(1.,1.,1.);", 
            "if(count == 1)", 
            "color = vec3(0.0,1.0,0.0);", 
            "else if(count == 2)", 
            "color = vec3(0.0,0.0,1.0);", 
            "else if(count == 3)", 
            "color = vec3(1.0,1.0,0.0);", 
            "else if(count == 4)", 
            "color = vec3(0.0,1.0,1.0);", 
            "else", 
            "color = vec3(0.0,1.0,0.0);", 
            "if(count == 0)", 
            "color = vec3(1.0,0.0,0.0);", 
            "return color;", 
        "}",

        "vec3 traceRayTest( vec3 origin, vec3 direction, vec3 normal ) {", 

            //"mat4 invModelMat = inverseMAT4(modelMatrix);",
            "mat4 invModelMat = invMat;",

            "vec3 outColor = vec3(0.0);", 
            // Reflect/Refract ray entering the diamond 
            "const float n1 = 1.0;", 
            "const float epsilon = 1e-4;", 
            "float f0 = (2.4- n1)/(2.4 + n1);", 
            "f0 *= f0;", 
            "vec3 attenuationFactor = vec3(1.0);",
            "vec3 newDirection = refract(direction, normal, n1/refraction);", 
            "vec3 reflectedDirection = reflect(direction, normal);", 
            "vec3 brdfReflected = BRDF_Specular_GGX_EnvironmentTest(reflectedDirection, normal, vec3(f0), 0.0);", 
            "vec3 brdfRefracted = BRDF_Specular_GGX_EnvironmentTest(newDirection, -normal, vec3(f0), 0.0);", 
            "attenuationFactor *= ( vec3(1.0) - brdfRefracted);", 
            "outColor += SampleSpecularReflectionTest(vec4(1.0), reflectedDirection ).rgb * brdfReflected;", 
            "int count = 0;",
            //"newDirection = (invModelMatrix * vec4(newDirection, 0.0)).xyz;", 
            "newDirection = (invModelMat * vec4(newDirection, 0.0)).xyz;", 
            "newDirection = normalize(newDirection);", 
            //"origin = (invModelMatrix * vec4(origin, 1.0)).xyz;", 
            "origin = (invModelMat * vec4(origin, 1.0)).xyz;",

            // ray bounces 
            "for( int i=0; i<RAY_BOUNCES; i++) { ",

                "vec3 intersectedPos;", 
                "intersectedPos = intersectSphereTest(origin + vec3(epsilon), newDirection);", 
                "vec3 dist = intersectedPos - origin;", 
                "vec3 d = normalize(intersectedPos - centreOffset);",
                "vec3 mappedNormal = textureCube( tCubeMapNormals, d ).xyz;", 
                "mappedNormal = 2. * mappedNormal - 1.;", "mappedNormal.y += normalOffset;", 
                "mappedNormal = normalize(mappedNormal);", 
                "dist = (modelMatrix * vec4(dist, 1.)).xyz;", 
                "float r = sqrt(dot(dist, dist));", 
                "attenuationFactor *= exp(-r*absorbption);", 
                // refract the ray at first intersection 
                "vec3 oldOrigin = origin;", 
                "origin = intersectedPos - normalize(intersectedPos - centreOffset) * distanceOffset;", 
                "vec3 oldDir = newDirection;", 
                "newDirection = refract(newDirection, mappedNormal, refraction/n1);", 
                 
                "if( dot(newDirection, newDirection) == 0.0) { ", // Total Internal Reflection. Continue inside the diamond
                    "newDirection = reflect(oldDir, mappedNormal);", 
                     //If the ray got trapped even after max iterations, simply sample along the outgoing refraction!
                    "if(i == RAY_BOUNCES-1 ) {", 
                        "vec3 brdfReflected = BRDF_Specular_GGX_EnvironmentTest(-oldDir, mappedNormal, vec3(f0), 0.0);", 
                        "vec3 d1 = (modelMatrix * vec4(oldDir, 0.0)).xyz;", 
                        "outColor += SampleSpecularContributionTest(vec4(1.0), d1 ).rgb * correction * attenuationFactor  * boost * (vec3(1.0) - brdfReflected);", 
                        //"outColor = vec3(1.,0.,0.);", 
                        //"if(d1.y > 0.95) outColor += d1.y * vec3(1.,0.,0) * attenuationFactor * (vec3(1.0) - brdfReflected) * boost;",
                    "}", 
                
                "} else { ", // Add the contribution from outgoing ray, and continue the reflected ray inside the diamond 
                   "vec3 brdfRefracted = BRDF_Specular_GGX_EnvironmentTest(newDirection, -mappedNormal, vec3(f0), 0.0);",
                   // outgoing(refracted) ray's contribution
                   "vec3 d1 = (modelMatrix * vec4(newDirection, 0.0)).xyz;",
                   "vec3 colorG = SampleSpecularContributionTest(vec4(1.0), d1 ).rgb * ( vec3(1.0) - brdfRefracted);", "vec3 dir1 = refract(oldDir, mappedNormal, (refraction+aberration)/n1);", "vec3 dir2 = refract(oldDir, mappedNormal, (refraction-aberration)/n1);", 
                   "vec3 d2 = (modelMatrix * vec4(dir1, 0.0)).xyz;", 
                   "vec3 d3 = (modelMatrix * vec4(dir2, 0.0)).xyz;", 
                   "vec3 colorR = SampleSpecularContributionTest(vec4(1.0), d2 ).rgb * ( vec3(1.0) - brdfRefracted);", 
                   "vec3 colorB = SampleSpecularContributionTest(vec4(1.0), d3 ).rgb * ( vec3(1.0) - brdfRefracted);", 
                   "outColor += vec3(colorR.r, colorG.g, colorB.b) * correction * attenuationFactor * boost;", 
                   //"outColor = oldDir;",
                   //new reflected ray inside the diamond "
                   "newDirection = reflect(oldDir, mappedNormal);", 
                   "vec3 brdfReflected = BRDF_Specular_GGX_EnvironmentTest(newDirection, mappedNormal, vec3(f0), 0.0);", 
                   "attenuationFactor *= brdfReflected * boost;", 
                   "count++;",
                "}", 
            "}", 
            "if(bDebugBounces) outColor = debugBounces(count);", 
            //"outColor = (textureCube( tCubeMapNormals, direction )).rgb;",//vec3(outColor.r,1.0, outColor.b);",
            //"outColor = texture2D( sphereMap, vUv ).rgb;",
            "return outColor;",
        "}", 

        "void main() {", 

            "float vReflectionFactor = mFresnelBias + mFresnelScale * pow( abs((1.0 + dot( normalize( vI ), vNormal ))), mFresnelPower );",

            "vec3 normalizedNormal = normalize( worldNormal );",
            "vec3 viewVector = normalize( vI );",
            "vec3 refractedColor = traceRayTest( vecPos, viewVector, normalizedNormal );", 
            //"vec3 colorTT = vec3( 1.0,0.0,0.0 );",
            "vec3 vReflect = reflect( vI, vNormal );",
            "vec3 reflectedColor = vec3( 1.0 );",
            "reflectedColor.rgb = textureCube( envMap, vec3( -vReflect.x, vReflect.yz ) ).rgb;",
            //"reflectedColor.rgb = vec3( 0.0,1.0,0.0 );",

            //"float rim = 1.0 - smoothstep( glowStart, glowEnd, 1.0 - dot( vNormal, normalize( vI ) ));",

            "vec3 finalColor = mix( refractedColor , reflectedColor , clamp( vReflectionFactor, 0.0, 1.0 ) );",
            //"vec3 finalColor = mix( refractedColor, reflectedColor , clamp( rim, 0.0, 1.0 ) );",

            "gl_FragColor = vec4( finalColor, 0.9);",
            "#include <tonemapping_fragment>", 
            //"#include <encodings_fragment>",
        "}"
    ].join("\n"),
    
    side: THREE.DoubleSide,
    transparent:true,
    //depthTest: true, 
    //depthWrite: false,
    //flatShading:true,
}

var SparkleShader = {
    uniforms: {
        ModelViewMatrix: { value: new THREE.Matrix4().identity() },
        sparkleTexture: { value: null },
        //screenTexture: { value: null },
        noiseTexture: { value: null },
        scale: { value: 1 },
        rotation: { value: 0 },
        intensity: { value: 1 }
    },
    vertexShader: [
        "varying vec2 vUv;", 
        "varying vec4 sparkleProjectedCentre;", 
        "uniform mat4 ModelViewMatrix;", 
        "uniform float scale;", 
        "uniform float rotation;", 
        "void main() { ", "vUv = uv; ", 
            "vec4 finalPosition;", 
            "vec2 alignedPosition = position.xy * scale;", 
            "vec2 rotatedPosition;", 
            "rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;", 
            "rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;", 
            "finalPosition = ModelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );", "finalPosition.xy += rotatedPosition;", 
            "finalPosition = projectionMatrix * finalPosition;", "sparkleProjectedCentre = projectionMatrix * ModelViewMatrix * vec4(0.0,0.0,0.0,1.0 );", 
            "gl_Position = finalPosition;", 
        "}"
    ].join("\n"),
    fragmentShader: [
        "varying vec2 vUv;", 
        "varying vec4 sparkleProjectedCentre;", 
        "uniform sampler2D sparkleTexture;", 
        //"uniform sampler2D screenTexture;", 
        "uniform sampler2D noiseTexture;", 
        "uniform float intensity;", 
        /*"vec3 ClosestPrimaryColor(vec3 color) {",

            "vec3 diffColor1 = vec3(1.0,0.0,0.0) - color;", 
            "vec3 diffColor2 = vec3(0.0,1.0,0.0) - color;", 
            "vec3 diffColor3 = vec3(0.0,0.0,1.0) - color;", 
            "const float margin = 0.5; ", 
            "if(dot(diffColor1, diffColor1) < margin)", 
            "return vec3(1.0, margin, margin); ", 
            "if(dot(diffColor2, diffColor2) < margin)", 
            "return vec3(margin, 1.0, margin);", 
            "if(dot(diffColor3, diffColor3) < margin)", 
            "return vec3(margin, margin, 1.0);", 
            "return color;", 
        "}", */

        "void main() {", 
            "vec2 uv = (sparkleProjectedCentre.xy/sparkleProjectedCentre.w + 1.0)*0.5;", 
            //"vec4 screenColor = texture2D( screenTexture, uv );", 
            //"screenColor.rgb = ClosestPrimaryColor(screenColor.rgb);", 
            "float noise = texture2D( noiseTexture, uv ).r;", 
            //"screenColor.xyz *= screenColor.xyz;", 
            //"screenColor.xyz *= screenColor.xyz;", 
            //"screenColor.xyz *= screenColor.xyz;", 
            //"float luminance = dot(vec3(0.3, 0.59, 0.11), screenColor.xyz);", 
            //"luminance = luminance > 0.0 ? luminance : 0.0;", 
            //"vec4 spriteColor = vec4(1.) * texture2D( sparkleTexture, vUv ).a * screenColor * noise * intensity;", 

            "vec4 spriteColor = vec4(1.) * texture2D( sparkleTexture, vUv ).a * noise * intensity;",

            //"vec4 spriteColor = texture2D( sparkleTexture, vUv );",
            "gl_FragColor = spriteColor;", 
        "}"
    ].join("\n"),
    side: THREE.DoubleSide,
    //depthTest: false, 
    depthWrite: false,
    transparent: true,
    blending: THREE.AdditiveBlending
}