import * as THREE from 'three';
import * as TWEEN from 'tween';
import { root } from '../root.js';

import { math, SimplexNoise } from './math.js'

export class Track extends THREE.Group {

    constructor() {

        super()

        this.color = 0x435b62

        this.repeat = 50//36
        this.incY = this.repeat/20

        this.pos = new THREE.Vector3()
        this.upscale = { x:5, y:5, n:0.1 }
        //this.upscale = { x:0, y:0, n:0.1 }

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

    setColor(c){

        this.mat.color.setHex( c ).convertSRGBToLinear();
        this.mat.sheenColor.setHex( c ).convertSRGBToLinear();
    
    }

    initAlphaMap(){

        const canvas = document.createElement( 'canvas' )
        canvas.width = 3
        canvas.height = 100//100
        //canvas.style.cssText = 'position:absolute; margin:0; padding:0; top:10px; left:10px;'
        const ctx = canvas.getContext( '2d' )

        ctx.clearRect(0,0,3,100);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,3,100);

        // hole
        ctx.fillStyle = '#000000';
        ctx.fillRect(1,50,1,1);
        ctx.fillRect(1,60,1,1);
        ctx.fillRect(0,90,1,1);
        ctx.fillRect(0,10,1,1);
        ctx.fillRect(2,14,1,1);
        //ctx.fillRect(0,0,3,50)

        const t = new THREE.CanvasTexture( canvas )
        

        t.minFilter = t.magFilter = THREE.NearestFilter

        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(1,1)
        t.needsUpdate = true;

        this.alphaMap = t

    }

    init() {

        this.initAlphaMap()
        
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
        this.map = new THREE.TextureLoader().load('./assets/textures/track.png', this.upmap.bind(this) )
        this.normal = new THREE.TextureLoader().load('./assets/textures/track_n.png', this.upmap2.bind(this) )
        this.sheen = new THREE.TextureLoader().load('./assets/textures/sheen.jpg', this.upmap.bind(this) )

        this.mat = new THREE.MeshPhysicalMaterial({ 
            side: THREE.DoubleSide,
            metalness:0.6, 
            roughness:0.5,
            color:this.color,
            map:this.map,

            normalMap:this.normal,

            alphaMap:this.alphaMap,
            aoMap:this.alphaMap,
            //transparent:true,
            //alphaToCoverage:true,
            //premultipliedAlpha:true,

            sheenColor:this.color,
            sheenRoughness:1,
            sheenColorMap:this.sheen,
            sheenRoughnessMap:this.sheen,
            //depthTest:false,
            //depthWrite:false,
        })

        this.mat.normalScale.set(0.2,0.2)

        this.mat.alphaTest = 0.5

        this.mat.color.convertSRGBToLinear()
        this.mat.sheenColor.convertSRGBToLinear()

        this.mat.sheen = 0.6


        this.mat.onBeforeCompile = function ( shader ) {

            //shader.uniforms.decalY = { value: 0 };
            //shader.vertexShader = 'uniform float decalY;\n' + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <uv2_pars_vertex>', `
                attribute vec2 uv2;
                varying vec2 vUv2;
                uniform mat3 uv2Transform;
                `
            )

            shader.vertexShader = shader.vertexShader.replace(
                '#include <uv2_vertex>', `
                vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
                `
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <uv2_pars_fragment>', `
                varying vec2 vUv2;
                `
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <alphamap_fragment>', `
                #ifdef USE_ALPHAMAP
                    diffuseColor.a *= texture2D( alphaMap, vUv2 ).g;
                #endif
                `
            )

            shader.fragmentShader = shader.fragmentShader.replace('#include <aomap_pars_fragment>', `` )
            shader.fragmentShader = shader.fragmentShader.replace('#include <aomap_fragment>', `` )

            //self.mat.userData.shader = shader;
            //this.userData.shader = shader;

        }

        root.materials.push(this.mat)
        
        this.matDebug = new THREE.MeshBasicMaterial({ color:0x880000, wireframe:true })

        this.geo = new THREE.PlaneBufferGeometry( this.w*2, this.size, 1, this.divid-1 )
        this.geo.rotateX( -Math.PI*0.5 ) 
        this.geo.translate( 0,0, this.size*0.5)

        this.geo.setAttribute( 'uv2', new THREE.Float32BufferAttribute( this.geo.attributes.uv.array, 2 ) );

        //console.log(this.geo.attributes.position)

        //this.debug = new THREE.Mesh( this.geo, this.matDebug )
        //this.add( this.debug )

        this.mesh = new THREE.Mesh( this.geo, this.mat )
        this.add( this.mesh )

        this.mesh.receiveShadow = true


        this.draw()

    }

    upmap (t){

        t.encoding = THREE.sRGBEncoding;
        //t.flipY = false;
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(1,this.repeat)

    }

    upmap2 (t){

        //t.flipY = false;
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(1,this.repeat)

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

        this.map.offset.y -= root.speed * delta * this.incY
        this.normal.offset.y -= root.speed * delta * this.incY
        this.sheen.offset.y -= root.speed * delta * this.incY

        this.alphaMap.offset.y -= root.speed * delta * (0.05)//0.05//this.incY

        //const shader = this.mat.userData.shader;
        //if( shader ) shader.uniforms.time.value = performance.now() / 1000;

        
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


    

    

    

}

/*
Bleu Foncé : 191B2E
Bleu Moyen : 1E6781
Bleu Clair : 5E94A1
Or : C9BC98

FBF4D3
*/