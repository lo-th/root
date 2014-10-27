'use strict';

var CarGame = {};

CarGame.G = 9.8;
CarGame.DRAWABLE = 1;
CarGame.RUNABLE = 2;
CarGame.MOVABLE = 4;

CarGame.Engine = function(a, b, c) {
    this.G = 9.8;
    this.carOptions = c;
    this.current = 1;
    this.applyCar = b;
    this.car = new CarGame.ArcadeCar();
    this.car.init(this, { x: 0, y: 0 }, 0);
    this.pre_init(a);
    this.setOptions();
}

CarGame.Engine.prototype = {
    constructor: CarGame.Engine,
    pre_init : function (a) {
        this.canvas = a;
        this.init_int();
        var b = this;
    },
    init_int : function () {
        this.m_ctx = this.canvas.getContext("2d");
        this.m_double_buffering ? (this.canvasBuffer = document.createElement("canvas"), this.canvasBuffer.width = this.canvas.width, this.canvasBuffer.height = this.canvas.height, this.m_buf_ctx = this.canvasBuffer.getContext("2d")) : this.m_buf_ctx = this.m_ctx;
        this.m_ctx_ex = new CarGame.ContextEx(this.m_buf_ctx, this.canvas.width, this.canvas.height);
        this.m_last_tick = (new Date).getTime();
    },
    step : function (k) {
        var a = (new Date).getTime(), b = (a - this.m_last_tick) / 1E3;
        if (isNaN(b) || 0.1 < b) b = 0.1;
        this.m_last_tick = a;
        this.process_keys(b, k);
        this.run(b);
        this.m_ctx_ex.run(b);
        this.draw(b);
        this.m_double_buffering && this.m_ctx.drawImage(this.canvasBuffer, 0, 0)
    },
    setOptions : function(c){
        if(c)this.carOptions = c;
        switch (this.carOptions.drive) {
            case 'RWD': this.car.set_drive(false, true); break;
            case 'FWD': this.car.set_drive(true, false); break;
            case 'AWD': this.car.set_drive(true, true); break;
        }
        this.car.abs = this.carOptions.abs;
        this.car.tcs = this.carOptions.tcs;
        this.car.steer_control = this.carOptions.steering;
    },
    drive_val : function (a, b, c) {
        if (Math.abs(a - b) < c) return a;
        b += (0 < a - b ? 1 : -1) * c;
        return CarGame.Math2.Clamp(b, -1, 1);
    },
    process_keys : function (a, k) {
        this.car.hand_brake = !1;
        var b = 0;
        k[0] && (b = 1);
        k[1] && (b -= 1);
        this.car.traction = this.drive_val(b, this.car.traction, 2 * a);
        b = 0;
        k[2] && (b = 1);
        k[3] && (b -= 1);
        this.car.steering = this.drive_val(b, this.car.steering, 4 * a);
        k[5] && (this.car.hand_brake = !0);
        this.car.strafe = this.drive_val(0, this.car.strafe, 4 * a);
    },
    change : function(n){
        if(this.current == n) return;
        var new_car = null;
        if (n==1) new_car = new CarGame.ArcadeCar();
        if (n==3) new_car = new CarGame.Hover();
        //if (n==4) new_car = new CarGame.Mech();

        if (new_car != null) {
            new_car.init(this, this.car.pos, this.car.angle);
            this.car = new_car;
            this.current = n;
            if (n==1) this.setOptions();
        }
    },
    run : function (a) {
        this.car.run(a);
        document.getElementById("debug").innerHTML = "Speed: " + Math.round(3.6 * this.car.speed) + " km/h";
        this.applyCar(this.car.pos.x, this.car.pos.y, this.car.z, this.car.angle, 50 + this.car.speed * this.car.speed * 0.25, this.car.steer_angle || 0, this.car.speed * (this.car.direction || 1));
        this.m_ctx_ex.m_camera.x = this.car.pos.x;
        this.m_ctx_ex.m_camera.y = this.car.pos.y;
        this.m_ctx_ex.m_camera.z = 100;
    },
    draw : function (a) {
        this.m_ctx_ex.draw_grid();
        this.car.draw(a);
    }
}

