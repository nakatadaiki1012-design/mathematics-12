"use strict";
/* ===== 数学II の単元 ===== */
/* 理由つき 4 択（util の chooseW / chooseNumW）。選ばれなかった候補の 理由は のぞく */
function whyTrim(c) { for (const k in c.why) if (!c.ch.includes(k)) delete c.why[k]; return c; }
const chooseWhy = (...a) => whyTrim(chooseW(...a)), chooseNumWhy = (...a) => whyTrim(chooseNumW(...a));

/* ---------- 1. 円の方程式 ---------- */
const circStr = (a, b, r2) => `${sh("x", a)}² + ${sh("y", b)}² = ${N(r2)}`;
UNITS.push({
  id: "circle", sub: "II", name: "円の方程式", small: "(x − a)² + (y − b)² = r²",
  init: () => ({ a: 2, b: -1, r: 3 }),
  // さわる以外：円と原点が ちょうど入る表示
  view: (st, ctx) => ctx && ctx.touch ? { xmin: -8, xmax: 8, ymin: -7, ymax: 7 } : { xmin: Math.min(st.a - st.r, 0) - 1.5, xmax: Math.max(st.a + st.r, 0) + 1.5, ymin: Math.min(st.b - st.r, 0) - 1.5, ymax: Math.max(st.b + st.r, 0) + 1.5 },
  ctrls: [{ k: "a", label: "a", min: -4, max: 4, step: 0.5 }, { k: "b", label: "b", min: -4, max: 4, step: 0.5 }, { k: "r", label: "r", min: 0.5, max: 5, step: 0.5 }],
  hint: "👆 中心 と 円の上の点 をドラッグできる",
  draw(G, st, ctx) {
    const { a, b, r } = st;
    G.line(a, b, a, 0, { c: "muted", dash: "4 5", w: 1.5 }); G.line(a, b, 0, b, { c: "muted", dash: "4 5", w: 1.5 });
    G.circle(a, b, r, { c: "accent", w: 3.5 });
    const [rx, ry] = st.rto || [a + r, b]; // 半径の線（問題によっては 原点まで）
    G.line(a, b, rx, ry, { c: "warm", w: em(ctx, "r", 5, 3), pop: H(ctx, "r") });
    G.label((a + rx) / 2, (b + ry) / 2, RV(ctx, "r") ? "r = " + nvx(r, !ctx.touch) : "r", { pos: "n", c: "warm", size: em(ctx, "r", 19, 15) });
    if (st.dia) G.line(st.dia[0][0], st.dia[0][1], st.dia[1][0], st.dia[1][1], { c: "blue", w: 2.5, dash: "7 5" });
    (st.pts || []).forEach(([x, y, l, pos]) => G.point(x, y, { c: "blue", r: 6, label: l, pos: pos || "ne", size: 15, top: true }));
    const lab = RV(ctx, "center") ? `中心 ${pt(a, b)}` : "中心";
    if (ctx.touch) {
      G.handle("c", a, b, (x, y) => { st.a = clamp(snap(x, 0.5), -4, 4); st.b = clamp(snap(y, 0.5), -4, 4); ctx.redraw(); }, { label: lab, pos: "sw" });
      G.handle("r", a + r, b, x => { st.r = clamp(snap(x - st.a, 0.5), 0.5, 5); ctx.redraw(); }, { c: "accent" });
    } else G.point(a, b, { c: "warm", r: em(ctx, "center", 8, 6), label: lab, pos: "sw", size: em(ctx, "center", 19, 15), pop: H(ctx, "center") });
  },
  band: st => ({ g: "(x − a)² + (y − b)² = r²　→　中心 (a, b)、半径 r", n: `${circStr(st.a, st.b, Math.round(st.r * st.r * 100) / 100)}　<span class="mt">中心</span> <span class="hl">${pt(st.a, st.b)}</span>　<span class="mt">半径</span> <span class="hl">${nvx(st.r, true)}</span>` }),
  points: ["円 = 中心から <b>同じ距離 r</b> にある点の集まり", "(x − a)² + (y − b)² = r² の 中心は <b>(a, b)</b>、半径は <b>r</b>（右辺は r²）", "x² + y² + … の形は、x と y それぞれ<b>平方完成</b>する"],
  ex: {
    q: "x² + y² − 4x + 6y − 3 = 0 の 中心 と 半径 は？", st: { a: 2, b: -3, r: 4 },
    steps: [
      { t: "x と y でまとめて、数を右へ", n: "(x² − 4x) + (y² + 6y) = 3" },
      { t: "それぞれ平方完成（よけいな 4 と 9 をひく）", n: "(x − 2)² − 4 + (y + 3)² − 9 = 3" },
      { t: "数を右にまとめる", n: "(x − 2)² + (y + 3)² = 16" },
      { t: "中心 <b>(2, −3)</b>、半径は √16 = <b>4</b>", hl: "center r", n: "中心 (2, −3)、半径 4" },
    ],
  },
  gen() {
    const a = nz(-4, 4), b = nz(-4, 4), r = rint(1, 5), st = { a, b, r };
    const t = rint(0, 2);
    // かっこの中の数を 読む手順（x と y で 共通）
    const rd = (v, p) => [`${v} のかっこ ${sh(v, p)} → ${v === "x" ? "a" : "b"} = <b>${N(p)}</b>${p < 0 ? `（${v} + ${-p} は ${v} − (${N(p)}) のこと）` : ""}`, `${v === "x" ? "a" : "b"} = ${N(p)}`];
    if (t === 0) {
      const c = chooseWhy(pt(a, b), [
        [pt(-a, -b), "x も y も 符号が反対。かっこの中の数は 符号を反対にして読む"],
        [pt(-a, b), `x 座標の 符号が反対。${sh("x", a)} なら a = ${N(a)}`],
        [pt(a, -b), `y 座標の 符号が反対。${sh("y", b)} なら b = ${N(b)}`],
        [pt(b, a), "x と y が 入れかわっている。x のかっこ → x 座標、y のかっこ → y 座標"],
      ]);
      return { q: `円 ${circStr(a, b, r * r)} の 中心 は？`, ...c, hint: "(x − a)² + (y − b)² = r² の中心は (a, b)。符号に注意", exp: [
        ["式を (x − <b>a</b>)² + (y − <b>b</b>)² = r² の形と ならべる", circStr(a, b, r * r)],
        rd("x", a), rd("y", b),
        ["中心は (a, b)", `中心 <b>${pt(a, b)}</b>`],
      ], point: "かっこの中の数は 符号を反対にして読む → 中心 (a, b)", st, hl: "center" };
    }
    if (t === 1) {
      const no = v => `${v}² = ${v * v} で ${r * r} に ならない。2 乗して ${r * r} になる数が 半径`;
      const c = chooseNumWhy(r, [[r * r, `右辺の ${r * r} は r²（半径の 2 乗）。半径は √${r * r} = ${r}`], [r + 1, no(r + 1)], [2 * r, no(2 * r)], [r + 2, no(r + 2)], [r + 3, no(r + 3)]]);
      return { q: `円 ${circStr(a, b, r * r)} の 半径 は？`, ...c, hint: "右辺は r²（半径の 2 乗）", exp: [
        ["右辺の数は r²（半径の 2 乗）", `r² = ${r * r}`],
        [`2 乗して ${r * r} になる 正の数を さがす`, `${r} × ${r} = ${r * r}`],
        ["だから 半径は", `r = √${r * r} = <b>${r}</b>`],
      ], point: "右辺は r²。半径は √（右辺）", st, hl: "r" };
    }
    const D = -2 * a, E = -2 * b, Fc = a * a + b * b - r * r;
    const eq = poly([1, 1, D, E, Fc], ["x²", "y²", "x", "y", ""]) + " = 0";
    const ctr = `${N(-Fc)} + ${a * a} + ${b * b} = ${r * r}`;
    const c = chooseWhy(`中心 ${pt(a, b)}、半径 ${r}`, [
      [`中心 ${pt(-a, -b)}、半径 ${r}`, `中心の 符号が反対。x の係数 ${N(D)} の半分は ${N(-a)} → ${sh("x", a)}² なので 中心の x は ${N(a)}`],
      [`中心 ${pt(a, b)}、半径 ${r * r}`, `右辺の ${r * r} は r²。半径は √${r * r} = ${r}`],
      [`中心 ${pt(-a, -b)}、半径 ${r * r}`, `中心の 符号が反対で、半径も r² のまま。中心 ${pt(a, b)}、半径 √${r * r} = ${r}`],
      [`中心 ${pt(a, b)}、半径 ${r + 1}`, `右辺の計算ミス。${ctr} → 半径 √${r * r} = ${r}`],
      [`中心 ${pt(-a, -b)}、半径 ${r + 1}`, `中心の 符号が反対で、半径も ちがう。右辺は ${ctr}`],
    ]);
    return { q: `円 ${eq} の 中心 と 半径 は？`, ...c, one: true, hint: `x と y それぞれ平方完成。x の係数 ${N(D)} の半分は ${N(D / 2)} → ${sh("x", a)}²`, exp: [
      ["x の項、y の項で まとめて、数を 右へ うつす", `(${P(1, D, 0)}) + (${poly([1, E, 0], ["y²", "y", ""])}) = ${N(-Fc)}`],
      [`x の係数 ${N(D)} の半分は ${N(-a)}、y の係数 ${N(E)} の半分は ${N(-b)}。それぞれ 平方完成して、よけいな ${a * a} と ${b * b} を ひく`, `${sh("x", a)}² ${MI} ${a * a} + ${sh("y", b)}² ${MI} ${b * b} = ${N(-Fc)}`],
      [`ひいた ${a * a} と ${b * b} を 右へ うつす（たす）`, `${sh("x", a)}² + ${sh("y", b)}² = ${ctr}`],
      [`中心は かっこの中の数の 符号を反対に。半径は √${r * r}`, `<b>中心 ${pt(a, b)}、半径 ${r}</b>`],
    ], point: "x と y それぞれ 平方完成 → (x − a)² + (y − b)² = r² の形にする", st, hl: "center r" };
  },
});

