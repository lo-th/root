var YTConfig;
(function() {
    var f, h = this;

    function m(a) {
        a = a.split(".");
        for (var b = h, c; c = a.shift();)
            if (null != b[c]) b = b[c];
            else return null;
        return b
    }

    function n(a) {
        var b = typeof a;
        if ("object" == b)
            if (a) {
                if (a instanceof Array) return "array";
                if (a instanceof Object) return b;
                var c = Object.prototype.toString.call(a);
                if ("[object Window]" == c) return "object";
                if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
                if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function"
            } else return "null";
        else if ("function" == b && "undefined" == typeof a.call) return "object";
        return b
    }

    function p(a) {
        var b = n(a);
        return "array" == b || "object" == b && "number" == typeof a.length
    }

    function q(a) {
        return "string" == typeof a
    }

    function aa(a) {
        var b = typeof a;
        return "object" == b && null != a || "function" == b
    }
    var r = "closure_uid_" + (1E9 * Math.random() >>> 0),
        ba = 0;

    function ca(a, b, c) {
        return a.call.apply(a.bind, arguments)
    }

    function da(a, b, c) {
        if (!a) throw Error();
        if (2 < arguments.length) {
            var d = Array.prototype.slice.call(arguments, 2);
            return function() {
                var c = Array.prototype.slice.call(arguments);
                Array.prototype.unshift.apply(c, d);
                return a.apply(b, c)
            }
        }
        return function() {
            return a.apply(b, arguments)
        }
    }

    function t(a, b, c) {
        t = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ca : da;
        return t.apply(null, arguments)
    }

    function u(a, b) {
        var c = a.split("."),
            d = h;
        c[0] in d || !d.execScript || d.execScript("var " + c[0]);
        for (var e; c.length && (e = c.shift());) c.length || void 0 === b ? d[e] ? d = d[e] : d = d[e] = {} : d[e] = b
    }

    function v(a, b) {
        function c() {}
        c.prototype = b.prototype;
        a.K = b.prototype;
        a.prototype = new c;
        a.base = function(a, c, g) {
            for (var k = Array(arguments.length - 2), l = 2; l < arguments.length; l++) k[l - 2] = arguments[l];
            return b.prototype[c].apply(a, k)
        }
    }
    Function.prototype.bind = Function.prototype.bind || function(a, b) {
        if (1 < arguments.length) {
            var c = Array.prototype.slice.call(arguments, 1);
            c.unshift(this, a);
            return t.apply(null, c)
        }
        return t(this, a)
    };
    var ea = String.prototype.trim ? function(a) {
        return a.trim()
    } : function(a) {
        return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
    };

    function w(a, b) {
        return a < b ? -1 : a > b ? 1 : 0
    };
    var x = Array.prototype,
        fa = x.indexOf ? function(a, b, c) {
            return x.indexOf.call(a, b, c)
        } : function(a, b, c) {
            c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
            if (q(a)) return q(b) && 1 == b.length ? a.indexOf(b, c) : -1;
            for (; c < a.length; c++)
                if (c in a && a[c] === b) return c;
            return -1
        },
        y = x.forEach ? function(a, b, c) {
            x.forEach.call(a, b, c)
        } : function(a, b, c) {
            for (var d = a.length, e = q(a) ? a.split("") : a, g = 0; g < d; g++) g in e && b.call(c, e[g], g, a)
        };

    function ga(a, b) {
        var c;
        a: {
            c = a.length;
            for (var d = q(a) ? a.split("") : a, e = 0; e < c; e++)
                if (e in d && b.call(void 0, d[e], e, a)) {
                    c = e;
                    break a
                }
            c = -1
        }
        return 0 > c ? null : q(a) ? a.charAt(c) : a[c]
    }

    function ha(a) {
        return x.concat.apply(x, arguments)
    }

    function z(a) {
        var b = a.length;
        if (0 < b) {
            for (var c = Array(b), d = 0; d < b; d++) c[d] = a[d];
            return c
        }
        return []
    };

    function ia(a) {
        var b = A,
            c;
        for (c in b)
            if (a.call(void 0, b[c], c, b)) return c
    }

    function ja(a) {
        var b = arguments.length;
        if (1 == b && "array" == n(arguments[0])) return ja.apply(null, arguments[0]);
        for (var c = {}, d = 0; d < b; d++) c[arguments[d]] = !0;
        return c
    };
    ja("area base br col command embed hr img input keygen link meta param source track wbr".split(" "));
    var B;
    a: {
        var ka = h.navigator;
        if (ka) {
            var la = ka.userAgent;
            if (la) {
                B = la;
                break a
            }
        }
        B = ""
    };

    function C() {
        return -1 != B.indexOf("Edge")
    };
    var ma = -1 != B.indexOf("Opera") || -1 != B.indexOf("OPR"),
        D = -1 != B.indexOf("Edge") || -1 != B.indexOf("Trident") || -1 != B.indexOf("MSIE"),
        E = -1 != B.indexOf("Gecko") && !(-1 != B.toLowerCase().indexOf("webkit") && !C()) && !(-1 != B.indexOf("Trident") || -1 != B.indexOf("MSIE")) && !C(),
        na = -1 != B.toLowerCase().indexOf("webkit") && !C();

    function oa() {
        var a = B;
        if (E) return /rv\:([^\);]+)(\)|;)/.exec(a);
        if (D && C()) return /Edge\/([\d\.]+)/.exec(a);
        if (D) return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);
        if (na) return /WebKit\/(\S+)/.exec(a)
    }

    function pa() {
        var a = h.document;
        return a ? a.documentMode : void 0
    }
    var qa = function() {
            if (ma && h.opera) {
                var a = h.opera.version;
                return "function" == n(a) ? a() : a
            }
            var a = "",
                b = oa();
            b && (a = b ? b[1] : "");
            return D && !C() && (b = pa(), b > parseFloat(a)) ? String(b) : a
        }(),
        ra = {};

    function sa(a) {
        if (!ra[a]) {
            for (var b = 0, c = ea(String(qa)).split("."), d = ea(String(a)).split("."), e = Math.max(c.length, d.length), g = 0; 0 == b && g < e; g++) {
                var k = c[g] || "",
                    l = d[g] || "",
                    ab = RegExp("(\\d*)(\\D*)", "g"),
                    bb = RegExp("(\\d*)(\\D*)", "g");
                do {
                    var K = ab.exec(k) || ["", "", ""],
                        L = bb.exec(l) || ["", "", ""];
                    if (0 == K[0].length && 0 == L[0].length) break;
                    b = w(0 == K[1].length ? 0 : parseInt(K[1], 10), 0 == L[1].length ? 0 : parseInt(L[1], 10)) || w(0 == K[2].length, 0 == L[2].length) || w(K[2], L[2])
                } while (0 == b)
            }
            ra[a] = 0 <= b
        }
    }
    var ta = h.document,
        ua = pa(),
        va = !ta || !D || !ua && C() ? void 0 : ua || ("CSS1Compat" == ta.compatMode ? parseInt(qa, 10) : 5);
    var F;
    if (!(F = !E && !D)) {
        var G;
        if (G = D) G = D && (C() || 9 <= va);
        F = G
    }
    F || E && sa("1.9.1");
    D && sa("9");

    function wa(a) {
        var b, c, d, e;
        b = document;
        if (b.querySelectorAll && b.querySelector && a) return b.querySelectorAll("" + (a ? "." + a : ""));
        if (a && b.getElementsByClassName) {
            var g = b.getElementsByClassName(a);
            return g
        }
        g = b.getElementsByTagName("*");
        if (a) {
            e = {};
            for (c = d = 0; b = g[c]; c++) {
                var k = b.className,
                    l;
                if (l = "function" == typeof k.split) l = 0 <= fa(k.split(/\s+/), a);
                l && (e[d++] = b)
            }
            e.length = d;
            return e
        }
        return g
    }

    function xa(a, b) {
        for (var c = 0; a;) {
            if (b(a)) return a;
            a = a.parentNode;
            c++
        }
        return null
    };

    function ya(a) {
        a = String(a);
        if (/^\s*$/.test(a) ? 0 : /^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g, ""))) try {
            return eval("(" + a + ")")
        } catch (b) {}
        throw Error("Invalid JSON string: " + a);
    }

    function za() {}

    function Aa(a, b, c) {
        if (null == b) c.push("null");
        else {
            if ("object" == typeof b) {
                if ("array" == n(b)) {
                    var d = b;
                    b = d.length;
                    c.push("[");
                    for (var e = "", g = 0; g < b; g++) c.push(e), Aa(a, d[g], c), e = ",";
                    c.push("]");
                    return
                }
                if (b instanceof String || b instanceof Number || b instanceof Boolean) b = b.valueOf();
                else {
                    c.push("{");
                    e = "";
                    for (d in b) Object.prototype.hasOwnProperty.call(b, d) && (g = b[d], "function" != typeof g && (c.push(e), Ba(d, c), c.push(":"), Aa(a, g, c), e = ","));
                    c.push("}");
                    return
                }
            }
            switch (typeof b) {
                case "string":
                    Ba(b, c);
                    break;
                case "number":
                    c.push(isFinite(b) &&
                        !isNaN(b) ? b : "null");
                    break;
                case "boolean":
                    c.push(b);
                    break;
                case "function":
                    break;
                default:
                    throw Error("Unknown type: " + typeof b);
            }
        }
    }
    var Ca = {
            '"': '\\"',
            "\\": "\\\\",
            "/": "\\/",
            "\b": "\\b",
            "\f": "\\f",
            "\n": "\\n",
            "\r": "\\r",
            "\t": "\\t",
            "\x0B": "\\u000b"
        };
    var Da = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;


    function Ba(a, b) {
        b.push('"', a.replace(Da, function(a) {
            var b = Ca[a];
            b || (b = "\\u" + (a.charCodeAt(0) | 65536).toString(16).substr(1), Ca[a] = b);
            return b
        }), '"')
    };

    function H() {
        this.h = this.h;
        this.j = this.j
    }
    H.prototype.h = !1;
    H.prototype.isDisposed = function() {
        return this.h
    };
    H.prototype.dispose = function() {
        this.h || (this.h = !0, this.H())
    };
    H.prototype.H = function() {
        if (this.j)
            for (; this.j.length;) this.j.shift()()
    };

    function I() {
        H.call(this);
        this.A = 1;
        this.l = [];
        this.m = 0;
        this.c = [];
        this.f = {}
    }
    v(I, H);
    f = I.prototype;
    f.subscribe = function(a, b, c) {
        var d = this.f[a];
        d || (d = this.f[a] = []);
        var e = this.A;
        this.c[e] = a;
        this.c[e + 1] = b;
        this.c[e + 2] = c;
        this.A = e + 3;
        d.push(e);
        return e
    };

    function Ea(a, b, c) {
        var d = J;
        if (a = d.f[a]) {
            var e = d.c;
            (a = ga(a, function(a) {
                return e[a + 1] == b && e[a + 2] == c
            })) && d.L(a)
        }
    }
    f.L = function(a) {
        if (0 != this.m) return this.l.push(a), !1;
        var b = this.c[a];
        if (b) {
            var c = this.f[b];
            if (c) {
                var d = fa(c, a);
                0 <= d && x.splice.call(c, d, 1)
            }
            delete this.c[a];
            delete this.c[a + 1];
            delete this.c[a + 2]
        }
        return !!b
    };
    f.N = function(a, b) {
        var c = this.f[a];
        if (c) {
            this.m++;
            for (var d = Array(arguments.length - 1), e = 1, g = arguments.length; e < g; e++) d[e - 1] = arguments[e];
            e = 0;
            for (g = c.length; e < g; e++) {
                var k = c[e];
                this.c[k + 1].apply(this.c[k + 2], d)
            }
            this.m--;
            if (0 < this.l.length && 0 == this.m)
                for (; c = this.l.pop();) this.L(c);
            return 0 != e
        }
        return !1
    };
    f.clear = function(a) {
        if (a) {
            var b = this.f[a];
            b && (y(b, this.L, this), delete this.f[a])
        } else this.c.length = 0, this.f = {}
    };
    f.H = function() {
        I.K.H.call(this);
        this.clear();
        this.l.length = 0
    };
    var Fa = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;

    function Ga(a) {
        if (Ha) {
            Ha = !1;
            var b = h.location;
            if (b) {
                var c = b.href;
                if (c && (c = (c = Ga(c)[3] || null) ? decodeURI(c) : c) && c != b.hostname) throw Ha = !0, Error();
            }
        }
        return a.match(Fa)
    }
    var Ha = na;

    function Ia(a, b, c) {
        if ("array" == n(b))
            for (var d = 0; d < b.length; d++) Ia(a, String(b[d]), c);
        else null != b && c.push("&", a, "" === b ? "" : "=", encodeURIComponent(String(b)))
    }
    var Ja = /#|$/;
    var Ka = m("yt.dom.getNextId_");
    if (!Ka) {
        Ka = function() {
            return ++La
        };
        u("yt.dom.getNextId_", Ka);
        var La = 0
    };
    var M = window.yt && window.yt.config_ || window.ytcfg && window.ytcfg.data_ || {};
    u("yt.config_", M);
    u("yt.tokens_", window.yt && window.yt.tokens_ || {});
    u("yt.msgs_", window.yt && window.yt.msgs_ || {});

    function Ma(a) {
        var b = arguments;
        if (1 < b.length) {
            var c = b[0];
            M[c] = b[1]
        } else
            for (c in b = b[0], b) M[c] = b[c]
    }

    function Na(a) {
        "function" == n(a) && (a = Oa(a));
        return window.setInterval(a, 250)
    }

    function Oa(a) {
        return a && window.yterr ? function() {
            try {
                return a.apply(this, arguments)
            } catch (b) {
                throw Pa(b), b;
            }
        } : a
    }

    function Pa(a, b) {
        var c = m("yt.www.errors.log");
        c ? c(a, b) : (c = ("ERRORS" in M ? M.ERRORS : void 0) || [], c.push([a, b]), Ma("ERRORS", c))
    };

    function Qa(a) {
        if (a = a || window.event) {
            this.event = a;
            for (var b in a) b in Ra || (this[b] = a[b]);
            (b = a.target || a.srcElement) && 3 == b.nodeType && (b = b.parentNode);
            this.target = b;
            if (b = a.relatedTarget) try {
                b = b.nodeName ? b : null
            } catch (c) {
                b = null
            } else "mouseover" == this.type ? b = a.fromElement : "mouseout" == this.type && (b = a.toElement);
            this.relatedTarget = b;
            this.clientX = void 0 != a.clientX ? a.clientX : a.pageX;
            this.clientY = void 0 != a.clientY ? a.clientY : a.pageY;
            this.keyCode = a.keyCode ? a.keyCode : a.which;
            this.charCode = a.charCode || ("keypress" ==
                this.type ? this.keyCode : 0);
            this.altKey = a.altKey;
            this.ctrlKey = a.ctrlKey;
            this.shiftKey = a.shiftKey;
            "MozMousePixelScroll" == this.type ? (this.wheelDeltaX = a.axis == a.HORIZONTAL_AXIS ? a.detail : 0, this.wheelDeltaY = a.axis == a.HORIZONTAL_AXIS ? 0 : a.detail) : window.opera ? (this.wheelDeltaX = 0, this.wheelDeltaY = a.detail) : 0 == a.wheelDelta % 120 ? "WebkitTransform" in document.documentElement.style ? window.chrome && 0 == navigator.platform.indexOf("Mac") ? (this.wheelDeltaX = a.wheelDeltaX / -30, this.wheelDeltaY = a.wheelDeltaY / -30) : (this.wheelDeltaX =
                a.wheelDeltaX / -1.2, this.wheelDeltaY = a.wheelDeltaY / -1.2) : (this.wheelDeltaX = 0, this.wheelDeltaY = a.wheelDelta / -1.6) : (this.wheelDeltaX = a.wheelDeltaX / -3, this.wheelDeltaY = a.wheelDeltaY / -3)
        }
    }
    f = Qa.prototype;
    f.type = "";
    f.target = null;
    f.relatedTarget = null;
    f.currentTarget = null;
    f.data = null;
    f.keyCode = 0;
    f.charCode = 0;
    f.altKey = !1;
    f.ctrlKey = !1;
    f.shiftKey = !1;
    f.clientX = 0;
    f.clientY = 0;
    f.wheelDeltaX = 0;
    f.wheelDeltaY = 0;
    var Ra = {
        stopImmediatePropagation: 1,
        stopPropagation: 1,
        preventMouseEvent: 1,
        preventManipulation: 1,
        preventDefault: 1,
        layerX: 1,
        layerY: 1,
        scale: 1,
        rotation: 1
    };
    var A = m("yt.events.listeners_") || {};
    u("yt.events.listeners_", A);
    var Sa = m("yt.events.counter_") || {
        count: 0
    };
    u("yt.events.counter_", Sa);

    function Ta(a, b, c) {
        return ia(function(d) {
            return d[0] == a && d[1] == b && d[2] == c && 0 == d[4]
        })
    }

    function Ua(a, b, c) {
        if (a && (a.addEventListener || a.attachEvent)) {
            var d = Ta(a, b, c);
            if (!d) {
                d = ++Sa.count + "";
                var e = !("mouseenter" != b && "mouseleave" != b || !a.addEventListener || "onmouseenter" in document), g;
                //var d = ++Sa.count + "", e = !("mouseenter" != b && "mouseleave" != b || !a.addEventListener || "onmouseenter" in document), g;
                g = e ? function(d) {
                    d = new Qa(d);
                    if (!xa(d.relatedTarget, function(b) {
                            return b == a
                        })) return d.currentTarget = a, d.type = b, c.call(a, d)
                } : function(b) {
                    b = new Qa(b);
                    b.currentTarget = a;
                    return c.call(a, b)
                };
                g = Oa(g);
                A[d] = [a, b, c, g, !1];
                a.addEventListener ? "mouseenter" == b && e ? a.addEventListener("mouseover", g, !1) : "mouseleave" == b && e ? a.addEventListener("mouseout",
                    g, !1) : "mousewheel" == b && "MozBoxSizing" in document.documentElement.style ? a.addEventListener("MozMousePixelScroll", g, !1) : a.addEventListener(b, g, !1) : a.attachEvent("on" + b, g)
            }
        }
    }

    function Va(a) {
        a && ("string" == typeof a && (a = [a]), y(a, function(a) {
            if (a in A) {
                var c = A[a],
                    d = c[0],
                    e = c[1],
                    g = c[3];
                    c = c[4];
                d.removeEventListener ? d.removeEventListener(e, g, c) : d.detachEvent && d.detachEvent("on" + e, g);
                delete A[a]
            }
        }))
    };

    function Wa(a) {
        var b = [],
            c;
        for (c in a) Ia(c, a[c], b);
        b[0] = "";
        return b.join("")
    };
    var Xa = {};

    function Ya(a) {
        return Xa[a] || (Xa[a] = String(a).replace(/\-([a-z])/g, function(a, c) {
            return c.toUpperCase()
        }))
    };
    var N = {},
        Za = [],
        J = new I,
        $a = {};

    function cb() {
        y(Za, function(a) {
            a()
        })
    }

    function db(a) {
        var b = z(document.getElementsByTagName("yt:" + a));
        a = "yt-" + a;
        var c = document;
        a = c.querySelectorAll && c.querySelector ? c.querySelectorAll("." + a) : wa(a);
        a = z(a);
        return ha(b, a)
    }

    function O(a, b) {
        return "yt:" == a.tagName.toLowerCase().substr(0, 3) ? a.getAttribute(b) : a ? a.dataset ? a.dataset[Ya(b)] : a.getAttribute("data-" + b) : null
    }

    function eb(a, b) {
        J.N.apply(J, arguments)
    };

    function P(a, b, c) {
        this.f = b;
        this.l = this.c = null;
        this.m = this[r] || (this[r] = ++ba);
        this.h = 0;
        this.I = !1;
        this.F = [];
        this.j = null;
        this.A = c;
        this.P = {};
        b = document;
        if (a = q(a) ? b.getElementById(a) : a)
            if ("iframe" != a.tagName.toLowerCase() && (b = fb(this, a), this.l = a, (c = a.parentNode) && c.replaceChild(b, a), a = b), this.c = a, this.c.id || (b = a = this.c, b = b[r] || (b[r] = ++ba), a.id = "widget" + b), N[this.c.id] = this, window.postMessage) {
                this.j = new I;
                gb(this);
                a = Q(this.f, "events");
                for (var d in a) a.hasOwnProperty(d) && this.addEventListener(d, a[d]);
                for (var e in $a) hb(this,
                    e)
            }
    }
    f = P.prototype;
    f.Y = function(a, b) {
        this.c.width = a;
        this.c.height = b;
        return this
    };
    f.X = function() {
        return this.c
    };
    f.O = function(a) {
        this.v(a.event, a)
    };
    f.addEventListener = function(a, b) {
        var c = b;
        "string" == typeof b && (c = function() {
            window[b].apply(window, arguments)
        });
        this.j.subscribe(a, c);
        ib(this, a);
        return this
    };

    function hb(a, b) {
        var c = b.split(".");
        if (2 == c.length) {
            var d = c[1];
            a.A == c[0] && ib(a, d)
        }
    }
    f.W = function() {
        this.c.id && (N[this.c.id] = null);
        var a = this.j;
        a && "function" == typeof a.dispose && a.dispose();
        if (this.l) {
            a = this.c;
            var b = a.parentNode;
            //var a = this.c, b = a.parentNode;
            b && b.replaceChild(this.l, a)
        } else(a = this.c) && a.parentNode && a.parentNode.removeChild(a);
        R && (R[this.m] = null);
        this.f = null;
        a = this.c;
        var c;
        //var a = this.c, c;
        for (c in A) A[c][0] == a && Va(c);
        this.l = this.c = null
    };
    f.D = function() {
        return {}
    };

    function S(a, b, c) {
        c = c || [];
        c = Array.prototype.slice.call(c);
        b = {
            event: "command",
            func: b,
            args: c
        };
        a.I ? a.J(b) : a.F.push(b)
    }
    f.v = function(a, b) {
        if (!this.j.isDisposed()) {
            var c = {
                target: this,
                data: b
            };
            this.j.N(a, c);
            eb(this.A + "." + a, c)
        }
    };

    function fb(a, b) {
        for (var c = document.createElement("iframe"), d = b.attributes, e = 0, g = d.length; e < g; e++) {
            var k = d[e].value;
            null != k && "" != k && "null" != k && c.setAttribute(d[e].name, k)
        }
        c.setAttribute("frameBorder", 0);
        c.setAttribute("allowfullscreen", 1);
        c.setAttribute("title", "YouTube " + Q(a.f, "title"));
        (d = Q(a.f, "width")) && c.setAttribute("width", d);
        (d = Q(a.f, "height")) && c.setAttribute("height", d);
        var l = a.D();
        l.enablejsapi = window.postMessage ? 1 : 0;
        window.location.host && (l.origin = window.location.protocol + "//" + window.location.host);
        window.location.href && y(["debugjs", "debugcss"], function(a) {
            var b;
            b = window.location.href;
            var c = b.search(Ja),
                d;
            b: {
                d = 0;
                for (var e = a.length; 0 <= (d = b.indexOf(a, d)) && d < c;) {
                    var g = b.charCodeAt(d - 1);
                    if (38 == g || 63 == g)
                        if (g = b.charCodeAt(d + e), !g || 61 == g || 38 == g || 35 == g) break b;
                    d += e + 1
                }
                d = -1
            }
            if (0 > d) b = null;
            else {
                e = b.indexOf("&", d);
                if (0 > e || e > c) e = c;
                d += a.length + 1;
                b = decodeURIComponent(b.substr(d, e - d).replace(/\+/g, " "))
            }
            null === b || (l[a] = b)
        });
        c.src = Q(a.f, "host") + a.G() + "?" + Wa(l);
        return c
    }
    f.M = function() {
        this.c && this.c.contentWindow ? this.J({
            event: "listening"
        }) : window.clearInterval(this.h)
    };

    function gb(a) {
        jb(a.f, a, a.m);
        a.h = Na(t(a.M, a));
        Ua(a.c, "load", t(function() {
            window.clearInterval(this.h);
            this.h = Na(t(this.M, this))
        }, a))
    }

    function ib(a, b) {
        a.P[b] || (a.P[b] = !0, S(a, "addEventListener", [b]))
    }
    f.J = function(a) {
        a.id = this.m;
        var b = [];
        Aa(new za, a, b);
        a = b.join("");
        b = this.f;
        var c, d = Ga(this.c.src);
        //var b = this.f, c, d = Ga(this.c.src);
        c = d[1];
        var e = d[2],
            g = d[3],
            //d = d[4],
            k = "";
        d = d[4];
        c && (k += c + ":");
        g && (k += "//", e && (k += e + "@"), k += g, d && (k += ":" + d));
        c = k;
        b = 0 == c.indexOf("https:") ? [c] : b.c ? [c.replace("http:", "https:")] : b.h ? [c] : [c, c.replace("http:", "https:")];
        for (c = 0; c < b.length; c++) try {
            this.c.contentWindow.postMessage(a, b[c])
        } catch (l) {
            if (l.name && "SyntaxError" == l.name) Pa(l, "WARNING");
            else throw l;
        }
    };
    var T = "StopIteration" in h ? h.StopIteration : {
        message: "StopIteration",
        stack: ""
    };

    function U() {}
    U.prototype.next = function() {
        throw T;
    };
    U.prototype.C = function() {
        return this
    };

    function kb(a) {
        if (a instanceof U) return a;
        if ("function" == typeof a.C) return a.C(!1);
        if (p(a)) {
            var b = 0,
                c = new U;
            c.next = function() {
                for (;;) {
                    if (b >= a.length) throw T;
                    if (b in a) return a[b++];
                    b++
                }
            };
            return c
        }
        throw Error("Not implemented");
    }

    function lb(a, b) {
        if (p(a)) try {
            y(a, b, void 0)
        } catch (c) {
            if (c !== T) throw c;
        } else {
            a = kb(a);
            try {
                for (;;) b.call(void 0, a.next(), void 0, a)
            } catch (d) {
                if (d !== T) throw d;
            }
        }
    }

    function mb(a) {
        if (p(a)) return z(a);
        a = kb(a);
        var b = [];
        lb(a, function(a) {
            b.push(a)
        });
        return b
    };

    function nb() {};

    function ob() {}
    v(ob, nb);
    ob.prototype.clear = function() {
        var a = mb(this.C(!0)),
            b = this;
        y(a, function(a) {
            b.remove(a)
        })
    };

    function V(a) {
        this.c = a
    }
    v(V, ob);
    f = V.prototype;
    f.isAvailable = function() {
        if (!this.c) return !1;
        try {
            return this.c.setItem("__sak", "1"), this.c.removeItem("__sak"), !0
        } catch (a) {
            return !1
        }
    };
    f.remove = function(a) {
        this.c.removeItem(a)
    };
    f.C = function(a) {
        var b = 0,
            c = this.c,
            d = new U;
        d.next = function() {
            if (b >= c.length) throw T;
            var d;
            d = c.key(b++);
            if (a) return d;
            d = c.getItem(d);
            if (!q(d)) throw "Storage mechanism: Invalid value was encountered";
            return d
        };
        return d
    };
    f.clear = function() {
        this.c.clear()
    };
    f.key = function(a) {
        return this.c.key(a)
    };

    function pb() {
        var a = null;
        try {
            a = window.localStorage || null
        } catch (b) {}
        this.c = a
    }
    v(pb, V);

    function qb() {
        var a = null;
        try {
            a = window.sessionStorage || null
        } catch (b) {}
        this.c = a
    }
    v(qb, V);
    (new pb).isAvailable();
    (new qb).isAvailable();

    function rb(a) {
        return (0 == a.search("cue") || 0 == a.search("load")) && "loadModule" != a
    }

    function sb(a) {
        return 0 == a.search("get") || 0 == a.search("is")
    };
    var tb = "corp.google.com googleplex.com youtube.com youtube-nocookie.com youtubeeducation.com borg.google.com prod.google.com sandbox.google.com books.googleusercontent.com docs.google.com drive.google.com mail.google.com photos.google.com plus.google.com lh2.google.com picasaweb.google.com play.google.com googlevideo.com talkgadget.google.com survey.g.doubleclick.net youtube.googleapis.com vevo.com".split(" "),
        ub = "";

    function W(a) {
        this.f = a || {};
        this.defaults = {};
        this.defaults.host = "http://www.youtube.com";
        this.defaults.title = "";
        this.h = this.c = !1;
        a = document.getElementById("www-widgetapi-script");
        if (this.c = !!("https:" == document.location.protocol || a && 0 == a.src.indexOf("https:"))) {
            a = [this.f, window.YTConfig || {}, this.defaults];
            for (var b = 0; b < a.length; b++) a[b].host && (a[b].host = a[b].host.replace("http://", "https://"))
        }
    }
    var R = null;

    function Q(a, b) {
        for (var c = [a.f, window.YTConfig || {}, a.defaults], d = 0; d < c.length; d++) {
            var e = c[d][b];
            if (void 0 != e) return e
        }
        return null
    }

    function jb(a, b, c) {
        R || (R = {}, Ua(window, "message", t(a.j, a)));
        R[c] = b
    }
    W.prototype.j = function(a) {
        var b;
        (b = a.origin == Q(this, "host")) || ((b = a.origin) && b == ub ? b = !0 : (new RegExp("^(https?:)?//([a-z0-9-]{1,63}\\.)*(" + tb.join("|").replace(/\./g, ".") + ")(:[0-9]+)?([/?#]|$)", "i")).test(b) ? (ub = b, b = !0) : b = !1);
        if (b) {
            var c;
            try {
                c = ya(a.data)
            } catch (d) {
                return
            }
            this.h = !0;
            this.c || 0 != a.origin.indexOf("https:") || (this.c = !0);
            if (a = R[c.id]) a.I = !0, a.I && (y(a.F, a.J, a), a.F.length = 0), a.O(c)
        }
    };

    function vb(a) {
        W.call(this, a);
        this.defaults.title = "video player";
        this.defaults.videoId = "";
        this.defaults.width = 640;
        this.defaults.height = 360
    }
    v(vb, W);

    function X(a, b) {
        var c = new vb(b);
        P.call(this, a, c, "player");
        this.B = {};
        this.o = {}
    }
    v(X, P);

    function wb(a) {
        if ("iframe" != a.tagName.toLowerCase()) {
            var b = O(a, "videoid");
            if (b) {
                var c = O(a, "width"),
                    d = O(a, "height");
                new X(a, {
                    videoId: b,
                    width: c,
                    height: d
                })
            }
        }
    }
    f = X.prototype;
    f.G = function() {
        return "/embed/" + Q(this.f, "videoId")
    };
    f.D = function() {
        var a;
        if (Q(this.f, "playerVars")) {
            a = Q(this.f, "playerVars");
            var b = {},
                c;
            for (c in a) b[c] = a[c];
            a = b
        } else a = {};
        return a
    };
    f.O = function(a) {
        var b = a.event;
        a = a.info;
        switch (b) {
            case "apiInfoDelivery":
                if (aa(a))
                    for (var c in a) this.o[c] = a[c];
                break;
            case "infoDelivery":
                xb(this, a);
                break;
            case "initialDelivery":
                window.clearInterval(this.h);
                this.B = {};
                this.o = {};
                yb(this, a.apiInterface);
                xb(this, a);
                break;
            default:
                this.v(b, a)
        }
    };

    function xb(a, b) {
        if (aa(b))
            for (var c in b) a.B[c] = b[c]
    }

    function yb(a, b) {
        y(b, function(a) {
            this[a] || (rb(a) ? this[a] = function() {
                this.B = {};
                this.o = {};
                S(this, a, arguments);
                return this
            } : sb(a) ? this[a] = function() {
                var b = 0;
                0 == a.search("get") ? b = 3 : 0 == a.search("is") && (b = 2);
                return this.B[a.charAt(b).toLowerCase() + a.substr(b + 1)]
            } : this[a] = function() {
                S(this, a, arguments);
                return this
            })
        }, a)
    }
    f.aa = function() {
        var a = this.c.cloneNode(!1),
            b = this.B.videoData,
            c = Q(this.f, "host");
        a.src = b && b.video_id ? c + "/embed/" + b.video_id : a.src;
        b = document.createElement("div");
        b.appendChild(a);
        return b.innerHTML
    };
    f.$ = function(a) {
        return this.o.namespaces ? a ? this.o[a].options || [] : this.o.namespaces || [] : []
    };
    f.Z = function(a, b) {
        if (this.o.namespaces && a && b) return this.o[a][b]
    };

    function zb(a) {
        W.call(this, a);
        this.defaults.title = "Thumbnail";
        this.defaults.videoId = "";
        this.defaults.width = 120;
        this.defaults.height = 68
    }
    v(zb, W);

    function Y(a, b) {
        var c = new zb(b);
        P.call(this, a, c, "thumbnail")
    }
    v(Y, P);

    function Ab(a) {
        if ("iframe" != a.tagName.toLowerCase()) {
            var b = O(a, "videoid");
            if (b) {
                b = {
                    videoId: b,
                    events: {}
                };
                b.width = O(a, "width");
                b.height = O(a, "height");
                b.thumbWidth = O(a, "thumb-width");
                b.thumbHeight = O(a, "thumb-height");
                b.thumbAlign = O(a, "thumb-align");
                var c = O(a, "onclick");
                c && (b.events.onClick = c);
                new Y(a, b)
            }
        }
    }
    Y.prototype.G = function() {
        return "/embed/" + Q(this.f, "videoId")
    };
    Y.prototype.D = function() {
        return {
            player: 0,
            thumb_width: Q(this.f, "thumbWidth"),
            thumb_height: Q(this.f, "thumbHeight"),
            thumb_align: Q(this.f, "thumbAlign")
        }
    };
    Y.prototype.v = function(a, b) {
        Y.K.v.call(this, a, b ? b.info : void 0)
    };

    function Bb(a) {
        W.call(this, a);
        this.defaults.host = "https://www.youtube.com";
        this.defaults.title = "upload widget";
        this.defaults.width = 640;
        this.defaults.height = .67 * Q(this, "width")
    }
    v(Bb, W);

    function Z(a, b) {
        var c = new Bb(b);
        P.call(this, a, c, "upload")
    }
    v(Z, P);
    f = Z.prototype;
    f.G = function() {
        return "/upload_embed"
    };
    f.D = function() {
        var a = {},
            b = Q(this.f, "webcamOnly");
        null != b && (a.webcam_only = b);
        return a
    };
    f.v = function(a, b) {
        Z.K.v.call(this, a, b);
        "onApiReady" == a && S(this, "hostWindowReady")
    };
    f.R = function(a) {
        S(this, "setVideoDescription", arguments)
    };
    f.T = function(a) {
        S(this, "setVideoKeywords", arguments)
    };
    f.U = function(a) {
        S(this, "setVideoPrivacy", arguments)
    };
    f.S = function(a) {
        S(this, "setVideoDraftPrivacy", arguments)
    };
    f.V = function(a) {
        S(this, "setVideoTitle", arguments)
    };
    u("YT.PlayerState.UNSTARTED", -1);
    u("YT.PlayerState.ENDED", 0);
    u("YT.PlayerState.PLAYING", 1);
    u("YT.PlayerState.PAUSED", 2);
    u("YT.PlayerState.BUFFERING", 3);
    u("YT.PlayerState.CUED", 5);
    u("YT.UploadWidgetEvent.API_READY", "onApiReady");
    u("YT.UploadWidgetEvent.UPLOAD_SUCCESS", "onUploadSuccess");
    u("YT.UploadWidgetEvent.PROCESSING_COMPLETE", "onProcessingComplete");
    u("YT.UploadWidgetEvent.STATE_CHANGE", "onStateChange");
    u("YT.UploadWidgetState.IDLE", 0);
    u("YT.UploadWidgetState.PENDING", 1);
    u("YT.UploadWidgetState.ERROR", 2);
    u("YT.UploadWidgetState.PLAYBACK", 3);
    u("YT.UploadWidgetState.RECORDING", 4);
    u("YT.UploadWidgetState.STOPPED", 5);
    u("YT.get", function(a) {
        return N[a]
    });
    u("YT.scan", cb);
    u("YT.subscribe", function(a, b, c) {
        J.subscribe(a, b, c);
        $a[a] = !0;
        for (var d in N) hb(N[d], a)
    });
    u("YT.unsubscribe", function(a, b, c) {
        Ea(a, b, c)
    });
    u("YT.Player", X);
    u("YT.Thumbnail", Y);
    u("YT.UploadWidget", Z);
    P.prototype.destroy = P.prototype.W;
    P.prototype.setSize = P.prototype.Y;
    P.prototype.getIframe = P.prototype.X;
    P.prototype.addEventListener = P.prototype.addEventListener;
    X.prototype.getVideoEmbedCode = X.prototype.aa;
    X.prototype.getOptions = X.prototype.$;
    X.prototype.getOption = X.prototype.Z;
    Z.prototype.setVideoDescription = Z.prototype.R;
    Z.prototype.setVideoKeywords = Z.prototype.T;
    Z.prototype.setVideoPrivacy = Z.prototype.U;
    Z.prototype.setVideoTitle = Z.prototype.V;
    Z.prototype.setVideoDraftPrivacy = Z.prototype.S;
    Za.push(function() {
        var a = db("player");
        y(a, wb)
    });
    Za.push(function() {
        var a = db("thumbnail");
        y(a, Ab)
    });
    "undefined" != typeof YTConfig && YTConfig.parsetags && "onload" != YTConfig.parsetags || cb();
    var Cb = m("onYTReady");
    Cb && Cb();
    var Db = m("onYouTubeIframeAPIReady");
    Db && Db();
    var Eb = m("onYouTubePlayerAPIReady");
    Eb && Eb();
})();