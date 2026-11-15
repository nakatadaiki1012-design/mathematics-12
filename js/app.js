"use strict";
/* ===== アプリ本体：一覧・ステージ・説明カード =====
   授業の流れ：導入 → 例題 → 類題 → 演習 → 応用B → 応用C（1 画面ずつ） */
const byId = Object.fromEntries(UNITS.map(u => [u.id, u]));
const SUBS = [["I", "数学Ⅰ"], ["II", "数学Ⅱ"], ["play", "🎮 ゲーム"]];
const PLAYS = ["play", "guess", "drill"]; // ゲームの画面たち
const STAGES = [["intro", "導入"], ["ex", "例題"], ["rui", "類題"], ["ens", "演習"], ["B", "応用B"], ["C", "応用C"]];
const plot = new Plot($("#stage"));
const KEY = "m12lab-v1";
let store = { u: {}, best: {} };
try { store = Object.assign(store, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (_) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (_) {} };
const prog = id => { const p = store.u[id] || (store.u[id] = { ok: 0 }); p.done = p.done || {}; return p; };
const PASS = 3; // 演習で 3 問正解 → 合格
const stageDone = (id, k) => k === "ens" ? prog(id).ok >= PASS : !!prog(id).done[k];
const doneCount = id => STAGES.filter(([k]) => stageDone(id, k)).length;

const S = { sub: "I", uid: "expand", tab: "lesson", stg: 0, st: null, exI: 0, prob: null, tries: 0, done: false, hintOn: false, gotIt: false, wrong: -1, drill: null };
const cur = () => byId[S.uid];
const stgKey = () => STAGES[S.stg][0];
const clone = o => JSON.parse(JSON.stringify(o));

/* お知らせ（いくつか出たら 上に つみかさねる） */
function toast(msg) {
  const n = document.querySelectorAll(".toast").length;
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; t.style.bottom = (84 + n * 48) + "px";
  document.body.appendChild(t); setTimeout(() => t.remove(), 1900);
}

/* ---------- 上のメニュー ---------- */
function renderNav() {
  $("#secnav").innerHTML = SUBS.map(([k, l]) => `<button type="button" data-s="${k}" aria-current="${S.sub === k || (k === "play" && PLAYS.includes(S.sub))}">${l}</button>`).join("");
}
$("#secnav").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const s = b.dataset.s;
  if (s === "play") { location.hash = "play"; return; }
  const first = UNITS.find(u => u.sub === s);
  location.hash = (cur() && cur().sub === s && !PLAYS.includes(S.sub)) ? S.uid : first.id;
});

/* ---------- 左の一覧 ---------- */
function renderLib() {
  if (PLAYS.includes(S.sub)) { renderPlaySide(); return; }
  const list = UNITS.filter(u => u.sub === S.sub);
  $("#lib").innerHTML = `<h2>${S.sub === "I" ? "数学Ⅰ" : "数学Ⅱ"}</h2>` + list.map((u, i) => {
    const n = doneCount(u.id);
    const pg = n === STAGES.length ? `<span class="pg ok">✓ 完了</span>` : `<span class="pg">${n}/${STAGES.length}</span>`;
    return `<button type="button" class="item" data-u="${u.id}" aria-current="${u.id === S.uid}"><span class="num">${i + 1}</span><span class="nm"><b>${u.name}</b><small>${u.small}</small></span>${pg}</button>`;
  }).join("");
  const on = $("#lib .item[aria-current=true]");
  if (on && window.innerWidth <= 900) on.scrollIntoView({ block: "nearest", inline: "center" });
}
$("#lib").addEventListener("click", e => {
  const b = e.target.closest("[data-u]"); if (b) { location.hash = b.dataset.u; return; }
  const g = e.target.closest("[data-goto]"); if (g) { location.hash = g.dataset.goto; return; }
  const d = e.target.closest("[data-scope]"); if (d) { startDrill(d.dataset.scope); }
});

