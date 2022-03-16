import { NEO } from '../neo/Neo.js';


export class Timeline {

    constructor() {

        this.neo = new NEO.Timeline({ bottom:125, zone:100, maxframe: 100, top:50, right:210, open:false }).onChange( this.loop.bind(this) )

        this.neo.add('bang', { name:'Diamond Left', h:40, resize:false, del:false, frame:{ 20:1, 40:1 } })
        this.neo.add('bang', { name:'Diamond Center', h:40, resize:false, del:false, frame:{ 20:1, 40:1 } })
        this.neo.add('bang', { name:'Diamond Right', h:40, resize:false, del:false, frame:{ 20:1, 40:1 } })


        this.neo.add('curve',  { name:'track_X',
            frame : {
                x:{ 20:[100,'quint-in-out'], 40:[100,'quint-in-out'], 60:[-80,'quint-in-out'], 120:[70,'elastic-in-out'], 300:[-70,'bounce-in-out'], 400:[0,'expo-in-out'], 700:[ -100,'expo-in-out'] },
                //y:{ 20:[10,'quint-in-out'], 99:[100,'quint-in-out'] },
                //z:{ 20:[-10,'quint-in-out'], 99:[-100,'quint-in-out'] },
                range:[-120, 120]
            }
        })


        this.neo.setFps(1)

    }

    loop(){

    }

}