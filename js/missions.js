"use strict";
/* ===== 「さわる」のお題 =====
   1 単元 3 つ。どれも その単元のスライダー・点で 作れるようにしてある。
   お題 = { t:文, hint, ok(st):できたか, marks:[[x, y], ...]（目標の印） }
   数字は 毎回かわる（関数で つくる） */
const eqv = (a, b) => Math.abs(a - b) < 1e-6;
const MISSIONS = {
  expand: [
    () => { let a, b; do { a = rint(1, 5); b = rint(1, 5); } while (a === b); return { t: `式が <b>${P(1, a + b, a * b)}</b> になるように a・b を動かそう`, hint: `かけて ${a * b}、たして ${a + b} の 2 つの数`, ok: st => st.a + st.b === a + b && st.a * st.b === a * b }; },
    () => { const k = rint(2, 5); return { t: `全体を <b>正方形</b>にして、数の項（右下）を <b>${k * k}</b> にしよう`, hint: "正方形 → たて と よこ が同じ → a = b", ok: st => st.a === k && st.b === k }; },
    () => { const n = rint(5, 8); return { t: `x の係数を <b>${n}</b> にしたまま、数の項を <b>いちばん大きく</b> しよう`, hint: `a + b = ${n} のまま、a × b が大きくなる組をさがす`, ok: st => st.a + st.b === n && st.a * st.b === Math.floor(n / 2) * Math.ceil(n / 2) }; },
  ],
  quad: [
    () => { let p, q; do { p = rint(-3, 3); q = rint(-3, 3); } while (!p && !q); return { t: `頂点を <b>${pt(p, q)}</b> に動かそう`, hint: "光る点（頂点）をドラッグ。p で左右、q で上下", ok: st => eqv(st.p, p) && eqv(st.q, q), marks: [[p, q]] }; },
    () => { const p = rint(-2, 2), q = rint(1, 3); return { t: `<b>上に凸（∩）</b>にして、頂点を <b>${pt(p, q)}</b> にしよう`, hint: "a をマイナスにすると 上に凸", ok: st => st.a < 0 && eqv(st.p, p) && eqv(st.q, q), marks: [[p, q]] }; },
    () => { const a = pick([2, -1, 0.5, -2]), p = nz(-3, 3), q = nz(-3, 3); return { t: `<b>${vform(a, p, q)}</b> のグラフを つくろう`, hint: "a・p・q の 3 つを そろえる。(x − p) の符号に注意", ok: st => eqv(st.a, a) && eqv(st.p, p) && eqv(st.q, q), marks: [[p, q]] }; },
  ],
  sqc: [
    () => { const h = pick([-3, -2, -1, 1, 2, 3]), k = rint(Math.max(-5, -6 - h * h), Math.min(3, 8 - h * h)); return { t: `頂点を <b>${pt(h, k)}</b> にしよう`, hint: `軸 x = ${N(h)} → b = ${N(-2 * h)}。そのあと c で上下`, ok: st => eqv(-st.b / 2, h) && eqv(st.c - st.b * st.b / 4, k), marks: [[h, k]] }; },
    () => { const h = pick([-3, -2, -1, 1, 2, 3]), c = rint(-4, 6); return { t: `軸を <b>x = ${N(h)}</b>、y 切片を <b>${N(c)}</b> にしよう`, hint: "軸は x = −b/2、y 切片は c", ok: st => eqv(-st.b / 2, h) && st.c === c, marks: [[0, c]] }; },
    () => ({ t: "グラフが x 軸に <b>ちょうど接する</b> ようにしよう（b は 0 以外）", hint: "頂点の y 座標 c − (b/2)² を 0 に", ok: st => st.b !== 0 && eqv(st.c - st.b * st.b / 4, 0) }),
  ],
  minmax: [
    () => ({ t: "下に凸のまま、<b>軸が範囲の外</b> になるように 範囲を動かそう", hint: "黄色い範囲の はし（光る点）を ドラッグ", ok: st => st.a > 0 && (st.p < st.s || st.p > st.e) }),
    () => { const m = pick([-2, -1, 1]); return { t: `下に凸で、<b>最小値が ${N(m)}</b> になるように しよう`, hint: "軸が範囲の中なら 最小値 = q", ok: st => st.a > 0 && eqv(mmCalc(st).mn.y, m) }; },
    () => ({ t: "<b>上に凸（∩）</b>にして、最大値と最小値の差を <b>4 以上</b>にしよう", hint: "範囲を広げると 差が大きくなる", ok: st => { const r = mmCalc(st); return st.a < 0 && r.mx.y - r.mn.y >= 4 - 1e-9; } }),
  ],
  disc: [
    () => ({ t: "グラフを x 軸に <b>ちょうど接する</b> ように（共有点 1 個）しよう", hint: "D = b² − 4c = 0。たとえば b = 4 なら c = 4", ok: st => st.b * st.b - 4 * st.c === 0 }),
    () => ({ t: "x 軸との共有点を <b>0 個</b>にしよう", hint: "c を大きくして グラフを 上へ", ok: st => st.b * st.b - 4 * st.c < 0 }),
    () => { let r1, r2; do { r1 = rint(-4, 3); r2 = r1 + rint(1, 5); } while (Math.abs(r1 + r2) > 6 || r1 * r2 < -6 || r1 * r2 > 9); return { t: `x = <b>${N(r1)}</b> と <b>${N(r2)}</b> で x 軸と 交わるように しよう`, hint: `(x − ${pn(r1)})(x − ${pn(r2)}) → b = ${N(-(r1 + r2))}、c = ${N(r1 * r2)}`, ok: st => st.b === -(r1 + r2) && st.c === r1 * r2, marks: [[r1, 0], [r2, 0]] }; },
  ],
  ineq: [
    () => { const a = rint(-4, 1), b = a + rint(2, 4); return { t: `答えが <b>${N(a)} < x < ${N(b)}</b> になるように しよう`, hint: "内側 → < 0。α・β を 交点に", ok: st => st.al === a && st.be === b && st.sg === "<", marks: [[a, 0], [b, 0]] }; },
    () => { const a = rint(-3, 1), b = a + rint(2, 4); return { t: `答えが <b>x ≦ ${N(a)}, ${N(b)} ≦ x</b> になるように しよう`, hint: "外側 → > か ≧。= もふくむ → ≧", ok: st => st.al === a && st.be === b && st.sg === "≧", marks: [[a, 0], [b, 0]] }; },
    () => ({ t: "答えが <b>内側</b> で、はば（β − α）が <b>6</b> になるように しよう", hint: "< 0 か ≦ 0 にして、α と β を 6 はなす", ok: st => st.be - st.al === 6 && (st.sg === "<" || st.sg === "≦") }),
  ],
  trig: [
    () => { const t = pick([120, 135, 150]); return { t: `sin θ = <b>${tv(TRIG[t][0])}</b> で、<b>90° より大きい</b> θ に しよう`, hint: "y 座標が同じ点は 左右に 2 つ。左側をえらぶ", ok: st => st.t === t }; },
    () => { const t = pick([30, 45, 60, 120, 135, 150]); return { t: `cos θ = <b>${tv(TRIG[t][1])}</b> になる θ に しよう`, hint: "cos は x 座標。マイナスなら 左側", ok: st => st.t === t }; },
    () => { const t = pick([120, 135, 150]); return { t: `tan θ = <b>${tv(TRIG[t][2])}</b> になる θ に しよう`, hint: "tan がマイナス → 90° より大きい", ok: st => st.t === t }; },
  ],
  tri: [
    () => ({ t: "角 A を <b>90°（直角）</b>にしよう", hint: "頂点 B か C を動かす。cos 90° = 0 なので a² = b² + c² になる", ok: st => Math.abs(angAt(st.A, st.B, st.C) - 90) < 1 }),
    () => { const n = rint(4, 7); return { t: `辺 a（BC）の長さを <b>${n}</b> にしよう`, hint: "a は 角 A の向かいの辺。B か C を動かす", ok: st => Math.abs(dist(st.B, st.C) * st.k - n) < 0.08 }; },
    () => { const r = pick([4, 5]); return { t: `<b>正弦定理</b>にして、外接円の半径 R を <b>${r}</b> にしよう`, hint: "上の「正弦定理」をえらぶと 円が出る", ok: st => st.mode === "sin" && Math.abs(circum(st.A, st.B, st.C)[2] * st.k - r) < 0.1 }; },
  ],
  data: [
    () => { const m = rint(4, 8); return { t: `平均を <b>${m}</b> にしよう`, hint: `合計を ${m * 5} にする`, ok: st => eqv(stats(st.v).m, m) }; },
    () => ({ t: "分散を <b>0</b> にしよう", hint: "ちらばりが なくなる → 全員 同じ点", ok: st => stats(st.v).vr < 1e-9 }),
    () => { const m = rint(5, 7); return { t: `平均は <b>${m}</b> のまま、分散を <b>10 以上</b> にしよう`, hint: "平均から 遠くに 散らす（左右 同じくらい）", ok: st => { const s = stats(st.v); return eqv(s.m, m) && s.vr >= 10 - 1e-9; } }; },
  ],
  circle: [
    () => { const a = nz(-3, 3), b = nz(-3, 3), r = rint(1, 3); return { t: `中心 <b>${pt(a, b)}</b>、半径 <b>${r}</b> の円に しよう`, hint: "中心の点と 円の上の点を ドラッグ", ok: st => eqv(st.a, a) && eqv(st.b, b) && eqv(st.r, r), marks: [[a, b]] }; },
    () => ({ t: "x 軸に <b>ちょうど接する</b> 円に しよう", hint: "中心の高さ |b| = 半径 r", ok: st => eqv(Math.abs(st.b), st.r) }),
    () => ({ t: "原点 O を <b>通る</b> 円に しよう", hint: "中心と原点のきょり = 半径。たとえば 中心 (3, 4) なら 半径 5", ok: st => eqv(st.a * st.a + st.b * st.b, st.r * st.r), marks: [[0, 0]] }),
  ],
  trigfn: [
    () => { const B = pick([2, 0.5, 3]), [n, d] = periodOf(B); return { t: `周期を <b>${piH(n, d)}</b> にしよう`, hint: "周期 = 2π ÷ B", ok: st => st.B === B }; },
    () => { const A = pick([1.5, 2, 3]), B = pick([2, 0.5]), [n, d] = periodOf(B); return { t: `振幅 <b>${N(A)}</b>、周期 <b>${piH(n, d)}</b> の グラフに しよう`, hint: "振幅は A、周期は 2π ÷ B", ok: st => eqv(st.A, A) && st.B === B }; },
    () => ({ t: "<b>sin</b> を使って、y = cos x と <b>同じ形</b> を つくろう", hint: `sin のグラフを 左へ ${fr("π", 2)} ずらすと cos と重なる`, ok: st => st.f === "sin" && eqv(st.A, 1) && st.B === 1 && st.C === -3 }),
  ],
  exp: [
    () => { const [x, y, a] = pick([[2, 9, 3], [2, 4, 2], [3, 8, 2], [-1, 2, 0.5], [2, 16, 4], [-2, 4, 0.5]]); return { t: `グラフが <b>${pt(x, y)}</b> を通るように 底 a を えらぼう`, hint: `a を何回かけると ${y}？`, ok: st => eqv(st.a, a), marks: [[x, y]] }; },
    () => ({ t: "グラフを <b>右下がり</b> にしよう", hint: "0 < a < 1 にする", ok: st => st.a < 1 - 1e-9 }),
    () => ({ t: "a = 2 にして、点を動かして <b>y = 8</b> になる x を さがそう", hint: "2 を何回かけると 8？", ok: st => eqv(st.a, 2) && st.mx === 3, marks: [[3, 8]] }),
  ],
  log: [
    () => { const x = pick([4, 8]); return { t: `底を 2 にして、点 P を <b>${logS(2, x)}</b> の場所に 動かそう`, hint: "x = の場所に 点を動かす", ok: st => eqv(st.a, 2) && st.mx === x, marks: [[x, Math.log2(x)]] }; },
    () => { const [x, y, a] = pick([[9, 2, 3], [4, 1, 4], [3, 1, 3], [8, 3, 2]]); return { t: `グラフが <b>${pt(x, y)}</b> を通るように 底 a を えらぼう`, hint: `a を ${y} 乗すると ${x}`, ok: st => eqv(st.a, a), marks: [[x, y]] }; },
    () => ({ t: "<b>y = aˣ も見る</b> にして、2 つのグラフが y = x で <b>折り返し</b> になっているのを 見よう", hint: "下の「y = aˣ も見る」を おす", ok: st => st.mir === 1 }),
  ],
  deriv: [
    () => ({ t: "<b>x³ − 3x</b> で、接線が <b>水平</b>（傾き 0）になる点に 動かそう", hint: "山か 谷の てっぺん", ok: st => st.fn === "cub" && Math.abs(pv(dv(st.c), st.t)) < 1e-9 }),
    () => { const k = pick([-1, 1, 2]); return { t: `<b>x²</b> で、接線の傾きが <b>${N(2 * k)}</b> になる点に 動かそう`, hint: "f′(x) = 2x", ok: st => st.fn === "x2" && eqv(st.t, k) }; },
    () => ({ t: "<b>−x² + 4x</b> で <b>f′(x) も見る</b> にして、f′ が 0 になる点に 動かそう", hint: "f′(x) = −2x + 4", ok: st => st.fn === "q2" && st.df === 1 && eqv(st.t, 2) }),
  ],
  kyoku: [
    () => ({ t: "<b>x³ − 3x</b> の <b>極大</b> の点に 動かそう", hint: "↗ から ↘ に かわる 山", ok: st => st.k === "a" && Math.abs(st.t + 1) < 0.051 }),
    () => ({ t: "<b>x³ − 3x² + 4</b> の <b>極小</b> の点に 動かそう", hint: "↘ から ↗ に かわる 谷", ok: st => st.k === "b" && Math.abs(st.t - 2) < 0.051 }),
    () => ({ t: "<b>x³</b> で 傾きが 0 の点に 動かそう（でも 極値では ない！）", hint: "x = 0。前も後ろも ↗ なので 山でも谷でもない", ok: st => st.k === "d" && Math.abs(st.t) < 0.051 }),
  ],
  integ: [
    () => ({ t: "<b>x²</b> で、∫ の値（面積）を <b>9</b> にしよう", hint: "0 から 3 まで → 3³ ÷ 3 = 9", ok: st => st.fn === "x2" && eqv(pv(integ(st.c), st.b) - pv(integ(st.c), st.a), 9) }),
    () => ({ t: "<b>2x + 1</b> で、∫ の値を <b>0</b> にしよう（a と b は ちがう数）", hint: "x 軸より下（マイナス）と 上（プラス）を 同じにする", ok: st => st.fn === "l" && st.a < st.b && eqv(pv(integ(st.c), st.b) - pv(integ(st.c), st.a), 0) }),
    () => ({ t: "<b>x² − 2x</b> で、a = 0 のまま ∫ の値を <b>0</b> にしよう", hint: "下の部分と 上の部分が 打ち消しあう b をさがす", ok: st => st.fn === "q" && st.a === 0 && st.b > 0 && eqv(pv(integ(st.c), st.b) - pv(integ(st.c), st.a), 0) }),
  ],
};
