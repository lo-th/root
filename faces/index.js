var resourceFile =  resourceFile || 'resources';

var container = document.getElementById('container');

// webgl 1 or 2 
var forceGL1 = false

view.init( container, forceGL1 );

// optional interface
gui.init( container );



//pool.load( 'resources.json', onResourceLoaded );
pool.load( resourceFile + '.json', onResourceLoaded );

function onResourceLoaded () {

    avatar.load( pool.get( resourceFile ), onComplete );

}

function onComplete () {

    console.log('ok')

    view.setCamera( { distance:300, phi:0, theta:0, time:2000 } );

    // select environement
    //view.setEnvironement('castle');

}

function testFace(){
	avatar.loadFace(
		'',
		'https://faceswap-api.cntnt.io/static-files/2018/11/30/horrible-chocolate-hamster-4LCy.ply',
		'https://faceswap-api.cntnt.io/static-files/2018/11/30/horrible-chocolate-hamster-4LCy.jpg',
		'https://faceswap-api.cntnt.io/static-files/2018/11/30/horrible-chocolate-hamster-4LCy-morph.zip'
	)
}


///// extra funcion for direct load BVH or Face

var dom = view.getDom();

dom.addEventListener( 'dragover', function(e){ e.preventDefault() }, false );
dom.addEventListener( 'dragend', function(e){ e.preventDefault() }, false );
dom.addEventListener( 'dragleave', function(e){ e.preventDefault()}, false );
dom.addEventListener( 'drop', dropAnimation, false );

function dropAnimation( e ){

    e.preventDefault();

    if (e.dataTransfer.items) {

        var file = e.dataTransfer.files[0];

    } else return;

    var reader = new FileReader();
    var name = file.name;
    var type = name.substring(name.lastIndexOf('.')+1, name.length );

    if( type === 'zip' ){ 
        avatar.setDirectMorph( file );
        return;
    }

    var tn = name.substring( name.lastIndexOf('.')-2, name.lastIndexOf('.') );

    if( type === 'z' || type === 'hex'|| type === 'ply' || type === 'hdr') reader.readAsArrayBuffer( file );
    else if ( type === 'bvh' || type === 'BVH' || type === 'obj' ) reader.readAsText( file );
    else if ( type === 'jpg') reader.readAsDataURL( file );
    else return;

    reader.onload = function ( e ) {

        if( type === 'obj' ) avatar.setFaceDirect( e.target.result );

        if( type === 'ply' ) avatar.setFaceDirectPLY( e.target.result );
        if( type === 'jpg' ) avatar.setFaceDirectPLYMap( e.target.result );
        if( type === 'BVH' || type === 'bvh' ){
            avatar.loadAnimation( e.target.result, name, type );
            avatar.play(name);
        }

        if( type === 'hdr' ) view.setDirectHDR( e.target.result )



    }.bind(this);

};