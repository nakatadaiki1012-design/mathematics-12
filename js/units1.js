"use strict";
/* ===== 数学I の単元 =====
   1 つの単元 = { id, sub, name, small, init, view, ctrls, draw, band, hint, points, ex, gen }
   draw(G, st, ctx)：G は Plot、ctx = { touch:さわれる?, hl:強調するもの, redraw } */
const UNITS = [];
const H = (ctx, k) => !!ctx.hl && ctx.hl.split(" ").includes(k);
const em = (ctx, k, a, b) => H(ctx, k) ? a : b;

/* ---------- 1. 展開と因数分解 ---------- */
UNITS.push({
  id: "expand", sub: "I", name: "展開と因数分解", small: "面積の図で (x + a)(x + b)",
  init: () => ({ a: 2, b: 3 }),
  view: st => st.a > 0 && st.b > 0 ? { xmin: -1.8, xmax: 4 + st.a + 0.8, ymin: -(4 + st.b) - 0.8, ymax: 1.6, noAxes: true } : { xmin: -5, xmax: 5, ymin: -4, ymax: 4, noAxes: true, noGrid: true },
  ctrls: [{ k: "a", label: "a", min: 1, max: 5, step: 1 }, { k: "b", label: "b", min: 1, max: 5, step: 1 }],
  hint: "a・b を動かすと、長方形の 4 つの部分が かわる",
  draw(G, st, ctx) {
    const { a, b } = st, X = 4;
    if (!(a > 0 && b > 0)) { // マイナスがあるときは「かけて・たして」の表
      G.textPx(G.w / 2, G.h / 2 - 50, "かけて " + N(a * b) + "、たして " + N(a + b) + " になる 2 つの数", { anchor: "middle", size: 20 });
      G.textPx(G.w / 2, G.h / 2, `${N(a)} と ${N(b)}`, { anchor: "middle", size: 34, c: "warm" });
      G.textPx(G.w / 2, G.h / 2 + 46, `${N(a)} × ${pn(b)} = ${N(a * b)}　　${N(a)} + ${pn(b)} = ${N(a + b)}`, { anchor: "middle", size: 18, c: "muted" });
      return;
    }
    const allOn = !ctx.hl;
    const tile = (x, y, w, h, fill, lab, key) => {
      const on = allOn || H(ctx, key) || H(ctx, "all");
      G.rect(x, y, w, -h, { fill: on ? fill : "chip", c: "ink", w: 1.5, pop: H(ctx, key) });
      G.label(x + w / 2, y - h / 2, lab, { pos: "c", c: on ? "ink" : "muted", size: Math.min(26, 10 + Math.min(w, h) * 4) });
    };
    // ラベルの位置をそろえるため、文字は中央に
    tile(0, 0, X, X, "accent-soft", "x²", "x2");
    tile(X, 0, a, X, "blue-soft", N(a) + "x", "mid");
    tile(0, -X, X, b, "blue-soft", N(b) + "x", "mid");
    tile(X, -X, a, b, "warm-soft", N(a * b), "const");
    G.label(X / 2, 0, "x", { pos: "n", size: 17 }); G.label(X + a / 2, 0, N(a), { pos: "n", size: 17, c: "warm" });
    G.label(0, -X / 2, "x", { pos: "w", size: 17 }); G.label(0, -X - b / 2, N(b), { pos: "w", size: 17, c: "warm" });
  },
  band: st => ({ g: "(x + a)(x + b) = x² + (a + b)x + ab", n: `${sh2(st.a)}${sh2(st.b)} = <span class="hl">${P(1, st.a + st.b, st.a * st.b)}</span>` }),
  points: ["長方形の面積で考えると、<b>4 つの部分のたし算</b>になる", "x の係数は <b>a + b</b>、数だけの項は <b>a × b</b>", "因数分解はその逆：<b>かけて ab、たして a + b</b> の 2 数をさがす"],
  ex: {
    q: "x² + 5x + 6 を因数分解しよう", st: { a: 2, b: 3 },
    steps: [
      { t: "形は x² + (a + b)x + ab。<b>かけて 6、たして 5</b> の 2 つの数をさがす", hl: "x2", n: "x² + 5x + 6 = (x + □)(x + □)" },
      { t: "かけて 6 になるのは 1 と 6、2 と 3（右下の長方形）", hl: "const", n: "1 × 6 = 6、2 × 3 = 6" },
      { t: "そのうち、たして 5 になるのは <b>2 と 3</b>（まん中の 2 つ）", hl: "mid", n: "2 + 3 = 5 ✓" },
      { t: "答え：(x + 2)(x + 3)。図の長方形のたて × よこ になっている", hl: "all", n: "x² + 5x + 6 = (x + 2)(x + 3)" },
    ],
  },
  gen() {
    let a = nz(-6, 6), b = nz(-6, 6);
    if (a + b === 0) b = b > 0 ? b + 1 : b - 1;
    if (a > b) [a, b] = [b, a];
    const f = (p, q) => { const s = [p, q].sort((m, n) => m - n); return sh2(s[0]) + sh2(s[1]); };
    if (Math.random() < 0.6) {
      const c = choose(f(a, b), [f(-a, -b), f(a, -b), f(-a, b), f(a + 1, b - 1)]);
      return { q: `${P(1, a + b, a * b)} を因数分解すると？`, ...c, hint: `かけて ${N(a * b)}、たして ${N(a + b)} になる 2 つの数をさがそう`, exp: `${N(a)} × ${pn(b)} = ${N(a * b)}、${N(a)} + ${pn(b)} = ${N(a + b)} なので<br><b>${f(a, b)}</b>`, st: { a, b } };
    }
    const c = choose(P(1, a + b, a * b), [P(1, a * b, a + b), P(1, a + b, -a * b), P(1, -(a + b), a * b), P(1, a - b, a * b)]);
    return { q: `${f(a, b)} を展開すると？`, ...c, hint: "x の係数は a + b、数の項は a × b", exp: `x の係数は ${N(a)} + ${pn(b)} = ${N(a + b)}、数の項は ${N(a)} × ${pn(b)} = ${N(a * b)}<br><b>${P(1, a + b, a * b)}</b>`, st: { a, b } };
  },
});
function sh2(a) { return `(x ${a < 0 ? MI : "+"} ${Math.abs(a)})`; }

