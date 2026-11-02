"use strict";
/* ===== 座標平面をかく道具（SVG） ===== */
const SVGNS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs, parent) {
  const e = document.createElementNS(SVGNS, tag);
  if (attrs) for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const col = c => c === "none" ? "none" : (c && !c.startsWith("#") && !c.startsWith("var") && !c.startsWith("rgb")) ? `var(--${c})` : (c || "var(--ink)");

class Plot {
  constructor(host) {
    this.host = host;
    this.svg = svgEl("svg", { class: "plot" }, host);
    this.handles = {};
    this.drag = null;
    this.touched = false;
    this.svg.addEventListener("pointerdown", e => {
      const h = e.target.closest("[data-h]");
      if (!h) return;
      this.drag = h.dataset.h;
      this.touched = true;
      try { this.svg.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
      this._move(e);
    });
    this.svg.addEventListener("pointermove", e => { if (this.drag) { e.preventDefault(); this._move(e); } });
    const end = () => { if (this.drag) { this.drag = null; if (this.onEnd) this.onEnd(); } };
    this.svg.addEventListener("pointerup", end);
    this.svg.addEventListener("pointercancel", end);
  }
  _move(e) {
    const r = this.svg.getBoundingClientRect();
    const f = this.handles[this.drag];
    if (f) f(this.ix(e.clientX - r.left), this.iy(e.clientY - r.top));
  }
  /* v: {xmin, xmax, ymin, ymax, equal(=true), pad, xticks, yticks, noAxes, noY, noGrid} */
  begin(v) {
    const w = this.host.clientWidth || 600, h = this.host.clientHeight || 400;
    this.w = w; this.h = h; this.v = v;
    this.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
    this.handles = {};
    const pad = v.pad ?? 30;
    let sx = (w - 2 * pad) / (v.xmax - v.xmin), sy = (h - 2 * pad) / (v.ymax - v.ymin);
    if (v.equal !== false) sx = sy = Math.min(sx, sy);
    this.sx = sx; this.sy = sy;
    this.cx = (v.xmin + v.xmax) / 2; this.cy = (v.ymin + v.ymax) / 2;
    this.x0 = this.ix(0); this.x1 = this.ix(w); this.y0 = this.iy(h); this.y1 = this.iy(0);
    this.gGrid = svgEl("g", null, this.svg);
    this.g = svgEl("g", null, this.svg);
    this.gTop = svgEl("g", null, this.svg);
    if (!v.noGrid) this._grid();
    return this;
  }
  X(x) { return this.w / 2 + (x - this.cx) * this.sx; }
  Y(y) { return this.h / 2 - (y - this.cy) * this.sy; }
  ix(px) { return this.cx + (px - this.w / 2) / this.sx; }
  iy(py) { return this.cy - (py - this.h / 2) / this.sy; }
  static nice(s, minPx) {
    for (const c of [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500]) if (c * s >= minPx) return c;
    return 1000;
  }
  _grid() {
    const v = this.v, G = this.gGrid;
    const mx = Plot.nice(this.sx, 34), my = Plot.nice(this.sy, 30);
    const fx = this.sx >= 10 ? Math.min(1, mx) : mx, fy = this.sy >= 10 ? Math.min(1, my) : my;
    const gx = v.gridX || fx, gy = v.gridY || fy;
    for (let x = Math.ceil(this.x0 / gx) * gx; x <= this.x1; x += gx)
      svgEl("line", { class: "gl", x1: this.X(x), x2: this.X(x), y1: 0, y2: this.h }, G);
    for (let y = Math.ceil(this.y0 / gy) * gy; y <= this.y1; y += gy)
      svgEl("line", { class: "gl", y1: this.Y(y), y2: this.Y(y), x1: 0, x2: this.w }, G);
    if (v.noAxes) return;
    const ox = Math.min(Math.max(this.X(0), 0), this.w), oy = Math.min(Math.max(this.Y(0), 0), this.h);
    // x 軸
    svgEl("line", { class: "ax", x1: 0, x2: this.w - 2, y1: oy, y2: oy }, G);
    svgEl("path", { d: `M${this.w - 2},${oy} l-9,-4.5 v9 z`, fill: "var(--ink)" }, G);
    this._t(G, this.w - 12, oy - 10, v.xname || "x", { anchor: "end", it: true });
    const lblY = Math.min(oy + 16, this.h - 6);
    const xt = v.xticks || [];
    if (v.xticks) xt.forEach(t => { svgEl("line", { class: "ax", x1: this.X(t.v), x2: this.X(t.v), y1: oy - 3, y2: oy + 3 }, G); this._t(G, this.X(t.v), lblY, t.l, { anchor: "middle", cls: "tk" }); });
    else for (let x = Math.ceil(this.x0 / mx) * mx; x <= this.x1 - 10 / this.sx; x += mx) {
      if (Math.abs(x) < 1e-9) continue;
      svgEl("line", { class: "ax", x1: this.X(x), x2: this.X(x), y1: oy - 3, y2: oy + 3 }, G);
      this._t(G, this.X(x), lblY, fmtTick(x), { anchor: "middle", cls: "tk" });
    }
    if (v.noY) return;
    svgEl("line", { class: "ax", x1: ox, x2: ox, y1: this.h, y2: 2 }, G);
    svgEl("path", { d: `M${ox},2 l-4.5,9 h9 z`, fill: "var(--ink)" }, G);
    this._t(G, ox + 10, 16, v.yname || "y", { anchor: "start", it: true });
    const lblX = Math.max(ox - 6, 26);
    for (let y = Math.ceil(this.y0 / my) * my; y <= this.y1 - 14 / this.sy; y += my) {
      if (Math.abs(y) < 1e-9) continue;
      svgEl("line", { class: "ax", x1: ox - 3, x2: ox + 3, y1: this.Y(y), y2: this.Y(y) }, G);
      this._t(G, lblX, this.Y(y) + 4, fmtTick(y), { anchor: "end", cls: "tk" });
    }
    if (this.X(0) > 0 && this.X(0) < this.w && this.Y(0) > 0 && this.Y(0) < this.h) this._t(G, ox - 6, oy + 15, "O", { anchor: "end", cls: "tk", it: true });
  }
  _t(parent, px, py, str, o = {}) {
    const t = svgEl("text", { x: px, y: py, "text-anchor": o.anchor || "start", class: o.cls || null }, parent);
    if (!o.cls) { t.setAttribute("fill", col(o.c)); t.setAttribute("font-size", o.size || 15); t.setAttribute("font-weight", o.bold === false ? 500 : 700); }
    if (o.it) t.setAttribute("font-style", "italic");
    t.textContent = str;
    return t;
  }
  _g(o) { return o && o.top ? this.gTop : this.g; }
  _st(e, o) {
    if (o.pop) e.classList.add("pop");
    if (o.op != null) e.setAttribute("opacity", o.op);
    return e;
  }
  /* 関数のグラフ */
  fn(f, o = {}) {
    const a = Math.max(o.from ?? -Infinity, this.x0), b = Math.min(o.to ?? Infinity, this.x1);
    if (!(b > a)) return null;
    const n = Math.max(80, Math.ceil((this.X(b) - this.X(a)) / 2));
    let d = "", pen = false, prev = null;
    for (let i = 0; i <= n; i++) {
      const x = a + (b - a) * i / n, y = f(x);
      const py = this.Y(y);
      if (!isFinite(y) || py < -this.h * 2 || py > this.h * 3 || (prev != null && Math.abs(py - prev) > this.h * 1.5)) { pen = false; prev = isFinite(y) ? py : null; continue; }
      d += (pen ? "L" : "M") + this.X(x).toFixed(1) + "," + py.toFixed(1);
      pen = true; prev = py;
    }
    return this._st(svgEl("path", { d, fill: "none", stroke: col(o.c || "accent"), "stroke-width": o.w || 3, "stroke-dasharray": o.dash || null, "stroke-linecap": "round", "stroke-linejoin": "round" }, this._g(o)), o);
  }
  /* f と g（ふつうは x 軸）の間をぬる */
  area(f, a, b, o = {}) {
    const g = o.g || (() => 0);
    const n = 120; let d = "";
    for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; d += (i ? "L" : "M") + this.X(x).toFixed(1) + "," + this.Y(f(x)).toFixed(1); }
    for (let i = n; i >= 0; i--) { const x = a + (b - a) * i / n; d += "L" + this.X(x).toFixed(1) + "," + this.Y(g(x)).toFixed(1); }
    return this._st(svgEl("path", { d: d + "Z", fill: col(o.c || "accent-soft"), stroke: "none" }, this._g(o)), o);
  }
  line(x1, y1, x2, y2, o = {}) {
    return this._st(svgEl("line", { x1: this.X(x1), y1: this.Y(y1), x2: this.X(x2), y2: this.Y(y2), stroke: col(o.c || "ink"), "stroke-width": o.w || 2, "stroke-dasharray": o.dash || null, "stroke-linecap": "round" }, this._g(o)), o);
  }
  /* 直線 y = m x + k（画面のはしまで） */
  infLine(m, k, o = {}) { return this.line(this.x0, m * this.x0 + k, this.x1, m * this.x1 + k, o); }
  vline(x, o = {}) { return this.line(x, this.y0, x, this.y1, o); }
  arrow(x1, y1, x2, y2, o = {}) {
    const g = svgEl("g", null, this._g(o));
    const X1 = this.X(x1), Y1 = this.Y(y1), X2 = this.X(x2), Y2 = this.Y(y2);
    const ang = Math.atan2(Y2 - Y1, X2 - X1), L = 9;
    svgEl("line", { x1: X1, y1: Y1, x2: X2 - Math.cos(ang) * 3, y2: Y2 - Math.sin(ang) * 3, stroke: col(o.c || "ink"), "stroke-width": o.w || 2 }, g);
    const p = (a) => `${X2 - L * Math.cos(ang + a)},${Y2 - L * Math.sin(ang + a)}`;
    svgEl("path", { d: `M${X2},${Y2} L${p(0.45)} L${p(-0.45)} Z`, fill: col(o.c || "ink") }, g);
    if (o.both) { const q = (a) => `${X1 + L * Math.cos(ang + a)},${Y1 + L * Math.sin(ang + a)}`; svgEl("path", { d: `M${X1},${Y1} L${q(0.45)} L${q(-0.45)} Z`, fill: col(o.c || "ink") }, g); }
    return this._st(g, o);
  }
  poly(pts, o = {}) {
    return this._st(svgEl("polygon", { points: pts.map(p => this.X(p[0]) + "," + this.Y(p[1])).join(" "), fill: col(o.fill || "none"), stroke: o.c === "none" ? "none" : col(o.c || "ink"), "stroke-width": o.w || 2, "stroke-linejoin": "round" }, this._g(o)), o);
  }
  rect(x, y, w, h, o = {}) { return this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o); }
  circle(cx, cy, r, o = {}) {
    return this._st(svgEl("ellipse", { cx: this.X(cx), cy: this.Y(cy), rx: r * this.sx, ry: r * this.sy, fill: col(o.fill || "none"), stroke: col(o.c || "accent"), "stroke-width": o.w || 3, "stroke-dasharray": o.dash || null }, this._g(o)), o);
  }
  /* 角の印（画面上の半径 rp ピクセル、角度は度） */
  angle(cx, cy, a1, a2, o = {}) {
    const rp = o.rp || 24, X = this.X(cx), Y = this.Y(cy);
    const p = a => [X + rp * Math.cos(a * Math.PI / 180), Y - rp * Math.sin(a * Math.PI / 180)];
    const [x1, y1] = p(a1), [x2, y2] = p(a2);
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0, sweep = a2 > a1 ? 0 : 1;
    return this._st(svgEl("path", { d: `M${X},${Y} L${x1},${y1} A${rp},${rp} 0 ${large} ${sweep} ${x2},${y2} Z`, fill: col(o.fill || "gold-soft"), stroke: col(o.c || "gold"), "stroke-width": 1.5 }, this._g(o)), o);
  }
  point(x, y, o = {}) {
    const g = this._g(o);
    const c = svgEl("circle", { cx: this.X(x), cy: this.Y(y), r: o.r || 5.5, fill: o.hollow ? "var(--stage-1)" : col(o.c || "ink"), stroke: col(o.c || "ink"), "stroke-width": 2 }, g);
    this._st(c, o);
    if (o.label) this.label(x, y, o.label, { c: o.lc || o.c, pos: o.pos, size: o.size, top: o.top, pop: o.pop });
    return c;
  }
  /* 点の近くに文字（pos: ne nw se sw n s e w） */
  label(x, y, str, o = {}) {
    const pos = o.pos || "ne", d = o.d || 10;
    let dx = 0, dy = 0, anchor = "middle";
    if (pos.includes("e")) { dx = d; anchor = "start"; }
    if (pos.includes("w")) { dx = -d; anchor = "end"; }
    if (pos.includes("n")) dy = -d;
    if (pos.includes("s")) dy = d + 12;
    if (pos === "e" || pos === "w" || pos === "c") dy = 5;
    const t = this._t(this._g(o), this.X(x) + dx, this.Y(y) + dy, str, { anchor, c: o.c, size: o.size, bold: o.bold });
    return this._st(t, o);
  }
  /* 画面の位置（px）に文字 */
  textPx(px, py, str, o = {}) { return this._st(this._t(this._g(o), px, py, str, o), o); }
  /* ドラッグできる点 */
  handle(key, x, y, onDrag, o = {}) {
    this.handles[key] = onDrag;
    const g = svgEl("g", { "data-h": key }, this.gTop);
    const X = this.X(x), Y = this.Y(y);
    if (!this.touched) svgEl("circle", { class: "glow", cx: X, cy: Y, r: 17, fill: col(o.c || "warm") }, g);
    svgEl("circle", { class: "hd-hit", cx: X, cy: Y, r: 22 }, g);
    svgEl("circle", { class: "hd-ring", cx: X, cy: Y, r: 9, fill: "var(--stage-1)", stroke: col(o.c || "warm"), "stroke-width": 3 }, g);
    svgEl("circle", { class: "hd-ring", cx: X, cy: Y, r: 3.5, fill: col(o.c || "warm") }, g);
    if (o.label) this.label(x, y, o.label, { c: o.lc || o.c || "warm", pos: o.pos, top: true, d: 13 });
    return g;
  }
}
function fmtTick(v) {
  const r = Math.round(v * 100) / 100;
  return (r < 0 ? "−" : "") + Math.abs(r);
}