/* ---------- 2. 三角関数のグラフ ---------- */
const PI = Math.PI;
/* k·π/6 を文字に */
function piS(num, den) {
  if (num === 0) return "0";
  const g = gcd(num, den); num /= g; den /= g;
  const s = num < 0 ? MI : "", n = Math.abs(num);
  const top = (n === 1 ? "" : n) + "π";
  return s + (den === 1 ? top : top + "/" + den);
}
const piH = (num, den) => { const s = piS(num, den); if (!s.includes("/")) return s; const neg = s.startsWith(MI), [t, d] = (neg ? s.slice(1) : s).split("/"); return (neg ? MI : "") + fr(t, d); };
const periodOf = B => B === 0.5 ? [4, 1] : B === 1 ? [2, 1] : B === 2 ? [1, 1] : [2, 3]; // 2π/B を [num, den]（π の）
const trigStr = (f, A, B, C) => `y = ${A === 1 ? "" : N(A) + " "}${f}${B === 1 && C ? "" : " "}${B === 1 ? "" : B === 0.5 ? fr(1, 2) : B}${C ? `(x ${C > 0 ? MI : "+"} ${piH(Math.abs(C), 6)})` : "x"}`;
UNITS.push({
  id: "trigfn", sub: "II", name: "三角関数のグラフ", small: "振幅と周期",
  init: () => ({ f: "sin", A: 2, B: 2, C: 0 }),
  view: () => ({ xmin: -0.6, xmax: 4 * PI + 0.3, ymin: -3.6, ymax: 3.6, equal: false, xticks: Array.from({ length: 8 }, (_, i) => ({ v: (i + 1) * PI / 2, l: piS(i + 1, 2) })), xname: "x", gridX: PI / 2, gridY: 1, tickY: 1 }),
  ctrls: [{ k: "f", label: "", opts: [["sin", "sin"], ["cos", "cos"]] }, { k: "A", label: "振幅 A", min: 0.5, max: 3, step: 0.5 }, { k: "B", label: "B", opts: [[0.5, "½"], [1, "1"], [2, "2"], [3, "3"]] }, { k: "C", label: "ずらす", min: -6, max: 6, step: 1, fmt: v => piS(v, 6) }],
  hint: "A で たての のび、B で 波の細かさ（周期）が かわる",
  draw(G, st, ctx) {
    const base = st.f === "sin" ? Math.sin : Math.cos, c = st.C * PI / 6;
    const f = x => st.A * base(st.B * (x - c));
    const rA = st.ref === "A" ? st.A : 1; // くらべる もとのグラフ（ふつうは y = sin x）
    if (ctx.hl !== "none") G.fn(x => rA * base(x), { c: "muted", w: em(ctx, "base", 3, 1.5), dash: "6 5", op: em(ctx, "base", 1, 0.6) });
    G.fn(f, { c: "accent", w: 3.5 });
    const T = 2 * PI / st.B, XMAX = 4 * PI;
    if (H(ctx, "shift") && c) { // 平行移動の矢印
      const x1 = st.f === "sin" ? PI / 2 : 2 * PI;
      G.arrow(x1, rA + 0.35, x1 + c, rA + 0.35, { c: "warm", w: 3, pop: true });
      G.label(x1 + c / 2, rA + 0.35, "右へ " + piS(st.C, 6), { pos: "n", c: "warm", size: 16 });
    }
    if (st.markX) { G.line(st.markX[0], -3.3, st.markX[0], 3.3, { c: "warm", w: 2, dash: "6 4" }); G.point(st.markX[0], 0, { c: "warm", r: 7, label: st.markX[1], pos: "ne", d: 12, size: 17, top: true }); }
    // 振幅（山の位置を 画面の中に）
    let xp = c + (st.f === "sin" ? PI / 2 : 0) / st.B;
    xp = ((xp % T) + T) % T; if (xp < 0.4) xp += T; if (xp > XMAX - 0.6 && xp - T >= 0.4) xp -= T;
    if (!ctx.hl || H(ctx, "amp")) { G.arrow(xp, 0, xp, st.A, { c: "warm", w: em(ctx, "amp", 4, 2.5), both: true, pop: H(ctx, "amp") }); G.label(xp, st.A / 2, "振幅 " + N(st.A), { pos: xp > XMAX - 2 ? "w" : "e", c: "warm", size: em(ctx, "amp", 18, 14) }); }
    // 周期
    let x0 = ((c % T) + T) % T; if (x0 + T > XMAX + 0.3 && x0 - T >= -0.6) x0 -= T;
    const yb = -st.A - 0.45;
    if (!ctx.hl || H(ctx, "per")) {
      G.arrow(x0, yb, x0 + T, yb, { c: "blue", w: em(ctx, "per", 4, 2.5), both: true, pop: H(ctx, "per") });
      const [pn2, pd] = periodOf(st.B);
      G.label(x0 + T / 2, yb, "周期 " + piS(pn2, pd), { pos: "s", c: "blue", size: em(ctx, "per", 18, 14) });
    }
  },
  band(st) {
    const [pn2, pd] = periodOf(st.B);
    return { g: "y = A sin B(x − C)　振幅 A、周期 2π ÷ B", n: `${trigStr(st.f, st.A, st.B, st.C)}　<span class="mt">振幅</span> <span class="hl">${N(st.A)}</span>　<span class="mt">周期</span> <span class="bl">${piH(pn2, pd)}</span>` };
  },
  points: ["1 周 = 360° = <b>2π</b>（ラジアン）。180° = π", "<b>A</b> で たてに のびる（振幅 A）", "<b>B</b> で 横に ちぢむ：周期は <b>2π ÷ B</b>"],
  ex: {
    q: "y = 2 sin 2x の 振幅 と 周期 は？", st: { f: "sin", A: 1, B: 1, C: 0 },
    steps: [
      { t: "もとの y = sin x は 振幅 1、周期 2π", hl: "base amp per", n: "y = sin x：振幅 1、周期 2π" },
      { t: "前の 2 → たてに 2 倍。<b>振幅 2</b>", st: { A: 2 }, hl: "base amp", n: "y = 2 sin x：振幅 2" },
      { t: "x の前の 2 → 横に 半分。<b>周期 2π ÷ 2 = π</b>", st: { A: 2, B: 2 }, hl: "base per", n: "y = 2 sin 2x：周期 π" },
      { t: "まとめ：振幅 2、周期 π", st: { A: 2, B: 2 }, n: "振幅 2、周期 π" },
    ],
  },
  gen() {
    const f = pick(["sin", "cos"]), A = pick([1, 2, 3]), B = pick([0.5, 2, 3, 1]), st = { f, A, B, C: 0 };
    const t = rint(0, 2);
    const Bs = B === 0.5 ? fr(1, 2) : String(B); // x の前の数
    const Bstep = [`x の前の数を 見る${B === 1 ? `（${f} x のように 数がないときは 1）` : ""}`, `x の前の数 = ${Bs}`];
    if (t === 0) {
      const [pn2, pd] = periodOf(B), ans = piH(pn2, pd);
      const times = piH(Math.round(4 * B), 2), half = piH(2, Math.round(2 * B)); // 2π × B、π ÷ B
      const why = s => s === times ? `2π ÷ ${Bs} ではなく 2π × ${Bs} にしている。周期は わり算` : s === half ? `π ÷ ${Bs} にしている。もとの周期は π ではなく 2π` : s === "2π" ? `x の前の数 ${Bs} を 使っていない。周期 = 2π ÷ ${Bs}` : A !== 1 && s === piH(2, A) ? `${f} の前の ${A} で わっている。わるのは x の前の数 ${Bs}` : `2π ÷ ${Bs} を もう一度 計算しよう`;
      const c = chooseWhy(ans, shuffle(["4π", "2π", "π", "6π", fr("π", 2), fr("2π", 3), fr("π", 3)]).map(s => [s, why(s)]));
      const calc = B === 0.5 ? `2π ÷ ${fr(1, 2)} = 2π × 2 = <b>${ans}</b>` : `2π ÷ ${B} = <b>${ans}</b>`;
      return { q: `${trigStr(f, A, B, 0)} の 周期 は？`, ...c, hint: "周期 = 2π ÷（x の前の数）", exp: [
        [`もとの y = ${f} x の 周期は 2π。x の前の数で わると 周期が 出る`, "周期 = 2π ÷（x の前の数）"],
        Bstep,
        ...(A !== 1 ? [[`${f} の前の ${A} は たての大きさ（振幅）。周期には 関係ない`, ""]] : []),
        [`2π を ${Bs} で わる`, calc],
      ], point: "周期 = 2π ÷（x の前の数）", st, hl: "per" };
    }
    if (t === 1) {
      const w = v => v === 1 ? `${f} の 最大 1 のまま。前の ${A} を かけるのを わすれている` : v === B ? `${B} は x の前の数（周期に関係する）。振幅は ${f} の前の数` : v === 2 * A ? `山の上から 谷の下までの 長さ（${2 * A}）になっている。振幅は 0 から 山の上まで` : v === -A ? `${N(-A)} は いちばん低いところ（最小値）。振幅は 山の高さなので 正の数` : A === 1 ? `${f} の前に 数がないので 振幅は 1` : `${f} の前の数 ${A} を そのまま 読めばよい`;
      const c = chooseNumWhy(A, [B !== A && B >= 1 ? B : A + 3, 2 * A, A + 1, -A, A + 2, A + 3].map(v => [v, w(v)]));
      return { q: `${trigStr(f, A, B, 0)} の 振幅（最大値）は？`, ...c, hint: `${f} の前の数 が 振幅`, exp: [
        [`${f} の値は いつも −1 から 1 の間`, `${MI}1 ≦ ${f} ≦ 1`],
        [A === 1 ? `${f} の前に 数がない（1 倍）ので、y も −1 から 1 の間` : `前の ${A} を かけると、y は ${N(-A)} から ${A} の間`, `${N(-A)} ≦ y ≦ ${A}`],
        ...(B !== 1 ? [[`x の前の ${Bs} は 横の のびちぢみ（周期）。高さには 関係ない`, ""]] : []),
        ["いちばん高いところ（山の高さ）が 振幅", `振幅 <b>${A}</b>`],
      ], point: "振幅 = sin・cos の前の数（x の前の数は 周期）", st, hl: "amp" };
    }
    const deg = pick([30, 45, 60, 90, 120, 135, 150, 180, 270, 360]);
    const g = gcd(deg, 180), ans = piH(deg / g, 180 / g);
    const c = chooseWhy(ans, shuffle([[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [5, 6], [1, 1], [3, 2], [2, 1]]).map(p => [piH(p[0], p[1]), `${piH(p[0], p[1])} は ${180 * p[0] / p[1]}°（π = 180° を 入れると わかる）。${deg}° ÷ 180 × π で 計算しよう`]));
    return { q: `${deg}° を ラジアン で表すと？`, ...c, hint: "180° = π。180 で わって π をかける", exp: [
      ["180° = π を 使う", "180° = π"],
      [`${deg}° は 180° の 何倍？ 180 で わる`, `${deg} ÷ 180 = ${F(deg / 180)}`],
      ["その数に π を かける", `${deg}° = ${F(deg / 180)} × π = <b>${ans}</b>`],
    ], point: "度 → ラジアン：180 で わって π を かける（180° = π）", st: { f: "sin", A: 1, B: 1, C: 0, markX: [deg * PI / 180, `${deg}° = ${piS(deg / g, 180 / g)}`] }, hl: "base" };
  },
});

/* ---------- 3. 指数関数 ---------- */
const sup = s => `<sup>${s}</sup>`;
/* SVG 用の かた付き数字：2³、2⁻³ */
const SUPC = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "−": "⁻" };
const powS = (a, m) => { const bs = a === 0.5 ? "(½)" : N(a, 2), ms = N(m, 2); return /^[−0-9]+$/.test(ms) ? bs + ms.split("").map(ch => SUPC[ch]).join("") : `${bs}^${ms}`; };
/* 小さい数も 0 にならないように */
const numS = v => (v !== 0 && Math.abs(v) < 0.01) ? (v < 0 ? MI : "") + String(+Math.abs(v).toPrecision(3)) : N(v, 2);
UNITS.push({
  id: "exp", sub: "II", name: "指数関数", small: "y = aˣ",
  init: () => ({ a: 2, mark: null }),
  view: st => ({ xmin: -4.5, xmax: Math.max(4.5, st.mark != null ? st.mark + 1.5 : 0), ymin: -1, ymax: Math.max(8.5, st.mark != null ? st.a ** st.mark * 1.12 + 1 : 0), equal: false }),
  ctrls: [{ k: "a", label: "底 a", min: 0.2, max: 4, step: 0.1, fmt: v => N(v, 1) }, { k: "a", label: "", opts: [[0.5, "½"], [2, "2"], [3, "3"]] }],
  hint: "👆 グラフの上の点を ドラッグすると、aˣ の値が出る",
  draw(G, st, ctx) {
    const a = st.a, f = x => a ** x;
    if (ctx.touch && Math.abs(a - 1) > 1e-9) { G.fn(x => (1 / a) ** x, { c: "muted", w: 1.5, dash: "5 5", op: 0.5 }); G.label(-2.5, (1 / a) ** -2.5, `y = (1/${N(a, 1)})ˣ`, { pos: "w", c: "muted", size: 12 }); }
    G.fn(f, { c: "accent", w: 3.5 });
    G.point(0, 1, { c: "blue", r: 6, label: "(0, 1)", pos: "nw", size: em(ctx, "one", 18, 13), pop: H(ctx, "one") });
    if (Math.abs(a - 1) > 1e-9 && st.mark !== 1 && ctx.hl !== "none") G.point(1, a, { c: "ink", r: 4.5, label: `(1, ${N(a, 2)})`, pos: a > 1 ? "nw" : "ne", size: 13 });
    const m = st.mark ?? st.mx ?? 2;
    if (st.mark != null || ctx.touch) {
      G.line(m, 0, m, f(m), { c: "warm", dash: "5 5", w: 1.5 }); G.line(0, f(m), m, f(m), { c: "warm", dash: "5 5", w: 1.5 });
      const lab = `${powS(a, m)} = ${Ft(f(m))}`, pos = m > 2.5 ? "nw" : "e";
      if (ctx.touch) G.handle("m", m, f(m), x => { st.mx = clamp(snap(x, 0.5), -4, 4); ctx.redraw(); }, { label: lab, pos });
      else G.point(m, f(m), { c: "warm", r: 7, label: lab, pos, pop: H(ctx, "mark") });
    }
  },
  band(st) {
    const a = st.a;
    return { g: "y = aˣ　(0, 1) を通る。a > 1 → 右上がり、0 < a < 1 → 右下がり", n: Math.abs(a - 1) < 1e-9 ? `y = 1ˣ = 1 <span class="mt">（a = 1 だと 横の直線）</span>` : `y = ${N(a, 2)}<sup>x</sup>　<span class="mt">x が 1 ふえると</span> <span class="hl">${N(a, 2)} 倍</span> <span class="mt">→ ${a > 1 ? "右上がり（ふえる）" : "右下がり（へる）"}</span>` };
  },
  points: ["どんな a でも <b>(0, 1)</b> を通る（a⁰ = 1）", "a > 1 → <b>右上がり</b>、0 < a < 1 → <b>右下がり</b>", "a<sup>−n</sup> = 1 / aⁿ、a<sup>m/n</sup> = (ⁿ√a)<sup>m</sup>。値は いつも正"],
  ex: {
    q: `8${sup("2/3")} の値は？`, st: { a: 2, mark: null },
    steps: [
      { t: "8 を 2 の何乗かで表す（グラフの x = 3 のところが 8）", st: { mark: 3 }, hl: "mark", n: "8 = 2³" },
      { t: "指数どうしは かけ算", st: { mark: 3 }, hl: "mark", n: `8${sup("2/3")} = (2³)${sup("2/3")} = 2${sup("3 × 2/3")}` },
      { t: "3 × 2/3 = 2 なので 2²", st: { mark: 2 }, hl: "mark", n: `8${sup("2/3")} = 2² = 4` },
      { t: "グラフ y = 2ˣ の x = 2 のところ。<b>答え 4</b>", st: { mark: 2 }, hl: "mark", n: `8${sup("2/3")} = 4` },
    ],
  },
  gen() {
    const t = rint(0, 1);
    if (t === 0) {
      const [base, ex, ans, a, m, how] = pick([
        [8, "2/3", 4, 2, 2, "(2³)<sup>2/3</sup> = 2²"], [27, "2/3", 9, 3, 2, "(3³)<sup>2/3</sup> = 3²"], [4, "3/2", 8, 2, 3, "(2²)<sup>3/2</sup> = 2³"], [16, "3/4", 8, 2, 3, "(2⁴)<sup>3/4</sup> = 2³"],
        [9, "1/2", 3, 3, 1, "(3²)<sup>1/2</sup> = 3¹"], [32, "2/5", 4, 2, 2, "(2⁵)<sup>2/5</sup> = 2²"], [16, "1/4", 2, 2, 1, "(2⁴)<sup>1/4</sup> = 2¹"], [27, "1/3", 3, 3, 1, "(3³)<sup>1/3</sup> = 3¹"],
      ]);
      const [en, ed] = ex.split("/").map(Number), k = Math.round(Math.log(base) / Math.log(a)); // base = a^k
      const mul = Array(m).fill(a).join(" × "), chk = m === 1 ? `${a}¹ = ${ans}` : `${a}${sup(m)} = ${mul} = ${ans}`;
      const c = chooseNumWhy(ans, [
        [ans * 2, a === 2 ? `2 を かける回数が 1 回 多い。${chk}` : `2 倍しなくてよい。${chk}`],
        [ans + 1, `計算ミス。${chk}`],
        [Number.isInteger(base * en / ed) ? base * en / ed : null, `${base} × ${ex} のような ふつうの かけ算を している。指数は「何回 かけるか」を表す`],
        [ans - 1, `計算ミス。${chk}`],
      ].filter(v => v[0] > 0));
      return { q: `${base}${sup(ex)} の値は？`, ...c, hint: `${base} を ${a} の何乗かで表してみよう`, exp: [
        [`${base} を ${a} の 何乗かで 表す`, `${base} = ${Array(k).fill(a).join(" × ")} = ${a}${sup(k)}`],
        ["( ) の累乗は 指数どうしを かける", `${base}${sup(ex)} = (${a}${sup(k)})${sup(ex)} = ${a}${sup(`${k} × ${ex}`)} = ${a}${sup(m)}`],
        [m === 1 ? `${a}¹ は ${a} そのもの` : `${a} を ${m} 回 かける`, m === 1 ? `${a}¹ = <b>${ans}</b>` : `${a}${sup(m)} = ${mul} = <b>${ans}</b>`],
      ], point: "a<sup>m/n</sup> は まず 底を そろえる（8 = 2³ など）→ 指数どうしを かける", st: { a, mark: m }, hl: "mark" };
    }
    const [q, ans, cands, a, m, steps, point] = pick([
      [`2${sup(MI + "3")}`, fr(1, 8), [[MI + "8", "マイナスの指数は マイナスの数 ではない。2⁻³ = 1 ÷ 2³"], [MI + "6", "2 × (−3) と かけ算している。指数は「何回 かけるか」"], [fr(1, 6), "2³ を 2 × 3 = 6 にしている。2³ = 2 × 2 × 2 = 8"]], 2, -3,
        [["マイナスの指数は「1 ÷」に なおす", `a${sup(MI + "n")} = 1 ÷ a${sup("n")}`], ["2⁻³ を なおす", `2${sup(MI + "3")} = 1 ÷ 2³`], ["2³ を 計算する", "2³ = 2 × 2 × 2 = 8"], ["わり算を 分数にする", `1 ÷ 8 = <b>${fr(1, 8)}</b>`]], `a${sup(MI + "n")} = 1 ÷ a${sup("n")}（マイナスの指数は 分数になる）`],
      [`3${sup(MI + "2")}`, fr(1, 9), [[MI + "9", "マイナスの指数は マイナスの数 ではない。3⁻² = 1 ÷ 3²"], [MI + "6", "3 × (−2) と かけ算している。指数は「何回 かけるか」"], [fr(1, 6), "3² を 3 × 2 = 6 にしている。3² = 3 × 3 = 9"]], 3, -2,
        [["マイナスの指数は「1 ÷」に なおす", `a${sup(MI + "n")} = 1 ÷ a${sup("n")}`], ["3⁻² を なおす", `3${sup(MI + "2")} = 1 ÷ 3²`], ["3² を 計算する", "3² = 3 × 3 = 9"], ["わり算を 分数にする", `1 ÷ 9 = <b>${fr(1, 9)}</b>`]], `a${sup(MI + "n")} = 1 ÷ a${sup("n")}（マイナスの指数は 分数になる）`],
      [`2³ × 2⁴`, `2${sup(7)}`, [[`2${sup(12)}`, "指数を かけている。かけ算のときは 指数を たす"], [`4${sup(7)}`, "底の 2 どうしを たしている。底は 2 のまま"], [`4${sup(12)}`, "底も 指数も ちがう。底は 2 のまま、指数は たす"]], 2, null,
        [["同じ底の かけ算は 指数を たす", `a${sup("m")} × a${sup("n")} = a${sup("m + n")}`], ["わけ：2 を 3 回 かけて、さらに 4 回 かける", "(2 × 2 × 2) × (2 × 2 × 2 × 2) → 2 を 7 回"], ["指数 3 と 4 を たす", `2³ × 2⁴ = 2${sup("3 + 4")} = <b>2${sup(7)}</b>`]], "同じ底の かけ算 → 指数を たす"],
      [`(2³)²`, `2${sup(6)}`, [[`2${sup(5)}`, "指数を たしている。( ) の累乗は 指数を かける"], [`2${sup(9)}`, "3² = 9 と 累乗にしている。指数は 3 × 2"], [`2${sup(8)}`, "2³ = 8 を 指数に 使っている。指数は 3 × 2 = 6"]], 2, null,
        [["( ) の累乗は 指数を かける", `(a${sup("m")})${sup("n")} = a${sup("m × n")}`], ["わけ：(2³)² は 2³ を 2 回 かけること", "2³ × 2³ → 2 を 3 + 3 = 6 回"], ["指数 3 と 2 を かける", `(2³)² = 2${sup("3 × 2")} = <b>2${sup(6)}</b>`]], "( ) の累乗 → 指数を かける"],
      [`3⁵ ÷ 3²`, `3${sup(3)}`, [[`3${sup(7)}`, "指数を たしている。わり算のときは 指数を ひく"], [`3${sup("5/2")}`, "指数を わっている。わり算のときは 指数を ひく"], [`1${sup(3)}`, "底の 3 どうしを わっている。底は 3 のまま"]], 3, null,
        [["同じ底の わり算は 指数を ひく", `a${sup("m")} ÷ a${sup("n")} = a${sup("m − n")}`], ["わけ：3 を 5 回 かけたものを、3 を 2 回 かけたもので わる", "約分すると 3 が 5 − 2 = 3 回 のこる"], ["指数 5 から 2 を ひく", `3⁵ ÷ 3² = 3${sup("5 − 2")} = <b>3${sup(3)}</b>`]], "同じ底の わり算 → 指数を ひく"],
      [`5⁰`, "1", [["0", "0 乗は 0 ではない。どんな数も 0 乗は 1"], ["5", "それは 5¹。0 乗は 1"], [MI + "5", "マイナスには ならない。どんな数も 0 乗は 1"]], 5, 0,
        [["0 乗は きまりで 1（0 以外の数）", "a⁰ = 1"], ["わけ：指数が 1 へるごとに ÷ 5 になる", "5² = 25 → 5¹ = 5 → 5⁰ = 5 ÷ 5 = 1"], ["だから", "5⁰ = <b>1</b>"]], "どんな数も 0 乗は 1"],
    ]);
    const c = chooseWhy(ans, cands);
    return { q: `${q} を計算すると？`, ...c, hint: "指数法則：aᵐ × aⁿ = aᵐ⁺ⁿ、(aᵐ)ⁿ = aᵐⁿ、a⁻ⁿ = 1 / aⁿ", exp: steps, point, st: { a, mark: m }, hl: m == null ? "" : "mark" };
  },
});

