

var ball = ( function () {

    'use strict';

    var PI90  = 1.570796326794896;
    var TwoPI = 6.283185307179586;



    var f = 1/60;
    var time = 0;
    var decal = 0.2;
    var speed = 0.01
    var mesh;
    var target;
    var targetS;
    var targetM;
    var radius = 10;

    var axis = new THREE.Vector3();
    var up = new THREE.Vector3(0, 1, 0);

    var start = new THREE.Vector3( 0, 0, 0 );
    var mid1 =  new THREE.Vector3( 0, 0, 0 );
    var mid2 =  new THREE.Vector3( 0, 0, 0 );
    var end = new THREE.Vector3( 50, 0, 0 );

    var curve;
    var curveMesh;

    var y_up = 190;
    var y_low = 0;

   // var speed = new THREE.Vector3( 0, 0, 0 );
    var position = new THREE.Vector3( 0, 200, 0 );
    var rotation = new THREE.Euler( 0, 0, 0 );
    var rotationSpeed = new THREE.Euler( 0, 0, 0 );
    var nextPos = new THREE.Vector3( 0, 0, 0 );
    var nextRotation = new THREE.Vector3( 0, 0, 0 );
    var gravity = new THREE.Vector3( 0, -9.8 / 60, 0 );

    ball = function () {  };

    ball.easeOutInQuad = function (t) { 

        var b = 0
        var c = 1
        var d = 1

        //if( t>0.4 && t <0.6) return t

        //else 
          //  return t <=.5 ? ball.Ease['sine-out'](2 * t) * 0.5 : ball.Ease['sine-in']((2 * (t - 0.5))) * 0.5 + 0.5
/*
        
    var ts=(t/=d)*t;
    var tc=ts*t;
    return b+c*(4*tc + -6*ts + 3*t);*/

        var ts=(t/=d)*t;
    var tc=ts*t;
    return b+c*(-1*tc*ts + 2.5*ts*ts + 1*tc + -4*ts + 2.5*t);
//}


            //return 0.5
    }

    ball.update = function(){

        time+=speed;




        if(time>=1){
            ball.makeBounce();
            time=0;

            nextRotation.x = view.randRange(-Math.PI, Math.PI);
           //nextRotation.y = view.randRange(-Math.PI, Math.PI);
            nextRotation.z = view.randRange(-Math.PI, Math.PI);

            rotationSpeed.x = ( nextRotation.x - rotation.x ) * f;
           // rotationSpeed.y = ( nextRotation.y - rotation.y ) * f;
            rotationSpeed.z = ( nextRotation.z - rotation.z ) * f;
        }

        var t = ball.easeOutInQuad( time );

        //var tangent = curve.getTangentAt( t ).normalize();

        //axis.crossVectors(up, tangent).normalize();

        //var radians = Math.acos(up.dot(tangent));

       // mesh.quaternion.setFromAxisAngle(axis, radians)

       

        rotation.x += rotationSpeed.x;
       // rotation.y += rotationSpeed.y;
        rotation.z += rotationSpeed.z;

        

        position = curve.getPointAt( t );
        mesh.position.copy(position);
        mesh.rotation.copy(rotation);

        

        //var tt = Date.now();
        //var looptime = 20 * 1000;
      // = time;// = ball.Ease['sine-in'](time);// * tt///( tt % looptime ) / looptime;

        //t = ball.Ease['cubic-in-out'](time);

        

       //if(time<0.5) t = ball.Ease['quad-out'](time*2) * 0.5;
       //if(time>0.5) t = 0.5 + ball.Ease['quad-in']((time*2)-1)* 0.5 ;


        
       // 




       // var p = this.curve( )

        /*

        //speed.add( gravity );

        rotation.x += rotationSpeed.x;
        rotation.y += rotationSpeed.y;
        rotation.z += rotationSpeed.z;

        
        speed.multiplyScalar( 0.995 );

        position.add(speed);

        if( position.y >= y_up + radius ){ // top

            position.y = y_up + radius;
            speed.y = (y_low - y_up ) * f;

        }

        if( position.y <= y_low + radius ){ // bounce

            position.y = y_low + radius;

            speed.y = (y_up - y_low ) * f;
            //speed.y *= -1;

            nextPos.x = view.randRange(-50, 50);
            nextPos.z = view.randRange(-50, 50);

            nextRotation.x = view.randRange(-Math.PI, Math.PI);
            nextRotation.y = view.randRange(-Math.PI, Math.PI);
            nextRotation.z = view.randRange(-Math.PI, Math.PI);



            target.position.copy( nextPos );

            //console.log( time );

            speed.x = ( nextPos.x - position.x ) * f;
            speed.z = ( nextPos.z - position.z ) * f;


            rotationSpeed.x = ( nextRotation.x - rotation.x ) * f;
            rotationSpeed.y = ( nextRotation.y - rotation.y ) * f;
            rotationSpeed.z = ( nextRotation.z - rotation.z ) * f;

            //speed.add( nextPos.clone().sub(position.clone()).multiplyScalar(time/60) );
            time = 0;
        }

        mesh.position.copy(position);
        mesh.rotation.copy(rotation);*/



    };

    /*ball.curve = function( start , control, end, T ){

        var x = Math.pow(1 - T, 2) * start.x + 2 * (1 - T) * T * control.x + Math.pow(T, 2) * end.x;
        var y = Math.pow(1 - T, 2) * start.y + 2 * (1 - T) * T * control.y + Math.pow(T, 2) * end.y;
        var z = Math.pow(1 - T, 2) * start.z + 2 * (1 - T) * T * control.z + Math.pow(T, 2) * end.z;

        return { x: x, y: y, z:z };

    };*/

    ball.makeBounce = function( x, y, z, top){

        top = top || view.randRange(100, 200);

        start.copy(end);
        start.y -= radius;

        targetS.position.copy(start);

        end.x = x || view.randRange(-100, 100);
        end.y = y || 0 //view.randRange( 0, 50);
        end.z = z || view.randRange(-100, 100);

        target.position.copy(end);

        

        var middle = end.clone().add(start).multiplyScalar(0.5);

        targetM.position.copy(middle);
        targetM.position.y = top



        end.y += radius;
        start.y += radius;


        


        mid1 = start.clone().add(middle).multiplyScalar(0.5);//.multiplyScalar(0.25);
        mid2 = middle.clone().add(end).multiplyScalar(0.5);//.multiplyScalar(0.75);

        mid1.y = mid2.y = top*1.25;

        curve.v0.copy( start );
        curve.v1.copy( mid1 );
        curve.v2.copy( mid2 );
        curve.v3.copy( end );

        curveMesh.geometry.vertices = curve.getPoints( 60 );
        curveMesh.geometry.verticesNeedUpdate = true;

    };

    ball.updateCurveGeo = function(){



    };

    ball.init = function(){

        var canvas = document.createElement( 'canvas' );
        canvas.width = canvas.height = 128;
        var ctx = canvas.getContext( '2d' );


        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0,0,128,128);

        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0,51,128,25);


        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;


        mesh = new THREE.Mesh( new THREE.SphereBufferGeometry( radius, 20, 20 ), new THREE.MeshLambertMaterial({map:texture}));
        view.getScene().add(mesh);

        mesh.receiveShadow = true;
        mesh.castShadow = true;

        mesh.position.copy(position);

        var g = new THREE.PlaneBufferGeometry( 10, 10 );
        g.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI * 0.5 ));
        target = new THREE.Mesh( g, new THREE.MeshLambertMaterial({}));
        view.getScene().add(target);

        targetS = new THREE.Mesh( g, new THREE.MeshLambertMaterial({}));
        view.getScene().add(targetS);

        targetM = new THREE.Mesh( g, new THREE.MeshLambertMaterial({}));
        view.getScene().add(targetM);


        view.setExtraUpdate( ball.update );

        mid1 = end.clone().sub(start).multiplyScalar(0.25);
        mid2 = end.clone().sub(start).multiplyScalar(0.75);

        mid1.y = mid2.y = y_up;



        curve = new THREE.CubicBezierCurve3(
            start,
            mid1,
            mid2,
            //new THREE.Vector3( -10, 0, 0 ),
          //  new THREE.Vector3( -5, 15, 0 ),
           // new THREE.Vector3( 20, 15, 0 ),
            //new THREE.Vector3( 10, 0, 0 )
            end
        );

        var geometry = new THREE.Geometry();
        geometry.vertices = curve.getPoints( 60 );

        var material = new THREE.LineBasicMaterial( { color : 0x00FF00 } );

        // Create the final Object3d to add to the scene
        curveMesh = new THREE.Line( geometry, material );

        view.getScene().add( curveMesh );

        console.log(curve)





    };

    return ball;

})();