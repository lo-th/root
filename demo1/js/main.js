var view, debug
var h = 6;
var tt = 0;

var heroNames = [ 'Theo', 'Cynthia', 'Amina', 'Eleanor' ];
var startPosition = [ [-28, 0, -20], [-24, 0, -20], [-20, 0, -20], [-16, 0, -20] ];

function init () {

    view = new View();
    view.camera.fov = 50;
    view.initGeometry();
    view.initGrid( 0xa2a9ad, 0xb5bcc1 );
    view.addSky();
    view.updateSky( { hour:14 } );
    view.addShadow();

    view.mat['way'] = new THREE.MeshBasicMaterial({ color:0x7caccc, wireframe:true });
    view.mat['wall'] = new THREE.MeshStandardMaterial({ color:0x7caccc, transparent:true, opacity:0.3 });


    //view.init(null, true);

    debug = document.createElement("div");
    debug.style.cssText = 'position:absolute; bottom:10px; left:10px; width:200px; color:#757b7d; ';
    document.body.appendChild(debug);

    crowd.init( onCrowdReady, onCrowdUpdate );

}


function onCrowdReady () {

    crowd.send( 'set', { fps:60, iteration:10, precision:[ 5, 10, 5, 5 ] });// precision:[ 10, 15, 10, 10 ]

    //crowd.send( 'set', { fps:60, forceStep:0.3, iteration:1, precision:[ 10, 15, 5, 5 ] });

    avatar.init();
    avatar.onComplete = onStart;
    
}

function onStart () {

    crowd.start();


    addObstacle();
    addWayPoint();


    i = heroNames.length;
    while(i--) agent( i );

    view.moveCam( [-45, 30, 60, [0,0,0]] )

}

function onCrowdUpdate () {

    //var heros = view.getHero()

    var speed, distance;

    view.heros.forEach( function( b, id ) {

        var n = ( id * 5 );

        speed = Gr[ n ];
        distance = Gr[ n+4 ];

        //if(id===1) tell( Gr[ n + 4 ] );

        b.position.set( Gr[n+1], 0, Gr[n+2] );
        if( distance > 1 ){
            b.rotation.y = Math.lerp(  Gr[n+3], b.rotation.y, 0.5 );
        }

        

        b.setTimescale(0.25+(speed))
        if( speed > 0.1 ) b.play( 'walk', 0.5 )
        else b.play( 'idle', 0.5 )


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

function addWayPoint () {

    way({ x:-28, y:-20 })
    way({ x:-12, y:-20 })
    way({ x:4, y:-20 })

    way({ x:4, y:0 })

}

function addObstacle () {

    obstacle( { size:[20,13,2], pos:[-22,6.5,-15], r:0 })
    obstacle( { size:[12,13,2], pos:[26,6.5,-23], r:0 })

    obstacle( { size:[4,2,4], pos:[-22.6,1,2], r:0 })
    obstacle( { size:[4,2,4], pos:[-13.4,1,2], r:0 })
    obstacle( { size:[4,2,4], pos:[-22.6,1,18], r:0 })
    obstacle( { size:[4,2,4], pos:[-13.4,1,18], r:0 })

    obstacle( { size:[10,1,4], pos:[-18,0.5,10], r:0 })

    obstacle( { size:[16,6,4], pos:[20,3,18], r:0 })

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

function agent ( i ) {

    var name = heroNames[i];

    var radius = 2;
    var pos = startPosition[i];

    var m = avatar.character[name];
    m.setSize(0.08);
    m.position.fromArray( pos );
    m.setTimescale( 0.25 );
    m.play( 'idle' );

    view.scene.add( m );
    view.heros.push( m );

    crowd.send( 'add', { x:pos[0], z:pos[2], radius:radius, speed:1, useRoadMap:true } );

};



/*function addGui (){

	var ui = new UIL.Gui();
	//ui.add('slide',  { name:'ao', min:0, max:2, value:1, step:0.01, precision:2, fontColor:'#B0CC99', h:20 }).onChange( changeAo );

}*/
