import { root } from '../root.js'

// CLASS for keyboard and joystick

// key map
// 0 : axe L | left:right  -1>1
// 1 : axe L | top:down    -1>1
// 2 : axe R | left:right  -1>1
// 3 : axe R | top:down    -1>1
// 4 : bouton A             0-1  jump / space
// 5 : bouton B             0-1
// 6 : bouton X             0-1
// 7 : bouton Y             0-1
// 8 : gachette L up        0-1
// 9 : gachette R up        0-1
// 10 : gachette L down     0>1
// 11 : gachette R down     0>1
// 12 : bouton setup        0-1
// 13 : bouton menu         0-1
// 14 : axe button left     0-1
// 15 : axe button right    0-1
// 16 : Xcross axe top      0-1
// 17 : Xcross axe down     0-1
// 18 : Xcross axe left     0-1
// 19 : Xcross axe right    0-1

// 20 : Keyboard or Gamepad    0-1

export class User {

    constructor( dom = window ) {

        this.key = [0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0 ]
        this.pad = new Gamepad( this.key )

        dom.addEventListener( 'keydown', this )
        dom.addEventListener( 'keyup', this )

    }

    handleEvent( e ) {

        e = e || window.event

        switch( e.type ) {
            case 'keydown': this.keydown( e ); break;
            case 'keyup': this.keyup( e ); break;
        }

        //e.preventDefault()

    }

    update() {

        this.pad.update()
        if( this.pad.ready ) this.pad.getValue()

        root.key = this.key

    }

    keydown( e ) {

        switch ( e.which ) {
            // axe
            case 65: case 81: case 37: this.key[0] = -1; break; // left, A, Q
            case 68: case 39:          this.key[0] = 1;  break; // right, D
            case 87: case 90: case 38: this.key[1] = -1; break; // up, W, Z
            case 83: case 40:          this.key[1] = 1;  break; // down, S
            // other
            case 17: case 67: this.key[5] = 1; break; // ctrl, C
            case 69:          this.key[5] = 1; break; // E
            case 32:          this.key[4] = 1; break; // space
            case 16:          this.key[7] = 1; break; // shift
        }

        this.pad.reset();

    }

    keyup( e ) {

        switch( e.which ) {
            // axe
            case 65: case 81: case 37: this.key[0] = this.key[0]<0 ? 0:this.key[0]; break; // left, A, Q
            case 68: case 39:          this.key[0] = this.key[0]>0 ? 0:this.key[0]; break; // right, D
            case 87: case 90: case 38: this.key[1] = this.key[1]<0 ? 0:this.key[1]; break; // up, W, Z
            case 83: case 40:          this.key[1] = this.key[1]>0 ? 0:this.key[1]; break; // down, S
            // other
            case 17: case 67: this.key[5] = 0; break; // ctrl, C
            case 69:          this.key[5] = 0; break; // E
            case 32:          this.key[4] = 0; break; // space
            case 16:          this.key[7] = 0; break; // shift
        }

        
    }

};


//--------------------------------------
//
//   GAMEPAD
//
//--------------------------------------
export class Gamepad {

    constructor( key ) {

        this.values = []; 
        this.key = key;
        this.ready = 0;
        this.current = -1;

    }

    update() {

        this.current = -1;

        var i, j, k, l, v, pad;
        var fix = this.fix;
        var gamepads = navigator.getGamepads();

        for (i = 0; i < gamepads.length; i++) {
            pad = gamepads[i];
            if(pad){
                this.current = i;
                k = pad.axes.length;
                l = pad.buttons.length;
                if(l){
                    if(!this.values[i]) this.values[i] = [];
                    // axe
                    for (j = 0; j < k; j++) {
                        v = fix( pad.axes[j], 0.5, true );
                        if(  this.ready === 0 && v !== 0 ) this.ready = 1;
                        this.values[i][j] = v;
                        //if(i==0) this.key[j] = fix( pad.axes[j], 0.08 );
                    }
                    // button
                    for (j = 0; j < l; j++) {
                        v = fix(pad.buttons[j].value); 
                        if(this.ready === 0 && v !== 0 ) this.ready = 1;
                        this.values[i][k+j] = v;
                        //if(i==0) this.key[k+j] = fix( pad.buttons[j].value );
                    }  
                    //info += 'gamepad '+i+'| ' + this.values[i]+ '<br>';
                } else {
                    if(this.values[i]) this.values[i] = null;
                }
            }
        }

    }

    getValue() {

        var n = this.current;

        if( n < 0 ) return;

        var i = 19, v;
        while(i--){
            v = this.values[n][i];
            if( this.ready === 0 && v !== 0 ) this.ready = 1;
            this.key[i] = v;
        }

    }

    reset() {
        this.ready = 0;
    }

    fix( v, dead, force ) {
        var n = Number((v.toString()).substring(0, 5));
        if(dead && n<dead && n>-dead) n = 0;
        if(force){
            if(n>dead) n = 1
            if(n<-dead) n = -1
        }
        return n;
    }

}