/* ---------- 4. 対数関数 ---------- */
const logS = (a, x) => `log<sub>${a}</sub> ${x}`;
UNITS.push({
  id: "log", sub: "II", name: "対数関数", small: "y = logₐ x",
  init: () => ({ a: 2, mx: 8, mir: 0 }),
  view: () => ({ xmin: -2.5, xmax: 9.5, ymin: -4.5, ymax: 5.5 }),
  ctrls: [{ k: "a", label: "底 a", min: 1.2, max: 4, step: 0.1, fmt: v => N(v, 1) }, { k: "a", label: "", opts: [[2, "2"], [3, "3"]] }, { k: "mir", label: "", opts: [[0, "対数だけ"], [1, "y = aˣ も見る"]] }],
  hint: "👆 点 P をドラッグ。logₐ x は「a を何乗すると x になるか」",
  draw(G, st, ctx) {
    const a = st.a, f = x => Math.log(x) / Math.log(a);
    if (st.mir) { const xl = Math.log(4) / Math.log(a); G.fn(x => x, { c: "muted", w: 1.5, dash: "6 5" }); G.fn(x => a ** x, { c: "blue", w: 2, op: 0.7 }); G.label(xl, 4, `y = ${N(a, 1)}ˣ`, { pos: "w", c: "blue", size: 13 }); }
    G.fn(f, { c: "accent", w: 3.5, from: Math.max(1e-6, G.x0 > 0 ? G.x0 : 1e-6) });
    G.point(1, 0, { c: "blue", r: 6, label: "(1, 0)", pos: "se", size: em(ctx, "one", 18, 13), pop: H(ctx, "one") });
    G.point(a, 1, { c: "ink", r: 4.5, label: `(${N(a, 1)}, 1)`, pos: "nw", size: 13 });
    if (st.mx == null) return; // 例題の はじめは 答えを出さない
    const m = st.mx, y = f(m);
    G.line(m, 0, m, y, { c: "warm", dash: "5 5", w: 1.5 }); G.line(0, y, m, y, { c: "warm", dash: "5 5", w: 1.5 });
    const lab = `log${sub2(a)} ${st.mxs || numS(m)} = ${N(y, 2)}`;
    const lp = y >= 0.8 ? "se" : "ne";
    if (ctx.touch) G.handle("m", m, y, x => { st.mx = clamp(snap(x, 0.25), 0.25, 9); ctx.redraw(); }, { label: lab, pos: lp });
    else G.point(m, y, { c: "warm", r: 7, label: lab, pos: lp, d: 14, pop: H(ctx, "mark") });
  },
  band(st) {
    if (st.mx == null) return { g: "y = logₐ x　⇔　x = aʸ（a を y 乗すると x）", n: "" };
    const a = st.a, y = Math.log(st.mx) / Math.log(a);
    return { g: "y = logₐ x　⇔　x = aʸ（a を y 乗すると x）", n: `${logS(N(a, 1), numS(st.mx))} = <span class="hl">${N(y, 2)}</span>　<span class="mt">（${N(a, 1)}<sup>${N(y, 2)}</sup> = ${numS(st.mx)}）</span>` };
  },
  points: ["logₐ M は「<b>a を何乗すると M</b> になるか」", "どんな a でも <b>(1, 0)</b> を通る（a⁰ = 1）", "logₐ MN = logₐ M + logₐ N、logₐ (M ÷ N) = logₐ M − logₐ N"],
  ex: {
    q: `${logS(2, 8)} の値は？`, st: { a: 2, mx: null },
    steps: [
      { t: "「2 を何乗すると 8 になる？」と考える", n: `${logS(2, 8)} = □ → 2<sup>□</sup> = 8` },
      { t: "2 × 2 × 2 = 8 なので 2³ = 8", n: "2³ = 8" },
      { t: "グラフの x = 8 のところを見ると、y = 3", st: { mx: 8 }, hl: "mark", n: `${logS(2, 8)} = 3` },
    ],
  },
  gen() {
    if (Math.random() < 0.65) {
      const [a, xs, xv, ans] = pick([[2, "8", 8, 3], [2, "16", 16, 4], [2, "4", 4, 2], [2, fr(1, 2), 0.5, -1], [2, fr(1, 4), 0.25, -2], [3, "9", 9, 2], [3, "27", 27, 3], [3, fr(1, 9), 1 / 9, -2], [10, "1000", 1000, 3], [10, "100", 100, 2], [5, "1", 1, 0], [5, "25", 25, 2]]);
      const pw = e => e >= 0 ? String(a ** e) : fr(1, a ** -e); // a の e 乗
      const no = e => `${a}${sup(N(e))} = ${pw(e)} で ${xs} に ならない`;
      const c = chooseNumWhy(ans, [
        [-ans, `符号が反対。${xs} は 1 より ${ans > 0 ? "大きいので 答えは プラス" : "小さいので 答えは マイナス"}`],
        [ans + 1, no(ans + 1)], [ans === 0 ? 1 : ans * 2, no(ans === 0 ? 1 : ans * 2)], [ans - 1, no(ans - 1)], [ans + 2, no(ans + 2)],
      ]);
      const how = ans > 0 ? [`${a} を ${ans} 回 かけると ${xs}`, `${a}${sup(ans)} = ${Array(ans).fill(a).join(" × ")} = ${xs}`]
        : ans === 0 ? ["どんな数も 0 乗は 1", `${a}⁰ = 1`]
        : ["1 より小さい数は マイナス乗（a⁻ⁿ = 1 ÷ aⁿ）", `${a}${sup(N(ans))} = 1 ÷ ${a}${sup(-ans)} = ${xs}`];
      return { q: `${logS(a, xs)} の値は？`, ...c, hint: `${a} を何乗すると ${xs} になる？`, exp: [
        [`「${a} を 何乗すると ${xs} になるか」と 考える`, `${logS(a, xs)} = □ → ${a}<sup>□</sup> = ${xs}`],
        how,
        ["□ に 入る数が 答え", `${logS(a, xs)} = <b>${N(ans)}</b>`],
      ], point: "logₐ M は「a を 何乗すると M になるか」の 答え", st: { a, mx: xv, mxs: xv < 1 ? `1/${Math.round(1 / xv)}` : null, view: logView(xv, ans) }, hl: "mark" };
    }
    const ADD = "たし算 → 中身を かける", SUBT = "ひき算 → 中身を わる";
    // [問題, 答え, 中身を 1 つにした式, 底, 中身, ヒント]
    const [q, ans, mid, a, mx, hint] = pick([
      [`${logS(6, 2)} + ${logS(6, 18)}`, 2, logS(6, "(2 × 18)"), 6, 36, ADD],
      [`${logS(2, 12)} − ${logS(2, 3)}`, 2, logS(2, "(12 ÷ 3)"), 2, 4, SUBT],
      [`${logS(3, 6)} + ${logS(3, "1.5")}`, 2, logS(3, "(6 × 1.5)"), 3, 9, ADD],
      [`${logS(10, 4)} + ${logS(10, 25)}`, 2, logS(10, "(4 × 25)"), 10, 100, ADD],
      [`${logS(2, 24)} − ${logS(2, 3)}`, 3, logS(2, "(24 ÷ 3)"), 2, 8, SUBT],
      [`3 ${logS(2, 2)}`, 3, null, 2, 8, `${logS("a", "a")} = 1。k ${logS("a", "M")} = ${logS("a", "M<sup>k</sup>")}`],
    ]);
    const mul = Array(ans).fill(a).join(" × ");
    if (!mid) { // 3 log₂ 2
      const c = chooseNumWhy(ans, [[ans + 1, `${logS(2, 2)} = 1 なので 3 × 1 = 3`], [ans - 1, `${logS(2, 2)} = 1 なので 3 × 1 = 3`], [ans * 2, `${logS(2, 2)} を 2 としている。2¹ = 2 なので ${logS(2, 2)} = 1`], [0, `${logS(2, 2)} は 0 ではなく 1（2¹ = 2）。0 になるのは ${logS(2, 1)}`]]);
      return { q: `${q} を計算すると？`, ...c, hint, exp: [
        [`${logS(2, 2)} は「2 を 何乗すると 2？」`, `2¹ = 2 なので ${logS(2, 2)} = 1`],
        ["前の 3 を かける", `3 ${logS(2, 2)} = 3 × 1 = <b>3</b>`],
      ], point: `${logS("a", "a")} = 1、${logS("a", 1)} = 0`, st: { a, mx, view: logView(mx, ans) }, hl: "mark" };
    }
    const no = e => `中身は ${mx}。${a}${sup(e)} = ${a ** e} で ${mx} に ならない`;
    const c = chooseNumWhy(ans, [ans + 1, ans - 1, ans * 2, 0].map(e => [e, no(e)]));
    const isAdd = hint === ADD;
    return { q: `${q} を計算すると？`, ...c, hint, exp: [
      isAdd ? ["底が同じ log の たし算は、中身を かけて 1 つにできる", `${logS("a", "M")} + ${logS("a", "N")} = ${logS("a", "MN")}`]
        : ["底が同じ log の ひき算は、中身を わって 1 つにできる", `${logS("a", "M")} − ${logS("a", "N")} = ${logS("a", "(M ÷ N)")}`],
      [`中身を ${isAdd ? "かけ算" : "わり算"} する`, `${q} = ${mid} = ${logS(a, mx)}`],
      [`「${a} を 何乗すると ${mx} になる？」`, `${a}${sup(ans)} = ${mul} = ${mx} → <b>${ans}</b>`],
    ], point: isAdd ? "log の たし算 → 中身を かける" : "log の ひき算 → 中身を わる", st: { a, mx, view: logView(mx, ans) }, hl: "mark" };
  },
});
/* 対数の問題：答えの点が入る表示 */
function logView(xv, ans) {
  if (xv <= 9) return { xmin: -1, xmax: Math.max(9.5, xv + 1), ymin: Math.min(-3, ans - 1.5), ymax: Math.max(4, ans + 1.5), equal: false };
  return { xmin: -0.08 * xv, xmax: xv * 1.15, ymin: -3, ymax: ans + 1.5, equal: false };
}
function sub2(a) { const m = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", ".": ".", "−": "₋" }; return N(a, 1).split("").map(c => m[c] ?? c).join(""); }

/* ---------- 5. 微分と接線 ---------- */
const pv = (c, x) => c.reduce((s, k) => s * x + k, 0); // 係数（高い次数から）で値
const dv = c => { const n = c.length - 1; return c.slice(0, -1).map((k, i) => k * (n - i)); };
const FNS = { x2: [1, 0, 0], cub: [1, 0, -3, 0], q2: [-1, 4, 0] };
/* 傾きの三角形（横 1、たて m）。m = 0 なら「水平」 */
function slopeTri(G, t, y, m, ctx, label) {
  if (Math.abs(m) < 1e-9) { G.label(t, y, "傾き 0（水平）", { pos: "ne", d: 30, c: "blue", size: em(ctx, "slope", 18, 14) }); return; }
  G.line(t, y, t + 1, y, { c: "blue", w: 2.5, pop: H(ctx, "slope") }); G.line(t + 1, y, t + 1, y + m, { c: "blue", w: 2.5, pop: H(ctx, "slope") });
  G.label(t + 0.5, y, "1", { pos: m > 0 ? "s" : "n", c: "blue", size: 13 });
  const ly = clamp(y + m / 2, G.y0 + 0.5, G.y1 - 0.5);
  G.label(t + 1, ly, label || "傾き " + N(m, 2), { pos: "e", c: "blue", size: em(ctx, "slope", 18, 14) });
}
UNITS.push({
  id: "deriv", sub: "II", name: "微分と接線", small: "f′(a) は 接線の傾き",
  init: () => ({ fn: "x2", c: FNS.x2, t: 1, df: 0 }),
  view: () => ({ xmin: -4, xmax: 5, ymin: -4, ymax: 7 }),
  ctrls: [{ k: "fn", label: "", opts: [["x2", "x²"], ["cub", "x³ − 3x"], ["q2", "−x² + 4x"]], set: (st, v) => { st.c = FNS[v]; st.t = 1; } }, { k: "df", label: "", opts: [[0, "グラフだけ"], [1, "f′(x) も見る"]] }],
  hint: "👆 点をドラッグ。接線の傾き（f′）が 0 になるのは 山 と 谷",
  draw(G, st, ctx) {
    const c = st.c, d = dv(c), t = st.t, y = pv(c, t), m = pv(d, t);
    if (st.df) {
      G.fn(x => pv(d, x), { c: "violet", w: 2, dash: "6 4" });
      let xl = G.x1 - 0.3; while (xl > G.x0 && !(pv(d, xl) > G.y0 + 0.3 && pv(d, xl) < G.y1 - 0.3)) xl -= 0.05; // 画面の中に ラベル
      G.label(xl, pv(d, xl), "f′(x)", { pos: "w", c: "violet", size: 13 });
      if (!ctx.hl || H(ctx, "tan")) { G.point(t, m, { c: "violet", r: 4.5 }); G.line(t, 0, t, m, { c: "violet", w: 1, dash: "3 4" }); }
    }
    G.fn(x => pv(c, x), { c: "accent", w: 3.5 });
    if (st.sec) { // 平均の変化率（2 点を結ぶ直線）
      const [p, q] = st.sec, fp = pv(c, p), fq = pv(c, q), ms = (fq - fp) / (q - p);
      G.infLine(ms, fp - ms * p, { c: "violet", w: 3 });
      G.line(p, fp, q, fp, { c: "violet", w: 2 }); G.line(q, fp, q, fq, { c: "violet", w: 2 });
      G.label((p + q) / 2, fp, `${N(q - p)} 秒`, { pos: "s", c: "violet", size: 14 });
      G.label(q, (fp + fq) / 2, `${N(fq - fp)} m → 平均の速さ ${N(ms)}`, { pos: "e", c: "violet", size: 16 });
      [p, q].forEach(x => G.point(x, pv(c, x), { c: "violet", r: 6 }));
      G.infLine(m, y - m * t, { c: "warm", w: 2, dash: "6 5" });
      G.label(t, y, `その瞬間の速さ ${N(m)}`, { pos: "nw", d: 14, c: "warm", size: 14 });
      return;
    }
    if (!ctx.hl || H(ctx, "tan")) G.infLine(m, y - m * t, { c: "warm", w: em(ctx, "tan", 3.5, 2.5), pop: H(ctx, "tan") });
    if (!ctx.hl || H(ctx, "slope")) slopeTri(G, t, y, m, ctx);
    const lab = `(${N(t, 2)}, ${N(y, 2)})`;
    // 点が 画面の外に出ないように
    if (ctx.touch) G.handle("t", t, y, x => { const nx = clamp(snap(x, 0.25), -3.5, 4.5), ny = pv(st.c, nx); if (ny > G.y0 && ny < G.y1) st.t = nx; ctx.redraw(); }, { label: lab, pos: "nw" });
    else G.point(t, y, { c: "warm", r: 7, label: lab, pos: "nw" });
  },
  band(st) {
    const c = st.c, d = dv(c), t = st.t, y = pv(c, t), m = pv(d, t);
    return { g: "接線の傾き = f′(a)　接線：y − f(a) = f′(a)(x − a)", n: `f(x) = ${P(...c)}　f′(x) = ${P(...d)}　<span class="hl">f′(${N(t, 2)}) = ${N(m, 2)}</span><br><span class="mt">接線</span> y = ${P(m, y - m * t)}` };
  },
  points: ["<b>f′(a)</b> = x = a での <b>接線の傾き</b>", "(xⁿ)′ = <b>n xⁿ⁻¹</b>。係数はそのまま、定数は 0 になる", "接線：<b>y − f(a) = f′(a)(x − a)</b>"],
  ex: {
    q: "f(x) = x² の、x = 1 での接線の式は？", st: { fn: "x2", c: FNS.x2, t: 1, df: 0 },
    steps: [
      { t: "微分する：(x²)′ = 2x", hl: "none", n: "f′(x) = 2x" },
      { t: "x = 1 での傾きは f′(1) = 2", hl: "slope", n: "f′(1) = 2" },
      { t: "接点は (1, f(1)) = (1, 1)", hl: "slope", n: "接点 (1, 1)" },
      { t: "y − 1 = 2(x − 1) を整理して <b>y = 2x − 1</b>", hl: "tan slope", n: "y = 2x − 1" },
    ],
  },
  gen() {
    const t = rint(0, 2);
    if (t === 0) {
      const c = [pick([1, 2, -1]), rint(-3, 3), rint(-4, 4), rint(-3, 3)], k = rint(-2, 2), d = dv(c), ans = pv(d, k), y = pv(c, k);
      const sub = `${N(d[0])}·${pn(k)}²${d[1] ? ` ${d[1] < 0 ? MI : "+"} ${Math.abs(d[1])}·${pn(k)}` : ""}${sg(d[2])}`;
      const ch = chooseNumWhy(ans, [
        [pv(c, k), `f(${N(k)}) を 計算している。先に 微分してから x = ${N(k)} を 入れる`],
        [pv(d, k) + c[3], `数だけの項 ${N(c[3])} を のこしている。数だけの項は 微分すると 0`],
        [pv([3 * c[0], c[1], c[2]], k), `x² の項の 微分で 2 を かけていない。(${P(c[1], 0, 0)})′ = ${P(2 * c[1], 0)}`],
        [ans + 2, `計算ミス。f′(${N(k)}) = ${sub} を もう一度 計算しよう`],
        [-ans, `符号ミス。f′(${N(k)}) = ${sub} を もう一度 計算しよう`],
        [ans - 2, `計算ミス。f′(${N(k)}) = ${sub} を もう一度 計算しよう`],
      ]);
      const terms = c.map((k2, i) => k2 ? `(${poly([k2], [XV[3][i]])})′ = ${i === 3 ? "0" : poly([k2 * (3 - i)], [XV[3][i + 1]])}` : null).filter(Boolean).join("、");
      const val = `${N(d[0] * k * k)}${sg(d[1] * k)}${sg(d[2])}`;
      return { q: `f(x) = ${P(...c)} のとき、f′(${N(k)}) は？`, ...ch, hint: "まず微分：(x³)′ = 3x²、(x²)′ = 2x、(x)′ = 1、定数 → 0", exp: [
        ["1 つずつ 微分する（xⁿ → n xⁿ⁻¹、数だけの項 → 0）", terms],
        ["ならべて f′(x) にする", `f′(x) = ${P(...d)}`],
        [`f′(x) に x = ${N(k)} を 入れる`, `f′(${N(k)}) = ${sub}`],
        ["かけ算を してから たす", `= ${val} = <b>${N(ans)}</b>`],
      ], point: "先に 微分して、あとから x に 数を入れる", st: { c, t: k, df: 0, view: { xmin: k - 3, xmax: k + 3, ymin: Math.min(y, y + ans) - 3, ymax: Math.max(y, y + ans) + 3, equal: false } }, hl: "tan slope" };
    }
    if (t === 1) {
      const c = [rint(1, 3), rint(-5, 5), rint(-5, 5)];
      if (c[1] === 0) c[1] = 2;
      const d = dv(c);
      const ch = chooseWhy(P(...d), [
        [P(c[0], c[1]), `x² の項で 2 を かけていない。(${P(c[0], 0, 0)})′ = ${P(2 * c[0], 0)}`],
        [P(2 * c[0], c[1] + c[2]), `数だけの項 ${N(c[2])} を のこしている。数だけの項は 微分すると 0`],
        [P(2 * c[0], -c[1]), `x の項の 符号が 反対。(${P(c[1], 0)})′ = ${N(c[1])}`],
        [P(c[0] * 2, c[1] * 2), `x の項まで 2 倍している。(${P(c[1], 0)})′ = ${N(c[1])}（x が消えて 係数だけ のこる）`],
      ]);
      return { q: `f(x) = ${P(...c)} を 微分すると？`, ...ch, hint: "(x²)′ = 2x、(x)′ = 1、数だけの項 → 0", exp: [
        ["x² の項：2 を 前に おろして かける", `(${P(c[0], 0, 0)})′ = ${c[0]} × 2x = ${P(2 * c[0], 0)}`],
        ["x の項：x が消えて 係数だけ のこる", `(${P(c[1], 0)})′ = ${N(c[1])}`],
        ...(c[2] ? [["数だけの項：微分すると 0", `(${N(c[2])})′ = 0`]] : []),
        ["ならべる", `<b>f′(x) = ${P(...d)}</b>`],
      ], point: "(x²)′ = 2x、(x)′ = 1、数だけの項 → 0", st: { c, t: 0, df: 1, view: (() => { const vx = -c[1] / (2 * c[0]), vy = pv(c, vx); return { xmin: vx - 4, xmax: vx + 4, ymin: Math.min(vy, 0) - 3, ymax: Math.max(vy, 0) + 10, equal: false }; })() }, hl: "none" };
    }
    const b = rint(-3, 3), cc = rint(-2, 3), k = rint(-2, 2), m = 2 * k + b, y0 = k * k + b * k + cc;
    const ans = `y = ${P(m, y0 - m * k)}`;
    const ch = chooseWhy(ans, [
      [`y = ${P(m, y0)}`, `切片に f(${N(k)}) = ${N(y0)} を そのまま 使っている。y ${MI} f(a) = f′(a)(x ${MI} a) に 入れて 整理しよう`],
      [`y = ${P(y0, m)}`, `傾きと 切片が 入れかわっている。傾きは f′(${N(k)}) = ${N(m)}`],
      [`y = ${P(m, y0 + m * k)}`, `かっこを はずすときの 符号ミス。${co(m)}${sh("x", k)} = ${P(m, -m * k)}`],
      [`y = ${P(2 * k, y0 - 2 * k * k)}`, `傾きを 2 × ${pn(k)} だけで 出している。f′(x) = ${P(2, b)} なので f′(${N(k)}) = ${N(m)}`],
      [m === 0 ? null : `y = ${P(m, -m * k)}`, `接点の y 座標 f(${N(k)}) = ${N(y0)} を たしていない。y = ${co(m)}${sh("x", k)}${sg(y0)}`],
      [`y = ${P(-m, y0 + m * k)}`, `傾きの 符号が 反対。傾きは f′(${N(k)}) = ${N(m)}`],
    ], 4, () => { const mm = m + nz(-2, 2); return `y = ${P(mm, y0 - mm * k)}`; });
    const fk = `${pn(k)}²${b ? ` ${b < 0 ? MI : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b) + "·"}${pn(k)}` : ""}${sg(cc)}`;
    const lhs = sh("y", y0).replace(/^\(|\)$/g, ""), rhs = m === 0 ? "0" : co(m) + sh("x", k);
    return { q: `y = ${P(1, b, cc)} の、x = ${N(k)} での 接線 は？`, ...ch, hint: `傾き f′(${N(k)}) と 接点 (${N(k)}, f(${N(k)})) を出そう`, exp: [
      ["微分して 傾きの式を つくる", `f′(x) = ${P(2, b)}`],
      [`x = ${N(k)} を 入れて 傾きを 出す`, `f′(${N(k)}) = 2·${pn(k)}${sg(b)} = ${N(m)}`],
      [`もとの式に x = ${N(k)} を 入れて 接点の y 座標を 出す`, `f(${N(k)}) = ${fk} = ${N(y0)} → 接点 ${pt(k, y0)}`],
      [`y ${MI} f(a) = f′(a)(x ${MI} a) に 入れる`, `${lhs} = ${rhs}`],
      ["かっこを はずして y = … に 整理する", m === 0 || k === 0 ? `<b>${ans}</b>` : `y = ${P(m, -m * k)}${sg(y0)} → <b>${ans}</b>`],
    ], point: "接線：傾き f′(a) と 接点 (a, f(a)) → y − f(a) = f′(a)(x − a)", st: { c: [1, b, cc], t: k, df: 0, view: { xmin: k - 4, xmax: k + 4, ymin: y0 - 6, ymax: y0 + 6, equal: false } }, hl: "tan slope" };
  },
});

