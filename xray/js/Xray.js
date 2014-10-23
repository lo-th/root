var Xray = {};

Xray.Mesh = function(geometry, parametre){

}

Xray.Shader = function(side){

    var side = side || 'front';
    var sider = THREE.FrontSide;
    if(side == 'back'){
        sider = THREE.BackSide;
       // this.uniforms = Xray.Base.uniformsBack;
    }/* else {
        this.uniforms = Xray.Base.uniforms;
    }*/

    this.uniforms = THREE.UniformsUtils.merge( [ Xray.Base.uniforms ] );
    //this.uniforms = JSON.parse( JSON.stringify( Xray.Base.uniforms ) );

    this.shader = new THREE.ShaderMaterial({
        uniforms : this.uniforms,
        vertexShader: Xray.Base.vs,
        fragmentShader: Xray.Base.fs,
        blending: THREE.AdditiveBlending,
        wrapping: THREE.ClampToEdgeWrapping,
        shading: THREE.SmoothShading,
        color:0X000000,
        depthTest: true,
        depthWrite: true,
        transparent: true,
        side : sider
    });
    return this.shader;
}

Xray.clone = function(obj) {
  var newObj = (obj instanceof Array) ? [] : {};
  for (var i in obj) {
    if (i == 'clone') continue;
    if (obj[i] && typeof obj[i] == "object") {
      newObj[i] = obj[i].clone();
    } else newObj[i] = obj[i]
  } return newObj;
};

Xray.Base ={
    attributes:{},
    uniforms:{ 
        tMatCap: {type: 't', value: null},
        noiseMat: {type: 't', value: null},
        glowColor: {type: 'c', value: null},
        opacity: {type: 'f', value: 1},
        noise: {type: 'f', value: 0},
        useScreen: {type: 'f', value: 0},
        useGlow: {type: 'f', value: 1},
        useGlowColor: {type: 'f', value: 1},
        c: {type: 'f', value: 1.0},
        p: {type: 'f', value: 1.4},
        useRim: {type: 'f', value: 0},
        useExtraRim: {type: 'f', value: 0},
        rimPower: {type: 'f', value: 0},
        noiseProjection: {type: 'f', value: 0}
    },
    /*uniformsBack:{ 
        tMatCap: {type: 't', value: null},
        noiseMat: {type: 't', value: null},
        glowColor: {type: 'c', value: null},
        opacity: {type: 'f', value: 1},
        noise: {type: 'f', value: 0},
        useScreen: {type: 'f', value: 0},
        useGlow: {type: 'f', value: 1},
        useGlowColor: {type: 'f', value: 1},
        c: {type: 'f', value: 1.0},
        p: {type: 'f', value: 1.4},
        useRim: {type: 'f', value: 0},
        useExtraRim: {type: 'f', value: 0},
        rimPower: {type: 'f', value: 0},
        noiseProjection: {type: 'f', value: 0}
    },*/
    fs:[
        'uniform sampler2D tMatCap;',
        'uniform sampler2D noiseMat;',
        'uniform vec2 uu;',
        'uniform float noise;',
        'uniform vec3 glowColor;',
        'uniform float opacity;',
        'uniform float useGlow;',
        'uniform float useGlowColor;',
        'uniform float useRim;',
        'uniform float useExtraRim;',
        'uniform float rimPower;',
        'varying float intensity;',
        'uniform float useScreen;',
        'uniform float noiseProjection;',
        'varying vec2 vN;',
        'varying vec2 vU;',
        'varying vec2 vUv;',
        'varying vec3 vEye;',
        'varying vec3 vNormal;',
        'varying vec3 vPosition;',

        'void main() {',
            'float op = opacity;',
            // reflexion map
            'vec3 base = texture2D( tMatCap, vN ).rgb;',
            // noise map
            'vec3 bnoise = texture2D( noiseMat, vU ).rgb;',

            'if( useRim > 0. ) {',
                'float f = rimPower * abs( dot( vNormal, normalize( vEye ) ) );',
                'f = useRim * ( 1. - smoothstep( 0.0, 1., f ) );',
                'base += vec3( f );',
            '}',
            'if( useScreen == 1. ) {',
                'base = vec3( 1. ) - ( vec3( 1. ) - base ) * ( vec3( 1. ) - base );',
            '}',
            // noise
            'base += noise * bnoise;',
            'if( useGlowColor == 1. ) {',
                'base *= glowColor;',
            '}',
            // glow color
            'if( useGlow == 1. ) {',
                'base *= intensity;',
            '}',
            // extra Rim
            'if( useExtraRim == 1. ) {',
                'float rim = max( 0., abs( dot( vNormal, -vPosition ) ) );',
                'float r = smoothstep( .25, .75, 1. - rim );',
                'r -= smoothstep( .5, 1., 1. - rim );',
                'vec3 c = vec3( 168. / 255., 205. / 255., 225. / 255. );',
                'base *= c;',
                'op *= r;',
            '}',

            'gl_FragColor = vec4( base, op );',
        '}'
    ].join("\n"),
    vs:[
        'uniform float c;',
        'uniform float p;',
        'uniform float useRim;',
        'uniform float useGlow;',
        'uniform float useGlowColor;',
        'varying vec2 vN;',
        'varying vec2 vU;',
        'varying vec2 vUv;',
        'varying vec3 vEye;',
        'varying vec3 vNormal;',
        'varying vec3 vPosition;',
        'varying float intensity;',
        'uniform float noiseProjection;',
        'void main() {',
            'vec3 e = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );',
            'vec3 n = normalize( normalMatrix * normal );',
            'vPosition = e;',
            'vNormal = n;',
            'vec3 g = normalize( vec3( projectionMatrix * modelViewMatrix * vec4( position, 1.0 )));',
            'if( useGlow == 1. ) {',
                'intensity = pow( c - dot(n, g), p );',
            '} else {',
                'intensity = 0.;',
            '}',
            'vec3 r = reflect( e, n );',
            'float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );',
            'vN = r.xy / m + .5;',
            'if( noiseProjection == 1. ) {',
                'vU = uv;',
            '} else {',
                //'vU = g.xy;',
                'vU = (e.xy + vec2( 0.8, -0.5 ))/2.;',
            '}',
            'if( useRim > 0. ) {',
                'vEye = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;',
            '} else {',
                'vEye = vec3( 0. );',
            '}',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1. );',
        '}'
    ].join("\n")
};

