import * as THREE from 'three';
//import { Lensflare, LensflareElement } from '../examples/jsm/objects/Lensflare.js';


export class Sky  {

	constructor( o = {} ) {

		//super()

		this.size = o.size || 500;

		this.setting = {

			t:0,
			fog:0,
			inclination: 45,
			azimuth: 90,
			hour:12,
			cloud_size:0,
			cloud_covr:0.5,
			cloud_dens:0.2,

			sample:32,//64
			step:4,//8


			sun_color:0xFFFFFF,
			sky_color:0xFFFFFF,
			fog_color:0xFFFFFF,
			ground_color:0xFFFFFF,

		}

		this.sunPosition = new THREE.Vector3(0,1,0);
		//this.moonPosition = new THREE.Vector3();

		this.scene = o.scene;
	    this.renderer = o.renderer;
	    //this.camera = o.camera;

		//this.scene = new THREE.Scene();
		this.sceneSky = new THREE.Scene();
		this.renderSky = new THREE.Scene();
		//this.renderSky.background = new THREE.Color( 0x222244 );

		this.textureLoader = new THREE.TextureLoader();

		//this.geometry = new THREE.SphereBufferGeometry( this.size, 30, 15 );
		//this.material = new THREE.ShaderMaterial();

		//THREE.Mesh.call( this, this.geometry, this.material );

		//this.visible = false;
		//this.castShadow = false;
	   // this.receiveShadow = false;
	    this.needsUpdate = false;
	    this.torad = 0.0174532925199432957; 

	    this.skyColor = new THREE.Color()
	    this.fogColor = new THREE.Color()
	    this.sunColor = new THREE.Color();
	    this.groundColor = new THREE.Color()

	    this.sunCol = new THREE.Vector3(.188, .458, .682);
	    this.sunTop = new THREE.Vector3(0, .99, 0);
	    this.sunMax = new THREE.Vector3(1.8, 1.8, 1.8);

	    this.addLight();
	    //this.init();
	    this.load();

	}

	load(){
		this.noiseMap = this.textureLoader.load("./js/assets/noise.png", function(){this.init()}.bind(this) )
	}

	addLight() {

		this.sunMaterial = new THREE.SpriteMaterial( { map: this.textureLoader.load("./js/assets/tex-sun.png"), blending:THREE.AdditiveBlending, opacity:0.5, fog:false } );
		var sunSprite = new THREE.Sprite( this.sunMaterial );
		sunSprite.scale.set( 40, 40, 1 );
				
		this.sun = new THREE.DirectionalLight( 0xffffff, 4 );
		this.sun.add( sunSprite );

    	var dd = 20;
        this.sun.shadow.camera.top = dd;
		this.sun.shadow.camera.bottom = - dd;
		this.sun.shadow.camera.left = - dd;
		this.sun.shadow.camera.right = dd;
		this.sun.shadow.camera.near = 100;
		this.sun.shadow.camera.far = 920;
        this.sun.shadow.mapSize.width = 1024;
        this.sun.shadow.mapSize.height = 1024;
        this.sun.shadow.radius = 4;
		this.sun.shadow.bias = - 0.0005;
        //this.sun.shadow.bias = 0.001;
        //this.sun.shadow.radius = 2;
        this.sun.castShadow = true;

        this.moonMaterial = new THREE.SpriteMaterial( { map: this.textureLoader.load("./js/assets/tex-moon.png"), blending:THREE.AdditiveBlending,  opacity:0.5, fog:false } );
		var moonSprite = new THREE.Sprite( this.moonMaterial );
		moonSprite.scale.set( 70, 70, 1 );

    	this.moon = new THREE.DirectionalLight( 0xffffff, 0.8 );//new THREE.PointLight( 0x909090, 0.5, 10000, 2 );
    	this.moon.add( moonSprite );


    	this.scene.add( this.sun );
    	this.scene.add( this.moon );


    	this.sunSph = new THREE.Spherical(this.size-this.size*0.1);
		this.moonSph = new THREE.Spherical(this.size-this.size*0.1);

		this.sunHemisphere = new THREE.HemisphereLight(0, 0, 1.0);
		this.scene.add( this.sunHemisphere );



	}