// -------------------------- ControllableObject

CarGame.ControllableObject = function () {
    this.pos = new CarGame.Vec2(0, 0);
    this.angle = 0
    this.z = 0;
    this.engine = null;
    this.strafe = this.steering = this.traction = 0;
    this.hand_brake = !1;
    this.flags = CarGame.DRAWABLE | CarGame.RUNABLE | CarGame.MOVABLE;
}

CarGame.ControllableObject.prototype = {
    constructor: CarGame.GameObject,
    init : function (a, b, c) {
        this.engine = a;
        this.pos.SetV(b);
        this.angle = c
    },
    run : function (a) {},
    draw : function (a) {}
}

// -------------------------- Game Context

CarGame.ContextEx = function (a, b, c) {
    this.m_ctx = a;
    this.m_width = b;
    this.m_height = c;
    this.m_camera = { x: 0, y: 0, z: 50, FOV: 0.5 };
    this.m_zoom = 1;
    this.m_trans = new CarGame.Trans2({ x: 0, y: 0 }, 0, null);
}

CarGame.ContextEx.prototype = {
    constructor: CarGame.ContextEx,
    set_trans : function (a) {
        this.m_trans.SetT(a)
    },
    run : function (a) {
        this.m_zoom = this.m_width / (this.m_camera.z * this.m_camera.FOV)
    },
    world2screen : function (a) {
        a = { x: a.x - this.m_camera.x, y: a.y - this.m_camera.y };
        a.x *= this.m_zoom;
        a.y *= -this.m_zoom;
        a.x += 0.5 * this.m_width;
        a.y += 0.5 * this.m_height;
        return a
    },
    screen2world : function (a) {
        a = { x: a.x - 0.5 * this.m_width, y: a.y - 0.5 * this.m_height };
        a.x /= this.m_zoom;
        a.y /= -this.m_zoom;
        a.x += this.m_camera.x;
        a.y += this.m_camera.y;
        return a
    },
    draw_poly : function (a, b, c) {
        this.m_ctx.beginPath();
        var d = this.m_trans.TransFromV(a[0]), d = this.world2screen(d);
        this.m_ctx.moveTo(d.x + 0.5, d.y + 0.5);
        for (var e = 1; e < a.length; ++e) d = this.m_trans.TransFromV(a[e]), d = this.world2screen(d), this.m_ctx.lineTo(d.x + 0.5, d.y + 0.5);
        null != b && (this.m_ctx.strokeStyle = b, this.m_ctx.stroke());
        null != c && (this.m_ctx.fillStyle = c, this.m_ctx.fill())
    },
    draw_circle : function (a, b, c, d) {
        this.m_ctx.beginPath();
        a = this.m_trans.TransFromV(a);
        a = this.world2screen(a);
        this.m_ctx.arc(a.x + 0.5, a.y + 0.5, b * this.m_zoom, 0, 2 * Math.PI, !1);
        null != c && (this.m_ctx.strokeStyle = c, this.m_ctx.stroke());
        null != d && (this.m_ctx.fillStyle = d, this.m_ctx.fill())
    },
    draw_grid : function () {
        this.m_ctx.fillStyle = "#FFFFFF";
        this.m_ctx.fillRect(0, 0, this.m_width, this.m_height);
        var a = { x: 0, y: 0 },
            a = this.screen2world(a),
            b = { x: this.m_width, y: this.m_height },
            b = this.screen2world(b);
        this.m_ctx.lineWidth = 1;
        var c;
        c = function (a) {
            return 0 == a ? "#000000" : 0 == a % 1E3 ? "#606060" : 0 == a % 100 ? "#909090" : 0 == a % 10 ? "#C0C0C0" : "#F0F0F0"
        };
        for (var d = 15 > this.m_zoom ? 5 : 1, e = Math.round(a.x / d) * d; e < b.x; e += d) {
            var f = this.world2screen({
                x: e,
                y: 0
            });
            this.m_ctx.beginPath();
            this.m_ctx.strokeStyle = c(e);
            this.m_ctx.moveTo(f.x + 0.5, 0);
            this.m_ctx.lineTo(f.x + 0.5, this.m_height);
            this.m_ctx.stroke()
        }
        for (b = Math.round(b.y / d) * d; b < a.y; b += d) f = this.world2screen({
            x: 0,
            y: b
        }), this.m_ctx.beginPath(), this.m_ctx.strokeStyle = c(b), this.m_ctx.moveTo(0, f.y + 0.5), this.m_ctx.lineTo(this.m_width, f.y + 0.5), this.m_ctx.stroke();
        f = this.world2screen({
            x: 0,
            y: 0
        });
        this.m_ctx.beginPath();
        this.m_ctx.lineWidth = 1;
        this.m_ctx.strokeStyle = "#000000";
        this.m_ctx.arc(f.x + 0.5, f.y + 0.5, 0.5 * this.m_zoom, 0, 2 * Math.PI, !1);
        this.m_ctx.stroke()
    }
}


