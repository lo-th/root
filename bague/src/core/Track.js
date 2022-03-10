import * as THREE from 'three';
import * as TWEEN from 'tween';
import { root } from '../root.js';

import { math, SimplexNoise } from './math.js'

export class Track extends THREE.Group {

    constructor() {

        super()

        this.pos = new THREE.Vector3()
        this.upscale = { x:5, y:5, n:0.1 }

        this.perlin = new SimplexNoise()

        this.decal = 10
        this.size = 200
        this.divid = 300
        this.curveDivid = 20
        this.w = 3

        this.tmp = new THREE.Vector3()

        this.point = new THREE.Vector3()
        this.prevPoint = new THREE.Vector3()

        this.forward = new THREE.Vector3()
        this.right = new THREE.Vector3()
        this.up = new THREE.Vector3()

        this.tang = new THREE.Vector3();

        this.p1 = new THREE.Vector3()
        this.p2 = new THREE.Vector3()

        this.quat = new THREE.Quaternion()

        this.dummy = new THREE.Object3D()
        this.v = new THREE.Vector3();

        this.init()

        this.renderOrder = 1

    }

    init() {

        
        const g = new THREE.BufferGeometry();
        g.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( this.divid * 3 ), 3 ) );

        this.points = []

        let i = this.curveDivid, n = 0, d = this.size / this.curveDivid, x=0, y=0
        while(i--){

            this.points.push( new THREE.Vector3(x,y,d*n) )
            n++

        }


        this.curve = new THREE.CatmullRomCurve3( this.points );
        this.curve.curveType = 'chordal';
        this.curve.mesh = new THREE.Line( g, new THREE.LineBasicMaterial( { color: 0x0000ff, opacity: 1 } ) );

        

        //this.add( this.curve.mesh );

        this.map = new THREE.TextureLoader().load('./assets/textures/sheen.jpg', this.upmap )
        this.normal = new THREE.TextureLoader().load('./assets/textures/sheen_n.jpg', this.upmap2 )

        this.mat = new THREE.MeshPhysicalMaterial({ 
            side: THREE.DoubleSide,
            metalness:0.8, roughness:0.2,
            color:0x7e6fcf,
            //map:this.map,
            normalMap:this.normal,

            sheenColor:0x5141a2,
            sheenColorMap:this.map,
            sheenRoughnessMap:this.normal,
            //depthTest:false,
            //depthWrite:false,
        })

        this.mat.color.convertSRGBToLinear()
        this.mat.sheenColor.convertSRGBToLinear()
        this.mat.normalScale.set(0.1,0.1)
        this.mat.sheen = 2

        root.materials.push(this.mat)
        
        this.matDebug = new THREE.MeshBasicMaterial({ color:0x880000, wireframe:true })

        this.geo = new THREE.PlaneBufferGeometry( this.w*2, this.size, 1, this.divid-1 )
        this.geo.rotateX( -Math.PI*0.5 ) 
        this.geo.translate( 0,0, this.size*0.5)

        //console.log(this.geo.attributes.position)

        //this.debug = new THREE.Mesh( this.geo, this.matDebug )
        //this.add( this.debug )

        this.mesh = new THREE.Mesh( this.geo, this.mat )
        this.add( this.mesh )

        this.mesh.receiveShadow = true


        this.draw()

    }

    getMatrix( t, o = {} ){

        // t range 0 _ 1 

        let p = this.getPointAt(t)
        let q = this.getQuat(t)

        this.dummy.position.set( o.x || 0, o.y || 0, o.z || 0 ).applyQuaternion( q ).add( p )
        if( o.look ) this.dummy.lookAt( this.v.copy( p ).sub( this.getTangentAt(t) ) );
        if( o.incRy ) this.dummy.rotation.y += o.incRy
        if( o.incRx ) this.dummy.rotation.x += o.incRx
        if( o.incRz ) this.dummy.rotation.z += o.incRz

        if( o.rx ) this.dummy.rotation.x = o.rx
        if( o.rz ) this.dummy.rotation.z = o.rz
        this.dummy.updateMatrix()
        return this.dummy.matrix

    }

    getNoise( x, y ){

        return this.perlin.noise( x * this.upscale.n, y * this.upscale.n, 0 )

    }

    getPointAt( t ) {

        this.curve.getPoint( t, this.tmp )
        return this.tmp

    }

    getTangentAt( t ) {

        const delta = 0.0001;
        const t2 = Math.max( 0, t - delta );
        const t1 = Math.min( 1, t + delta );
        return this.tang.copy( this.getPointAt( t2 ) ).sub( this.getPointAt( t1 ) ).normalize()

    }

    getQuat( t ) {

        let delta = 0.0001
        const t1 = Math.max( 0, t - delta );

        this.point.copy( this.getPointAt( t ) )
        this.prevPoint.copy( this.getPointAt( t1 ) )

        this.up.set( 0, 1, 0 )
        this.forward.subVectors( this.point, this.prevPoint ).normalize()
        this.right.crossVectors( this.up, this.forward ).normalize()
        this.up.crossVectors( this.forward, this.right )

        const angle = Math.atan2( this.forward.x, this.forward.z )
        return this.quat.setFromAxisAngle( this.up, angle )

    }

    move( delta ){

        this.pos.z += root.speed * delta 

        this.map.offset.y -= root.speed * delta
        this.normal.offset.y -= root.speed * delta
        this.draw()

    }

    draw() {

        let i, n, r, t, p, q, v

        i = this.curveDivid
        n = 0

        while(i--){

            v = this.points[n]

            v.x = this.getNoise( this.pos.z+n, 50 ) * this.upscale.x
            v.y = this.getNoise( this.pos.z+n, 0 ) * this.upscale.y
            n++
        }

        const geo = this.geo.attributes.position
        const pos = this.curve.mesh.geometry.attributes.position;

        i = this.divid
        n = 0

        while(i--){

            t = n / ( this.divid - 1 )
            p = this.getPointAt( t )
            q = this.getQuat(t)

            pos.setXYZ( n, p.x, p.y, p.z )

            r = n*2

            this.p1.set( -this.w, 0, 0 ).applyQuaternion( q ).add( p )
            this.p2.set( this.w, 0, 0 ).applyQuaternion( q ).add( p )

            //this.p1.set( -this.w, 0, 0 ).add( p )
            //this.p2.set( this.w, 0, 0 ).add( p )

            geo.setXYZ( r, this.p1.x, this.p1.y, this.p1.z )
            geo.setXYZ( r+1, this.p2.x, this.p2.y, this.p2.z )

            /*

            r = n * 6 

            vr[r] = p.x-this.w;
            vr[r+1] = p.y
            vr[r+2] = p.z

            vr[r+3] = p.x+this.w
            vr[r+4] = p.y
            vr[r+5] = p.z

            */

            n++

        }

        pos.needsUpdate = true;

        geo.needsUpdate = true;
        this.geo.computeVertexNormals()

    }


    upmap (t){

        t.encoding = THREE.sRGBEncoding;
        t.flipY = false;
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(1,20)

    }

    upmap2 (t){

        //t.encoding = THREE.sRGBEncoding;
        t.flipY = false;
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(1,20)

    }

    

    

}