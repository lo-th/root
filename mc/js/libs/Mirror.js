/**
 * @author Slayvin / http://slayvin.net
 */

THREE.ShaderLib['mirror'] = {

	uniforms: { 
		"mirrorColor": { type: "c", value: new THREE.Color(0x7F7F7F) },
		"mirrorSampler": { type: "t", value: null },
		"textureMatrix" : { type: "m4", value: new THREE.Matrix4() },
		"alpha": { type: "f", value: 1.0 },
		"size": { type: "v2", value: new THREE.Vector2(512,512) },
		"power": { type: "f", value: 1.0 },
		"radius": { type: "f", value: 1.0 },
	},

	vertexShader: [

		"uniform mat4 textureMatrix;",
		"varying vec4 mirrorCoord;",

		"void main() {",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
			"mirrorCoord = textureMatrix * worldPosition;",
			"gl_Position = projectionMatrix * mvPosition;",
		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 mirrorColor;",
		"uniform sampler2D mirrorSampler;",
		"uniform float alpha;",
		"uniform float power;",
		"uniform float radius;",
		'uniform vec2 size;',

		"varying vec4 mirrorCoord;",

		'vec4 blurred(sampler2D map, vec2 UV, vec2 blur){',
		'    float weight[5];',
		'    weight[0] =  0.0162162162;',
		'    weight[1] =  0.0540540541;',
		'    weight[2] =  0.1216216216;',
		'    weight[3] =  0.1945945946;',
		'    weight[4] =  0.2270270270;',

		//'    weight[0] =  0.05;',
		//'    weight[1] =  0.09;',
		//'    weight[2] =  0.12;',
		//'    weight[3] =  0.15;',
		//'    weight[4] =  0.16;',

		'    vec4 sum = vec4(0.0);',
		'    sum += texture2D(map, vec2(UV.x - 4.0 * blur.x, UV.y - 4.0 * blur.y)) * weight[0];',
		'    sum += texture2D(map, vec2(UV.x - 3.0 * blur.x, UV.y - 3.0 * blur.y)) * weight[1];',
		'    sum += texture2D(map, vec2(UV.x - 2.0 * blur.x, UV.y - 2.0 * blur.y)) * weight[2];',
		'    sum += texture2D(map, vec2(UV.x - blur.x, UV.y - blur.y)) * weight[3];',
		'    sum += texture2D(map, vec2(UV.x, UV.y)) * weight[4];',
		'    sum += texture2D(map, vec2(UV.x + blur.x, UV.y + blur.y)) * weight[3];',
		'    sum += texture2D(map, vec2(UV.x + 2.0 * blur.x, UV.y + 2.0 * blur.y)) * weight[2];',
		'    sum += texture2D(map, vec2(UV.x + 3.0 * blur.x, UV.y + 3.0 * blur.y)) * weight[1];',
		'    sum += texture2D(map, vec2(UV.x + 4.0 * blur.x, UV.y + 4.0 * blur.y)) * weight[0];',
		'    return sum;',
		'}',

		'vec4 blurredTest(sampler2D map, vec2 UV, vec2 blur){',
		'    float offset[3];',
		'    offset[0] =  0.0;',
		'    offset[1] =  1.3846153846;',
		'    offset[2] =  3.2307692308;',
		'    float weight[3];',
		'    weight[0] =  0.2270270270;',
		'    weight[1] =  0.3162162162;',
		'    weight[2] =  0.0702702703;',
		'	 vec4 sum = texture2D( map, UV ) * weight[0];',
		'	 for (int i=1; i<3; i++){',
		'		 sum += texture2D( map, UV+( vec2(0.0,offset[i])/blur ) ) * weight[i];',
		'		 sum += texture2D( map, UV-( vec2(0.0,offset[i])/blur ) ) * weight[i];',
		'    }',
		'    return sum;',
		'}',

		"float blendOverlay(float base, float blend) {",
			"return( base < 0.5 ? ( 2.0 * base * blend ) : (1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );",
		"}",
		
		"void main() {",
		    'vec2 b0 = vec2(radius/size.x, radius/size.y)*power;',
		    //'vec2 b = vec2(size.x*power, size.y*power);',
		    'vec2 b = vec2(0, size.y*power);',
		    "vec2 unproj2D = vec2(mirrorCoord.x / mirrorCoord.z, mirrorCoord.y / mirrorCoord.z);",
		    "vec4 color = texture2D(mirrorSampler, unproj2D);",
		    //'vec4 color = blurredTest(mirrorSampler, unproj2D, b);',
		    //'vec4 color = blurred(mirrorSampler, unproj2D, b0);',
			//"vec4 color = texture2DProj(mirrorSampler, mirrorCoord);",
			"color = vec4(blendOverlay(mirrorColor.r, color.r), blendOverlay(mirrorColor.g, color.g), blendOverlay(mirrorColor.b, color.b), alpha);",

			"gl_FragColor = color;",

		"}"

	].join("\n")

};