// -------------------------- Game Math

CarGame.Math2 = {
    Dot: function (a, b) { return a.x * b.x + a.y * b.y },
    MulMM: function (a, b) { return new CarGame.Mat22(0, CarGame.Math2.MulMV(a, b.col1), CarGame.Math2.MulMV(a, b.col2)) },
    MulMV: function (a, b) { return new CarGame.Vec2(a.col1.x * b.x + a.col2.x * b.y, a.col1.y * b.x + a.col2.y * b.y) },
    Sign: function (a) { return 0 > a ? -1 : 0 < a ? 1 : 0 },
    Clamp: function (a, b, c) { return CarGame.Math2.Max(b, CarGame.Math2.Min(a, c)) },
    Max: function (a, b) { return a > b ? a : b },
    Min: function (a, b) { return a < b ? a : b },
};

// -------------------------- Game Mat22

CarGame.Mat22 = function (a, b, c) {
    a = a || 0;
    this.col1 = new CarGame.Vec2();
    this.col2 = new CarGame.Vec2();
    null != b && null != c ? (this.col1.SetV(b), this.col2.SetV(c)) : (b = Math.cos(a), a = Math.sin(a), this.col1.x = b, this.col2.x = -a, this.col1.y = a, this.col2.y = b);
}

CarGame.Mat22.prototype = {
    constructor: CarGame.Mat22,
    Set : function (a) {
        var b = Math.cos(a);
        a = Math.sin(a);
        this.col1.x = b;
        this.col2.x = -a;
        this.col1.y = a;
        this.col2.y = b
    },
    SetM : function (a) {
        this.col1.SetV(a.col1);
        this.col2.SetV(a.col2)
    }
}

// -------------------------- Game Vec2

CarGame.Vec2 = function (a, b) {
    this.x = a || 0;
    this.y = b || 0;
}
CarGame.Vec2.prototype = {
    constructor: CarGame.Vec2,
        SetZero : function () {
        this.y = this.x = 0
    },
    Set : function (a, b) {
        this.x = a;
        this.y = b
    },
    SetV : function (a) {
        this.x = a.x;
        this.y = a.y
    },
    Copy : function () {
        return new CarGame.Vec2(this.x, this.y)
    },
    MulM : function (a) {
        var b = this.x;
        this.x = a.col1.x * b + a.col2.x * this.y;
        this.y = a.col1.y * b + a.col2.y * this.y
    },
    MulTM : function (a) {
        var b = new CarGame.Vec2().dot(this, a.col1);
        this.y = new CarGame.Vec2().dot(this, a.col2);
        this.x = b
    },
    MulS : function (a) {
        this.x *= a;
        this.y *= a;
        return this
    },
    dot : function (a, b) {
        return a.x * b.x + a.y * b.y
    },
    AddV : function (a) {
        this.x += a.x;
        this.y += a.y;
        return this
    },
    Length : function () {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    },
    cross : function (a, b) {
        return a.x * b.y - a.y * b.x
    },
    CrossFV : function (a) {
        var b = this.x;
        this.x = -a * this.y;
        this.y = a * b
    },
    crossScalar : function (a, b) {
        return new CarGame.Vec2(-a * b.y, a * b.x)
    },
    add : function (a, b) {
        return new CarGame.Vec2(a.x + b.x, a.y + b.y)
    },
    multiplyScalar : function (a, b) {
        return new CarGame.Vec2(a * b.x, a * b.y)
    }
}

