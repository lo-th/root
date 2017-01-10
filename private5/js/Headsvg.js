
V.Head = function ( type ) {

    this.img = new Image();
    this.img.height = 256;
    this.img.width = 512;
    console.log(this.img)

    this.canvas = document.createElement("canvas");
    this.canvas.width = 512;
    this.canvas.height = 256;

    this.ctx = this.canvas.getContext("2d");

    //this.texture = new THREE.Texture( this.img );
    this.texture = new THREE.Texture( this.canvas );

    this.type = type;

    this.skin = this.type === 'man' ? '#B1774F':'#895837';
    this.skin2 = this.type === 'man' ? '#A36D47':'#70472B';
    this.c_hair = this.type === 'man' ? '#613207':'#3A160A';

    this.hair = "<path id='hair' fill='"+this.c_hair+"' stroke='none' d='M 512 122 L 512 0 0 0 0 122 Q 34.56171875 122.8705078125 71 135 113.206640625 139.20703125 132 120 143.885546875 76.9451171875 183 55 L 329 55 Q 370.0564453125 79.7216796875 380 120 394.8259765625 136.671484375 438 135 480.665234375 122.834765625 512 122 Z'/>";
    if(this.type!=='man') this.hair ="<path id='hair' fill='"+this.c_hair+"' stroke='none' d='M 512 166 L 512 0 0 0 0 170 Q 23.2884765625 183.2939453125 53 192 74.7611328125 200.3693359375 102 206 122.924609375 209.0083984375 120 197 116.5833984375 165.0119140625 120 134 122.9181640625 115.5015625 140 112 168.8966796875 108.988671875 188 97 216.7982421875 82.7875 228 50 244.8962890625 78.833203125 283 100 324.001953125 112.8609375 369 112 393.0203125 111.997265625 390 140 386.901953125 158.942578125 387 181 384.373046875 200.77421875 413 198 462.5 190.35 512 166 Z'/>";



    this.svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='512px' height='256px' viewBox='0 0 512 256'>",
    "<path id='skin' fill='"+this.skin+"' stroke='none' d='M 512 256 L 512 0 0 0 0 256 512 256 Z'/>",
    "<path id='noz' stroke='"+this.skin2+"' stroke-width='8' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 256 92 L 256 162'/>",

    "<ellipse cx='222' cy='128' rx='14' ry='14' style='fill:white;stroke:"+this.skin2+";stroke-width:4' />",
    "<ellipse cx='290' cy='128' rx='14' ry='14' style='fill:white;stroke:"+this.skin2+";stroke-width:4' />",
    "<ellipse cx='222' cy='128' rx='4' ry='4' style='fill:black;' />",
    "<ellipse cx='290' cy='128' rx='4' ry='4' style='fill:black;' />",
    "<ellipse cx='256' cy='190' rx='14' ry='10' style='fill:black;stroke:"+this.skin2+";stroke-width:4' />",
    "<path id='eyebrow' stroke='"+this.c_hair+"' stroke-width='8' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 283 87 L 301 87 M 211 87 L 229 87'/>",

    this.hair,
    "</svg>",
    ];

    this.blob = new Blob([this.svg.join( "\n" )], {type: "image/svg+xml;charset=utf-8"});
    this.URLS = self.URL || self.webkitURL || self;

    this.update();


}

V.Head.prototype = {
    updateX: function(){
        //var img = new Image();
        var DOMURL = self.URL || self.webkitURL || self;
        var s = new Blob([this.svg.join( "\n" )], {type: "image/svg+xml;charset=utf-8"});
        var url = DOMURL.createObjectURL(s);
        this.img.onload = function() {
            //this.ctx.drawImage(this.img, 0, 0);
            
            //
            //this.texture = this.texture.clone()
            this.texture.image = this.img;
            //this.texture.needsUpdate = true;
            //mat.map = this.texture
            DOMURL.revokeObjectURL(url);
        }.bind(this);
        this.img.src = url;


        //canvg( this.canvas, this.svg.join( "\n" ) );
        ///this.texture.needsUpdate = true;

    },

    update: function(x,y){

        this.svg[5] = "<ellipse cx='"+(222+(x*8))+"' cy='"+(128+(y*8))+"' rx='4' ry='4' style='fill:black;' />";
        this.svg[6] = "<ellipse cx='"+(290+(x*8))+"' cy='"+(128+(y*8))+"' rx='4' ry='4' style='fill:black;' />";
        //this.img = new Image();
        
        //var s = new Blob([this.svg.join( "\n" )], {type: "image/svg+xml;charset=utf-8"});
        var s = new Blob(this.svg, {type: "image/svg+xml;charset=utf-8"});
        var url = this.URLS.createObjectURL(s);
        this.img.onload = function() {

            this.ctx.drawImage(this.img, 0, 0, 512, 256 );
            this.texture.needsUpdate = true;
            this.URLS.revokeObjectURL( url );
            
        }.bind(this);
        this.img.src = url;


        //canvg( this.canvas, this.svg.join( "\n" ) );
        ///this.texture.needsUpdate = true;

    }
}