/* ---------- 2. 2次関数のグラフ ---------- */
const quadView = { xmin: -6, xmax: 6, ymin: -6, ymax: 6 };
function vform(a, p, q) { return `y = ${co(a)}${sh("x", p)}²${sg(q)}`; }
UNITS.push({
  id: "quad", sub: "I", name: "2次関数のグラフ", small: "y = a(x − p)² + q",
  init: () => ({ a: 1, p: 1, q: -2 }),
  view: () => quadView,
  ctrls: [{ k: "a", label: "a", min: -3, max: 3, step: 0.5 }, { k: "p", label: "p", min: -4, max: 4, step: 0.5 }, { k: "q", label: "q", min: -4, max: 4, step: 0.5 }],
  hint: "👆 頂点（光る点）をドラッグしても動かせる",
  draw(G, st, ctx) {
    const { a, p, q } = st;
    if (p !== 0 || q !== 0) G.fn(x => a * x * x, { c: "muted", w: em(ctx, "ghost", 3, 1.5), dash: "6 5", op: em(ctx, "ghost", 1, 0.6) });
    if (H(ctx, "ghost")) G.arrow(0, 0, p, q, { c: "blue", w: 2.5, pop: true });
    G.vline(p, { c: "warm", dash: "7 6", w: em(ctx, "axis", 3, 1.5), op: em(ctx, "axis", 1, 0.7) });
    G.label(p, G.y1, "軸 x = " + N(p), { pos: "se", c: "warm", size: em(ctx, "axis", 17, 13) });
    if (a === 0) G.infLine(0, q, { c: "accent", w: 3 });
    else G.fn(x => a * (x - p) ** 2 + q, { c: "accent", w: 3.5 });
    const lab = `頂点 (${N(p)}, ${N(q)})`;
    if (ctx.touch) G.handle("v", p, q, (x, y) => { st.p = clamp(snap(x, 0.5), -4, 4); st.q = clamp(snap(y, 0.5), -4, 4); ctx.redraw(); }, { label: lab, pos: a >= 0 ? "se" : "ne" });
    else G.point(p, q, { c: "warm", r: em(ctx, "vertex", 8, 6), label: lab, pos: a >= 0 ? "se" : "ne", size: em(ctx, "vertex", 19, 15), pop: H(ctx, "vertex") });
  },
  band: st => ({ g: "y = a(x − p)² + q　→　頂点 (p, q)、軸 x = p", n: st.a === 0 ? `y = ${N(st.q)} <span class="mt">（a = 0 だと 直線）</span>` : `${vform(st.a, st.p, st.q)}　<span class="mt">頂点</span> <span class="hl">${pt(st.p, st.q)}</span>　<span class="mt">軸</span> <span class="hl">x = ${N(st.p)}</span>` }),
  points: ["<b>p</b> で左右に、<b>q</b> で上下に動く（形は y = ax² のまま）", "頂点は <b>(p, q)</b>、軸は <b>x = p</b>", "a > 0 → 下に凸（∪）、a < 0 → 上に凸（∩）。|a| が大きいほど 細い"],
  ex: {
    q: "y = 2(x − 1)² + 3 の 頂点 と 軸 は？", st: { a: 2, p: 1, q: 3 },
    steps: [
      { t: "y = a(x − p)² + q の形とくらべる", n: "y = 2(x − 1)² + 3" },
      { t: "a = 2、p = 1、q = 3（<b>x − 1</b> だから p は <b>+1</b>）", n: "a = 2,  p = 1,  q = 3" },
      { t: "頂点は (p, q) = <b>(1, 3)</b>", hl: "vertex", n: "頂点 (1, 3)" },
      { t: "軸は 頂点を通る たての線 <b>x = 1</b>", hl: "axis vertex", n: "軸 x = 1" },
      { t: "y = 2x² のグラフを 右へ 1、上へ 3 ずらした形になっている", hl: "ghost vertex", n: "y = 2x² を (1, 3) だけ平行移動" },
    ],
  },
  gen() {
    const a = pick([1, 2, 3, -1, -2, -3]), p = nz(-4, 4), q = nz(-4, 4), st = { a, p, q };
    const t = rint(0, 2);
    if (t === 0) {
      const c = choose(pt(p, q), [pt(-p, q), pt(p, -q), pt(-p, -q), pt(q, p)]);
      return { q: `${vform(a, p, q)} の 頂点 は？`, ...c, hint: "y = a(x − p)² + q の頂点は (p, q)。かっこの中の符号に注意", exp: `${vform(a, p, q)} は p = ${N(p)}、q = ${N(q)}<br>頂点は <b>${pt(p, q)}</b>`, st, hl: "vertex" };
    }
    if (t === 1) {
      const c = choose(`x = ${N(p)}`, [`x = ${N(-p)}`, `x = ${N(q)}`, `y = ${N(q)}`]);
      return { q: `${vform(a, p, q)} の 軸 は？`, ...c, hint: "軸は 頂点を通る たての線 x = p", exp: `頂点が ${pt(p, q)} なので、軸は <b>x = ${N(p)}</b>`, st, hl: "axis" };
    }
    const c = choose(vform(a, p, q), [vform(a, -p, q), vform(a, p, -q), vform(a, -p, -q)]);
    return { q: `y = ${co(a)}x² を x 軸方向に ${N(p)}、y 軸方向に ${N(q)} 平行移動した式は？`, ...c, hint: "x 軸方向に p → x を (x − p) にかえる。y 軸方向に q → + q", exp: `頂点が (0, 0) から ${pt(p, q)} にうつるので<br><b>${vform(a, p, q)}</b>`, st, hl: "ghost vertex" };
  },
});

/* ---------- 3. 平方完成 ---------- */
function sqcView(st) {
  const h = st.b / 2, k = st.c - h * h;
  return { xmin: Math.min(-h - 4, -4), xmax: Math.max(-h + 4, 4), ymin: Math.min(k, 0) - 1.5, ymax: Math.max(st.c, k + 10, 4) + 1, equal: false };
}
UNITS.push({
  id: "sqc", sub: "I", name: "平方完成", small: "x² + bx + c を (x − p)² + q に",
  init: () => ({ b: -6, c: 5 }),
  view: () => ({ xmin: -8, xmax: 8, ymin: -10, ymax: 10, equal: false }),
  ctrls: [{ k: "b", label: "b", min: -8, max: 8, step: 2 }, { k: "c", label: "c", min: -6, max: 8, step: 1 }],
  hint: "b・c を動かすと、頂点の位置と 式が かわる",
  draw(G, st, ctx) {
    const h = st.b / 2, k = st.c - h * h;
    G.vline(-h, { c: "warm", dash: "7 6", w: 1.5, op: 0.7 });
    G.fn(x => x * x + st.b * x + st.c, { c: "accent", w: 3.5 });
    G.point(0, st.c, { c: "blue", r: 5, label: `y 切片 ${N(st.c)}`, pos: "e", op: em(ctx, "yint", 1, 0.8), size: 13 });
    G.point(-h, k, { c: "warm", r: em(ctx, "vertex", 8, 6), label: `頂点 ${pt(-h, k)}`, pos: "se", size: em(ctx, "vertex", 19, 15), pop: H(ctx, "vertex") });
  },
  band(st) {
    const h = st.b / 2, k = st.c - h * h;
    if (h === 0) return { g: "x² + bx + c = (x + b/2)² − (b/2)² + c", n: `y = ${P(1, 0, st.c)} <span class="mt">（もう平方完成の形）</span>` };
    return { g: "x² + bx + c = (x + b/2)² − (b/2)² + c", n: `${P(1, st.b, st.c)} = ${sh("x", -h)}² ${MI} ${N(h * h)}${sg(st.c)} = <span class="hl">${sh("x", -h)}²${sg(k)}</span>` };
  },
  points: ["x の係数の<b>半分</b>を使って ( x ＋ 半分 )² をつくる", "かっこを広げると (半分)² が<b>よけいに出る</b>ので、それをひく", "平方完成すると 頂点がわかる → グラフがかける"],
  ex: {
    q: "y = x² − 6x + 5 を平方完成して、頂点を求めよう", st: { b: -6, c: 5 },
    steps: [
      { t: "x の係数 −6 の <b>半分は −3</b>。(x − 3)² をつくる", n: "x² − 6x + 5 = (x − 3)² …" },
      { t: "(x − 3)² = x² − 6x + <b>9</b>。よけいな 9 を ひいておく", n: "= (x − 3)² − 9 + 5" },
      { t: "数をまとめる", n: "= (x − 3)² − 4" },
      { t: "頂点は <b>(3, −4)</b>", hl: "vertex", n: "頂点 (3, −4)" },
    ],
  },
  gen() {
    const h = nz(-4, 4), c = rint(-5, 8), b = 2 * h, k = c - h * h, st = { b, c, view: sqcView({ b, c }) };
    const form = (hh, kk) => `y = ${sh("x", -hh)}²${sg(kk)}`;
    if (Math.random() < 0.5) {
      const c2 = choose(form(h, k), [form(-h, k), form(h, c + h * h), form(h, c), form(-h, c - h * h + 2)]);
      return { q: `y = ${P(1, b, c)} を平方完成すると？`, ...c2, hint: `x の係数 ${N(b)} の半分は ${N(h)}。(x ${h < 0 ? MI : "+"} ${Math.abs(h)})² をつくって、よけいな ${h * h} をひく`, exp: `${P(1, b, c)} = ${sh("x", -h)}² ${MI} ${h * h}${sg(c)}<br>= <b>${form(h, k)}</b>`, st, hl: "vertex" };
    }
    const c2 = choose(pt(-h, k), [pt(h, k), pt(-h, c), pt(h, -k), pt(-h, -k)]);
    return { q: `y = ${P(1, b, c)} の 頂点 は？`, ...c2, hint: "まず平方完成して y = (x − p)² + q の形にしよう", exp: `y = ${form(h, k)} なので、頂点は <b>${pt(-h, k)}</b>`, st, hl: "vertex" };
  },
});