// -------------------------- Game Trans2

CarGame.Trans2 = function (a, b, c) {
    b = b || 0;
    this.pos = new CarGame.Vec2();
    this.m_r = new CarGame.Mat22();
    if(a)this.pos.SetV(a);
    if(c)this.m_r.SetM(c);
    else  this.m_r.Set(b);
};

CarGame.Trans2.prototype = {
    constructor: CarGame.Trans2,
    SetT : function (a) {
        this.pos.SetV(a.pos);
        this.m_r.SetM(a.m_r);
    },
    TransFromV : function (a) {
        return new CarGame.Vec2().add(this.pos, CarGame.Math2.MulMV(this.m_r, a));
    },
    TransToV : function (a) {
        return CarGame.Math2.MulTMV(this.m_r, new CarGame.Vec2().subtract(a, this.pos));
    },
    TransFromM : function (a) {
        return CarGame.Math2.MulMM(this.m_r, a);
    },
    TransFromT : function (a) {
        var b = this.TransFromV(a.pos);
        a = this.TransFromM(a.m_r);
        return new CarGame.Trans2(b, 0, a);
    }
}

// -------------------------- Wheel

CarGame.Wheel = function (a, b, c, d) {
    this.car = a;
    this.pos = b.Copy();
    this.drive = c;
    this.steer = d;
    this.angle = 0;
    this.blocked = this.sliding = !1;
    this.buget = 0;
    this.old_force = new CarGame.Vec2();
    this.sliding_coef = 0.5;
    this.trail = []
}

CarGame.Wheel.prototype.calc_force = function (a, b, c, d) {
    var e = this.pos.Copy();
    e.CrossFV(1);
    (this.blocked = Math.abs(b) > this.buget) && !this.car.hand_brake && this.car.abs && (b = this.buget, this.blocked = !1);
    if (this.blocked) a = c.Copy(), a.Normalize(), a = new CarGame.Vec2().dot(e, a), e = new CarGame.Vec2().multiplyScalar(1 / (1 / this.car.mass + a * a / this.car.inertia), c), d = new Vec2().multiplyScalar(-1 / d / 2, e);
    else {
        var f = new CarGame.Mat22(this.angle),
            k = f.col1,
            e = new CarGame.Vec2().dot(e, k),
            e = -new CarGame.Vec2().dot(k, c) / (1 / this.car.mass + e * e / this.car.inertia);
        d = new CarGame.Vec2().multiplyScalar(e / d / 2, k);
        this.drive && (Math.abs(a) > this.buget && this.car.tcs && (a = this.buget * CarGame.Math2.Sign(a)), d.AddV(new CarGame.Vec2().multiplyScalar(a, f.col2)));
        0 < new CarGame.Vec2().dot(c, f.col2) ? d.AddV(new CarGame.Vec2().multiplyScalar(-b, f.col2)) : d.AddV(new CarGame.Vec2().multiplyScalar(b, f.col2))
    }
    c = d.Length();
    (this.sliding = c > this.buget) && (c > 3 * this.buget ? d.MulS(this.sliding_coef * this.buget / c) : d.MulS((1 - (c - this.buget) / (2 * this.buget) * (1 - this.sliding_coef)) * this.buget / c));
    this.old_force.SetV(d);
    return d
};

// -------------------------- ArcadeCar

