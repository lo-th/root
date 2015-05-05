/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

var dat;

V.Gui = function(){
    this.gui = new dat.GUI();
    this.tmp = {};

    this.init();
    //if(isWithModel) this.model3d();
}
V.Gui.prototype = {
    constructor: V.Gui,
    init:function(){
        var f00 = this.gui.addFolder('view');
        f00.add( viewSettings, "preview").listen().onChange();
        f00.open();
        var f0 = this.gui.addFolder('noise');
        f0.add( shaderTerrainSettings, "profondeur", -30.0, 30.0 ).listen().onChange( terrain.matChanger );
        f0.add( shaderNoiseSettings, "handPower", 0.0, 1.0 ).listen().onChange( terrain.matChanger );
        f0.add( shaderNoiseSettings, "noisePower", 0.0, 1.0 ).listen().onChange( terrain.matChanger );
        f0.add( shaderNoiseSettings, "animation").listen().onChange( terrain.animation );
        f0.open();
        var f1 = this.gui.addFolder('terrain');
        f1.add( shaderTerrainSettings, "exposure", 0.0, 10.0 ).listen().onChange( terrain.matChanger );
        f1.add( shaderTerrainSettings, "brightMax", 0.0, 10.0 ).listen().onChange( terrain.matChanger );
        
        f1.add( shaderTerrainSettings, "enableReflection" ).listen().onChange( terrain.matChanger );
        f1.add( shaderTerrainSettings, "reflectTop", 0.0, 1.0 ).listen().onChange( terrain.matChanger );
        f1.add( shaderTerrainSettings, "reflectBottom", 0.0, 1.0 ).listen().onChange( terrain.matChanger );
        f1.add( shaderTerrainSettings, "normalScale", -10.0, 10.0 ).listen().onChange( terrain.matChanger );
        f1.add( shaderTerrainSettings, "enableOcc" ).listen().onChange( terrain.matChanger );
        f1.add( shaderTerrainSettings, "minMix", 0.0, 3.0 ).listen().onChange( terrain.matChanger );
        f1.open();
        var f2 = this.gui.addFolder('Video Filter');
        f2.add( filterSettings, "staticImage").listen().onChange( serious.changeSource );
        f2.add( filterSettings, "debug").listen().onChange( serious.initDebug );
        f2.add( filterSettings, "finalBrightness", 0.0, 1.0 ).listen().onChange( serious.changeSetting );
        f2.add( filterSettings, "finalContrast", 0.0, 3.0 ).listen().onChange( serious.changeSetting );
        f2.add( filterSettings, "innerBrightness", 0.0, 1.0 ).listen().onChange( serious.changeSetting );
        f2.add( filterSettings, "innerContrast", 0.0, 3.0 ).listen().onChange( serious.changeSetting );
        f2.add( filterSettings, "innerBlend", 0.0, 1.0 ).listen().onChange( serious.changeSetting );
        f2.open();

        var f3 = this.gui.addFolder('Lights');
        f3.add( shaderTerrainSettings, "enableExtraLight").onChange( terrain.matChanger );
        f3.add( shaderTerrainSettings, "shininess", 0.0, 100.0 ).onChange( terrain.matChanger );
        f3.addColor( colorSettings, "diffuse").onChange( function(){ terrain.upColor('diffuse')} );
        f3.addColor( colorSettings, "specular").onChange( function(){ terrain.upColor('specular')} );
        f3.addColor( colorSettings, "ambientColor").onChange( function(){ terrain.upColor('ambientColor')} );
        //var l0 = f3.addFolder('Ambient Lights');
        var l1 = f3.addFolder('Point Lights');
        l1.add( shaderTerrainSettings, "enablePointLight").listen().onChange( terrain.matChanger );
        l1.add( shaderTerrainSettings, "pointPower", 0.0, 10.0 ).listen().onChange( terrain.matChanger );
        l1.addColor( colorSettings, "pointColor").onChange( function(){ terrain.upColor('pointColor')} );
        l1.add( positionSettings, "pointPositionX", -30, 30).onChange(  function(){terrain.moveLight('pointPosition')} );
        l1.add( positionSettings, "pointPositionY", -30, 30).onChange(  function(){terrain.moveLight('pointPosition')} );
        l1.add( positionSettings, "pointPositionZ", -30, 30).onChange(  function(){terrain.moveLight('pointPosition')} );
        var l2 = f3.addFolder('Direct Lights');
        l2.add( shaderTerrainSettings, "enableDirectLight").listen().onChange( terrain.matChanger );
        l2.add( shaderTerrainSettings, "directPower", 0.0, 10.0 ).listen().onChange( terrain.matChanger );
        l2.addColor( colorSettings, "directColor").onChange( function(){ terrain.upColor('directColor')} );
        l2.add( positionSettings, "directDirectionX", -1, 1).onChange(  function(){terrain.moveLight('directDirection')} );
        l2.add( positionSettings, "directDirectionY", -1, 1).onChange(  function(){terrain.moveLight('directDirection')} );
        l2.add( positionSettings, "directDirectionZ", -1, 1).onChange(  function(){terrain.moveLight('directDirection')} );
        //var l3 = f3.addFolder('Spot Lights');
        //l3.add( shaderTerrainSettings, "enableSpotLight").listen().onChange( terrain.matChanger );

    }
}

V.Environment = function(Parent){
    this.main = Parent;
    //this.shaders = [];
    this.envLists = ['env0.jpg','env1.jpg','env2.jpg'];
    this.nEnv = 0;
    this.init();
}

V.Environment.prototype = {
    constructor: V.Environment,
    init:function(){
        var env = document.createElement('div');
        env.className = 'environment';
        var canvas = document.createElement( 'canvas' );
        canvas.width = canvas.height = 64;
        env.appendChild( canvas );
        this.envcontext = canvas.getContext('2d');
        //env.onclick = function(){this.load()}.bind(this);
        env.onmousedown = function(){this.load()}.bind(this);
        env.onmouseup = function(){window.top.focus();};
        document.body.appendChild( env );
        this.load();
    },
    load: function(){
        var img = new Image();
        img.onload = function(){
            this.nEnv++;
            if(this.nEnv==this.envLists.length) this.nEnv = 0;
            this.envcontext.drawImage(img, 0,0,64,64);
            
            this.environment = new THREE.Texture(img);
            this.environment.mapping = THREE.SphericalReflectionMapping;
            this.environment.needsUpdate = true;

            //this.main.environment = new THREE.Texture(img); 
            //this.main.environment.needsUpdate = true;

            terrain.terrainShader.uniforms.env.value = this.environment;

        }.bind(this);
        img.src = 'textures/'+this.envLists[this.nEnv];
        
    }
}