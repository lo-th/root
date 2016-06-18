// Particles are statically allocated in a big array so that creating a
// new particle doesn't need to allocate any memory (for speed reasons).
// To create one, call Particle(), which will return one of the elements
// in that array with all values reset to defaults.  To change a property
// use the function with the name of that property.  Some property functions
// can take two values, which will pick a random number between those numbers.
// Example:
//
// Particle().position(center).color(0.9, 0, 0, 0.5).mixColor(1, 0, 0, 1).gravity(1).triangle()
// Particle().position(center).velocity(velocity).color(0, 0, 0, 1).gravity(0.4, 0.6).circle()
var PE = PE || {};

PE.random = Math.random;
PE.lerp = function (a, b, percent) { return a + (b - a) * percent; }
PE.randInRange = function (a, b) { return PE.lerp(a, b, PE.random()); }
PE.randInt = function (a, b, n) { return PE.lerp(a, b, PE.random()).toFixed(n || 0)*1;}

PE.PI    = 3.141592653589793;
PE.PI90  = 1.570796326794896;
PE.PI270 = 4.712388980384689;
PE.TwoPI = 6.283185307179586;

PE.ToRad = 0.0174532925199432957;
PE.ToDeg = 57.295779513082320876;



PE.PARTICLE_CIRCLE = 0;
PE.PARTICLE_TRIANGLE = 1;
PE.PARTICLE_LINE = 2;
PE.PARTICLE_CUSTOM = 3;

// class Particle
PE.ParticleInstance = function () {
}

