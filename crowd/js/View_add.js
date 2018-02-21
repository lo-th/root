
View.prototype.updateIntern = function () {

    var speed;

    var i = this.agents.length, a, n, s, c, ca;

    //this.agents.forEach( function( a, id ) {
    while(i--){

        a = this.agents[i];

        n = ( i * 5 );

        s = Gr[n]
        a.position.set( Gr[n+1], 0, Gr[n+2] );
        a.rotation.y = -Gr[n+3] - Math.PI90;

        c = a.children[0];

        if( c ){
            ca = c.currentAnimation.clip.name;
            if( s > 0.25 ){
                c.setTimeScale( s );
                if(ca !== 'run') c.play('run',0.5)
            } else if(s>0){
                c.setTimeScale( s );
                if(ca !== 'walk') c.play('walk',0.5)
            } else{ 
                c.setTimeScale( 0.25 );
                if(ca !== 'idle') c.play('idle',0.5)
            }
        }

        

    }//);

},

View.prototype.removeAgent = function ( o ) {

    o = o || {};
    
    var h = o.id !== undefined ? this.agents[o.id] : o.h; 
    var c = h.children[0];
    if(c){
        c.stop();
        h.remove(c);
    }

    this.scene.remove( h );

    if( o.id ){

        this.agents.splice( o.id, 1 );
        crowd.send( 'remove', o );

    }

}

View.prototype.agent = function ( o ) {

	o = o || {};

    var radius = o.radius || 2;
    var pos = o.pos || [0,0,0];

    var m = new THREE.Mesh( this.geo.agent, this.mat.agent );

    //if(o.model){

        var n = o.n || Math.randInt(1,5)
        var m2 = view.mesh['hero_0'+n].clone();//new THREE.Mesh( this.geo.cicle, this.mat.hero );
        m2.material = this.mat.heros;
        m2.receiveShadow = false;
        m2.scale.set(0.3,0.3,0.3);
        m2.position.set( 0, 3 , 0);
        m2.play('idle',0.5)
        m.add( m2 );
        m.material = this.mat.agentHide;


    //}

    m.scale.set( radius, radius, radius );
    m.position.fromArray( pos );

    this.scene.add(m);
    this.agents.push(m);

    crowd.send( 'add', o );

}

View.prototype.obstacle = function ( o ) {

    o = o || {};

    var m = new THREE.Mesh( this.geo.box, this.mat.wall )

    m.scale.fromArray(o.size);
    m.position.fromArray(o.pos);
    m.rotation.y = o.r || 0;

    m.castShadow = true;
    m.receiveShadow = false;

    this.scene.add( m )
    this.solids.push( m );

    o.type = 'box';

    crowd.send( 'obstacle', o );

};

View.prototype.way = function ( o ) {

    o = o || {};
    var m = new THREE.Mesh( this.geo.cicle, this.mat.way )
    if( o.w ) m.position.set( o.w[0], 0, o.w[1] );
    else m.position.set( o.x || 0, 0, o.z || 0 );
    this.scene.add( m );
    this.solids.push( m );
    crowd.send( 'way', o );

};

View.prototype.reset = function () {

	this.isNeedUpdate = false;
	this.controler.resetFollow();

	var h, c;

	while( this.solids.length > 0 ) this.scene.remove( this.solids.pop() );
	while( this.agents.length > 0 ) this.removeAgent( { h:this.agents.pop() } );

    this.agents = [];
    this.solids = [];
      
	this.helper.visible = true;
    if( this.shadowGround !== null ) this.shadowGround.visible = true;

    this.update = function () {};
    this.tmpCallback = function(){};
    this.byName = {};

}