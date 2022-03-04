
export class Timer {

	constructor( framerate = -1 ) {

		this.time = { now:0, delta:0, then:0, interval: 0, tmp:0, n:0, dt:0 }
		this.setFramerate( framerate )

		this.fps = 0
		this.delta = 0

	}

	up ( stamp = 0 ) {

		let t = this.time

		t.now = stamp !== undefined ? stamp : Date.now()
		t.delta = t.now - t.then

		if ( t.delta > t.interval || this.framerate === -1 ) {

		    if( this.framerate === -1 ) t.then = t.now
		    else t.then = t.now - ( t.delta % t.interval )

		    this.delta = t.delta * 0.001

		    // fps 
		    this.getFps()
		    
			return true

		}

		return false

	}

	getFps() {

		let t = this.time

		if ( t.now - 1000 > t.tmp ){ 
	    	t.tmp = t.now
	    	this.fps = t.n
	    	t.n = 0
	    }
	    t.n++

	}

	setFramerate ( framerate ){

		if( framerate === '&#8734' ) framerate = -1
		this.framerate = framerate
		this.time.interval = 1000 / framerate
		//this.framerate = framerate

	}

	getFramerate() {

		if( this.framerate === -1 ) return '&#8734'
		return this.framerate

	}

}