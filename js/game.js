"use strict";
/* ===== 🎮 ゲーム：グラフ当て（タイムアタック）と ゲームの画面 =====
   グラフを見て 式を 4 つから えらぶ。正解 +2 秒、まちがい −4 秒。時間がなくなるまで */
const GUESS = { T0: 45, MAX: 60, PLUS: 2, MINUS: 4 };
/* 問題をつくる（だんだん むずかしく） */
function guessQ(n) {
  const kinds = n < 4 ? ["quad", "quad", "circle"] : n < 9 ? ["quad", "circle", "exp", "trig"] : ["quad", "circle", "exp", "trig", "trig"];
  const k = pick(kinds);
  if (k === "quad") {
    const a = n < 4 ? pick([1, -1]) : pick([1, -1, 2, -2]), p = nz(-3, 3), q = rint(-3, 3);
    const c = choose(vform(a, p, q), [vform(a, -p, q), vform(a, p, -q), vform(-a, p, q), vform(a, -p, -q), vform(a, q, p)]);
    return { u: "quad", st: { a, p, q }, ...c, one: true };
  }
  if (k === "circle") {
    const a = nz(-3, 3), b = nz(-3, 3), r = rint(1, 3);
    const c = choose(circStr(a, b, r * r), [circStr(-a, -b, r * r), circStr(a, -b, r * r), circStr(-a, b, r * r), circStr(a, b, (r + 1) * (r + 1)), circStr(b, a, r * r)]);
    return { u: "circle", st: { a, b, r }, ...c, one: true };
  }
  if (k === "exp") {
    const L = { 2: "2", 3: "3", 0.5: "(½)", 4: "4" }, a = pick([2, 3, 0.5]);
    const c = choose(`y = ${L[a]}<sup>x</sup>`, shuffle([2, 3, 0.5, 4]).map(v => `y = ${L[v]}<sup>x</sup>`));
    return { u: "exp", st: { a, mark: null }, ...c };
  }
  const f = pick(["sin", "cos"]), A = pick([1, 2, 3]), B = pick([1, 2, 0.5]);
  const g = f === "sin" ? "cos" : "sin";
  const c = choose(trigStr(f, A, B, 0), [trigStr(g, A, B, 0), trigStr(f, A, B === 1 ? 2 : 1, 0), trigStr(f, A === 1 ? 2 : 1, B, 0), trigStr(f, B === 0.5 ? 3 : B * 2, A, 0)]);
  return { u: "trigfn", st: { f, A, B, C: 0 }, ...c, one: true };
}
let gmTimer = null;
function stopGuess() { if (gmTimer) { clearInterval(gmTimer); gmTimer = null; } }
function startGuess() {
  stopGuess();
  S.gm = { phase: "run", time: GUESS.T0, score: 0, combo: 0, maxCombo: 0, n: 0, q: guessQ(0), lock: false, pick: -1 };
  gmTimer = setInterval(() => {
    const g = S.gm; if (!g || g.phase !== "run") return stopGuess();
    g.time = Math.max(0, g.time - 0.1);
    const bar = $("#gmBar"), tm = $("#gmTime");
    if (bar) { bar.style.width = (g.time / GUESS.MAX * 100) + "%"; bar.classList.toggle("low", g.time < 8); }
    if (tm) tm.textContent = g.time.toFixed(1);
    if (g.time <= 0 && !g.lock) endGuess();
  }, 100);
  renderCard(); draw();
}
function guessAnswer(i) {
  const g = S.gm; if (!g || g.phase !== "run" || g.lock) return;
  g.lock = true; g.pick = i;
  if (i === g.q.ans) { g.score++; g.combo++; g.maxCombo = Math.max(g.maxCombo, g.combo); g.time = Math.min(GUESS.MAX, g.time + GUESS.PLUS); }
  else { g.combo = 0; g.time = Math.max(0, g.time - GUESS.MINUS); }
  renderCard(); draw();
  setTimeout(() => {
    if (!S.gm || S.gm !== g) return;
    if (g.time <= 0) { endGuess(); return; }
    g.n++; g.q = guessQ(g.n); g.lock = false; g.pick = -1; renderCard(); draw();
  }, i === g.q.ans ? 450 : 1300);
}
function endGuess() {
  const g = S.gm; stopGuess(); g.phase = "over";
  rw(); const prev = store.stat.guessBest; g.newBest = g.score > prev;
  store.stat.guessBest = Math.max(prev, g.score); g.coins = g.score * 3;
  if (g.coins) addCoins(g.coins); else { save(); checkBadges(); }
  renderCard(); draw();
}
/* 左の一覧（ゲームの画面） */
function renderPlaySide() {
  rw(); const on = S.sub;
  $("#lib").innerHTML = `<h2>ゲーム</h2>
    <button type="button" class="item" data-goto="guess" aria-current="${on === "guess"}"><span class="nm"><b>📈 グラフ当て</b><small>グラフを見て 式を当てる　ベスト ${store.stat.guessBest} 問</small></span></button>
    <button type="button" class="item" data-goto="drill" aria-current="${on === "drill"}"><span class="nm"><b>🎯 まとめ練習</b><small>いろいろな単元から 10 問</small></span></button>
    <button type="button" class="item" data-goto="play" aria-current="${on === "play"}"><span class="nm"><b>🏅 段位とバッジ</b><small>${rankOf(store.coins).name}　バッジ ${store.badges.length} / ${BADGES.length}</small></span></button>`;
}
/* 右のカード */
function renderGuessCard() {
  const g = S.gm;
  $("#cardHead").innerHTML = `<div class="cat">ゲーム</div><h2>📈 グラフ当て</h2>`;
  const B = $("#cardBody"), Ft = $("#cardFoot");
  Ft.innerHTML = "";
  if (!g || g.phase === "ready") {
    B.innerHTML = `<p>グラフを見て、その <b>式</b> を 4 つから えらぼう。</p>
      <ul class="points"><li>はじめは <b>${GUESS.T0} 秒</b>。正解で <b>+${GUESS.PLUS} 秒</b>、まちがえると <b>−${GUESS.MINUS} 秒</b></li><li>だんだん 円・指数・三角関数も 出てくる</li><li>目もりを 読むのが コツ（頂点・中心・(1, a) の点・山の高さ）</li></ul>
      <div class="drill-top"><div class="lead">ベスト ${rw().stat.guessBest} 問</div></div>`;
    Ft.innerHTML = `<button type="button" class="btn pri wide" id="gmStart">▶ スタート</button>`;
    return;
  }
  if (g.phase === "over") {
    B.innerHTML = `<div class="drill-top"><div class="lead">タイムアップ！</div><div class="big">${g.score} <span style="font-size:20px">問</span></div>
      <p>${g.newBest ? "🎉 ベスト更新！" : `ベスト ${store.stat.guessBest} 問`}　最高 ${g.maxCombo} 連続　🪙 +${g.coins}</p></div>`;
    Ft.innerHTML = `<button type="button" class="btn" data-goto="play">🏅 段位</button><span class="sp"></span><button type="button" class="btn pri" id="gmStart">もう一回 ▶</button>`;
    return;
  }
  const q = g.q;
  B.innerHTML = `<div class="gmtop"><span>⏱ <b id="gmTime">${g.time.toFixed(1)}</b> 秒</span><span>正解 <b>${g.score}</b>${g.combo >= 2 ? `　🔥 ${g.combo}` : ""}</span></div>
    <div class="bar gm"><i id="gmBar" style="width:${g.time / GUESS.MAX * 100}%"></i></div>
    <div class="qbox"><span class="tag">${g.n + 1} 問目</span>このグラフの式は？</div>
    <div class="choices ${q.one ? "one" : ""}">${q.ch.map((c, i) => { let cls = ""; if (g.lock) cls = i === q.ans ? "ok" : (i === g.pick ? "ng" : "dim"); return `<button type="button" class="cbtn ${cls}" data-gch="${i}" ${g.lock ? "disabled" : ""}><span class="kn">${i + 1}</span>${c}</button>`; }).join("")}</div>
    ${g.lock && g.pick !== q.ans ? `<div class="note bad">答えは <b>${q.ch[q.ans]}</b>（−${GUESS.MINUS} 秒）</div>` : ""}`;
}
function renderPlayCard() {
  $("#cardHead").innerHTML = `<div class="cat">ゲーム</div><h2>🏅 段位とバッジ</h2>`;
  $("#cardBody").innerHTML = rankHTML();
  $("#cardFoot").innerHTML = `<button type="button" class="btn pri wide" data-goto="guess">📈 グラフ当てで あそぶ ▶</button>`;
}
/* ステージ：問題のグラフ（式や 頂点の数は 見せない） */
function drawGuess() {
  const g = S.gm;
  if (!g || g.phase !== "run") {
    plot.begin({ xmin: -1, xmax: 4 * Math.PI, ymin: -2.5, ymax: 2.5, equal: false, xticks: [] });
    plot.fn(x => 2 * Math.sin(x), { c: "accent", w: 3, op: 0.35 }); plot.fn(x => Math.cos(2 * x), { c: "warm", w: 3, op: 0.3 });
    setBand("", g && g.phase === "over" ? `${g.score} 問 正解！` : ""); setCover(null); $("#hint").textContent = ""; return;
  }
  const u = byId[g.q.u], st = Object.assign(u.init(), g.q.st), ctx = { touch: false, ex: true, hl: "none", redraw: () => {} };
  plot.begin(u.view(st, ctx));
  u.draw(plot, st, ctx);
  setBand("", g.lock ? g.q.ch[g.q.ans] : "このグラフの式は？");
  setCover(null);
  $("#hint").textContent = "目もりを 読もう";
}
