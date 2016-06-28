THREE.CapsuleBufferGeometry = function ( Radius, Height, SRadius, H ) {

    THREE.BufferGeometry.call( this );

    this.type = 'CapsuleBufferGeometry';

    var radius = Radius || 1;
    var height = Height || 1;

    var sRadius = SRadius || 12;
    var sHeight = ~~ sRadius * 0.5;// SHeight || 6;
    var h = H || 1;
    var o0 = Math.PI * 2;
    var o1 = Math.PI * 0.5;
    var g = new THREE.Geometry();
    var m0 = new THREE.CylinderGeometry(radius, radius, height, sRadius, h, true);
    var m1 = new THREE.SphereGeometry(radius, sRadius, sHeight, 0, o0, 0, o1);
    var m2 = new THREE.SphereGeometry(radius, sRadius, sHeight, 0, o0, o1, o1);
    var mtx0 = new THREE.Matrix4().makeTranslation(0,0,0);
    var mtx1 = new THREE.Matrix4().makeTranslation(0, height*0.5,0);
    var mtx2 = new THREE.Matrix4().makeTranslation(0, -height*0.5,0);
    g.merge( m0, mtx0);
    g.merge( m1, mtx1);
    g.merge( m2, mtx2);
    g.mergeVertices();

    this.fromGeometry( g );

};

THREE.CapsuleBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.CapsuleBufferGeometry.prototype.constructor = THREE.CapsuleBufferGeometry;