/* ---------- 6. 増減と極値 ---------- */
const KF = { a: [1, 0, -3, 0], b: [1, -3, 0, 4], c: [-1, 0, 3, 1], d: [1, 0, 0, 0] };
function extremes(c) { // 3 次関数の極値
  const d = dv(c), A = d[0], B = d[1], C = d[2], D = B * B - 4 * A * C;
  if (D <= 0) return [];
  const r = [(-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A)].sort((p, q) => p - q);
  return r.map(x => ({ x, y: pv(c, x), max: pv(dv(d), x) < 0 }));
}
UNITS.push({
  id: "kyoku", sub: "II", name: "増減と極値", small: "f′(x) の符号で 山と谷",
  init: () => ({ k: "a", c: KF.a, t: -1.6 }),
  view: () => ({ xmin: -3.5, xmax: 4, ymin: -4, ymax: 6 }),
  ctrls: [{ k: "k", label: "", opts: [["a", "x³ − 3x"], ["b", "x³ − 3x² + 4"], ["c", "−x³ + 3x + 1"], ["d", "x³"]], set: (st, v) => { st.c = KF[v]; st.t = 0.5; } }],
  hint: "👆 点を動かすと、接線の傾きの ＋／− が わかる",
  draw(G, st, ctx) {
    const c = st.c, d = dv(c), f = x => pv(c, x);
    const [d0, d1] = st.dom || [-Infinity, Infinity]; // 文章題：x の範囲
    if (st.dom) G.fn(f, { c: "muted", w: 2, dash: "4 5", op: 0.6 });
    const ex = extremes(c).filter(e => e.x > d0 + 1e-9 && e.x < d1 - 1e-9), cuts = [Math.max(G.x0, d0), ...ex.map(e => e.x), Math.min(G.x1, d1)];
    for (let i = 0; i < cuts.length - 1; i++) {
      const mid = (cuts[i] + cuts[i + 1]) / 2, up = pv(d, mid) > 0;
      G.fn(f, { c: up ? "blue" : "warm", w: 4, from: cuts[i], to: cuts[i + 1], op: !ctx.hl || H(ctx, "inc") ? 1 : 0.4 });
    }
    // 例題では 値は さいごのステップまで かくす
    if (!ctx.hl || H(ctx, "ext")) ex.forEach(e => { G.line(e.x, 0, e.x, e.y, { c: "muted", dash: "4 5", w: 1.5 }); G.point(e.x, e.y, { c: e.max ? "warm" : "blue", r: 7, label: `${e.max ? "極大" : "極小"}${RV(ctx, "val") ? " " + N(e.y, 2) : ""}`, pos: e.max ? "n" : "s", pop: H(ctx, "ext") }); });
    if (ctx.touch) {
      const t = st.t, y = f(t), m = pv(d, t);
      G.infLine(m, y - m * t, { c: m > 0.01 ? "blue" : m < -0.01 ? "warm" : "gold", w: 2, op: 0.8 });
      G.handle("t", t, y, x => { const nx = clamp(snap(x, 0.1), -3.2, 3.8), ny = pv(st.c, nx); if (ny > G.y0 && ny < G.y1) st.t = nx; ctx.redraw(); }, { label: `傾き ${m > 0.01 ? "＋" : m < -0.01 ? "−" : "0"}`, pos: "e", c: "gold" });
    }
    G.textPx(G.w - 14, G.h - 14, "青：ふえる ↗　赤：へる ↘", { size: 13, c: "muted", bold: false, anchor: "end" });
  },
  band(st) {
    const c = st.c, d = dv(c), ex = extremes(c);
    if (!ex.length) return { g: "f′(x) = 0 になる x で、＋ → − なら 極大、− → ＋ なら 極小", n: `f(x) = ${P(...c)}　f′(x) = ${P(...d)} ≧ 0 <span class="mt">→ ずっとふえる（極値なし）</span>` };
    const s = ex.map(e => `<span class="${e.max ? "hl" : "bl"}">${e.max ? "極大" : "極小"} ${N(e.y, 2)}</span><span class="mt">（x = ${N(e.x, 2)}）</span>`).join("　");
    return { g: "f′(x) = 0 になる x で、＋ → − なら 極大、− → ＋ なら 極小", n: `f(x) = ${P(...c)}　f′(x) = ${P(...d)}<br>${s}` };
  },
  points: ["f′(x) > 0 → <b>ふえる ↗</b>、f′(x) < 0 → <b>へる ↘</b>", "f′(x) = 0 で ＋ → − なら <b>極大</b>（山）、− → ＋ なら <b>極小</b>（谷）", "増減表：f′(x) の符号 と f(x) の ↗↘ をならべる"],
  ex: {
    q: "f(x) = x³ − 3x の 極大値・極小値 は？", st: { k: "a", c: KF.a, t: -2 },
    steps: [
      { t: "微分する：f′(x) = 3x² − 3 = 3(x + 1)(x − 1)", hl: "none", n: "f′(x) = 3x² − 3 = 3(x + 1)(x − 1)" },
      { t: "f′(x) = 0 となるのは x = −1, 1（接線が 水平）", hl: "ext", n: "f′(x) = 0 → x = −1, 1" },
      { t: "f′ の符号：x < −1 で ＋（青 ↗）、−1 < x < 1 で −（赤 ↘）、1 < x で ＋（青 ↗）", hl: "inc", n: "x < −1：＋ ↗ ／ −1 〜 1：− ↘ ／ 1 < x：＋ ↗" },
      { t: "＋ → − の x = −1 で <b>極大 2</b>、− → ＋ の x = 1 で <b>極小 −2</b>", hl: "inc ext val", n: "極大値 2（x = −1）、極小値 −2（x = 1）" },
    ],
  },
  gen() {
    // s = 1：x³ − 3p²x + d（極大は x = −p）、s = −1：−x³ + 3p²x + d（極大は x = p）
    const p = pick([1, 1, 2]), d = rint(-3, 3), sgn = Math.random() < 0.65 ? 1 : -1, c = [sgn, 0, -3 * sgn * p * p, d];
    const mx = 2 * p ** 3 + d, mn = -2 * p ** 3 + d, wantMax = Math.random() < 0.5, ans = wantMax ? mx : mn;
    const xAt = wantMax ? -sgn * p : sgn * p; // 答えの x
    const st = { c, t: 0, view: { xmin: -p - 2.5, xmax: p + 2.5, ymin: mn - 3, ymax: mx + 3, equal: false } };
    const fd = `f′(x) = ${P(3 * sgn, 0, -3 * sgn * p * p)} = ${sgn < 0 ? MI : ""}3(x + ${p})(x − ${p})`;
    const signs = sgn > 0 ? "＋ → − → ＋" : "− → ＋ → −";
    const kind = wantMax ? "極大" : "極小", other = wantMax ? "極小" : "極大";
    const sgS = v => v > 0 ? "＋ ↗" : "− ↘";
    const base = [
      ["微分する", `f′(x) = ${P(3 * sgn, 0, -3 * sgn * p * p)}`],
      ["因数分解して f′(x) = 0 を 解く", `${sgn < 0 ? MI : ""}3(x + ${p})(x − ${p}) = 0 → x = ${N(-p)}, ${p}`],
      [`x = ${N(-p)}, ${p} で 区切って f′(x) の 符号を しらべる（たとえば x = 0 なら f′(0) = ${N(-3 * sgn * p * p)}）`, `x < ${N(-p)}：${sgS(sgn)} ／ ${N(-p)} < x < ${p}：${sgS(-sgn)} ／ ${p} < x：${sgS(sgn)}`],
      [wantMax ? "＋ → −（↗ から ↘ に かわる）ところが 山 → 極大" : "− → ＋（↘ から ↗ に かわる）ところが 谷 → 極小", `${signs} なので x = ${N(xAt)} で ${kind}`],
    ];
    if (Math.random() < 0.3) {
      const ch = chooseWhy(`x = ${N(xAt)}`, [
        [`x = ${N(-xAt)}`, `それは ${other} になる x。${wantMax ? "＋ → −" : "− → ＋"} に かわる ほうを えらぶ`],
        [`x = ${N(3 * p * p)}`, `${3 * p * p} は f(x) の x の係数の 数。f′(x) = 0 を 解いた x が 答え`],
        ["x = 0", `x = 0 では f′(0) = ${N(-3 * sgn * p * p)} で 0 に ならない`],
      ]);
      base[3][1] = `<b>x = ${N(xAt)}</b>`;
      return { q: `f(x) = ${P(...c)} が <b>${kind}</b> になる x は？`, ...ch, hint: "f′(x) = 0 の解をさがして、＋ → − が極大、− → ＋ が極小", exp: base, point: "f′ が ＋ → − で 極大（山）、− → ＋ で 極小（谷）", st, hl: "inc ext" };
    }
    const ch = chooseNumWhy(ans, [
      [wantMax ? mn : mx, `それは ${other}値（x = ${N(-xAt)} のとき）。${kind}は x = ${N(xAt)}`],
      [-ans, `符号ミス。f(${N(xAt)}) の 計算を もう一度 たしかめよう`],
      [d, `それは f(0)。x = 0 ではなく x = ${N(xAt)} を 入れる`],
      [ans + 2, `計算ミス。f(${N(xAt)}) の 計算を もう一度 たしかめよう`],
      [ans - 2, `計算ミス。f(${N(xAt)}) の 計算を もう一度 たしかめよう`],
    ]);
    const subst = `${sgn < 0 ? MI + "(" + N(xAt) + ")" : pn(xAt)}³ ${sgn < 0 ? "+" : MI} ${3 * p * p}·${pn(xAt)}${sg(d)}`;
    const arith = `${N(sgn * xAt ** 3)}${sg(-3 * sgn * p * p * xAt)}${sg(d)}`;
    return { q: `f(x) = ${P(...c)} の <b>${kind}値</b> は？`, ...ch, hint: `f′(x) = ${P(3 * sgn, 0, -3 * sgn * p * p)}。f′(x) = 0 の x を f(x) に入れる`, exp: [
      ...base,
      [`もとの f(x) に x = ${N(xAt)} を 入れる`, `f(${N(xAt)}) = ${subst} = ${arith} = <b>${N(ans)}</b>`],
    ], point: "極値は「f′(x) = 0 の x」を もとの f(x) に 入れて 出す", st, hl: "inc ext" };
  },
});

