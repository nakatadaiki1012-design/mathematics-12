"use strict";
/* ===== 数学II の単元 ===== */

/* ---------- 1. 円の方程式 ---------- */
const circStr = (a, b, r2) => `${sh("x", a)}² + ${sh("y", b)}² = ${N(r2)}`;
UNITS.push({
  id: "circle", sub: "II", name: "円の方程式", small: "(x − a)² + (y − b)² = r²",
  init: () => ({ a: 2, b: -1, r: 3 }),
  view: () => ({ xmin: -8, xmax: 8, ymin: -7, ymax: 7 }),
  ctrls: [{ k: "a", label: "a", min: -4, max: 4, step: 0.5 }, { k: "b", label: "b", min: -4, max: 4, step: 0.5 }, { k: "r", label: "r", min: 0.5, max: 5, step: 0.5 }],
  hint: "👆 中心 と 円の上の点 をドラッグできる",
  draw(G, st, ctx) {
    const { a, b, r } = st;
    G.line(a, b, a, 0, { c: "muted", dash: "4 5", w: 1.5 }); G.line(a, b, 0, b, { c: "muted", dash: "4 5", w: 1.5 });
    G.circle(a, b, r, { c: "accent", w: 3.5 });
    G.line(a, b, a + r, b, { c: "warm", w: em(ctx, "r", 5, 3), pop: H(ctx, "r") });
    G.label(a + r / 2, b, "r = " + N(r), { pos: "n", c: "warm", size: em(ctx, "r", 19, 15) });
    const lab = `中心 ${pt(a, b)}`;
    if (ctx.touch) {
      G.handle("c", a, b, (x, y) => { st.a = clamp(snap(x, 0.5), -4, 4); st.b = clamp(snap(y, 0.5), -4, 4); ctx.redraw(); }, { label: lab, pos: "sw" });
      G.handle("r", a + r, b, x => { st.r = clamp(snap(x - st.a, 0.5), 0.5, 5); ctx.redraw(); }, { c: "accent" });
    } else G.point(a, b, { c: "warm", r: em(ctx, "center", 8, 6), label: lab, pos: "sw", size: em(ctx, "center", 19, 15), pop: H(ctx, "center") });
  },
  band: st => ({ g: "(x − a)² + (y − b)² = r²　→　中心 (a, b)、半径 r", n: `${circStr(st.a, st.b, st.r * st.r)}　<span class="mt">中心</span> <span class="hl">${pt(st.a, st.b)}</span>　<span class="mt">半径</span> <span class="hl">${N(st.r)}</span>` }),
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
    if (t === 0) {
      const c = choose(pt(a, b), [pt(-a, -b), pt(-a, b), pt(a, -b), pt(b, a)]);
      return { q: `円 ${circStr(a, b, r * r)} の 中心 は？`, ...c, hint: "(x − a)² + (y − b)² = r² の中心は (a, b)。符号に注意", exp: `x ${a > 0 ? "−" : "+"} ${Math.abs(a)} → a = ${N(a)}、y ${b > 0 ? "−" : "+"} ${Math.abs(b)} → b = ${N(b)}<br>中心 <b>${pt(a, b)}</b>`, st, hl: "center" };
    }
    if (t === 1) {
      const c = chooseNum(r, [r * r, r + 1, 2 * r]);
      return { q: `円 ${circStr(a, b, r * r)} の 半径 は？`, ...c, hint: "右辺は r²（半径の 2 乗）", exp: `r² = ${r * r} なので 半径 <b>${r}</b>`, st, hl: "r" };
    }
    const D = -2 * a, E = -2 * b, Fc = a * a + b * b - r * r;
    const eq = poly([1, 1, D, E, Fc], ["x²", "y²", "x", "y", ""]) + " = 0";
    const c = choose(`中心 ${pt(a, b)}、半径 ${r}`, [`中心 ${pt(-a, -b)}、半径 ${r}`, `中心 ${pt(a, b)}、半径 ${r * r}`, `中心 ${pt(-a, -b)}、半径 ${r * r}`, `中心 ${pt(a, b)}、半径 ${r + 1}`, `中心 ${pt(-a, -b)}、半径 ${r + 1}`]);
    return { q: `円 ${eq} の 中心 と 半径 は？`, ...c, one: true, hint: `x と y それぞれ平方完成。x の係数 ${N(D)} の半分は ${N(D / 2)}`, exp: `${circStr(a, b, r * r)} と変形できる<br><b>中心 ${pt(a, b)}、半径 ${r}</b>`, st, hl: "center r" };
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
const trigStr = (f, A, B, C) => `y = ${A === 1 ? "" : N(A) + " "}${f} ${B === 1 ? "" : B === 0.5 ? fr(1, 2) : B}${C ? `(x ${C > 0 ? MI : "+"} ${piH(Math.abs(C), 6)})` : "x"}`;
UNITS.push({
  id: "trigfn", sub: "II", name: "三角関数のグラフ", small: "振幅と周期",
  init: () => ({ f: "sin", A: 2, B: 2, C: 0 }),
  view: () => ({ xmin: -0.6, xmax: 4 * PI + 0.3, ymin: -3.6, ymax: 3.6, equal: false, xticks: Array.from({ length: 8 }, (_, i) => ({ v: (i + 1) * PI / 2, l: piS(i + 1, 2) })), xname: "x", gridX: PI / 2, gridY: 1 }),
  ctrls: [{ k: "f", label: "", opts: [["sin", "sin"], ["cos", "cos"]] }, { k: "A", label: "振幅 A", min: 0.5, max: 3, step: 0.5 }, { k: "B", label: "B", opts: [[0.5, "½"], [1, "1"], [2, "2"], [3, "3"]] }, { k: "C", label: "ずらす", min: -6, max: 6, step: 1, fmt: v => piS(v, 6) }],
  hint: "A で たての のび、B で 波の細かさ（周期）が かわる",
  draw(G, st, ctx) {
    const base = st.f === "sin" ? Math.sin : Math.cos, c = st.C * PI / 6;
    const f = x => st.A * base(st.B * (x - c));
    G.fn(x => base(x), { c: "muted", w: em(ctx, "base", 3, 1.5), dash: "6 5", op: em(ctx, "base", 1, 0.6) });
    G.fn(f, { c: "accent", w: 3.5 });
    // 振幅
    const xp = c + (st.f === "sin" ? PI / 2 : 0) / st.B + (st.f === "sin" ? 0 : 2 * PI / st.B);
    if (!ctx.hl || H(ctx, "amp")) { G.arrow(xp, 0, xp, st.A, { c: "warm", w: em(ctx, "amp", 4, 2.5), both: true, pop: H(ctx, "amp") }); G.label(xp, st.A / 2, "振幅 " + N(st.A), { pos: "e", c: "warm", size: em(ctx, "amp", 18, 14) }); }
    // 周期
    const T = 2 * PI / st.B, x0 = c >= 0 ? c : c + T * Math.ceil(-c / T), yb = -st.A - 0.45;
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
    if (t === 0) {
      const [pn2, pd] = periodOf(B);
      const c = choose(piH(pn2, pd), ["4π", "2π", "π", fr("π", 2), fr("2π", 3), fr("π", 3)].filter(Boolean));
      return { q: `${trigStr(f, A, B, 0)} の 周期 は？`, ...c, hint: "周期 = 2π ÷（x の前の数）", exp: `2π ÷ ${B === 0.5 ? fr(1, 2) : B} = <b>${piH(pn2, pd)}</b>`, st, hl: "per" };
    }
    if (t === 1) {
      const c = chooseNum(A, [B === A ? A + 1 : B, 2 * A, A + 2]);
      return { q: `${trigStr(f, A, B, 0)} の 振幅（最大値）は？`, ...c, hint: `${f} の前の数 が 振幅`, exp: `${f} の値は −1 から 1 なので、${A} 倍して <b>${A}</b>`, st, hl: "amp" };
    }
    const deg = pick([30, 45, 60, 90, 120, 135, 150, 180, 270, 360]);
    const g = gcd(deg, 180), ans = piH(deg / g, 180 / g);
    const c = choose(ans, shuffle([[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [5, 6], [1, 1], [3, 2], [2, 1]]).map(p => piH(p[0], p[1])));
    return { q: `${deg}° を ラジアン で表すと？`, ...c, hint: "180° = π。180 で わって π をかける", exp: `${deg}° = ${deg} ÷ 180 × π = <b>${ans}</b>`, st: { f: "sin", A: 1, B: 1, C: 0 }, hl: "base" };
  },
});

/* ---------- 3. 指数関数 ---------- */
const sup = s => `<sup>${s}</sup>`;
UNITS.push({
  id: "exp", sub: "II", name: "指数関数", small: "y = aˣ",
  init: () => ({ a: 2, mark: null }),
  view: st => ({ xmin: -4.5, xmax: 4.5, ymin: -1, ymax: Math.max(8.5, st.mark != null ? st.a ** st.mark + 1 : 0), equal: false }),
  ctrls: [{ k: "a", label: "底 a", min: 0.2, max: 4, step: 0.1, fmt: v => N(v, 1) }, { k: "a", label: "", opts: [[0.5, "½"], [2, "2"], [3, "3"]] }],
  hint: "👆 グラフの上の点を ドラッグすると、aˣ の値が出る",
  draw(G, st, ctx) {
    const a = st.a, f = x => a ** x;
    if (Math.abs(a - 1) > 1e-9) G.fn(x => (1 / a) ** x, { c: "muted", w: 1.5, dash: "5 5", op: 0.5 });
    G.fn(f, { c: "accent", w: 3.5 });
    G.point(0, 1, { c: "blue", r: 6, label: "(0, 1)", pos: "nw", size: em(ctx, "one", 18, 13), pop: H(ctx, "one") });
    if (Math.abs(a - 1) > 1e-9) G.point(1, a, { c: "ink", r: 4.5, label: `(1, ${N(a, 2)})`, pos: a > 1 ? "nw" : "ne", size: 13 });
    const m = st.mark ?? st.mx ?? 2;
    if (st.mark != null || ctx.touch) {
      G.line(m, 0, m, f(m), { c: "warm", dash: "5 5", w: 1.5 }); G.line(0, f(m), m, f(m), { c: "warm", dash: "5 5", w: 1.5 });
      const lab = `${N(a, 2)}^${N(m, 2)} = ${N(f(m), 3)}`;
      if (ctx.touch) G.handle("m", m, f(m), x => { st.mx = clamp(snap(x, 0.5), -4, 4); ctx.redraw(); }, { label: lab, pos: "e" });
      else G.point(m, f(m), { c: "warm", r: 7, label: lab, pos: "e", pop: H(ctx, "mark") });
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
      { t: "8 を 2 の何乗かで表す", n: "8 = 2³" },
      { t: "指数どうしは かけ算", n: `8${sup("2/3")} = (2³)${sup("2/3")} = 2${sup("3 × 2/3")}` },
      { t: "3 × 2/3 = 2 なので 2²", st: { mark: 2 }, hl: "mark", n: `= 2² = 4` },
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
      const c = chooseNum(ans, [ans * 2, ans + 1, Math.round(base * ex.split("/")[0] / ex.split("/")[1]), ans - 1].filter(v => v > 0));
      return { q: `${base}${sup(ex)} の値は？`, ...c, hint: `${base} を ${a} の何乗かで表してみよう`, exp: `${base}${sup(ex)} = ${how} = <b>${ans}</b>`, st: { a, mark: m }, hl: "mark" };
    }
    const [q, ans, cands, a, m, how] = pick([
      [`2${sup("−3")}`, fr(1, 8), [MI + "8", MI + "6", fr(1, 6)], 2, -3, `1 ÷ 2³ = ${fr(1, 8)}`],
      [`3${sup("−2")}`, fr(1, 9), [MI + "9", MI + "6", fr(1, 6)], 3, -2, `1 ÷ 3² = ${fr(1, 9)}`],
      [`2³ × 2⁴`, `2${sup(7)}`, [`2${sup(12)}`, `4${sup(7)}`, `4${sup(12)}`], 2, null, "かけ算は 指数をたす：3 + 4 = 7"],
      [`(2³)²`, `2${sup(6)}`, [`2${sup(5)}`, `2${sup(9)}`, `4${sup(3)}`], 2, null, "（ ）の累乗は 指数をかける：3 × 2 = 6"],
      [`3⁵ ÷ 3²`, `3${sup(3)}`, [`3${sup(7)}`, `3${sup("5/2")}`, `1${sup(3)}`], 3, null, "わり算は 指数をひく：5 − 2 = 3"],
      [`5⁰`, "1", ["0", "5", MI + "5"], 5, 0, "どんな数も 0 乗は 1"],
    ]);
    const c = choose(ans, cands);
    return { q: `${q} を計算すると？`, ...c, hint: "指数法則：aᵐ × aⁿ = aᵐ⁺ⁿ、(aᵐ)ⁿ = aᵐⁿ、a⁻ⁿ = 1 / aⁿ", exp: `${how}<br>答え <b>${ans}</b>`, st: { a: Math.min(a, 4), mark: m }, hl: "mark" };
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
    if (st.mir) { G.fn(x => x, { c: "muted", w: 1.5, dash: "6 5" }); G.fn(x => a ** x, { c: "blue", w: 2, op: 0.7 }); G.label(1.4, a ** 1.4, `y = ${N(a, 1)}ˣ`, { pos: "w", c: "blue", size: 13 }); }
    G.fn(f, { c: "accent", w: 3.5, from: 0.001 });
    G.point(1, 0, { c: "blue", r: 6, label: "(1, 0)", pos: "se", size: em(ctx, "one", 18, 13), pop: H(ctx, "one") });
    G.point(a, 1, { c: "ink", r: 4.5, label: `(${N(a, 1)}, 1)`, pos: "nw", size: 13 });
    const m = st.mx, y = f(m);
    G.line(m, 0, m, y, { c: "warm", dash: "5 5", w: 1.5 }); G.line(0, y, m, y, { c: "warm", dash: "5 5", w: 1.5 });
    const lab = `log${sub2(a)} ${N(m, 2)} = ${N(y, 2)}`;
    if (ctx.touch) G.handle("m", m, y, x => { st.mx = clamp(snap(x, 0.25), 0.25, 9); ctx.redraw(); }, { label: lab, pos: y >= 0 ? "se" : "ne" });
    else G.point(m, y, { c: "warm", r: 7, label: lab, pos: y >= 0 ? "se" : "ne", pop: H(ctx, "mark") });
  },
  band(st) {
    const a = st.a, y = Math.log(st.mx) / Math.log(a);
    return { g: "y = logₐ x　⇔　x = aʸ（a を y 乗すると x）", n: `${logS(N(a, 1), N(st.mx, 2))} = <span class="hl">${N(y, 2)}</span>　<span class="mt">（${N(a, 1)}<sup>${N(y, 2)}</sup> = ${N(st.mx, 2)}）</span>` };
  },
  points: ["logₐ M は「<b>a を何乗すると M</b> になるか」", "どんな a でも <b>(1, 0)</b> を通る（a⁰ = 1）", "log MN = log M + log N、log M/N = log M − log N"],
  ex: {
    q: `${logS(2, 8)} の値は？`, st: { a: 2, mx: 1 },
    steps: [
      { t: "「2 を何乗すると 8 になる？」と考える", n: `${logS(2, 8)} = □ → 2<sup>□</sup> = 8` },
      { t: "2 × 2 × 2 = 8 なので 2³ = 8", n: "2³ = 8" },
      { t: "グラフの x = 8 のところを見ると、y = 3", st: { mx: 8 }, hl: "mark", n: `${logS(2, 8)} = 3` },
    ],
  },
  gen() {
    if (Math.random() < 0.65) {
      const [a, xs, xv, ans] = pick([[2, "8", 8, 3], [2, "16", 16, 4], [2, "4", 4, 2], [2, fr(1, 2), 0.5, -1], [2, fr(1, 4), 0.25, -2], [3, "9", 9, 2], [3, "27", 27, 3], [3, fr(1, 9), 1 / 9, -2], [10, "1000", 1000, 3], [10, "100", 100, 2], [5, "1", 1, 0], [5, "25", 25, 2]]);
      const c = chooseNum(ans, [-ans, ans + 1, ans === 0 ? 1 : ans * 2, ans - 1]);
      return { q: `${logS(a, xs)} の値は？`, ...c, hint: `${a} を何乗すると ${xs} になる？`, exp: `${a}<sup>${N(ans)}</sup> = ${xs} なので <b>${N(ans)}</b>`, st: { a: Math.min(a, 4), mx: a <= 4 ? clamp(xv, 0.25, 9) : 2 }, hl: "mark" };
    }
    const [q, ans, how, a] = pick([
      [`${logS(6, 2)} + ${logS(6, 18)}`, 2, `${logS(6, "(2 × 18)")} = ${logS(6, 36)} = 2`, 6],
      [`${logS(2, 12)} − ${logS(2, 3)}`, 2, `${logS(2, "(12 ÷ 3)")} = ${logS(2, 4)} = 2`, 2],
      [`${logS(3, 6)} + ${logS(3, "1.5")}`, 2, `${logS(3, "(6 × 1.5)")} = ${logS(3, 9)} = 2`, 3],
      [`${logS(10, 4)} + ${logS(10, 25)}`, 2, `${logS(10, 100)} = 2`, 10],
      [`${logS(2, 24)} − ${logS(2, 3)}`, 3, `${logS(2, 8)} = 3`, 2],
      [`3 ${logS(2, 2)}`, 3, `${logS(2, 2)} = 1 なので 3 × 1 = 3`, 2],
    ]);
    const c = chooseNum(ans, [ans + 1, ans - 1, ans * 2, 0]);
    return { q: `${q} を計算すると？`, ...c, hint: "たし算 → 中身をかける、ひき算 → 中身をわる", exp: `${how}<br>答え <b>${ans}</b>`, st: { a: Math.min(a, 4), mx: 4 }, hl: "mark" };
  },
});
function sub2(a) { const m = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", ".": ".", "−": "₋" }; return N(a, 1).split("").map(c => m[c] ?? c).join(""); }

/* ---------- 5. 微分と接線 ---------- */
const pv = (c, x) => c.reduce((s, k) => s * x + k, 0); // 係数（高い次数から）で値
const dv = c => { const n = c.length - 1; return c.slice(0, -1).map((k, i) => k * (n - i)); };
const FNS = { x2: [1, 0, 0], cub: [1, 0, -3, 0], q2: [-1, 4, 0] };
UNITS.push({
  id: "deriv", sub: "II", name: "微分と接線", small: "f′(a) は 接線の傾き",
  init: () => ({ fn: "x2", c: FNS.x2, t: 1, df: 0 }),
  view: () => ({ xmin: -4, xmax: 5, ymin: -4, ymax: 7 }),
  ctrls: [{ k: "fn", label: "", opts: [["x2", "x²"], ["cub", "x³ − 3x"], ["q2", "−x² + 4x"]], set: (st, v) => { st.c = FNS[v]; } }, { k: "df", label: "", opts: [[0, "グラフだけ"], [1, "f′(x) も見る"]] }],
  hint: "👆 点をドラッグ。接線の傾き（f′）が 0 になるのは 山 と 谷",
  draw(G, st, ctx) {
    const c = st.c, d = dv(c), t = st.t, y = pv(c, t), m = pv(d, t);
    if (st.df) { G.fn(x => pv(d, x), { c: "violet", w: 2, dash: "6 4" }); G.label(G.x1 - 0.3, pv(d, G.x1 - 0.3), "f′(x)", { pos: "w", c: "violet", size: 13 }); G.point(t, m, { c: "violet", r: 4.5 }); G.line(t, 0, t, m, { c: "violet", w: 1, dash: "3 4" }); }
    G.fn(x => pv(c, x), { c: "accent", w: 3.5 });
    if (!ctx.hl || H(ctx, "tan")) G.infLine(m, y - m * t, { c: "warm", w: em(ctx, "tan", 3.5, 2.5), pop: H(ctx, "tan") });
    if (!ctx.hl || H(ctx, "slope")) {
      G.line(t, y, t + 1, y, { c: "blue", w: 2.5, pop: H(ctx, "slope") }); G.line(t + 1, y, t + 1, y + m, { c: "blue", w: 2.5, pop: H(ctx, "slope") });
      G.label(t + 0.5, y, "1", { pos: "s", c: "blue", size: 13 }); G.label(t + 1, y + m / 2, "傾き " + N(m, 2), { pos: "e", c: "blue", size: em(ctx, "slope", 18, 14) });
    }
    const lab = `(${N(t, 2)}, ${N(y, 2)})`;
    if (ctx.touch) G.handle("t", t, y, x => { st.t = clamp(snap(x, 0.25), -3.5, 4.5); ctx.redraw(); }, { label: lab, pos: "nw" });
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
      { t: "微分する：(x²)′ = 2x", n: "f′(x) = 2x" },
      { t: "x = 1 での傾きは f′(1) = 2", hl: "slope", n: "f′(1) = 2" },
      { t: "接点は (1, f(1)) = (1, 1)", hl: "slope", n: "接点 (1, 1)" },
      { t: "y − 1 = 2(x − 1) を整理して <b>y = 2x − 1</b>", hl: "tan slope", n: "y = 2x − 1" },
    ],
  },
  gen() {
    const t = rint(0, 2);
    if (t === 0) {
      const c = [pick([1, 2, -1]), rint(-3, 3), rint(-4, 4), rint(-3, 3)], k = rint(-2, 2), d = dv(c), ans = pv(d, k);
      const ch = chooseNum(ans, [pv(c, k), pv(d, k) + c[3], pv([3 * c[0], c[1], c[2]], k), ans + 2]);
      return { q: `f(x) = ${P(...c)} のとき、f′(${N(k)}) は？`, ...ch, hint: "まず微分：(x³)′ = 3x²、(x²)′ = 2x、(x)′ = 1、定数 → 0", exp: `f′(x) = ${P(...d)}<br>f′(${N(k)}) = <b>${N(ans)}</b>`, st: { c, t: k, df: 0, view: { xmin: k - 4, xmax: k + 4, ymin: pv(c, k) - 6, ymax: pv(c, k) + 6, equal: false } }, hl: "tan slope" };
    }
    if (t === 1) {
      const c = [rint(1, 3), rint(-5, 5), rint(-5, 5)];
      if (c[1] === 0) c[1] = 2;
      const d = dv(c);
      const ch = choose(P(...d), [P(c[0], c[1]), P(2 * c[0], c[1] + c[2]), P(2 * c[0], -c[1]), P(c[0] * 2, c[1] * 2)]);
      return { q: `f(x) = ${P(...c)} を 微分すると？`, ...ch, hint: "(x²)′ = 2x、(x)′ = 1、数だけの項 → 0", exp: `(${N(c[0])}x²)′ = ${N(2 * c[0])}x、(${N(c[1])}x)′ = ${N(c[1])}、(${N(c[2])})′ = 0<br><b>f′(x) = ${P(...d)}</b>`, st: { c, t: 0, df: 1 }, hl: "tan" };
    }
    const b = rint(-3, 3), cc = rint(-2, 3), k = rint(-2, 2), m = 2 * k + b, y0 = k * k + b * k + cc;
    const ans = `y = ${P(m, y0 - m * k)}`;
    const ch = choose(ans, [`y = ${P(m, y0)}`, `y = ${P(y0, m)}`, `y = ${P(m, y0 + m * k)}`, `y = ${P(2 * k, y0 - 2 * k * k)}`], 4, () => { const mm = m + nz(-2, 2); return `y = ${P(mm, y0 - mm * k)}`; });
    return { q: `y = ${P(1, b, cc)} の、x = ${N(k)} での 接線 は？`, ...ch, hint: `傾き f′(${N(k)}) と 接点 (${N(k)}, f(${N(k)})) を出そう`, exp: `f′(x) = ${P(2, b)}、傾き f′(${N(k)}) = ${N(m)}、接点 ${pt(k, y0)}<br>y − ${pn(y0)} = ${N(m)}(x − ${pn(k)}) → <b>${ans}</b>`, st: { c: [1, b, cc], t: k, df: 0, view: { xmin: k - 4, xmax: k + 4, ymin: y0 - 6, ymax: y0 + 6, equal: false } }, hl: "tan slope" };
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
  init: () => ({ k: "a", c: KF.a, t: -2 }),
  view: () => ({ xmin: -3.5, xmax: 4, ymin: -4, ymax: 6 }),
  ctrls: [{ k: "k", label: "", opts: [["a", "x³ − 3x"], ["b", "x³ − 3x² + 4"], ["c", "−x³ + 3x + 1"], ["d", "x³"]], set: (st, v) => { st.c = KF[v]; } }],
  hint: "👆 点を動かすと、接線の傾きの ＋／− が わかる",
  draw(G, st, ctx) {
    const c = st.c, d = dv(c), f = x => pv(c, x);
    const ex = extremes(c), cuts = [G.x0, ...ex.map(e => e.x), G.x1];
    for (let i = 0; i < cuts.length - 1; i++) {
      const mid = (cuts[i] + cuts[i + 1]) / 2, up = pv(d, mid) > 0;
      G.fn(f, { c: up ? "blue" : "warm", w: 4, from: cuts[i], to: cuts[i + 1], op: !ctx.hl || H(ctx, "inc") ? 1 : 0.4 });
    }
    if (!ctx.hl || H(ctx, "ext")) ex.forEach(e => { G.line(e.x, 0, e.x, e.y, { c: "muted", dash: "4 5", w: 1.5 }); G.point(e.x, e.y, { c: e.max ? "warm" : "blue", r: 7, label: `${e.max ? "極大" : "極小"} ${N(e.y, 2)}`, pos: e.max ? "n" : "s", pop: H(ctx, "ext") }); });
    if (ctx.touch) {
      const t = st.t, y = f(t), m = pv(d, t);
      G.infLine(m, y - m * t, { c: m > 0.01 ? "blue" : m < -0.01 ? "warm" : "gold", w: 2, op: 0.8 });
      G.handle("t", t, y, x => { st.t = clamp(snap(x, 0.1), -3.2, 3.8); ctx.redraw(); }, { label: `傾き ${m > 0.01 ? "＋" : m < -0.01 ? "−" : "0"}`, pos: "e", c: "gold" });
    }
    G.textPx(14, G.h - 14, "青：ふえる ↗　赤：へる ↘", { size: 13, c: "muted", bold: false });
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
      { t: "微分する", n: "f′(x) = 3x² − 3 = 3(x + 1)(x − 1)" },
      { t: "f′(x) = 0 となるのは x = −1, 1", hl: "ext", n: "f′(x) = 0 → x = −1, 1" },
      { t: "f′ の符号：x < −1 で ＋、−1 < x < 1 で −、1 < x で ＋", hl: "inc", n: "＋ ↗　→　− ↘　→　＋ ↗" },
      { t: "＋ → − の x = −1 で <b>極大 2</b>、− → ＋ の x = 1 で <b>極小 −2</b>", hl: "inc ext", n: "極大値 2（x = −1）、極小値 −2（x = 1）" },
    ],
  },
  gen() {
    const p = pick([1, 1, 2]), d = rint(-3, 3), c = [1, 0, -3 * p * p, d];
    const mx = 2 * p ** 3 + d, mn = -2 * p ** 3 + d, wantMax = Math.random() < 0.5, ans = wantMax ? mx : mn;
    const st = { c, t: 0, view: { xmin: -p - 2.5, xmax: p + 2.5, ymin: mn - 3, ymax: mx + 3, equal: false } };
    if (Math.random() < 0.3) {
      const ch = choose(`x = ${N(wantMax ? -p : p)}`, [`x = ${N(wantMax ? p : -p)}`, `x = ${N(3 * p * p)}`, "x = 0"]);
      return { q: `f(x) = ${P(...c)} が <b>${wantMax ? "極大" : "極小"}</b> になる x は？`, ...ch, hint: "f′(x) = 0 の解をさがして、＋ → − が極大、− → ＋ が極小", exp: `f′(x) = 3x² − ${3 * p * p} = 3(x + ${p})(x − ${p})<br>f′ は ＋ → − → ＋ なので ${wantMax ? "極大" : "極小"}は <b>x = ${N(wantMax ? -p : p)}</b>`, st, hl: "inc ext" };
    }
    const ch = chooseNum(ans, [wantMax ? mn : mx, -ans, d, ans + 2]);
    return { q: `f(x) = ${P(...c)} の <b>${wantMax ? "極大値" : "極小値"}</b> は？`, ...ch, hint: `f′(x) = 3x² − ${3 * p * p}。f′(x) = 0 の x を f(x) に入れる`, exp: `f′(x) = 3(x + ${p})(x − ${p})、x = ${N(wantMax ? -p : p)} で ${wantMax ? "極大" : "極小"}<br>f(${N(wantMax ? -p : p)}) = <b>${N(ans)}</b>`, st, hl: "inc ext" };
  },
});

/* ---------- 7. 積分と面積 ---------- */
const IF = { x2: [1, 0, 0], p4: [-1, 0, 4], l: [2, 1], q: [1, -2, 0] };
const integ = c => { const n = c.length - 1; return [...c.map((k, i) => k / (n - i + 1)), 0]; }; // 原始関数（C = 0）
UNITS.push({
  id: "integ", sub: "II", name: "積分と面積", small: "∫ は 面積",
  init: () => ({ fn: "x2", c: IF.x2, a: 0, b: 2 }),
  view: () => ({ xmin: -3.5, xmax: 3.5, ymin: -2.5, ymax: 6.5 }),
  ctrls: [{ k: "fn", label: "", opts: [["x2", "x²"], ["p4", "−x² + 4"], ["l", "2x + 1"], ["q", "x² − 2x"]], set: (st, v) => { st.c = IF[v]; } }, { k: "a", label: "下 a", min: -3, max: 3, step: 0.5 }, { k: "b", label: "上 b", min: -3, max: 3, step: 0.5 }],
  fix(st, k) { if (st.a > st.b) { if (k === "a") st.b = st.a; else st.a = st.b; } },
  hint: "👆 x 軸の上の 2 つの点（a と b）を ドラッグ",
  draw(G, st, ctx) {
    const c = st.c, f = x => pv(c, x), { a, b } = st;
    if (!ctx.hl || H(ctx, "area")) {
      G.area(x => Math.max(0, f(x)), a, b, { c: "accent-soft", pop: H(ctx, "area") });
      G.area(x => Math.min(0, f(x)), a, b, { c: "warm-soft" });
    }
    G.fn(f, { c: "accent", w: 3.5 });
    G.line(a, 0, a, f(a), { c: "muted", dash: "4 4", w: 1.5 }); G.line(b, 0, b, f(b), { c: "muted", dash: "4 4", w: 1.5 });
    if (ctx.touch) {
      G.handle("a", a, 0, x => { st.a = clamp(snap(x, 0.5), -3, 3); this.fix(st, "a"); ctx.redraw(); }, { c: "gold", label: "a", pos: "sw" });
      G.handle("b", b, 0, x => { st.b = clamp(snap(x, 0.5), -3, 3); this.fix(st, "b"); ctx.redraw(); }, { c: "gold", label: "b", pos: "se" });
    } else { G.point(a, 0, { c: "gold", r: 5, label: N(a), pos: "sw" }); G.point(b, 0, { c: "gold", r: 5, label: N(b), pos: "se" }); }
    const Fc = integ(c), v = pv(Fc, b) - pv(Fc, a);
    G.label((a + b) / 2, Math.max(0.6, f((a + b) / 2) / 2), Ft(v), { pos: "c", c: "accent", size: em(ctx, "area", 22, 18) });
  },
  band(st) {
    const Fc = integ(st.c), v = pv(Fc, st.b) - pv(Fc, st.a);
    const FS = poly(Fc, ["x⁴", "x³", "x²", "x", ""].slice(-Fc.length));
    return { g: "∫ₐᵇ f(x) dx = [F(x)]ₐᵇ = F(b) − F(a)　（x 軸より下はマイナス）", n: `∫<sub>${N(st.a)}</sub><sup>${N(st.b)}</sup> (${P(...st.c)}) dx = [ ${FS} ] = <span class="hl">${F(v)}</span>` };
  },
  points: ["∫ₐᵇ f(x) dx は、グラフと x 軸の間の <b>面積</b>（下にあるとマイナス）", "xⁿ を積分すると <b>xⁿ⁺¹ / (n + 1)</b>", "計算は <b>F(b) − F(a)</b>（上の値 − 下の値）"],
  ex: {
    q: "∫₀³ x² dx を計算しよう", st: { fn: "x2", c: IF.x2, a: 0, b: 3, view: { xmin: -1.5, xmax: 4, ymin: -1, ymax: 10, equal: false } },
    steps: [
      { t: "x² を積分すると x³/3", n: `∫ x² dx = ${fr("x³", 3)}` },
      { t: "上の値 3 と 下の値 0 を入れて ひく", n: `[${fr("x³", 3)}]₀³ = ${fr(27, 3)} − 0` },
      { t: "= 9。色をぬった部分の面積が 9", hl: "area", n: "∫₀³ x² dx = 9" },
    ],
  },
  gen() {
    if (Math.random() < 0.55) {
      const [c, a, b] = pick([[[3, 0, 0], 0, 2], [[3, 0, 0], 1, 2], [[2, 0], 1, 3], [[2, 1], 0, 2], [[1, 0, 0], 0, 3], [[3, -2, 0], 0, 2], [[2, -1], 1, 3], [[6, 0, 0], 0, 1], [[3, 0, 0], -1, 1]]);
      const Fc = integ(c), v = pv(Fc, b) - pv(Fc, a);
      const ch = chooseNum(v, [pv(c, b) - pv(c, a), pv(Fc, b), v * 2, v + 1].filter(z => z !== v));
      return { q: `∫<sub>${N(a)}</sub><sup>${N(b)}</sup> (${P(...c)}) dx は？`, ...ch, hint: "xⁿ → xⁿ⁺¹ / (n + 1) で積分して、F(上) − F(下)", exp: `F(x) = ${poly(Fc, ["x³", "x²", "x", ""].slice(-Fc.length))}<br>F(${N(b)}) − F(${N(a)}) = ${N(pv(Fc, b))} − ${pn(pv(Fc, a))} = <b>${N(v)}</b>`, st: { c, a, b, view: { xmin: Math.min(a, 0) - 1.5, xmax: b + 1.5, ymin: -2, ymax: Math.max(...[a, b, (a + b) / 2].map(x => pv(c, x))) + 2, equal: false } }, hl: "area" };
    }
    const al = rint(-2, 1), be = al + rint(1, 3), w = be - al, area = w ** 3 / 6;
    const c = [-1, al + be, -al * be]; // y = −(x − α)(x − β)
    const ch = choose(F(area), [F(w ** 3 / 3), F(w ** 2 / 2), F(w ** 3 / 2), F(area + 1)]);
    return { q: `放物線 y = ${P(...c)} と x 軸 で囲まれた部分の面積は？`, ...ch, hint: `x 軸との交点は x = ${N(al)}, ${N(be)}。∫ で計算するか、公式 (β − α)³ ÷ 6`, exp: `交点 x = ${N(al)}, ${N(be)}<br>面積 = (${N(be)} − ${pn(al)})³ ÷ 6 = ${w ** 3} ÷ 6 = <b>${F(area)}</b>`, st: { c, a: al, b: be, view: { xmin: al - 1.5, xmax: be + 1.5, ymin: -2, ymax: (w / 2) ** 2 + 1.5, equal: false } }, hl: "area" };
  },
});
