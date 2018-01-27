var demos = [ 
    'basic', 'compound', 'stacking', 'terrain', 'kinematic2', 'kineBody', 'asteroid', 'ragdoll', 'car', 'joints',//, 'terrain', 'trimesh', 'building', 'car', 'ragdoll', 'kinematic', 'water', 'mesh_test'
];

demos.sort();

var demoName = 'basic';

var isWithCode = false;


function init () {

	//user.init();
	view.init( initOimo );
    intro.init('OimoPhysics: Saharan | Lab: 3th');
	
}

function initOimo () {

    oimo.init( next );
    
}

function next () {

    intro.clear();
    editor.init( launch, isWithCode, '#DE5825' );

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

function cam ( o ) { view.moveCam( o ); };
function follow ( name ) { view.setFollow( name ); };

function add ( o ) { view.add( o ); };
function joint ( o ) { view.joint( o ); };
function vehicle ( o ) { view.vehicle( o ); };

function set ( o ) { oimo.send( 'set', o ); };
function force ( o ) { oimo.send( 'force', o ); };
function forces ( o ) { oimo.send( 'forces', o ); };
function motion ( o ) { view.motion( o ); };
function hideGrid () { view.hideGrid(); };
function control ( o ) { oimo.send('control', o ); };
function load ( name, callback ) { view.load( name, callback  ); };

function matrix ( o ) { oimo.send('matrix', o ); }