	init(){

		this.skyResolution = 128;

		
		this.noiseMap.wrapS = this.noiseMap.wrapT = THREE.RepeatWrapping;
		this.noiseMap.flipY = false;

		//console.log('init')

		this.materialSky = new THREE.ShaderMaterial( {

			uniforms: {
				lightdir: { value: this.sunPosition },
				sunTop: { value:this.sunTop },
				noiseMap: { value:this.noiseMap },
				cloud_size: { value: this.setting.cloud_size },
                cloud_covr: { value: this.setting.cloud_covr },
                cloud_dens: { value: this.setting.cloud_dens },
                SAMPLE:{ value: this.setting.sample },
                STEP:{ value: this.setting.step },
                //cloudColor: { value: new THREE.Color(0xFFFFFF) },
                //groundColor: { value: this.fogColor },
                //groundColor: { value: new THREE.Color(0x4a5c5b) },
                fogColor: { value: new THREE.Color(0x9eafcb) },
                fog: { value: this.setting.fog },
                t: { value: this.setting.t }
			},
			vertexShader: SkyVert,
			fragmentShader: SkyFrag,
			depthWrite: false,
			depthTest: false,
			side:THREE.BackSide,
			//transparent:true,
		});



		var t = new THREE.IcosahedronGeometry( 1, 1 );
		var cmesh = new THREE.Mesh( t, this.materialSky );

		
		this.renderSky.add( cmesh );

		this.cubeCameraRender = new THREE.WebGLCubeRenderTarget( this.skyResolution, {
					//format: THREE.RGBFormat,
					//generateMipmaps: true,
					//minFilter: THREE.LinearMipmapLinearFilter,
					//encoding: THREE.sRGBEncoding
				});
		//this.cubeCameraRender.texture.type = THREE.HalfFloatType;
		this.cubeCameraRender.texture.type = THREE.FloatType;

		this.cubeCamera = new THREE.CubeCamera( 0.1, 2, this.cubeCameraRender );
		this.cubeCamera.position.y = 0.01
		this.renderSky.add( this.cubeCamera );

		//this.cubeCamera.update( this.renderer, this.sceneSky );


		this.sceneSky.background = this.cubeCameraRender.texture
		
		//this.render();

		//this.envMap = this.cubeCameraRender.texture;
		//this.envMap.encoding = THREE.sRGBEncoding
		//this.envMap.minFilter = THREE.LinearMipMapLinearFilter;
		//this.envMap.format = THREE.RGBAFormat;

		

		/*this.material = new THREE.ShaderMaterial( {

			uniforms: {
				lightdir: { value: this.sunPosition },
				lunardir: { value: new THREE.Vector3(0, -.2, 1) },
				tCube: { value: this.envMap },
                tDome: { value: this.textureLoader.load( "./assets/milkyway.png",  function ( t ) { t.encoding = THREE.sRGBEncoding; } ) },
			},
			vertexShader: this.shaders['base_vs'],
			fragmentShader: this.shaders['dome_fs'],
			side:THREE.BackSide,
			
		});

		this.material.needsUpdate = true;*/

		this.update();

		//this.callback();

	}

	

	getSunColor()
	{
		var n = this.k( this.sunTop, this.sunPosition)
		var a = this.z(n, this.sunMax, .028, this.sunPosition);
        a.r = a.r > 1.0 ? 1.0:a.r;
        a.g = a.g > 1.0 ? 1.0:a.g;
        a.b = a.b > 1.0 ? 1.0:a.b;
        this.sunColor.setRGB(a.r, a.g, a.b);
	}

	k(e, t) 
	{
        let n = t.dot(t),
            a = 2 * t.dot(e),
            o = e.dot(e) - 1,
            r = a * a - 4 * n * o,
            i = Math.sqrt(r),
            l = (-a - i) * 0.5,
            s = o / l;
        return s
    }

    z(e, t, n, a) 
    {
        let r = a.y >= 0 ? 1 : 0;
        return { 
        	r : (t.x - t.x * Math.pow(this.sunCol.x, n / e)) * r, 
        	g : (t.y - t.y * Math.pow(this.sunCol.y, n / e)) * r, 
        	b : (t.z - t.z * Math.pow(this.sunCol.z, n / e)) * r 
        }
    }

    setData( d ) {

        this.setting = d;
        this.update();

    }

