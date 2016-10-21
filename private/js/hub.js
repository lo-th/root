var hub = ( function () {
    
    'use strict';

    var title, subtitle, downtext, minimenu, puces, b1, b2;

    hub = {

        init: function () {

            title = document.createElement('div');
            title.setAttribute( 'class', 'title' );
            document.body.appendChild( title );
            title.textContent = 'UBS Neo';

            subtitle = document.createElement('div');
            subtitle.setAttribute( 'class', 'subtitle' );
            document.body.appendChild( subtitle );
            subtitle.textContent = 'So much, so simply.';

            downtext = document.createElement('div');
            downtext.setAttribute( 'class', 'downtext' );
            document.body.appendChild( downtext );
            downtext.innerHTML = '<font color="#e10000"><b>London</b></font><br>9:34am<br>8°C, Cloudy';

            minimenu = document.createElement('div');
            minimenu.setAttribute( 'class', 'minimenu' );
            document.body.appendChild( minimenu );
            minimenu.innerHTML = '1/4<br>';

            puces = []
            var p;
            for( var i = 0; i < 4; i++ ){

                p = document.createElement('div');
                p.setAttribute( 'class', 'puces' );
                minimenu.appendChild( p );
                puces[i] = p;
                if(i===0) p.style.background = '#e10000';

            }

            b1 = document.createElement('div');
            b1.setAttribute( 'class', 'button' );
            document.body.appendChild( b1 );
            b1.innerHTML = 'Menu';
            b1.style.top = '20px';

            b2 = document.createElement('div');
            b2.setAttribute( 'class', 'button' );
            document.body.appendChild( b2 );
            b2.innerHTML = 'World';
            b2.style.top = '60px';

            b1.addEventListener( 'click', scene.goToMenu, false );
            b2.addEventListener( 'click', scene.goToWorld, false );

        },

        goToMenu: function ( e ){

        },

        goToWorld: function ( e ){

        },

    }

    return hub;

})();