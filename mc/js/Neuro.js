var Neuro={};

Neuro.LineShader={
	attributes:{
		//opacityAttr:{ type: 'f', value: [] }
	},	
	uniforms:{
		opacityMultiplier: { type: 'f', value: 1.0 },
		color: { type:'c', value: new THREE.Color(0x323436) },
	},
	fs:[
		'uniform vec3 color;',
		'varying float opacityNew;',
		'void main(){',
		'    gl_FragColor = vec4(color, opacityNew);',
		'}'
	].join('\n'),
	vs:[
		'uniform float opacityMultiplier;',
		//'attribute float opacityAttr;',
		'varying float opacityNew;',
		'void main(){',
		//'    opacityNew = opacityAttr * opacityMultiplier;',
		'    opacityNew = 0.2 * opacityMultiplier;',
		'    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
		'}'
	].join('\n')
}

Neuro.NetWork = function(parent){

	this.root = parent;

	this.ObjectLists = ['cone', 'sphere', 'cube', 'torus', 'knot', 'brain', 'obj1', 'obj2', 'obj3', 'obj4', 'obj5', 'obj6', 'obj7', 'obj8', 'obj9', 'obj10'];
	this.model = 'cone';

	this.content = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({transparent: true, opacity: 0.00, depthTest: false}));
    this.root.scene.add(this.content);

	this.initialized = false;

	this.meshs = {};

	// settings
	this.verticesSkipStep = 1//3//2;	//2
	this.maxAxonDist = 8//8;	//8
	this.maxConnectionPerNeuron = 6;	//6

	this.currentMaxSignals = 8000;
	this.limitSignals = 12000;
	this.particlePool = new Neuro.ParticlePool(this.content, this.limitSignals);	// *************** ParticlePool must bigger than limit Signal ************

	this.signalMinSpeed = 0.035;
	this.signalMaxSpeed = 0.065;

	// NN component containers
	this.allNeurons = [];
	this.allSignals = [];
	this.allAxons = [];

	// axon
	this.axonOpacityMultiplier = 1.0;
	this.axonColor = 0x666666;
	this.axonGeom = null;//new THREE.BufferGeometry();
	this.axonPositions = [];
	this.axonColors = [];
	this.axonIndices = [];
	this.axonNextPositionsIndex = 0;

	this.axonShader = Neuro.LineShader;

	

	// neuron
	this.neuronSize = 0.8;
	this.spriteTextureNeuron = THREE.ImageUtils.loadTexture( "textures/point.png" );
	this.neuronColor = 0x666666;
	this.neuronOpacity = 1.0;
	this.neuronsGeom = null;
	this.neuronMaterial = new THREE.PointCloudMaterial({
		map: this.spriteTextureNeuron,
		size: this.neuronSize,
		color: this.neuronColor,
		alphaTest : 0.6,
		//blending: THREE.AdditiveBlending,
		//depthTest: false,
		transparent: true,
		//opacity: this.neuronOpacity
	});

	// info api
	this.numNeurons = 0;
	this.numAxons = 0;
	this.numSignals = 0;

	this.init();
}