/* ---------- 単元をひらく ---------- */
function openUnit(id, sub) {
  const u = byId[id] || UNITS[0];
  S.sub = u.sub; S.uid = u.id; S.drill = null;
  S.st = u.init(); plot.touched = false;
  let i = STAGES.findIndex(([k]) => k === sub);
  if (i < 0) { i = STAGES.findIndex(([k]) => !stageDone(u.id, k)); if (i < 0) i = 0; } // 続きから
  S.stg = i;
  S.tab = sub === "touch" ? "touch" : "lesson";
  newMissions();
  enterStage();
  renderNav(); renderLib(); renderCard(); draw();
}
/* タブを切りかえても、解いている問題は そのまま */
function setTab(t) { S.tab = t; if (t === "lesson" && !S.prob && stgKey() !== "ex") enterStage(); renderCard(); draw(); }
function goStage(i) {
  S.stg = clamp(i, 0, STAGES.length - 1); S.tab = "lesson";
  enterStage(); renderCard(); draw();
}
/* 段階に入るとき：問題をつくる */
function enterStage() {
  S.exI = 0; S.tries = 0; S.done = false; S.hintOn = false; S.wrong = -1; S.firstWrong = -1; S.prob = null;
  if (S.tab !== "lesson") return;
  const k = stgKey(), u = cur();
  if (k === "ex") return;
  if (k === "rui" || k === "ens") { S.prob = u.gen(); return; }
  const L = LESSON[u.id][k], c = L.why ? chooseW(L.ok, L.ng.map((g, i) => [g, L.why[i]])) : choose(L.ok, L.ng);
  // q：右の説明用（場面つき）、qs：グラフの上の大きな文字（問いだけ）
  S.prob = Object.assign({}, L, { ch: c.ch, ans: c.ans, q: L.say ? `<span class="say">${L.say}</span>${L.q}` : L.q, qs: L.q });
}

/* ---------- ステージ（グラフ） ---------- */
function exState() {
  const u = cur(), st = clone(u.ex.st);
  for (let i = 0; i <= S.exI; i++) Object.assign(st, u.ex.steps[i].st || {});
  return st;
}
function draw() {
  let u = cur(), st, ctx = { touch: false, ex: false, hl: "", redraw: () => { draw(); syncCtrls(); checkMission(); } };
  let band = null, cover = null;
  $("#stageWrap").classList.toggle("game", S.sub === "guess" || S.sub === "play"); // スマホでは グラフを少し低く
  document.body.classList.toggle("in-guess", S.sub === "guess");
  if (S.sub === "guess" || S.sub === "play") { drawGuess(); return; }
  if (S.sub === "drill") {
    const d = S.drill;
    if (!d || d.i >= d.qs.length) { plot.begin({ xmin: -5, xmax: 5, ymin: -4, ymax: 4 }); setBand("", ""); setCover(null); $("#hint").textContent = ""; return; }
    const q = d.qs[d.i]; u = byId[q.uid];
    st = q.p.st; ctx.hl = q.p.hl || ""; cover = S.done ? null : q.p.q;
  } else if (S.tab === "touch") { st = S.st; ctx.touch = true; }
  else if (stgKey() === "ex") {
    st = exState(); const step = u.ex.steps[S.exI]; ctx.hl = step.hl || ""; ctx.ex = true;
    let n = null; for (let i = S.exI; i >= 0; i--) if (u.ex.steps[i].n) { n = u.ex.steps[i].n; break; }
    const full = Object.assign(u.init(), st);
    band = { g: u.band(full, ctx).g, n: n || u.band(full, ctx).n };
  } else {
    st = S.prob.st; ctx.hl = S.prob.hl || ""; cover = S.done ? null : (S.prob.qs || S.prob.q);
    if (S.prob.du) u = byId[S.prob.du];

  }
  const fullSt = ctx.touch ? st : Object.assign(u.init(), st);
  plot.begin(fullSt.view || u.view(fullSt, ctx));
  u.draw(plot, fullSt, ctx);
  // お題の 目標の印
  if (ctx.touch && S.mis && S.mis.cur && !S.mis.cleared) (S.mis.cur.marks || []).forEach(([x, y]) => { plot.point(x, y, { hollow: true, c: "gold", r: 12, top: true }); plot.label(x, y, "ここ", { pos: "sw", c: "gold", size: 13, top: true }); });
  if (S.sub !== "drill" && S.tab === "lesson" && S.prob && S.prob.band) band = { g: u.band(fullSt, ctx).g, n: S.prob.band }; // 文章題の文字（t, h, V など）で式を出す
  band = band || u.band(fullSt, ctx);
  setBand(band.g, cover ? "" : band.n); // 答える前は 答えが見えないように
  setCover(cover);
  $("#hint").textContent = ctx.touch ? (u.hint || "") : "";
}
function setBand(g, n) { $("#fgen").innerHTML = g ? `<span class="k">公式</span>${g}` : ""; $("#fnow").innerHTML = n || ""; }
function setCover(q) {
  const c = $("#qcover");
  $("#stageWrap").classList.toggle("covered", !!q);
  if (q) { c.hidden = false; $("#qbig").innerHTML = q; } else c.hidden = true;
}
new ResizeObserver(() => draw()).observe($("#stage"));

