MINE.type = {
  EMPTY: 0,
  DIRT: 1,
  GRASS: 2,
  STONE: 3,
  SAND: 4,//1,
  WATER: 5,
  SNOW: 6,
  WOOD: 7,
  LEAVES: 8,
  ACID: 9
};

MINE.color = function(r,g,b,a){
    a = a || 255;
    return {r:r/255, g:g/255, b:b/255, a:a/255}
}
MINE.round = Math.round;
MINE.floor = Math.floor;
MINE.ceil = Math.ceil;
MINE.lerp = function (a, b, percent) { return a + (b - a) * percent; }
MINE.rand = function (a, b, n) { return MINE.lerp(a || 0, b || 1, Math.random()).toFixed(n || 3)*1;}
MINE.randInt = function (a, b, n) { return MINE.lerp(a || 0, b || 1, Math.random()).toFixed(n || 0)*1;}


MINE.World = function(w,h){
    this.background = MINE.color(27, 27, 27);
    this.POS = [
        {x:0, y:0},
        {x:0, y:1},
        {x:11, y:9},
        {x:0, y:2},
        {x:4, y:0},
        {x:1, y:0},
        {x:6, y:14},
        {x:2, y:15},
        {x:9, y:15}
    ];
    this.COLORS = [
        MINE.color(27, 27, 27),
        MINE.color(180, 120, 20),
        MINE.color(20, 150, 20),
        MINE.color(100, 100, 100),
        MINE.color(240, 200, 10),
        MINE.color(5, 44, 117, 180),
        MINE.color(255, 255, 255),
        MINE.color(110, 70, 10),
        MINE.color(10, 210, 20, 185),
        MINE.color(40, 200, 0),
    ];
    this.TILE_TYPES = [
        "Empty",
        "Dirt",
        "Grass",
        "Stone",
        "Sand",
        "Water",
        "Snow",
        "Wood",
        "Leaves",
    ];
    this.width = w||500;
    this.height = h||500;
    this.ready = false;
    this.time = 0;
    this.pxPerBlock = 1;
    this.queuedPoints = [];
    this.sand = new Uint8Array( this.width*this.height );//[];
    this.res = {
        x: Math.floor(this.width / this.pxPerBlock),
        y: Math.floor(this.height / this.pxPerBlock)
    };
    this.rightButtonClicked = false;
    this.leftButtonClicked = false;
    this.mouse = { x: 0, y: 0 };
    this.mouseOld = { x: 0, y: 0 };
    this.action = { spawnType: MINE.type.SAND };

    var _this = this;
    this.computeFn = {};

    this.computeFn[MINE.type.EMPTY] = function (x, y) { _this.computeEmpty(x, y); };
    this.computeFn[MINE.type.SAND] = function (x, y) { _this.computeSand(x, y); };
    this.computeFn[MINE.type.WATER] = function (x, y) { _this.computeLiquid(x, y); };
    //this.computeFn[MINE.type.SOLID] = function (x, y) { };
    this.computeFn[MINE.type.ACID] = function (x, y) { _this.computeAcid(x, y); };

    /*this.computeFn[MINE.type.EMPTY] = this.computeEmpty;
    this.computeFn[MINE.type.SAND] = this.computeSand;
    this.computeFn[MINE.type.WATER] = this.computeLiquid;
    this.computeFn[MINE.type.SOLID] = function() {};
    this.computeFn[MINE.type.ACID] = this.computeAcid;
    */

    this.initArray();
    
};

