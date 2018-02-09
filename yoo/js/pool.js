var pool = ( function () {

    'use strict';

    var urls = [];
    var callback = null;
    var results = null;
    var inLoading = false;
    var seaLoader = null;
    var readers = null;

    pool = {

        reset: function (){

            results = null;
            callback = null;

        },

        get: function ( name ){

            return results[name];

        },

        getResult : function(){

            return results;

        },

        meshByName : function ( name ){

            var ar = results[ name ];
            var meshs = {}
            var i = ar.length;

            while(i--){
                meshs[ ar[i].name ] = ar[i];
            }

            return meshs;

        },

        getMesh : function ( name, meshName ){

            var ar = results[name];
            var i = ar.length;
            while(i--){
                if( ar[i].name === meshName ) return ar[i];
            }

        },

        load: function( Urls, Callback ){

            if ( typeof Urls == 'string' || Urls instanceof String ) urls.push( Urls );// = [ Urls ];
            else urls = urls.concat( Urls );

            callback = Callback || function(){};

            results = {};

            inLoading = true;

            this.loadOne();

        },

        next: function () {

            urls.shift();
            if( urls.length === 0 ){ 
                inLoading = false;
                callback( results );
            }
            else this.loadOne();

        },

        setAssetLoadTechnique: function( callback ) {

            this.loading = callback;

        },

        loadOne: function(){

            var link = urls[0];

            var name = link.substring( link.lastIndexOf('/')+1, link.lastIndexOf('.') );
            var type = link.substring( link.lastIndexOf('.')+1 );

            this.loading( link, name, type );

        },

        loading: function ( link, name, type ) {

            var _this = this;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', link, true );
            xhr.responseType = 'blob';

            xhr.onload = function() {

                _this.load_blob( xhr.response, name, type );

            }

            xhr.send( null );

        },

        ///  

        load_blob: function( url, name, type ){

            var _this = this;

            var reader = readers || new FileReader();

            if( type === 'png' || type === 'jpg' ) reader.readAsDataURL( url );
            else reader.readAsArrayBuffer( url );

            reader.onload = function(e) {

                if( type === 'sea' ){
                    var lll = new THREE.SEA3D();

                    lll.onComplete = function( e ) { 
                        results[name] = lll.meshes;
                        _this.next() 
                    }

                    lll.load();
                    lll.file.read( e.target.result );

                } else if( type === 'jpg' || type === 'png' ){

                    results[name] = new Image();
                    results[name].src = e.target.result;
                    _this.next();

                } else if( type === 'z' ){

                    results[name] = e.target.result;
                    _this.next();

                }

            }

        }

    };

    return pool;

})();