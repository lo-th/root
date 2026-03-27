import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.webgpu.js';

let camera, mesh, mouse, scene, renderer, timer, dataTexture, diffuseMap, normalMap;
let tiles, tiles_n; 
let last = 0;
const position = new THREE.Vector2();
const color = new THREE.Color();

let isWebGpu = false

//init();

export async function init( forceGl = false ) {

	// load tile texture
	const canvasColor = await createCanvas('tile.png')
	const canvasNormal = await createCanvas('tile_n.png')
	// generate tiles data texture
	tiles = makePixelData(canvasColor)
	tiles_n = makePixelData(canvasNormal)

	renderer = new THREE.WebGPURenderer( { antialias:true, forceWebGL: forceGl } );
	renderer.setPixelRatio( 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.toneMapping = THREE.NeutralToneMapping;
	renderer.toneMappingExposure = 1;
	document.body.appendChild( renderer.domElement );

	await renderer.init();

	isWebGpu = renderer.backend.isWebGLBackend === undefined ? true : false

	console.log( isWebGpu ? 'webGPU' : 'webGL2' )

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 2;

	mouse = new THREE.Vector2();

	scene = new THREE.Scene();

	timer = new THREE.Timer();
	timer.connect( document );

	const data = new Uint8Array( 512 * 512 * 4 );
	diffuseMap = new THREE.DataTexture(data, 512,512)
	diffuseMap.colorSpace = THREE.SRGBColorSpace;
	diffuseMap.needsUpdate = true;

	const datan = new Uint8Array( 512 * 512 * 4 );
	normalMap = new THREE.DataTexture(data, 512,512)
	normalMap.needsUpdate = true;

	const light = new THREE.PointLight(0xffffff, 4, 4, 2)
	light.position.z = 1
	scene.add(light)

	const light2 = new THREE.HemisphereLight(0x00ffff, 0xff9900, 1)
	light2.position.set(0,0.1,0)
	scene.add(light2)

	const geometry = new THREE.PlaneGeometry( 2, 2 );
	const material = new THREE.MeshStandardMaterial( { 
		map: diffuseMap, 
		normalMap:normalMap, 
		normalScale:new THREE.Vector2(1,-1),
		roughness:0.5, 
		metalness:0.5 
	});

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	window.addEventListener( 'resize', onWindowResize );
	window.addEventListener( 'mousemove', onMove );

	animate()

}

async function createCanvas( url ){

	const loader = new THREE.ImageLoader();
	const image = await loader.loadAsync( url );

	let c = document.createElement("canvas")
	c.width = image.width;
	c.height = image.height;

	let ctx = c.getContext('2d', { willReadFrequently: true })
	ctx.drawImage(image, 0, 0);

    return c

} 

function makePixelData( canvas ){

	const t = []
	const ctx = canvas.getContext('2d', { willReadFrequently: true })
	let pix = 32, x, y, data, texture
	for ( let i = 0; i < 256; i++ ){

		x = ( i % 16 ) * pix;
		y = Math.floor( i / 16 ) * pix;
		data = ctx.getImageData(x, y, pix, pix).data;
		texture = new THREE.DataTexture( data, pix, pix )
		texture.flipY = true
		texture.needsUpdate = true;
		t.push(texture)
	}

	return t
}

function getRandomTile(){

	let n = THREE.MathUtils.randInt( 0, tiles.length-1 );
	return tiles[n]

}

function onMove(e) {

	mouse.x = ((e.clientX/window.innerWidth) * 2 - 1);
	mouse.y = ((e.clientY/window.innerHeight) * 2 - 1);

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

async function animate() {

	timer.update();

	const elapsedTime = timer.getElapsed();

	mesh.rotation.x = -mouse.y
	mesh.rotation.y = -mouse.x


	await renderer.render( scene, camera );

	const render = isWebGpu ? renderer : renderer.backend


	if ( elapsedTime - last > 0.1 ) {

		last = elapsedTime;

		let i = 6
		while(i--){
			position.x = ( 32 * THREE.MathUtils.randInt( 1, 16 ) ) - 32;
			position.y = ( 32 * THREE.MathUtils.randInt( 1, 16 ) ) - 32;

			// get random tiles texture
			let n = THREE.MathUtils.randInt( 0, tiles.length-1 );

			// perform copy from src to dest texture to a random position
			render.copyTextureToTexture( tiles[n], diffuseMap, null, position );
			render.copyTextureToTexture( tiles_n[n], normalMap, null, position );
		}

	}

	requestAnimationFrame( animate );

}