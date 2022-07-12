/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/**
 * Skipped minification because the original files appears to be already minified.
 * Original file: /npm/@mediapipe/selfie_segmentation@0.1.1632777926/selfie_segmentation.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
(function () {
  /*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
  "use strict";
  var D;
  function aa(a) {
    var b = 0;
    return function () {
      return b < a.length ? { done: !1, value: a[b++] } : { done: !0 };
    };
  }
  var ba =
    "function" == typeof Object.defineProperties
      ? Object.defineProperty
      : function (a, b, c) {
          if (a == Array.prototype || a == Object.prototype) return a;
          a[b] = c.value;
          return a;
        };
  function ca(a) {
    a = [
      "object" == typeof globalThis && globalThis,
      a,
      "object" == typeof window && window,
      "object" == typeof self && self,
      "object" == typeof global && global,
    ];
    for (var b = 0; b < a.length; ++b) {
      var c = a[b];
      if (c && c.Math == Math) return c;
    }
    throw Error("Cannot find global object");
  }
  var H = ca(this);
  function J(a, b) {
    if (b)
      a: {
        var c = H;
        a = a.split(".");
        for (var d = 0; d < a.length - 1; d++) {
          var f = a[d];
          if (!(f in c)) break a;
          c = c[f];
        }
        a = a[a.length - 1];
        d = c[a];
        b = b(d);
        b != d &&
          null != b &&
          ba(c, a, { configurable: !0, writable: !0, value: b });
      }
  }
  J("Symbol", function (a) {
    function b(h) {
      if (this instanceof b) throw new TypeError("Symbol is not a constructor");
      return new c(d + (h || "") + "_" + f++, h);
    }
    function c(h, e) {
      this.g = h;
      ba(this, "description", { configurable: !0, writable: !0, value: e });
    }
    if (a) return a;
    c.prototype.toString = function () {
      return this.g;
    };
    var d = "jscomp_symbol_" + ((1e9 * Math.random()) >>> 0) + "_",
      f = 0;
    return b;
  });
  J("Symbol.iterator", function (a) {
    if (a) return a;
    a = Symbol("Symbol.iterator");
    for (
      var b =
          "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(
            " "
          ),
        c = 0;
      c < b.length;
      c++
    ) {
      var d = H[b[c]];
      "function" === typeof d &&
        "function" != typeof d.prototype[a] &&
        ba(d.prototype, a, {
          configurable: !0,
          writable: !0,
          value: function () {
            return da(aa(this));
          },
        });
    }
    return a;
  });
  function da(a) {
    a = { next: a };
    a[Symbol.iterator] = function () {
      return this;
    };
    return a;
  }
  function M(a) {
    var b =
      "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
    return b ? b.call(a) : { next: aa(a) };
  }
  function ea(a) {
    if (!(a instanceof Array)) {
      a = M(a);
      for (var b, c = []; !(b = a.next()).done; ) c.push(b.value);
      a = c;
    }
    return a;
  }
  var fa =
      "function" == typeof Object.create
        ? Object.create
        : function (a) {
            function b() {}
            b.prototype = a;
            return new b();
          },
    ha;
  if ("function" == typeof Object.setPrototypeOf) ha = Object.setPrototypeOf;
  else {
    var ia;
    a: {
      var ja = { a: !0 },
        ka = {};
      try {
        ka.__proto__ = ja;
        ia = ka.a;
        break a;
      } catch (a) {}
      ia = !1;
    }
    ha = ia
      ? function (a, b) {
          a.__proto__ = b;
          if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
          return a;
        }
      : null;
  }
  var la = ha;
  function ma(a, b) {
    a.prototype = fa(b.prototype);
    a.prototype.constructor = a;
    if (la) la(a, b);
    else
      for (var c in b)
        if ("prototype" != c)
          if (Object.defineProperties) {
            var d = Object.getOwnPropertyDescriptor(b, c);
            d && Object.defineProperty(a, c, d);
          } else a[c] = b[c];
    a.ea = b.prototype;
  }
  function na() {
    this.l = !1;
    this.i = null;
    this.h = void 0;
    this.g = 1;
    this.s = this.m = 0;
    this.j = null;
  }
  function oa(a) {
    if (a.l) throw new TypeError("Generator is already running");
    a.l = !0;
  }
  na.prototype.o = function (a) {
    this.h = a;
  };
  function pa(a, b) {
    a.j = { U: b, V: !0 };
    a.g = a.m || a.s;
  }
  na.prototype.return = function (a) {
    this.j = { return: a };
    this.g = this.s;
  };
  function N(a, b, c) {
    a.g = c;
    return { value: b };
  }
  function qa(a) {
    this.g = new na();
    this.h = a;
  }
  function ra(a, b) {
    oa(a.g);
    var c = a.g.i;
    if (c)
      return sa(
        a,
        "return" in c
          ? c["return"]
          : function (d) {
              return { value: d, done: !0 };
            },
        b,
        a.g.return
      );
    a.g.return(b);
    return ta(a);
  }
  function sa(a, b, c, d) {
    try {
      var f = b.call(a.g.i, c);
      if (!(f instanceof Object))
        throw new TypeError("Iterator result " + f + " is not an object");
      if (!f.done) return (a.g.l = !1), f;
      var h = f.value;
    } catch (e) {
      return (a.g.i = null), pa(a.g, e), ta(a);
    }
    a.g.i = null;
    d.call(a.g, h);
    return ta(a);
  }
  function ta(a) {
    for (; a.g.g; )
      try {
        var b = a.h(a.g);
        if (b) return (a.g.l = !1), { value: b.value, done: !1 };
      } catch (c) {
        (a.g.h = void 0), pa(a.g, c);
      }
    a.g.l = !1;
    if (a.g.j) {
      b = a.g.j;
      a.g.j = null;
      if (b.V) throw b.U;
      return { value: b.return, done: !0 };
    }
    return { value: void 0, done: !0 };
  }
  function ua(a) {
    this.next = function (b) {
      oa(a.g);
      a.g.i ? (b = sa(a, a.g.i.next, b, a.g.o)) : (a.g.o(b), (b = ta(a)));
      return b;
    };
    this.throw = function (b) {
      oa(a.g);
      a.g.i ? (b = sa(a, a.g.i["throw"], b, a.g.o)) : (pa(a.g, b), (b = ta(a)));
      return b;
    };
    this.return = function (b) {
      return ra(a, b);
    };
    this[Symbol.iterator] = function () {
      return this;
    };
  }
  function O(a, b) {
    b = new ua(new qa(b));
    la && a.prototype && la(b, a.prototype);
    return b;
  }
  function va(a, b) {
    a instanceof String && (a += "");
    var c = 0,
      d = !1,
      f = {
        next: function () {
          if (!d && c < a.length) {
            var h = c++;
            return { value: b(h, a[h]), done: !1 };
          }
          d = !0;
          return { done: !0, value: void 0 };
        },
      };
    f[Symbol.iterator] = function () {
      return f;
    };
    return f;
  }
  var wa =
    "function" == typeof Object.assign
      ? Object.assign
      : function (a, b) {
          for (var c = 1; c < arguments.length; c++) {
            var d = arguments[c];
            if (d)
              for (var f in d)
                Object.prototype.hasOwnProperty.call(d, f) && (a[f] = d[f]);
          }
          return a;
        };
  J("Object.assign", function (a) {
    return a || wa;
  });
  J("Promise", function (a) {
    function b(e) {
      this.h = 0;
      this.i = void 0;
      this.g = [];
      this.o = !1;
      var g = this.j();
      try {
        e(g.resolve, g.reject);
      } catch (k) {
        g.reject(k);
      }
    }
    function c() {
      this.g = null;
    }
    function d(e) {
      return e instanceof b
        ? e
        : new b(function (g) {
            g(e);
          });
    }
    if (a) return a;
    c.prototype.h = function (e) {
      if (null == this.g) {
        this.g = [];
        var g = this;
        this.i(function () {
          g.l();
        });
      }
      this.g.push(e);
    };
    var f = H.setTimeout;
    c.prototype.i = function (e) {
      f(e, 0);
    };
    c.prototype.l = function () {
      for (; this.g && this.g.length; ) {
        var e = this.g;
        this.g = [];
        for (var g = 0; g < e.length; ++g) {
          var k = e[g];
          e[g] = null;
          try {
            k();
          } catch (l) {
            this.j(l);
          }
        }
      }
      this.g = null;
    };
    c.prototype.j = function (e) {
      this.i(function () {
        throw e;
      });
    };
    b.prototype.j = function () {
      function e(l) {
        return function (q) {
          k || ((k = !0), l.call(g, q));
        };
      }
      var g = this,
        k = !1;
      return { resolve: e(this.C), reject: e(this.l) };
    };
    b.prototype.C = function (e) {
      if (e === this)
        this.l(new TypeError("A Promise cannot resolve to itself"));
      else if (e instanceof b) this.F(e);
      else {
        a: switch (typeof e) {
          case "object":
            var g = null != e;
            break a;
          case "function":
            g = !0;
            break a;
          default:
            g = !1;
        }
        g ? this.u(e) : this.m(e);
      }
    };
    b.prototype.u = function (e) {
      var g = void 0;
      try {
        g = e.then;
      } catch (k) {
        this.l(k);
        return;
      }
      "function" == typeof g ? this.G(g, e) : this.m(e);
    };
    b.prototype.l = function (e) {
      this.s(2, e);
    };
    b.prototype.m = function (e) {
      this.s(1, e);
    };
    b.prototype.s = function (e, g) {
      if (0 != this.h)
        throw Error(
          "Cannot settle(" +
            e +
            ", " +
            g +
            "): Promise already settled in state" +
            this.h
        );
      this.h = e;
      this.i = g;
      2 === this.h && this.D();
      this.A();
    };
    b.prototype.D = function () {
      var e = this;
      f(function () {
        if (e.B()) {
          var g = H.console;
          "undefined" !== typeof g && g.error(e.i);
        }
      }, 1);
    };
    b.prototype.B = function () {
      if (this.o) return !1;
      var e = H.CustomEvent,
        g = H.Event,
        k = H.dispatchEvent;
      if ("undefined" === typeof k) return !0;
      "function" === typeof e
        ? (e = new e("unhandledrejection", { cancelable: !0 }))
        : "function" === typeof g
        ? (e = new g("unhandledrejection", { cancelable: !0 }))
        : ((e = H.document.createEvent("CustomEvent")),
          e.initCustomEvent("unhandledrejection", !1, !0, e));
      e.promise = this;
      e.reason = this.i;
      return k(e);
    };
    b.prototype.A = function () {
      if (null != this.g) {
        for (var e = 0; e < this.g.length; ++e) h.h(this.g[e]);
        this.g = null;
      }
    };
    var h = new c();
    b.prototype.F = function (e) {
      var g = this.j();
      e.J(g.resolve, g.reject);
    };
    b.prototype.G = function (e, g) {
      var k = this.j();
      try {
        e.call(g, k.resolve, k.reject);
      } catch (l) {
        k.reject(l);
      }
    };
    b.prototype.then = function (e, g) {
      function k(w, t) {
        return "function" == typeof w
          ? function (y) {
              try {
                l(w(y));
              } catch (m) {
                q(m);
              }
            }
          : t;
      }
      var l,
        q,
        v = new b(function (w, t) {
          l = w;
          q = t;
        });
      this.J(k(e, l), k(g, q));
      return v;
    };
    b.prototype.catch = function (e) {
      return this.then(void 0, e);
    };
    b.prototype.J = function (e, g) {
      function k() {
        switch (l.h) {
          case 1:
            e(l.i);
            break;
          case 2:
            g(l.i);
            break;
          default:
            throw Error("Unexpected state: " + l.h);
        }
      }
      var l = this;
      null == this.g ? h.h(k) : this.g.push(k);
      this.o = !0;
    };
    b.resolve = d;
    b.reject = function (e) {
      return new b(function (g, k) {
        k(e);
      });
    };
    b.race = function (e) {
      return new b(function (g, k) {
        for (var l = M(e), q = l.next(); !q.done; q = l.next())
          d(q.value).J(g, k);
      });
    };
    b.all = function (e) {
      var g = M(e),
        k = g.next();
      return k.done
        ? d([])
        : new b(function (l, q) {
            function v(y) {
              return function (m) {
                w[y] = m;
                t--;
                0 == t && l(w);
              };
            }
            var w = [],
              t = 0;
            do
              w.push(void 0),
                t++,
                d(k.value).J(v(w.length - 1), q),
                (k = g.next());
            while (!k.done);
          });
    };
    return b;
  });
  J("Object.is", function (a) {
    return a
      ? a
      : function (b, c) {
          return b === c ? 0 !== b || 1 / b === 1 / c : b !== b && c !== c;
        };
  });
  J("Array.prototype.includes", function (a) {
    return a
      ? a
      : function (b, c) {
          var d = this;
          d instanceof String && (d = String(d));
          var f = d.length;
          c = c || 0;
          for (0 > c && (c = Math.max(c + f, 0)); c < f; c++) {
            var h = d[c];
            if (h === b || Object.is(h, b)) return !0;
          }
          return !1;
        };
  });
  J("String.prototype.includes", function (a) {
    return a
      ? a
      : function (b, c) {
          if (null == this)
            throw new TypeError(
              "The 'this' value for String.prototype.includes must not be null or undefined"
            );
          if (b instanceof RegExp)
            throw new TypeError(
              "First argument to String.prototype.includes must not be a regular expression"
            );
          return -1 !== this.indexOf(b, c || 0);
        };
  });
  J("Array.prototype.keys", function (a) {
    return a
      ? a
      : function () {
          return va(this, function (b) {
            return b;
          });
        };
  });
  var xa = this || self;
  function ya(a, b) {
    a = a.split(".");
    var c = xa;
    a[0] in c ||
      "undefined" == typeof c.execScript ||
      c.execScript("var " + a[0]);
    for (var d; a.length && (d = a.shift()); )
      a.length || void 0 === b
        ? c[d] && c[d] !== Object.prototype[d]
          ? (c = c[d])
          : (c = c[d] = {})
        : (c[d] = b);
  }
  function za(a, b) {
    b = String.fromCharCode.apply(null, b);
    return null == a ? b : a + b;
  }
  var Aa,
    Ba = "undefined" !== typeof TextDecoder,
    Ca,
    Da = "undefined" !== typeof TextEncoder;
  function Ea(a) {
    if (Da) a = (Ca || (Ca = new TextEncoder())).encode(a);
    else {
      var b = void 0;
      b = void 0 === b ? !1 : b;
      for (
        var c = 0, d = new Uint8Array(3 * a.length), f = 0;
        f < a.length;
        f++
      ) {
        var h = a.charCodeAt(f);
        if (128 > h) d[c++] = h;
        else {
          if (2048 > h) d[c++] = (h >> 6) | 192;
          else {
            if (55296 <= h && 57343 >= h) {
              if (56319 >= h && f < a.length) {
                var e = a.charCodeAt(++f);
                if (56320 <= e && 57343 >= e) {
                  h = 1024 * (h - 55296) + e - 56320 + 65536;
                  d[c++] = (h >> 18) | 240;
                  d[c++] = ((h >> 12) & 63) | 128;
                  d[c++] = ((h >> 6) & 63) | 128;
                  d[c++] = (h & 63) | 128;
                  continue;
                } else f--;
              }
              if (b) throw Error("Found an unpaired surrogate");
              h = 65533;
            }
            d[c++] = (h >> 12) | 224;
            d[c++] = ((h >> 6) & 63) | 128;
          }
          d[c++] = (h & 63) | 128;
        }
      }
      a = d.subarray(0, c);
    }
    return a;
  }
  var Fa = {},
    Ga = null;
  function Ha(a, b) {
    void 0 === b && (b = 0);
    Ja();
    b = Fa[b];
    for (
      var c = Array(Math.floor(a.length / 3)), d = b[64] || "", f = 0, h = 0;
      f < a.length - 2;
      f += 3
    ) {
      var e = a[f],
        g = a[f + 1],
        k = a[f + 2],
        l = b[e >> 2];
      e = b[((e & 3) << 4) | (g >> 4)];
      g = b[((g & 15) << 2) | (k >> 6)];
      k = b[k & 63];
      c[h++] = l + e + g + k;
    }
    l = 0;
    k = d;
    switch (a.length - f) {
      case 2:
        (l = a[f + 1]), (k = b[(l & 15) << 2] || d);
      case 1:
        (a = a[f]), (c[h] = b[a >> 2] + b[((a & 3) << 4) | (l >> 4)] + k + d);
    }
    return c.join("");
  }
  function Ka(a) {
    var b = a.length,
      c = (3 * b) / 4;
    c % 3
      ? (c = Math.floor(c))
      : -1 != "=.".indexOf(a[b - 1]) &&
        (c = -1 != "=.".indexOf(a[b - 2]) ? c - 2 : c - 1);
    var d = new Uint8Array(c),
      f = 0;
    La(a, function (h) {
      d[f++] = h;
    });
    return d.subarray(0, f);
  }
  function La(a, b) {
    function c(k) {
      for (; d < a.length; ) {
        var l = a.charAt(d++),
          q = Ga[l];
        if (null != q) return q;
        if (!/^[\s\xa0]*$/.test(l))
          throw Error("Unknown base64 encoding at char: " + l);
      }
      return k;
    }
    Ja();
    for (var d = 0; ; ) {
      var f = c(-1),
        h = c(0),
        e = c(64),
        g = c(64);
      if (64 === g && -1 === f) break;
      b((f << 2) | (h >> 4));
      64 != e &&
        (b(((h << 4) & 240) | (e >> 2)), 64 != g && b(((e << 6) & 192) | g));
    }
  }
  function Ja() {
    if (!Ga) {
      Ga = {};
      for (
        var a =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(
              ""
            ),
          b = ["+/=", "+/", "-_=", "-_.", "-_"],
          c = 0;
        5 > c;
        c++
      ) {
        var d = a.concat(b[c].split(""));
        Fa[c] = d;
        for (var f = 0; f < d.length; f++) {
          var h = d[f];
          void 0 === Ga[h] && (Ga[h] = f);
        }
      }
    }
  }
  var Ma = "function" === typeof Uint8Array.prototype.slice,
    Na;
  function Oa(a, b, c) {
    return b === c
      ? Na || (Na = new Uint8Array(0))
      : Ma
      ? a.slice(b, c)
      : new Uint8Array(a.subarray(b, c));
  }
  var P = 0,
    Q = 0;
  function Pa(a, b) {
    b = void 0 === b ? {} : b;
    b = void 0 === b.v ? !1 : b.v;
    this.h = null;
    this.g = this.i = this.j = 0;
    this.l = !1;
    this.v = b;
    a && Qa(this, a);
  }
  function Qa(a, b) {
    b =
      b.constructor === Uint8Array
        ? b
        : b.constructor === ArrayBuffer
        ? new Uint8Array(b)
        : b.constructor === Array
        ? new Uint8Array(b)
        : b.constructor === String
        ? Ka(b)
        : b instanceof Uint8Array
        ? new Uint8Array(b.buffer, b.byteOffset, b.byteLength)
        : new Uint8Array(0);
    a.h = b;
    a.j = 0;
    a.i = a.h.length;
    a.g = a.j;
  }
  Pa.prototype.reset = function () {
    this.g = this.j;
  };
  function Ra(a) {
    var b = a.h,
      c = b[a.g],
      d = c & 127;
    if (128 > c) return (a.g += 1), d;
    c = b[a.g + 1];
    d |= (c & 127) << 7;
    if (128 > c) return (a.g += 2), d;
    c = b[a.g + 2];
    d |= (c & 127) << 14;
    if (128 > c) return (a.g += 3), d;
    c = b[a.g + 3];
    d |= (c & 127) << 21;
    if (128 > c) return (a.g += 4), d;
    c = b[a.g + 4];
    d |= (c & 15) << 28;
    if (128 > c) return (a.g += 5), d >>> 0;
    a.g += 5;
    128 <= b[a.g++] &&
      128 <= b[a.g++] &&
      128 <= b[a.g++] &&
      128 <= b[a.g++] &&
      a.g++;
    return d;
  }
  function R(a) {
    var b = a.h[a.g];
    var c = a.h[a.g + 1];
    var d = a.h[a.g + 2],
      f = a.h[a.g + 3];
    a.g += 4;
    c = ((b << 0) | (c << 8) | (d << 16) | (f << 24)) >>> 0;
    a = 2 * (c >> 31) + 1;
    b = (c >>> 23) & 255;
    c &= 8388607;
    return 255 == b
      ? c
        ? NaN
        : Infinity * a
      : 0 == b
      ? a * Math.pow(2, -149) * c
      : a * Math.pow(2, b - 150) * (c + Math.pow(2, 23));
  }
  var Sa = [];
  function Ta() {
    this.g = new Uint8Array(64);
    this.h = 0;
  }
  Ta.prototype.push = function (a) {
    if (!(this.h + 1 < this.g.length)) {
      var b = this.g;
      this.g = new Uint8Array(Math.ceil(1 + 2 * this.g.length));
      this.g.set(b);
    }
    this.g[this.h++] = a;
  };
  Ta.prototype.length = function () {
    return this.h;
  };
  Ta.prototype.end = function () {
    var a = this.g,
      b = this.h;
    this.h = 0;
    return Oa(a, 0, b);
  };
  function S(a, b) {
    for (; 127 < b; ) a.push((b & 127) | 128), (b >>>= 7);
    a.push(b);
  }
  function Ua(a) {
    var b = {},
      c = void 0 === b.N ? !1 : b.N;
    this.o = { v: void 0 === b.v ? !1 : b.v };
    this.N = c;
    b = this.o;
    Sa.length
      ? ((c = Sa.pop()), b && (c.v = b.v), a && Qa(c, a), (a = c))
      : (a = new Pa(a, b));
    this.g = a;
    this.m = this.g.g;
    this.h = this.i = this.l = -1;
    this.j = !1;
  }
  Ua.prototype.reset = function () {
    this.g.reset();
    this.h = this.l = -1;
  };
  function Va(a) {
    var b = a.g;
    (b = b.g == b.i) ||
      (b = a.j) ||
      ((b = a.g), (b = b.l || 0 > b.g || b.g > b.i));
    if (b) return !1;
    a.m = a.g.g;
    b = Ra(a.g);
    var c = b & 7;
    if (0 != c && 5 != c && 1 != c && 2 != c && 3 != c && 4 != c)
      return (a.j = !0), !1;
    a.i = b;
    a.l = b >>> 3;
    a.h = c;
    return !0;
  }
  function Wa(a) {
    switch (a.h) {
      case 0:
        if (0 != a.h) Wa(a);
        else {
          for (a = a.g; a.h[a.g] & 128; ) a.g++;
          a.g++;
        }
        break;
      case 1:
        1 != a.h ? Wa(a) : ((a = a.g), (a.g += 8));
        break;
      case 2:
        if (2 != a.h) Wa(a);
        else {
          var b = Ra(a.g);
          a = a.g;
          a.g += b;
        }
        break;
      case 5:
        5 != a.h ? Wa(a) : ((a = a.g), (a.g += 4));
        break;
      case 3:
        b = a.l;
        do {
          if (!Va(a)) {
            a.j = !0;
            break;
          }
          if (4 == a.h) {
            a.l != b && (a.j = !0);
            break;
          }
          Wa(a);
        } while (1);
        break;
      default:
        a.j = !0;
    }
  }
  function Xa(a, b, c) {
    var d = a.g.i,
      f = Ra(a.g);
    f = a.g.g + f;
    a.g.i = f;
    c(b, a);
    a.g.g = f;
    a.g.i = d;
    return b;
  }
  function Ya(a) {
    var b = Ra(a.g);
    a = a.g;
    var c = a.g;
    a.g += b;
    a = a.h;
    var d;
    if (Ba)
      (d = Aa) || (d = Aa = new TextDecoder("utf-8", { fatal: !1 })),
        (d = d.decode(a.subarray(c, c + b)));
    else {
      b = c + b;
      for (var f = [], h = null, e, g, k; c < b; )
        (e = a[c++]),
          128 > e
            ? f.push(e)
            : 224 > e
            ? c >= b
              ? f.push(65533)
              : ((g = a[c++]),
                194 > e || 128 !== (g & 192)
                  ? (c--, f.push(65533))
                  : f.push(((e & 31) << 6) | (g & 63)))
            : 240 > e
            ? c >= b - 1
              ? f.push(65533)
              : ((g = a[c++]),
                128 !== (g & 192) ||
                (224 === e && 160 > g) ||
                (237 === e && 160 <= g) ||
                128 !== ((d = a[c++]) & 192)
                  ? (c--, f.push(65533))
                  : f.push(((e & 15) << 12) | ((g & 63) << 6) | (d & 63)))
            : 244 >= e
            ? c >= b - 2
              ? f.push(65533)
              : ((g = a[c++]),
                128 !== (g & 192) ||
                0 !== ((e << 28) + (g - 144)) >> 30 ||
                128 !== ((d = a[c++]) & 192) ||
                128 !== ((k = a[c++]) & 192)
                  ? (c--, f.push(65533))
                  : ((e =
                      ((e & 7) << 18) |
                      ((g & 63) << 12) |
                      ((d & 63) << 6) |
                      (k & 63)),
                    (e -= 65536),
                    f.push(((e >> 10) & 1023) + 55296, (e & 1023) + 56320)))
            : f.push(65533),
          8192 <= f.length && ((h = za(h, f)), (f.length = 0));
      d = za(h, f);
    }
    return d;
  }
  function Za() {
    this.h = [];
    this.i = 0;
    this.g = new Ta();
  }
  function $a(a, b) {
    0 !== b.length && (a.h.push(b), (a.i += b.length));
  }
  function ab(a) {
    var b = a.i + a.g.length();
    if (0 === b) return new Uint8Array(0);
    b = new Uint8Array(b);
    for (var c = a.h, d = c.length, f = 0, h = 0; h < d; h++) {
      var e = c[h];
      0 !== e.length && (b.set(e, f), (f += e.length));
    }
    c = a.g;
    d = c.h;
    0 !== d && (b.set(c.g.subarray(0, d), f), (c.h = 0));
    a.h = [b];
    return b;
  }
  function T(a, b, c) {
    if (null != c) {
      S(a.g, 8 * b + 5);
      a = a.g;
      var d = c;
      d = (c = 0 > d ? 1 : 0) ? -d : d;
      0 === d
        ? 0 < 1 / d
          ? (P = Q = 0)
          : ((Q = 0), (P = 2147483648))
        : isNaN(d)
        ? ((Q = 0), (P = 2147483647))
        : 3.4028234663852886e38 < d
        ? ((Q = 0), (P = ((c << 31) | 2139095040) >>> 0))
        : 1.1754943508222875e-38 > d
        ? ((d = Math.round(d / Math.pow(2, -149))),
          (Q = 0),
          (P = ((c << 31) | d) >>> 0))
        : ((b = Math.floor(Math.log(d) / Math.LN2)),
          (d *= Math.pow(2, -b)),
          (d = Math.round(8388608 * d) & 8388607),
          (Q = 0),
          (P = ((c << 31) | ((b + 127) << 23) | d) >>> 0));
      c = P;
      a.push((c >>> 0) & 255);
      a.push((c >>> 8) & 255);
      a.push((c >>> 16) & 255);
      a.push((c >>> 24) & 255);
    }
  }
  var bb = "function" === typeof Uint8Array;
  function cb(a, b, c) {
    if (null != a)
      return "object" === typeof a
        ? bb && a instanceof Uint8Array
          ? c(a)
          : db(a, b, c)
        : b(a);
  }
  function db(a, b, c) {
    if (Array.isArray(a)) {
      for (var d = Array(a.length), f = 0; f < a.length; f++)
        d[f] = cb(a[f], b, c);
      Array.isArray(a) && a.W && eb(d);
      return d;
    }
    d = {};
    for (f in a) d[f] = cb(a[f], b, c);
    return d;
  }
  function fb(a) {
    return "number" === typeof a ? (isFinite(a) ? a : String(a)) : a;
  }
  var gb = { W: { value: !0, configurable: !0 } };
  function eb(a) {
    Array.isArray(a) && !Object.isFrozen(a) && Object.defineProperties(a, gb);
    return a;
  }
  var hb;
  function U(a, b, c) {
    var d = hb;
    hb = null;
    a || (a = d);
    d = this.constructor.ca;
    a || (a = d ? [d] : []);
    this.j = d ? 0 : -1;
    this.i = null;
    this.g = a;
    a: {
      d = this.g.length;
      a = d - 1;
      if (
        d &&
        ((d = this.g[a]),
        null !== d && "object" === typeof d && d.constructor === Object)
      ) {
        this.l = a - this.j;
        this.h = d;
        break a;
      }
      void 0 !== b && -1 < b
        ? ((this.l = Math.max(b, a + 1 - this.j)), (this.h = null))
        : (this.l = Number.MAX_VALUE);
    }
    if (c)
      for (b = 0; b < c.length; b++)
        (a = c[b]),
          a < this.l
            ? ((a += this.j), (d = this.g[a]) ? eb(d) : (this.g[a] = ib))
            : (jb(this), (d = this.h[a]) ? eb(d) : (this.h[a] = ib));
  }
  var ib = Object.freeze(eb([]));
  function jb(a) {
    var b = a.l + a.j;
    a.g[b] || (a.h = a.g[b] = {});
  }
  function V(a, b, c) {
    return -1 === b
      ? null
      : (void 0 === c ? 0 : c) || b >= a.l
      ? a.h
        ? a.h[b]
        : void 0
      : a.g[b + a.j];
  }
  function kb(a) {
    var b = void 0 === b ? !1 : b;
    var c = V(a, 1, b);
    null == c && (c = ib);
    c === ib && ((c = eb([])), W(a, 1, c, b));
    return c;
  }
  function X(a, b, c) {
    a = V(a, b);
    a = null == a ? a : +a;
    return null == a ? (void 0 === c ? 0 : c) : a;
  }
  function W(a, b, c, d) {
    (void 0 === d ? 0 : d) || b >= a.l
      ? (jb(a), (a.h[b] = c))
      : (a.g[b + a.j] = c);
  }
  function lb(a, b) {
    a.i || (a.i = {});
    var c = a.i[1];
    if (!c) {
      var d = kb(a);
      c = [];
      for (var f = 0; f < d.length; f++) c[f] = new b(d[f]);
      a.i[1] = c;
    }
    return c;
  }
  function mb(a, b, c, d) {
    var f = lb(a, c);
    b = b ? b : new c();
    a = kb(a);
    void 0 != d
      ? (f.splice(d, 0, b), a.splice(d, 0, nb(b, !1)))
      : (f.push(b), a.push(nb(b, !1)));
  }
  U.prototype.toJSON = function () {
    var a = nb(this, !1);
    return db(a, fb, Ha);
  };
  function nb(a, b) {
    if (a.i)
      for (var c in a.i) {
        var d = a.i[c];
        if (Array.isArray(d))
          for (var f = 0; f < d.length; f++) d[f] && nb(d[f], b);
        else d && nb(d, b);
      }
    return a.g;
  }
  U.prototype.toString = function () {
    return nb(this, !1).toString();
  };
  function ob(a, b) {
    a = V(a, b);
    return null == a ? 0 : a;
  }
  function pb(a, b) {
    a = V(a, b);
    return null == a ? "" : a;
  }
  function qb(a, b) {
    if ((a = a.m)) {
      $a(b, b.g.end());
      for (var c = 0; c < a.length; c++) $a(b, a[c]);
    }
  }
  function rb(a, b) {
    if (4 == b.h) return !1;
    var c = b.m;
    Wa(b);
    b.N || ((b = Oa(b.g.h, c, b.g.g)), (c = a.m) ? c.push(b) : (a.m = [b]));
    return !0;
  }
  function Y(a, b) {
    var c = void 0;
    return new (c || (c = Promise))(function (d, f) {
      function h(k) {
        try {
          g(b.next(k));
        } catch (l) {
          f(l);
        }
      }
      function e(k) {
        try {
          g(b["throw"](k));
        } catch (l) {
          f(l);
        }
      }
      function g(k) {
        k.done
          ? d(k.value)
          : new c(function (l) {
              l(k.value);
            }).then(h, e);
      }
      g((b = b.apply(a, void 0)).next());
    });
  }
  function sb(a) {
    U.call(this, a);
  }
  ma(sb, U);
  function tb(a, b) {
    for (; Va(b); )
      switch (b.i) {
        case 8:
          var c = Ra(b.g);
          W(a, 1, c);
          break;
        case 21:
          c = R(b.g);
          W(a, 2, c);
          break;
        case 26:
          c = Ya(b);
          W(a, 3, c);
          break;
        case 34:
          c = Ya(b);
          W(a, 4, c);
          break;
        default:
          if (!rb(a, b)) return a;
      }
    return a;
  }
  function ub(a) {
    U.call(this, a, -1, vb);
  }
  ma(ub, U);
  ub.prototype.addClassification = function (a, b) {
    mb(this, a, sb, b);
  };
  var vb = [1];
  function wb(a) {
    U.call(this, a);
  }
  ma(wb, U);
  function xb(a, b) {
    for (; Va(b); )
      switch (b.i) {
        case 13:
          var c = R(b.g);
          W(a, 1, c);
          break;
        case 21:
          c = R(b.g);
          W(a, 2, c);
          break;
        case 29:
          c = R(b.g);
          W(a, 3, c);
          break;
        case 37:
          c = R(b.g);
          W(a, 4, c);
          break;
        case 45:
          c = R(b.g);
          W(a, 5, c);
          break;
        default:
          if (!rb(a, b)) return a;
      }
    return a;
  }
  function yb(a) {
    U.call(this, a, -1, zb);
  }
  ma(yb, U);
  var zb = [1];
  function Ab(a) {
    U.call(this, a);
  }
  ma(Ab, U);
  function Bb(a, b, c) {
    c = a.createShader(0 === c ? a.VERTEX_SHADER : a.FRAGMENT_SHADER);
    a.shaderSource(c, b);
    a.compileShader(c);
    if (!a.getShaderParameter(c, a.COMPILE_STATUS))
      throw Error(
        "Could not compile WebGL shader.\n\n" + a.getShaderInfoLog(c)
      );
    return c;
  }
  function Cb(a) {
    return lb(a, sb).map(function (b) {
      return {
        index: ob(b, 1),
        Y: X(b, 2),
        label: null != V(b, 3) ? pb(b, 3) : void 0,
        displayName: null != V(b, 4) ? pb(b, 4) : void 0,
      };
    });
  }
  function Db(a) {
    return {
      x: X(a, 1),
      y: X(a, 2),
      z: X(a, 3),
      visibility: null != V(a, 4) ? X(a, 4) : void 0,
    };
  }
  function Eb(a, b) {
    this.h = a;
    this.g = b;
    this.l = 0;
  }
  function Fb(a, b, c) {
    Gb(a, b);
    if ("function" === typeof a.g.canvas.transferToImageBitmap)
      return Promise.resolve(a.g.canvas.transferToImageBitmap());
    if (c) return Promise.resolve(a.g.canvas);
    if ("function" === typeof createImageBitmap)
      return createImageBitmap(a.g.canvas);
    void 0 === a.i && (a.i = document.createElement("canvas"));
    return new Promise(function (d) {
      a.i.height = a.g.canvas.height;
      a.i.width = a.g.canvas.width;
      a.i
        .getContext("2d", {})
        .drawImage(a.g.canvas, 0, 0, a.g.canvas.width, a.g.canvas.height);
      d(a.i);
    });
  }
  function Gb(a, b) {
    var c = a.g;
    if (void 0 === a.m) {
      var d = Bb(
          c,
          "\n  attribute vec2 aVertex;\n  attribute vec2 aTex;\n  varying vec2 vTex;\n  void main(void) {\n    gl_Position = vec4(aVertex, 0.0, 1.0);\n    vTex = aTex;\n  }",
          0
        ),
        f = Bb(
          c,
          "\n  precision mediump float;\n  varying vec2 vTex;\n  uniform sampler2D sampler0;\n  void main(){\n    gl_FragColor = texture2D(sampler0, vTex);\n  }",
          1
        ),
        h = c.createProgram();
      c.attachShader(h, d);
      c.attachShader(h, f);
      c.linkProgram(h);
      if (!c.getProgramParameter(h, c.LINK_STATUS))
        throw Error(
          "Could not compile WebGL program.\n\n" + c.getProgramInfoLog(h)
        );
      d = a.m = h;
      c.useProgram(d);
      f = c.getUniformLocation(d, "sampler0");
      a.j = {
        I: c.getAttribLocation(d, "aVertex"),
        H: c.getAttribLocation(d, "aTex"),
        da: f,
      };
      a.s = c.createBuffer();
      c.bindBuffer(c.ARRAY_BUFFER, a.s);
      c.enableVertexAttribArray(a.j.I);
      c.vertexAttribPointer(a.j.I, 2, c.FLOAT, !1, 0, 0);
      c.bufferData(
        c.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        c.STATIC_DRAW
      );
      c.bindBuffer(c.ARRAY_BUFFER, null);
      a.o = c.createBuffer();
      c.bindBuffer(c.ARRAY_BUFFER, a.o);
      c.enableVertexAttribArray(a.j.H);
      c.vertexAttribPointer(a.j.H, 2, c.FLOAT, !1, 0, 0);
      c.bufferData(
        c.ARRAY_BUFFER,
        new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]),
        c.STATIC_DRAW
      );
      c.bindBuffer(c.ARRAY_BUFFER, null);
      c.uniform1i(f, 0);
    }
    d = a.j;
    c.useProgram(a.m);
    c.canvas.width = b.width;
    c.canvas.height = b.height;
    c.viewport(0, 0, b.width, b.height);
    c.activeTexture(c.TEXTURE0);
    a.h.bindTexture2d(b.glName);
    c.enableVertexAttribArray(d.I);
    c.bindBuffer(c.ARRAY_BUFFER, a.s);
    c.vertexAttribPointer(d.I, 2, c.FLOAT, !1, 0, 0);
    c.enableVertexAttribArray(d.H);
    c.bindBuffer(c.ARRAY_BUFFER, a.o);
    c.vertexAttribPointer(d.H, 2, c.FLOAT, !1, 0, 0);
    c.bindFramebuffer(
      c.DRAW_FRAMEBUFFER ? c.DRAW_FRAMEBUFFER : c.FRAMEBUFFER,
      null
    );
    c.clearColor(0, 0, 0, 0);
    c.clear(c.COLOR_BUFFER_BIT);
    c.colorMask(!0, !0, !0, !0);
    c.drawArrays(c.TRIANGLE_FAN, 0, 4);
    c.disableVertexAttribArray(d.I);
    c.disableVertexAttribArray(d.H);
    c.bindBuffer(c.ARRAY_BUFFER, null);
    a.h.bindTexture2d(0);
  }
  function Hb(a) {
    this.g = a;
  }
  var Ib = new Uint8Array([
    0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 9, 1, 7, 0,
    65, 0, 253, 15, 26, 11,
  ]);
  function Jb(a, b) {
    return b + a;
  }
  function Kb(a, b) {
    window[a] = b;
  }
  function Lb(a) {
    var b = document.createElement("script");
    b.setAttribute("src", a);
    b.setAttribute("crossorigin", "anonymous");
    return new Promise(function (c) {
      b.addEventListener(
        "load",
        function () {
          c();
        },
        !1
      );
      b.addEventListener(
        "error",
        function () {
          c();
        },
        !1
      );
      document.body.appendChild(b);
    });
  }
  function Mb() {
    return Y(this, function b() {
      return O(b, function (c) {
        switch (c.g) {
          case 1:
            return (c.m = 2), N(c, WebAssembly.instantiate(Ib), 4);
          case 4:
            c.g = 3;
            c.m = 0;
            break;
          case 2:
            return (c.m = 0), (c.j = null), c.return(!1);
          case 3:
            return c.return(!0);
        }
      });
    });
  }
  function Nb(a) {
    this.g = a;
    this.listeners = {};
    this.j = {};
    this.F = {};
    this.m = {};
    this.s = {};
    this.G = this.o = this.R = !0;
    this.C = Promise.resolve();
    this.P = "";
    this.B = {};
    this.locateFile = (a && a.locateFile) || Jb;
    if ("object" === typeof window)
      var b =
        window.location.pathname
          .toString()
          .substring(0, window.location.pathname.toString().lastIndexOf("/")) +
        "/";
    else if ("undefined" !== typeof location)
      b =
        location.pathname
          .toString()
          .substring(0, location.pathname.toString().lastIndexOf("/")) + "/";
    else
      throw Error(
        "solutions can only be loaded on a web page or in a web worker"
      );
    this.S = b;
    if (a.options) {
      b = M(Object.keys(a.options));
      for (var c = b.next(); !c.done; c = b.next()) {
        c = c.value;
        var d = a.options[c].default;
        void 0 !== d && (this.j[c] = "function" === typeof d ? d() : d);
      }
    }
  }
  D = Nb.prototype;
  D.close = function () {
    this.i && this.i.delete();
    return Promise.resolve();
  };
  function Ob(a, b) {
    return void 0 === a.g.files
      ? []
      : "function" === typeof a.g.files
      ? a.g.files(b)
      : a.g.files;
  }
  function Pb(a) {
    return Y(a, function c() {
      var d = this,
        f,
        h,
        e,
        g,
        k,
        l,
        q,
        v,
        w,
        t,
        y;
      return O(c, function (m) {
        switch (m.g) {
          case 1:
            f = d;
            if (!d.R) return m.return();
            h = Ob(d, d.j);
            return N(m, Mb(), 2);
          case 2:
            e = m.h;
            if ("object" === typeof window)
              return (
                Kb("createMediapipeSolutionsWasm", {
                  locateFile: d.locateFile,
                }),
                Kb("createMediapipeSolutionsPackedAssets", {
                  locateFile: d.locateFile,
                }),
                (l = h.filter(function (u) {
                  return void 0 !== u.data;
                })),
                (q = h.filter(function (u) {
                  return void 0 === u.data;
                })),
                (v = Promise.all(
                  l.map(function (u) {
                    var x = Qb(f, u.url);
                    if (void 0 !== u.path) {
                      var z = u.path;
                      x = x.then(function (E) {
                        f.overrideFile(z, E);
                        return Promise.resolve(E);
                      });
                    }
                    return x;
                  })
                )),
                (w = Promise.all(
                  q.map(function (u) {
                    return void 0 === u.simd || (u.simd && e) || (!u.simd && !e)
                      ? Lb(f.locateFile(u.url, f.S))
                      : Promise.resolve();
                  })
                ).then(function () {
                  return Y(f, function x() {
                    var z,
                      E,
                      F = this;
                    return O(x, function (K) {
                      if (1 == K.g)
                        return (
                          (z = window.createMediapipeSolutionsWasm),
                          (E = window.createMediapipeSolutionsPackedAssets),
                          N(K, z(E), 2)
                        );
                      F.h = K.h;
                      K.g = 0;
                    });
                  });
                })),
                (t = (function () {
                  return Y(f, function x() {
                    var z = this;
                    return O(x, function (E) {
                      z.g.graph && z.g.graph.url
                        ? (E = N(E, Qb(z, z.g.graph.url), 0))
                        : ((E.g = 0), (E = void 0));
                      return E;
                    });
                  });
                })()),
                N(m, Promise.all([w, v, t]), 7)
              );
            if ("function" !== typeof importScripts)
              throw Error(
                "solutions can only be loaded on a web page or in a web worker"
              );
            g = h
              .filter(function (u) {
                return void 0 === u.simd || (u.simd && e) || (!u.simd && !e);
              })
              .map(function (u) {
                return f.locateFile(u.url, f.S);
              });
            importScripts.apply(null, ea(g));
            return N(m, createMediapipeSolutionsWasm(Module), 6);
          case 6:
            d.h = m.h;
            d.l = new OffscreenCanvas(1, 1);
            d.h.canvas = d.l;
            k = d.h.GL.createContext(d.l, {
              antialias: !1,
              alpha: !1,
              ba: "undefined" !== typeof WebGL2RenderingContext ? 2 : 1,
            });
            d.h.GL.makeContextCurrent(k);
            m.g = 4;
            break;
          case 7:
            d.l = document.createElement("canvas");
            y = d.l.getContext("webgl2", {});
            if (!y && ((y = d.l.getContext("webgl", {})), !y))
              return (
                alert(
                  "Failed to create WebGL canvas context when passing video frame."
                ),
                m.return()
              );
            d.D = y;
            d.h.canvas = d.l;
            d.h.createContext(d.l, !0, !0, {});
          case 4:
            (d.i = new d.h.SolutionWasm()), (d.R = !1), (m.g = 0);
        }
      });
    });
  }
  function Rb(a) {
    return Y(a, function c() {
      var d = this,
        f,
        h,
        e,
        g,
        k,
        l,
        q,
        v;
      return O(c, function (w) {
        if (1 == w.g) {
          if (d.g.graph && d.g.graph.url && d.P === d.g.graph.url)
            return w.return();
          d.o = !0;
          if (!d.g.graph || !d.g.graph.url) {
            w.g = 2;
            return;
          }
          d.P = d.g.graph.url;
          return N(w, Qb(d, d.g.graph.url), 3);
        }
        2 != w.g && ((f = w.h), d.i.loadGraph(f));
        h = M(Object.keys(d.B));
        for (e = h.next(); !e.done; e = h.next())
          (g = e.value), d.i.overrideFile(g, d.B[g]);
        d.B = {};
        if (d.g.listeners)
          for (k = M(d.g.listeners), l = k.next(); !l.done; l = k.next())
            (q = l.value), Sb(d, q);
        v = d.j;
        d.j = {};
        d.setOptions(v);
        w.g = 0;
      });
    });
  }
  D.reset = function () {
    return Y(this, function b() {
      var c = this;
      return O(b, function (d) {
        c.i && (c.i.reset(), (c.m = {}), (c.s = {}));
        d.g = 0;
      });
    });
  };
  D.setOptions = function (a, b) {
    var c = this;
    if ((b = b || this.g.options)) {
      for (
        var d = [], f = [], h = {}, e = M(Object.keys(a)), g = e.next();
        !g.done;
        h = { K: h.K, L: h.L }, g = e.next()
      ) {
        var k = g.value;
        (k in this.j && this.j[k] === a[k]) ||
          ((this.j[k] = a[k]),
          (g = b[k]),
          void 0 !== g &&
            (g.onChange &&
              ((h.K = g.onChange),
              (h.L = a[k]),
              d.push(
                (function (l) {
                  return function () {
                    return Y(c, function v() {
                      var w,
                        t = this;
                      return O(v, function (y) {
                        if (1 == y.g) return N(y, l.K(l.L), 2);
                        w = y.h;
                        !0 === w && (t.o = !0);
                        y.g = 0;
                      });
                    });
                  };
                })(h)
              )),
            g.graphOptionXref &&
              ((k = {
                valueNumber: 1 === g.type ? a[k] : 0,
                valueBoolean: 0 === g.type ? a[k] : !1,
                valueString: 2 === g.type ? a[k] : "",
              }),
              (g = Object.assign(
                Object.assign(
                  Object.assign({}, { calculatorName: "", calculatorIndex: 0 }),
                  g.graphOptionXref
                ),
                k
              )),
              f.push(g))));
      }
      if (0 !== d.length || 0 !== f.length)
        (this.o = !0),
          (this.A = (void 0 === this.A ? [] : this.A).concat(f)),
          (this.u = (void 0 === this.u ? [] : this.u).concat(d));
    }
  };
  function Tb(a) {
    return Y(a, function c() {
      var d = this,
        f,
        h,
        e,
        g,
        k,
        l,
        q;
      return O(c, function (v) {
        switch (v.g) {
          case 1:
            if (!d.o) return v.return();
            if (!d.u) {
              v.g = 2;
              break;
            }
            f = M(d.u);
            h = f.next();
          case 3:
            if (h.done) {
              v.g = 5;
              break;
            }
            e = h.value;
            return N(v, e(), 4);
          case 4:
            h = f.next();
            v.g = 3;
            break;
          case 5:
            d.u = void 0;
          case 2:
            if (d.A) {
              g = new d.h.GraphOptionChangeRequestList();
              k = M(d.A);
              for (l = k.next(); !l.done; l = k.next())
                (q = l.value), g.push_back(q);
              d.i.changeOptions(g);
              g.delete();
              d.A = void 0;
            }
            d.o = !1;
            v.g = 0;
        }
      });
    });
  }
  D.initialize = function () {
    return Y(this, function b() {
      var c = this;
      return O(b, function (d) {
        return 1 == d.g
          ? N(d, Pb(c), 2)
          : 3 != d.g
          ? N(d, Rb(c), 3)
          : N(d, Tb(c), 0);
      });
    });
  };
  function Qb(a, b) {
    return Y(a, function d() {
      var f = this,
        h,
        e;
      return O(d, function (g) {
        if (b in f.F) return g.return(f.F[b]);
        h = f.locateFile(b, "");
        e = fetch(h).then(function (k) {
          return k.arrayBuffer();
        });
        f.F[b] = e;
        return g.return(e);
      });
    });
  }
  D.overrideFile = function (a, b) {
    this.i ? this.i.overrideFile(a, b) : (this.B[a] = b);
  };
  D.clearOverriddenFiles = function () {
    this.B = {};
    this.i && this.i.clearOverriddenFiles();
  };
  D.send = function (a, b) {
    return Y(this, function d() {
      var f = this,
        h,
        e,
        g,
        k,
        l,
        q,
        v,
        w,
        t;
      return O(d, function (y) {
        switch (y.g) {
          case 1:
            if (!f.g.inputs) return y.return();
            h = 1e3 * (void 0 === b || null === b ? performance.now() : b);
            return N(y, f.C, 2);
          case 2:
            return N(y, f.initialize(), 3);
          case 3:
            e = new f.h.PacketDataList();
            g = M(Object.keys(a));
            for (k = g.next(); !k.done; k = g.next())
              if (((l = k.value), (q = f.g.inputs[l]))) {
                a: {
                  var m = f;
                  var u = a[l];
                  switch (q.type) {
                    case "video":
                      var x = m.m[q.stream];
                      x || ((x = new Eb(m.h, m.D)), (m.m[q.stream] = x));
                      m = x;
                      0 === m.l && (m.l = m.h.createTexture());
                      if (
                        "undefined" !== typeof HTMLVideoElement &&
                        u instanceof HTMLVideoElement
                      ) {
                        var z = u.videoWidth;
                        x = u.videoHeight;
                      } else
                        "undefined" !== typeof HTMLImageElement &&
                        u instanceof HTMLImageElement
                          ? ((z = u.naturalWidth), (x = u.naturalHeight))
                          : ((z = u.width), (x = u.height));
                      x = { glName: m.l, width: z, height: x };
                      z = m.g;
                      z.canvas.width = x.width;
                      z.canvas.height = x.height;
                      z.activeTexture(z.TEXTURE0);
                      m.h.bindTexture2d(m.l);
                      z.texImage2D(
                        z.TEXTURE_2D,
                        0,
                        z.RGBA,
                        z.RGBA,
                        z.UNSIGNED_BYTE,
                        u
                      );
                      m.h.bindTexture2d(0);
                      m = x;
                      break a;
                    case "detections":
                      x = m.m[q.stream];
                      x || ((x = new Hb(m.h)), (m.m[q.stream] = x));
                      m = x;
                      m.data || (m.data = new m.g.DetectionListData());
                      m.data.reset(u.length);
                      for (x = 0; x < u.length; ++x) {
                        z = u[x];
                        var E = m.data,
                          F = E.setBoundingBox,
                          K = x;
                        var I = z.T;
                        var r = new Ab();
                        W(r, 1, I.Z);
                        W(r, 2, I.$);
                        W(r, 3, I.height);
                        W(r, 4, I.width);
                        W(r, 5, I.rotation);
                        W(r, 6, I.X);
                        var A = (I = new Za());
                        T(A, 1, V(r, 1));
                        T(A, 2, V(r, 2));
                        T(A, 3, V(r, 3));
                        T(A, 4, V(r, 4));
                        T(A, 5, V(r, 5));
                        var C = V(r, 6);
                        if (null != C && null != C) {
                          S(A.g, 48);
                          var p = A.g,
                            B = C;
                          C = 0 > B;
                          B = Math.abs(B);
                          var n = B >>> 0;
                          B = Math.floor((B - n) / 4294967296);
                          B >>>= 0;
                          C &&
                            ((B = ~B >>> 0),
                            (n = (~n >>> 0) + 1),
                            4294967295 < n &&
                              ((n = 0), B++, 4294967295 < B && (B = 0)));
                          P = n;
                          Q = B;
                          C = P;
                          for (n = Q; 0 < n || 127 < C; )
                            p.push((C & 127) | 128),
                              (C = ((C >>> 7) | (n << 25)) >>> 0),
                              (n >>>= 7);
                          p.push(C);
                        }
                        qb(r, A);
                        I = ab(I);
                        F.call(E, K, I);
                        if (z.O)
                          for (E = 0; E < z.O.length; ++E)
                            (r = z.O[E]),
                              (A = r.visibility ? !0 : !1),
                              (F = m.data),
                              (K = F.addNormalizedLandmark),
                              (I = x),
                              (r = Object.assign(Object.assign({}, r), {
                                visibility: A ? r.visibility : 0,
                              })),
                              (A = new wb()),
                              W(A, 1, r.x),
                              W(A, 2, r.y),
                              W(A, 3, r.z),
                              r.visibility && W(A, 4, r.visibility),
                              (p = r = new Za()),
                              T(p, 1, V(A, 1)),
                              T(p, 2, V(A, 2)),
                              T(p, 3, V(A, 3)),
                              T(p, 4, V(A, 4)),
                              T(p, 5, V(A, 5)),
                              qb(A, p),
                              (r = ab(r)),
                              K.call(F, I, r);
                        if (z.M)
                          for (E = 0; E < z.M.length; ++E) {
                            F = m.data;
                            K = F.addClassification;
                            I = x;
                            r = z.M[E];
                            A = new sb();
                            W(A, 2, r.Y);
                            r.index && W(A, 1, r.index);
                            r.label && W(A, 3, r.label);
                            r.displayName && W(A, 4, r.displayName);
                            p = r = new Za();
                            n = V(A, 1);
                            if (null != n && null != n)
                              if ((S(p.g, 8), (C = p.g), 0 <= n)) S(C, n);
                              else {
                                for (B = 0; 9 > B; B++)
                                  C.push((n & 127) | 128), (n >>= 7);
                                C.push(1);
                              }
                            T(p, 2, V(A, 2));
                            C = V(A, 3);
                            null != C &&
                              ((C = Ea(C)),
                              S(p.g, 26),
                              S(p.g, C.length),
                              $a(p, p.g.end()),
                              $a(p, C));
                            C = V(A, 4);
                            null != C &&
                              ((C = Ea(C)),
                              S(p.g, 34),
                              S(p.g, C.length),
                              $a(p, p.g.end()),
                              $a(p, C));
                            qb(A, p);
                            r = ab(r);
                            K.call(F, I, r);
                          }
                      }
                      m = m.data;
                      break a;
                    default:
                      m = {};
                  }
                }
                v = m;
                w = q.stream;
                switch (q.type) {
                  case "video":
                    e.pushTexture2d(
                      Object.assign(Object.assign({}, v), {
                        stream: w,
                        timestamp: h,
                      })
                    );
                    break;
                  case "detections":
                    t = v;
                    t.stream = w;
                    t.timestamp = h;
                    e.pushDetectionList(t);
                    break;
                  default:
                    throw Error("Unknown input config type: '" + q.type + "'");
                }
              }
            f.i.send(e);
            return N(y, f.C, 4);
          case 4:
            e.delete(), (y.g = 0);
        }
      });
    });
  };
  function Ub(a, b, c) {
    return Y(a, function f() {
      var h,
        e,
        g,
        k,
        l,
        q,
        v = this,
        w,
        t,
        y,
        m,
        u,
        x,
        z,
        E;
      return O(f, function (F) {
        switch (F.g) {
          case 1:
            if (!c) return F.return(b);
            h = {};
            e = 0;
            g = M(Object.keys(c));
            for (k = g.next(); !k.done; k = g.next())
              (l = k.value),
                (q = c[l]),
                "string" !== typeof q &&
                  "texture" === q.type &&
                  void 0 !== b[q.stream] &&
                  ++e;
            1 < e && (v.G = !1);
            w = M(Object.keys(c));
            k = w.next();
          case 2:
            if (k.done) {
              F.g = 4;
              break;
            }
            t = k.value;
            y = c[t];
            if ("string" === typeof y)
              return (z = h), (E = t), N(F, Vb(v, t, b[y]), 14);
            m = b[y.stream];
            if ("detection_list" === y.type) {
              if (m) {
                var K = m.getRectList();
                for (
                  var I = m.getLandmarksList(),
                    r = m.getClassificationsList(),
                    A = [],
                    C = 0;
                  C < K.size();
                  ++C
                ) {
                  var p = K.get(C);
                  a: {
                    var B = new Ab();
                    for (p = new Ua(p); Va(p); )
                      switch (p.i) {
                        case 13:
                          var n = R(p.g);
                          W(B, 1, n);
                          break;
                        case 21:
                          n = R(p.g);
                          W(B, 2, n);
                          break;
                        case 29:
                          n = R(p.g);
                          W(B, 3, n);
                          break;
                        case 37:
                          n = R(p.g);
                          W(B, 4, n);
                          break;
                        case 45:
                          n = R(p.g);
                          W(B, 5, n);
                          break;
                        case 48:
                          for (
                            var G = p.g, L = 128, Ia = 0, Z = (n = 0);
                            4 > Z && 128 <= L;
                            Z++
                          )
                            (L = G.h[G.g++]), (Ia |= (L & 127) << (7 * Z));
                          128 <= L &&
                            ((L = G.h[G.g++]),
                            (Ia |= (L & 127) << 28),
                            (n |= (L & 127) >> 4));
                          if (128 <= L)
                            for (Z = 0; 5 > Z && 128 <= L; Z++)
                              (L = G.h[G.g++]), (n |= (L & 127) << (7 * Z + 3));
                          if (128 > L) {
                            G = Ia >>> 0;
                            L = n >>> 0;
                            if ((n = L & 2147483648))
                              (G = (~G + 1) >>> 0),
                                (L = ~L >>> 0),
                                0 == G && (L = (L + 1) >>> 0);
                            G = 4294967296 * L + (G >>> 0);
                            n = n ? -G : G;
                          } else (G.l = !0), (n = void 0);
                          W(B, 6, n);
                          break;
                        default:
                          if (!rb(B, p)) break a;
                      }
                  }
                  B = {
                    Z: X(B, 1),
                    $: X(B, 2),
                    height: X(B, 3),
                    width: X(B, 4),
                    rotation: X(B, 5, 0),
                    X: ob(B, 6),
                  };
                  n = I.get(C);
                  a: for (p = new yb(), n = new Ua(n); Va(n); )
                    switch (n.i) {
                      case 10:
                        G = Xa(n, new wb(), xb);
                        mb(p, G, wb, void 0);
                        break;
                      default:
                        if (!rb(p, n)) break a;
                    }
                  p = lb(p, wb).map(Db);
                  G = r.get(C);
                  a: for (n = new ub(), G = new Ua(G); Va(G); )
                    switch (G.i) {
                      case 10:
                        n.addClassification(Xa(G, new sb(), tb));
                        break;
                      default:
                        if (!rb(n, G)) break a;
                    }
                  B = { T: B, O: p, M: Cb(n) };
                  A.push(B);
                }
                K = A;
              } else K = [];
              h[t] = K;
              F.g = 7;
              break;
            }
            if ("proto_list" === y.type) {
              if (m) {
                K = Array(m.size());
                for (I = 0; I < m.size(); I++) K[I] = m.get(I);
                m.delete();
              } else K = [];
              h[t] = K;
              F.g = 7;
              break;
            }
            if (void 0 === m) {
              F.g = 3;
              break;
            }
            if ("float_list" === y.type) {
              h[t] = m;
              F.g = 7;
              break;
            }
            if ("proto" === y.type) {
              h[t] = m;
              F.g = 7;
              break;
            }
            if ("texture" !== y.type)
              throw Error("Unknown output config type: '" + y.type + "'");
            u = v.s[t];
            u || ((u = new Eb(v.h, v.D)), (v.s[t] = u));
            return N(F, Fb(u, m, v.G), 13);
          case 13:
            (x = F.h), (h[t] = x);
          case 7:
            y.transform && h[t] && (h[t] = y.transform(h[t]));
            F.g = 3;
            break;
          case 14:
            z[E] = F.h;
          case 3:
            k = w.next();
            F.g = 2;
            break;
          case 4:
            return F.return(h);
        }
      });
    });
  }
  function Vb(a, b, c) {
    return Y(a, function f() {
      var h = this,
        e;
      return O(f, function (g) {
        return "number" === typeof c ||
          c instanceof Uint8Array ||
          c instanceof h.h.Uint8BlobList
          ? g.return(c)
          : c instanceof h.h.Texture2dDataOut
          ? ((e = h.s[b]),
            e || ((e = new Eb(h.h, h.D)), (h.s[b] = e)),
            g.return(Fb(e, c, h.G)))
          : g.return(void 0);
      });
    });
  }
  function Sb(a, b) {
    for (
      var c = b.name || "$",
        d = [].concat(ea(b.wants)),
        f = new a.h.StringList(),
        h = M(b.wants),
        e = h.next();
      !e.done;
      e = h.next()
    )
      f.push_back(e.value);
    h = a.h.PacketListener.implement({
      onResults: function (g) {
        for (var k = {}, l = 0; l < b.wants.length; ++l) k[d[l]] = g.get(l);
        var q = a.listeners[c];
        q &&
          (a.C = Ub(a, k, b.outs).then(function (v) {
            v = q(v);
            for (var w = 0; w < b.wants.length; ++w) {
              var t = k[d[w]];
              "object" === typeof t &&
                t.hasOwnProperty &&
                t.hasOwnProperty("delete") &&
                t.delete();
            }
            v && (a.C = v);
          }));
      },
    });
    a.i.attachMultiListener(f, h);
    f.delete();
  }
  D.onResults = function (a, b) {
    this.listeners[b || "$"] = a;
  };
  ya("Solution", Nb);
  ya("OptionType", {
    BOOL: 0,
    NUMBER: 1,
    aa: 2,
    0: "BOOL",
    1: "NUMBER",
    2: "STRING",
  });
  function Wb(a) {
    void 0 === a && (a = 0);
    switch (a) {
      case 1:
        return "selfie_segmentation_landscape.tflite";
      default:
        return "selfie_segmentation.tflite";
    }
  }
  function Xb(a) {
    var b = this;
    a = a || {};
    this.g = new Nb({
      locateFile: a.locateFile,
      files: function (c) {
        return [
          { simd: !0, url: "selfie_segmentation_solution_simd_wasm_bin.js" },
          { simd: !1, url: "selfie_segmentation_solution_wasm_bin.js" },
          { data: !0, url: Wb(c.modelSelection) },
        ];
      },
      graph: { url: "selfie_segmentation.binarypb" },
      listeners: [
        {
          wants: ["segmentation_mask", "image_transformed"],
          outs: {
            image: { type: "texture", stream: "image_transformed" },
            segmentationMask: { type: "texture", stream: "segmentation_mask" },
          },
        },
      ],
      inputs: { image: { type: "video", stream: "input_frames_gpu" } },
      options: {
        useCpuInference: {
          type: 0,
          graphOptionXref: {
            calculatorType: "InferenceCalculator",
            fieldName: "use_cpu_inference",
          },
          default:
            "iPad Simulator;iPhone Simulator;iPod Simulator;iPad;iPhone;iPod"
              .split(";")
              .includes(navigator.platform) ||
            (navigator.userAgent.includes("Mac") && "ontouchend" in document),
        },
        selfieMode: {
          type: 0,
          graphOptionXref: {
            calculatorType: "GlScalerCalculator",
            calculatorIndex: 1,
            fieldName: "flip_horizontal",
          },
        },
        modelSelection: {
          type: 1,
          graphOptionXref: {
            calculatorType: "ConstantSidePacketCalculator",
            calculatorName: "ConstantSidePacketCalculatorModelSelection",
            fieldName: "int_value",
          },
          onChange: function (c) {
            return Y(b, function f() {
              var h,
                e,
                g = this,
                k;
              return O(f, function (l) {
                if (1 == l.g)
                  return (
                    (h = Wb(c)),
                    (e =
                      "third_party/mediapipe/modules/selfie_segmentation/" + h),
                    N(l, Qb(g.g, h), 2)
                  );
                k = l.h;
                g.g.overrideFile(e, k);
                return l.return(!0);
              });
            });
          },
        },
      },
    });
  }
  D = Xb.prototype;
  D.close = function () {
    this.g.close();
    return Promise.resolve();
  };
  D.onResults = function (a) {
    this.g.onResults(a);
  };
  D.initialize = function () {
    return Y(this, function b() {
      var c = this;
      return O(b, function (d) {
        return N(d, c.g.initialize(), 0);
      });
    });
  };
  D.reset = function () {
    this.g.reset();
  };
  D.send = function (a) {
    return Y(this, function c() {
      var d = this;
      return O(c, function (f) {
        return N(f, d.g.send(a), 0);
      });
    });
  };
  D.setOptions = function (a) {
    this.g.setOptions(a);
  };
  ya("SelfieSegmentation", Xb);
  ya("VERSION", "0.1.1632777926");
}.call(this));
