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

        this.testLine()

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

}