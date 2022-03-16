import * as UIL from 'uil';
import { root } from '../root.js';

export class Gui {

    constructor() {

        this.fps = document.createElement( 'div' );
        this.fps.style.cssText =  "font-size:24px; font-family:Tahoma; position:absolute; bottom:3px; left:10px; width:100px; color:#fff;  pointer-events:none;"
        document.body.appendChild( this.fps )

        const ui = new UIL.Gui( { w:200, h:20, close:false, bg:'none' } )

        ui.add( 'empty', {h:6})

        ui.add( 'bool', { name:'show envmap', value:false }).onChange( function(b){ view.showBackground(b) } )

        ui.add( view, 'follow', { type:'bool' }).onChange( function(b){ view.setFollow(b) } )
        


        ui.add( root, 'speed', { min:0, max:3, precision:2 })

        ui.add( root.track.upscale, 'x', { min:0, max:20, precision:2 })
        ui.add( root.track.upscale, 'y', { min:0, max:20, precision:2 })

        const g2 = ui.add('group', { name:'CAMERA', h:20 })
        g2.add( root.camera, 'pos', { type:'number', min:-20, max:20, precision:2 })
        g2.add( root.camera, 'target', { type:'number', min:-20, max:20, precision:2 })
        g2.add( root.camera, 'zoom', { min:0.1, max:2, precision:2 }).onChange( function(b){ view.resize()/*root.camera.updateProjectionMatrix()*/ } )
        g2.add( root.camera, 'fov', { min:30, max:120, precision:0 }).onChange( function(b){ view.resize()/*root.camera.updateProjectionMatrix()*/ } )
        g2.add( root, 'tracking', { min:0.25, max:1, precision:2 })

        const g3 = ui.add('group', { name:'TRACK', h:20 })

        g3.add( root.track, 'color', { type:'color' } ).onChange( function( c ){ root.track.setColor( c ); } )

        g3.add( root.track.mat, 'metalness', { min:0, max:1, precision:2 })
        g3.add( root.track.mat, 'roughness', { min:0, max:1, precision:2 })
        g3.add( root.track.mat, 'sheen', { min:0, max:1, precision:2 })


    }
    
}