Neuro.NetWork.prototype = {
	constructor:Neuro.NetWork,
    init:function(){
    	var loader = new THREE.SEA3D( true );
    	var mtx = new THREE.Matrix4().makeScale(10, 10, -10);
		loader.onComplete =  function (e) {
			var i = loader.meshes.length, name, m, g;
			while(i--){
				m = loader.meshes[i];
				g = m.geometry;
				g.applyMatrix(mtx);
				this.meshs[m.name] = m;
			}
			//this.selectMesh('brain');
			//this.selectMesh('sphere');
			this.selectMesh('cone');
		}.bind(this);

        loader.parser = THREE.SEA3D.DEFAULT;
        loader.load( 'models/object.sea' );
    },
    extraLoader:function(name){
    	this.verticesSkipStep = 10;
    	var loader = new THREE.SEA3D( true );
    	var mtx = new THREE.Matrix4().makeScale(70, 70, -70);
		loader.onComplete =  function (e) {
			var i = loader.meshes.length, name, m, g;
			while(i--){
				m = loader.meshes[i];
				g = m.geometry;
				g.applyMatrix(mtx);
				console.log(m.name)
			}
			this.neuronsGeom = new THREE.Geometry();
			this.initNeurons( g.vertices );
			this.completeObject();
		}.bind(this);

        loader.parser = THREE.SEA3D.DEFAULT;
        loader.load( 'models/'+name+'.sea' );
    },
    clearOld:function(){
    	this.initialized = false;
    	this.content.remove(this.neuronParticles);
    	this.content.remove(this.axonMesh);

    	this.neuronParticles.geometry.dispose();
    	this.axonMesh.geometry.dispose();
    	this.axonMesh.material.dispose();
    	//this.neuronsGeom.dispose();

    	this.particlePool.clear();

    	this.allNeurons = [];
    	this.allSignals = [];
    	this.allAxons = [];

    	
		this.axonPositions = [];
		this.axonColors = [];
		this.axonIndices = [];
		this.axonNextPositionsIndex = 0;

		this.numNeurons = 0;
		this.numAxons = 0;
		this.numSignals = 0;

    	console.log('yooo')
    	

    },
    selectMesh:function(name){
    	this.verticesSkipStep = 1;
    	var list = [];
    	if(name == 'brain'){
    		list = ['b_frontal', 'b_stem', 'b_cereb'];
    	}else if(name.substring(0, 3) == 'obj'){
    		this.extraLoader(name); return;
    	}else{
    		list = [name];
    	}

    	/*var material = new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 0.00,
			depthTest: false,
			color: 0x0088ff,
			//blending: THREE.AdditiveBlending
		});*/

		this.neuronsGeom = new THREE.Geometry();

    	var i = list.length, m, g;
    	while(i--){
    		//var g = this.getGeometry();
			this.initNeurons( this.meshs[list[i]].geometry.vertices );

			//m = new THREE.Mesh(g, material)
			//this.root.scene.add(m);
    	}

    	this.completeObject();


    	/*this.particlePool.init();
    	this.applyNeurons();
		this.initAxons();
		
		this.initialized = true;*/
    },
    completeObject:function(){
    	this.particlePool.init();
    	this.applyNeurons();
		this.initAxons();
		
		this.initialized = true;
    },
	changeObject:function(){
		if(this.initialized){
			this.clearOld();
		    this.selectMesh(this.model);
		}
	},
	initNeurons:function (pp) {
		var lng = pp.length;
		var pos = new THREE.Vector3();
		//var ni;
		//var isBuff = false;
		/*var lng 
		 var pp = geometry.vertices;
		 if(pp == undefined ){
		     pp = geometry.attributes.position.array;
		     lng = pp.length/3;
		     isBuff = true;
		  } else {
		    lng = pp.length;
		  }*/
		for (var i=0; i<lng; i+=this.verticesSkipStep) {
			//ni = i*3;
			//if(isBuff) pos.set(pp[ni+0], pp[ni+1], pp[ni+2]);
			//else 
			pos.set(pp[i].x, pp[i].y, pp[i].z);
			//var pos = inputVertices[i];
			var n = new Neuro.Neuron(pos.x, pos.y, pos.z);
			this.allNeurons.push(n);
			this.neuronsGeom.vertices.push(n);
		}
	},
	applyNeurons:function () {
		this.neuronParticles = new THREE.PointCloud(this.neuronsGeom, this.neuronMaterial);
		//this.root.scene.add(this.neuronParticles);
		this.content.add(this.neuronParticles);
	},
	initAxons:function () {
		this.axonShader = Neuro.LineShader;
		this.axonShader.uniforms.color.value.set(this.axonColor);
		this.axonShader.uniforms.opacityMultiplier.value = this.axonOpacityMultiplier;

		/*this.shaderUniforms = {
			color:             { type: 'c', value: new THREE.Color( this.axonColor ) },
			opacityMultiplier: { type: 'f', value: 1.0 }
		};

		this.shaderAttributes = {
			opacityAttr:       { type: 'f', value: [] }
		};*/

		var allNeuronsLength = this.allNeurons.length;
		for (var j=0; j<allNeuronsLength; j++) {
			var n1 = this.allNeurons[j];
			for (var k=j+1; k<allNeuronsLength; k++) {
				var n2 = this.allNeurons[k];
				// connect neuron if distance ... and limit connection per neuron to not more than x
				if (n1 !== n2 && n1.distanceTo(n2) < this.maxAxonDist && n1.connection.length < this.maxConnectionPerNeuron && n2.connection.length < this.maxConnectionPerNeuron){
					var connectedAxon = n1.connectNeuronTo(n2);
					this.constructAxonArrayBuffer(connectedAxon);
				}
			}
		}

		// *** attirbute size must bigger than its content ***
		var axonIndices = new Uint32Array(this.axonIndices.length);
		var axonPositions = new Float32Array(this.axonPositions.length);
		var axonColors = new Float32Array(this.axonColors.length);
		//var axonOpacities = new Float32Array(this.shaderAttributes.opacityAttr.value.length);



		// transfer temp-array to arrayBuffer
		transferToArrayBuffer(this.axonIndices, axonIndices);
		transferToArrayBuffer(this.axonPositions, axonPositions);
		transferToArrayBuffer(this.axonColors, axonColors);
		//transferToArrayBuffer(this.shaderAttributes.opacityAttr.value, axonOpacities);


		function transferToArrayBuffer(fromArr, toArr) {
			for (i=0; i<toArr.length; i++) {
				toArr[i] = fromArr[i];
			}
		}

		this.axonGeom = new THREE.BufferGeometry();
		this.axonGeom.addAttribute( 'index', new THREE.BufferAttribute(axonIndices, 1) );
		this.axonGeom.addAttribute( 'position', new THREE.BufferAttribute(axonPositions, 3) );
		//this.axonGeom.addAttribute( 'opacityAttr', new THREE.BufferAttribute(axonOpacities, 1) );
		this.axonGeom.addAttribute( 'color', new THREE.BufferAttribute(axonColors, 3) );
		this.axonGeom.computeBoundingSphere();



		// axons mesh
		this.shaderMaterial = new THREE.ShaderMaterial( {
			uniforms:       this.axonShader.uniforms,//this.shaderUniforms,
			attributes:     this.axonShader.attributes,//this.shaderAttributes,
			vertexShader:   this.axonShader.vs,
			fragmentShader: this.axonShader.fs,
			//blending:       THREE.AdditiveBlending,
			//depthTest:      false,
			transparent:    true
		});

		//var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors, transparent:true, opacity:0.2});

		this.axonMesh = new THREE.Line(this.axonGeom, this.shaderMaterial, THREE.LinePieces);
		//this.axonMesh = new THREE.Line(this.axonGeom, material, THREE.LinePieces);
		this.axonMesh.frustumCulled = false;
	   // this.root.scene.add(this.axonMesh);
	    this.content.add(this.axonMesh);


	},
	update:function () {
		if (!this.initialized) return;

		var n, ii;
		var currentTime = Date.now();

		// update neurons state and release signal
		for (ii=0; ii<this.allNeurons.length; ii++) {

			n = this.allNeurons[ii];

			if (this.allSignals.length < this.currentMaxSignals-this.maxConnectionPerNeuron) {		// currentMaxSignals - maxConnectionPerNeuron because allSignals can not bigger than particlePool size

				if (n.recievedSignal && n.firedCount < 8)  {	// Traversal mode
				// if (n.recievedSignal && (currentTime - n.lastSignalRelease > n.releaseDelay) && n.firedCount < 8)  {	// Random mode
				// if (n.recievedSignal && !n.fired )  {	// Single propagation mode
					n.fired = true;
					n.lastSignalRelease = currentTime;
					n.releaseDelay = THREE.Math.randInt(100, 1000);
					this.releaseSignalAt(n);
				}

			}

			n.recievedSignal = false;	// if neuron recieved signal but still in delay reset it
		}

		// reset all neurons and when there is X signal
		if (this.allSignals.length <= 0) {

			for (ii=0; ii<this.allNeurons.length; ii++) {	// reset all neuron state
				n = this.allNeurons[ii];
				n.releaseDelay = 0;
				n.fired = false;
				n.recievedSignal = false;
				n.firedCount = 0;
			}
			this.releaseSignalAt(this.allNeurons[THREE.Math.randInt(0, this.allNeurons.length)]);

		}

		// update and remove signals
		for (var j=this.allSignals.length-1; j>=0; j--) {
			var s = this.allSignals[j];
			s.travel();

			if (!s.alive) {
				s.particle.free();
				for (var k=this.allSignals.length-1; k>=0; k--) {
					if (s === this.allSignals[k]) {
						this.allSignals.splice(k, 1);
						break;
					}
				}
			}

		}

		// update particle pool vertices
		this.particlePool.update();

		// update info for GUI
		this.updateInfo();

	},
	constructAxonArrayBuffer:function (axon) {
		this.allAxons.push(axon);
		var vertices = axon.geom.vertices;
		//console.log(vertices.length)
		var numVerts = vertices.length;

		// &&&&&&&&&&&&&&&&&&&&&^^^^^^^^^^^^^^^^^^^^^
		// var opacity = THREE.Math.randFloat(0.001, 0.1);

		for (var i=0; i<numVerts; i++) {

			this.axonPositions.push(vertices[i].x, vertices[i].y, vertices[i].z);
			this.axonColors.push(Math.random()*0.5+0.5, Math.random()*0.5+0.5, 1);

			if ( i < numVerts-1 ) {
				var idx = this.axonNextPositionsIndex;
				this.axonIndices.push(idx, idx+1);

				var opacity = 0.2;//THREE.Math.randFloat(0.002, 0.2);
				//this.shaderAttributes.opacityAttr.value.push(opacity, opacity);

			}

			this.axonNextPositionsIndex += 1;
		}
	},
	releaseSignalAt:function (neuron) {
		var signals = neuron.createSignal(this.particlePool, this.signalMinSpeed, this.signalMaxSpeed);
		for (var ii=0; ii<signals.length; ii++) {
			var s = signals[ii];
			this.allSignals.push(s);
		}
	},
	updateInfo : function () {
		this.numNeurons = this.allNeurons.length;
		this.numAxons = this.allAxons.length;
		this.numSignals = this.allSignals.length;
	},
	updateSettings:function () {
		this.neuronMaterial.opacity = this.neuronOpacity;
		this.neuronMaterial.color.setHex(this.neuronColor);
		this.neuronMaterial.size = this.neuronSize;

		this.axonShader.uniforms.color.value.set(this.axonColor);
		this.axonShader.uniforms.opacityMultiplier.value = this.axonOpacityMultiplier;

		this.particlePool.updateSettings();
	}

}


