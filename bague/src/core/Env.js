import * as THREE from 'three';
import { root } from '../root.js';
import { math } from './math.js';


export class Env {

    constructor() {

        this.display = false

        this.n = 0
        this.nup = 10

        this.debug = false

        const canvas = document.createElement( 'canvas' )
        canvas.width = 256
        canvas.height = 128
        canvas.style.cssText = 'position:absolute; margin:0; padding:0; top:10px; left:10px;'

        const ctx = canvas.getContext( '2d' )
        this.canvas = canvas
        this.ctx = ctx


        this.width = 256;
        this.height = 128;
        this.colorStops = [];
        this.currentStop = 0;

        this.Anim = { //animation settings
            'duration': 3000,
            'interval' : 10,
            'stepUnit' : 1.0,
            'currUnit' : 0.0
        }

        const stopAColor = [
            { 'r':'9', 'g':'117', 'b':'190' }, //blue
            { 'r':'59', 'g':'160', 'b':'89' }, //green
            { 'r':'230', 'g':'192', 'b':'39' }, //yellow
            { 'r':'238', 'g':'30', 'b':'77' } //red
        ]
        const stopBColor = [
            { 'r':'205', 'g':'24', 'b':'75' }, //pink
            { 'r':'33', 'g':'98', 'b':'155' }, //blue
            { 'r':'64', 'g':'149', 'b':'69' }, //green
            { 'r':'228', 'g':'171', 'b':'33' } //yellow
        ];

        this.addStop( 0, stopAColor )
        this.addStop( 1, stopBColor )

        var sun = this.ctx.createRadialGradient(45, 20, 10, 45, 20, 45);
        sun.addColorStop( 0,  'rgba(255,255,255,1)' );
        sun.addColorStop( 1,  'rgba(255,255,255,0)' );

        var halo = this.ctx.createLinearGradient(0,0,0,this.height);
        halo.addColorStop( 0,  'rgba(255,255,255,0.4)' );
        halo.addColorStop( 0.2,  'rgba(255,255,255,0)' );
        halo.addColorStop( 0.8,  'rgba(0,0,0,0)' );
        halo.addColorStop( 1,  'rgba(0,0,0,0.3)' );

        this.sun = sun
        this.halo = halo

        //console.log(this.colorStops)

        this.texture = new THREE.CanvasTexture( canvas )
        this.texture.mapping = THREE.EquirectangularReflectionMapping;
        this.texture.encoding = THREE.sRGBEncoding;


        this.pmrem = new THREE.PMREMGenerator( root.renderer );
        this.pmrem.compileEquirectangularShader();


        //root.scene.background = this.texture
        //root.scene.environment = this.texture



        this.move()

        

    }

    addPreview(b){
        if(b){ 
            document.body.appendChild( this.canvas )
            this.display = true
        } else {
            if(this.display){
                document.body.removeChild( this.canvas )
                this.display = false
            }
        } 
    }

    addStop( pos, colors ){

        var stop = {'pos': pos, 'colors':colors, 'currColor': null}
        this.colorStops.push( stop )

    }

    updateStops = function(){ //interpolate colors of stops

        const Anim = this.Anim

        var steps = Anim.duration / Anim.interval,
                step_u = Anim.stepUnit/steps,
                stopsLength = this.colorStops[0].colors.length - 1;

        for(var i = 0; i < this.colorStops.length; i++){ //cycle through all stops in gradient
            var stop = this.colorStops[i], startColor = stop.colors[this.currentStop],//get stop 1 color
                    endColor, r, g, b;

                    if(this.currentStop < stopsLength){ //get stop 2 color, go to first if at last stop
                        endColor = stop.colors[this.currentStop + 1];
                    } else {
                        endColor = stop.colors[0];
                    }
            
            //interpolate both stop 1&2 colors to get new color based on animaiton unit
            r = Math.floor(this.lerp(startColor.r, endColor.r, Anim.currUnit));
            g = Math.floor(this.lerp(startColor.g, endColor.g, Anim.currUnit));
            b = Math.floor(this.lerp(startColor.b, endColor.b, Anim.currUnit));

            stop.currColor = 'rgb('+r+','+g+','+b+')';
        }

        // update current stop and animation units if interpolaiton is complete
        if (Anim.currUnit >= 1.0){
            Anim.currUnit = 0;
            if(this.currentStop < stopsLength){
                this.currentStop++;
            } else {
                this.currentStop = 0;
            }
        }

        Anim.currUnit += step_u; //increment animation unit

    }

    draw(){

        var gradient = this.ctx.createLinearGradient(0,0,0,this.height);//this.ctx.createLinearGradient(0,this.width,this.height,0);



        for(var i = 0; i < this.colorStops.length; i++){
            var stop = this.colorStops[i]
            gradient.addColorStop( stop.pos, stop.currColor );
        }

        this.ctx.clearRect(0,0,this.width,this.height);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0,0,this.width,this.height);

        this.ctx.fillStyle = this.sun;
        this.ctx.fillRect(0,0,this.width,this.height);

        this.ctx.fillStyle = this.halo;
        this.ctx.fillRect(0,0,this.width,this.height);

    }

    lerp(a, b, u) {
        return (1 - u) * a + u * b;
    }

    move(){

        
        if( this.n === 0 ){

            this.updateStops();
            this.draw();

            

            this.texture.needsUpdate = true;

            const env = this.pmrem.fromEquirectangular( this.texture ).texture

            root.scene.background = env
            root.scene.environment = env

            if(root.scene.fog){ 
                let c = this.ctx.getImageData((this.width*0.25)*3, this.height*0.5, 1, 1).data;
                root.scene.fog.color.setRGB( c[0]*math.cc, c[1]*math.cc, c[2]*math.cc )//.convertSRGBToLinear()
            }

            //this.n = 0
        }

        this.n++
        if(this.n === this.nup) this.n = 0

        /*root.scene.needsUpdate = true;*/



    }

}

