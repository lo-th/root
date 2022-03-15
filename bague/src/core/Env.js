import * as THREE from 'three';
import { root } from '../root.js';
import { math } from './math.js';


export class Env {

    constructor() {

        this.useParticle = true


        this.display = false

        this.w = 256;
        this.h = 128;

        this.n = 0
        this.nup = 6

        this.debug = false

        const canvas = document.createElement( 'canvas' )
        canvas.width = this.w
        canvas.height = this.h
        canvas.style.cssText = 'position:absolute; margin:0; padding:0; top:10px; left:10px;'

        const ctx = canvas.getContext( '2d' )
        this.canvas = canvas
        this.ctx = ctx

        //this.ctx.globalCompositeOperation = 'saturation'
        //this.ctx.globalCompositeOperation = 'lighter'
        //this.ctx.globalCompositeOperation = 'source-over'
        
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

        var sun = this.ctx.createRadialGradient(45, 20, 1, 45, 20, 45);
        //var sun = this.ctx.createRadialGradient(0, 0, 10, 0, 0, 45);
        sun.addColorStop( 0,  'rgba(255,255,255,1)' );
        sun.addColorStop( 0.25,  'rgba(255,255,255,0.4)' );
        sun.addColorStop( 1,  'rgba(255,255,255,0)' );

        var sun2 = this.ctx.createRadialGradient(110, 50, 1, 110, 50, 60);
        //var sun = this.ctx.createRadialGradient(0, 0, 10, 0, 0, 45);
        sun2.addColorStop( 0,  'rgba(255,255,255,0.4)' );
        sun2.addColorStop( 0.25,  'rgba(255,255,255,0.1)' );
        sun2.addColorStop( 1,  'rgba(255,255,255,0)' );

        var halo = this.ctx.createLinearGradient(0,0,0,this.h);
        halo.addColorStop( 0,  'rgba(255,255,255,0.4)' );
        halo.addColorStop( 0.2,  'rgba(255,255,255,0)' );
        halo.addColorStop( 0.49,  'rgba(170,84,53,0)' );
        halo.addColorStop( 0.5,  'rgba(170,84,53,0.1)' );
        halo.addColorStop( 1,  'rgba(150,64,33,0.75)' );
//{r:170,g:84,b:53},// blue clair 1 inverse
        this.sun = sun
        this.sun2 = sun2
        this.halo = halo

        //console.log(this.colorStops)

        this.texture = new THREE.CanvasTexture( canvas )
        this.texture.mapping = THREE.EquirectangularReflectionMapping
        this.texture.encoding = THREE.sRGBEncoding
        //this.texture.wrapS = THREE.RepeatWrapping
        //this.texture.offset.x = 0.5


        this.pmrem = new THREE.PMREMGenerator( root.renderer )
        this.pmrem.compileEquirectangularShader()


        //root.scene.background = this.texture
        //root.scene.environment = this.texture

        this.pixelRatio = 1
        this.totalParticles = 4
        this.particles = []
        this.maxRadius = 90
        this.minRadius = 40

        if( this.useParticle ) this.createParticles()

         

        this.move()




        //this.move()

    }

    createParticles(){

        let curColor = 0, r
        this.particles = []

        for(let i = 0; i < this.totalParticles; i++ ){
            r = Math.random() * (this.maxRadius-this.minRadius) + this.minRadius
            const item = new GlowParticle( this.w, this.h, r, COLORS[curColor] )

            if(++curColor >= COLORS.length) curColor = 0
            this.particles[i] = item
        }

    }

    animate(){



        this.ctx.clearRect(0,0,this.w,this.h);

        //this.ctx.globalCompositeOperation = 'source-over'

        
        //this.ctx.save();

        this.ctx.globalCompositeOperation = 'saturation'

        for(let i = 0; i < this.totalParticles; i++ ){
            const item = this.particles[i]
            item.animate( this.ctx )
            
        }



        this.ctx.globalCompositeOperation = 'destination-over'

        this.ctx.fillStyle = '#9ad7f6'//333333';
        this.ctx.fillRect(0,0,this.w,this.h);

        /**/
        this.ctx.globalCompositeOperation = 'source-over'

        this.ctx.fillStyle = this.halo;
        this.ctx.fillRect(0,0,this.w,this.h);

        this.ctx.globalCompositeOperation = 'lighter'
        //this.ctx.globalCompositeOperation = 'source-over'



        this.ctx.fillStyle = this.sun;
        this.ctx.fillRect(0,0,this.w,this.h);

        //this.ctx.fillStyle = this.sun2;
        //this.ctx.fillRect(0,0,this.w,this.h);
        //this.ctx.globalCompositeOperation = 'destination-over'

        //this.ctx.restore();

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

        var gradient = this.ctx.createLinearGradient(0,0,0,this.h);//this.ctx.createLinearGradient(0,this.w,this.h,0);

        for(var i = 0; i < this.colorStops.length; i++){
            var stop = this.colorStops[i]
            gradient.addColorStop( stop.pos, stop.currColor );
        }

        this.ctx.globalCompositeOperation = 'saturation'

        this.ctx.clearRect(0,0,this.w,this.h);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0,0,this.w,this.h);