//---------------------------------
// 2D noise map
//---------------------------------

Xray.Noise = function(renderer){
    this.renderer = renderer;
    this.speed = 0.003;
    this.scale = 20;
    this.animated = false;

    var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
    this.map  = new THREE.WebGLRenderTarget( 512, 512, pars );
    this.map.wrapS = this.map.wrapT = THREE.RepeatWrapping;
    this.map.repeat = new THREE.Vector2(1,1);
    this.cameraOrtho = new THREE.OrthographicCamera(512/ - 2, 512 / 2, 512 / 2, 512 / - 2, -1000, 1000);
    this.cameraOrtho.position.z = 100;
    this.sceneRenderTarget = new THREE.Scene();

    var plane = new THREE.PlaneGeometry( 512, 512 );

    this.quadTarget = new THREE.Mesh( plane, new THREE.MeshBasicMaterial( { color: 0xFF0000 } ) );
    this.quadTarget.position.z = 0;
    this.sceneRenderTarget.add( this.quadTarget );

    this.shader = new THREE.ShaderMaterial({
        uniforms: Xray.perlin.uniforms,
        vertexShader: Xray.perlin.vs,
        fragmentShader: Xray.perlin.fs
    });

    this.quadTarget.material = this.shader;

    this.render();
}

Xray.Noise.prototype = {
    constructor: Xray.Noise,
    render : function(){
        this.shader.uniforms.time.value += this.speed;
        this.renderer.render( this.sceneRenderTarget, this.cameraOrtho, this.map, true );
    }
}