	update() {

		var setting = this.setting;

		setting.inclination = (setting.hour*15)-90;

		this.setting.t = setting.hour

        this.sunSph.phi = (setting.inclination-90) * this.torad;
        this.sunSph.theta = (setting.azimuth-90) * this.torad;
        this.sun.position.setFromSpherical( this.sunSph );

        this.moonSph.phi = (setting.inclination+90) * this.torad;
        this.moonSph.theta = (setting.azimuth-90) * this.torad;
        this.moon.position.setFromSpherical( this.moonSph )

        this.sunPosition = this.sun.position.clone().normalize();
        //this.moonPosition = this.sun.position.clone().normalize();

        // sun color formule
        this.getSunColor()

        this.sun.color.copy(this.sunColor);
        this.sunMaterial.color.copy( this.sunColor )

        this.sun.intensity = this.sunColor.r;

        var ma = 1 - this.sunColor.r;
        var mg = 1 - this.sunColor.g;
        var mb = 1 - this.sunColor.b;

        this.moon.intensity = ma*0.5;
        this.moon.color.setRGB(ma, mg, mb);
        this.moonMaterial.color.copy( this.moon.color );

		this.materialSky.uniforms.t.value = setting.t;
		this.materialSky.uniforms.fog.value = setting.fog;
		this.materialSky.uniforms.lightdir.value = this.sunPosition;

		this.materialSky.uniforms.cloud_size.value = setting.cloud_size;
		this.materialSky.uniforms.cloud_covr.value = setting.cloud_covr;
		this.materialSky.uniforms.cloud_dens.value = setting.cloud_dens;

		this.materialSky.uniforms.SAMPLE.value = setting.sample;
		this.materialSky.uniforms.STEP.value = setting.step;
		//this.material.uniforms.lightdir.value = this.sunPosition;

		this.needsUpdate = true;




		//if( !this.visible ) this.visible = true;

		this.render()

	}

	render() {

		//this.materialSky.uniforms.groundColor.value = this.fogColor;

		//this.materialSky.uniforms.cloud_size.value = this.setting.cloud_size;
		//this.materialSky.uniforms.cloud_covr.value = this.setting.cloud_covr;
		//this.materialSky.uniforms.cloud_dens.value = this.setting.cloud_dens;

		//if(this.needsUpdate) this.renderer.render( this.scene, this.camera );
		const read = new Float32Array( 4 );
		
		//valueNode.innerHTML = 'r:' + read[ 0 ] + '<br/>g:' + read[ 1 ] + '<br/>b:' + read[ 2 ];

		this.cubeCamera.update( this.renderer, this.renderSky );

        // [ cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ ] = this.children;
        let s = this.skyResolution * 0.5

        // fog
		this.renderer.readRenderTargetPixels( this.cubeCameraRender, 0, s, 1, 1, read, 0 );//activeCubeFaceIndex
		this.fogColor.setRGB( read[ 0 ], read[ 1 ], read[ 2 ])
		// sky
		this.renderer.readRenderTargetPixels( this.cubeCameraRender, 0, s, 1, 1, read, 2 );//activeCubeFaceIndex
		this.skyColor.setRGB( read[ 0 ], read[ 1 ], read[ 2 ])
		// ground
		this.renderer.readRenderTargetPixels( this.cubeCameraRender, 0, s+10, 1, 1, read, 0 );//activeCubeFaceIndex
		this.groundColor.setRGB( read[ 0 ], read[ 1 ], read[ 2 ])


		this.scene.fog.color.copy( this.fogColor )
		this.sunHemisphere.color.copy(this.skyColor);
		this.sunHemisphere.groundColor.copy(this.groundColor);


		this.setting.sun_color = this.sunColor.getHex()
		this.setting.sky_color = this.skyColor.getHex()
		this.setting.fog_color = this.fogColor.getHex()
		this.setting.ground_color = this.groundColor.getHex()

		//console.log(this.fogColor.getHexString(), this.skyColor.getHexString()), this.groundColor.getHexString()
		this.needsUpdate = false;

	}





}

const SkyVert = `
varying vec3 worldPosition;
void main()	{

	worldPosition = ( modelMatrix * vec4( position, 1.0 )).xyz;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
`;

