import * as THREE from 'three';
//import { Lensflare, LensflareElement } from '../examples/jsm/objects/Lensflare.js';


export class Sky  {

	constructor( o = {} ) {

		//super()

		this.size = o.size || 500;

		this.setting = {

			direct:false,

			t:0,
			fog:0,
			inclination: 45,
			azimuth: 90,
			hour:12,

			cloud_size:0,
			cloud_covr:0.25,
			cloud_dens:0.5,
			cloud_dist:0.15,

			haze:0.06,
			

			night_luma:0.25,

			sample:8,//64
			step:4,//8

			fogColor: 0xC2ECFF,
            groundColor:0xa9733b,//0x30b843
            cloudColor: 0xffffff,//0x30b843
            skyColor: 0xFFFFFF,//0x30b843


			sun_color:0xFFFFFF,
			sky_color:0xFFFFFF,
			fog_color:0xFFFFFF,
			ground_color:0xFFFFFF,

			saturation:1.5,

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
	    this.needsUpdate = true;
	    this.torad = 0.0174532925199432957; 

	    this.skyColor = new THREE.Color()
	    this.fogColor = new THREE.Color()
	    this.sunColor = new THREE.Color();
	    this.groundColor = new THREE.Color()

	    this.sunCol = new THREE.Vector3(.188, .458, .682);
	    this.sunTop = new THREE.Vector3(0, .99, 0);
	    this.sunMax = new THREE.Vector3(1.8, 1.8, 1.8);

	    this.addLight();
	    
	    this.init();
	    this.load();

	}

	load(){
		this.noiseMap = this.textureLoader.load("./js/assets/noise.png", function(){this.start()}.bind(this) )
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

		this.read = new Float32Array( 4 );

		this.skyResolution = 256;

		this.materialSky = new THREE.ShaderMaterial( {

			uniforms: {
				lightdir: { value: this.sunPosition },
				sunTop: { value:this.sunTop },
				noiseMap: { value:null },

				cloud_size: { value: this.setting.cloud_size },
                cloud_covr: { value: this.setting.cloud_covr },
                cloud_dens: { value: this.setting.cloud_dens },
                cloud_dist: { value: this.setting.cloud_dist },

                night_luma: { value: this.setting.night_luma },
                haze: { value: this.setting.haze },
                hazeAlpha: { value: this.setting.hazeAlpha },
                SAMPLE:{ value: this.setting.sample },
                STEP:{ value: this.setting.step },

                saturation:{ value: this.setting.saturation },
                //cloudColor: { value: new THREE.Color(0xFFFFFF) },
                //groundColor: { value: this.fogColor },
                //groundColor: { value: new THREE.Color(0x4a5c5b) },
               // fogColor: { value: new THREE.Color(0x9eafcb) },
                fogColor: { value: new THREE.Color(this.setting.fogColor) },
                groundColor: { value: new THREE.Color(this.setting.groundColor) },//0x30b843
                cloudColor: { value: new THREE.Color(this.setting.cloudColor) },//0x30b843
                skyColor: { value: new THREE.Color(this.setting.skyColor) },//0x30b843

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

		if(this.setting.direct){

			cmesh.scale.set( 100, 100, 100 )
			this.scene.add( cmesh );

		} else {

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
			//this.cubeCamera.position.y = 0.075
			this.renderSky.add( this.cubeCamera );
			this.envmap = this.cubeCameraRender.texture;
			this.sceneSky.background = this.envmap;

		}
		

	}

	start()
	{

		this.materialSky.uniforms.noiseMap.value = this.noiseMap;
		this.noiseMap.wrapS = this.noiseMap.wrapT = THREE.RepeatWrapping;
		this.noiseMap.flipY = false;
		this.needsUpdate = true;

		this.update();

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

		if(!this.needsUpdate) return;

		const setting = this.setting;

		setting.inclination = (setting.hour*15)-90;

		setting.t = setting.hour

        this.sunSph.phi = (setting.inclination-90) * this.torad;
        this.sunSph.theta = (setting.azimuth-90) * this.torad;
        this.sun.position.setFromSpherical( this.sunSph );

        this.moonSph.phi = (setting.inclination+90) * this.torad;
        this.moonSph.theta = (setting.azimuth-90) * this.torad;
        this.moon.position.setFromSpherical( this.moonSph )

        this.sunPosition = this.sun.position.clone().normalize();
        //this.moonPosition = this.sun.position.clone().normalize();

        let lm = this.sunTop.dot( this.sunPosition );
	    let day = this.clamp((lm*4.0), 0.0, (1.0-setting.night_luma) )+setting.night_luma;

	    console.log(lm)

	    //this.fogColor.setHex(setting.fogColor).multiplyScalar(day)
	    this.groundColor.setHex(setting.groundColor).multiplyScalar(day)

	    //this.setting.fog_color = this.fogColor.getHex()
		//this.setting.ground_color = this.groundColor.getHex()

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

        this.upShader()

		if(!setting.direct) this.render()

	}

	clamp( value, min, max ) {

		return Math.max( min, Math.min( max, value ) );

	}

	upShader() {
		const setting = this.setting;

		//if(!this.materialSky)return

		this.materialSky.uniforms.t.value = setting.t;
		this.materialSky.uniforms.fog.value = setting.fog;
		this.materialSky.uniforms.haze.value = setting.haze;
		this.materialSky.uniforms.lightdir.value = this.sunPosition;
		this.materialSky.uniforms.cloud_size.value = setting.cloud_size;
		this.materialSky.uniforms.cloud_covr.value = setting.cloud_covr;
		this.materialSky.uniforms.cloud_dens.value = setting.cloud_dens;
		this.materialSky.uniforms.cloud_dist.value = setting.cloud_dist;

		this.materialSky.uniforms.saturation.value = setting.saturation;

		this.materialSky.uniforms.night_luma.value = setting.night_luma;
		this.materialSky.uniforms.SAMPLE.value = setting.sample;
		this.materialSky.uniforms.STEP.value = setting.step;

		this.materialSky.uniforms.fogColor.value.setHex( setting.fogColor);
		this.materialSky.uniforms.groundColor.value.setHex( setting.groundColor);
		this.materialSky.uniforms.cloudColor.value.setHex( setting.cloudColor);
		this.materialSky.uniforms.skyColor.value.setHex( setting.skyColor );
	}

	render() {

		const setting = this.setting;

		const read = this.read;

		
		
		//valueNode.innerHTML = 'r:' + read[ 0 ] + '<br/>g:' + read[ 1 ] + '<br/>b:' + read[ 2 ];

		this.cubeCamera.update( this.renderer, this.renderSky );

        // [ 0 cameraPX, 1 cameraNX, 2 cameraPY, 3 cameraNY, 4 cameraPZ, 5 cameraNZ ] = this.children;
        let s = this.skyResolution * 0.5

        // fog
		this.renderer.readRenderTargetPixels( this.cubeCameraRender, 0, s, 1, 1, read, 0 );//activeCubeFaceIndex
		this.fogColor.setRGB( read[ 0 ], read[ 1 ], read[ 2 ])
		// sky
		this.renderer.readRenderTargetPixels( this.cubeCameraRender, s, s, 1, 1, read, 2 );//activeCubeFaceIndex
		this.skyColor.setRGB( read[ 0 ], read[ 1 ], read[ 2 ])
		// ground
		//this.renderer.readRenderTargetPixels( this.cubeCameraRender, s, s, 1, 1, read, 3 );//activeCubeFaceIndex
		//this.groundColor.setRGB( read[ 0 ], read[ 1 ], read[ 2 ])


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
uniform vec3 groundColor;
uniform vec3 cloudColor;
uniform vec3 skyColor;

uniform float saturation;

uniform vec3 sunTop;

uniform sampler2D noiseMap;
uniform vec3 lightdir;
uniform float fog;

uniform float cloud_size;
uniform float cloud_covr;
uniform float cloud_dens;
uniform float cloud_dist;

uniform float night_luma;
uniform float haze;
uniform float t;

uniform int SAMPLE;
uniform int STEP;

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
	r = r * 2.52;
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

void clouds( in vec3 r, out vec3 CL ){

	float v,w;
	v = length( r-vm ) - c;
	w = 0.0;
	if( 5e3 < v && v < 1e4 ) w = MakeNoise( r ) * (sin( pi*(v-5e3)/5e3 ));
	CL = vec3( exp(-v*icc), exp(-v*jcc), w );

}

float ca( in vec3 r, in vec3 s, in float t ){

	vec3 u = r - vm;
	float v,w,x,y,z,A;
	v = dot(u,s);
	w = dot(u,u)-t*t;
	x = v*v-w;
	if( x < 0.0 ) return -1.0;
	y = sqrt(x);
	z = -v-y;
	A = -v+y;
	return z >= 0.0 ? z : A;

}

vec3 makeSky( in vec3 lightpos, in vec3 r, in vec3 s, out float t, out vec3 cc){
	
	float u,v,w,x,y,z,m, M, N,S, H,F;
	vec3 p = lightpos;
	u = ca(r,s,d);
	v = dot(s,p);
	w = 1.0+v*v;
	x = 0.0596831*w;
	y = 0.0253662*(1.0-h)*w/((2.0+h)*pow(abs(1.0+h-2.0*g*v),1.5));
	z = 50.*pow(abs(1.+dot(s,-p)),2.0)*dot(vec3(0,1,0),p)*(1.0-cloud_covr)*(1.0-min(fog,1.0));

	m = 0.0;
	vec3 D,E;
	vec3 DD,EE;

	vec3 CB, CM, BB, BM, AB, AM, DB, DM;
	F = u / float( SAMPLE );

	BB = vec3(0.0);
	DB = vec3(0.0);

	for( int G=0; G<SAMPLE; ++G ){

		H = float(G)*F;
		vec3 I = r + s * H;

		clouds( I, CB );
		AB = CB;

		CB.y += CB.z;// add clound
		CB += fog;// add fog

		CB.xy *= F;
		AB.xy *= F;

		BB += CB;
		DB += AB;

		M = ca(I,p,d);

		if( M > 0.0 ){

			N = M/float(STEP);
			BM = vec3(0.0);
			DM = vec3(0.0);

			for( int R=0; R<STEP; ++R ){

				S = float(R)*N;
				vec3 T=I+p*S;

				clouds( T, CM );
				
				AM = CM;

				CM.y += CM.z;// add clound
				CM += fog;// add fog

				BM += CM * N;
				DM += AM * N;

			}

			BB.y *= cloud_dist;
			BM.y *= cloud_dist;

			vec3 S = exp(-(vo*(BM.x+BB.x)+vn*(BM.y+BB.y)));
			vec3 SC = exp(-(vo*(DM.x+DB.x)+vn*(DM.y+DB.y)));

			m += CB.z;
			D += S*CB.x;
			E += (S*CB.y)+z*m;

			DD += SC*AB.x;
			EE += SC*AB.y+z;
		}
		else return vec3(0.0);
	}
	t = clamp( (m / float( SAMPLE )), 0.0, 1.0 );
	cc = ( (DD * vo * x) + (EE * vn * y)) * 15.0; // clear sky
	return ( (D * vo * x) + (E * vn * y)) * 15.0; // cloud sky
}


float gamma = 2.2;

vec3 linearToneMapping(vec3 color)
{
	float exposure = 1.;
	color = clamp(exposure * color, 0., 1.);
	color = pow(color, vec3(1. / gamma));
	return color;
}

vec3 simpleReinhardToneMapping(vec3 color)
{
	float exposure = 1.5;
	color *= exposure/(1. + color / exposure);
	color = pow(color, vec3(1. / gamma));
	return color;
}

vec3 lumaBasedReinhardToneMapping(vec3 color)
{
	float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
	float toneMappedLuma = luma / (1. + luma);
	color *= toneMappedLuma / luma;
	color = pow(color, vec3(1. / gamma));
	return color;
}

vec3 whitePreservingLumaBasedReinhardToneMapping(vec3 color)
{
	float white = 2.;
	float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
	float toneMappedLuma = luma * (1. + luma / (white*white)) / (1. + luma);
	color *= toneMappedLuma / luma;
	color = pow(color, vec3(1. / gamma));
	return color;
}

vec3 RomBinDaHouseToneMapping(vec3 color)
{
    color = exp( -1.0 / ( 2.72*color + 0.15 ) );
	color = pow(color, vec3(1. / gamma));
	return color;
}

vec3 czm_saturation(vec3 rgb, float adjustment)
{
    // Algorithm from Chapter 16 of OpenGL Shading Language
    vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return mix(intensity, rgb, adjustment);
}


vec3 filmicToneMapping(vec3 color)
{
	color = max(vec3(0.), color - vec3(0.004));
	color = (color * (6.2 * color + .5)) / (color * (6.2 * color + 1.7) + 0.06);
	color = czm_saturation(color, saturation);
	return color;
}



vec3 Uncharted2ToneMapping(vec3 color)
{
	float A = 0.15;
	float B = 0.50;
	float C = 0.10;
	float D = 0.20;
	float E = 0.02;
	float F = 0.30;
	float W = 11.2;
	float exposure = 2.;
	color *= exposure;
	color = ((color * (A * color + C * B) + D * E) / (color * (A * color + B) + D * F)) - E / F;
	float white = ((W * (A * W + C * B) + D * E) / (W * (A * W + B) + D * F)) - E / F;
	color /= white;
	color = pow(color, vec3(1. / gamma));
	return color;
}

void main(){

	vec3 light = lightdir;

	vec3 r = normalize( worldPosition );
	float uvy = acos( r.y ) / pi;

	float high = smoothstep(1.0, 0.0, (uvy-0.002)*10000.0);
	float top =  smoothstep(1.0, 0.0, (uvy-0.50)*1000.0);
	float mid = uvy > 0.5 ? smoothstep(0.0, 1.0, (uvy-0.5)*(haze*100.0)) : smoothstep(0.0, 1.0, (0.5-uvy)*(haze*100.0));
	

	vec3 s = sunTop;
	float lm = dot( s, light );
	float day = clamp((lm*4.0), 0.0, (1.0-night_luma) )+night_luma;

	if(lm <= 0.0) light *= -1.0;
	light.y = abs(light.y);


	float midd = pow(  mid, abs(lm)-0.2 );
	midd = clamp( midd, 0.0, 1.0 );
	mid = clamp( mid, 0.0, 1.0 );



	float m = 0.0;
	vec3 cc = vec3(0.0);

	//vec3 sky = clamp( makeSky( light, s, r, m, cc ), 0.0, 1.0 );
	//vec3 sky = clamp( makeSky( light, s, r, m, cc ), vec3( 0.0 ), vec3( 10000.0 ) );
	vec3 sky = makeSky( light, s, r, m, cc );

	//sky = pow(  sky, vec3( .5 ) ) * day;

	m = pow( abs( m ), .9 );

	sky = filmicToneMapping(sky) * day;
	cc = filmicToneMapping(cc) * day;
	cc *= skyColor;

	sky = mix( cc, sky*cloudColor, m);

	sky = mix( groundColor * day, sky, top);
	//sky = mix( fogColor * day, sky, mid);

	cc = mix( fogColor * day , cc, midd );

	sky = mix( sky, cc, high);
	sky = mix( cc, sky, mid);


	
	gl_FragColor = vec4( sky, 1.0 );

}
`;