// Connection ------------------------------------------------------------
Neuro.Connection = function (axon, startingPoint) {
	this.axon = axon;
	this.startingPoint = startingPoint;
}


// Axon ------------------------------------------------------------------

Neuro.Axon = function(neuronA, neuronB) {
	this.neuronA = neuronA;
	this.neuronB = neuronB;
	this.cpLength = neuronA.distanceTo(neuronB) / THREE.Math.randFloat(1.5, 4.0);
	this.controlPointA = this.getControlPoint(neuronA, neuronB);
	this.controlPointB = this.getControlPoint(neuronB, neuronA);
	THREE.LineCurve3.call(this, this.neuronA, this.neuronB);
	this.geom = new THREE.Geometry();
	this.geom.vertices = this.getSpacedPoints(0);
}

Neuro.Axon.prototype = Object.create(THREE.LineCurve3.prototype);

// generate uniformly distribute vector within x-theta cone from arbitrary vector v1, v2
Neuro.Axon.prototype.getControlPoint = function (v1, v2) {
	var dirVec = new THREE.Vector3().copy(v2).sub(v1).normalize();
	var northPole = new THREE.Vector3(0, 0, 1);	// this is original axis where point get sampled
	var axis = new THREE.Vector3().crossVectors(northPole, dirVec).normalize();	// get axis of rotation from original axis to dirVec
	var axisTheta = dirVec.angleTo(northPole);	// get angle
	var rotMat = new THREE.Matrix4().makeRotationAxis(axis, axisTheta);	// build rotation matrix

	var minz = Math.cos( THREE.Math.degToRad(45) );	// cone spread in degrees
	var z = THREE.Math.randFloat(minz, 1);
	var theta = THREE.Math.randFloat(0, Math.PI*2);
	var r = Math.sqrt(1-z*z);
	var cpPos = new THREE.Vector3( r * Math.cos(theta), r * Math.sin(theta), z );
	cpPos.multiplyScalar(this.cpLength);	// length of cpPoint
	cpPos.applyMatrix4(rotMat);	// rotate to dirVec
	cpPos.add(v1);	// translate to v1
	return cpPos;
};