/* ---------- 4. 最大・最小 ---------- */
function mmCalc(st) {
  const f = x => st.a * (x - st.p) ** 2 + st.q;
  const fs = f(st.s), fe = f(st.e), inside = st.p >= st.s && st.p <= st.e;
  let mx, mn;
  if (st.a > 0) { mn = inside ? { x: st.p, y: st.q } : (fs < fe ? { x: st.s, y: fs } : { x: st.e, y: fe }); mx = fs >= fe ? { x: st.s, y: fs } : { x: st.e, y: fe }; }
  else { mx = inside ? { x: st.p, y: st.q } : (fs > fe ? { x: st.s, y: fs } : { x: st.e, y: fe }); mn = fs <= fe ? { x: st.s, y: fs } : { x: st.e, y: fe }; }
  const both = Math.abs(fs - fe) < 1e-9;
  return { f, mx, mn, both, inside };
}
UNITS.push({
  id: "minmax", sub: "I", name: "最大・最小", small: "範囲のある 2次関数",
  init: () => ({ a: 1, p: 1, q: -4, s: 0, e: 3 }),
  view: () => ({ xmin: -5, xmax: 5, ymin: -6, ymax: 8, equal: false }),
  ctrls: [{ k: "a", label: "向き", opts: [[1, "下に凸 ∪"], [-1, "上に凸 ∩"]] }, { k: "p", label: "軸 p", min: -3, max: 3, step: 0.5 }, { k: "q", label: "q", min: -4, max: 4, step: 0.5 }, { k: "s", label: "左はし", min: -4, max: 3, step: 0.5 }, { k: "e", label: "右はし", min: -3, max: 4, step: 0.5 }],
  fix(st, k) { if (st.s >= st.e) { if (k === "s") st.e = Math.min(4, st.s + 0.5); else st.s = Math.max(-4, st.e - 0.5); } },
  hint: "👆 範囲のはし（光る点）を 左右に ドラッグできる",
  draw(G, st, ctx) {
    const { f, mx, mn, both } = mmCalc(st);
    G.rect(st.s, G.y0, st.e - st.s, G.y1 - G.y0, { fill: "gold-soft", c: "none", op: em(ctx, "range", 1, 0.6), pop: H(ctx, "range") });
    G.vline(st.p, { c: "muted", dash: "6 6", w: em(ctx, "axis", 2.5, 1.2) });
    G.label(st.p, G.y1, "軸", { pos: "se", c: "muted", size: 13 });
    G.fn(f, { c: "muted", w: 1.5, dash: "5 5", op: 0.6 });
    G.fn(f, { c: "accent", w: 4, from: st.s, to: st.e });
    const showMx = !ctx.hl || H(ctx, "max"), showMn = !ctx.hl || H(ctx, "min");
    if (showMx) { G.point(mx.x, mx.y, { c: "warm", r: 7, label: `最大 ${N(mx.y)}`, pos: "n", pop: H(ctx, "max") }); if (both) G.point(st.s === mx.x ? st.e : st.s, mx.y, { c: "warm", r: 7, label: `最大 ${N(mx.y)}`, pos: "n" }); }
    if (showMn) G.point(mn.x, mn.y, { c: "blue", r: 7, label: `最小 ${N(mn.y)}`, pos: "s", pop: H(ctx, "min") });
    if (ctx.touch) {
      G.handle("s", st.s, 0, x => { st.s = clamp(snap(x, 0.5), -4, 3); this.fix(st, "s"); ctx.redraw(); }, { c: "gold", label: N(st.s), pos: "sw" });
      G.handle("e", st.e, 0, x => { st.e = clamp(snap(x, 0.5), -3, 4); this.fix(st, "e"); ctx.redraw(); }, { c: "gold", label: N(st.e), pos: "se" });
    }
  },
  band(st) {
    const { mx, mn, both } = mmCalc(st);
    const mxs = both ? `x = ${N(st.s)}, ${N(st.e)}` : `x = ${N(mx.x)}`;
    return { g: "軸が範囲の中か外か → 頂点と はし の y の値をくらべる", n: `${vform(st.a, st.p, st.q)} <span class="mt">（${N(st.s)} ≦ x ≦ ${N(st.e)}）</span><br><span class="hl">最大 ${N(mx.y)}</span> <span class="mt">（${mxs}）</span>　<span class="bl">最小 ${N(mn.y)}</span> <span class="mt">（x = ${N(mn.x)}）</span>` };
  },
  points: ["まず<b>平方完成</b>して 軸と頂点を見る", "下に凸のとき：軸が範囲の中 → <b>頂点で最小</b>", "最大は 軸から<b>遠い方のはし</b>（上に凸なら 最大・最小が反対）"],
  ex: {
    q: "y = x² − 2x − 3（0 ≦ x ≦ 3）の 最大値・最小値は？", st: { a: 1, p: 1, q: -4, s: 0, e: 3 },
    steps: [
      { t: "平方完成する", n: "y = x² − 2x − 3 = (x − 1)² − 4" },
      { t: "範囲 0 ≦ x ≦ 3 に色をぬる。軸は x = 1", hl: "range axis", n: "軸 x = 1、範囲 0 ≦ x ≦ 3" },
      { t: "軸 x = 1 は<b>範囲の中</b> → 頂点で最小", hl: "range min", n: "最小値 −4（x = 1）" },
      { t: "軸から遠いはしは x = 3 → (3 − 1)² − 4 = <b>0</b>", hl: "range max min", n: "最大値 0（x = 3）、最小値 −4（x = 1）" },
    ],
  },
  gen() {
    const p = rint(-2, 2), q = rint(-4, 2), s = rint(-3, 1), e = s + rint(2, 4), st = { a: 1, p, q, s, e };
    const { f, mx, mn } = mmCalc(st), wantMax = Math.random() < 0.5;
    const ans = wantMax ? mx.y : mn.y;
    const c = chooseNum(ans, [f(s), f(e), q, f(p + 1), wantMax ? mn.y : mx.y]);
    const word = wantMax ? "最大値" : "最小値";
    return {
      q: `y = ${P(1, -2 * p, p * p + q)}（${N(s)} ≦ x ≦ ${N(e)}）の <b>${word}</b> は？`, ...c,
      hint: `平方完成すると ${vform(1, p, q)}。軸 x = ${N(p)} は 範囲の${p >= s && p <= e ? "中" : "外"}`,
      exp: `${vform(1, p, q)}、x = ${N(s)} のとき ${N(f(s))}、x = ${N(e)} のとき ${N(f(e))}${p >= s && p <= e ? `、頂点で ${N(q)}` : ""}<br>${word}は <b>${N(ans)}</b>`,
      st, hl: wantMax ? "range max" : "range min",
    };
  },
});

