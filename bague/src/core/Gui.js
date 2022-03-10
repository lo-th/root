import * as UIL from 'uil';
import { root } from '../root.js';

export class Gui {

    constructor() {

        this.fps = document.createElement( 'div' );
        this.fps.style.cssText =  "font-size:24px; font-family:Tahoma; position:absolute; bottom:3px; left:10px; width:100px; color:#fff;  pointer-events:none;"
        document.body.appendChild( this.fps )

        const ui = new UIL.Gui( { w:240, h:20, close:false, bg:'none' } )

        ui.add( 'empty', {h:6})

        ui.add( 'bool', { name:'show envmap', value:false, h:20 }).onChange( function(b){ view.showBackground(b) } )

        ui.add( view, 'follow', { type:'bool', h:20 }).onChange( function(b){ view.setFollow(b) } )
        ui.add( root, 'tracking', { min:0.25, max:1, precision:2, h:25 })

        ui.add( 'empty', {h:6})

        ui.add( root, 'speed', { min:0, max:3, precision:2, h:25 })

        ui.add( 'empty', {h:6})

        ui.add( root.track.upscale, 'x', { min:0, max:20, precision:1, h:25 })
        ui.add( root.track.upscale, 'y', { min:0, max:20, precision:1, h:25 })



        //ui.add( root.track.upscale, 'n', { min:0, max:0.2, precision:2, h:25 })

        /*
        //ui.add('button', { name:'Generate', p:0, h:30 }).onChange( function(){ view.generate() } )

        ui.add('button', { name:'WAKE UP !', onName:'GO SLEEP !', p:0, h:50 }).onChange( function(){ view.wakeUp() } )

        ui.add('button', { name:'Active Ray', onName:'Stop Ray', p:0, h:30 }).onChange( function(){ view.activeMouse() } )

        //ui.add('button', { name:'Add Birds', onName:'remove Birds', p:0, h:30 }).onChange( function(){ view.addBird() } )

        //ui.add( root, 'debug', { type:'bool', h:20 }).onChange( function(b){ view.switchDebug(b) } )
        


        const g = ui.add('group', { name:'CROCO', h:30, open:true })

        // croco
        g.add( root.option, 'size', { min:0, max:4, precision:2, h:25 }).onChange( function(){ view.setCrocoSize() } )
        g.add( root.option, 'speed_walk', { min:0, max:30, precision:1, h:25 })
        g.add( root.option, 'speed_swim', { min:0, max:30, precision:1, h:25 })
        g.add( root.option, 'speed_run', { min:0, max:30, precision:1, h:25 })

        g.add( 'title',  { name:'Time in second', h:22, align:'center' })
        g.add( root.option, 'rot_start', { type:'Number', min:0, max:200, precision:1, h:25 })
        g.add( root.option, 'rot_time', { type:'Number', min:0, max:200, precision:1, h:25 })

        g.add( root.option, 'sleep_start', { type:'Number', min:0, max:200, precision:1, h:25 })
        g.add( root.option, 'sleep_time', { type:'Number', min:0, max:200, precision:1, h:25 })


        const g0 = ui.add('group', { name:'COLOR', h:30, open:true })
        g0.add( root.colors, 'exposure', { min:0, max:3, h:20 }).onChange( function(v){ root.renderer.toneMappingExposure = v } )
        g0.add( 'empty', {h:6})
        g0.add( root.colors, 'intensity', { min:0, max:3, h:20 }).onChange( function(v){ root.light.intensity = v } )
        g0.add( root.colors, 'sun', { type:'color', h:20 }).onChange( function(c){root.light.color.setHex(c)} )
        g0.add( 'empty', {h:6})
        g0.add( root.colors, 'hemi', { min:0, max:3, h:20 }).onChange( function(v){ root.hemiLight.intensity = v } )
        g0.add( root.colors, 'sky', { type:'color',  h:20 }).onChange( function(c){ root.hemiLight.color.setHex(c)} )
        g0.add( root.colors, 'ground', { type:'color',  h:20 }).onChange( function(c){ root.hemiLight.groundColor.setHex(c)} )
        g0.add( 'empty', {h:6})
        g0.add( root.colors, 'water', { type:'color', h:20 }).onChange( function(c){root.water.setColor(c)} )
        g0.add( root.colors, 'foam', { type:'color', h:20 }).onChange( function(c){root.water.setFoamColor(c)} )
        g0.add( root.colors, 'alpha', { min:0, max:1, h:20 }).onChange( function(c){root.water.setTransparency(c)} )
        g0.add( root.colors, 'threshold', { min:0, max:1, h:20, precision:3 }).onChange( function(c){root.water.setThreshold()} )
        g0.add( root.colors, 'scaler', { min:0, max:50, h:20, precision:0 }).onChange( function(c){root.water.setScaler()} )

        this.ui = ui


        
*/
    }
/*
    addBirdOption(){

        const g1 = this.ui.add('group', { name:'BIRD', h:30 })

        g1.add( root.bird.option, 'separation', { min:0, max:1, precision:2 }).onChange( function(v){ root.bird.change() } )
        g1.add( root.bird.option, 'alignment', { min:0, max:1, precision:2 }).onChange( function(v){ root.bird.change() } )
        g1.add( root.bird.option, 'zoneRadius', { min:0, max:150, precision:0 }).onChange( function(v){ root.bird.change() } )
        g1.add( root.bird.option, 'preyRadius', { min:0, max:150 }).onChange( function(v){ root.bird.change() } )
        g1.add( root.bird.option, 'count', { min:0, max:256, precision:0  }).onChange( function(v){ root.bird.change() } )

    }*/
    
}