/* ---------- 7. 積分と面積 ---------- */
const IF = { x2: [1, 0, 0], p4: [-1, 0, 4], l: [2, 1], q: [1, -2, 0] };
const integ = c => { const n = c.length - 1; return [...c.map((k, i) => k / (n - i + 1)), 0]; }; // 原始関数（C = 0）
/* 項が 1 つなら かっこを つけない：∫ x² dx、∫ (2x + 1) dx */
const intg = c => c.filter(k => k).length > 1 ? `(${P(...c)})` : P(...c);
/* ∫ の上下の数（下にマイナスがあっても 読みやすく） */
const intS = (a, b) => `∫<sub>${N(a)}</sub><sup>${N(b)}</sup>`;
UNITS.push({
  id: "integ", sub: "II", name: "積分と面積", small: "∫ は 面積",
  init: () => ({ fn: "x2", c: IF.x2, a: 0, b: 2 }),
  view: () => ({ xmin: -3.5, xmax: 3.5, ymin: -2.5, ymax: 6.5 }),
  ctrls: [{ k: "fn", label: "", opts: [["x2", "x²"], ["p4", "−x² + 4"], ["l", "2x + 1"], ["q", "x² − 2x"]], set: (st, v) => { st.c = IF[v]; } }, { k: "a", label: "下 a", min: -3, max: 3, step: 0.5 }, { k: "b", label: "上 b", min: -3, max: 3, step: 0.5 }],
  fix(st, k) { if (st.a > st.b) { if (k === "a") st.b = st.a; else st.a = st.b; } },
  hint: "👆 x 軸の上の 2 つの点（a と b）を ドラッグ",
  draw(G, st, ctx) {
    const c = st.c, f = x => pv(c, x), { a, b } = st;
    if (st.top) { // 2 つのグラフで はさまれた面積
      const T = x => pv(st.top, x), B = x => pv(st.bot, x);
      if (!ctx.hl || H(ctx, "area")) G.area(T, a, b, { g: B, c: "accent-soft", pop: H(ctx, "area") });
      G.fn(B, { c: "accent", w: 3.5 }); G.fn(T, { c: "blue", w: 3.5 });
      G.label(G.x1 - 0.3, B(G.x1 - 0.3), st.botL, { pos: "w", c: "accent", size: 15 });
      G.label(b + 0.4, T(b + 0.4), st.topL, { pos: "e", c: "blue", size: 15 });
      [a, b].forEach(x => G.point(x, T(x), { c: "warm", r: 6, label: pt(x, T(x)), pos: x === a ? "nw" : "se", size: 14 }));
      if (!ctx.hl || H(ctx, "area")) { const v = pv(integ(c), b) - pv(integ(c), a); G.label((a + b) / 2, (T((a + b) / 2) + B((a + b) / 2)) / 2, Ft(v), { pos: "c", c: "accent", size: 22 }); }
      return;
    }
    if (!ctx.hl || H(ctx, "area")) {
      G.area(x => Math.max(0, f(x)), a, b, { c: "accent-soft", pop: H(ctx, "area") });
      G.area(x => Math.min(0, f(x)), a, b, { c: "warm-soft" });
    }
    G.fn(f, { c: "accent", w: 3.5 });
    G.line(a, 0, a, f(a), { c: "muted", dash: "4 4", w: 1.5 }); G.line(b, 0, b, f(b), { c: "muted", dash: "4 4", w: 1.5 });
    if (ctx.touch) {
      G.handle("a", a, 0, x => { st.a = clamp(snap(x, 0.5), -3, 3); this.fix(st, "a"); ctx.redraw(); }, { c: "gold", label: "a", pos: "sw" });
      G.handle("b", b, 0, x => { st.b = clamp(snap(x, 0.5), -3, 3); this.fix(st, "b"); ctx.redraw(); }, { c: "gold", label: "b", pos: "se" });
    } else { G.point(a, 0, { c: "gold", r: 5 }); G.point(b, 0, { c: "gold", r: 5 }); }
    if (!ctx.hl || H(ctx, "area")) {
      const Fc = integ(c), v = pv(Fc, b) - pv(Fc, a), fm = f((a + b) / 2);
      // 面積の数：ぬった部分の まん中（うすいときは 上に）
      if (Math.abs(fm) > 1.2) G.label((a + b) / 2, fm / 2, Ft(v), { pos: "c", c: "accent", size: em(ctx, "area", 22, 18) });
      else G.label((a + b) / 2, Math.max(fm, 0), Ft(v), { pos: "n", d: 10, c: "accent", size: em(ctx, "area", 22, 18) });
    }
  },
  band(st) {
    const Fc = integ(st.c), v = pv(Fc, st.b) - pv(Fc, st.a);
    const FS = poly(Fc, ["x⁴", "x³", "x²", "x", ""].slice(-Fc.length));
    return { g: "∫ₐᵇ f(x) dx = [F(x)]ₐᵇ = F(b) − F(a)　（x 軸より下はマイナス）", n: `${intS(st.a, st.b)} ${intg(st.c)} dx = [ ${FS} ]<sub>${N(st.a)}</sub><sup>${N(st.b)}</sup> = ${F(pv(Fc, st.b))} − ${F(pv(Fc, st.a)) .startsWith(MI) ? "(" + F(pv(Fc, st.a)) + ")" : F(pv(Fc, st.a))} = <span class="hl">${F(v)}</span>` };
  },
  points: ["∫ₐᵇ f(x) dx は、グラフと x 軸の間の <b>面積</b>（下にあるとマイナス）", "xⁿ を積分すると <b>xⁿ⁺¹ / (n + 1)</b>", "計算は <b>F(b) − F(a)</b>（上の値 − 下の値）"],
  ex: {
    q: "∫₀³ x² dx を計算しよう", st: { fn: "x2", c: IF.x2, a: 0, b: 3, view: { xmin: -1.5, xmax: 4, ymin: -1, ymax: 10, equal: false } },
    steps: [
      { t: "x² を積分すると x³/3", hl: "none", n: `∫ x² dx = ${fr("x³", 3)}` },
      { t: "上の値 3 と 下の値 0 を入れて ひく", hl: "none", n: `[${fr("x³", 3)}]₀³ = ${fr(27, 3)} − 0` },
      { t: "= 9。色をぬった部分の面積が 9", hl: "area", n: "∫₀³ x² dx = 9" },
    ],
  },
  gen() {
    if (Math.random() < 0.55) {
      const [c, a, b] = pick([[[3, 0, 0], 0, 2], [[3, 0, 0], 1, 2], [[2, 0], 1, 3], [[2, 1], 0, 2], [[1, 0, 0], 0, 3], [[3, -2, 0], 0, 2], [[2, -1], 1, 3], [[6, 0, 0], 0, 1], [[3, 0, 0], -1, 1]]);
      const Fc = integ(c), v = pv(Fc, b) - pv(Fc, a);
      const Fb = pv(Fc, b), Fa = pv(Fc, a), VS = ["x³", "x²", "x", ""], vs = VS.slice(-c.length), Vs = VS.slice(-Fc.length);
      const ch = chooseNumWhy(v, [
        [pv(c, b) - pv(c, a), `積分しないで f(${N(b)}) − f(${N(a)}) を 計算している。先に 積分して F(x) を つくる`],
        [Fb, `F(${N(b)}) だけで、F(${N(a)}) = ${N(Fa)} を ひいていない`],
        [pv(c, b) * b - pv(c, a) * a, "積分で (n + 1) で わるのを わすれている。xⁿ → xⁿ⁺¹ ÷ (n + 1)"],
        [v * 2, `計算ミス。F(x) を 微分すると ${P(...c)} に もどるか たしかめよう`],
        [v + 1, `計算ミス。F(${N(b)}) − F(${N(a)}) = ${N(Fb)} − ${pn(Fa)} を もう一度`],
        [v - 1, `計算ミス。F(${N(b)}) − F(${N(a)}) = ${N(Fb)} − ${pn(Fa)} を もう一度`],
      ].filter(z => z[0] !== v));
      // 項ごとに 積分：3x² → x³ など
      const terms = c.map((k, i) => k ? `${poly([k], [vs[i]])} → ${poly([k / (c.length - i)], [Vs[i]])}` : null).filter(Boolean).join("、");
      // F(x) に 数を入れた式：x³ − x² に 2 → 2³ − 2²
      const put = x => { let s = ""; Fc.forEach((k, i) => { if (!k || !Vs[i]) return; const e = Fc.length - 1 - i, kk = Math.abs(k), body = (kk === 1 ? "" : F(kk) + "·") + pn(x) + (e > 1 ? "²³"[e - 2] : ""); s += s ? (k < 0 ? ` ${MI} ` : " + ") + body : (k < 0 ? MI : "") + body; }); return s; };
      return { q: `${intS(a, b)} ${intg(c)} dx は？`, ...ch, hint: "xⁿ → xⁿ⁺¹ / (n + 1) で積分して、F(上) − F(下)", exp: [
        ["項ごとに 積分する：xⁿ → xⁿ⁺¹ ÷ (n + 1)（係数は そのまま かける）", terms],
        ["まとめて F(x) にする", `F(x) = ${poly(Fc, Vs)}`],
        [`上の数 x = ${N(b)} を 入れる`, `F(${N(b)}) = ${put(b)} = ${N(Fb)}`],
        [`下の数 x = ${N(a)} を 入れる`, a === 0 ? "F(0) = 0" : `F(${N(a)}) = ${put(a)} = ${N(Fa)}`],
        ["F(上) − F(下)", `${N(Fb)} − ${pn(Fa)} = <b>${N(v)}</b>`],
      ], point: "∫ は F(上の数) − F(下の数)。下の数の 値も 忘れず ひく", st: { c, a, b, view: { xmin: Math.min(a, 0) - 1.5, xmax: b + 1.5, ymin: -2, ymax: Math.max(...[a, b, (a + b) / 2].map(x => pv(c, x))) + 2, equal: false } }, hl: "area" };
    }
    const al = rint(-2, 1), be = al + rint(1, 3), w = be - al, area = w ** 3 / 6;
    const c = [-1, al + be, -al * be]; // y = −(x − α)(x − β)
    const ch = chooseWhy(F(area), [
      [F(w ** 3 / 3), "6 ではなく 3 で わっている。公式は (β − α)³ ÷ 6"],
      [F(w ** 2 / 2), "2 乗 ÷ 2 に している。公式は 3 乗 ÷ 6：(β − α)³ ÷ 6"],
      [F(w ** 3 / 2), "6 ではなく 2 で わっている。公式は (β − α)³ ÷ 6"],
      [F(area + 1), `計算ミス。(${N(be)} − ${pn(al)})³ ÷ 6 を もう一度`],
    ]);
    return { q: `放物線 y = ${P(...c)} と x 軸 で囲まれた部分の面積は？`, ...ch, hint: `x 軸との交点は x = ${N(al)}, ${N(be)}。∫ で計算するか、公式 (β − α)³ ÷ 6`, exp: [
      ["x 軸との 交点を 出す：y = 0 とおいて 因数分解", `${P(...c)} = ${MI}${sh("x", al)}${sh("x", be)} = 0 → x = ${N(al)}, ${N(be)}`],
      [`x² の係数が −1 なので 上に凸（∩）。x = ${N(al)} から ${N(be)} までは x 軸の上にある`, `面積 = ${intS(al, be)} (${P(...c)}) dx`],
      ["公式：−(x − α)(x − β) を α から β まで 積分すると (β − α)³ ÷ 6", `面積 = ${fr("(β − α)³", 6)}`],
      ["β − α を 計算する", `β − α = ${N(be)} − ${pn(al)} = ${w}`],
      ["3 乗して 6 で わる", `${w}³ ÷ 6 = ${w ** 3} ÷ 6 = <b>${F(area)}</b>`],
    ], point: "−(x − α)(x − β) と x 軸で 囲む面積 = (β − α)³ ÷ 6", st: { c, a: al, b: be, view: { xmin: al - 1.5, xmax: be + 1.5, ymin: -2, ymax: (w / 2) ** 2 + 1.5, equal: false } }, hl: "area" };
  },
});
