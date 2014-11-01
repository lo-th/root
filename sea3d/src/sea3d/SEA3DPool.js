// loth pool
SEA3D.Pool = function(url, endFunction, type){
    this.imgs = {};
    this.meshs = {};
    this.names = [];
    this.revers = {};
}

SEA3D.Pool.prototype = {
    constructor: SEA3D.Pool,
    // LOAD IMAGES Array
    loadImages:function(url, endFunction){
        if(typeof url == 'string' || url instanceof String){
            var singleurl = url;
            url = [singleurl];
        }
        var _this = this;
        var img = new Image();
        img.onload = function(){
            var name = url[0].substring(url[0].lastIndexOf("/")+1, url[0].lastIndexOf("."));
            _this.imgs[name] = this;

            // load next
            url.shift();
            if(url.length) _this.loadImages(url, endFunction);
            else if(endFunction)endFunction();
        };
        img.src = url[0];
    },
    getTexture:function( name, revers ){
        var tx = new THREE.Texture(this.imgs[name]);
        if(revers){
            tx.flipY = false;
            //tx.repeat.set( 1, -1 ); 
            //tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
        }
        tx.needsUpdate = true;
        return tx;
    },

    // LOAD MODELS Array
    loadModels:function (url, endFunction, type){
        if(typeof url == 'string' || url instanceof String){
            var singleurl = url;
            url = [singleurl];
        }
        var name = url[0].substring(url[0].lastIndexOf("/")+1, url[0].lastIndexOf("."));
        type = type || 'default';
        var _this = this;
        var loader = new THREE.SEA3D( true );
        loader.onComplete = function( e ) {
            var i = loader.meshes.length;
            while(i--){
                _this.names[i] = name+'_'+loader.meshes[i].name;
                _this.meshs[_this.names[i]] = loader.meshes[i];
                _this.revers[_this.names[i]] = 0;
            }
            
            // load next
            url.shift();
            if(url.length) _this.loadModels(url, endFunction);
            else if(endFunction)endFunction();
        }
        if(type=='auto') loader.parser = THREE.SEA3D.AUTO;
        else if(type=='buffer') loader.parser = THREE.SEA3D.BUFFER;
        else loader.parser = THREE.SEA3D.DEFAULT;
        loader.load( url[0] );
    },
    getList:function (){
        var s = "";
        for(var i=0; i<this.names.length; i++){
            s+=this.names[i]+'<br>';
        }
        return s;
    },
    getMesh:function (name){
        return this.meshs[name];
    },
    getGeometry:function (name, s, axe){
        //var g = ;
        //this.scaleGeo(g);
        /*s = s || 1;
        axe = axe || 'z';
        var sa = [1,1,1];
        if(axe=='x')sa[0]=-1;
        if(axe=='y')sa[1]=-1;
        if(axe=='z')sa[2]=-1;
        var mtx = new THREE.Matrix4().makeScale(s*sa[0], s*sa[1], s*sa[2]);
        var g = this.meshs[name].geometry;
        g.applyMatrix(mtx);
        g.computeBoundingBox();
        g.computeBoundingSphere();*/
        var g;
        if(this.revers[name]==0){
            this.revers[name] = 1;
            g = this.scaleGeo(this.meshs[name].geometry, s, axe);
        } else {
            g = this.meshs[name].geometry;
        }
        return g;//this.scaleGeo(this.meshs[name].geometry, s, axe);
    },
    scaleGeo:function (geo, s, axe){
        s = s || 1;
        axe = axe || 'z';
        var sa = [1,1,1];
        if(axe=='x')sa[0]=-1;
        if(axe=='y')sa[1]=-1;
        if(axe=='z')sa[2]=-1;
        var mtx = new THREE.Matrix4().makeScale(s*sa[0], s*sa[1], s*sa[2]);
        geo.applyMatrix(mtx);
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
        return geo;
    },

    // mini
    geo:function (name, s, axe){
        return this.getGeometry(name, s, axe);
    },
    mesh:function (name){
        return this.meshs[name];
    },
    load:function (url, end, type){
        this.loadModels(url, end, type);
    },
    edit:function(name, l, ax,s, axe){
        var g = this.scaleGeo(this.meshs[name].geometry.clone());
        var vertices;
        l = l || 100;
        ax = ax || 'x';
        console.log(g.boundingBox);
        if(g.vertices ){
            vertices = g.vertices;
            console.log("is not buffer");
        }
        else console.log("is buffer object");

        var size = g.boundingBox.max.x;
        var mid = size*0.5;

        var i = vertices.length, v;
        while(i--){
            v = vertices[i];
            if(v.x>mid) v.x+=l-mid;
        }
        g.verticesNeedUpdate =true;
        return g;
    },
    clear:function(){
        var m;
        for(var key in this.meshs){
            m = this.meshs[key];
            //if(m.material)m.material.dispose();
            if(m.geometry)m.geometry.dispose();
        }
        this.meshs = {};
        this.names = [];
        this.revers = {};
    }
    /*
    for ( j=0; j < m.geometry.morphTargets.length; j++){
                    morph[i] = m.geometry.morphTargets[j].name;
                }
    */
    
}