const SkyFrag = `
varying vec3 worldPosition;
uniform vec3 fogColor;
uniform vec3 sunTop;

uniform sampler2D noiseMap;
uniform vec3 lightdir;
uniform float fog;
uniform float cloud_size;
uniform float cloud_covr;
uniform float cloud_dens;
uniform float t;

uniform int SAMPLE;
uniform int STEP;

//const int SAMPLE = 64;
//const int STEP = 8;

const float c = 6.36e6;
const float d = 6.38e6;

const float g = 0.76;
const float h = g*g;
const float icc = 1.0/8e3;
const float jcc = 1.0/1200.0;
const float pi = 3.141592653589793;

const vec3 vm = vec3( 0,-c,0 );
const vec3 vn = vec3( 2.1e-5 );
const vec3 vo = vec3( 5.8e-6, 1.35e-5, 3.31e-5 );

float noise( in vec3 x ){

    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    
    vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
    vec2 rg = texture2D( noiseMap, (uv+0.5)/256.0, -16.0 ).yx;
    return mix( rg.x, rg.y, f.z );
}

float NOISE( vec3 r ){

	r.xz += t;
	r *= 0.5;
	float s;
	s = 0.5 * noise(r);
	r = r * 2.52;
	s += 0.25 * noise(r);
	r = r * 2.53;
	s += 0.125 * noise(r);
	r = r * 2.51;
	s += 0.0625 * noise(r);
	r = r * 2.53;
	s += 0.03125 * noise(r);
	r = r*2.52;
	s += 0.015625 * noise(r);
	return s;

}

float MakeNoise( vec3 r ){

	float s,t;
	s = NOISE( r * 2e-4 * ( 1.0 - cloud_size ) );
	t = ( 1.0 - cloud_covr ) * 0.5 + 0.2;
	s = smoothstep( t, t+.2 , s );
	s *= 0.5*(cloud_dens*100.0);
	return s;

}

void cloudLayer( in vec3 r,out float s,out float t,out float u ){

	float v,w;
	v = length( r-vm ) - c;
	w = 0.0;
	if( 5e3 < v && v < 1e4 ) w = MakeNoise( r ) * sin( pi*(v-5e3)/5e3 );
	s = exp(-v*icc) + fog;
	t = (exp(-v*jcc) + w + fog);
	u = w + fog;

}

float ca(in vec3 r,in vec3 s,in float t){

	vec3 u = r-vm;
	float v,w,x,y,z,A;
	v = dot(u,s);
	w = dot(u,u)-t*t;
	x = v*v-w;
	if( x<0.0 ) return -1.0;
	y = sqrt(x);
	z = -v-y;
	A = -v+y;
	return z >= 0.0 ? z : A;

}

vec3 makeSky( in vec3 r, in vec3 s, out float t){
	
	float u,v,w,x,y,z,A,B,C,m,F;
	vec3 p = normalize( lightdir );
	u = ca(r,s,d);
	v = dot(s,p);
	w = 1.0+v*v;
	x = 0.0596831*w;
	y = 0.0253662*(1.0-h)*w/((2.0+h)*pow(abs(1.0+h-2.0*g*v),1.5));
	z = 50.*pow(abs(1.+dot(s,-p)),2.0)*dot(vec3(0,1,0),p)*(1.0-cloud_covr)*(1.0-min(fog,1.0));
	A = 0.0;
	B = 0.0;
	C = 0.0;
	m = 0.0;
	vec3 D,E;
	float H,J,K,L,M, N,O,P,Q, S,U,V,W;
	D = vec3(0);
	E = vec3(0);
	F = u / float( SAMPLE );

	for( int G=0; G<SAMPLE; ++G ){
		//float H,J,K,L,M;
		H = float(G)*F;
		vec3 I = r + s * H;
		L = 0.0;
		cloudLayer( I, J, K, L );
		J *= F;
		K *= F;
		A += J;
		B += K;
		C += L;
		M = ca(I,p,d);
		if( M > 0.0 ){
			//float N,O,P,Q;
			N=M/float(STEP);
			O=0.0;
			P=0.0;
			Q=0.0;
			for( int R=0; R<STEP; ++R ){
				float S,U,V,W;
				S = float(R)*N;
				vec3 T=I+p*S;
				W = 0.0;
				cloudLayer( T, U, V, W );
				O+=U*N;
				P+=V*N;
				Q+=W*N;
			}
			vec3 S = exp(-(vo*(O+A)+vn*(P+B)));
			m+=L;
			D+=S*J;
			E+=S*K+z*m;
		}
		else return vec3(0.0);
	}
	t = m * 0.0125;// /80.0;
	return ( (D * vo * x) + (E * vn * y)) * 15.0;
}

void main(){

	vec3 light = normalize( lightdir );
	vec3 r = normalize( worldPosition );
	float uvy = acos( r.y ) / pi;
	float up = 0.5;
	float top = uvy <= up ? 1.0 : smoothstep(1.0, 0.0, (uvy-up)*20.0);
	float low = uvy > up ? 1.0 : smoothstep(1.0, 0.0, (up-uvy)*5.0);

	vec3 s = sunTop;
	float lm = dot( s, light );

	float m = 0.0;
	vec3 sky = clamp( makeSky( s, r, m ), vec3( 0.0 ), vec3( 10000.0 ) );
	sky = pow( abs( sky ), vec3( .4 ) );
	sky = mix( fogColor*(lm-0.5), sky, top);

	vec3 night = mix( vec3(0.14, 0.16, 0.18), vec3(0.04, 0.06, 0.08), low) * (1.0-lm);

	night = mix( night, vec3(0.04, 0.06, 0.08), m); //* (1.0-lm);

	vec3 color = night + sky;
	//color = mix( fogColor*lm, color, top);

	//color = mix( sky, fogColor * (lm*0.5), low);

	//vec4 extraFog = vec4( fogColor, low );

	//if( color.r == 0.0 ) color = vec3(1.0,1.0,1.0);

	gl_FragColor = vec4( color, 1.0);

}
`;