Xray.perlin={
    uniforms:{
        scale: {type: 'f', value: 20.0},
        time: {type: 'f', value: 0}
    },
    fs:[
        'varying vec2 vUv;',
        'uniform float time;',
        'vec4 permute( vec4 x ) {return mod( ( ( x * 34.0 ) + 1.0 ) * x, 289.0 );}',
        'vec4 taylorInvSqrt( vec4 r ) { return 1.79284291400159 - 0.85373472095314 * r;}',
        'float snoise( vec3 v ) {',
            'const vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );',
            'const vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );',
            // First corner
            'vec3 i  = floor( v + dot( v, C.yyy ) );',
            'vec3 x0 = v - i + dot( i, C.xxx );',
            // Other corners
            'vec3 g = step( x0.yzx, x0.xyz );',
            'vec3 l = 1.0 - g;',
            'vec3 i1 = min( g.xyz, l.zxy );',
            'vec3 i2 = max( g.xyz, l.zxy );',
            'vec3 x1 = x0 - i1 + 1.0 * C.xxx;',
            'vec3 x2 = x0 - i2 + 2.0 * C.xxx;',
            'vec3 x3 = x0 - 1. + 3.0 * C.xxx;',
            // Permutations

            'i = mod( i, 289.0 );',
            'vec4 p = permute( permute( permute( i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) )  + i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) ) + i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );',

            // Gradients
            // ( N*N points uniformly over a square, mapped onto an octahedron.)

            'float n_ = 1.0 / 7.0;', // N=7
            'vec3 ns = n_ * D.wyz - D.xzx;',
            'vec4 j = p - 49.0 * floor( p * ns.z *ns.z );', //  mod(p,N*N)
            'vec4 x_ = floor( j * ns.z );',
            'vec4 y_ = floor( j - 7.0 * x_ );',   // mod(j,N)
            'vec4 x = x_ *ns.x + ns.yyyy;',
            'vec4 y = y_ *ns.x + ns.yyyy;',
            'vec4 h = 1.0 - abs( x ) - abs( y );',
            'vec4 b0 = vec4( x.xy, y.xy );',
            'vec4 b1 = vec4( x.zw, y.zw );',
            'vec4 s0 = floor( b0 ) * 2.0 + 1.0;',
            'vec4 s1 = floor( b1 ) * 2.0 + 1.0;',
            'vec4 sh = -step( h, vec4( 0.0 ) );',
            'vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;',
            'vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;',
            'vec3 p0 = vec3( a0.xy, h.x );',
            'vec3 p1 = vec3( a0.zw, h.y );',
            'vec3 p2 = vec3( a1.xy, h.z );',
            'vec3 p3 = vec3( a1.zw, h.w );',
            // Normalise gradients
            'vec4 norm = taylorInvSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );',
            'p0 *= norm.x;',
            'p1 *= norm.y;',
            'p2 *= norm.z;',
            'p3 *= norm.w;',

            // Mix final noise value
            'vec4 m = max( 0.6 - vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );',
            'm = m * m;',
            'return 42.0 * dot( m*m, vec4( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 ), dot( p3, x3 ) ) );',
        '}',
        'float surface( vec3 coord ) {',
            'float n = 0.0;',
            'n += 0.7    * abs( snoise( coord ) );',
            'n += 0.25   * abs( snoise( coord * 2.0 ) );',
            'n += 0.125  * abs( snoise( coord * 4.0 ) );',
            'n += 0.0625 * abs( snoise( coord * 8.0 ) );',
            'return n;',
        '}',
        'void main() {',
            'vec3 coord = vec3( vUv, -time );',
            'float n = surface( coord );',
            'gl_FragColor = vec4( vec3( n, n, n ), 1.0 );',
        '}'
    ].join("\n"),
    vs:[
        'varying vec2 vUv;',
        'uniform float scale;',
        'void main() {',
            'vec2 size = vec2(1.*scale, 1.*scale);',
            'vUv = vec2( uv.x, 1.0 - uv.y ) * size;',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
    ].join("\n")
};