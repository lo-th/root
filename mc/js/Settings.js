var scene_settings = {
	pause: false,
	bgColor: 0x2A2A2A
};



var shaderNoiseSettings = {
	handPower:0.0,
	noisePower:1.0,
	animation:false
};
var shaderTerrainSettings = {
	exposure:2.1,
	brightMax:1.3,
	shininess:30,
	reflectTop:0.1,
	reflectBottom:0.1,
	normalScale:4.0,
	profondeur:-100.0,
	enableReflection:true,
	enableOcc:false,

	enableExtraLight:true,
	enableAmbientLight:true,
	enablePointLight:false,
	enableDirectLight:true,

	pointPower:1.0,
	directPower:0.6,
	minMix: 1.4
};
var filterSettings = {
	staticImage:false,
	debug:false,
	finalBrightness:0.96,
	finalContrast:1.6,
	innerBrightness:1.1,
	innerContrast:0.7,
	innerBlend:0.5,
}

// lumieres
var colorSettings = {
	diffuse:0xFFFFFF,
	specular:0xFFFFFF,
	ambientColor:0xEEEEEE,
	pointColor:0x975c34,
	directColor:0xFFFFFF,
}
// position des lumieres
var positionSettings = {
	pointPositionX:0,
	pointPositionY:10,
	pointPositionZ:0,

	directDirectionX:0.2,
	directDirectionY:0.4,
	directDirectionZ:-0.8,
}