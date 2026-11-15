"use strict";
/* ===== 数学I の単元 =====
   1 つの単元 = { id, sub, name, small, init, view, ctrls, draw, band, hint, points, ex, gen }
   draw(G, st, ctx)：G は Plot、ctx = { touch:さわれる?, hl:強調するもの, redraw } */
const UNITS = [];
const H = (ctx, k) => !!ctx.hl && ctx.hl.split(" ").includes(k);
const em = (ctx, k, a, b) => H(ctx, k) ? a : b;
/* 例題のとき：そのステップで強調するまで 答え（頂点・最大・辺の数など）を見せない */
const RV = (ctx, k) => !ctx.ex || H(ctx, k) || H(ctx, "all");

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
      G.label(x + w / 2, y - h / 2, ctx.ex && !on ? "?" : lab, { pos: "c", c: on ? "ink" : "muted", size: Math.min(26, 10 + Math.min(w, h) * 4) });
    };
    // ラベルの位置をそろえるため、文字は中央に
    tile(0, 0, X, X, "accent-soft", "x²", "x2");
    tile(X, 0, a, X, "blue-soft", (a === 1 ? "" : N(a)) + "x", "mid");
    tile(0, -X, X, b, "blue-soft", (b === 1 ? "" : N(b)) + "x", "mid");
    tile(X, -X, a, b, "warm-soft", N(a * b), "const");
    const side = RV(ctx, "mid");
    G.label(X / 2, 0, "x", { pos: "n", size: 17 }); G.label(X + a / 2, 0, side ? N(a) : "?", { pos: "n", size: 17, c: "warm" });
    G.label(0, -X / 2, "x", { pos: "w", size: 17 }); G.label(0, -X - b / 2, side ? N(b) : "?", { pos: "w", size: 17, c: "warm" });
  },
  band: st => ({ g: "(x + a)(x + b) = x² + (a + b)x + ab", n: `${sh2(st.a)}${sh2(st.b)} = <span class="hl">${P(1, st.a + st.b, st.a * st.b)}</span>` }),
  points: ["長方形の面積で考えると、<b>4 つの部分のたし算</b>になる", "x の係数は <b>a + b</b>、数だけの項は <b>a × b</b>", "因数分解はその逆：<b>かけて ab、たして a + b</b> の 2 数をさがす"],
  ex: {
    q: "x² + 5x + 6 を因数分解しよう", st: { a: 2, b: 3 },
    steps: [
      { t: "左上の正方形が x²。(x + □)(x + □) の □ に入る、<b>かけて 6、たして 5</b> の 2 つの数をさがす", hl: "x2", n: "x² + 5x + 6 = (x + □)(x + □)" },
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
    const neg = a < 0 || b < 0, asPlus = `(x + ${pn(a)})(x + ${pn(b)})`;
    const mul = `${N(a)} × ${pn(b)} = ${N(a * b)}`, add = `${N(a)} + ${pn(b)} = ${N(a + b)}`;
    if (Math.random() < 0.6) {
      // まちがいの組 (u, v) を 展開すると どこが ちがうか
      const wf = (u, v, pre = "") => [f(u, v), u * v !== a * b ? `${pre}展開すると 数の項が ${N(u * v)}。かけて ${N(a * b)} に ならない` : `${pre}展開すると x の係数が ${N(u + v)}。たして ${N(a + b)} に ならない`];
      const c = chooseW(f(a, b), [wf(-a, -b, "符号が反対。"), wf(a, -b, "片方の符号が反対。"), wf(-a, b, "片方の符号が反対。"), wf(a + 1, b - 1)]);
      return { q: `${P(1, a + b, a * b)} を因数分解すると？`, ...c, hint: `かけて ${N(a * b)}、たして ${N(a + b)} になる 2 つの数をさがそう`, exp: [
        [`x² + □x + ○ の形 → <b>かけて ${N(a * b)}</b>、<b>たして ${N(a + b)}</b> になる 2 つの数を さがす`, `${P(1, a + b, a * b)} = (x + □)(x + □)`],
        [`${N(a)} と ${N(b)} を ためす`, `${mul} ✓<br>${add} ✓`],
        [`その 2 つの数を かっこに 入れる${neg ? `（+ (${N(Math.min(a, b))}) は ${MI} ${Math.abs(Math.min(a, b))} と書く）` : ""}`, `${neg ? asPlus + " = " : ""}<b>${f(a, b)}</b>`],
      ], point: "因数分解は「かけて 数の項、たして x の係数」の 2 つの数を さがす", st: { a, b } };
    }
    const c = chooseW(P(1, a + b, a * b), [
      [P(1, a * b, a + b), "x の係数と 数の項が 入れかわっている。x の係数は たし算、数の項は かけ算"],
      [P(1, a + b, -a * b), `数の項の 符号が反対。${mul}`],
      [P(1, -(a + b), a * b), `x の係数の 符号が反対。${add}`],
      [P(1, a - b, a * b), "x の係数は ひき算ではなく たし算で 出す"],
    ]);
    return { q: `${f(a, b)} を展開すると？`, ...c, hint: "x の係数は a + b、数の項は a × b", exp: [
      ["公式 (x + a)(x + b) = x² + (a + b)x + ab を使う", `${neg ? `${f(a, b)} = ${asPlus}、` : ""}a = ${N(a)}、b = ${N(b)}`],
      ["x の係数は <b>たし算</b> a + b", add],
      ["数の項は <b>かけ算</b> a × b", mul],
      ["x²、x の項、数の項 の順に ならべる", `<b>${P(1, a + b, a * b)}</b>`],
    ], point: "x の係数は たし算、数の項は かけ算。マイナスは かっこをつけて 計算", st: { a, b } };
  },
});
/* かっこなしの x + a */
const uq = a => sh2(a).replace(/^\((.*)\)$/, "$1");
function sh2(a) { return a === 0 ? "x" : `(x ${a < 0 ? MI : "+"} ${Math.abs(a)})`; }