THREE.Mirror = function ( renderer, camera, options, pos ) {

	THREE.Object3D.call( this );

	this.name = 'mirror_' + this.id;

	options = options || {};

	this.matrixNeedsUpdate = true;

	var width = options.textureWidth !== undefined ? options.textureWidth : 512;
	var height = options.textureHeight !== undefined ? options.textureHeight : 512;

	this.clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;

	var mirrorColor = options.color !== undefined ? new THREE.Color(options.color) : new THREE.Color(0x7F7F7F);
	var alpha = options.alpha !== undefined ? options.alpha : 1.0;
	var power = options.power !== undefined ? options.power : 1.0;
	var radius = options.radius !== undefined ? options.radius : 1.0;

	this.renderer = renderer;
	this.mirrorPlane = new THREE.Plane();
	this.normal = new THREE.Vector3( 0, 0, 1 );
	this.mirrorWorldPosition = new THREE.Vector3();
	this.cameraWorldPosition = new THREE.Vector3();
	this.rotationMatrix = new THREE.Matrix4();
	this.lookAtPosition = new THREE.Vector3(0, 0, -1);
	this.clipPlane = new THREE.Vector4();
	
	// For debug only, show the normal and plane of the mirror
	var debugMode = options.debugMode !== undefined ? options.debugMode : false;

	if ( debugMode ) {

		var arrow = new THREE.ArrowHelper(new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 0 ), 10, 0xffff80 );
		var planeGeometry = new THREE.Geometry();
		planeGeometry.vertices.push( new THREE.Vector3( -10, -10, 0 ) );
		planeGeometry.vertices.push( new THREE.Vector3( 10, -10, 0 ) );
		planeGeometry.vertices.push( new THREE.Vector3( 10, 10, 0 ) );
		planeGeometry.vertices.push( new THREE.Vector3( -10, 10, 0 ) );
		planeGeometry.vertices.push( planeGeometry.vertices[0] );
		var plane = new THREE.Line( planeGeometry, new THREE.LineBasicMaterial( { color: 0xffff80 } ) );

		this.add(arrow);
		this.add(plane);

	}

	if ( camera instanceof THREE.PerspectiveCamera ) {

		this.camera = camera;

	} else {

		this.camera = new THREE.PerspectiveCamera();
		//this.camera.position.set(-pos.x, pos.y, -pos.z);
		this.camera.position.set(-pos.x,pos.y, -pos.z);
		//this.camera.position.y = -pos.y
		//this.camera.position.copy(pos);
		//this.camera.position.z = -10
		console.log(pos)
		//this.camera.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z));
		this.camera.lookAt(this.position);
		THREE.log( this.name + ': camera is not a Perspective Camera!' );

	}

	this.textureMatrix = new THREE.Matrix4();

	this.mirrorCamera = this.camera.clone();
	this.mirrorCamera.matrixAutoUpdate = true;

	this.textureParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };

	this.texture = new THREE.WebGLRenderTarget( width, height, this.textureParameters );
	this.tempTexture = new THREE.WebGLRenderTarget( width, height, this.textureParameters );
	this.dummyTexture = new THREE.WebGLRenderTarget(1, 1);

	var mirrorShader = THREE.ShaderLib[ "mirror" ];
	var mirrorUniforms = THREE.UniformsUtils.clone( mirrorShader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		fragmentShader: mirrorShader.fragmentShader,
		vertexShader: mirrorShader.vertexShader,
		uniforms: mirrorUniforms

	} );

	this.material.uniforms.mirrorSampler.value = this.texture;
	this.material.uniforms.mirrorColor.value = mirrorColor;
	this.material.uniforms.alpha.value = alpha;
	this.material.uniforms.power.value = power;
	this.material.uniforms.radius.value = radius;
	this.material.uniforms.textureMatrix.value = this.textureMatrix;
	this.material.uniforms.size.value.set( width, height );

	if(alpha<1){
	    this.material.transparent = true;
	    this.material.depthWrite = false;
	}


	if ( !THREE.Math.isPowerOfTwo(width) || !THREE.Math.isPowerOfTwo( height ) ) {

		this.texture.generateMipmaps = false;
		this.tempTexture.generateMipmaps = false;

	}

	this.updateTextureMatrix();
	this.render();

};

