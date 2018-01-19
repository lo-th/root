function demo() {

    //hideGrid();

    cam ({azim:0, polar:30, distance:100});

    // world setting
    set ({
        gravity:[0,-10,0]
        
    })

   //  var i = 40;

    // while(i--){

    add ({ 
        type:'plane',
        pos:[0, 0.001, 0],
        size:[200,0, 200],
        /*vertices:[
        40,0,-40,
        40,0,40,
        -40,0,-40,
        -40,15,40,
            
             
            
             
             
             
        ]*/
        /*vertices:[
            -40,-10,40,
             40,0,40,
             -40,0,-40,
             40,0,-40,
             
        ]*/
        
    })

//}

    /*add ({ 
        type:'mesh',
        pos : [0,0,0], // terrain position
        size : [200,30,200], // terrain size in meter
        sample : [64,64], // number of subdivision

        frequency : [0.016,0.05,0.2], // frequency of noise
        level : [1,0.2,0.05], // influence of octave
        expo: 3,

        friction: 0.5, 
        restitution: 0.0,

        vertices:[
             -40,10,-40,
             40,0,-40,
             40,0,40,
             -40,0,40
        ]
        //soft_cfm:0.000001
        //toTri: true,
    });

    /*add ({ 
        type:'terrain',
        name:'terra', 
        pos : [0,0,0], // terrain position
        size : [200,30,200], // terrain size in meter
        sample : [4,4], // number of subdivision

        frequency : [0.016,0.05,0.2], // frequency of noise
        level : [1,0.2,0.05], // influence of octave
        expo: 3,

        friction: 0.5, 
        restitution: 0.0,
        //soft_cfm:0.000001
        toTri: true,
        Revers: false,
    });*/

    var param = {
        
    }

    var i = 30;

    while(i--){
        add ({ type:'sphere', size:[1], pos:[Math.rand(-40,40),40,Math.rand(-40,40)], density:1, friction: 0.5, param:param });
        add ({ type:'box', size:[2], pos:[Math.rand(-40,40),40,Math.rand(-40,40)], density:1, friction: 0.5, param:param });
    }

    //view.update = update;

};

/*function update () {

    view.updateTerrain('terra');

}*/