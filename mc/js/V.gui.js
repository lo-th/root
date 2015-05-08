



V.Gui = function(){
    this.gui = new dat.GUI();
    //this.gui.domElement.style.cssText ='position:absolute; right:0px; top:0px;';
    this.div = this.gui.domElement;
    this.div.style.display = 'none';
    this.tmp = {};
    this.groups = [];

    this.g1 = false

    this.current = null;
}

V.Gui.prototype = {
    constructor: V.Gui,
    hide:function(n){
    //	for (var i in this.gui.__controllers) {
   // 		this.gui.remove(this.gui.__controllers[i]);

    		//this.gui.__controllers[i].destroy()
    		 //console.log(this.gui.__controllers[i])
    	    		//if(this.gui.__controllers[i])this.gui.remove(this.gui.__controllers[i]);
    //	    	}

    //	    	console.log(this.gui.__controllers)
    	    	//this.gui.destroy()
    	/*if(this.groups.length){


    	if(this.groups[0].__controllers){
    	    	for (var i in this.groups[0].__controllers) {
    	    		if(this.groups[0].__controllers[i])this.groups[0].remove(this.groups[0].__controllers[i]);
    	    	}
    	   // this.groups[0].close();
    //this.groups[0].domElement.parentNode.parentNode.removeChild(this.groups[0].domElement.parentNode);
    //this.groups[0] = undefined;

    	}
    }*/
    	//this.gui.remove(this.groups[0]) 
    	//this.groups = [];
    	this.div.style.display = 'none';
    },
    show:function(n){
    	this.current = scenes[n];
    	switch(n){
    		case 0: 

    		/*var gui_info = gui.addFolder('Info');
			gui_info.add(neuralNet, 'numNeurons').name('Neurons');
			gui_info.add(neuralNet, 'numAxons').name('Axons');
			gui_info.add(neuralNet, 'numSignals', 0, neuralNet.limitSignals).name('Signals');
			gui_info.autoListen = false;*/
			if(!this.g1){
				this.g1 = true;
						this.gui.add(this.current, 'model', this.current.ObjectLists ).onChange(function(){this.updateSodaObject()}.bind(this) );
						this.gui.add(this.current, 'currentMaxSignals', 0, this.current.limitSignals).name('Max Signals').onChange(function(){this.updateSodaSettings()}.bind(this) );
						//gui_settings.add(neuralNet.particlePool, 'pSize', 0.2, 2).name('Signal Size');
						this.gui.add(this.current, 'signalMinSpeed', 0.01, 0.1, 0.01).name('Signal Min Speed').onChange(function(){this.updateSodaSettings()}.bind(this) );
						this.gui.add(this.current, 'signalMaxSpeed', 0.01, 0.1, 0.01).name('Signal Max Speed').onChange(function(){this.updateSodaSettings()}.bind(this) );
						this.gui.add(this.current, 'neuronSize', 0, 2).name('Neuron Size').onChange(function(){this.updateSodaSettings()}.bind(this) );
						this.gui.add(this.current, 'neuronOpacity', 0, 1.0).name('Neuron Opacity').onChange(function(){this.updateSodaSettings()}.bind(this) );
						this.gui.add(this.current, 'axonOpacityMultiplier', 0.0, 5.0).name('Axon Opacity Mult').onChange(function(){this.updateSodaSettings()}.bind(this) );
						//gui_settings.addColor(neuralNet.particlePool, 'pColor').name('Signal Color');
						this.gui.addColor(this.current, 'neuronColor').name('Neuron Color').onChange(function(){this.updateSodaSettings()}.bind(this) );
						this.gui.addColor(this.current, 'axonColor').name('Axon Color').onChange(function(){this.updateSodaSettings()}.bind(this) );
						this.gui.addColor(scene_settings, 'bgColor').name('Background').onChange(function(){this.updateBGset()}.bind(this) );
						this.gui.open();
			}
			this.div.style.display = 'block';
    		break;
    		default: 
    		    this.hide();
    		break;

    	}
    	
    },
    updateSodaObject:function(){
    	this.current.changeObject();
    },
    updateSodaSettings:function(){
    	this.current.updateSettings();
    },
    updateBGset:function(){
    	v.updateBG()
    }

}