PE.ParticleInstance.prototype = {
	constructor: PE.ParticleInstance,
	init : function() {
		// must use 'm_' here because many setting functions have the same name as their property
		this.m_speed = 0.001;
		this.m_time = 0;

		this.m_bounces = 0;
		this.m_color =  new THREE.Vector4();
		this.m_type = 0;

		this.m_radius = 0;
		this.m_radiusBase = 0;
		this.m_expand = 1;

		this.m_gravity = new THREE.Vector3();
		this.m_elasticity = 0;
		this.m_decay = 1;
		
		this.m_uvpos =  new THREE.Vector2();
		this.m_pos = new THREE.Vector3();
		this.m_basepos = new THREE.Vector3();
		this.m_velocity = new THREE.Vector3();
		this.m_angle = 0;
		this.m_angularVelocity = 0;
		this.m_drawFunc = null;

		this.ntiles = 4;
		this.m_animuv = false;
	},
	tick : function(seconds) {

		

		//if(this.m_bounces < 0)  return false;

		/*if(this.m_animuv){
			this.m_uvpos.x ++;
			if(this.m_uvpos.x>this.ntiles){
				this.m_uvpos.x = 0;
				this.m_uvpos.y ++;
				if(this.m_uvpos.y>this.ntiles) this.m_uvpos.y = 0;
			}
		}*/

		//this.m_color.w *= Math.pow(this.m_decay, seconds);// alpha
		//this.m_radius *= Math.pow(this.m_expand, seconds);

		this.m_radius = PE.lerp( this.m_radiusBase, this.m_expand, this.m_time );
		//
		//if(this.m_gravity.x!==0)this.m_velocity.x -= this.m_gravity.x * seconds;
		//if(this.m_gravity.y!==0)this.m_velocity.y -= this.m_gravity.y * seconds;
		//if(this.m_gravity.z!==0)this.m_velocity.z -= this.m_gravity.z * seconds;
		
		this.m_velocity.sub(this.m_gravity.clone());
		//this.m_pos.add(this.m_velocity.clone().multiplyScalar(seconds));

	

		this.m_pos.lerpVectors( this.m_basepos, this.m_velocity, this.m_time );

		

		//this.m_pos.x += this.m_velocity.x * seconds;
		//this.m_pos.y += this.m_velocity.y * seconds;
		//this.m_pos.z += this.m_velocity.z * seconds;
		
		//this.m_angle += this.m_angularVelocity * seconds;
		//if(this.m_alpha < 0.05) this.m_bounces = -1;

		if( this.m_time > 1 ){ 
			this.m_time = -this.m_decay; 
			//this.m_pos.copy( this.m_basepos );
			//this.m_radius=  this.m_radiusBase ;
		} else {
			this.m_time += this.m_speed 

		}
			//this.m_time = 0;
			//this.m_pos.copy( this.m_basepos )
			//this.m_bounces = -1;
		//	return false;
		//} else {
		//	return true;
		//}

		//if(this.m_color.w < 0.05) this.m_bounces = -1;
		//return (this.m_bounces >= 0);
		return (this.m_time < 1)

		//this.m_time
	},

	randOrTakeFirst : function (min, max) {
		return (typeof max !== 'undefined') ? PE.randInRange(min, max) : min;
	},
	cssRGBA : function (r, g, b, a) {
		return 'rgba(' + Math.round(r * 255) + ', ' + Math.round(g * 255) + ', ' + Math.round(b * 255) + ', ' + a + ')';
	},

	// all of these functions support chaining to fix constructor with 200 arguments
	fixangle : function(){
		var v1 = this.m_pos;
		var v2 = this.m_pos.clone().add(this.m_velocity.clone().multiplyScalar(10));
		this.m_angle = -(Math.atan2((v2.y-v1.y) , (v2.x-v1.x))+Math.PI);
        return this;
	},
	bounces : function(min, max) { this.m_bounces = Math.round(this.randOrTakeFirst(min, max)); return this; },
	type:function(t) {
		var x = 0, y = 0;
		switch(t){
			case 'R': case 0: x=1; y=1; break;
			case 'N': case 1: x=2; y=1; break;
			case 'B': case 2: x=3; y=1; break;
			//case 'custom': x=6; y=1; break;
		}
		this.m_uvpos.set(x,y);
		return this;
	},
	setuv:function(x,y){this.m_uvpos.set(x,y); return this;},
	animuv: function(){ this.m_animuv=true; return this;},
	circle : function() { this.m_type = PE.PARTICLE_CIRCLE; return this; },
	triangle : function() { this.m_type = PE.PARTICLE_TRIANGLE; return this; },
	line : function() { this.m_type = PE.PARTICLE_LINE; return this; },
	custom : function(drawFunc) { this.m_type = PE.PARTICLE_CUSTOM; this.m_drawFunc = drawFunc; return this; },
	customSprite : function(sprite) { /*this.m_type = PE.PARTICLE_CUSTOM; this.m_drawFunc = drawFunc; */return this; },
	color : function(r, g, b, a) { this.m_color.set(r||0, g||0, b||0, a||0); return this; },
	mixColor : function(r, g, b, a) { var percent = Math.random(); this.m_color.lerp(new THREE.Vector4(r, g, b, a), percent); return this; },
	radius : function(min, max) { this.m_radius = this.randOrTakeFirst(min, max); this.m_radiusBase = this.m_radius; return this; },
	gravity : function(min, max, axe) { this.m_gravity[axe || 'y'] = this.randOrTakeFirst(min, max); return this; },
	elasticity : function(min, max) { this.m_elasticity = this.randOrTakeFirst(min, max); return this; },
	decay : function(min, max) { this.m_decay = this.randOrTakeFirst(min, max); return this; },
	expand : function(min, max) { this.m_expand = this.randOrTakeFirst(min, max); return this; },
	angle : function(min, max) { this.m_angle = this.randOrTakeFirst(min, max); return this; },
	angularVelocity : function(min, max) { this.m_angularVelocity = this.randOrTakeFirst(min, max); return this; },
	speed : function( s ) { this.m_speed = s*0.01; return this; },
	position : function(pos) { this.m_pos.set( pos.x || 0, pos.y || 0, pos.z || 0); this.m_basepos.set( pos.x || 0, pos.y || 0, pos.z || 0); return this; },
	velocity : function(vel) { this.m_velocity.set( vel.x || 0, vel.y || 0, vel.z || 0); return this; }
};