/* ---------- 説明カード ---------- */
function renderCard() {
  if (S.sub === "drill") { renderDrillCard(); return; }
  if (S.sub === "guess") { renderGuessCard(); return; }
  if (S.sub === "play") { renderPlayCard(); return; }
  const u = cur(), list = UNITS.filter(x => x.sub === u.sub);
  const pills = S.tab === "lesson" ? `<div class="stages">${STAGES.map(([k, l], i) => `<button type="button" data-stg="${i}" class="${stageDone(u.id, k) ? "done" : ""}" aria-current="${i === S.stg}">${l}</button>`).join("")}</div>` : "";
  $("#cardHead").innerHTML = `<div class="headrow"><div><div class="cat">${u.sub === "I" ? "数学Ⅰ" : "数学Ⅱ"} · ${list.indexOf(u) + 1}</div><h2>${u.name}</h2></div>
    <div class="seg" role="tablist">${[["lesson", "📖 授業"], ["touch", "👆 さわる"]].map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${S.tab === k}">${l}</button>`).join("")}</div></div>${pills}`;
  const B = $("#cardBody");
  let foot;
  if (S.tab === "touch") { B.innerHTML = touchHTML(u); foot = `<button type="button" class="btn pri wide" data-tab="lesson">📖 授業にもどる ▶</button>`; }
  else if (stgKey() === "ex") { B.innerHTML = exHTML(u); foot = exFoot(u); }
  else { B.innerHTML = qHTML(u); foot = qFoot(); }
  $("#cardFoot").innerHTML = foot;
  if (S.tab === "touch") syncCtrls();
  B.scrollTop = 0;
}
$("#cardHead").addEventListener("click", e => {
  const b = e.target.closest("[data-tab]"); if (b) { setTab(b.dataset.tab); return; }
  const s = e.target.closest("[data-stg]"); if (s) goStage(+s.dataset.stg);
});

/* さわる */
function touchHTML(u) {
  const ctrls = (u.ctrls || []).map((c, i) => {
    if (c.btn) return `<div class="chips"><button type="button" class="chip" data-act="${i}">${c.btn}</button></div>`;
    if (c.opts) return `<div class="chips">${c.label ? `<span class="lbl">${c.label}</span>` : ""}${c.opts.map(([v, l]) => `<button type="button" class="chip" data-ci="${i}" data-v="${v}">${l}</button>`).join("")}</div>`;
    return `<label class="sl"><span>${c.label}</span><input type="range" data-ci="${i}" min="${c.min}" max="${c.max}" step="${c.step}"><output data-o="${i}"></output></label>`;
  });
  const html = ctrls.join("").replace(/<\/div><div class="chips"><button type="button" class="chip" data-act/g, ' <button type="button" class="chip" data-act');
  return `<div class="mis" id="misBox">${missionHTML()}</div><div class="ctrl" id="ctrl">${html}</div><ul class="points">${u.points.map(p => `<li>${p}</li>`).join("")}</ul>`;
}
function syncCtrls() {
  const u = cur(); if (S.tab !== "touch" || S.sub === "drill") return;
  (u.ctrls || []).forEach((c, i) => {
    if (c.btn) return;
    if (c.opts) { document.querySelectorAll(`[data-ci="${i}"]`).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v) === String(S.st[c.k]))); return; }
    const inp = $(`input[data-ci="${i}"]`), out = $(`[data-o="${i}"]`);
    if (inp && document.activeElement !== inp) inp.value = S.st[c.k];
    if (out) out.textContent = c.fmt ? c.fmt(S.st[c.k]) : N(S.st[c.k]) + (c.unit || "");
  });
}
function ctrlSet(i, raw) {
  const u = cur(), c = u.ctrls[i];
  const v = typeof S.st[c.k] === "number" ? +raw : raw;
  S.st[c.k] = v;
  if (c.set) c.set(S.st, v);
  if (u.fix) u.fix(S.st, c.k);
  draw(); syncCtrls(); checkMission();
}

/* ---------- 「さわる」のお題 ---------- */
function makeMission(i) {
  const g = (MISSIONS[S.uid] || [])[i]; if (!g) return null;
  let m; for (let k = 0; k < 12; k++) { m = g(); if (!m.ok(S.st)) break; } // はじめから できている お題は 出さない
  return m;
}
function newMissions() { S.mis = { i: 0, cur: null, cleared: false, hint: false }; S.mis.cur = makeMission(0); }
function missionHTML() {
  const m = S.mis; if (!m || !m.cur) return "";
  const n = (MISSIONS[S.uid] || []).length, dots = Array.from({ length: n }, (_, k) => `<i class="${k < m.i || (k === m.i && m.cleared) ? "on" : ""}"></i>`).join("");
  if (m.cleared) {
    const last = m.i === n - 1;
    return `<div class="mis-h"><span>🎯 お題 ${m.i + 1} / ${n}</span><span class="dots">${dots}</span></div><div class="mis-t ok">⭕ クリア！ ${last ? "3 つ 全部 できた 🎉" : ""}</div>
      <button type="button" class="btn pri" id="misNext">${last ? "もう一回（数字が かわる）▶" : "次のお題 ▶"}</button>`;
  }
  return `<div class="mis-h"><span>🎯 お題 ${m.i + 1} / ${n}</span><span class="dots">${dots}</span></div><div class="mis-t">${m.cur.t}</div>
    ${m.hint ? `<div class="mis-hint">💡 ${m.cur.hint}</div>` : `<button type="button" class="hintbtn" id="misHint">💡 ヒント</button>`}`;
}
function updMission() { const b = $("#misBox"); if (b) b.innerHTML = missionHTML(); }
function checkMission() {
  const m = S.mis; if (S.tab !== "touch" || !m || !m.cur || m.cleared || !m.cur.ok(S.st)) return;
  m.cleared = true; rw(); store.stat.missions++;
  const last = m.i === (MISSIONS[S.uid] || []).length - 1;
  let c = 15; if (last && !store.mclear[S.uid]) { store.mclear[S.uid] = true; c += 30; }
  toast(`🎯 お題クリア！ 🪙 +${c}`); addCoins(c);
  updMission(); draw();
}
$("#cardBody").addEventListener("input", e => { const t = e.target; if (t.matches("input[type=range][data-ci]")) ctrlSet(+t.dataset.ci, t.value); });
function onClick(e) {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.ci != null) { ctrlSet(+t.dataset.ci, t.dataset.v); return; }
  if (t.dataset.act != null) { cur().ctrls[+t.dataset.act].act(S.st); draw(); syncCtrls(); checkMission(); return; }
  if (t.id === "misHint") { S.mis.hint = true; updMission(); return; }
  if (t.id === "misNext") { const n = MISSIONS[S.uid].length; if (S.mis.i + 1 >= n) newMissions(); else { S.mis.i++; S.mis.cleared = false; S.mis.hint = false; S.mis.cur = makeMission(S.mis.i); } updMission(); draw(); return; }
  if (t.id === "gmStart") { startGuess(); return; }
  if (t.dataset.gch != null) { guessAnswer(+t.dataset.gch); return; }
  if (t.dataset.tab) { setTab(t.dataset.tab); return; }
  if (t.dataset.ex) { exMove(+t.dataset.ex); return; }
  if (t.dataset.stg != null) { goStage(+t.dataset.stg); return; }
  if (t.dataset.ch != null) { answer(+t.dataset.ch, t); return; }
  if (t.id === "hintBtn") { S.hintOn = true; renderCard(); return; }
  if (t.id === "moreBtn") { enterStage(); renderCard(); draw(); return; }
  if (t.dataset.dch != null) { drillAnswer(+t.dataset.dch, t); return; }
  if (t.id === "dNext") { S.drill.i++; S.done = false; S.tries = 0; S.hintOn = false; S.wrong = -1; S.firstWrong = -1; renderCard(); draw(); return; }
  if (t.dataset.scope) { startDrill(t.dataset.scope); return; }
  if (t.dataset.goto) { location.hash = t.dataset.goto; }
}
$("#cardBody").addEventListener("click", onClick);
$("#cardFoot").addEventListener("click", onClick);

/* 例題 */
function exHTML(u) {
  const ex = u.ex;
  const steps = ex.steps.slice(0, S.exI + 1).map((s, i) => `<li class="${i === S.exI ? "now" : ""}"><span class="sn">${i + 1}</span><span>${s.t}</span></li>`).join("");
  return `<div class="qbox"><span class="tag">例題</span>${ex.q}</div><ol class="steps">${steps}</ol>`;
}
function exFoot(u) {
  const n = u.ex.steps.length, last = S.exI === n - 1;
  return `<button type="button" class="btn" ${S.exI ? 'data-ex="-1"' : `data-stg="${S.stg - 1}"`}>◀</button><span class="pdots">${S.exI + 1} / ${n}</span>
    ${last ? `<button type="button" class="btn pri" data-stg="${S.stg + 1}">類題へ ▶</button>` : `<button type="button" class="btn pri" data-ex="1">次へ ▶</button>`}`;
}
function exMove(d) {
  const u = cur(), n = u.ex.steps.length;
  if (S.exI + d >= n) { goStage(S.stg + 1); return; }
  if (S.exI + d < 0) { goStage(S.stg - 1); return; }
  S.exI += d;
  if (S.exI === n - 1 && !prog(u.id).done.ex) { prog(u.id).done.ex = true; save(); renderLib(); addCoins(5); toast("📖 例題 おわり 🪙 +5"); }
  renderCard(); draw();
}

/* 問題（導入・類題・演習・応用） */
const TAGS = { intro: "導入", rui: "類題", ens: "演習", B: "応用 B", C: "応用 C" };
const LEADS = { rui: "例題と 同じ考え方で 解いてみよう", ens: `${PASS} 問 正解で 合格。数字は 毎回かわる`, B: "生活の中の問題（文章題）", C: "ちょっと むずかしい問題。ヒントを使ってOK" };
function choicesHTML(p, attr) {
  return `<div class="choices ${p.one || p.ch.some(c => c.replace(/<[^>]+>/g, "").length > 12) ? "one" : ""}">${p.ch.map((c, i) => {
    let cls = "";
    if (S.done) cls = i === p.ans ? "ok" : (S.wrong === i ? "ng" : "dim");
    else if (S.tries && S.wrong === i) cls = "ng";
    return `<button type="button" class="cbtn ${cls}" ${attr}="${i}" ${S.done || (S.tries && S.wrong === i) ? "disabled" : ""}>${c}</button>`;
  }).join("")}</div>`;
}
/* 解説：exp が [[やること, 式], ...] なら 番号つきの 手順で見せる */
function expHTML(p) {
  if (!Array.isArray(p.exp)) return `<div class="exp-old">${p.exp}</div>`;
  const NUM = "①②③④⑤⑥⑦⑧";
  return `<ol class="xsteps">${p.exp.map(([t, m], i) => `<li><span class="xn">${NUM[i] || i + 1}</span><div><div class="xt">${t}</div>${m ? `<div class="xm">${m}</div>` : ""}</div></li>`).join("")}</ol>`;
}
/* えらんだ まちがいの 理由 */
const whyOf = (p, i) => (i >= 0 && p.why && p.why[p.ch[i]]) || "";
function feedbackHTML(p) {
  if (S.done) {
    const miss = S.firstWrong != null && S.firstWrong >= 0 ? S.firstWrong : -1, w = whyOf(p, miss);
    return `<div class="note ${S.gotIt ? "good" : "bad"} xp">
      <div class="ansbox"><span>${S.gotIt ? "⭕ せいかい！" : "答え"}</span><b>${p.ch[p.ans]}</b></div>
      ${w ? `<div class="why"><span class="wl">${S.gotIt ? "さっきの" : "あなたの"} ${p.ch[miss]} は？</span>${w}</div>` : ""}
      <div class="xh">解き方</div>${expHTML(p)}
      ${p.point ? `<div class="tip">💡 コツ：${p.point}</div>` : ""}
      <span class="see">図で たしかめよう</span></div>`;
  }
  if (S.tries) { const w = whyOf(p, S.firstWrong); return `<div class="note hint"><span class="ttl">おしい！ もう一度えらんでみよう</span>${w ? `<div class="why"><span class="wl">${p.ch[S.firstWrong]} は？</span>${w}</div>` : ""}💡 ${p.hint}</div>`; }
  if (S.hintOn) return `<div class="note hint">💡 ${p.hint}</div>`;
  return "";
}
function qHTML(u) {
  const k = stgKey(), p = S.prob;
  let top = "";
  if (k === "intro") top = `<div class="use"><b>どこで使う？</b>　${LESSON[u.id].use}</div>`;
  else if (k === "ens") { const n = Math.min(prog(u.id).ok, PASS); top = `<div class="meter">${Array.from({ length: PASS }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}<span>${n >= PASS ? "合格！ 続けて練習もできる" : LEADS.ens}</span></div>`; }
  else top = `<p class="lead">${p.lead || LEADS[k]}</p>`;
  return `${top}<div class="qbox"><span class="tag ${k === "B" || k === "C" ? "adv" : ""}">${TAGS[k]}</span>${p.q}</div>${S.done ? "" : choicesHTML(p, "data-ch")}${feedbackHTML(p)}`;
}
function qFoot() {
  const k = stgKey(), last = S.stg === STAGES.length - 1;
  const prev = `<button type="button" class="btn" data-stg="${S.stg - 1}" ${S.stg ? "" : "disabled"}>◀</button>`;
  let mid = "";
  if (!S.done && !S.hintOn && !S.tries) mid = `<button type="button" class="hintbtn" id="hintBtn">💡 ヒント</button>`;
  if (S.done && (k === "rui" || k === "ens")) mid = `<button type="button" class="btn" id="moreBtn">もう 1 問</button>`;
  const nextLabel = last ? "✓ おわり" : STAGES[S.stg + 1][1] + "へ ▶";
  const next = last ? (S.done ? `<button type="button" class="btn pri" data-goto="${nextUnit()}">次の単元へ ▶</button>` : `<button type="button" class="btn pri" disabled>${nextLabel}</button>`)
    : `<button type="button" class="btn ${S.done ? "pri" : ""}" data-stg="${S.stg + 1}">${nextLabel}</button>`;
  return `${prev}${mid}<span class="sp"></span>${next}`;
}
function nextUnit() { const i = UNITS.indexOf(cur()); return UNITS[(i + 1) % UNITS.length].id; }
function answer(i, btn) {
  const p = S.prob, u = cur(), k = stgKey();
  if (S.done) return;
  if (i === p.ans) {
    S.done = true; S.gotIt = true; S.wrong = -1;
    const pr = prog(u.id), r = onAnswer(!S.tries, true);
    const msg = `⭕ せいかい！ 🪙 +${r.coins}${r.streak >= 2 ? `　🔥 ${r.streak} 連続` : ""}`;
    if (k === "ens") { pr.ok++; if (pr.ok === PASS) { toast("🎉 合格！ 🪙 +50"); addCoins(50); } else toast(msg); } else toast(msg);
    if (k === "C" && !pr.done.C) { rw(); store.stat.cWin++; }
  } else if (!S.tries) { S.tries = 1; S.wrong = i; S.firstWrong = i; btn.classList.add("shake"); onAnswer(true, false); }
  else { S.done = true; S.gotIt = false; S.wrong = i; }
  if (S.done && S.gotIt && k !== "ens") prog(u.id).done[k] = true; // 答えを見ただけなら 完了にしない
  save(); checkBadges(); renderCard(); renderLib(); draw();
}

/* ---------- まとめ練習 ---------- */
const SCOPES = [["I", "数学Ⅰ"], ["II", "数学Ⅱ"], ["all", "ぜんぶ"]];
const DRILL_N = 10;
function startDrill(scope) {
  const pool = UNITS.filter(u => scope === "all" || u.sub === scope);
  const order = [];
  while (order.length < DRILL_N) order.push(...shuffle(pool));
  S.drill = { scope, qs: order.slice(0, DRILL_N).map(u => ({ uid: u.id, p: u.gen(), ok: null })), i: 0, score: 0 };
  S.done = false; S.tries = 0; S.hintOn = false; S.wrong = -1; S.firstWrong = -1;
  renderLib(); renderCard(); draw();
}
function renderDrillCard() {
  const d = S.drill;
  $("#cardHead").innerHTML = `<div class="cat">まとめ練習</div><h2>${d ? SCOPES.find(s => s[0] === d.scope)[1] + " " + DRILL_N + " 問" : "どこから出す？"}</h2>`;
  const B = $("#cardBody"), Ft = $("#cardFoot");
  Ft.innerHTML = "";
  if (!d) {
    B.innerHTML = `<p class="lead">いろいろな単元から ${DRILL_N} 問。まちがえても ヒントで もう一度えらべます。</p>
      <div style="display:flex;flex-direction:column;gap:8px">${SCOPES.map(([k, l]) => `<button type="button" class="btn ${k === "all" ? "pri" : ""} wide" data-scope="${k}">${l} から ▶</button>`).join("")}</div>`;
    return;
  }
  if (d.i >= d.qs.length) {
    const pts = d.score * 10, best = store.best[d.scope];
    if (best == null || pts > best) { store.best[d.scope] = pts; save(); }
    const wrong = d.qs.filter(q => !q.ok);
    B.innerHTML = `<div class="drill-top"><div class="big">${pts} <span style="font-size:20px">点</span></div><p>${d.score} / ${DRILL_N} 問 正解${pts >= 80 ? "　🎉 すばらしい！" : pts >= 50 ? "　👍 いい調子！" : "　📖 例題で ふくしゅう しよう"}</p></div>
      ${wrong.length ? `<p style="font-weight:700">もう一度 見ておきたい単元</p><ul class="wlist">${[...new Set(wrong.map(q => q.uid))].map(id => `<li><button type="button" data-goto="${id}/ex">📖 ${byId[id].name}</button></li>`).join("")}</ul>` : ""}`;
    Ft.innerHTML = `<button type="button" class="btn pri wide" data-scope="${d.scope}">もう一度 ▶</button>`;
    return;
  }
  const q = d.qs[d.i], p = q.p;
  B.innerHTML = `<div class="bar"><i style="width:${d.i / DRILL_N * 100}%"></i></div>
    <div class="meter"><span>${d.i + 1} / ${DRILL_N} 問　·　${byId[q.uid].name}</span><span class="pdots">正解 ${d.score}</span></div>
    <div class="qbox"><span class="tag">問題</span>${p.q}</div>${S.done ? "" : choicesHTML(p, "data-dch")}${feedbackHTML(p)}`;
  Ft.innerHTML = S.done ? `<span class="sp"></span><button type="button" class="btn pri" id="dNext">${d.i + 1 < DRILL_N ? "次の問題 ▶" : "結果を見る ▶"}</button>`
    : (S.hintOn || S.tries ? "" : `<button type="button" class="hintbtn" id="hintBtn">💡 ヒント</button>`);
}
function drillAnswer(i, btn) {
  const d = S.drill, q = d.qs[d.i];
  if (S.done) return;
  if (i === q.p.ans) { S.done = true; S.gotIt = true; S.wrong = -1; if (q.ok == null) { q.ok = !S.tries; if (!S.tries) d.score++; } const r = onAnswer(!S.tries, true); toast(`⭕ せいかい！ 🪙 +${r.coins}${r.streak >= 2 ? `　🔥 ${r.streak} 連続` : ""}`); }
  else if (!S.tries) { S.tries = 1; S.wrong = i; S.firstWrong = i; btn.classList.add("shake"); q.ok = false; onAnswer(true, false); }
  else { S.done = true; S.gotIt = false; S.wrong = i; q.ok = false; }
  renderCard(); draw();
}

/* ---------- ルーター（#quad、#quad/ex、#quad/touch、#drill） ---------- */
function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h !== "guess") stopGuess();
  if (h === "drill") { S.sub = "drill"; S.drill = null; renderNav(); renderLib(); renderCard(); draw(); return; }
  if (h === "guess" || h === "play") { S.sub = h; if (h === "guess" && (!S.gm || S.gm.phase !== "run")) S.gm = { phase: "ready" }; renderNav(); renderLib(); renderCard(); draw(); return; }
  const [id, sub] = h.split("/");
  openUnit(byId[id] ? id : UNITS[0].id, sub);
}
window.addEventListener("hashchange", route);

/* ---------- キーボード・全画面・文字・テーマ ---------- */
document.addEventListener("keydown", e => {
  if (e.target.matches("input, textarea")) return;
  if (S.sub === "guess" && /^[1-4]$/.test(e.key)) { guessAnswer(+e.key - 1); return; }
  if (!PLAYS.includes(S.sub) && S.tab === "lesson" && stgKey() === "ex") { if (e.key === "ArrowRight") exMove(1); if (e.key === "ArrowLeft") exMove(-1); }
  if (e.key === "Escape") $("#stageWrap").classList.remove("is-max");
});
$("#maxBtn").addEventListener("click", () => { $("#stageWrap").classList.toggle("is-max"); });
let fz = +(localStorage.getItem("m12-fz") || 0);
const applyFz = () => { document.body.classList.remove("fz1", "fz2"); if (fz) document.body.classList.add("fz" + fz); };
$("#fzBtn").addEventListener("click", () => { fz = (fz + 1) % 3; try { localStorage.setItem("m12-fz", fz); } catch (_) {} applyFz(); });
applyFz();
const th = localStorage.getItem("m12-theme"); if (th) document.documentElement.dataset.theme = th;
$("#themeBtn").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const nt = dark ? "light" : "dark"; document.documentElement.dataset.theme = nt;
  try { localStorage.setItem("m12-theme", nt); } catch (_) {}
  draw();
});

$("#coinBtn").addEventListener("click", () => { location.hash = "play"; });
renderCoin();
route();