/* ---------- 2. 2次関数のグラフ ---------- */
const quadView = { xmin: -6, xmax: 6, ymin: -6, ymax: 6 };
/* 頂点のまわりが 大きく見える範囲（さわる以外） */
function quadFit(st) { const { a, p, q } = st; return { xmin: p - 5, xmax: p + 5, ymin: a >= 0 ? Math.min(q, 0) - 2 : Math.min(q, 0) - 9, ymax: a >= 0 ? Math.max(q, 0) + 9 : Math.max(q, 0) + 2, equal: false }; }
function vform(a, p, q) { return `y = ${co(a)}${sh("x", p)}²${sg(q)}`; }
UNITS.push({
  id: "quad", sub: "I", name: "2次関数のグラフ", small: "y = a(x − p)² + q",
  init: () => ({ a: 1, p: 1, q: -2 }),
  view: (st, ctx) => ctx && ctx.touch ? quadView : quadFit(st),
  ctrls: [{ k: "a", label: "a", min: -3, max: 3, step: 0.5 }, { k: "p", label: "p", min: -4, max: 4, step: 0.5 }, { k: "q", label: "q", min: -4, max: 4, step: 0.5 }],
  hint: "👆 頂点（光る点）をドラッグしても動かせる",
  draw(G, st, ctx) {
    const { a, p, q } = st;
    if ((p !== 0 || q !== 0) && (ctx.touch || H(ctx, "ghost"))) G.fn(x => a * x * x, { c: "muted", w: em(ctx, "ghost", 3, 1.5), dash: "6 5", op: em(ctx, "ghost", 1, 0.6) });
    if (H(ctx, "ghost")) G.arrow(0, 0, p, q, { c: "blue", w: 2.5, pop: true });
    if (RV(ctx, "axis")) {
      G.vline(p, { c: "warm", dash: "7 6", w: em(ctx, "axis", 3, 1.5), op: em(ctx, "axis", 1, 0.7) });
      const vx = ((st.view && st.view.xname) || "x").split("（")[0]; // 文章題では t など
      G.label(p, G.y1, `軸 ${vx} = ` + N(p), { pos: "se", c: "warm", size: em(ctx, "axis", 17, 13) });
    }
    if (st.mark) G.point(st.mark[0], st.mark[1], { c: "blue", r: 8, label: st.mark[2], pos: st.mark[3] || "ne", size: 18, top: true });
    if (a === 0) G.infLine(0, q, { c: "accent", w: 3 });
    else G.fn(x => a * (x - p) ** 2 + q, { c: "accent", w: 3.5, from: st.from, to: st.to });
    if (st.hline) { G.line(G.x0, st.hline[0], G.x1, st.hline[0], { c: "blue", w: 2, dash: "7 5" }); G.label(G.x1, st.hline[0], st.hline[1], { pos: "nw", c: "blue", size: 15 }); }
    if (st.seg) { const [u, v] = st.seg; G.fn(x => a * (x - p) ** 2 + q, { c: "warm", w: 6, from: u, to: v }); G.line(u, 0, v, 0, { c: "warm", w: 7 }); [u, v].forEach(x => { G.line(x, 0, x, a * (x - p) ** 2 + q, { c: "warm", w: 1.5, dash: "4 4" }); G.label(x, 0, N(x), { pos: "n", d: 8, c: "warm", size: 15 }); }); }
    const lab = `頂点 (${N(p)}, ${N(q)})`;
    if (ctx.touch) G.handle("v", p, q, (x, y) => { st.p = clamp(snap(x, 0.5), -4, 4); st.q = clamp(snap(y, 0.5), -4, 4); ctx.redraw(); }, { label: lab, pos: a >= 0 ? "se" : "ne" });
    else G.point(p, q, { c: "warm", r: em(ctx, "vertex", 8, 6), label: RV(ctx, "vertex") ? lab : "頂点", pos: a >= 0 ? "se" : "ne", size: em(ctx, "vertex", 19, 15), pop: H(ctx, "vertex") });
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
    const t = rint(0, 2), f = vform(a, p, q), inP = `(x ${p > 0 ? MI : "+"} ${Math.abs(p)})`;
    // 「(x − p) の p」を 読みとる手順（3 つの問題で 共通）
    const readP = [`式を y = a(x − <b>p</b>)² + <b>q</b> の形と ならべる`, `${f}`], getP = [`かっこの中 ${inP} → p = <b>${N(p)}</b>${p < 0 ? `（x + ${-p} は x − (${N(p)}) のこと）` : ""}`, `p = ${N(p)}`];
    const getQ = [`うしろの数 → q = <b>${N(q)}</b>`, `q = ${N(q)}`];
    if (t === 0) {
      const c = chooseW(pt(p, q), [
        [pt(-p, q), `x 座標の 符号が反対。かっこの中が ${inP} なら p = ${N(p)}（符号が 反対に見える ところが ワナ）`],
        [pt(p, -q), `y 座標の 符号が反対。うしろの数は そのまま q = ${N(q)}`],
        [pt(-p, -q), "x 座標も y 座標も 符号が反対。かっこの中だけ 反対に見えて、うしろの数は そのまま"],
        [pt(q, p), "x と y が 入れかわっている。かっこの中が x 座標、うしろの数が y 座標"],
      ]);
      return { q: `${f} の 頂点 は？`, ...c, hint: "y = a(x − p)² + q の頂点は (p, q)。かっこの中の符号に注意", exp: [readP, getP, getQ, ["頂点は (p, q)", `頂点 <b>${pt(p, q)}</b>`]], point: "かっこの中の数は 符号を反対にして読む。うしろの数は そのまま", st, hl: "vertex" };
    }
    if (t === 1) {
      const c = chooseW(`x = ${N(p)}`, [
        [`x = ${N(-p)}`, `符号が反対。かっこの中が ${inP} なら p = ${N(p)}`],
        [`x = ${N(q)}`, "q は 頂点の 高さ（y 座標）。軸は 頂点の x 座標を通る たての線"],
        [`y = ${N(q)}`, "y = … は 横の線。軸は たての線なので x = … の形"],
        [`y = ${N(p)}`, "y = … は 横の線。軸は たての線なので x = … の形"],
        [`x = ${N(-q)}`, "q は 軸と 関係ない。かっこの中の数を 見る"],
        [`x = ${N(p + 1)}`, "かっこの中の数を そのまま 符号を反対にすれば よい"],
      ]);
      return { q: `${f} の 軸 は？`, ...c, hint: "軸は 頂点を通る たての線 x = p", exp: [readP, getP, ["軸は 頂点を通る たての線 x = p", `軸 <b>x = ${N(p)}</b>`]], point: "軸は いつも「x = 数」の形（たての線）", st, hl: "axis" };
    }
    const c = chooseW(f, [
      [vform(a, -p, q), `x 軸方向に ${N(p)} → x を (x − ${pn(p)}) にかえる。${p > 0 ? "右に動かすのに + にすると 左に動く" : "マイナス方向なので (x + " + (-p) + ") になる"}`],
      [vform(a, p, -q), `y 軸方向に ${N(q)} → うしろに そのまま ${sg(q).trim()} をつける`],
      [vform(a, -p, -q), "x も y も 符号が反対。x は (x − p)、y は + q"],
    ]);
    return { q: `y = ${co(a)}x² を x 軸方向に ${N(p)}、y 軸方向に ${N(q)} 平行移動した式は？`, ...c, hint: "x 軸方向に p → x を (x − p) にかえる。y 軸方向に q → + q", exp: [
      ["頂点の動きで 考える", `(0, 0) → ${pt(p, q)}`],
      [`x 軸方向に ${N(p)}：x を (x − ${pn(p)}) にかえる`, `y = ${co(a)}${sh("x", p)}²`],
      [`y 軸方向に ${N(q)}：うしろに ${sg(q).trim()}`, `<b>${f}</b>`],
    ], point: "頂点が (p, q) → y = a(x − p)² + q。a（開き方）は かわらない", st, hl: "ghost vertex" };
  },
});

/* ---------- 3. 平方完成 ---------- */
function sqcView(st) {
  const h = st.b / 2, k = st.c - h * h;
  return { xmin: Math.min(-h - 4, -4), xmax: Math.max(-h + 4, 4), ymin: Math.min(k, 0) - 2.5, ymax: Math.max(st.c, k + 10, 4) + 1, equal: false };
}
UNITS.push({
  id: "sqc", sub: "I", name: "平方完成", small: "x² + bx + c を (x − p)² + q に",
  init: () => ({ b: -6, c: 5 }),
  view: st => sqcView(st),
  ctrls: [{ k: "b", label: "b", min: -8, max: 8, step: 2 }, { k: "c", label: "c", min: -6, max: 8, step: 1 }],
  hint: "b・c を動かすと、頂点の位置と 式が かわる",
  draw(G, st, ctx) {
    const h = st.b / 2, k = st.c - h * h;
    G.vline(-h, { c: "warm", dash: "7 6", w: 1.5, op: 0.7 });
    G.fn(x => x * x + st.b * x + st.c, { c: "accent", w: 3.5 });
    G.point(0, st.c, { c: "blue", r: 5, label: `y 切片 ${N(st.c)}`, pos: "e", op: em(ctx, "yint", 1, 0.8), size: 13 });
    G.point(-h, k, { c: "warm", r: em(ctx, "vertex", 8, 6), label: RV(ctx, "vertex") ? `頂点 ${pt(-h, k)}` : "頂点", pos: -h < 0 ? "sw" : "se", size: em(ctx, "vertex", 19, 15), pop: H(ctx, "vertex") });
  },
  band(st) {
    const h = st.b / 2, k = st.c - h * h;
    if (h === 0) return { g: "x² + bx + c = (x + b/2)² − (b/2)² + c", n: `y = ${P(1, 0, st.c)} <span class="mt">（もう平方完成の形）</span>` };
    return { g: "x² + bx + c = (x + b/2)² − (b/2)² + c", n: `${P(1, st.b, st.c)} = ${sh("x", -h)}² ${MI} ${N(h * h)}${sg(st.c)} = <span class="hl">${sh("x", -h)}²${sg(k)}</span>` };
  },
  points: ["x の係数の<b>半分</b>を使って (x + 半分)² をつくる", "かっこを広げると (半分)² が<b>よけいに出る</b>ので、それをひく", "平方完成すると 頂点がわかる → グラフがかける"],
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
    const X = sh("x", -h), hh = h * h;
    const s1 = [`x の係数 ${N(b)} の <b>半分</b>を 出す`, `${N(b)} ÷ 2 = ${N(h)}`];
    const s2 = [`${X}² を つくる。広げると <b>${hh}</b> が よけいに出る`, `${X}² = ${P(1, b, hh)}`];
    const s3 = [`よけいな ${hh} を <b>ひいて</b> おく`, `y = ${X}² ${MI} ${hh}${sg(c)}`];
    const s4 = (last) => c === 0 ? ["うしろの数は ひいた分だけ", last] : ["うしろの数を まとめる", `${MI}${hh} + ${pn(c)} = ${N(k)}<br>${last}`];
    if (Math.random() < 0.5) {
      const c2 = chooseW(form(h, k), [
        [form(-h, k), `かっこの中の 符号が反対。x の係数が ${b > 0 ? "+" : MI} なら かっこの中も ${b > 0 ? "+" : MI}（x の係数と 同じ符号）`],
        [form(h, c + hh), `${hh} を たしている。広げると よけいに出る ${hh} は ひく`],
        [form(h, c), `よけいに出る ${hh} を ひきわすれている`],
        [form(-h, c - hh + 2), "かっこの中の 符号が反対で、うしろの数も ちがう"],
      ]);
      return { q: `y = ${P(1, b, c)} を平方完成すると？`, ...c2, hint: `x の係数 ${N(b)} の半分は ${N(h)}。(x ${h < 0 ? MI : "+"} ${Math.abs(h)})² をつくって、よけいな ${hh} をひく`, exp: [s1, s2, s3, s4(`<b>${form(h, k)}</b>`)], point: "x の係数の 半分で (x + 半分)² をつくり、よけいな (半分)² を ひく", st, hl: "vertex" };
    }
    const c2 = chooseW(pt(-h, k), [
      [pt(h, k), `x 座標の 符号が反対。${X}² の頂点の x 座標は かっこの中と 符号が反対`],
      [pt(-h, c), `よけいに出る ${hh} を ひきわすれている`],
      [pt(h, -k), "x 座標も y 座標も 符号が反対"],
      [pt(-h, -k), "y 座標の 符号が反対。うしろの数は そのまま y 座標"],
      [pt(-h, k + 1), "y 座標の 計算ミス。うしろの数の まとめ方を もう一度"],
      [pt(h, c), `x 座標の 符号が反対で、よけいな ${hh} も ひきわすれている`],
    ]);
    return { q: `y = ${P(1, b, c)} の 頂点 は？`, ...c2, hint: "まず平方完成して y = (x − p)² + q の形にしよう", exp: [s1, s2, s3, s4(form(h, k)), ["頂点は (p, q)。かっこの中の数は 符号を反対にして読む", `頂点 <b>${pt(-h, k)}</b>`]], point: "まず 平方完成。頂点の x 座標は かっこの中と 符号が反対", st, hl: "vertex" };
  },
});