/* ---------- 5. 2次方程式と判別式 ---------- */
function rootsOf(b, c) { const D = b * b - 4 * c; if (D < 0) return []; if (D === 0) return [-b / 2]; return [(-b - Math.sqrt(D)) / 2, (-b + Math.sqrt(D)) / 2]; }
function nice(v) { return Math.abs(v - Math.round(v)) < 1e-9 ? N(v) : "≈" + N(v, 2); }
UNITS.push({
  id: "disc", sub: "I", name: "2次方程式と判別式", small: "グラフと x 軸の共有点",
  init: () => ({ b: -4, c: 3 }),
  view: () => ({ xmin: -7, xmax: 7, ymin: -9, ymax: 8, equal: false }),
  ctrls: [{ k: "b", label: "b", min: -6, max: 6, step: 1 }, { k: "c", label: "c", min: -6, max: 9, step: 1 }],
  hint: "c を大きくすると グラフが上がって、共有点が 2 → 1 → 0 個に",
  draw(G, st, ctx) {
    const D = st.b * st.b - 4 * st.c;
    G.fn(x => x * x + st.b * x + st.c, { c: "accent", w: 3.5 });
    const rs = rootsOf(st.b, st.c);
    rs.forEach((r, i) => G.point(r, 0, { c: "warm", r: em(ctx, "roots", 8, 6.5), label: "x = " + nice(r), pos: rs.length === 2 ? (i ? "se" : "sw") : "s", pop: H(ctx, "roots") }));
    G.textPx(14, G.h - 16, `D = ${N(D)}　→　共有点 ${rs.length} 個`, { c: D > 0 ? "warm" : D === 0 ? "gold" : "blue", size: em(ctx, "D", 20, 16) });
  },
  band(st) {
    const D = st.b * st.b - 4 * st.c, n = D > 0 ? 2 : D === 0 ? 1 : 0;
    return { g: "D = b² − 4ac　D > 0 → 2 個、D = 0 → 1 個（接する）、D < 0 → 0 個", n: `y = ${P(1, st.b, st.c)}　D = ${pn(st.b)}² − 4·1·${pn(st.c)} = <span class="hl">${N(D)}</span>　<span class="mt">→ 共有点</span> <span class="hl">${n} 個</span>` };
  },
  points: ["グラフと x 軸の共有点の x 座標 ＝ <b>2次方程式の解</b>", "判別式 <b>D = b² − 4ac</b> で 解の個数がわかる", "D > 0 → 2 個、D = 0 → 1 個（接する）、D < 0 → 0 個"],
  ex: {
    q: "x² − 4x + 3 = 0 を解こう。グラフと x 軸の共有点は何個？", st: { b: -4, c: 3 },
    steps: [
      { t: "判別式 D = b² − 4ac を計算", hl: "D", n: "D = (−4)² − 4·1·3 = 16 − 12 = 4" },
      { t: "D = 4 > 0 なので、共有点は <b>2 個</b>", hl: "D roots", n: "D > 0 → 2 個" },
      { t: "因数分解：かけて 3、たして −4 は −1 と −3", n: "(x − 1)(x − 3) = 0" },
      { t: "解は <b>x = 1, 3</b>。グラフが x 軸と交わるところ", hl: "roots", n: "x = 1, 3" },
    ],
  },
  gen() {
    const t = rint(0, 2);
    if (t === 0) {
      const r1 = rint(-5, 4), r2 = r1 + rint(1, 5), b = -(r1 + r2), c = r1 * r2;
      const f = (u, v) => `x = ${N(u)}, ${N(v)}`;
      const ch = choose(f(r1, r2), [f(-r2, -r1), f(r1, -r2), f(-r1, r2), f(r1 + 1, r2 + 1)]);
      return { q: `${P(1, b, c)} = 0 を解くと？`, ...ch, hint: `かけて ${N(c)}、たして ${N(b)} の 2 数で因数分解`, exp: `${sh2(-r1)}${sh2(-r2)} = 0 より <b>${f(r1, r2)}</b>`, st: { b, c }, hl: "roots" };
    }
    const kind = rint(0, 2); let b, c;
    if (kind === 0) { b = nz(-6, 6); c = rint(-5, Math.floor((b * b - 1) / 4)); }
    else if (kind === 1) { b = 2 * nz(-3, 3); c = b * b / 4; }
    else { b = rint(-4, 4); c = Math.floor(b * b / 4) + rint(1, 4); }
    const D = b * b - 4 * c, n = D > 0 ? 2 : D === 0 ? 1 : 0;
    if (t === 1) {
      const ch = { ch: ["0 個", "1 個", "2 個"], ans: n };
      return { q: `y = ${P(1, b, c)} のグラフと x 軸の共有点は 何個？`, ...ch, one: true, hint: "判別式 D = b² − 4ac の符号を見よう", exp: `D = ${pn(b)}² − 4·1·${pn(c)} = ${N(D)} ${D > 0 ? "> 0" : D === 0 ? "= 0" : "< 0"}<br>なので <b>${n} 個</b>`, st: { b, c }, hl: "D roots" };
    }
    const ch = chooseNum(D, [b * b + 4 * c, b * b - c, -b * b - 4 * c, 2 * b - 4 * c]);
    return { q: `${P(1, b, c)} = 0 の 判別式 D の値は？`, ...ch, hint: "D = b² − 4ac（a = 1）", exp: `D = ${pn(b)}² − 4·1·${pn(c)} = <b>${N(D)}</b>`, st: { b, c }, hl: "D" };
  },
});

