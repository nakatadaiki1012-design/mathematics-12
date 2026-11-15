"use strict";
/* ===== がんばりが たまる しくみ：コイン・段位・バッジ・連続正解 =====
   記録は app.js の store（ブラウザの中）に入る */
const RANKS = [[0, "10級"], [50, "9級"], [120, "8級"], [200, "7級"], [300, "6級"], [420, "5級"], [560, "4級"], [720, "3級"], [900, "2級"], [1100, "1級"], [1400, "初段"], [1800, "二段"], [2300, "三段"], [3000, "名人"]];
function rankOf(c) {
  let i = 0; while (i + 1 < RANKS.length && c >= RANKS[i + 1][0]) i++;
  const next = RANKS[i + 1];
  return { i, name: RANKS[i][1], from: RANKS[i][0], to: next ? next[0] : null, nextName: next ? next[1] : null };
}
function rw() { // 記録の入れもの
  store.coins = store.coins || 0;
  store.stat = Object.assign({ correct: 0, streak: 0, bestStreak: 0, missions: 0, cWin: 0, guessBest: 0 }, store.stat || {});
  store.badges = store.badges || [];
  store.mclear = store.mclear || {};
  return store;
}
const unitsDone = sub => UNITS.filter(u => u.sub === sub).every(u => doneCount(u.id) === STAGES.length);
const BADGES = [
  { id: "first", icon: "🌱", name: "はじめの一歩", desc: "はじめて 正解した", test: s => s.stat.correct >= 1 },
  { id: "s3", icon: "🔥", name: "3 連続", desc: "1 回目で 3 問 続けて 正解", test: s => s.stat.bestStreak >= 3 },
  { id: "s10", icon: "🌋", name: "10 連続", desc: "1 回目で 10 問 続けて 正解", test: s => s.stat.bestStreak >= 10 },
  { id: "m1", icon: "🎯", name: "お題デビュー", desc: "「さわる」の お題を 1 つ クリア", test: s => s.stat.missions >= 1 },
  { id: "m10", icon: "🕹", name: "お題名人", desc: "お題を 10 個 クリア", test: s => s.stat.missions >= 10 },
  { id: "mall", icon: "🗺", name: "グラフ使い", desc: "1 つの単元の お題を 3 つ 全部クリア", test: s => Object.keys(s.mclear).length >= 1 },
  { id: "g10", icon: "📈", name: "グラフの目", desc: "グラフ当てで 10 問 正解", test: s => s.stat.guessBest >= 10 },
  { id: "g25", icon: "🚀", name: "グラフ博士", desc: "グラフ当てで 25 問 正解", test: s => s.stat.guessBest >= 25 },
  { id: "p3", icon: "🏅", name: "合格 3 つ", desc: "演習で 3 つの単元に 合格", test: () => UNITS.filter(u => prog(u.id).ok >= PASS).length >= 3 },
  { id: "c5", icon: "🧠", name: "応用C ハンター", desc: "応用C を 5 つの単元で 正解", test: s => s.stat.cWin >= 5 },
  { id: "all1", icon: "Ⅰ", name: "数学Ⅰ 制覇", desc: "数学Ⅰ の 全単元を 完了", test: () => unitsDone("I") },
  { id: "all2", icon: "Ⅱ", name: "数学Ⅱ 制覇", desc: "数学Ⅱ の 全単元を 完了", test: () => unitsDone("II") },
  { id: "d100", icon: "💯", name: "まとめ 100 点", desc: "まとめ練習で 100 点", test: s => Object.values(s.best || {}).some(v => v >= 100) },
];
/* コインを ふやす（段位が上がったら お知らせ） */
function addCoins(n) {
  rw(); const before = rankOf(store.coins).i;
  store.coins += n;
  const r = rankOf(store.coins);
  if (r.i > before) setTimeout(() => toast(`🎊 段位アップ！ ${r.name} になった`), 500);
  save(); renderCoin(); checkBadges();
}
/* 正解・不正解（1 回目で正解なら 連続が のびる） */
function onAnswer(firstTry, correct) {
  rw();
  if (correct) store.stat.correct++;
  if (correct && firstTry) { store.stat.streak++; store.stat.bestStreak = Math.max(store.stat.bestStreak, store.stat.streak); }
  else store.stat.streak = 0;
  const s = store.stat.streak, bonus = s >= 3 ? 5 : 0;
  const coins = correct ? (firstTry ? 10 : 5) + bonus : 0;
  if (coins) addCoins(coins); else save();
  return { coins, streak: s };
}
function checkBadges() {
  rw();
  for (const b of BADGES) if (!store.badges.includes(b.id) && b.test(store)) {
    store.badges.push(b.id); save();
    setTimeout(() => toast(`🏅 バッジ「${b.icon} ${b.name}」`), 900);
  }
}
function renderCoin() {
  rw(); const r = rankOf(store.coins);
  $("#coinBtn").innerHTML = `🪙 <b>${store.coins}</b><span class="rk">${r.name}</span>`;
}
/* 段位とバッジの カード（ゲームの画面で 出す） */
function rankHTML() {
  rw(); const r = rankOf(store.coins), pct = r.to ? (store.coins - r.from) / (r.to - r.from) * 100 : 100;
  return `<div class="rankbox"><div class="rk-now">${r.name}</div><div class="rk-c">🪙 ${store.coins}</div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="lead">${r.to ? `${r.nextName} まで あと ${r.to - store.coins} コイン` : "最高の段位！"}　·　最高 ${store.stat.bestStreak} 連続</div></div>
    <div class="badges">${BADGES.map(b => { const on = store.badges.includes(b.id); return `<div class="bdg ${on ? "on" : ""}" title="${b.desc}"><span class="bi">${on ? b.icon : "？"}</span><b>${b.name}</b><small>${b.desc}</small></div>`; }).join("")}</div>
    <p class="lead" style="margin-top:10px">コインの もらい方：正解 10（2 回目は 5）、3 連続から +5、お題 15、グラフ当ては 正解数 × 3、演習の合格 50</p>`;
}