// Axon CURVE ------------------------------------------------------------------

/*Neuro.AxonCurved = function(neuronA, neuronB, curved) {
	this.bezierSubdivision = 8;
	this.neuronA = neuronA;
	this.neuronB = neuronB;
	this.cpLength = neuronA.distanceTo(neuronB) / THREE.Math.randFloat(1.5, 4.0);
	this.controlPointA = this.getControlPoint(neuronA, neuronB);
	this.controlPointB = this.getControlPoint(neuronB, neuronA);
	THREE.CubicBezierCurve3.call(this, this.neuronA, this.controlPointA, this.controlPointB, this.neuronB);
	this.geom = new THREE.Geometry();
	this.geom.vertices = this.getSpacedPoints(this.bezierSubdivision);
}

Neuro.AxonCurved.prototype = Object.create(THREE.CubicBezierCurve3.prototype);

// generate uniformly distribute vector within x-theta cone from arbitrary vector v1, v2
Neuro.AxonCurved.prototype.getControlPoint = function (v1, v2) {
	var dirVec = new THREE.Vector3().copy(v2).sub(v1).normalize();
	var northPole = new THREE.Vector3(0, 0, 1);	// this is original axis where point get sampled
	var axis = new THREE.Vector3().crossVectors(northPole, dirVec).normalize();	// get axis of rotation from original axis to dirVec
	var axisTheta = dirVec.angleTo(northPole);	// get angle
	var rotMat = new THREE.Matrix4().makeRotationAxis(axis, axisTheta);	// build rotation matrix

	var minz = Math.cos( THREE.Math.degToRad(45) );	// cone spread in degrees
	var z = THREE.Math.randFloat(minz, 1);
	var theta = THREE.Math.randFloat(0, Math.PI*2);
	var r = Math.sqrt(1-z*z);
	var cpPos = new THREE.Vector3( r * Math.cos(theta), r * Math.sin(theta), z );
	cpPos.multiplyScalar(this.cpLength);	// length of cpPoint
	cpPos.applyMatrix4(rotMat);	// rotate to dirVec
	cpPos.add(v1);	// translate to v1
	return cpPos;
};*/