/* ---------- 6. 2次不等式 ---------- */
const ineqAns = (al, be, sgn) => {
  const strict = sgn === ">" || sgn === "<", lt = strict ? "<" : "≦";
  return (sgn === "<" || sgn === "≦") ? `${N(al)} ${lt} x ${lt} ${N(be)}` : `x ${lt} ${N(al)}, ${N(be)} ${lt} x`;
};
UNITS.push({
  id: "ineq", sub: "I", name: "2次不等式", small: "グラフの上か下か",
  init: () => ({ al: -2, be: 3, sg: "<" }),
  view: () => ({ xmin: -6, xmax: 6, ymin: -9, ymax: 7, equal: false }),
  ctrls: [{ k: "sg", label: "記号", opts: [["<", "< 0"], ["≦", "≦ 0"], [">", "> 0"], ["≧", "≧ 0"]] }, { k: "al", label: "α", min: -5, max: 4, step: 1 }, { k: "be", label: "β", min: -4, max: 5, step: 1 }],
  fix(st, k) { if (st.al >= st.be) { if (k === "al") st.be = Math.min(5, st.al + 1); else st.al = Math.max(-5, st.be - 1); } },
  hint: "記号をかえると、x 軸の上の色（答えの範囲）が かわる",
  draw(G, st, ctx) {
    const f = x => (x - st.al) * (x - st.be), below = st.sg === "<" || st.sg === "≦", closed = st.sg === "≦" || st.sg === "≧";
    G.fn(f, { c: "muted", w: 2 });
    const showAns = !ctx.hl || H(ctx, "ans") || H(ctx, "below");
    if (showAns) {
      if (below) G.fn(f, { c: "warm", w: 5, from: st.al, to: st.be, pop: H(ctx, "below") });
      else { G.fn(f, { c: "warm", w: 5, to: st.al }); G.fn(f, { c: "warm", w: 5, from: st.be }); }
    }
    if (!ctx.hl || H(ctx, "ans")) {
      const yy = 0, o = { c: "warm", w: 7, pop: H(ctx, "ans") };
      if (below) G.line(st.al, yy, st.be, yy, o); else { G.line(G.x0, yy, st.al, yy, o); G.line(st.be, yy, G.x1, yy, o); }
    }
    [st.al, st.be].forEach((r, i) => G.point(r, 0, { c: "warm", r: 7, hollow: !closed, label: N(r), pos: i ? "se" : "sw", size: em(ctx, "roots", 19, 15) }));
  },
  band(st) {
    const b = -(st.al + st.be), c = st.al * st.be;
    return { g: "(x − α)(x − β) < 0 → α < x < β（内側）、 > 0 → x < α, β < x（外側）", n: `${P(1, b, c)} ${st.sg} 0　→　<span class="hl">${ineqAns(st.al, st.be, st.sg)}</span>` };
  },
  points: ["左辺を<b>因数分解</b>して、グラフと x 軸の交点 α, β を出す", "<b>&lt; 0</b> → グラフが x 軸より<b>下</b> → 内側 α < x < β", "<b>&gt; 0</b> → x 軸より<b>上</b> → 外側 x < α, β < x"],
  ex: {
    q: "x² − x − 6 < 0 を解こう", st: { al: -2, be: 3, sg: "<" },
    steps: [
      { t: "左辺を因数分解する", n: "x² − x − 6 = (x + 2)(x − 3)" },
      { t: "グラフと x 軸の交点は x = −2, 3", hl: "roots", n: "交点 x = −2, 3" },
      { t: "<b>< 0</b> は、グラフが x 軸より<b>下</b>の部分", hl: "roots below", n: "(x + 2)(x − 3) < 0 → グラフが下" },
      { t: "その x の範囲が答え：<b>−2 < x < 3</b>", hl: "roots below ans", n: "−2 < x < 3" },
    ],
  },
  gen() {
    const al = rint(-5, 3), be = al + rint(1, 5), s = pick(["<", ">", "≦", "≧"]), st = { al, be, sg: s };
    const other = { "<": ">", ">": "<", "≦": "≧", "≧": "≦" }[s], flip = { "<": "≦", "≦": "<", ">": "≧", "≧": ">" }[s];
    const c = choose(ineqAns(al, be, s), [ineqAns(al, be, other), ineqAns(al, be, flip), ineqAns(-be, -al, s)]);
    const below = s === "<" || s === "≦";
    return { q: `${P(1, -(al + be), al * be)} ${s} 0 を解くと？`, ...c, one: true, hint: `因数分解すると ${sh2(-al)}${sh2(-be)}。${below ? "0 より小さい → グラフが下" : "0 より大きい → グラフが上"}`, exp: `${sh2(-al)}${sh2(-be)} ${s} 0、交点は x = ${N(al)}, ${N(be)}<br>グラフが x 軸より${below ? "下（内側）" : "上（外側）"}${s === "≦" || s === "≧" ? "、= もふくむ" : ""}<br><b>${ineqAns(al, be, s)}</b>`, st, hl: "roots below ans" };
  },
});

