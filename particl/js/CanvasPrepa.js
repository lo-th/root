'use strict';

var canvasPrepa = ( function () {

    var canvas, context, w, h, mw, mh, font, style, fontSize, max;
    var randomDistance = 20;

    canvasPrepa = function () {};

    //---------------------------------------------
    // initialise le texte avec la font le style et la taille 
    //---------------------------------------------

    canvasPrepa.init = function ( W, H, Max ) {

        max = Max || 512; 

        w = W || 512;
        h = H || 256;
        mw = w * 0.5;
        mh = h * 0.5;

        canvas = document.createElement( 'canvas' );
        canvas.width = w;
        canvas.height = h;
        context = canvas.getContext( '2d' );

    };

    canvasPrepa.setRandomDistance = function ( v ) {

        randomDistance = v*0.5;

    };

    canvasPrepa.makeImage = function (  image, Max ) {

        max = Max || 512; 

        var nw, nh;
        var iw = image.width;
        var ih = image.height;

        if(iw > ih){
            w = max;
            h = ~~ (ih * (w/iw));
        } else {
            h = max;
            w = ~~ (iw * (h/ih));
        }

        canvas.width = w;
        canvas.height = h;

        mw = w * 0.5;
        mh = h * 0.5;

        //console.log(w,h)

        context.clearRect(0, 0, w, h);
        context.drawImage( image, 0, 0, w, h );

        var imageData = context.getImageData(0, 0, w, h);

        //document.body.appendChild(canvas)
        //canvas.style.position = 'absolute'

        return this.sendData( imageData );

    };

    canvasPrepa.sendData = function ( imageData ){

        var d = imageData.data;
        var ll = 1/w;

        // random modificator
        var ra = randomDistance;

        var data = [];
        var n, px, py, color, hsl;
        var r, g, b;

        // iterate over all pixels
        var i = ~~ d.length/4;
        while(i--){
            n = i * 4;
            py = Math.floor( i * ll );
            px = i - ( py * w );

            r = d[n + 0] + Math.randInt(-ra, ra);
            g = d[n + 1] + Math.randInt(-ra, ra);
            b = d[n + 2] + Math.randInt(-ra, ra);

            r = r < 0 ? 0 : r;
            g = g < 0 ? 0 : g;
            b = b < 0 ? 0 : b;

            r = r > 255 ? 255 : r;
            g = g > 255 ? 255 : g;
            b = b > 255 ? 255 : b;

            hsl = Math.rgbToHsl( r, g, b );

            color = [ hsl[0], hsl[1], hsl[2], d[n + 3] ];
            

            if( color[3] > 0 ) data.push( px - mw, -py + mh, color );

        }

        return data;

    };


    //---------------------------------------------
    // crée un canvas avec le texte et recherche les points non transparent
    //---------------------------------------------

    canvasPrepa.initFont = function (  Font, Style, FontSize ){

        font = Font;
        style = Style;
        fontSize = FontSize;

    };

    canvasPrepa.makeText = function ( string, FontSize , W, H ) {

        var change = false;
        if( FontSize && Fontsize!==fontsize ) fontsize = FontSize;
        if( W && W!==w ){ w = W; mw = w * 0.5; change = true; }
        if( H && H!==h ){ h = H; mh = h * 0.5; change = true; }

        if( change ){
            canvas.width = w;
            canvas.height = h;
        }

        context.clearRect(0, 0, w, h);

        var color = 'red';

        context.font = style + ' ' + fontSize + 'px ' + font;
        context.fillStyle = color;
        context.textBaseline = 'top';
        context.textAlign = "center";

        this.wrapText( string, mw, w, mh, fontSize );

        // prend les données des pixels du canvas

        var imageData = context.getImageData(0, 0, w, h);

        return this.sendData( imageData );

    };

    //---------------------------------------------
    // pour le changement de ligne du texte
    //---------------------------------------------

    canvasPrepa.wrapText = function( text, x, maxWidth, middle, lineHeight ) {

        var lines = text.split("\n");
        var y = middle-((lines.length*lineHeight))*0.5;

        for (var i = 0; i < lines.length; i++) {

            var words = lines[i].split(' ');
            var line = '';

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + ' ';
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    context.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            };

            context.fillText(line, x, y);
            y += lineHeight;
        }

    };

    return canvasPrepa;

})();