THREE.Mirror.prototype = Object.create( THREE.Object3D.prototype );
THREE.Mirror.prototype.constructor = THREE.Mirror;

THREE.Mirror.prototype.resize = function ( w,h,camera ) {
	this.camera = camera;
	//this.textureMatrix = new THREE.Matrix4();
	this.mirrorCamera = this.camera.clone();
	this.mirrorCamera.matrixAutoUpdate = true;
	var width = w;
	var height = h;
	this.textureParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };
	this.texture = new THREE.WebGLRenderTarget( width, height, this.textureParameters );
	this.tempTexture = new THREE.WebGLRenderTarget( width, height, this.textureParameters );
	this.material.uniforms.mirrorSampler.value = this.texture;
	this.material.uniforms.size.value.set( width, height );
};

THREE.Mirror.prototype.renderWithMirror = function ( otherMirror ) {

	// update the mirror matrix to mirror the current view
	this.updateTextureMatrix();
	this.matrixNeedsUpdate = false;

	// set the camera of the other mirror so the mirrored view is the reference view
	var tempCamera = otherMirror.camera;
	otherMirror.camera = this.mirrorCamera;

	// render the other mirror in temp texture
	otherMirror.renderTemp();
	otherMirror.material.uniforms.mirrorSampler.value = otherMirror.tempTexture;

	// render the current mirror
	this.render();
	this.matrixNeedsUpdate = true;

	// restore material and camera of other mirror
	otherMirror.material.uniforms.mirrorSampler.value = otherMirror.texture;
	otherMirror.camera = tempCamera;

	// restore texture matrix of other mirror
	otherMirror.updateTextureMatrix();
};

THREE.Mirror.prototype.renderWithMirrors = function ( otherMirrors ) {

	// update the mirror matrix to mirror the current view
	this.updateTextureMatrix();
	this.matrixNeedsUpdate = false;

	// set the camera of the other mirror so the mirrored view is the reference view
	var i = otherMirrors.length;
	while(i--){
		var tempCamera = otherMirrors[i].camera;
	    otherMirrors[i].camera = this.mirrorCamera;

		// render the other mirror in temp texture
		otherMirrors[i].renderTemp();
		otherMirrors[i].material.uniforms.mirrorSampler.value = otherMirrors[i].tempTexture;
	}
	

	// render the current mirror
	this.render();
	this.matrixNeedsUpdate = true;

	i = otherMirrors.length;
	while(i--){

		// restore material and camera of other mirror
		otherMirrors[i].material.uniforms.mirrorSampler.value = otherMirrors[i].texture;
		otherMirrors[i].camera = tempCamera;

		// restore texture matrix of other mirror
		otherMirrors[i].updateTextureMatrix();
	}
};

