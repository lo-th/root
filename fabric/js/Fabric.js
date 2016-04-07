"use strict";
/**
 * Created by alexey on 18.11.15.
 */

THREE.Fabric = function () {

    this.iks = [];

};

THREE.Fabric.prototype = {

    constructor: THREE.Fabric,

    toRad : function( v ){ return v * 0.0174532925199432957; },

    add: function( target, tolerance, mesh, links, iteration, minAngle, maxAngle ){

        var bones = mesh.skeleton.bones;

        var lnk = [];

        for ( var k = 0, kl = links.length; k < kl; k++ ) {

            lnk.push( bones[ links[ k ] ].getWorldPosition().clone().toArray() )

        }



        var ik = {

            mesh : mesh,
            target : target, // vector3
            tolerance : tolerance || 0.3, 
            links : links,
            lnk:lnk,
            iteration : iteration || 1,
            minAngle : this.toRad(minAngle) ,
            maxAngle : this.toRad(maxAngle)

        };



        this.iks.push(ik);

    },

    update:function(){

        var tmpLink;
        var tmpTarget;
        var bones;


        for ( var i = 0, lng = this.iks.length; i < lng; i++ ) {

            var ik = this.iks[ i ];

            bones = ik.mesh.skeleton.bones;
            var links = ik.links;

            tmpTarget = ik.target.getWorldPosition().toArray();

            /*tmpLink = [];

            for ( var k = 0, kl = links.length; k < kl; k++ ) {

                tmpLink.push( bones[ links[ k ] ].getWorldPosition().toArray() )

            }*/

            //console.log(tmpLink)

            var nPos = this.algorithm( ik.lnk, tmpTarget, ik.tolerance );

            //console.log(nPos)

            for ( var k = 0, kl = links.length; k < kl; k++ ) {

               //bones[ links[ k ] ].lookAt(new THREE.Vector3(nPos[k-1][0], nPos[k-1][1], nPos[k-1][2]))
                var d = [0,0,0]
                if(k>0){
                   d = nPos[k-1];
                }

                bones[ links[ k ] ].position.x = nPos[k][0] - d[0];
                bones[ links[ k ] ].position.y = nPos[k][1] - d[1];
                bones[ links[ k ] ].position.z = nPos[k][2] - d[2];

             //  bones[ links[ k ] ].updateMatrixWorld( true );

                //bones[ links[ k ] ].matrix.setPosition(nPos[k][0], nPos[k][1], nPos[k][2])

                //bones[ links[ k ] ].matrixAutoUpdate = false;


               // var ar = nPos[k];
                //if(k===0) console.log(ar)
                //bones[ links[ k ] ].position.fromArray( nPos[k-1] );//set( ar[0],  ar[1], ar[2] );
                //bones[ links[ k ] ].updateMatrix();//( true );

                //tmpLink.push( .toArray() )

            }




        }

    },

    log:function(){

    },




    algorithm : function(initialPositions, TargetPoint, tolerance) {
        // Initialization of variables
        // node pn = [[x,y,z]]
         // newArrayOfInitialPositions = [new Float32Array(arrayOfInitialPositions.length)[new Float32Array(TargetPoint.length)]],
            // newArrayOfInitialPositions = new Float32Array(arrayOfInitialPositions.length),
        var distBeetweenJoints = [], // the distance between mating units (the length of the links from the site to the nearest unit)
            distBeetweenJointsAndTarget = [], // the ratio of distances from node to node and from the node to the goal
            TargetPoint = TargetPoint, // aim the target point t = [x,y,z]
            distBeetweenStartPointAndTarget, // the distance between the starting node and the target, the target point
            lambdaDistance = [], // respect
            tol = tolerance, // the maximum distance between the end node and the target
            arrayOfInitialPositions = initialPositions,
            //if the goal is attainable, the unit will keep the zero position
            nullPoint = initialPositions[0].slice(), // slice without parameters array copies
            sumOfInitialDistances = 0; // variable for the entire distance between the nodes
        // The function calculates the distance between 2 points
        // The distance between 2 points calc. according to the formula
        // (x1-x2)^2+(y1-y2)^2+(z1-z2)^2
        function distBetweenPoints(point_1, point_2) {

            var x = Math.pow((point_1[0] - point_2[0]), 2);
            var y = Math.pow((point_1[1] - point_2[1]), 2);
            var z = Math.pow((point_1[2] - point_2[2]), 2);

            return Math.sqrt((x + y + z))

        }

        // We calculate the length between adjacent nodes
        // method returns an array .length number of elements
        for (var i = 0, len = arrayOfInitialPositions.length; i < len - 1; i++) {
            distBeetweenJoints[i] = distBetweenPoints(arrayOfInitialPositions[i], arrayOfInitialPositions[i + 1]);
            this.log("Distance between points ", i, " и ", (i + 1), " = ", distBeetweenJoints[i]);
        }
        // the distance between the starting node and the target point
        distBeetweenStartPointAndTarget = distBetweenPoints(arrayOfInitialPositions[0], TargetPoint);
        this.log("The distance between the starting point and the destination node " + distBeetweenStartPointAndTarget);

        // Addition of distances between nodes
        sumOfInitialDistances = distBeetweenJoints.reduce(function (sum, current) {
            return sum + current
        });
        this.log("The total distance between nodes: " + sumOfInitialDistances);
        // Compare the total distance between the nodes (overall length) and the distance to the target
        // if the goal is unattainable, something as close as possible to it
        // If not, the closer to it, until we reach the farthest
        // given variable tolerance
        if (distBeetweenStartPointAndTarget > sumOfInitialDistances) {
            var newArrayOfInitialPositions = arrayOfInitialPositions;
            this.log("Celje not reachable!");
            for (var i = 0, len = arrayOfInitialPositions.length; i < (len - 1); i++) {

                // We find the distance r[i]  between the target node t and p[i]
                distBeetweenJointsAndTarget[i] = distBetweenPoints(arrayOfInitialPositions[i], TargetPoint);
                //The ratio of the distance between the nodes and the mating distance between the node and the target
                lambdaDistance[i] = distBeetweenJoints[i] / distBeetweenJointsAndTarget[i];

                // start calculating the first and second terms
                // for convenience formula was divided into two phases - the function:
                // the calculation of the first term and the second
                var firstStep = arrayOfInitialPositions[i].map(function (item) {
                    return (item * (1 - lambdaDistance[i]))
                });
                var secondStep = TargetPoint.map(function (item) {
                    return item * lambdaDistance[i]
                });
                this.log("firstStep ", firstStep);
                this.log("secondStep ", secondStep);
                // calculating a first end and second terms
                for (var j = 0; j < firstStep.length; j++) {
                    // A new node for the position as close to the final goal
                    this.log(firstStep[j] + secondStep[j]);
                    var sumOfFirstStepAndSecond = firstStep[j] + secondStep[j];
                    newArrayOfInitialPositions[i + 1][j] = sumOfFirstStepAndSecond;
                }
            }
            arrayOfInitialPositions.forEach(function (item, i) {
                this.log("Old position Node_" + i + " = " , item);
            }.bind(this));
            newArrayOfInitialPositions.forEach(function (item, i) {
                this.log("The new position Node_" + i + " = " , item);
            }.bind(this));
            //the result of the algorithm - an array of new coordinate values, the algorithm does not perform any own permutations, only miscalculation
            return newArrayOfInitialPositions;
        }
        else {
            var count = 1;
            this.log("Celje attainable!");

            var DIFa = distBetweenPoints(arrayOfInitialPositions[arrayOfInitialPositions.length - 1], TargetPoint);
            this.log("DIFa = " + DIFa);
            do {
                // Step 1: direct follow
                // arrayOfInitialPositions put an end node [arrayOfInitialPositions.length] at the target position
                arrayOfInitialPositions[arrayOfInitialPositions.length - 1] = TargetPoint;
                for (var len = arrayOfInitialPositions.length, i = (len - 2); i >= 0; i--) {
                    // We find the distance r'i] between the target node t and p [i]
                    distBeetweenJointsAndTarget[i] = distBetweenPoints(arrayOfInitialPositions[i + 1], arrayOfInitialPositions[i]);
                    // The ratio of the distance between the nodes and the mating distance between the node and the target
                    lambdaDistance[i] = distBeetweenJoints[i] / distBeetweenJointsAndTarget[i];
                    //this.log(lambdaDistance[i]);
                    // start calculating the first and second terms
                    // for convenience formula was divided into two phases - the function:
                    // the calculation of the first term and the second
                    var firstStep = arrayOfInitialPositions[i].map(function (item, j, array) {
                        return (arrayOfInitialPositions[i + 1][j] * (1 - lambdaDistance[i]))
                    });
                    var secondStep = arrayOfInitialPositions[i].map(function (item, j) {
                        return (item * lambdaDistance[i])
                    });
                    // calculating a first end and second terms
                    for (var j = 0; j < firstStep.length; j++) {
                        // A new node for the position as close to the final goal
                        var sumOfFirstStepAndSecond = firstStep[j] + secondStep[j];
                        arrayOfInitialPositions[i][j] = sumOfFirstStepAndSecond;
                    }
                }

                // Step 2: Reverse follow
                // Restoring the root element of its position
                arrayOfInitialPositions[0] = nullPoint;
                this.log(arrayOfInitialPositions[0]);
               // console.dir(nullPoint);
                this.log(arrayOfInitialPositions[0]);
                for (var i = 0, len = arrayOfInitialPositions.length - 1; i < (len - 1); i++) {
                    // We find the distance r'i] between the target node t and p [i]
                    distBeetweenJointsAndTarget[i] = distBetweenPoints(arrayOfInitialPositions[i + 1], arrayOfInitialPositions[i]);
                    //this.log(i,distBeetweenJointsAndTarget[i],"\n");
                    // he ratio of the distance between the nodes and the mating distance between the node and the target
                    lambdaDistance[i] = distBeetweenJoints[i] / distBeetweenJointsAndTarget[i];

                    // start calculating the first and second terms
                    // for convenience formula was divided into two phases - the function:
                    // the calculation of the first term and the second
                    var firstStep = arrayOfInitialPositions[i].map(function(item){ return (item * (1 -lambdaDistance[i])) });
                    //this.log(firstStep);
                    var secondStep = arrayOfInitialPositions[i].map(function(item,j,arr){ return (arrayOfInitialPositions[(i + 1)][j] * lambdaDistance[i]) });
                    //this.log(secondStep);
                    // calculating a first end and second terms
                    for(var j = 0; j < firstStep.length; j++){
                        // A new node for the position as close to the final goal
                        //this.log("Hello !, this amount firstStep и secondStep",firstStep[j] + secondStep[j]);
                        var sumOfFirstStepAndSecond = firstStep[j] + secondStep[j];
                        arrayOfInitialPositions[i+1][j] = sumOfFirstStepAndSecond;
                    }
                }
                this.log("iterations in the solution of the problem",count++);
                DIFa = distBetweenPoints(arrayOfInitialPositions[arrayOfInitialPositions.length - 1], TargetPoint);
                //this.log(DIFa);
            }
            while (DIFa > tol);
        }
        return arrayOfInitialPositions;

    }


}