MINE.World.prototype = {
    constructor: MINE.World,
    

    addLine:function (x0, y0, x1, y1, type) {
        var dx = Math.abs(x1 - x0);
        var dy = Math.abs(y1 - y0);
        var sx = (x0 < x1) ? 1 : -1;
        var sy = (y0 < y1) ? 1 : -1;
        var err = dx - dy;

        while (true) {
            this.queuedPoints[this.from2D(x0, y0)] = type;
            if ((x0 == x1) && (y0 == y1)) break;
            var e2 = 2 * err;
            if(e2 > -dy) { err -= dy; x0 += sx; }
            if(e2 < dx) { err += dx; y0 += sy; }
        }
    },

    addPixel:function (x, y, type) {
        this.sand[this.from2D(x, y)] = type;
    },

    addPixels:function () {
        var keys = Object.keys(this.queuedPoints);
        for (var i = 0; i < keys.length; i++) {
            var type = this.queuedPoints[keys[i]];
            this.sand[keys[i]] = +type;
        }
        this.queuedPoints = [];
    },

    removePixel:function (x, y) {
        this.sand[this.from2D(x, y)] = MINE.type.EMPTY;
    },

    from2D:function (x, y) {
        return y * this.res.x + x;
    },
    position : function(id){
        var n = Math.floor(id/this.res.x);
        var y = n;
        var x = id-(n*this.res.x);
        return {x:x,y:y};
    },

    computeSand:function (x, y) {
        var i = this.from2D(x, y);
        var bottomI = this.from2D(x, y + 1);

        if (!this.sand[bottomI]) {
            this.sand[bottomI] = MINE.type.SAND;
            this.sand[i] = MINE.type.EMPTY;
        } else {
            var leftI = this.from2D(x - 1, y);
            var rightI = this.from2D(x + 1, y);
            var leftBottomI = this.from2D(x - 1, y + 1);
            var rightBottomI = this.from2D(x + 1, y + 1);
            if (!this.sand[leftBottomI] && !this.sand[rightBottomI] &&
                !this.sand[leftI] && !this.sand[rightI]) {
                if (Math.random() <= 0.5) this.sand[leftBottomI] = MINE.type.SAND;
                else this.sand[rightBottomI] = MINE.type.SAND;
                this.sand[i] = MINE.type.EMPTY;
            } else if (!this.sand[leftBottomI] && !this.sand[leftI]) {
                this.sand[leftBottomI] = MINE.type.SAND;
                this.sand[i] = MINE.type.EMPTY;
            } else if (!this.sand[rightBottomI] && !this.sand[rightI]) {
                this.sand[rightBottomI] = MINE.type.SAND;
                this.sand[i] = MINE.type.EMPTY;
            }
        }
    },

    computeLiquid:function (x, y) {
        var i = this.from2D(x, y);
        var bottomI = this.from2D(x, y + 1);

        if (!this.sand[bottomI]) {
            this.sand[bottomI] = MINE.type.WATER;
            this.sand[i] = MINE.type.EMPTY;
        } else {
            var leftI = this.from2D(x - 1, y);
            var rightI = this.from2D(x + 1, y);
            if (!this.sand[leftI] && !this.sand[rightI]) {
                if (Math.random() <= 0.5) this.sand[leftI] = MINE.type.WATER;
                else this.sand[rightI] = MINE.type.WATER;
                this.sand[i] = MINE.type.EMPTY;
            } else if (!this.sand[leftI]) {
                this.sand[leftI] = MINE.type.WATER;
                this.sand[i] = MINE.type.EMPTY;
            } else if (!this.sand[rightI]) {
                this.sand[rightI] = MINE.type.WATER;
                this.sand[i] = MINE.type.EMPTY;
            }
        }
    },

    computeAcid:function (x, y) {
        var i = this.from2D(x, y);
        var bottomI = this.from2D(x, y + 1);
        var etchedCell = Math.random() < 0.3 ? MINE.type.EMPTY : MINE.type.ACID;

        if (this.sand[bottomI] != MINE.type.ACID) {
            if (this.sand[bottomI] != MINE.type.EMPTY) this.sand[bottomI] = etchedCell;
            else this.sand[bottomI] = MINE.type.ACID;
            this.sand[i] = MINE.type.EMPTY;
        } else {
            var leftI = this.from2D(x - 1, y);
            var rightI = this.from2D(x + 1, y);
            if (this.sand[leftI] != MINE.type.ACID && this.sand[rightI] != MINE.type.ACID) {
                if (Math.random() <= 0.5) this.sand[leftI] = etchedCell;
                else this.sand[rightI] = etchedCell;
                this.sand[i] = MINE.type.EMPTY;
            } else if (this.sand[leftI] != MINE.type.EMPTY) {
                this.sand[leftI] = etchedCell;
                this.sand[i] = MINE.type.EMPTY;
            } else if (this.sand[rightI] != MINE.type.EMPTY) {
                this.sand[rightI] = etchedCell;
                this.sand[i] = MINE.type.EMPTY;
            }
        }
    },

    computeEmpty:function (x, y) {
        this.sand[this.from2D(x, y)] = MINE.type.EMPTY;
    },

    initArray:function () {
        var max = this.res.y * this.res.x;
        
        
        //for (var i = 0; i < max; i++) if (Math.random() * 50 > 48) this.sand[i] = MINE.type.ACID;
        //for (var i = 0; i < max; i++) if (Math.random() * 40 > 38) this.sand[i] = MINE.type.SOLID;
        
        for (var i = max/10; i < max; i++) if (Math.random() * 10 > 9) this.sand[i] = MINE.type.SAND;

        for (var i = 0; i < max/10; i++) if (Math.random() * 20 > 19) this.sand[i] = MINE.type.WATER;

        this.generateTerrain();


    },

    update:function(){
        if (this.leftButtonClicked) {
            if (queuedPoints.length > 0) this.addPixels();
            else this.addPixel(this.mouse.x, this.mouse.y, this.action.spawnType);
        }

        for (var y = Math.floor(this.res.y - 2); y >= 0; y--) {
            for (var x = Math.floor(this.res.x - 1); x >= 0; x--) {
                var cell = this.sand[this.from2D(x, y)];
                if (cell) if(this.computeFn[cell]) this.computeFn[cell](x, y);
            }
        }

        //this.draw();
        this.time += 1;
    },

    generateTerrain : function() {
        var TILE_SIZE = 1;
        var random = MINE.rand;
        var randomInt = MINE.randInt;
        var round = MINE.round;
        var floor = MINE.floor;
        var ceil = MINE.ceil;
        var id = 0;
        var c = random(1, 3);
        var r = 0;
        
        //Variable concerning the current Y position of the tile generator
        var blockY = 250;//300;
        
        // Create the left end section of water
        var x = this.res.x;
        while(x--){
        //for(var x = -2250; x <= -1760; x += TILE_SIZE) {
            
            /* Create the water section */
            for(var y = round(random(40, 45))*TILE_SIZE; y >= 250; y -= TILE_SIZE) {

                id = this.from2D(x, y);
                this.sand[id] = MINE.type.WATER;

                /*tileArray.push({
                    xPos: x,
                    yPos: y,
                    colr: COLORS[4],
                });*/
            }
            
            /* Create the section underneath the water */
            for(var y = 300; y <= 310+round(random(20, 30))*TILE_SIZE; y += TILE_SIZE) {

                id = this.from2D(x, y+TILE_SIZE);
                r = randomInt(0,5);
                if(r==5) this.sand[id] = MINE.type.DIRT;
                else this.sand[id] = MINE.type.STONE;
                //this.sand[id] = MINE.type.WATER;

                /*tileArray.push({
                    xPos: x,
                    yPos: y+TILE_SIZE,
                    colr: [COLORS[2], COLORS[2], COLORS[2], COLORS[2], COLORS[0]][floor(random()*5)],
                });*/
            }
        }
        
        /*
        // Create the right end section of water //
        for(var x = 1760; x <= 2250; x += TILE_SIZE) {
            
            // Create the water section //
            for(var y = round(random(40, 45))*TILE_SIZE; y >= 300; y -= TILE_SIZE) {
                tileArray.push({
                    xPos: x,
                    yPos: y,
                    colr: COLORS[4],
                });
            }
            
            // Create the section underneath the water //
            for(var y = 400; y <= 410+round(random(20, 30))*TILE_SIZE; y += TILE_SIZE) {
                tileArray.push({
                    xPos: x,
                    yPos: y+TILE_SIZE,
                    colr: [COLORS[2], COLORS[2], COLORS[2], COLORS[2], COLORS[0]][floor(random()*5)],
                });
            }
        }


        */

        var x = this.res.x;
        //for(var x = 0; x <= 500; x ++) {
        while(x--){


        
        // Overarching for loop, this loop determines a section of the world size 
        //for(var x = -1750; x <= 1750; x += TILE_SIZE) {
            
            // Create part of the dirt section, with grass on top
            var heightUpOne = round(random(-1, 0));
            id = this.from2D(x, blockY+TILE_SIZE*heightUpOne);
            this.sand[id] = MINE.type.GRASS;
            /*tileArray.push({
                xPos: x,
                yPos: blockY+TILE_SIZE*heightUpOne,
                colr: COLORS[1],
            });*/
            if(heightUpOne === -1) {
                id = this.from2D(x, blockY);
                this.sand[id] = MINE.type.DIRT;
                /*tileArray.push({
                    xPos: x,
                    yPos: blockY,
                    colr: COLORS[0],
                });*/
            }
            
            // If this statement is true, then place a tree down 
            if(random() >= random()*random()/random()+random()) {
                var treeHeight = randomInt(2, 20);//round(random(2, 6));
                
                // Create the wood section of the tree 
                for(var h = blockY-TILE_SIZE; h >= blockY-TILE_SIZE*treeHeight; h -= TILE_SIZE) {
                    id = this.from2D(x, h);
                    this.sand[id] = MINE.type.WOOD;
                    /*tileArray.push({
                        xPos: x,
                        yPos: h,
                        colr: COLORS[6],
                    });*/
                }
                
                // Create the leaf top of the tree
                for(var i = 0; i <= 1; i++) {
                    id = this.from2D(x, blockY-TILE_SIZE*(treeHeight+i)-TILE_SIZE);
                    this.sand[id] = MINE.type.LEAVES;

                    /*tileArray.push({
                        xPos: x,
                        yPos: blockY-TILE_SIZE*(treeHeight+i)-TILE_SIZE,
                        colr: COLORS[7],
                    });*/
                }
                
                // Add two extra leaf blocks on the sides for a more realistic tree 
                id = this.from2D(x+TILE_SIZE, blockY-TILE_SIZE*treeHeight-TILE_SIZE);
                this.sand[id] = MINE.type.LEAVES;
                id = this.from2D(x-TILE_SIZE, blockY-TILE_SIZE*treeHeight-TILE_SIZE);
                this.sand[id] = MINE.type.LEAVES;


                /*tileArray.push({
                    xPos: x+TILE_SIZE,
                    yPos: blockY-TILE_SIZE*treeHeight-TILE_SIZE,
                    colr: COLORS[7]
                });
                tileArray.push({
                    xPos: x-TILE_SIZE,
                    yPos: blockY-TILE_SIZE*treeHeight-TILE_SIZE,
                    colr: COLORS[7]
                });*/
            } 
            
            // Create the last part of the dirt section
            for(var y = blockY; y <= blockY+TILE_SIZE*round(random(2, 4)); y += TILE_SIZE) {
                id = this.from2D(x, y+TILE_SIZE);
                this.sand[id] = MINE.type.DIRT;
                /*tileArray.push({
                    xPos: x,
                    yPos: y+TILE_SIZE,
                    colr: COLORS[0],
                });*/
            
            }
            
            // Create the stone section 
            for(var y = blockY+TILE_SIZE*round(c); y <= blockY+TILE_SIZE*random(28, 32); y += TILE_SIZE) {
                id = this.from2D(x, y+TILE_SIZE);
                r = randomInt(0,20);
                if(r<19)this.sand[id] = MINE.type.STONE;
                else this.sand[id] = MINE.type.DIRT;
                /*tileArray.push({
                    xPos: x,
                    yPos: y+TILE_SIZE,
                    colr: [COLORS[2], COLORS[2], COLORS[2], 
                           COLORS[2], COLORS[2], COLORS[2],
                           COLORS[2], COLORS[2], COLORS[2],
                           COLORS[2], COLORS[2], COLORS[2],
                           COLORS[2], COLORS[2], COLORS[2],
                           COLORS[2], COLORS[2], COLORS[2],
                           COLORS[0]][floor(random()*19)],
                });*/
            }
            
            // Change the blockY by a random, but rounded amount 
            blockY += (ceil(random(-1, 1)/TILE_SIZE)*TILE_SIZE)*round(random(-2, 2));
           
        }

        this.ready = true;
    }
};