
var M = {

	torad: 0.0174532925199432957,
	todeg: 57.295779513082320876,
	Pi: 3.141592653589793,
	TwoPI: 6.283185307179586,
	PI90: 1.570796326794896,
	PI45: 0.7853981633973,
	PI270: 4.712388980384689,
	inv255: 0.003921569,
    gold: 10.166407384630519,

    g: function (e, t) {
        return (e % t + t) % t
    },

    e: function (e, t, n, r, s) {
        return r + (e - t) / (n - t) * (s - r)
    },

    //

    c: function (e, t, n) {
        return Math.min(Math.max(e, t), n)
    },

    clamp: function ( v, max, min ) {
	    v = v < min ? min : v;
	    v = v > max ? max : v;
	    return v;
	},

	//

    d: function (e, t, n, r) {
        return void 0 !== r ? e * (1 - n) + t * i(n * r / 16.66, 0, 1) : e * (1 - n) + t * n
    },

    a: function (e, t, n, r) {
        return Math.atan2(r - t, n - e)
    },

    h: function (e, t) {
        return [e * Math.cos(t), e * Math.sin(t)]
    },

    lng: function ( ar ) { // b
        /*void 0 === e && (e = []);
        for (var t = 0, n = e.length, r = 0; r < n; r++) t += e[r];
        return t / n*/
        ar = ar || [];
        var t = 0, n = ar.length;
        var i = n;
        while(i--) t += ar[i];
        return t / n;
    },

    f: function (e) {
        void 0 === e && (e = []);
        var t = e.slice(0).sort(function(e, t) {
                return e - t
            }),
            n = Math.floor(t.length / 2);
        return t.length % 2 == 0 ? (t[n] + t[n - 1]) / 2 : t[n]
    },

    fix: function ( v, n ){

        n = n !== undefined ? n : 3;
        return v.toFixed(n) * 1;

    },

    int: function(x) { 

    	return Math.floor(x); 

    },

    rand: function ( low, high ) { 

    	return low + Math.random() * ( high - low ); 

    },

    randInt: function ( low, high ) { 
    	
    	return low + Math.floor( Math.random() * ( high - low + 1 ) ); 

    },

    dist: function( a, b ){
        //return Math.sqrt( Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) );
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return Math.sqrt( dx * dx + dy * dy );

    },

    lerp: function ( x, y, t ) { 

    	return ( 1 - t ) * x + t * y; 

    },



}