THREE.Mirror.prototype.updateTextureMatrix = function () {

	this.updateMatrixWorld();
	this.camera.updateMatrixWorld();

	this.mirrorWorldPosition.setFromMatrixPosition( this.matrixWorld );
	this.cameraWorldPosition.setFromMatrixPosition( this.camera.matrixWorld );

	this.rotationMatrix.extractRotation( this.matrixWorld );

	this.normal.set( 0, 0, 1 );
	this.normal.applyMatrix4( this.rotationMatrix );

	var view = this.mirrorWorldPosition.clone().sub( this.cameraWorldPosition );
	view.reflect( this.normal ).negate();
	view.add( this.mirrorWorldPosition );

	this.rotationMatrix.extractRotation( this.camera.matrixWorld );

	this.lookAtPosition.set(0, 0, -1);
	this.lookAtPosition.applyMatrix4( this.rotationMatrix );
	this.lookAtPosition.add( this.cameraWorldPosition );

	var target = this.mirrorWorldPosition.clone().sub( this.lookAtPosition );
	target.reflect( this.normal ).negate();
	target.add( this.mirrorWorldPosition );

	this.up.set( 0, -1, 0 );
	this.up.applyMatrix4( this.rotationMatrix );
	this.up.reflect( this.normal ).negate();

	this.mirrorCamera.position.copy( view );
	this.mirrorCamera.up = this.up;
	this.mirrorCamera.lookAt( target );

	this.mirrorCamera.updateProjectionMatrix();
	this.mirrorCamera.updateMatrixWorld();
	this.mirrorCamera.matrixWorldInverse.getInverse( this.mirrorCamera.matrixWorld );

	// Update the texture matrix
	this.textureMatrix.set( 0.5, 0.0, 0.0, 0.5,
							0.0, 0.5, 0.0, 0.5,
							0.0, 0.0, 0.5, 0.5,
							0.0, 0.0, 0.0, 1.0 );
	this.textureMatrix.multiply( this.mirrorCamera.projectionMatrix );
	this.textureMatrix.multiply( this.mirrorCamera.matrixWorldInverse );

	// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
	// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
	this.mirrorPlane.setFromNormalAndCoplanarPoint( this.normal, this.mirrorWorldPosition );
	this.mirrorPlane.applyMatrix4( this.mirrorCamera.matrixWorldInverse );

	this.clipPlane.set( this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant );

	var q = new THREE.Vector4();
	var projectionMatrix = this.mirrorCamera.projectionMatrix;

	q.x = ( Math.sign(this.clipPlane.x) + projectionMatrix.elements[8] ) / projectionMatrix.elements[0];
	q.y = ( Math.sign(this.clipPlane.y) + projectionMatrix.elements[9] ) / projectionMatrix.elements[5];
	q.z = - 1.0;
	q.w = ( 1.0 + projectionMatrix.elements[10] ) / projectionMatrix.elements[14];

	// Calculate the scaled plane vector
	var c = new THREE.Vector4();
	c = this.clipPlane.multiplyScalar( 2.0 / this.clipPlane.dot(q) );

	// Replacing the third row of the projection matrix
	projectionMatrix.elements[2] = c.x;
	projectionMatrix.elements[6] = c.y;
	projectionMatrix.elements[10] = c.z + 1.0 - this.clipBias;
	projectionMatrix.elements[14] = c.w;

};

THREE.Mirror.prototype.render = function () {

	if ( this.matrixNeedsUpdate ) this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	// Render the mirrored view of the current scene into the target texture
	var scene = this;

	while ( scene.parent !== undefined ) {

		scene = scene.parent;

	}

	if ( scene !== undefined && scene instanceof THREE.Scene) {
		this.material.uniforms.mirrorSampler.value = this.dummyTexture;
		this.renderer.render( scene, this.mirrorCamera, this.texture, true );
		this.material.uniforms.mirrorSampler.value = this.texture;

	}

};

THREE.Mirror.prototype.renderTemp = function () {

	if ( this.matrixNeedsUpdate ) this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	// Render the mirrored view of the current scene into the target texture
	var scene = this;

	while ( scene.parent !== undefined ) {

		scene = scene.parent;

	}

	if ( scene !== undefined && scene instanceof THREE.Scene) {

		this.renderer.render( scene, this.mirrorCamera, this.tempTexture, true );

	}

};