/* ---------- 7. 三角比 ---------- */
const TRIG = { // 角度: [sin, cos, tan]
  0: ["0", "1", "0"], 30: ["1/2", "√3/2", "1/√3"], 45: ["1/√2", "1/√2", "1"], 60: ["√3/2", "1/2", "√3"], 90: ["1", "0", null],
  120: ["√3/2", "−1/2", "−√3"], 135: ["1/√2", "−1/√2", "−1"], 150: ["1/2", "−√3/2", "−1/√3"], 180: ["0", "−1", "0"],
};
/* "−√3/2" → HTML の分数 */
function tv(s) {
  if (s == null) return "なし";
  const neg = s.startsWith("−"), b = neg ? s.slice(1) : s;
  if (!b.includes("/")) return s;
  const [n, d] = b.split("/");
  return (neg ? MI : "") + fr(n, d);
}
UNITS.push({
  id: "trig", sub: "I", name: "三角比", small: "半径 1 の円で sin・cos・tan",
  init: () => ({ t: 120 }),
  view: () => ({ xmin: -1.45, xmax: 1.45, ymin: -0.35, ymax: 1.45, gridX: 0.5, gridY: 0.5 }),
  ctrls: [{ k: "t", label: "θ", min: 0, max: 180, step: 1, unit: "°" }, { k: "t", label: "", opts: [[30, "30°"], [45, "45°"], [60, "60°"], [90, "90°"], [120, "120°"], [135, "135°"], [150, "150°"]] }],
  hint: "👆 円の上の点 P をドラッグ。y 座標 が sin、x 座標 が cos",
  draw(G, st, ctx) {
    const t = st.t * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    G.circle(0, 0, 1, { c: "muted", w: 1.5, dash: "4 5" });
    G.fn(x => Math.sqrt(Math.max(0, 1 - x * x)), { c: "muted", w: 2, from: -1, to: 1 });
    if (Math.abs(c) > 0.05 && Math.abs(s / c) < 1.3) { G.vline(1, { c: "violet", w: 1, dash: "3 5", op: 0.6 }); G.line(0, 0, 1, s / c, { c: "violet", w: 1.5, dash: "5 4", op: em(ctx, "tan", 1, 0.55) }); G.point(1, s / c, { c: "violet", r: 4, label: "tan θ", pos: "e", size: 13, op: em(ctx, "tan", 1, 0.7) }); }
    G.angle(0, 0, 0, st.t, { rp: 30 });
    G.label(0.22 * Math.cos(t / 2), 0.22 * Math.sin(t / 2), "θ", { pos: "e", d: 4, c: "gold", size: 15 });
    G.line(0, 0, c, s, { c: "ink", w: 2.5 });
    G.line(c, 0, c, s, { c: "warm", w: em(ctx, "sin", 7, 5), pop: H(ctx, "sin") });
    G.line(0, 0, c, 0, { c: "blue", w: em(ctx, "cos", 7, 5), pop: H(ctx, "cos") });
    if (H(ctx, "tri")) G.poly([[0, 0], [c, 0], [c, s]], { fill: "gold-soft", c: "gold", pop: true });
    G.label(c, s / 2, "sin", { pos: c >= 0 ? "e" : "w", c: "warm", size: 14 });
    G.label(c / 2, 0, "cos", { pos: "s", c: "blue", size: 14 });
    const lab = `P(${N(c, 2)}, ${N(s, 2)})`;
    if (ctx.touch) G.handle("P", c, s, (x, y) => { let a = Math.atan2(Math.max(y, 0), x) * 180 / Math.PI; if (a < 0) a = x > 0 ? 0 : 180; st.t = clamp(Math.round(a), 0, 180); for (const k of [0, 30, 45, 60, 90, 120, 135, 150, 180]) if (Math.abs(st.t - k) <= 2) st.t = k; ctx.redraw(); }, { label: lab, pos: c >= 0 ? "ne" : "nw" });
    else G.point(c, s, { c: "warm", r: 7, label: "P", pos: c >= 0 ? "ne" : "nw", pop: H(ctx, "P") });
  },
  band(st) {
    const v = TRIG[st.t], t = st.t * Math.PI / 180;
    if (v) return { g: "sin θ = y、cos θ = x、tan θ = y ÷ x（半径 1 の円の点 P）", n: `θ = ${st.t}°　<span class="hl">sin = ${tv(v[0])}</span>　<span class="bl">cos = ${tv(v[1])}</span>　tan = ${tv(v[2])}` };
    return { g: "sin θ = y、cos θ = x、tan θ = y ÷ x（半径 1 の円の点 P）", n: `θ = ${st.t}°　<span class="hl">sin ≈ ${N(Math.sin(t), 3)}</span>　<span class="bl">cos ≈ ${N(Math.cos(t), 3)}</span>　tan ≈ ${st.t === 90 ? "なし" : N(Math.tan(t), 3)}` };
  },
  points: ["半径 1 の円の点 P の <b>y 座標が sin θ</b>、<b>x 座標が cos θ</b>", "θ が 90° より大きいと P は左側 → <b>cos がマイナス</b>", "30°・45°・60° は 三角定規（1 : 2 : √3、1 : 1 : √2）で覚える"],
  ex: {
    q: "sin 120°、cos 120° の値は？", st: { t: 120 },
    steps: [
      { t: "半径 1 の円の上に 120° の点 P をとる", hl: "P", n: "θ = 120°" },
      { t: "x 軸と 60° の 三角定規（1 : 2 : √3）ができる", hl: "P tri", n: "辺の比  1 : 2 : √3" },
      { t: "P の <b>y 座標</b>（赤）が sin", hl: "sin tri", n: `sin 120° = ${fr("√3", "2")}` },
      { t: "P の <b>x 座標</b>（青）が cos。左側なのでマイナス", hl: "cos tri", n: `sin 120° = ${fr("√3", "2")}、cos 120° = −${fr("1", "2")}` },
    ],
  },
  gen() {
    if (Math.random() < 0.25) { // θ を求める
      const v = pick([["1/2", "30°, 150°"], ["1/√2", "45°, 135°"], ["√3/2", "60°, 120°"]]);
      const all = ["30°, 150°", "45°, 135°", "60°, 120°", "30°", "60°", "150°"];
      const c = choose(v[1], shuffle(all.filter(a => a !== v[1])));
      const t0 = parseInt(v[1]);
      return { q: `sin θ = ${tv(v[0])}（0° ≦ θ ≦ 180°）のとき θ は？`, ...c, hint: "y 座標が同じになる点は、円の上に 2 つある（左右対称）", exp: `y 座標が ${tv(v[0])} の点は 2 つ<br><b>θ = ${v[1]}</b>`, st: { t: t0 }, hl: "sin tri" };
    }
    const fi = rint(0, 2), name = ["sin", "cos", "tan"][fi];
    let ang = pick([0, 30, 45, 60, 90, 120, 135, 150, 180]);
    if (fi === 2 && ang === 90) ang = 120;
    const val = TRIG[ang][fi];
    const pool = fi === 2 ? ["0", "1/√3", "1", "√3", "−1/√3", "−1", "−√3"] : ["0", "1/2", "1/√2", "√3/2", "1", "−1/2", "−1/√2", "−√3/2", "−1"];
    const neg = val.startsWith("−") ? val.slice(1) : val === "0" ? "1" : "−" + val;
    const c = choose(tv(val), [tv(neg), ...shuffle(pool).map(tv)]);
    const how = fi === 0 ? "y 座標" : fi === 1 ? "x 座標" : "y ÷ x（直線 OP の傾き）";
    return { q: `${name} ${ang}° の値は？`, ...c, hint: `半径 1 の円で ${ang}° の点 P をかこう。${name} は ${how}`, exp: `${ang}° の点 P の ${how} → <b>${name} ${ang}° = ${tv(val)}</b>`, st: { t: ang }, hl: ["sin", "cos", "tan"][fi] + " tri" };
  },
});

