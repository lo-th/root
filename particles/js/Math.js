'use strict';

Math.degtorad = 0.0174532925199432957;
Math.radtodeg = 57.295779513082320876;
Math.Pi = 3.141592653589793;
Math.TwoPI = 6.283185307179586;
Math.PI90 = 1.570796326794896;
Math.PI270 = 4.712388980384689;

Math.int = function(x) { return ~~x; };

// RANDOM FUNCTION

Math.lerp = function (a, b, percent) { return a + (b - a) * percent; };
Math.rand = function (a, b) { return Math.lerp(a, b, Math.random()); };
Math.randInt = function (a, b, n) { return Math.lerp(a, b, Math.random()).toFixed(n || 0)*1; };

// COLOR FUNCTION

Math.colorDistance = function ( a, b ){

    var xd = a[0] - b[0];
    var yd = a[1] - b[1];
    var zd = a[2] - b[2];
    return Math.sqrt(xd*xd + yd*yd + zd*zd);

};

Math.hslToRgb = function (h, s, l){

    var r, g, b;
    h /= 255., s /= 255., l /= 255.;
    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = Math.hue2rgb(p, q, h + 1/3);
        g = Math.hue2rgb(p, q, h);
        b = Math.hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];

};

Math.hue2rgb = function (p, q, t){

    if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1/6) return p + (q - p) * 6 * t;
    if(t < 1/2) return q;
    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;

};

Math.rgbToHsl = function (r, g, b){

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) * 0.5;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.round(h * 255), Math.round(s * 255), Math.round(l * 255)];

};