CarGame.ArcadeCar = function () {
    CarGame.ControllableObject.call(this);
    this.steer_angle = 0;
    this.velocity = new CarGame.Vec2(0, 0);
    this.angular_vel = 0;
    this.prev_accel = new CarGame.Vec2(0, 0);
    this.speed = 0;
    this.direction = 1;
    this.trans = new CarGame.Trans2(this.pos, this.angle, null);
    this.steer_control = this.tcs = this.abs = !0;
    this.mass = 1E3;
    this.inertia = this.mass / 12 * 20;
    this.friction = 1;
    this.buget = this.friction * CarGame.G * this.mass;
    this.braking_coef = 2;
    this.front_braking = 0.3;
    this.c_sqr = 0.5;
    this.c_lin = 30 * this.c_sqr;
    this.power = 1E5;
    this.max_steer = Math.PI / 4;
    this.mass_height = 0.5;
    this.back_wheels = 1.2;
    this.front_wheels = 1.5;
    this.wheel_base = this.back_wheels + this.front_wheels;
    this.wheel_shift = 0.85;
    this.trails_len = 300;
    this.wheels = [];
    this.wheels[0] = [];
    this.wheels[0][0] = new CarGame.Wheel(this, new CarGame.Vec2(-this.wheel_shift, this.front_wheels), !1, !0);
    this.wheels[0][1] = new CarGame.Wheel(this, new CarGame.Vec2(this.wheel_shift, this.front_wheels), !1, !0);
    this.wheels[1] = [];
    this.wheels[1][0] = new CarGame.Wheel(this, new CarGame.Vec2(-this.wheel_shift, -this.back_wheels), !0, !1);
    this.wheels[1][1] = new CarGame.Wheel(this, new CarGame.Vec2(this.wheel_shift, -this.back_wheels), !0, !1)
}

