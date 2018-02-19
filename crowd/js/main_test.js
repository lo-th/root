var view, debug
var h = 6;
var tt = 0;
function init () {

    view = new View();
    view.initGeometry();
    view.addShadow();
    //view.init(null, true);
    view.mat['hero'] = new THREE.MeshBasicMaterial({ color:0x7caccc, wireframe:true });
    view.mat['way'] = new THREE.MeshBasicMaterial({ color:0x7caccc, wireframe:true });
    view.mat['wall'] = new THREE.MeshStandardMaterial({ color:0x7caccc, transparent:true, opacity:0.3 });

    debug = document.createElement("div");
    debug.style.cssText = 'position:absolute; bottom:10px; left:10px; width:200px;';
    document.body.appendChild(debug);

    crowd.init( onCrowdReady, onCrowdUpdate );

}


function onCrowdReady () {

    crowd.send( 'set', { fps:60, iteration:10, precision:[ 10, 15, 10, 10 ] });

    //crowd.send( 'set', { fps:60, forceStep:0.3, iteration:1, precision:[ 10, 15, 5, 5 ], patchVelocity:true });

    crowd.start();

    var i = 10;
    while(i--){ 
        obstacle({
            size:[ Math.rand(1,8), 1, Math.rand(1,8)], 
            pos:[Math.rand(-25,25), 0.5, Math.rand(-25,25) ], 
            r:Math.rand(0,360) * Math.torad 
        });
    }


    var i = 4;
    while(i--) agent();

}

function onCrowdUpdate () {

    //var heros = view.getHero()

    view.heros.forEach( function( b, id ) {

        var n = ( id * 5 );

        b.position.set( Gr[n+1], 1, Gr[n+2] );
        b.rotation.y = Gr[n+3];


    })

    tt++;

    if(tt===600) {
        tt = 0;
        randomGoal();
    }

}

function tell ( m ) {

  debug.textContent = m;

}

function randomGoal () {

    var lng = view.heros.length

    for(var i=0; i<lng; i++){

        crowd.send( 'goal', { id:i, x:Math.rand(-20,20), z:Math.rand(-20,20) } );

    };

}

function way ( o ) {

    var m = new THREE.Mesh( view.geo.cicle, view.mat.way )
    m.position.set(o.x, 0, o.y);
    view.scene.add( m );
    crowd.send( 'way', o );

}


function obstacle ( o ) {

    var m = new THREE.Mesh( view.geo.box, view.mat.wall )

    m.scale.fromArray(o.size);
    m.position.fromArray(o.pos);
    m.rotation.y = o.r;

    m.castShadow = true;
    m.receiveShadow = false;

    view.scene.add(m)

    o.type = 'box';

    crowd.send( 'obstacle', o );

};

function agent () {

    var s = 2

    var b = new THREE.Mesh( view.geo.cylinder, view.mat.hero )
    b.scale.set(0.5,0.25,0.5)
    b.position.y = -0.95
    var d = new THREE.Mesh( view.geo.wheel, view.mat.hero )
    d.scale.set(1,0.4,0.4)
    d.rotation.y = Math.PI90
    d.position.z = 0.5

    var c = new THREE.Mesh( view.geo.sphere, view.mat.hero )
    c.scale.set(0.5,0.5,0.5)
    c.position.y = 1.2

    var m = new THREE.Mesh( view.geo.sphere, view.mat.hero )
    m.add( b )
    m.add( d )
    m.add( c )

    m.castShadow = true;
    m.receiveShadow = true;

    m.scale.set(s,s,s);

    x = -8+(view.heros.length*4);
    y = -30;

    m.position.set( x, 1, y );

    view.scene.add(m);
    view.heros.push(m);

    crowd.send( 'add', { x:x, z:y, radius:s, speed:2 } );

};



/*function addGui (){

	var ui = new UIL.Gui();
	//ui.add('slide',  { name:'ao', min:0, max:2, value:1, step:0.01, precision:2, fontColor:'#B0CC99', h:20 }).onChange( changeAo );

}*/
