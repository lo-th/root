/*
    Helper for Three.js
*/ 
"use strict";

THREE.JeelizHelper=(function(){

    //internal settings

    var option = {

        pivotY : 0.4,
        pivotZ : 0.2,
        tweakY : 0.15,
        rotateX : 0,

        sensibility:0.75,//sensibility, between 0 and 1. Less -> more sensitive
        range: 0.05,


    }



    
    var isOnFrame = false;

    //private vars :
    var renderer, scene, camera, _maxFaces, _isMultiFaces, _threeCompositeObjects=[], _threePivotedObjects=[], _detect_callback=null,
        _threeVideoMesh, _gl, _glVideoTexture, _threeVideoTexture, _isVideoTextureReady=false, _isSeparateThreejsCanvas=false, _faceFilterCv, _glShpCopy, _isDetected;

    var threejsCanvas;

    var sizer, videoMaxSize;
    var oldRatio = 0, oldSizer = 0;

    //private funcs :
    function create_threeCompositeObjects(){

        for (let i=0; i<_maxFaces; ++i){
            //COMPOSITE OBJECT WHICH WILL FOLLOW A DETECTED FACE
            //in fact we create 2 objects to be able to shift the pivot point
            var threeCompositeObject=new THREE.Object3D();
            threeCompositeObject.frustumCulled=false;
            threeCompositeObject.visible=false;

            var threeCompositeObjectPIVOTED=new THREE.Object3D(); 
            threeCompositeObjectPIVOTED.frustumCulled = false;
            //threeCompositeObjectPIVOTED.position.set(0, -pivotY, -pivotZ);
            threeCompositeObject.add( threeCompositeObjectPIVOTED );

            _threeCompositeObjects.push( threeCompositeObject );
            _threePivotedObjects.push( threeCompositeObjectPIVOTED );
            scene.add( threeCompositeObject );

            /*if (_settings.isDebugPivotPoint){
                var pivotCubeMesh=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshNormalMaterial({
                    side: THREE.DoubleSide,
                    depthTest: false
                }));
                pivotCubeMesh.position.copy(threeCompositeObjectPIVOTED.position);
                threeCompositeObject.add(pivotCubeMesh);
                window.pivot=pivotCubeMesh;
                console.log('DEBUG in JeelizHelper: set the position of <pivot> in the console and report the value into JeelizThreejsHelper.js for _settings.pivotOffsetYZ');
            }*/
        }
    }

    function create_videoScreen(){
        var videoScreenVertexShaderSource="attribute vec2 position;\n\
                varying vec2 vUv;\n\
                void main(void){\n\
                    gl_Position = vec4(position, 0., 1.);\n\
                    vUv = 0.5 + 0.5*position;\n\
                }";
        var videoScreenFragmentShaderSource="precision lowp float;\n\
                uniform sampler2D samplerVideo;\n\
                varying vec2 vUv;\n\
                void main(void){\n\
                    gl_FragColor=texture2D( samplerVideo, vUv );\n\
                }";

        if (_isSeparateThreejsCanvas){
            var compile_shader=function(source, type, typeString) {
                var shader = _gl.createShader(type);
                _gl.shaderSource(shader, source);
                _gl.compileShader(shader);
                if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
                  alert("ERROR IN "+typeString+ " SHADER : " + _gl.getShaderInfoLog(shader));
                  return false;
                }
                return shader;
            };

            var shader_vertex=compile_shader(videoScreenVertexShaderSource, _gl.VERTEX_SHADER, 'VERTEX');
            var shader_fragment=compile_shader(videoScreenFragmentShaderSource, _gl.FRAGMENT_SHADER, 'FRAGMENT');

            _glShpCopy=_gl.createProgram();
              _gl.attachShader(_glShpCopy, shader_vertex);
              _gl.attachShader(_glShpCopy, shader_fragment);

              _gl.linkProgram(_glShpCopy);
              var samplerVideo=_gl.getUniformLocation(_glShpCopy, 'samplerVideo');
 
            return;
        } else {

        //init video texture with red
            _threeVideoTexture = new THREE.DataTexture( new Uint8Array([255,0,0]), 1, 1, THREE.RGBFormat);
            _threeVideoTexture.needsUpdate=true;

            //CREATE THE VIDEO BACKGROUND
            var videoMaterial=new THREE.RawShaderMaterial({
                depthWrite: false,
                depthTest: false,
                vertexShader: videoScreenVertexShaderSource,
                fragmentShader: videoScreenFragmentShaderSource,
                 uniforms:{
                    samplerVideo: {value: _threeVideoTexture}
                 }
            });

            var videoGeometry=new THREE.BufferGeometry()
            var videoScreenCorners=new Float32Array([-1,-1,   1,-1,   1,1,   -1,1]);
            videoGeometry.addAttribute( 'position', new THREE.BufferAttribute( videoScreenCorners, 2 ) );
            videoGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0,1,2, 0,2,3]), 1));
            _threeVideoMesh=new THREE.Mesh(videoGeometry, videoMaterial);
            that.apply_videoTexture(_threeVideoMesh);
            _threeVideoMesh.renderOrder=-1000; //render first
            _threeVideoMesh.frustumCulled=false;
            scene.add(_threeVideoMesh);
        }
    } //end create_videoScreen()

    function detect( detectState ){

        _threeCompositeObjects.forEach(function( threeCompositeObject, i ){
            _isDetected=threeCompositeObject.visible;
            var ds=detectState[i];
            if (_isDetected && ds.detected< option.sensibility-option.range ){
                    //DETECTION LOST
                if (_detect_callback) _detect_callback(i, false);
                threeCompositeObject.visible=false;

            } else if (!_isDetected && ds.detected> option.sensibility+option.range ){
                //FACE DETECTED
                if (_detect_callback) _detect_callback(i, true);
                threeCompositeObject.visible=true;
            }
        }); //end loop on all detection slots
    }

    
    function realRation () {

        if( oldSizer !== sizer.z ){ // need resize

            var idealRatio = videoMaxSize.z;
            var ratio = sizer.z;

            var videoInvRatio = videoMaxSize.y / videoMaxSize.x;

            var vw1 = sizer.x/videoMaxSize.x;
            var vw2 = sizer.x/videoMaxSize.y;
            var vh1 = sizer.y/videoMaxSize.y;
            var vh2 = sizer.y/videoMaxSize.x;

            var idealHeight = sizer.x*videoInvRatio;
            var idealWidth = sizer.y*videoMaxSize.z;
            var tx = sizer.x/idealWidth;
            var ty = sizer.y/idealHeight;


            var ry = ty > 1 ? 1 : ty;
            var rx = tx > 1 ? 1 : tx;


            if( rx === 1 ) ratio = tx+ty;
            else ratio = vw2/vh1;

            oldRatio = ratio

            oldSizer = sizer.z;
            renderer.setSize( sizer.x, sizer.y );
            camera.aspect = sizer.z;
            camera.updateProjectionMatrix();

       }

        return oldRatio;

    }

    function update_positions3D(ds, threeCamera){

        var vFOV = camera.fov * (Math.PI / 360);
        //var camPosZ = sizer.y / ( 2 * Math.tan( vFOV / 2 ) );

       

       // camera.position.z = -camPosZ        //var halfTanFOV = Math.tan( threeCamera.aspect * vFOV ); //tan(<horizontal FoV>/2), in radians (threeCamera.fov is vertical FoV)
        var ratio = realRation();//(sizer.x / sizer.y) //* (1920/1080))*0.5;//sizer.x / sizer.y;//threeCamera.aspect;

         
        //var halfTanFOV = Math.tan( ratio * vFOV );
         var halfTanFOV = Math.tan(ratio * vFOV );
        //var halfTanFOV=Math.tan(threeCamera.fov*Math.PI/360);
                 
        _threeCompositeObjects.forEach(function(threeCompositeObject, i){

            if (!threeCompositeObject.visible) return;





            var detectState=ds[i];

            //console.log(detectState)

            //tweak Y position depending on rx (see)
            var tweak = option.tweakY * Math.tan( detectState.rx );
            var cz = Math.cos( detectState.rz ), sz=Math.sin( detectState.rz );
            
            var xTweak=sz*tweak*detectState.s;
            var yTweak=cz*tweak*(detectState.s/ratio);
            //var yTweak=cz*tweak*(detectState.s/sizer.z);

            //move the cube in order to fit the head
            var W = detectState.s;      //relative width of the detection window (1-> whole width of the detection window)
            var D = 1/( 2 * W * halfTanFOV ); //distance between the front face of the cube and the camera
            
            //coords in 2D of the center of the detection window in the viewport :
            var xv=detectState.x+xTweak;
            var yv=detectState.y+yTweak;
            
            //coords in 3D of the center of the cube (in the view coordinates system)
            var z=-D-0.5;   // minus because view coordinate system Z goes backward. -0.5 because z is the coord of the center of the cube (not the front face)
            var x=xv*D*halfTanFOV;
            var y=yv*D*halfTanFOV/ratio;
            //var y=yv*D*halfTanFOV/sizer.z;

            //var x=xv*D*halfTanFOV/threeCamera.aspect;
            //var y=yv*D*halfTanFOV;

            //the pivot position depends on rz rotation
            _threePivotedObjects[i].position.set( -sz * option.pivotY, -cz * option.pivotY, -option.pivotZ );

            //move and rotate the cube
            threeCompositeObject.position.set( x, y + option.pivotY, z + option.pivotZ);
            threeCompositeObject.rotation.set( detectState.rx + option.rotateX, detectState.ry, detectState.rz, "ZXY");
        }); //end loop on composite objects
    }

    //public methods :
    var that={

        init: function( spec, detectCallback ){ //launched with the same spec object than callbackReady. set spec.threejsCanvasId to the ID of the threejsCanvas to be in 2 canvas mode

            videoMaxSize = new THREE.Vector3( spec.maxWidth, spec.maxHeight, spec.maxWidth/spec.maxHeight );

            _maxFaces=spec.maxFacesDetected;
            _glVideoTexture=spec.videoTexture;
            _gl=spec.GL;
            _faceFilterCv=spec.canvasElement;
            _isMultiFaces=(_maxFaces>1);

            
            sizer =new THREE.Vector3( _faceFilterCv.width, _faceFilterCv.height, _faceFilterCv.width/ _faceFilterCv.height );

            //CREATE THE CAMERA
            camera = new THREE.PerspectiveCamera(spec.fov || 40, sizer.z, 0.1, 100);



            //enable 2 canvas mode if necessary
            //threejsCanvas;
            if (spec.threejsCanvasId){
                _isSeparateThreejsCanvas=true;
                //set the threejs canvas size to the threejs canvas
                threejsCanvas = document.getElementById(spec.threejsCanvasId);
                threejsCanvas.setAttribute('width', _faceFilterCv.width);
                threejsCanvas.setAttribute('height', _faceFilterCv.height);
            } else {
                threejsCanvas=_faceFilterCv;
            }

            if (typeof(detectCallback)!=='undefined'){
                _detect_callback=detectCallback;
            }

             //INIT THE THREE.JS context
            renderer = new THREE.WebGLRenderer({
                context: (_isSeparateThreejsCanvas)?null:_gl,
                canvas: threejsCanvas,
                alpha: (_isSeparateThreejsCanvas || spec.alpha)?true:false
            });

            //console.log(_isSeparateThreejsCanvas)

            scene = new THREE.Scene();

            var light = new THREE.HemisphereLight( 0xffeeee, 0x111122 );
            scene.add( light );

            var pointLight = new THREE.PointLight( 0xffffff, 1 );
            scene.add( pointLight );

            create_threeCompositeObjects();
            create_videoScreen();


            if(!isOnFrame) that.autoRender();
            
            var returnedDict = {
                videoMesh: _threeVideoMesh,
                renderer: renderer,
                scene: scene,
                camera:camera,

                option : option,
                
            };
            if (_isMultiFaces){
                returnedDict.faceObjects=_threePivotedObjects;
            } else {
                returnedDict.faceObject=_threePivotedObjects[0];
            }
            return returnedDict;
        }, //end that.init()



        getCanvas: function() {
            return threejsCanvas;
        },


        detect: function(detectState){

            var ds=(_isMultiFaces)?detectState:[detectState];

            //update detection states
            detect(ds);
        },

        get_isDetected: function() {
            return _isDetected;
        },

        render: function( detectState ){

            var ds=(_isMultiFaces)?detectState:[detectState];

            //update detection states
            detect(ds);
            update_positions3D(ds);

            if (_isSeparateThreejsCanvas){

                sizer.set( _faceFilterCv.width, _faceFilterCv.height, _faceFilterCv.width / _faceFilterCv.height );

                //render the video texture on the faceFilter canvas :
                _gl.viewport(0,0, _faceFilterCv.width, _faceFilterCv.height);
                _gl.useProgram(_glShpCopy);
                _gl.activeTexture(_gl.TEXTURE0);
                _gl.bindTexture(_gl.TEXTURE_2D, _glVideoTexture);
                _gl.drawElements(_gl.TRIANGLES, 3, _gl.UNSIGNED_SHORT, 0);
                

                //threejsCanvas.setAttribute('width', _faceFilterCv.width);
                //threejsCanvas.setAttribute('height', _faceFilterCv.height);
                //renderer.setSize( _faceFilterCv.width, _faceFilterCv.height );
                //renderer.setViewport(0,0, _faceFilterCv.width, _faceFilterCv.height);

                //console.log(_faceFilterCv.width, _faceFilterCv.height)
            } else {
                //reinitialize the state of THREE.JS because JEEFACEFILTER have changed stuffs
                // -> can be VERY costly !
                renderer.state.reset();
            }

            //trigger the render of the THREE.JS SCENE
            if( isOnFrame ) renderer.render(scene, camera);
        },

        autoRender: function(  ){
            if( isOnFrame ) return;
            var _this = that;
            requestAnimationFrame(  function(s){ _this.autoRender(s); } );
            renderer.render(scene, camera);

        },

        setOnFrame: function( b ){

            isOnFrame = b;
            if(!isOnFrame) that.autoRender();



        },

        /*sortFaces: function(bufferGeometry, axis, isInv){ //sort faces long an axis
            //useful when a bufferGeometry has alpha : we should render the last faces first
            var axisOffset={X:0, Y:1, Z:2}[axis.toUpperCase()];
            var sortWay=(isInv)?-1:1;

            //fill the faces array
            var nFaces=bufferGeometry.index.count/3;
            var faces=new Array(nFaces);
            for (let i=0; i<nFaces; ++i){
                faces[i]=[bufferGeometry.index.array[3*i], bufferGeometry.index.array[3*i+1], bufferGeometry.index.array[3*i+2]];
            }

            //compute centroids :
            var aPos=bufferGeometry.attributes.position.array;
            var centroids=faces.map(function(face, faceIndex){
                return [
                    (aPos[3*face[0]]+aPos[3*face[1]]+aPos[3*face[2]])/3, //X
                    (aPos[3*face[0]+1]+aPos[3*face[1]+1]+aPos[3*face[2]+1])/3, //Y
                    (aPos[3*face[0]+2]+aPos[3*face[1]+2]+aPos[3*face[2]+2])/3, //Z
                    face
                ];
            });

            //sort centroids
            centroids.sort(function(ca, cb){
                return (ca[axisOffset]-cb[axisOffset])*sortWay;
            });

            //reorder bufferGeometry faces :
            centroids.forEach(function(centroid, centroidIndex){
                var face=centroid[3];
                bufferGeometry.index.array[3*centroidIndex]=face[0];
                bufferGeometry.index.array[3*centroidIndex+1]=face[1];
                bufferGeometry.index.array[3*centroidIndex+2]=face[2];
            });
        }, //end sortFaces*/

        get_threeVideoTexture: function(){
            return _threeVideoTexture;
        },

        apply_videoTexture: function(threeMesh){
            if (_isVideoTextureReady){
                return;
            }
            threeMesh.onAfterRender=function(){
                //replace _threeVideoTexture.__webglTexture by the real video texture
                try {
                    renderer.properties.update(_threeVideoTexture, '__webglTexture', _glVideoTexture);
                    _threeVideoTexture.magFilter=THREE.LinearFilter;
                    _threeVideoTexture.minFilter=THREE.LinearFilter;


                    _isVideoTextureReady=true;
                } catch(e){
                    console.log('WARNING in THREE.JeelizHelper : the glVideoTexture is not fully initialized');
                }
                delete(threeMesh.onAfterRender);
            };
        },

       
    }

    return that;

})();