CarGame.ArcadeCar.prototype = Object.create( CarGame.ControllableObject.prototype );
CarGame.ArcadeCar.prototype.set_drive = function (a, b) {
    this.wheels[0][0].drive = a;
    this.wheels[0][1].drive = a;
    this.wheels[1][0].drive = b;
    this.wheels[1][1].drive = b
};
CarGame.ArcadeCar.prototype.run = function (a) {
    if (!(0.001 > a)) {
        var b = new CarGame.Vec2(),
            c = 0,
            d = 0,
            e = 0,
            f = [0, 0],
            k = this.velocity.Copy();
        k.MulTM(this.trans.m_r);
        e = k.y;
        (0 < this.traction || 0 <= e * this.traction) && !this.hand_brake ? (d = Math.abs(e), d = 1 < d ? this.power / d : this.power, d *= this.traction) : (e = this.hand_brake ? 1 * this.buget * this.braking_coef : Math.abs(this.traction) * this.buget * this.braking_coef, f[0] = this.front_braking * e, f[1] = (1 - this.front_braking) * e);
        var g = this.prev_accel.Copy();
        g.MulTM(this.trans.m_r);
        var h = [];
        h[0] = this.mass / this.wheel_base * (this.back_wheels * CarGame.G  - this.mass_height * g.y);
        h[1] = this.mass / this.wheel_base * (this.front_wheels * CarGame.G  + this.mass_height * g.y);
        for (var l = 0, e = 0; e < this.wheels.length; ++e) this.wheels[e][0].drive && ++l, this.wheels[e][0].buget = (this.wheel_shift * h[e] + this.mass_height * g.x * this.mass) / (2 * this.wheel_shift), this.wheels[e][1].buget = (this.wheel_shift * h[e] - this.mass_height * g.x * this.mass) / (2 * this.wheel_shift);
        d /= 2 * l;
        e = this.max_steer;
        this.steer_control && (e = Math.abs(Math.atan2(k.x, k.y)) / 0.9, 1E-4 < this.speed || -1E-4 > this.speed ? (g = Math.atan(this.wheel_base / (this.speed * this.speed / this.buget * this.mass)), g > e && (e = 0.9 * g)) : e = this.max_steer, e > this.max_steer && (e = this.max_steer));
        this.steer_angle = this.steering * e;
        for (e = 0; e < this.wheels.length; ++e) for (g = 0; g < this.wheels[e].length; ++g) h = this.wheels[e][g], 0 > h.buget && (h.buget = 0), h.steer && (h.angle = 0 < h.pos.y ? this.steer_angle : -this.steer_angle), l = k.Copy(), l.AddV(new CarGame.Vec2().crossScalar(this.angular_vel, h.pos)), l = h.calc_force(d, f[e] / 2, l, a), c += new CarGame.Vec2().cross(h.pos, l), l.MulM(this.trans.m_r), b.AddV(l);
        b.AddV(new CarGame.Vec2().multiplyScalar(-(this.velocity.Length() * this.c_sqr + this.c_lin), this.velocity));
        b.MulS(1 / this.mass);
        this.prev_accel.SetV(b);
        this.velocity.AddV(b.MulS(a));
        this.speed = this.velocity.Length();
        this.direction = 0 > this.velocity.y ? -1 : 1;
        this.pos.AddV(new CarGame.Vec2().multiplyScalar(a, this.velocity));
        c *= a / this.inertia;
        this.angular_vel += c;
        this.angle += this.angular_vel * a;
        this.trans = new CarGame.Trans2(this.pos, this.angle, null);
        for (e = 0; e < this.wheels.length; ++e) for (g = 0; g < this.wheels[e].length; ++g) h = this.wheels[e][g], a = this.trans.TransFromV(h.pos), h.trail.push({
            p: a,
            w: h.sliding ? h.buget : 0
        }), h.trail.length > 2 * this.trails_len && (h.trail = h.trail.slice(this.trails_len, h.trail.length - 1))
    }
};
CarGame.ArcadeCar.prototype.draw = function (a) {
    var w = 1;
    var h = 2;
    var corner = 0.1;
    var corner2 = 0.2;
    var corner3 = 0.15;
    a = [{x:-w-corner, y:-h+corner},{x:-w, y:-h},  {x:0, y:-h-0.1 },  { x:w, y:-h }, { x:w+corner, y:-h+corner },
    { x:w+corner, y:h-corner3 },{ x:w-corner2, y:h }, { x:0, y:h+0.1 }, { x:-w+corner2, y:h },  { x:-w-corner, y:h-corner3 }, { x:-w-corner, y:-h+corner }];
    this.engine.m_ctx_ex.set_trans(new CarGame.Trans2(this.pos, this.angle, null));
    this.engine.m_ctx_ex.m_trans.pos = new CarGame.Vec2().add(this.engine.m_ctx_ex.m_trans.pos, { x: 0.1, y: -0.1 });
    this.engine.m_ctx_ex.draw_poly(a, null, "rgba(0,0,0,0.5)");


    for (var b = this.wheels.length; b--;) for (a = this.wheels[b].length; a--;) {
        var c = this.wheels[b][a];
        this.engine.m_ctx_ex.set_trans(new CarGame.Trans2({ x: 0, y: 0 }, 0));
        this.engine.m_ctx_ex.m_ctx.lineWidth = 0.24 * this.engine.m_ctx_ex.m_zoom;
        this.engine.m_ctx_ex.m_ctx.lineJoin = "bevel";
        for (var d = c.trail.length, e = !1, f = [], k = d - 1; 0 < k && k > d - this.trails_len; --k) {
            var g = c.trail[k];
            1E3 < g.w ? (e = !0, f.push(g.p)) : e && (e = !1, this.engine.m_ctx_ex.draw_poly(f, "rgba(0,0,0,0.5)", null), f = [])
        }
        e && this.engine.m_ctx_ex.draw_poly(f, "rgba(0,0,0,0.5)", null);
        this.engine.m_ctx_ex.m_ctx.lineWidth = 1;
        this.engine.m_ctx_ex.set_trans(this.trans);
        d = new CarGame.Vec2().multiplyScalar(2.5E-4, c.old_force);
        this.engine.m_ctx_ex.draw_poly([c.pos, new CarGame.Vec2().add(c.pos, d)], "#808080", null);
        c = new CarGame.Trans2(c.pos, c.angle);
        this.engine.m_ctx_ex.set_trans(this.trans.TransFromT(c))
    }
    this.engine.m_ctx_ex.set_trans(this.trans);
};

// -------------------------- Hover

