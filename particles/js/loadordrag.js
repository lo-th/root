'use strict';

var LoadorDrag = function( callback, name, Py, isOld ){

    this.pool = [];
    this.isOld = isOld || false;

    this.callback = callback || new function(){};

    this.reader = new FileReader();
    this.file = null;

    var py = Py || 10;
    var def = 'text-align:center; color:#ccc; font-size:14px; font-family:"Lucida Console", Monaco, monospace; padding-top:5px; ';

    this.content = document.createElement('div');
    this.title = document.createElement('div');
    this.drager = document.createElement('div');
    this.loader = document.createElement('div');
    this.hide = document.createElement('input');
    this.hide.type = "file";
    this.content.style.cssText = "position:absolute; bottom:"+py+"px; left:10px; width:110px; height:50px; pointer-events:none;";
    this.title.style.cssText = def+"position:absolute; top:0; left:0; width:110px; height:20px; pointer-events:none;";
    this.drager.style.cssText = def+"position:absolute; bottom:0px; left:0px; width:50px; height:25px; border:1px dashed #ccc; pointer-events:auto; cursor:default;";
    this.loader.style.cssText = def+"position:absolute; bottom:0px; left:60px; width:50px; height:25px; pointer-events:none; border:1px solid #ccc;";
    this.hide.style.cssText = "position:absolute; bottom:0px; left:60px; width:50px; padding-top:10px; height:25px; opacity:0; overflow:hidden; cursor:pointer; pointer-events:auto;";

    this.title.innerHTML = name;
    this.drager.innerHTML = 'DRAG';
    this.loader.innerHTML = 'LOAD';

    var _this = this;
    this.reader.onload = function(e) { _this.sending(e.target.result); };

    this.drager.addEventListener('dragover', function(e){_this.dragOver(e);}, false);
    this.drager.addEventListener('dragend', function(e){_this.dragEnd(e);}, false);
    this.drager.addEventListener('dragleave', function(e){_this.dragEnd(e);}, false);
    this.drager.addEventListener('drop', function(e){_this.drop(e);}, false);
    
    this.hide.addEventListener('mouseover', function(){_this.fileOver();}, false);
    this.hide.addEventListener('mouseout', function(){_this.fileOut();}, false);
    this.hide.addEventListener('change', function(e){_this.handleFileSelect(e);}, false);

    document.body.appendChild(this.content);
    this.content.appendChild(this.title);
    this.content.appendChild(this.hide);
    this.content.appendChild(this.loader);
    this.content.appendChild(this.drager);
}

LoadorDrag.prototype = {
    // DRAGER

    dragOver:function(e){

        e = e || window.event;
        if(e.preventDefault) e.preventDefault();
        this.drager.style.border = '1px dashed #F33';
        this.drager.style.color = '#F33';
        return false;

    },
    dragEnd:function(e){

        e = e || window.event;
        if(e.preventDefault) e.preventDefault();
        this.drager.style.border = '1px dashed #ccc';
        this.drager.style.color = '#ccc';
        return false;

    },
    drop:function(e){

        this.dragEnd(e);
        this.file = e.dataTransfer.files[0];
        this.read();

        return false;

    },


    // LOADER

    handleFileSelect : function(e){

        this.file = e.target.files[0];
        this.read();

    },
    fileOver:function(){

        this.loader.style.border = '1px solid #F33';
        this.loader.style.color = '#F33';

    },
    fileOut:function(){

        this.loader.style.border = '1px solid #ccc';
        this.loader.style.color = '#ccc';

    },

    // FINAL

    read:function(){
        var fname = this.file.name;
        var type = fname.substring(fname.indexOf('.')+1, fname.length);

        if(this.isOld && this.pool.indexOf(fname) !== -1 ) this.callback(null, this.file.name);
        else{
            if( type === 'png' || type === 'jpg' ) this.reader.readAsDataURL(this.file);
            else if(type==='z') this.reader.readAsBinaryString(this.file);
            else this.reader.readAsText(this.file);
        }
        
    },

    sending:function(result){
        this.pool.push(this.file.name);
        this.callback( result, this.file.name );
    }
}