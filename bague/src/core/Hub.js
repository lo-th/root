import * as THREE from 'three';
import { root } from '../root.js';
import { math } from './math.js';


export class Hub {

    constructor() {

        this.content = document.createElement( 'div' );
        this.content.style.cssText =  "font-size:30px; font-family:Tahoma; position:absolute; top:0px; left:0px; width:100%; height:100%; color:#fff; pointer-events:none;"
        document.body.appendChild( this.content )

        this.scrore = document.createElement( 'div' );
        this.scrore.style.cssText =  "position:absolute; top:12px; left:60px; width:100px; color:#fff;  pointer-events:none;"
        this.content.appendChild( this.scrore )

        this.scrore.innerHTML = root.scrore

        let img = new Image()
        img.src = './assets/textures/diam.svg'


        var svgdiv = document.createElement('div');
        svgdiv.style.cssText =  "position:absolute; top:10px; left:10px; width:40px; height:40px;  pointer-events:none;"
        /*var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('height', heightVar);
        svg.setAttribute('width', widthVar);
        //Add all your elements to the SVG*/
        svgdiv.appendChild(img)

        this.content.appendChild( svgdiv )

        //this.testLine()
        this.init3dHub()

    }



    testLine(){

        let c = 'rgba(255,255,255,0.1)'
        let g = 100 / 3//math.golden
        let line = document.createElement( 'div' );
        line.style.cssText =  'position:absolute; top:'+g+'%; left:0px; width:100%; height:1px; background:'+c+'; pointer-events:none;'
        this.content.appendChild( line )

        let line2 = document.createElement( 'div' );
        line2.style.cssText =  'position:absolute; top:'+(100-g)+'%; left:0px; width:100%; height:1px; background:'+c+'; pointer-events:none;'
        this.content.appendChild( line2 )


        let line3 = document.createElement( 'div' );
        line3.style.cssText =  'position:absolute; left:'+g+'%; top:0px; height:100%; width:1px; background:'+c+'; pointer-events:none;'
        this.content.appendChild( line3 )

        let line4 = document.createElement( 'div' );
        line4.style.cssText =  'position:absolute; left:'+(100-g)+'%; top:0px; height:100%; width:1px; background:'+c+'; pointer-events:none;'
        this.content.appendChild( line4 )

    }

    init3dHub() {

        //camera = root.view.getCamera();

        //var s = root.view.getSizer()

        this.panelMat = new THREE.ShaderMaterial( {

            uniforms: {

                renderMode:{ value: 0 },
                ratio: { value: 1 },//s.w/s.h
                radius: { value: 2 },
                step: { value: new THREE.Vector4(0.6, 0.7, 1.25, 1.5 ) },

            },

            vertexShader:`
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `,
            fragmentShader:`

            uniform int renderMode;

            uniform float ratio;
            uniform float radius;
            uniform vec4 step;
            varying vec2 vUv;
            void main() {
                vec2 c = vec2(0.5, 0.5);
                vec2 pos = (vUv - 0.5) * vec2(ratio, 1) + 0.5;
      
                float dist = length( pos - c ) * radius;

                vec4 cOne = vec4(0.0, 0.0, 0.0, 0.0);
                vec4 cTwo = vec4(0.0, 0.0, 0.0, 0.0);
                vec4 cTree = vec4(0.0, 0.0, 0.0, 0.25);
                vec4 cFour = vec4(0.0, 0.0, 0.0, 0.95);

                vec4 color = mix( cOne, cTwo, smoothstep( step.x, step.y, dist ));
                color = mix( color, cTree, smoothstep(step.y, step.z, dist ));
                color = mix( color, cFour, smoothstep(step.z, step.w, dist ));

                if( renderMode == 0 ) gl_FragColor = color;
                else discard;

            }
            `, 
            transparent:true,
            depthWrite:false,
            depthTest:false,
            toneMapped: false,

        });

        this.panel = new THREE.Mesh( new THREE.PlaneGeometry(1,1, 2,2), this.panelMat  );
        this.panel.frustumCulled = false;
        //panel = new THREE.Mesh( new THREE.SphereBufferGeometry(1) );
        //panel.position.z = -0.1
        root.view.camera.add( this.panel )

        this.panel.renderOrder = 1000000;

        

        this.isPanel3D = true

        //this.update()

        this.resize()

    }

    resize(){

        if(!this.isPanel3D) return

        const s = root.view.size
        const fov = root.camera.fov
        const z = root.camera.zoom


        //var d = 0.0001
        let d = 0.001
        let v = fov * math.torad; // convert to radians
        let r = (s.h / ( 2 * Math.tan( v * 0.5 ) ));
        let e = 1//3/5; // ???

        this.panel.scale.set( s.w, s.h, 0 ).multiplyScalar(d);
        //panel.scale.set( 50, 50, 0 ).multiplyScalar(0.0001);
        //panel.scale.z = 1;
        this.panel.position.z = -r*d*z;

        /*old.f = fov;
        old.z = z;
        old.w = s.w;
        old.h = s.h;
        old.ratio = s.w / s.h;*/

    }

    /*update ( Size, type ) {

        

        if( Size ) size = Size;
        let s = size;



        type = type || '';

        //let s = root.view.getSizer();
        let fov = camera.fov;
        let z = camera.zoom;
        let d = 0, r = 1;

        

        if( s.w !== old.w || s.h !== old.h || fov !== old.f || z !== old.z ){ 

            this.resize( s, fov, z );

            if(!isPanel3D) return

            if( isSnipper && type === 'fps' ){

                r = (z-1.2)/12.8;

                panelMat.uniforms.ratio.value = math.lerp( 1, old.ratio, r ); 
                panelMat.uniforms.radius.value = math.lerp( 2, 3, r );

            } else {
                d = type === 'tps' ? z - 0.6 : z-1.2;
                d*=0.25;
                panelMat.uniforms.step.value.x = 0.6 - d;
                panelMat.uniforms.step.value.y = 0.7 - d;
                panelMat.uniforms.step.value.z = 1.25 - d*0.5;
            }

            
            //panelMat.uniforms.step.value.w = 1.5 - d 

        }

    }*/

}