/* ---------- 4. 最大・最小 ---------- */
/* x の範囲 [x0, x1] のグラフが 全部入る表示 */
function mmView(st, x0, x1) {
  const f = x => st.a * (x - st.p) ** 2 + st.q, ys = [f(x0), f(x1), st.q, 0];
  if (st.p > x0 && st.p < x1) ys.push(st.q);
  const lo = Math.min(...ys), hi = Math.max(...ys), pad = Math.max(1.5, (hi - lo) * 0.15);
  return { xmin: Math.min(x0, st.p) - 1.5, xmax: Math.max(x1, st.p) + 1.5, ymin: lo - pad * 1.5, ymax: hi + pad, equal: false };
}
function mmCalc(st) {
  const f = x => st.a * (x - st.p) ** 2 + st.q;
  const fs = f(st.s), fe = f(st.e), inside = st.p >= st.s && st.p <= st.e;
  let mx, mn;
  if (st.a > 0) { mn = inside ? { x: st.p, y: st.q } : (fs < fe ? { x: st.s, y: fs } : { x: st.e, y: fe }); mx = fs >= fe ? { x: st.s, y: fs } : { x: st.e, y: fe }; }
  else { mx = inside ? { x: st.p, y: st.q } : (fs > fe ? { x: st.s, y: fs } : { x: st.e, y: fe }); mn = fs <= fe ? { x: st.s, y: fs } : { x: st.e, y: fe }; }
  const both = Math.abs(fs - fe) < 1e-9, bothMx = both && st.a > 0, bothMn = both && st.a < 0;
  return { f, mx, mn, bothMx, bothMn, inside };
}
UNITS.push({
  id: "minmax", sub: "I", name: "最大・最小", small: "範囲のある 2次関数",
  init: () => ({ a: 1, p: 1, q: -4, s: 0, e: 3 }),
  view: (st, ctx) => ctx && ctx.touch ? mmView(st, -3, 3) : mmView(st, st.s, st.e),
  ctrls: [{ k: "a", label: "向き", opts: [[1, "下に凸 ∪"], [-1, "上に凸 ∩"]] }, { k: "p", label: "軸 p", min: -2, max: 2, step: 0.5 }, { k: "q", label: "q", min: -4, max: 4, step: 0.5 }, { k: "s", label: "左はし", min: -3, max: 2.5, step: 0.5 }, { k: "e", label: "右はし", min: -2.5, max: 3, step: 0.5 }],
  fix(st, k) { if (st.s >= st.e) { if (k === "s") st.e = Math.min(3, st.s + 0.5); else st.s = Math.max(-3, st.e - 0.5); } },
  hint: "👆 範囲のはし（光る点）を 左右に ドラッグできる",
  draw(G, st, ctx) {
    const { f, mx, mn, bothMx, bothMn } = mmCalc(st);
    G.rect(st.s, G.y0, st.e - st.s, G.y1 - G.y0, { fill: "gold-soft", c: "none", op: em(ctx, "range", 1, 0.6), pop: H(ctx, "range") });
    G.vline(st.p, { c: "muted", dash: "6 6", w: em(ctx, "axis", 2.5, 1.2) });
    G.label(st.p, G.y1, "軸", { pos: "se", c: "muted", size: 13 });
    G.fn(f, { c: "muted", w: 1.5, dash: "5 5", op: 0.6 });
    G.fn(f, { c: "accent", w: 4, from: st.s, to: st.e });
    const showMx = (!ctx.hl || H(ctx, "max")) && st.only !== "min", showMn = (!ctx.hl || H(ctx, "min")) && st.only !== "max";
    if (showMx) { G.point(mx.x, mx.y, { c: "warm", r: 7, label: `最大 ${N(mx.y)}`, pos: "ne", d: 12, pop: H(ctx, "max") }); if (bothMx) G.point(st.s === mx.x ? st.e : st.s, mx.y, { c: "warm", r: 7, label: `最大 ${N(mx.y)}`, pos: "n" }); }
    if (showMn) { G.point(mn.x, mn.y, { c: "blue", r: 7, label: `最小 ${N(mn.y)}`, pos: "s", pop: H(ctx, "min") }); if (bothMn) G.point(st.s === mn.x ? st.e : st.s, mn.y, { c: "blue", r: 7, label: `最小 ${N(mn.y)}`, pos: "s" }); }
    if (ctx.touch) {
      G.handle("s", st.s, 0, x => { st.s = clamp(snap(x, 0.5), -3, 2.5); this.fix(st, "s"); ctx.redraw(); }, { c: "gold", label: N(st.s), pos: "sw" });
      G.handle("e", st.e, 0, x => { st.e = clamp(snap(x, 0.5), -2.5, 3); this.fix(st, "e"); ctx.redraw(); }, { c: "gold", label: N(st.e), pos: "se" });
    }
  },
  band(st) {
    const { mx, mn, bothMx, bothMn } = mmCalc(st), ends = `x = ${N(st.s)}, ${N(st.e)}`;
    const mxs = bothMx ? ends : `x = ${N(mx.x)}`, mns = bothMn ? ends : `x = ${N(mn.x)}`;
    const lt = st.only ? "<" : "≦";
    const mxH = st.only === "min" ? "" : `<span class="hl">最大 ${N(mx.y)}</span> <span class="mt">（${mxs}）</span>　`, mnH = st.only === "max" ? "" : `<span class="bl">最小 ${N(mn.y)}</span> <span class="mt">（${mns}）</span>`;
    return { g: "軸が範囲の中か外か → 頂点と はし の y の値をくらべる", n: `${vform(st.a, st.p, st.q)} <span class="mt">（${N(st.s)} ${lt} x ${lt} ${N(st.e)}）</span><br>${mxH}${mnH}` };
  },
  points: ["まず<b>平方完成</b>して 軸と頂点を見る", "下に凸のとき：軸が範囲の中 → <b>頂点で最小</b>", "最大は 軸から<b>遠い方のはし</b>（上に凸なら 最大・最小が反対）"],
  ex: {
    q: "y = x² − 2x − 3（0 ≦ x ≦ 3）の 最大値・最小値は？", st: { a: 1, p: 1, q: -4, s: 0, e: 3 },
    steps: [
      { t: "平方完成する", hl: "none", n: "y = x² − 2x − 3 = (x − 1)² − 4" },
      { t: "範囲 0 ≦ x ≦ 3 に色をぬる。軸は x = 1", hl: "range axis", n: "軸 x = 1、範囲 0 ≦ x ≦ 3" },
      { t: "軸 x = 1 は<b>範囲の中</b> → 頂点で最小", hl: "range min", n: "最小値 −4（x = 1）" },
      { t: "最大は 軸から遠いはし。x = 0 は軸から 1、x = 3 は軸から 2 → 遠いのは x = 3。(3 − 1)² − 4 = <b>0</b>", hl: "range max min", n: "最大値 0（x = 3）、最小値 −4（x = 1）" },
    ],
  },
  gen() {
    const a = Math.random() < 0.7 ? 1 : -1, p = rint(-2, 2), q = a > 0 ? rint(-4, 2) : rint(-2, 4), s = rint(-3, 1), e = s + rint(2, 4);
    const st = { a, p, q, s, e }; st.view = mmView(st, s, e);
    const { f, mx, mn } = mmCalc(st), wantMax = Math.random() < 0.5;
    const ans = wantMax ? mx.y : mn.y;
    const word = wantMax ? "最大値" : "最小値", inside = p >= s && p <= e, more = wantMax ? "もっと大きい" : "もっと小さい";
    const c = chooseNumW(ans, [
      [wantMax ? mn.y : mx.y, `それは ${wantMax ? "最小値" : "最大値"}。聞かれているのは ${word}`],
      [q, inside ? `頂点の y 座標 ${N(q)} は ${a > 0 ? "最小値（下に凸）" : "最大値（上に凸）"}。${word}は はし で きまる` : `頂点（x = ${N(p)}）は 範囲の外なので 使えない。範囲の中だけで 考える`],
      [f(s), `x = ${N(s)}（左はし）の y の値。${more} y が ある`],
      [f(e), `x = ${N(e)}（右はし）の y の値。${more} y が ある`],
      [f(p + 1), p + 1 > e ? `x = ${N(p + 1)} の y の値。x = ${N(p + 1)} は 範囲の外なので 使えない` : `x = ${N(p + 1)} の y の値。そこは はし でも 頂点でもない`],
      ...[1, -1, 2, -2, 3, -3].map(d => [ans + d, "計算ミス。① から もう一度 たしかめよう"]),
    ]);
    // x を入れて y を計算する式
    const sub = x => {
      const sq = (x - p) ** 2, inner = p === 0 ? N(x) : `${N(x)} ${p > 0 ? MI : "+"} ${Math.abs(p)}`;
      return `x = ${N(x)} → y = ${a < 0 ? MI : ""}(${inner})²${sg(q)} = ${q === 0 ? "" : N(a * sq) + sg(q) + " = "}${N(f(x))}`;
    };
    const tgt = wantMax ? mx : mn, both = wantMax ? mmCalc(st).bothMx : mmCalc(st).bothMn;
    const exp = [
      ["平方完成して 頂点と 軸を 出す", `y = ${P(a, -2 * a * p, a * p * p + q)} = ${vform(a, p, q).slice(4)}<br>頂点 ${pt(p, q)}、軸 x = ${N(p)}（${a > 0 ? "下に凸 ∪" : "上に凸 ∩"}）`],
      ["軸が 範囲の 中か 外かを 見る", `範囲 ${N(s)} ≦ x ≦ ${N(e)}、軸 x = ${N(p)} → 範囲の<b>${inside ? "中" : "外"}</b>`],
      ["両はしの y を 計算する", `${sub(s)}<br>${sub(e)}`],
    ];
    if (inside) exp.push(["軸が 範囲の中なので 頂点も 候補", `x = ${N(p)} → y = ${N(q)}（頂点）`]);
    exp.push([`いちばん ${wantMax ? "大きい" : "小さい"} y が ${word}`, `${word} <b>${N(ans)}</b>（x = ${both ? `${N(s)}, ${N(e)}` : N(tgt.x)}）`]);
    return {
      q: `y = ${P(a, -2 * a * p, a * p * p + q)}（${N(s)} ≦ x ≦ ${N(e)}）の <b>${word}</b> は？`, ...c,
      hint: `平方完成すると ${vform(a, p, q)}（${a > 0 ? "下に凸" : "上に凸"}）。軸 x = ${N(p)} は 範囲の${inside ? "中" : "外"}`,
      exp, point: "候補は 両はし と（範囲の中なら）頂点。その y を くらべれば まちがえない",
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
  // （帯の式が長くならないように、y = … は 帯の上の行だけ）
  draw(G, st, ctx) {
    const D = st.b * st.b - 4 * st.c;
    G.fn(x => x * x + st.b * x + st.c, { c: "accent", w: 3.5 });
    const rs = rootsOf(st.b, st.c);
    rs.forEach((r, i) => G.point(r, 0, { c: "warm", r: em(ctx, "roots", 8, 6.5), label: "x = " + nice(r), pos: rs.length === 2 ? (i ? "ne" : "nw") : "n", d: 12, pop: H(ctx, "roots") }));
    G.textPx(14, G.h - 16, `D = ${N(D)}　→　共有点 ${rs.length} 個`, { c: D > 0 ? "warm" : D === 0 ? "gold" : "blue", size: em(ctx, "D", 20, 16) });
  },
  band(st) {
    const D = st.b * st.b - 4 * st.c, n = D > 0 ? 2 : D === 0 ? 1 : 0;
    return { g: "D = b² − 4ac　D > 0 → 2 個、D = 0 → 1 個（接する）、D < 0 → 0 個", n: `y = ${P(1, st.b, st.c)}<br>D = ${pn(st.b)}² − 4·1·${pn(st.c)} = <span class="hl">${N(D)}</span>　<span class="mt">→ 共有点</span> <span class="hl">${n}&nbsp;個</span>` };
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
      const r1 = rint(-5, 4), r2 = r1 + rint(1, Math.min(5, 6 - r1)), b = -(r1 + r2), c = r1 * r2;
      const f = (u, v) => u === v ? null : `x = ${N(Math.min(u, v))}, ${N(Math.max(u, v))}`; // 「x = 2, 2」のような形は出さない
      const g = x => x * x + b * x + c, r = r1 !== 0 ? r1 : r2;
      // まちがいの解 (u, v)：入れても 0 に ならない x を 見せる
      const wr = (u, v, pre = "") => { const w = [u, v].find(x => x !== r1 && x !== r2), s = f(u, v); return s && w !== undefined ? [s, `${pre}x = ${N(w)} を 入れると ${N(g(w))} になって 0 に ならない`] : [null, ""]; };
      const ch = chooseW(f(r1, r2), [
        [f(-r2, -r1), `符号が反対。${uq(-r)} = 0 なら x = ${N(r)}（かっこの中と 符号が反対）`],
        wr(r1, -r2, "片方の符号が反対。"), wr(-r1, r2, "片方の符号が反対。"), wr(r1 + 1, r2 + 1), wr(r1 - 1, r2 - 1),
        wr(r1 - 1, r2), wr(r1, r2 + 1), wr(r1 + 1, r2 + 2), wr(r1 - 2, r2 - 1),
      ], 4, () => f(r1 + nz(-2, 2), r2 + nz(-2, 2)) || f(r1 - 3, r2 + 2));
      return { q: `${P(1, b, c)} = 0 を解くと？`, ...ch, hint: `かけて ${N(c)}、たして ${N(b)} の 2 数で因数分解`, exp: [
        [`かけて ${N(c)}、たして ${N(b)} になる 2 つの数を さがす`, `${N(-r1)} × ${pn(-r2)} = ${N(c)}、${N(-r1)} + ${pn(-r2)} = ${N(b)}`],
        ["左辺を 因数分解する", `${r1 * r2 === 0 ? "x" + sh2(-(r1 + r2)) : sh2(-r1) + sh2(-r2)} = 0`],
        ["かっこの どちらかが 0 になる x が 解（かっこの中と 符号が反対）", `${uq(-r1)} = 0 → x = ${N(r1)}<br>${uq(-r2)} = 0 → x = ${N(r2)}`],
        ["2 つの解を ならべる", `<b>${f(r1, r2)}</b>`],
      ], point: "(x − α)(x − β) = 0 なら x = α, β。かっこの中と 符号が反対になる", st: { b, c }, hl: "roots" };
    }
    const kind = rint(0, 2); let b, c;
    if (kind === 0) { b = nz(-6, 6); c = rint(-5, Math.floor((b * b - 1) / 4)); }
    else if (kind === 1) { b = 2 * nz(-3, 3); c = b * b / 4; }
    else { b = rint(-4, 4); c = Math.floor(b * b / 4) + rint(1, 4); }
    const D = b * b - 4 * c, n = D > 0 ? 2 : D === 0 ? 1 : 0;
    const dIn = [`a = 1、b = ${N(b)}、c = ${N(c)} を D = b² − 4ac に 入れる（マイナスは かっこをつける）`, `D = ${pn(b)}² − 4·1·${pn(c)}`];
    const dCalc = last => ["かけ算・2 乗を してから まとめる", `D = ${b * b}${c === 0 ? ` ${MI} 0` : sg(-4 * c)} = ${last}`];
    if (t === 1) {
      const sgn = D > 0 ? "> 0" : D === 0 ? "= 0" : "&lt; 0";
      const why = {
        "0 個": D > 0 ? `D = ${N(D)} は プラス。0 個は D &lt; 0 のとき` : `0 個は D &lt; 0 のとき。D = 0 は x 軸に 接する`,
        "1 個": `1 個は D = 0（x 軸に 接する）のとき。D = ${N(D)} ${sgn}`,
        "2 個": D === 0 ? "2 個は D > 0 のとき。D = 0 は x 軸に 接する" : `D = ${N(D)} は マイナス。2 個は D > 0 のとき`,
      };
      delete why[n + " 個"];
      const ch = { ch: ["0 個", "1 個", "2 個"], ans: n, why };
      return { q: `y = ${P(1, b, c)} のグラフと x 軸の共有点は 何個？`, ...ch, one: true, hint: "判別式 D = b² − 4ac の符号を見よう", exp: [
        dIn, dCalc(N(D)),
        ["D の 符号で 個数が きまる：D > 0 → 2 個、D = 0 → 1 個、D &lt; 0 → 0 個", `D ${sgn} → <b>${n} 個</b>`],
      ], point: "D > 0 → 2 個、D = 0 → 1 個（接する）、D &lt; 0 → 0 個", st: { b, c }, hl: "D roots" };
    }
    const ch = chooseNumW(D, [
      [b * b + 4 * c, "− 4ac の マイナスを わすれて たしている"],
      [b * b - c, "4 を かけわすれている。D = b² − 4·1·c"],
      [-b * b - 4 * c, `${pn(b)}² を マイナスにしている。2 乗は 0 以上：${pn(b)}² = ${b * b}`],
      [2 * b - 4 * c, `b² を 2b にしている。${pn(b)}² = ${pn(b)} × ${pn(b)} = ${b * b}`],
      ...[2, -2, 4, -4].map(d => [D + d, "計算ミス。① から もう一度 たしかめよう"]),
    ]);
    return { q: `${P(1, b, c)} = 0 の 判別式 D の値は？`, ...ch, hint: "D = b² − 4ac（a = 1）", exp: [dIn, dCalc(`<b>${N(D)}</b>`)], point: "D = b² − 4ac。マイナスの数は (−3)² のように かっこをつけて 2 乗", st: { b, c }, hl: "D" };
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
  hint: "記号をかえると、x 軸にぬった太い線（答えの範囲）が かわる",
  draw(G, st, ctx) {
    const f = x => (x - st.al) * (x - st.be), below = st.sg === "<" || st.sg === "≦", closed = st.sg === "≦" || st.sg === "≧";
    G.fn(f, { c: "muted", w: 2 });
    if (st.al2 != null) { // 2 つ目の不等式（連立）
      const g = x => (x - st.al2) * (x - st.be2);
      G.fn(g, { c: "blue", w: 2, dash: "6 4" });
      G.label(st.be2 + 0.6, g(st.be2 + 0.6), P(1, -(st.al2 + st.be2), st.al2 * st.be2), { pos: "e", c: "blue", size: 13 });
      [st.al2, st.be2].forEach(r => G.point(r, 0, { c: "blue", r: 5, hollow: true }));
    }
    if (st.segs) { // 答えの範囲を はっきり指定
      if (!ctx.hl || H(ctx, "ans")) st.segs.forEach(([a, b]) => G.line(a, 0, b, 0, { c: "warm", w: 7, pop: true }));
      [st.al, st.be].forEach((r, i) => G.point(r, 0, { c: "warm", r: 7, hollow: true, label: N(r), pos: i ? "ne" : "nw", d: 12 }));
      return;
    }
    const showAns = !ctx.hl || H(ctx, "ans") || H(ctx, "below");
    if (showAns) {
      if (below) G.fn(f, { c: "warm", w: 5, from: st.al, to: st.be, pop: H(ctx, "below") });
      else { G.fn(f, { c: "warm", w: 5, to: st.al }); G.fn(f, { c: "warm", w: 5, from: st.be }); }
    }
    if (!ctx.hl || H(ctx, "ans")) {
      const yy = 0, o = { c: "warm", w: 7, pop: H(ctx, "ans") };
      if (below) G.line(st.al, yy, st.be, yy, o); else { G.line(G.x0, yy, st.al, yy, o); G.line(st.be, yy, G.x1, yy, o); }
    }
    [st.al, st.be].forEach((r, i) => G.point(r, 0, { c: "warm", r: 7, hollow: !closed, label: N(r), pos: i ? "ne" : "nw", d: 12, size: em(ctx, "roots", 19, 15) }));
  },
  band(st) {
    const b = -(st.al + st.be), c = st.al * st.be;
    return { g: "(x − α)(x − β) < 0 → α < x < β（内側）、 > 0 → x < α, β < x（外側）", n: `${P(1, b, c)} ${st.sg} 0　→　<span class="hl">${ineqAns(st.al, st.be, st.sg)}</span>` };
  },
  points: ["左辺を<b>因数分解</b>して、グラフと x 軸の交点 α, β を出す", "<b>&lt; 0</b> → グラフが x 軸より<b>下</b> → 内側 α < x < β", "<b>&gt; 0</b> → x 軸より<b>上</b> → 外側 x < α, β < x"],
  ex: {
    q: "x² − x − 6 < 0 を解こう", st: { al: -2, be: 3, sg: "<" },
    steps: [
      { t: "左辺を因数分解する", hl: "none", n: "x² − x − 6 = (x + 2)(x − 3)" },
      { t: "グラフと x 軸の交点は x = −2, 3", hl: "roots", n: "交点 x = −2, 3" },
      { t: "<b>< 0</b> は、グラフが x 軸より<b>下</b>の部分", hl: "roots below", n: "(x + 2)(x − 3) < 0 → グラフが下" },
      { t: "その x の範囲が答え：<b>−2 < x < 3</b>", hl: "roots below ans", n: "−2 < x < 3" },
    ],
  },
  gen() {
    const al = rint(-5, 3), be = al + rint(1, Math.min(5, 5 - al)), s = pick(["<", ">", "≦", "≧"]), st = { al, be, sg: s };
    const other = { "<": ">", ">": "<", "≦": "≧", "≧": "≦" }[s], flip = { "<": "≦", "≦": "<", ">": "≧", "≧": ">" }[s];
    const below = s === "<" || s === "≦", eq = s === "≦" || s === "≧", r = al !== 0 ? al : be, se = s.replace("<", "&lt;"), fac = al * be === 0 ? "x" + sh2(-(al + be)) : sh2(-al) + sh2(-be);
    const c = chooseW(ineqAns(al, be, s), [
      [ineqAns(al, be, other), below ? `内側と外側が 反対。${se} 0 は グラフが x 軸より 下 → 2 つの交点の 間` : `内側と外側が 反対。${se} 0 は グラフが x 軸より 上 → 2 つの交点の 外側`],
      [ineqAns(al, be, flip), eq ? `${se} には = が あるので 交点も ふくむ（≦ を使う）` : `${se} には = が ないので 交点は ふくまない（&lt; を使う）`],
      [ineqAns(-be, -al, s), `交点の 符号が反対。${uq(-r)} = 0 なら x = ${N(r)}（かっこの中と 符号が反対）`],
      [ineqAns(al - 1, be, s), `はしの数が ちがう。はしは グラフと x 軸の 交点 x = ${N(al)}, ${N(be)}`],
      [ineqAns(al, be + 1, other), "内側と外側が 反対で、はしの数も ちがう"],
    ]);
    return { q: `${P(1, -(al + be), al * be)} ${s} 0 を解くと？`, ...c, one: true, hint: `因数分解すると ${sh2(-al)}${sh2(-be)}。${below ? "0 より小さい → グラフが下" : "0 より大きい → グラフが上"}`, exp: [
      [`左辺を 因数分解する（かけて ${N(al * be)}、たして ${N(-(al + be))} の 2 数）`, `${fac} ${se} 0`],
      ["グラフと x 軸の 交点は かっこが 0 になる x", `x = ${N(al)}, ${N(be)}`],
      [`${se} 0 は グラフが x 軸より <b>${below ? "下" : "上"}</b> → 交点の ${below ? "<b>間</b>（内側）" : "<b>外側</b>"}`, below ? `${N(al)} と ${N(be)} の 間` : `${N(al)} より 左、${N(be)} より 右`],
      [eq ? "= が あるので 交点も ふくむ → ≦" : "= が ないので 交点は ふくまない → &lt;", `<b>${ineqAns(al, be, s).replace(/</g, "&lt;")}</b>`],
    ], point: "&lt; 0 は 交点の 間、> 0 は 外側。= が あれば ≦", st, hl: "roots below ans" };
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
  view: () => ({ xmin: -1.45, xmax: 1.45, ymin: -0.35, ymax: 1.45, gridX: 0.5, gridY: 0.5, tickY: 0.5, xticks: [[-1, "−1"], [-0.5, "−½"], [0.5, "½"], [1, "1"]].map(([v, l]) => ({ v, l })) }),
  ctrls: [{ k: "t", label: "θ", min: 0, max: 180, step: 1, unit: "°" }, { k: "t", label: "", opts: [[30, "30°"], [45, "45°"], [60, "60°"], [90, "90°"], [120, "120°"], [135, "135°"], [150, "150°"]] }],
  hint: "👆 円の上の点 P をドラッグ。y 座標 が sin、x 座標 が cos",
  draw(G, st, ctx) {
    const t = st.t * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    G.circle(0, 0, 1, { c: "muted", w: 1.5, dash: "4 5" });
    G.fn(x => Math.sqrt(Math.max(0, 1 - x * x)), { c: "muted", w: 2, from: -1, to: 1 });
    if ((ctx.touch || H(ctx, "tan")) && Math.abs(c) > 0.05 && Math.abs(s / c) < 2.05) { G.vline(1, { c: "violet", w: 1, dash: "3 5", op: 0.6 }); G.line(0, 0, 1, s / c, { c: "violet", w: 1.5, dash: "5 4", op: em(ctx, "tan", 1, 0.55) }); G.point(1, s / c, { c: "violet", r: 4, label: "tan θ", pos: "e", size: 13, op: em(ctx, "tan", 1, 0.7) }); }
    G.angle(0, 0, 0, st.t, { rp: 30 });
    G.label(0.22 * Math.cos(t / 2), 0.22 * Math.sin(t / 2), "θ", { pos: "e", d: 4, c: "gold", size: 15 });
    // 三角定規（先にぬって、sin・cos の色をかくさない）
    if (H(ctx, "tri")) {
      G.poly([[0, 0], [c, 0], [c, s]], { fill: "gold-soft", c: "none", pop: true });
      if (st.t > 90 && st.t < 180) { G.angle(0, 0, st.t, 180, { rp: 46, fill: "warm-soft", c: "warm" }); G.label(-0.42 * Math.cos(((180 - st.t) / 2) * Math.PI / 180), 0.42 * Math.sin(((180 - st.t) / 2) * Math.PI / 180), (180 - st.t) + "°", { pos: "w", d: 2, c: "warm", size: 14 }); }
      G.label(c / 2, s / 2, "1", { pos: c >= 0 ? "nw" : "ne", c: "ink", size: 14 });
    }
    if (st.t2 != null) { // 同じ y 座標の もう 1 つの点
      const t2 = st.t2 * Math.PI / 180, c2 = Math.cos(t2);
      G.line(-1.2, s, 1.2, s, { c: "warm", w: 1.5, dash: "5 5" });
      G.line(0, 0, c2, s, { c: "ink", w: 2, dash: "4 4" });
      G.point(c2, s, { c: "warm", r: 7, label: `P′（${st.t2}°）`, pos: c2 >= 0 ? "ne" : "nw", top: true });
    }
    G.line(0, 0, c, s, { c: "ink", w: 2.5 });
    G.line(c, 0, c, s, { c: "warm", w: em(ctx, "sin", 7, 5), pop: H(ctx, "sin") });
    G.line(0, 0, c, 0, { c: "blue", w: em(ctx, "cos", 7, 5), pop: H(ctx, "cos") });
    G.label(c, s / 2, "sin", { pos: c >= 0 ? "e" : "w", c: "warm", size: 14 });
    G.label(c / 2, 0, "cos", { pos: "n", d: 6, c: "blue", size: 14 });
    const lab = `P(${N(c, 2)}, ${N(s, 2)})`;
    if (ctx.touch) G.handle("P", c, s, (x, y) => { let a = Math.atan2(Math.max(y, 0), x) * 180 / Math.PI; if (a < 0) a = x > 0 ? 0 : 180; st.t = clamp(Math.round(a), 0, 180); for (const k of [0, 30, 45, 60, 90, 120, 135, 150, 180]) if (Math.abs(st.t - k) <= 2) st.t = k; ctx.redraw(); }, { label: lab, pos: c >= 0 ? "ne" : "nw" });
    else G.point(c, s, { c: "warm", r: 7, label: st.t2 != null ? `P（${st.t}°）` : "P", pos: c >= 0 ? "ne" : "nw", pop: H(ctx, "P") });
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
      { t: "x 軸の左側と 60° の 三角定規（ななめの辺 1）ができる", hl: "P tri", n: "辺の比  1 : 2 : √3" },
      { t: "P の <b>y 座標</b>（赤）が sin", hl: "sin tri", n: `sin 120° = ${fr("√3", "2")}` },
      { t: `P の <span class="bl">x 座標</span>（青）が cos。左側なのでマイナス`, hl: "cos tri", n: `sin 120° = ${fr("√3", "2")}、cos 120° = −${fr("1", "2")}` },
    ],
  },
  gen() {
    if (Math.random() < 0.25) { // θ を求める
      const v = pick([["1/2", "30°, 150°"], ["1/√2", "45°, 135°"], ["√3/2", "60°, 120°"]]);
      const all = ["30°, 150°", "45°, 135°", "60°, 120°", "30°", "60°", "150°"];
      const t0 = parseInt(v[1]);
      const wa = x => { // まちがいの θ の 理由
        const d = parseInt(x), two = x.includes(","), mine = d === t0 || d === 180 - t0;
        if (mine) return `${x} だけでは たりない。${180 - d}° も sin が ${tv(v[0])}（左右対称）で、答えは 2 つ`;
        return `sin ${d}° = ${tv(TRIG[d][0])}。${tv(v[0])} ではない${two ? "" : "（それに 答えは 2 つ ある）"}`;
      };
      const c = chooseW(v[1], shuffle(all.filter(a => a !== v[1])).map(x => [x, wa(x)]));
      return { q: `sin θ = ${tv(v[0])}（0° ≦ θ ≦ 180°）のとき θ は？`, ...c, hint: "y 座標が同じになる点は、円の上に 2 つある（左右対称）", exp: [
        ["sin θ は 半径 1 の円の 点 P の <b>y 座標</b>", `y 座標 = ${tv(v[0])}`],
        [`三角定規から sin ${t0}° = ${tv(v[0])}`, `θ = ${t0}°`],
        [`y 座標が 同じ点は 左右対称に もう 1 つ ある`, `180° ${MI} ${t0}° = ${180 - t0}°`],
        ["2 つとも 答え", `<b>θ = ${v[1]}</b>`],
      ], point: "sin θ = 正の数 の θ は 2 つ：θ と 180° − θ", st: { t: t0, t2: 180 - t0 }, hl: "sin" };
    }
    const fi = rint(0, 2), name = ["sin", "cos", "tan"][fi];
    let ang = pick([0, 30, 45, 60, 90, 120, 135, 150, 180]);
    if (fi === 2 && ang === 90) ang = 120;
    const val = TRIG[ang][fi];
    const pool = fi === 2 ? ["0", "1/√3", "1", "√3", "−1/√3", "−1", "−√3"] : ["0", "1/2", "1/√2", "√3/2", "1", "−1/2", "−1/√2", "−√3/2", "−1"];
    const neg = val.startsWith("−") ? val.slice(1) : val === "0" ? "1" : "−" + val;
    const how = fi === 0 ? "y 座標" : fi === 1 ? "x 座標" : "y ÷ x（直線 OP の傾き）";
    const [sv, cv] = TRIG[ang], P0 = `(${tv(cv)}, ${tv(sv)})`, abs = x => x.replace(/^−/, "");
    const zeroAt = fi === 1 ? "90°" : "0° と 180°";
    const signWhy = fi === 0 ? "0° 〜 180° では P は 円の 上半分。y 座標（sin）は マイナスに ならない"
      : fi === 1 ? (ang > 90 ? `${ang}° は 90° より大きい → P は 左側 → cos（x 座標）は マイナス` : `${ang}° は 90° より小さい → P は 右側 → cos（x 座標）は プラス`)
      : (ang > 90 ? "90° より大きいと x が マイナス、y が プラス → tan = y ÷ x は マイナス" : "90° より小さいと x も y も プラス → tan も プラス");
    const wv = w => { // まちがいの値 w の 理由
      if (val === "0") return `${ang}° の点 P は ${P0}。${fi === 2 ? `tan = y ÷ x = 0 ÷ ${pn(Number(cv.replace("−", "-")))} = 0` : `${how}は 0`}`;
      if (w === "0") return `${name} が 0 に なるのは ${zeroAt} のとき`;
      if (abs(w) === abs(val)) return `符号が反対。${signWhy}`;
      if (fi < 2 && TRIG[ang][1 - fi] === w) return `それは ${["sin", "cos"][1 - fi]} ${ang}° の値。${name} は ${how}`;
      const a2 = [30, 45, 60, 120, 135, 150, 0, 90, 180].find(A => A !== ang && TRIG[A][fi] === w);
      if (a2 != null) return `それは ${name} ${a2}° の値。${ang}° の点 P を かいて たしかめよう`;
      return `${ang}° の点 P を かいて ${how}を たしかめよう`;
    };
    const c = chooseW(tv(val), [neg, ...shuffle(pool)].map(w => [tv(w), wv(w)]));
    const exp = [[`半径 1 の円に ${ang}° の点 P を とる`, `P = (cos ${ang}°, sin ${ang}°)`]];
    if (ang % 90 === 0) exp.push([`P は ${ang === 90 ? "真上" : ang === 0 ? "右はし" : "左はし"} に ある`, `P = ${P0}`]);
    else {
      const k = ang < 90 ? ang : 180 - ang, ratio = k === 45 ? "1 : 1 : √2" : "1 : 2 : √3";
      exp.push([`${ang < 90 ? "" : "x 軸の 左側と "}${k}° の 三角定規（${ratio}、ななめの辺 1）を 使う`, `たて ${tv(sv)}、よこ ${tv(abs(cv))}`]);
      if (ang > 90) exp.push(["P は 左側なので x 座標は マイナス", `P = ${P0}`]);
      else exp.push(["P は 右上なので どちらも プラス", `P = ${P0}`]);
    }
    exp.push(fi === 2 ? ["tan は y ÷ x", `tan ${ang}° = ${tv(sv)} ÷ ${cv.startsWith("−") ? `(${tv(cv)})` : tv(cv)} = <b>${tv(val)}</b>`] : [`${name} は P の ${how}`, `${name} ${ang}° = <b>${tv(val)}</b>`]);
    const point = ["sin は y 座標。0° 〜 180° では マイナスに ならない", "cos は x 座標。90° より大きいと マイナス", "tan = y ÷ x。90° より大きいと マイナス"][fi];
    return { q: `${name} ${ang}° の値は？`, ...c, hint: `半径 1 の円で ${ang}° の点 P をかこう。${name} は ${how}`, exp, point, st: { t: ang }, hl: ["sin", "cos", "tan"][fi] + " tri" };
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
/* 問題のとき：√19 のように きれいに書けるなら √ で */
function nvx(v, exact) {
  if (!exact) return nv(v);
  const v2 = v * v, n = Math.round(v2);
  if (Math.abs(v - Math.round(v)) < 0.01) return String(Math.round(v));
  if (Math.abs(v2 - n) < 0.01 && n < 400) { for (let k = 20; k >= 2; k--) if (n % (k * k) === 0) return `${k}√${n / (k * k)}`; return `√${n}`; }
  return N(v, 1);
}
/* 三角形（と外接円）が ちょうど入る表示 */
function triView(st) {
  const ps = [st.A, st.B, st.C]; let xs = ps.map(p => p[0]), ys = ps.map(p => p[1]);
  if (st.mode === "sin") { const [ux, uy, R] = circum(st.A, st.B, st.C); xs = xs.concat([ux - R, ux + R]); ys = ys.concat([uy - R, uy + R]); }
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), m = Math.max(x1 - x0, y1 - y0) * 0.12 + 0.8;
  return { xmin: x0 - m, xmax: x1 + m, ymin: y0 - m, ymax: y1 + m, noAxes: true };
}
function triFrom(b, c, Adeg, k) { // A を原点、AB を x 軸に
  const t = Adeg * Math.PI / 180, s = 8 / Math.max(b, c, 1);
  return { A: [0, 0], B: [c * s, 0], C: [b * s * Math.cos(t), b * s * Math.sin(t)], k: 1 / s, exact: true };
}
UNITS.push({
  id: "tri", sub: "I", name: "正弦定理・余弦定理", small: "三角形の辺と角",
  init: () => ({ mode: "cos", A: [0, 0], B: [8, 0], C: [2.5, 4.33], k: 1 }),
  view: (st, ctx) => ctx && ctx.touch ? (st.mode === "sin" ? { xmin: -3, xmax: 11, ymin: -6, ymax: 9, noAxes: true } : { xmin: -2, xmax: 10, ymin: -1.5, ymax: 8, noAxes: true }) : triView(st),
  ctrls: [{ k: "mode", label: "", opts: [["cos", "余弦定理"], ["sin", "正弦定理"]] }, { btn: "形をもどす", act: st => Object.assign(st, { A: [0, 0], B: [8, 0], C: [2.5, 4.33] }) }],
  hint: "👆 頂点 A・B・C をドラッグして 形をかえられる",
  draw(G, st, ctx) {
    const { A, B, C, k } = st, a = dist(B, C) * k, b = dist(C, A) * k, c = dist(A, B) * k;
    const aA = angAt(A, B, C), ex = !ctx.touch, nm = st.names || ["A", "B", "C"];
    const g = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    if (st.mode === "sin") {
      const [ux, uy, R] = circum(A, B, C);
      if (R < 40) { G.circle(ux, uy, R, { c: "violet", w: 2, dash: "6 5" }); G.point(ux, uy, { c: "violet", r: 4 }); G.line(ux, uy, B[0], B[1], { c: "violet", w: 2 }); G.label((ux + B[0]) / 2, (uy + B[1]) / 2, "R = " + nvx(R * k, ex), { pos: "e", c: "violet", size: 15 }); }
    }
    G.poly([A, B, C], { fill: "accent-soft", c: "ink", w: 2 });
    // 辺の名前は 三角形の外側（重心と反対向き）に
    const side = (p, q, txt, key, color) => {
      const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      G.line(p[0], p[1], q[0], q[1], { c: H(ctx, key) ? color : "ink", w: H(ctx, key) ? 6 : 2, pop: H(ctx, key) });
      let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      if (nx * (m[0] - g[0]) + ny * (m[1] - g[1]) < 0) { nx = -nx; ny = -ny; }
      const off = 22 / G.sx, px = m[0] + nx * off, py = m[1] + ny * off;
      G.label(px, py, txt, { pos: "c", c: color, size: em(ctx, key, 19, 15), top: true });
    };
    side(B, C, nm[0].toLowerCase() === "a" ? "a = " + nvx(a, ex) : nm[1] + nm[2] + " = " + nvx(a, ex), "a", "warm");
    side(C, A, nm[1].toLowerCase() === "b" ? "b = " + nvx(b, ex) : nm[2] + nm[0] + " = " + nvx(b, ex), "b", "blue");
    side(A, B, nm[2].toLowerCase() === "c" ? "c = " + nvx(c, ex) : nm[0] + nm[1] + " = " + nvx(c, ex), "c", "blue");
    const a1 = Math.atan2(B[1] - A[1], B[0] - A[0]) * 180 / Math.PI, a2 = Math.atan2(C[1] - A[1], C[0] - A[0]) * 180 / Math.PI;
    let s1 = a1, s2 = a2; if (((s2 - s1) % 360 + 360) % 360 > 180) [s1, s2] = [s2, s1]; if (s2 < s1) s2 += 360;
    G.angle(A[0], A[1], s1, s2, { rp: 26, fill: H(ctx, "A") ? "warm-soft" : "gold-soft", c: H(ctx, "A") ? "warm" : "gold" });
    G.label(A[0], A[1], nv(aA) + "°", { pos: "ne", d: 28, c: "gold", size: 14 });
    const mv = key => (x, y) => { st[key] = [snap(x, 0.1), snap(y, 0.1)]; ctx.redraw(); };
    [[nm[0], A, "sw"], [nm[1], B, "se"], [nm[2], C, "n"]].forEach(([n, p, pos]) => {
      if (ctx.touch) G.handle(n, p[0], p[1], mv(n), { label: n, pos, c: "ink", lc: "ink" });
      else G.point(p[0], p[1], { r: 4, label: n, pos, size: 17 });
    });
  },
  band(st) {
    const { A, B, C, k } = st, a = dist(B, C) * k, b = dist(C, A) * k, c = dist(A, B) * k, aA = angAt(A, B, C);
    const ex = !!st.exact; // 問題のときは √ で
    if (st.mode === "sin") { const R = circum(A, B, C)[2] * k; return { g: "a / sin A = b / sin B = c / sin C = 2R（R：外接円の半径）", n: `${nvx(a, ex)} ÷ sin ${nv(aA)}° = <span class="hl">${nvx(2 * R, ex)}</span> = 2R　<span class="mt">→</span> R = ${nvx(R, ex)}` }; }
    return { g: "a² = b² + c² − 2bc cos A", n: `a² = ${nv(b)}² + ${nv(c)}² − 2·${nv(b)}·${nv(c)}·cos ${nv(aA)}° = <span class="hl">${N(a * a, 1)}</span>　<span class="mt">→</span> a = ${nvx(a, ex)}` };
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
      const cosv = A === 60 ? fr(1, 2) : `(${MI}${fr(1, 2)})`;
      const ans = String(a), a2 = b * b + c * c - (A === 60 ? 1 : -1) * b * c;
      const cands = typeof a === "number" ? [
        [String(a * a), `それは a² の値。最後に √ を とって a を 出す`],
        [String(b + c), "b と c を たしただけ。余弦定理を 使おう（三角形では a は b + c より 小さい）"],
        [String(a + 1), "計算ミス。a² の 計算を もう一度 たしかめよう"],
        [String(a - 1), "計算ミス。a² の 計算を もう一度 たしかめよう"],
      ] : [
        ["3", "それは a² の値。最後に √ を とって a = √3"],
        ["1", `cos 120° を ${fr(1, 2)}（プラス）に している。120° は 90° より大きいので マイナス`],
        ["√2", "cos 120° を 0 に している（cos 90° = 0）。cos 120° = −½"],
      ];
      const c2 = chooseW(ans, cands);
      return { q: `△ABC で b = ${b}、c = ${c}、A = ${A}° のとき、a は？`, ...c2, hint: "2 辺とその間の角 → 余弦定理 a² = b² + c² − 2bc cos A", exp: [
        ["2 辺 b, c と その間の角 A が わかっている → <b>余弦定理</b>", "a² = b² + c² − 2bc cos A"],
        [`数を 入れる（cos ${A}° = ${A === 60 ? fr(1, 2) : MI + fr(1, 2)}）`, `a² = ${b}² + ${c}² − 2·${b}·${c}·${cosv}`],
        [A === 60 ? "計算する" : "計算する（− × − で プラスに なる）", `a² = ${b * b} + ${c * c} ${A === 60 ? MI : "+"} ${b * c} = ${a2}`],
        ["a は 長さで プラスなので √ を とる", `a = ${typeof a === "number" ? `√${a2} = ` : ""}<b>${ans}</b>`],
      ], point: "2 辺とその間の角 → 余弦定理。cos 120° = −½ の マイナスに 注意", st: { mode: "cos", ...triFrom(b, c, A) }, hl: "a" };
    }
    if (r < 0.7) {
      const [b, c, a, A] = pick([[5, 8, 7, 60], [3, 5, 7, 120], [3, 8, 7, 60], [8, 15, 13, 60], [7, 8, 13, 120]]);
      const cv = (b * b + c * c - a * a) / (2 * b * c), num = b * b + c * c - a * a;
      const cosOf = { 30: "√3/2", 45: "1/√2", 60: "1/2", 90: "0", 120: "−1/2", 135: "−1/√2", 150: "−√3/2" };
      const wa = x => { const d = parseInt(x); return d === 180 - A ? `cos ${x} = ${tv(cosOf[d])}。cos A が ${cv > 0 ? "プラスなので 90° より 小さい" : "マイナスなので 90° より 大きい"}` : `cos ${x} = ${tv(cosOf[d])}。cos A = ${F(cv)} と ちがう`; };
      const c2 = chooseW(A + "°", ["30°", "45°", "60°", "90°", "120°", "135°", "150°"].map(x => [x, wa(x)]));
      return { q: `△ABC で a = ${a}、b = ${b}、c = ${c} のとき、角 A は？`, ...c2, hint: "余弦定理を cos A について：cos A = (b² + c² − a²) ÷ 2bc", exp: [
        ["3 辺が わかっている → 余弦定理を cos A について 使う", "cos A = (b² + c² − a²) ÷ 2bc"],
        ["数を 入れる", `cos A = (${b}² + ${c}² − ${a}²) ÷ (2·${b}·${c})`],
        ["計算する", `= (${b * b} + ${c * c} − ${a * a}) ÷ ${2 * b * c}<br>= ${N(num)} ÷ ${2 * b * c} = ${F(cv)}`],
        [`cos が ${F(cv)} に なる角を さがす${cv < 0 ? "（マイナスなので 90° より大きい）" : ""}`, `A = <b>${A}°</b>`],
      ], point: "cos A が プラス → 90° より小さい、マイナス → 90° より大きい", st: { mode: "cos", ...triFrom(b, c, A) }, hl: "A" };
    }
    const [A, aStr, R, sinS] = pick([[30, "6", 6, fr(1, 2)], [30, "10", 10, fr(1, 2)], [45, "4√2", 4, fr(1, "√2")], [60, "5√3", 5, fr("√3", 2)], [60, "3√3", 3, fr("√3", 2)], [90, "8", 4, "1"], [150, "4", 4, fr(1, 2)]]);
    const gen = "計算ミス。正弦定理 a ÷ sin A = 2R を もう一度";
    const c2 = chooseW(String(R), [[String(R * 2), `それは 2R（直径）。R は その 半分`], [String(R + 1), gen], [String(Math.max(1, R - 1)), gen], [String(R * 3), gen]]);
    const B = A >= 90 ? 20 : 50, Cc = 180 - A - B, b = 2 * R * Math.sin(B * Math.PI / 180), cc = 2 * R * Math.sin(Cc * Math.PI / 180);
    const mul = A === 90 ? `${aStr} ÷ 1` : A === 45 ? `${aStr} × √2` : A === 60 ? `${aStr} × ${fr(2, "√3")}` : `${aStr} × 2`;
    return { q: `△ABC で a = ${aStr}、A = ${A}° のとき、外接円の半径 R は？`, ...c2, hint: "辺と向かいの角のペア → 正弦定理 a / sin A = 2R", exp: [
      ["辺 a と 向かいの角 A の ペア → <b>正弦定理</b>", "a ÷ sin A = 2R"],
      [`数を 入れる（sin ${A}° = ${sinS}）`, `${aStr} ÷ ${sinS} = 2R`],
      [A === 90 ? "1 で わっても かわらない" : "分数で わる ＝ ひっくり返して かける", `2R = ${mul} = ${R * 2}`],
      ["R は 2R の 半分", `R = ${R * 2} ÷ 2 = <b>${R}</b>`],
    ], point: "辺と 向かいの角 → 正弦定理 a ÷ sin A = 2R。最後に 2 で わる", st: { mode: "sin", ...triFrom(b, cc, A) }, hl: "a A" };
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
  view: () => ({ xmin: -0.5, xmax: 12.5, ymin: -3.6, ymax: 4.2, equal: false, noY: true, xticks: Array.from({ length: 13 }, (_, i) => ({ v: i, l: String(i) })), xname: "" }),
  ctrls: [{ btn: "🎲 ちがうデータ", act: st => { st.v = Array.from({ length: 5 }, () => rint(0, 12)); } }, { btn: "もどす", act: st => { st.v = [2, 4, 6, 8, 10]; } }],
  hint: "👆 ● を左右にドラッグ。平均（赤い線）と ちらばり が動く",
  draw(G, st, ctx) {
    const S = stats(st.v), m = S.m;
    // 1 人 1 段（小さい順）。偏差の線が重ならない
    const order = st.v.map((x, i) => i).sort((i, j) => st.v[i] - st.v[j] || i - j), ys = [];
    order.forEach((i, r) => { ys[i] = 0.5 + r * 0.6; });
    if (!ctx.hl || H(ctx, "dev")) st.v.forEach((x, i) => { if (Math.abs(x - m) > 0.01) G.line(m, ys[i], x, ys[i], { c: "blue", w: em(ctx, "dev", 4, 2), op: em(ctx, "dev", 1, 0.55), pop: H(ctx, "dev") }); if (H(ctx, "dev")) G.label(x, ys[i], N(x - m), { pos: x >= m ? "e" : "w", d: 14, c: "blue", size: 13 }); });
    if (!ctx.hl || H(ctx, "mean")) { G.line(m, 0, m, 3.6, { c: "warm", w: 3, pop: H(ctx, "mean") }); G.label(m, 3.6, "平均 " + N(m, 2), { pos: "e", c: "warm", size: 15 }); }
    if (st.v2) { // くらべる もう 1 つの組（下の段）
      const seen = {};
      G.textPx(G.X(-0.4), G.Y(-1), st.n2 || "A 組", { size: 14, c: "muted" });
      G.textPx(G.X(-0.4), G.Y(2.9), st.n1 || "B 組", { size: 14, c: "muted" });
      st.v2.forEach(x => { seen[x] = (seen[x] || 0) + 1; G.point(x, -0.9 - (seen[x] - 1) * 0.45, { r: 7, c: "violet" }); });
    }
    // 箱ひげ図
    const by = -2.2, bh = 0.5;
    if ((!ctx.hl || H(ctx, "box")) && !st.v2) {
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
    const sum = v.reduce((a, b) => a + b, 0), meanStep = last => ["全部 たして、個数 5 で わる", `(${v.join(" + ")}) ÷ 5<br>= ${sum} ÷ 5 = ${last}`];
    if (t === 0) {
      const c = chooseNumW(m, [
        [m + 1, "たし算の ミスかも。合計を もう一度 たしてから 5 で わろう"],
        [m - 1, "たし算の ミスかも。合計を もう一度 たしてから 5 で わろう"],
        S.med === m ? [m + 2, "計算ミス。合計 ÷ 個数 を もう一度"] : [S.med, "それは 中央値（まん中の値）。平均は 合計 ÷ 個数"],
        [m + 2, "計算ミス。合計 ÷ 個数 を もう一度"], [m - 2, "計算ミス。合計 ÷ 個数 を もう一度"],
      ]);
      return { q: `データ ${list} の 平均値 は？`, ...c, hint: "全部たして、個数 5 でわる", exp: [
        ["全部 たす", `${v.join(" + ")} = ${sum}`],
        ["個数 5 で わる", `${sum} ÷ 5 = <b>${m}</b>`],
      ], point: "平均 = 合計 ÷ 個数", st: { v }, hl: "mean" };
    }
    if (t === 1) {
      const c = chooseNumW(S.med, [
        m === S.med ? [S.med + 1, "小さい順に ならべて、3 番目を もう一度 たしかめよう"] : [m, "それは 平均値。中央値は 小さい順に ならべた まん中"],
        [v[2], "ならべかえる前の 3 番目。まず 小さい順に ならべる"],
        ...[-1, 2, -2, 1, 3].map(d => [S.med + d, "小さい順に ならべて、3 番目を もう一度 たしかめよう"]).filter(([x]) => x >= 0),
      ]);
      const ss = S.s;
      return { q: `データ ${list} の 中央値 は？`, ...c, hint: "小さい順にならべて、まん中（3 番目）", exp: [
        ["まず 小さい順に ならべる", ss.join(", ")],
        ["5 個なので まん中は 3 番目", `${ss[0]}, ${ss[1]}, <b>${ss[2]}</b>, ${ss[3]}, ${ss[4]}<br>中央値 <b>${S.med}</b>`],
      ], point: "中央値は 小さい順に ならべてから まん中を 見る", st: { v }, hl: "box" };
    }
    const c = chooseNumW(vr, [
      [vr * 5, "偏差の 2 乗を たしたところで 止まっている。最後に 個数 5 で わる"],
      [Math.round(Math.sqrt(vr) * 10) / 10, "√ を とっている。それは 標準偏差（の だいたいの値）。分散は √ を とらない"],
      ...[2, 1, -1].map(d => [vr + d, "2 乗の 計算ミスかも。偏差を 1 つずつ 2 乗して たしかめよう"]),
    ]);
    const dv = v.map(x => x - m);
    return { q: `データ ${list} の 分散 は？`, ...c, hint: `平均は ${m}。偏差（値 − 平均）を 2 乗して 平均する`, exp: [
      ["平均を 出す", meanStep(m)[1]],
      ["偏差 ＝ 値 − 平均 を 1 つずつ", v.map(x => `${x} ${MI} ${m} = ${N(x - m)}`).join("、")],
      ["偏差を 2 乗する（マイナスも プラスに なる）", dv.map(d => `${pn(d)}² = ${d * d}`).join("、")],
      ["2 乗を 全部 たして、個数 5 で わる", `(${dv.map(d => d * d).join(" + ")}) ÷ 5<br>= ${vr * 5} ÷ 5 = <b>${vr}</b>`],
    ], point: "分散 = 偏差の 2 乗の 平均。標準偏差は その √", st: { v }, hl: "mean dev" };
  },
});
/* 理由（why）は 画面に出る まちがいの選択肢 だけに しぼる */
UNITS.forEach(u => { const g = u.gen; u.gen = function () { const p = g.call(this); if (p.why) for (const k in p.why) if (!p.ch.includes(k) || k === p.ch[p.ans]) delete p.why[k]; return p; }; });