/* ---------- 8. 正弦定理・余弦定理 ---------- */
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
function angAt(p, q, r) { // p での角（度）
  const a = Math.atan2(q[1] - p[1], q[0] - p[0]), b = Math.atan2(r[1] - p[1], r[0] - p[0]);
  let d = Math.abs(a - b) * 180 / Math.PI; if (d > 180) d = 360 - d; return d;
}
function circum(A, B, C) {
  const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
  const s = p => p[0] * p[0] + p[1] * p[1];
  const ux = (s(A) * (B[1] - C[1]) + s(B) * (C[1] - A[1]) + s(C) * (A[1] - B[1])) / d;
  const uy = (s(A) * (C[0] - B[0]) + s(B) * (A[0] - C[0]) + s(C) * (B[0] - A[0])) / d;
  return [ux, uy, dist([ux, uy], A)];
}
const nv = v => Math.abs(v - Math.round(v)) < 0.02 ? String(Math.round(v)) : N(v, 1);
function triFrom(b, c, Adeg, k) { // A を原点、AB を x 軸に
  const t = Adeg * Math.PI / 180, s = 8 / Math.max(b, c, 1);
  return { A: [0, 0], B: [c * s, 0], C: [b * s * Math.cos(t), b * s * Math.sin(t)], k: 1 / s };
}
UNITS.push({
  id: "tri", sub: "I", name: "正弦定理・余弦定理", small: "三角形の辺と角",
  init: () => ({ mode: "cos", A: [0, 0], B: [8, 0], C: [2.5, 4.33], k: 1 }),
  view: st => st.mode === "sin" ? { xmin: -3, xmax: 11, ymin: -6, ymax: 9 } : { xmin: -2, xmax: 10, ymin: -1.5, ymax: 8 },
  ctrls: [{ k: "mode", label: "", opts: [["cos", "余弦定理"], ["sin", "正弦定理"]] }, { btn: "形をもどす", act: st => Object.assign(st, { A: [0, 0], B: [8, 0], C: [2.5, 4.33] }) }],
  hint: "👆 頂点 A・B・C をドラッグして 形をかえられる",
  draw(G, st, ctx) {
    const { A, B, C, k } = st, a = dist(B, C) * k, b = dist(C, A) * k, c = dist(A, B) * k;
    const aA = angAt(A, B, C);
    if (st.mode === "sin") {
      const [ux, uy, R] = circum(A, B, C);
      if (R < 40) { G.circle(ux, uy, R, { c: "violet", w: 2, dash: "6 5" }); G.point(ux, uy, { c: "violet", r: 4 }); G.line(ux, uy, B[0], B[1], { c: "violet", w: 2 }); G.label((ux + B[0]) / 2, (uy + B[1]) / 2, "R = " + nv(R * k), { pos: "e", c: "violet", size: 15 }); }
    }
    G.poly([A, B, C], { fill: "accent-soft", c: "ink", w: 2 });
    const side = (p, q, txt, key, color) => { const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; G.line(p[0], p[1], q[0], q[1], { c: H(ctx, key) ? color : "ink", w: H(ctx, key) ? 6 : 2, pop: H(ctx, key) }); G.label(m[0], m[1], txt, { pos: "e", c: color, size: em(ctx, key, 19, 15) }); };
    side(B, C, "a = " + nv(a), "a", "warm");
    side(C, A, "b = " + nv(b), "b", "blue");
    side(A, B, "c = " + nv(c), "c", "blue");
    const a1 = Math.atan2(B[1] - A[1], B[0] - A[0]) * 180 / Math.PI, a2 = Math.atan2(C[1] - A[1], C[0] - A[0]) * 180 / Math.PI;
    let s1 = a1, s2 = a2; if (((s2 - s1) % 360 + 360) % 360 > 180) [s1, s2] = [s2, s1]; if (s2 < s1) s2 += 360;
    G.angle(A[0], A[1], s1, s2, { rp: 26, fill: H(ctx, "A") ? "warm-soft" : "gold-soft", c: H(ctx, "A") ? "warm" : "gold" });
    G.label(A[0], A[1], nv(aA) + "°", { pos: "ne", d: 28, c: "gold", size: 14 });
    const mv = key => (x, y) => { st[key] = [snap(x, 0.1), snap(y, 0.1)]; ctx.redraw(); };
    [["A", A, "sw"], ["B", B, "se"], ["C", C, "n"]].forEach(([n, p, pos]) => {
      if (ctx.touch) G.handle(n, p[0], p[1], mv(n), { label: n, pos, c: "ink", lc: "ink" });
      else G.point(p[0], p[1], { r: 4, label: n, pos, size: 17 });
    });
  },
  band(st) {
    const { A, B, C, k } = st, a = dist(B, C) * k, b = dist(C, A) * k, c = dist(A, B) * k, aA = angAt(A, B, C);
    if (st.mode === "sin") { const R = circum(A, B, C)[2] * k; return { g: "a / sin A = b / sin B = c / sin C = 2R（R：外接円の半径）", n: `${nv(a)} ÷ sin ${nv(aA)}° = <span class="hl">${N(a / Math.sin(aA * Math.PI / 180), 2)}</span> = 2R　<span class="mt">→</span> R = ${nv(R)}` }; }
    return { g: "a² = b² + c² − 2bc cos A", n: `a² = ${nv(b)}² + ${nv(c)}² − 2·${nv(b)}·${nv(c)}·cos ${nv(aA)}° = <span class="hl">${N(a * a, 1)}</span>　<span class="mt">→</span> a = ${nv(a)}` };
  },
  points: ["<b>a は 角 A の向かいの辺</b>（b は B の、c は C の向かい）", "余弦定理：<b>2 辺とその間の角</b> → 残りの辺 a² = b² + c² − 2bc cos A", "正弦定理：<b>辺と向かいの角</b> のペア → 外接円の半径 R（a / sin A = 2R）"],
  ex: {
    q: "b = 5、c = 8、A = 60° のとき、a を求めよう", st: { mode: "cos", ...triFrom(5, 8, 60) },
    steps: [
      { t: "わかっているのは <b>2 辺 b, c とその間の角 A</b> → 余弦定理", hl: "b c A", n: "a² = b² + c² − 2bc cos A" },
      { t: "数を入れる（cos 60° = 1/2）", hl: "b c A", n: `a² = 5² + 8² − 2·5·8·${fr(1, 2)}` },
      { t: "計算する", n: "a² = 25 + 64 − 40 = 49" },
      { t: "a > 0 なので <b>a = 7</b>", hl: "a", n: "a = 7" },
    ],
  },
  gen() {
    const r = Math.random();
    if (r < 0.45) {
      const [b, c, A, a] = pick([[5, 8, 60, 7], [3, 8, 60, 7], [8, 15, 60, 13], [3, 5, 120, 7], [7, 8, 120, 13], [5, 3, 120, 7], [8, 5, 60, 7], [1, 1, 120, "√3"]]);
      const cosv = A === 60 ? fr(1, 2) : MI + fr(1, 2);
      const ans = String(a), nums = typeof a === "number" ? [a + 1, a - 1, a * a, b + c].map(String) : ["3", "1", "√2"];
      const c2 = choose(ans, nums);
      return { q: `△ABC で b = ${b}、c = ${c}、A = ${A}° のとき、a は？`, ...c2, hint: "2 辺とその間の角 → 余弦定理 a² = b² + c² − 2bc cos A", exp: `a² = ${b}² + ${c}² − 2·${b}·${c}·${cosv} = ${b * b + c * c - (A === 60 ? 1 : -1) * b * c}<br>a = <b>${ans}</b>`, st: { mode: "cos", ...triFrom(b, c, A) }, hl: "a" };
    }
    if (r < 0.7) {
      const [b, c, a, A] = pick([[5, 8, 7, 60], [3, 5, 7, 120], [3, 8, 7, 60], [8, 15, 13, 60], [7, 8, 13, 120]]);
      const cv = (b * b + c * c - a * a) / (2 * b * c);
      const c2 = choose(A + "°", ["30°", "45°", "60°", "90°", "120°", "135°", "150°"]);
      return { q: `△ABC で a = ${a}、b = ${b}、c = ${c} のとき、角 A は？`, ...c2, hint: "余弦定理を cos A について：cos A = (b² + c² − a²) ÷ 2bc", exp: `cos A = (${b * b} + ${c * c} − ${a * a}) ÷ ${2 * b * c} = ${F(cv)}<br>A = <b>${A}°</b>`, st: { mode: "cos", ...triFrom(b, c, A) }, hl: "A" };
    }
    const [A, aStr, R, sinS] = pick([[30, "6", 6, fr(1, 2)], [30, "10", 10, fr(1, 2)], [45, "4√2", 4, fr(1, "√2")], [60, "5√3", 5, fr("√3", 2)], [60, "3√3", 3, fr("√3", 2)], [90, "8", 4, "1"], [150, "4", 4, fr(1, 2)]]);
    const c2 = choose(String(R), [String(R * 2), String(R + 1), String(Math.max(1, R - 1)), String(R * 3)]);
    const B = A >= 90 ? 20 : 50, Cc = 180 - A - B, b = 2 * R * Math.sin(B * Math.PI / 180), cc = 2 * R * Math.sin(Cc * Math.PI / 180);
    return { q: `△ABC で a = ${aStr}、A = ${A}° のとき、外接円の半径 R は？`, ...c2, hint: "辺と向かいの角のペア → 正弦定理 a / sin A = 2R", exp: `${aStr} ÷ ${sinS} = 2R<br>2R = ${R * 2} なので <b>R = ${R}</b>`, st: { mode: "sin", ...triFrom(b, cc, A) }, hl: "a A" };
  },
});