CarGame.Hover = function () {
    CarGame.ControllableObject.call(this);
    this.velocity = new CarGame.Vec2(0, 0);
    this.path = this.angular_vel = this.speed = 0;
    this.trans = new CarGame.Trans2(this.pos, this.angle, null);
    this.c_drag = 1;
    this.c_turb = 30;
    this.resistance = 0.003;
    this.side_res = 0.015;
    this.rotation = this.strafe_force = this.force = 10;
    this.angular_res = 0.5
}
CarGame.Hover.prototype = Object.create( CarGame.ControllableObject.prototype );
CarGame.Hover.prototype.run = function (a) {
    var b = new CarGame.Vec2().multiplyScalar(this.traction * this.force, this.trans.m_r.col2);
    b.AddV(new CarGame.Vec2().multiplyScalar(this.strafe * this.strafe_force, this.trans.m_r.col1));
    this.angular_vel += (this.steering * this.rotation - this.angular_vel * this.angular_res * (this.speed + 1)) * a;
    var c = new CarGame.Vec2().dot(this.trans.m_r.col2, this.velocity),
        d = new CarGame.Vec2().dot(this.trans.m_r.col1, this.velocity),
        c = (Math.abs(c) * this.c_drag + this.c_turb) * c * this.resistance;
    b.AddV(new CarGame.Vec2().multiplyScalar(-c, this.trans.m_r.col2));
    d = (Math.abs(d) * this.c_drag + this.c_turb) * d * this.side_res;
    b.AddV(new CarGame.Vec2().multiplyScalar(-d, this.trans.m_r.col1));
    this.velocity.AddV(new CarGame.Vec2().multiplyScalar(a, b));
    this.speed = this.velocity.Length();
    //Debug.write_line("<br/>Speed: " + Math.round(3.6 * this.speed) + "km/h");
    
    this.angle += a * this.angular_vel;
    this.pos.AddV(new CarGame.Vec2().multiplyScalar(a, this.velocity));
    this.trans = new CarGame.Trans2(this.pos, this.angle, null)
};
CarGame.Hover.prototype.draw = function (a) {
    var w = 0.8;
    var h = 1.8;
    var corner = 0.1;
    var corner2 = 0.2;
    var corner3 = 0.15;
    a = [{x:-w-corner, y:-h+corner},{x:-w, y:-h},  {x:0, y:-h-0.1 },  { x:w, y:-h }, { x:w+corner, y:-h+corner },
    { x:w+corner, y:h-corner3 },{ x:w-corner2, y:h }, { x:0, y:h+0.1 }, { x:-w+corner2, y:h },  { x:-w-corner, y:h-corner3 }, { x:-w-corner, y:-h+corner }];
    this.engine.m_ctx_ex.set_trans(new CarGame.Trans2(this.pos, this.angle, null));
    this.engine.m_ctx_ex.m_trans.pos = new CarGame.Vec2().add(this.engine.m_ctx_ex.m_trans.pos, { x: 0.1, y: -0.1 });
    this.engine.m_ctx_ex.draw_poly(a, null, "rgba(0,0,0,0.5)");

};

// -------------------------- Mech

CarGame.Mech = function () {
    CarGame.ControllableObject.call(this);
    this.velocity = new CarGame.Vec2(0, 0);
    this.path = this.speed = 0;
    this.c_drag = 1;
    this.c_turb = 30;
    this.resistance = 0.001;
    this.force = 0.5 * CarGame.G;
}

CarGame.Mech.prototype = Object.create( CarGame.ControllableObject.prototype );
CarGame.Mech.prototype.run = function (a) {
    var b = Math2.Clamp(this.strafe - this.steering, -1, 1),
        b = new CarGame.Vec2(b, this.traction);
    b.Normalize();
    b.MulS(this.force);
    var c = (this.velocity.Length() * this.c_drag + this.c_turb) * this.resistance;
    b.AddV(CarGame.Vec2.multiplyScalar(-c, this.velocity));
    this.velocity.AddV(CarGame.Vec2.multiplyScalar(a, b));
    this.speed = this.velocity.Length();
    this.pos.AddV(CarGame.Vec2.multiplyScalar(a, this.velocity))
};
CarGame.Mech.prototype.draw = function (a) {
    this.engine.m_ctx_ex.m_trans.pos = new CarGame.Vec2().add(this.pos, {
        x: 0.1,
        y: -0.1
    });
    this.engine.m_ctx_ex.draw_circle({
        x: 0,
        y: 0
    }, 2, null, "rgba(0,0,0,0.5)");
    this.engine.m_ctx_ex.m_trans.pos.SetV(this.pos);
    this.engine.m_ctx_ex.draw_circle({
        x: 0,
        y: 0
    }, 2, "#808080", "white")
};