// Particle --------------------------------------------------------------

Neuro.Particle = function (particlePool) {
	this.particlePool = particlePool;
	this.available = true;
	THREE.Vector3.call(this, particlePool.offScreenPos.x, particlePool.offScreenPos.y, particlePool.offScreenPos.z);
}
Neuro.Particle.prototype = Object.create(THREE.Vector3.prototype);
Neuro.Particle.prototype.free = function () {
	this.available = true;
	this.set(this.particlePool.offScreenPos.x, this.particlePool.offScreenPos.y, this.particlePool.offScreenPos.z);
};

	// Particle Pool ---------------------------------------------------------

Neuro.ParticlePool = function(content, poolSize) {
	//this.root = parent;

	this.content = content;

	this.spriteTextureSignal = THREE.ImageUtils.loadTexture( "textures/point.png" );

	this.poolSize = poolSize;
	this.pGeom = null;//new THREE.Geometry();
	this.particles = null; // this.pGeom.vertices;

	this.offScreenPos = new THREE.Vector3(9999, 9999, 9999);	// #CM0A r68 PointCloud default frustumCull = true(extended from Object3D), so need to set to 'false' for this to work with oppScreenPos, else particles will dissappear

	this.pColor = 0xFFFFFF;
	this.pSize = 0.3;

	// inner particle
	this.pMat = new THREE.PointCloudMaterial({
		map: this.spriteTextureSignal,
		size: this.pSize,
		color: this.pColor,
		//blending: THREE.AdditiveBlending,
		//depthTest: false,
		transparent: true,
		alphaTest : 0.6
	});

	/*for (var ii=0; ii<this.poolSize; ii++) {
		this.particles[ii] = new Neuro.Particle(this);
	}

	// inner particle
	this.pMat = new THREE.PointCloudMaterial({
		map: this.spriteTextureSignal,
		size: this.pSize,
		color: this.pColor,
		blending: THREE.AdditiveBlending,
		//depthTest: false,
		transparent: true
	});

	this.pMesh = new THREE.PointCloud(this.pGeom, this.pMat);
	this.pMesh.sortParticles = true;
    this.pMesh.dynamic = true;
	this.pMesh.frustumCulled = false;*/ // ref: #CM0A

	//this.root.scene.add(this.pMesh);
	//content.add(this.pMesh);


	// outer particle glow
	/*this.pMat_outer = new THREE.PointCloudMaterial({
		map: this.spriteTextureSignal,
		size: this.pSize*0.1,
		color: this.pColor,
		blending: THREE.AdditiveBlending,
		//depthTest: false,
		transparent: true,
		opacity: 0.025
	});

	this.pMesh_outer = new THREE.PointCloud(this.pGeom, this.pMat_outer);
	this.pMesh_outer.frustumCulled = false; // ref:#CM0A
	//this.root.scene.add(this.pMesh_outer);
	content.add(this.pMesh_outer);*/
}
Neuro.ParticlePool.prototype = {
	constructor:Neuro.ParticlePool,
	getParticle : function () {
		for (var ii=0; ii<this.poolSize; ii++) {
			var p = this.particles[ii];
			if (p.available) {
				p.available = false;
				return p;
			}
		}
		return null;
	},
	addPoint:function (x,y,z) {
		this.pGeom.vertices.push( vec );
		this.pGeom.dispose();

	},
	update:function () {
		this.pGeom.verticesNeedUpdate = true;
	},
	updateSettings : function () {
		// inner particle
		this.pMat.color.setHex(this.pColor);
		this.pMat.size = this.pSize;
		// outer particle
		//this.pMat_outer.color.setHex(this.pColor);
		//this.pMat_outer.size = this.pSize*10;
	},
	move : function(n, x, y, z){
        if(this.pGeom.vertices[n]){
            this.pGeom.vertices[n].x = x || 0;
            this.pGeom.vertices[n].y = y || 0;
            this.pGeom.vertices[n].z = z || 0;
        }
    },
    init:function(){
    	this.pGeom = new THREE.Geometry();
    	this.particles = this.pGeom.vertices;
    	for (var ii=0; ii<this.poolSize; ii++) {
			this.particles[ii] = new Neuro.Particle(this);
		}
		this.pMesh = new THREE.PointCloud(this.pGeom, this.pMat);
		this.pMesh.sortParticles = true;
	    this.pMesh.dynamic = true;
		this.pMesh.frustumCulled = false;

		this.content.add(this.pMesh);
    },
    clear:function(){
    	this.pMesh.geometry.dispose();
    	this.content.remove(this.pMesh);
    	//this.pGeom.dispose();
    }
}


