var demos = [ 
    'basic', 'compound', 'stacking', 'terrain', 'kinematic2', 'kinematic3', 'asteroid', 'ragdoll'//, 'terrain', 'trimesh', 'building', 'car', 'ragdoll', 'kinematic', 'water', 'mesh_test'
];

demos.sort();

var demoName = 'basic';

var isWithCode = false;


function init () {

	//user.init();
	view.init( initOimo );
    intro.init();
	
}

function initOimo () {

    oimo.init( next );
    
}

function next () {

    intro.clear();
    editor.init( launch, isWithCode );

    oimo.start();

    ready();
    
}

function ready () {

    var hash = location.hash.substr( 1 );
    if(hash !=='') demoName = hash;
    editor.load('demos/' + demoName + '.js');

};

function launch ( name ) {

    var full = true;
    var hash = location.hash.substr( 1 );
    if( hash === name ) full = false;

    location.hash = name;

    oimo.reset( full );
    
    demo = new window['demo'];

};

// editor fonction

function cam ( o ) { return view.moveCam( o ); };
function follow ( name ) { return view.setFollow( name ); };

function add ( o ) { return view.add( o ); };
function joint ( o ) { return view.joint( o ); };
function vehicle ( o ) { return view.vehicle( o ); };

function set ( o ) { return oimo.send( 'set', o ); };
function force ( o ) { return oimo.send( 'force', o ); };
function forces ( o ) { return oimo.send( 'forces', o ); };
function motion ( o ) { return view.motion( o ); };
function hideGrid () { return view.hideGrid(); };
function control ( o ) { return oimo.send('control', o ); };
function load ( name, callback ) { return view.load( name, callback  ); };
