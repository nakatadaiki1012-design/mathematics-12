"use strict";
/* ===== 共通の小さな道具 ===== */
const $ = (s, r = document) => r.querySelector(s);
const MI = "−"; // 数学のマイナス
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const nz = (a, b) => { let v; do v = rint(a, b); while (v === 0); return v; };
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const snap = (v, s) => Math.round(v / s) * s;

/* 数を文字に：-3 → −3、2.50 → 2.5 */
function N(v, dig = 2) {
  if (Math.abs(v) < 1e-9) return "0";
  const r = Math.round(v * 10 ** dig) / 10 ** dig;
  return (r < 0 ? MI : "") + Math.abs(r);
}
/* 分数の HTML（たて書き） */
const fr = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
/* 小数 → 分数（分母 48 まで）。整数ならそのまま */
function toFrac(x) {
  for (let d = 1; d <= 48; d++) { const n = Math.round(x * d); if (Math.abs(x * d - n) < 1e-7) { const g = gcd(n, d); return [n / g, d / g]; } }
  return null;
}
/* 分数で HTML（整数・分数・小数） */
function F(x) {
  const f = toFrac(x);
  if (!f) return N(x);
  const [n, d] = f;
  if (d === 1) return N(n);
  return (n < 0 ? MI : "") + fr(Math.abs(n), d);
}
/* SVG 用（たて書きできないので 8/3 のように） */
function Ft(x) {
  const f = toFrac(x);
  if (!f) return N(x);
  const [n, d] = f;
  return d === 1 ? N(n) : (n < 0 ? MI : "") + Math.abs(n) + "/" + d;
}
/* 多項式の文字：coefs は 高い次数から。vars = ["x²","x",""] など */
function poly(coefs, vars) {
  let s = "", first = true;
  coefs.forEach((c, i) => {
    if (Math.abs(c) < 1e-12) return;
    const v = vars[i], a = Math.abs(c);
    let body;
    if (v && Math.abs(a - 1) < 1e-12) body = v;
    else body = (a === Math.round(a) ? String(a) : F(a)) + v;
    s += first ? (c < 0 ? MI : "") + body : (c < 0 ? ` ${MI} ` : " + ") + body;
    first = false;
  });
  return s || "0";
}
const XV = { 3: ["x³", "x²", "x", ""], 2: ["x²", "x", ""], 1: ["x", ""] };
/* x² + bx + c の形（高い次数から係数） */
const P = (...c) => poly(c, XV[c.length - 1] || ["x⁴", "x³", "x²", "x", ""]);
/* (x − p) の形。p = 0 なら x */
function sh(v, p) { if (Math.abs(p) < 1e-12) return v; return `(${v} ${p > 0 ? MI : "+"} ${N(Math.abs(p))})`; }
/* 符号つきの項：+ 3、− 3（0 なら空） */
function sg(q) { if (Math.abs(q) < 1e-12) return ""; return q > 0 ? ` + ${N(q)}` : ` ${MI} ${N(-q)}`; }
/* 係数 a をかっこの前に：1 → ""、−1 → "−" */
function co(a) { return a === 1 ? "" : a === -1 ? MI : N(a); }
/* かっこつきの数：−3 → (−3) */
const pn = v => v < 0 ? `(${N(v)})` : N(v);
/* 座標 (p, q) */
const pt = (x, y) => `(${N(x)}, ${N(y)})`;

/* 4 択をつくる：正解 + まちがいの候補（重なりは自動でのぞく） */
function choose(correct, cands, n = 4, fallback) {
  const out = [correct];
  for (const c of cands) { if (out.length >= n) break; if (c != null && !out.includes(c)) out.push(c); }
  let guard = 0;
  while (out.length < n && fallback && guard++ < 50) { const c = fallback(); if (!out.includes(c)) out.push(c); }
  const ch = shuffle(out);
  return { ch, ans: ch.indexOf(correct) };
}
/* 数の 4 択（近い数を まちがいに） */
function chooseNum(correct, cands, fmt = N) {
  const c = choose(fmt(correct), cands.map(fmt), 4, () => fmt(correct + nz(-4, 4)));
  return c;
}