// Signal ----------------------------------------------------------------

Neuro.Signal = function (particlePool, minSpeed, maxSpeed) {
	this.minSpeed = minSpeed;
	this.maxSpeed = maxSpeed;
	this.speed = THREE.Math.randFloat(this.minSpeed, this.maxSpeed);
	this.alive = true;
	this.t = null;
	this.startingPoint = null;
	this.axon = null;
	this.particle = particlePool.getParticle();
	THREE.Vector3.call(this);

}
Neuro.Signal.prototype = Object.create(THREE.Vector3.prototype);
Neuro.Signal.prototype.setConnection = function (Connection) {
	this.startingPoint = Connection.startingPoint;
	this.axon = Connection.axon;
	if (this.startingPoint === 'A') this.t = 0;
	else if (this.startingPoint === 'B') this.t = 1;

};
Neuro.Signal.prototype.travel = function () {

	var pos;
	if (this.startingPoint === 'A') {
		this.t += this.speed;
		if (this.t>=1) {
			this.t = 1;
			this.alive = false;
			this.axon.neuronB.recievedSignal = true;
			this.axon.neuronB.prevReleaseAxon = this.axon;
		}

	} else if (this.startingPoint === 'B') {
		this.t -= this.speed;
		if (this.t<=0) {
			this.t = 0;
			this.alive = false;
			this.axon.neuronA.recievedSignal = true;
			this.axon.neuronA.prevReleaseAxon = this.axon;
		}
	}
	pos = this.axon.getPoint(this.t);
	// pos = this.axon.getPointAt(this.t);	// uniform point distribution but slower calculation
	this.particle.set(pos.x, pos.y, pos.z);
};

// NEURON ----------------------------------------------------------------

Neuro.Neuron = function (x, y, z) {
	this.connection = [];
	this.recievedSignal = false;
	this.lastSignalRelease = 0;
	this.releaseDelay = 0;
	this.fired = false;
	this.firedCount = 0;
	this.prevReleaseAxon = null;
	THREE.Vector3.call(this, x, y, z);
}
Neuro.Neuron.prototype = Object.create(THREE.Vector3.prototype);
Neuro.Neuron.prototype.connectNeuronTo = function (neuronB) {
	var neuronA = this;
	// create axon and establish connection
	var axon = new Neuro.Axon(neuronA, neuronB);
	neuronA.connection.push( new Neuro.Connection(axon, 'A') );
	neuronB.connection.push( new Neuro.Connection(axon, 'B') );
	return axon;
};
Neuro.Neuron.prototype.createSignal = function (particlePool, minSpeed, maxSpeed) {
	this.firedCount += 1;
	this.recievedSignal = false;
	var signals = [];
	// create signal to all connected axons
	for (var i=0; i<this.connection.length; i++) {
		if (this.connection[i].axon !== this.prevReleaseAxon) {
			var c = new Neuro.Signal(particlePool, minSpeed, maxSpeed);
			c.setConnection(this.connection[i]);
			signals.push(c);
		}
	}
	return signals;
};