        this.ctx.fillStyle = this.halo;
        this.ctx.fillRect(0,0,this.w,this.h);

        this.ctx.globalCompositeOperation = 'lighter'

        this.ctx.fillStyle = this.sun;
        this.ctx.fillRect(0,0,this.w,this.h);

    }

    lerp(a, b, u) {
        return (1 - u) * a + u * b;
    }

    move(){

        if( this.n === 0 ){

            if(this.useParticle){
                this.animate()
            } else {
                this.updateStops();
                this.draw();
            }

            
            this.texture.needsUpdate = true;

            const env = this.pmrem.fromEquirectangular( this.texture ).texture

            root.scene.background = env
            root.scene.environment = env

            if(root.scene.fog){ 
                //let c = this.ctx.getImageData((this.w*0.25)*3, this.h*0.5, 1, 1).data;
                let c = this.ctx.getImageData(192, this.h*0.5, 1, 1).data;
                root.scene.fog.color.setRGB( c[0]*math.cc, c[1]*math.cc, c[2]*math.cc )//.convertSRGBToLinear()
            }

            //this.n = 0
        }

        this.n++
        if(this.n === this.nup) this.n = 0

        /*root.scene.needsUpdate = true;*/


    }

}

const COLORS = [
    //{r:154,g:215,b:246},// blue base

    {r:85,g:171,b:202},// blue clair 1
    {r:62,g:175,b:228},// blue clair 2
    {r:0,g:69,b:100},// blue clair 3
    {r:0,g:40,b:60},

    //{r:170,g:84,b:53},// blue clair 1 inverse

    {r:251,g:234,b:31},// yellow
    

    /*
    {r:35,g:81,b:119},// blue moyen 1
    {r:28,g:102,b:127},// blue moyen 2

    {r:49,g:71,b:151},// blue sombre 1
    {r:23,g:46,b:75},// blue sombre 2
    */
   
]

/*const COLORS = [
    //{r:210,g:210,b:200},// whith
    {r:45,g:74,b:277},// blue
    {r:250,g:255,b:89},// yellow
    {r:255,g:104,b:248},// purpple
    {r:44,g:209,b:256},// skyBlue
    {r:54,g:233,b:84},// green
]*/

export class GlowParticle{
    constructor( w, h, radius, rgb ){

        this.decal = 2 // 10 
        this.w = w
        this.h = h

        this.x = Math.random() * this.w
        this.y = Math.random() * this.h
        this.radius = radius
        this.rgb = rgb

        this.vx = Math.random() * 0.01//4 
        this.vy = Math.random() * 0.01//4

        this.sinValue = Math.random()

    }

    animate( ctx ){

        this.sinValue += 0.01
        this.radius += Math.sin( this.sinValue )
        this.x += this.vx
        this.y += this.vy

        if(this.x<0){
            this.vx *= -1
            this.x += this.decal
        } else if (this.x>this.w){
            this.vx *= -1
            this.x -= this.decal
        }

        if(this.y<0){
            this.vy *= -1
            this.y += this.decal
        } else if (this.y>this.h){
            this.vy *= -1
            this.y -= this.decal
        }

        ctx.beginPath()
        const g = ctx.createRadialGradient(this.x, this.y, this.radius*0.01, this.x, this.y, this.radius )
        g.addColorStop( 0, 'rgba('+this.rgb.r+','+this.rgb.g+','+this.rgb.b+', 1)' );
        g.addColorStop( 1, 'rgba('+this.rgb.r+','+this.rgb.g+','+this.rgb.b+', 0)' );
        ctx.fillStyle = g
        ctx.arc(this.x, this.y, this.radius, 0, math.TwoPI, false )
        ctx.fill()

    }
}