/* ---------- 9. データの分析 ---------- */
function stats(v) {
  const n = v.length, s = v.slice().sort((a, b) => a - b), m = v.reduce((a, b) => a + b, 0) / n;
  const med = arr => arr.length % 2 ? arr[(arr.length - 1) / 2] : (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2;
  const half = Math.floor(n / 2), lo = s.slice(0, half), hi = s.slice(n - half);
  const vr = v.reduce((a, b) => a + (b - m) ** 2, 0) / n;
  return { n, s, m, med: med(s), q1: med(lo), q3: med(hi), min: s[0], max: s[n - 1], vr, sd: Math.sqrt(vr) };
}
UNITS.push({
  id: "data", sub: "I", name: "データの分析", small: "平均・分散・箱ひげ図",
  init: () => ({ v: [2, 4, 6, 8, 10] }),
  view: () => ({ xmin: -0.5, xmax: 12.5, ymin: -3.6, ymax: 4, equal: false, noY: true, xticks: Array.from({ length: 13 }, (_, i) => ({ v: i, l: String(i) })), xname: "" }),
  ctrls: [{ btn: "🎲 ちがうデータ", act: st => { st.v = Array.from({ length: 5 }, () => rint(0, 12)); } }, { btn: "もどす", act: st => { st.v = [2, 4, 6, 8, 10]; } }],
  hint: "👆 ● を左右にドラッグ。平均（赤い線）と ちらばり が動く",
  draw(G, st, ctx) {
    const S = stats(st.v), m = S.m;
    const seen = {};
    const ys = st.v.map(x => { seen[x] = (seen[x] || 0) + 1; return 0.55 + (seen[x] - 1) * 0.65; });
    if (!ctx.hl || H(ctx, "dev")) st.v.forEach((x, i) => { if (Math.abs(x - m) > 0.01) G.line(m, ys[i], x, ys[i], { c: "blue", w: em(ctx, "dev", 4, 2), op: em(ctx, "dev", 1, 0.55), pop: H(ctx, "dev") }); if (H(ctx, "dev")) G.label((x + m) / 2, ys[i], N(x - m), { pos: "n", d: 5, c: "blue", size: 13 }); });
    if (!ctx.hl || H(ctx, "mean")) { G.line(m, -0.3, m, 3.7, { c: "warm", w: 3, pop: H(ctx, "mean") }); G.label(m, 3.7, "平均 " + N(m, 2), { pos: "e", c: "warm", size: 15 }); }
    // 箱ひげ図
    const by = -2.2, bh = 0.5;
    if (!ctx.hl || H(ctx, "box")) {
      G.line(S.min, by, S.q1, by, { w: 2 }); G.line(S.q3, by, S.max, by, { w: 2 });
      G.line(S.min, by - 0.3, S.min, by + 0.3, { w: 2 }); G.line(S.max, by - 0.3, S.max, by + 0.3, { w: 2 });
      G.rect(S.q1, by - bh, S.q3 - S.q1, 2 * bh, { fill: "accent-soft", c: "ink", w: 2, pop: H(ctx, "box") });
      G.line(S.med, by - bh, S.med, by + bh, { c: "accent", w: 4 });
      G.label(S.med, by - bh, "中央値 " + N(S.med), { pos: "s", d: 22, c: "accent", size: 13 });
    }
    st.v.forEach((x, i) => {
      if (ctx.touch) G.handle("d" + i, x, ys[i], nx => { st.v[i] = clamp(Math.round(nx), 0, 12); ctx.redraw(); }, { c: "ink" });
      else G.point(x, ys[i], { r: 8, c: "ink" });
    });
  },
  band(st) {
    const S = stats(st.v);
    return { g: "平均 = 合計 ÷ 個数　分散 = （偏差）² の平均　標準偏差 = √分散", n: `${S.s.join(", ")}　<span class="hl">平均 ${N(S.m, 2)}</span>　<span class="bl">分散 ${N(S.vr, 2)}</span>　<span class="mt">標準偏差</span> ${N(S.sd, 2)}` };
  },
  points: ["<b>偏差</b> = 値 − 平均（青い線の長さ）", "<b>分散</b> = 偏差を 2 乗して 平均したもの → ちらばりの大きさ", "<b>標準偏差</b> = √分散。箱ひげ図は 最小・Q₁・中央値・Q₃・最大"],
  ex: {
    q: "データ 2, 4, 6, 8, 10 の 平均 と 分散 は？", st: { v: [2, 4, 6, 8, 10] },
    steps: [
      { t: "平均 = 合計 ÷ 個数", hl: "mean", n: "(2 + 4 + 6 + 8 + 10) ÷ 5 = 30 ÷ 5 = 6" },
      { t: "それぞれの <b>偏差</b>（値 − 平均）", hl: "mean dev", n: "−4, −2, 0, 2, 4" },
      { t: "偏差を 2 乗して 平均する → <b>分散</b>", hl: "mean dev", n: "(16 + 4 + 0 + 4 + 16) ÷ 5 = 8" },
      { t: "標準偏差は √8 = 2√2（約 2.83）", hl: "mean dev", n: "分散 8、標準偏差 2√2" },
    ],
  },
  gen() {
    const [devs, vr] = pick([[[-2, -1, 0, 1, 2], 2], [[-3, -1, 0, 1, 3], 4], [[-4, -2, 0, 2, 4], 8], [[-1, -1, -1, -1, 4], 4], [[-3, -2, 0, 1, 4], 6], [[-4, -3, 0, 3, 4], 10], [[-6, 0, 1, 2, 3], 10]]);
    const lo = -Math.min(...devs), hi = 12 - Math.max(...devs), m = rint(lo, hi);
    const v = shuffle(devs.map(d => m + d)), S = stats(v), list = v.join(", ");
    const t = rint(0, 2);
    if (t === 0) { const c = chooseNum(m, [m + 1, m - 1, S.med === m ? m + 2 : S.med]); return { q: `データ ${list} の 平均値 は？`, ...c, hint: "全部たして、個数 5 でわる", exp: `(${v.join(" + ")}) ÷ 5 = ${v.reduce((a, b) => a + b, 0)} ÷ 5 = <b>${m}</b>`, st: { v }, hl: "mean" }; }
    if (t === 1) { const c = chooseNum(S.med, [m === S.med ? S.med + 1 : m, v[2], S.med - 1]); return { q: `データ ${list} の 中央値 は？`, ...c, hint: "小さい順にならべて、まん中（3 番目）", exp: `小さい順に ${S.s.join(", ")}<br>まん中は <b>${S.med}</b>`, st: { v }, hl: "box" }; }
    const c = chooseNum(vr, [vr * 5, Math.round(Math.sqrt(vr) * 10) / 10, vr + 2]);
    return { q: `データ ${list} の 分散 は？`, ...c, hint: `平均は ${m}。偏差（値 − 平均）を 2 乗して 平均する`, exp: `平均 ${m}、偏差 ${v.map(x => N(x - m)).join(", ")}<br>2 乗の合計 ${vr * 5} ÷ 5 = <b>${vr}</b>`, st: { v }, hl: "mean dev" };
  },
});
