var intro = ( function () {

    intro = function () {};

    var content;
    var txt;

    intro.init = function () {

        content = document.createElement( 'img' );
        content.style.cssText = "position:absolute; margin:0; padding:0; top:50%; left:50%; width:300px; height:220px; margin-left:-150px; margin-top:-110px; display:block; pointer-events:none; ";
        content.src = 'assets/textures/logo.png';
        document.body.appendChild( content );

        txt = document.createElement( 'div' );
        txt.style.cssText = "text-align:center; position:absolute; margin:0; padding:0; top:50%; left:50%; width:300px; height:20px; margin-left:-150px; margin-top:110px; display:block; pointer-events:none; font-size: 12px;";
        txt.innerHTML = 'OimoPhysics: Saharan | Lab: 3th';
        document.body.appendChild( txt );

    };

    intro.opacity = function ( a ) {

        content.style.opacity = a;
        txt.style.opacity = a;

    }

    intro.clear = function () {

        new TWEEN.Tween( {a:1} ).to( {a:0}, 2000 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .onUpdate( function() { intro.opacity ( this.a  );    } )
            .onComplete( function () { intro.dispose(); } )
            .start();


    };

    intro.dispose = function () {

        document.body.removeChild( content );
        document.body.removeChild( txt );

    }

    intro.message = function ( str ) {

        txt.innerHTML = str;

    }

    return intro;

})();