// wrap in anonymous function for private variables
PE.Particle = ( function() {


	var emiters = [];

	var particleMaterial = null;
	var geometry = null;
	var positions = null;
	var angles = null;
	var sizes = null;
	var uvpos = null;
	var colors = null;
	var values_size = null;
	
    //this.scene.add( this.particlesCloud );

	// particles is an array of ParticleInstances where the first count are in use
	//var particles = new Array(3000);
	var particles = new Array(25000);
	var maxCount = particles.length;
	var count = 0;
	var i = maxCount;
	while(i--){
		particles[i] = new PE.ParticleInstance();
	}
	/*for(var i = 0; i < particles.length; i++) {
		particles[i] = new PE.ParticleInstance();
	}*/


	PE.Particle = function()  {
		var particle = (count < maxCount) ? particles[count++] : particles[maxCount - 1];
		particle.init();
		return particle;
	}

	PE.Particle.reset = function() {
		count = 0;
		var v = 25000;
		while(v--){
			positions[v*3+0] = 0.0;
	    	positions[v*3+1] = 0.0;
	    	positions[v*3+2] = 0.0;
			colors[v*4+3] = 0.0;
		}
	};

	PE.Particle.Emiter = function( pos, r1, r2, d1, d2, s1, s2  ){

		this.count = 0;
		this.frequency = 10;
		this.speed = 0.5;
		this.multyply = 1;

		this.position = pos || new THREE.Vector3();
		this.randBase = 0.5;
		this.randEnd = 0.5;
		this.angle1 = r1 || 0;
		this.angle2 = r2 || 45;

		this.distance1 = d1 || 10;
		this.distance2 = d2 || 20;

		this.size1 = s1 || 0.1;
		this.size2 = s2 || 0.5;


		emiters.push(this);

	};

	PE.Particle.Emiter.prototype = {

		up:function(){

			if(this.frequency === 0) return;

			this.count++;

			if(this.count < 10 - this.frequency) return; 

			var i = this.multyply;

		    while(i--){

		    var vv = new THREE.Vector3( PE.randInRange( -this.randBase , this.randBase ), PE.randInRange( -this.randBase , this.randBase ), PE.randInRange( -this.randBase , this.randBase ) );
		    var vv2 = new THREE.Vector3( PE.randInRange( -this.randEnd , this.randEnd ), PE.randInRange( -this.randEnd , this.randEnd ), PE.randInRange( -this.randEnd , this.randEnd ) );

			var angle = PE.randInRange( this.angle1 * PE.ToRad , this.angle2 * PE.ToRad );
		    var distance = PE.randInRange(this.distance1, this.distance2);
		    var velocity = new THREE.Vector3( Math.cos( angle ), Math.sin( angle ), PE.randInRange(-0.3, 0.3)).multiplyScalar(distance);
		    var t = PE.randInt(0,2);

		    

				PE.Particle()
	            .type(t)// triangle, circle, line, custom
	            .position( this.position.clone().add(vv) )
	            .velocity( velocity.add(vv2) )
	            .radius( this.size1 )
	            .expand( this.size2 )
	            .gravity(0.0)// (min, max, axe) axe:"x", "y", "z"
	            //.bounces(0, 4)
	            //.elasticity(0.05, 0.9)
	            .decay(0.01, 0.5)
	            .speed(this.speed)
	            
	            .color(1, 1, 1, 1)
	            .mixColor(1, 1, 1, 1)
	            .fixangle()

	            this.count = 0;
	        }

		}

	};

	PE.Particle.init3d = function(scene, mapping)  {

		geometry = new THREE.BufferGeometry();
		var n = 25000;

		var blending = THREE.NormalBlending;//THREE.AdditiveBlending;
		
		/*THREE.NoBlending
		THREE.NormalBlending
		THREE.AdditiveBlending
		THREE.SubtractiveBlending
		THREE.MultiplyBlending
		THREE.CustomBlending*/

		positions = new Float32Array( n * 3 );
	    uvpos = new Float32Array( n * 2 );
	    colors = new Float32Array( n * 4 );
	    angles = new Float32Array( n );
	    sizes = new Float32Array( n );

	    var v = n;

	    while(v--){

	        sizes[v] = 0.3;
	        uvpos[v*2+1] = 1.0;
	    }

	    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	    geometry.addAttribute( 'colors', new THREE.BufferAttribute( colors, 4 ) );
	    geometry.addAttribute( 'uvPos', new THREE.BufferAttribute( uvpos, 2 ) );
	    geometry.addAttribute( 'angle', new THREE.BufferAttribute( angles, 1 ) );
	    geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

		particleMaterial = new THREE.ShaderMaterial( {
	        //attributes:[ 'size', 'colors', 'uvPos', 'angle' ],
			uniforms:{
			    ntiles :  { type: 'f', value: 4.0 },
			    scale :  { type: 'f', value: 800.0 },
			    map: { type: 't', value: null },
			    alphaTest : { type:'f', value: 0.0 }
			},
			fragmentShader:[
			    'uniform sampler2D map;',
			    'uniform float ntiles;',
			    'uniform float alphaTest;',
			    'varying vec4 vColor;',
			    'varying vec2 vPos;',
			    'varying float vAngle;',

			    // map tile position see Shader.js
			    PE.tileUV,
			    // map tile rotation see Shader.js
			    PE.rotUV,

			    'void main(){',
			    '    vec2 uv = rotUV(vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ), vAngle);',
			    '    vec2 coord = tileUV(uv, vPos, ntiles);',
			    '    vec4 texture = texture2D( map, coord );',
			    '    gl_FragColor = texture * vColor;',
			    '    if ( gl_FragColor.a <= alphaTest ) discard;',
			    '}'
			].join('\n'),
			vertexShader:[    
			    'attribute float angle;',
			    'attribute vec4 colors;',
			    'attribute vec2 uvPos;',
			    'attribute float size;',
			    'uniform float scale;',
			    'varying vec2 vPos;',
			    'varying vec4 vColor;',
			    'varying float vAngle;',

			    'void main(){',
			    '    vPos = uvPos;',
			    '    vColor = colors;',
			    '    vAngle = angle;',
			    '    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
			    //'    gl_PointSize = size * scale;',
			    '    gl_PointSize = size * ( scale / length( mvPosition.xyz ) );',
			    '    gl_Position = projectionMatrix * mvPosition;',
			    '}'
			].join('\n'),
	        //vertexColors:   THREE.VertexColors,
	        depthTest: false,
	        depthWrite: true,
	        transparent: true,
	        blending:blending
	    });

        particleMaterial.uniforms.map.value = mapping;


	    var particlesCloud = new THREE.Points( geometry, particleMaterial );
	   // particlesCloud.position.set(0,0,0.01);
	    particlesCloud.frustumCulled = false;
		scene.add( particlesCloud );
	};

	PE.Particle.tick = function( ) {

		var i;

		for( i = 0; i < emiters.length; i++) {
			emiters[i].up();
		}

		



		for( i = 0; i < count; i++) {

			var isAlive = particles[i].tick();

			//

			positions[i * 3 + 0] = particles[i].m_pos.x;//.toFixed(3);
			positions[i * 3 + 1] = particles[i].m_pos.y;//.toFixed(3);
			positions[i * 3 + 2] = particles[i].m_pos.z;//.toFixed(3);

			//if(i===0) console.log(positions[i * 3 + 0], positions[i * 3 + 1]);

			colors[i * 4 + 0] = particles[i].m_color.x;
			colors[i * 4 + 1] = particles[i].m_color.y;
			colors[i * 4 + 2] = particles[i].m_color.z;
			colors[i * 4 + 3] = particles[i].m_color.w;

			if(particles[i].m_uvpos.x!==0 && particles[i].m_uvpos.y!==0){
				uvpos[i * 2 + 0] = particles[i].m_uvpos.x;
				uvpos[i * 2 + 1] = particles[i].m_uvpos.y;
			} else {
				uvpos[i * 2 + 0] = particles[i].m_type*2;
			}

			
			angles[i] = particles[i].m_angle;
			sizes[i] = particles[i].m_radius * 3;

			if (!isAlive) {
				
				// swap the current particle with the last active particle (this will swap with itself if this is the last active particle)
				var temp = particles[i];
				//
				particles[i] = particles[count - 1];

				colors[(count - 1) * 4 + 3] = 0.0;
				
				particles[count - 1] = temp;
				
				// forget about the dead particle that we just moved to the end of the active particle list
				count--;
				
				// don't skip the particle that we just swapped in
				i--;
			}
		}

		
	};

	PE.Particle.dispersion = function(z) {
		particleMaterial.uniforms.scale.value = z;
	}

	PE.Particle.scalemat = function(z) {
		particleMaterial.uniforms.scale.value = z;
	}

	PE.Particle.update = function( seconds ) {
		this.tick( seconds );
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.colors.needsUpdate = true;
		geometry.attributes.uvPos.needsUpdate = true;
		geometry.attributes.angle.needsUpdate = true;
		geometry.attributes.size.needsUpdate = true;
	}

	return PE.Particle;
})();


PE.tileUV = [
    'vec2 tileUV(vec2 uv, vec2 pos, float ntile){',
    '    pos.y = ntiles-pos.y-1.0;',
    '    vec2 sc = vec2(1.0/ntile, 1.0/ntile);',
    '    return vec2(uv*sc)+(pos*sc);',
    '}',
].join("\n");

// tile rotation 
// angle in radian

PE.rotUV = [
    'vec2 rotUV(vec2 uv, float angle){',
    '    float s = sin(angle);',
    '    float c = cos(angle);',
    '    mat2 r = mat2( c, -s, s, c);',
    '    r *= 0.5; r += 0.5; r = r * 2.0 - 1.0;',
    '    uv -= 0.5; uv = uv * r; uv += 0.5;',
    '    return uv;',
    '}',
].join("\n");


PE.decalUV = [
    'vec2 decalUV(vec2 uv, float pix, float max){',
    '    float ps = uv.x / max;',
    '    float mx = uv.x / (uv.x-(ps*2.0));',
    '    vec2 decal = vec2( (ps*pix), - (ps*pix));',
    '    vec2 sc = vec2(uv.x*mx,uv.y*mx);',
    //'    uv -= ((2.0*pix)*ps);',
    '    return (uv);',
    '}',
].join("\n");