// LUMINA · app (ícones em icons.js, livros em books.js, conteúdo em data.js)

const photo = (key, w = 800, pos = "") => `<img class="photo" src="${photoUrl(key, w)}" alt="" loading="lazy" ${pos ? `style="object-position:${pos}"` : ""}>`;
const doodle = () => `<i class="doodle">${ic("doodle")}</i>`;

// ---------- Bíblia: livros, capítulos e texto ----------
const BOOK = {};
BOOKS.forEach(([id, name, n], i) => BOOK[id] = { id, name, n, i, nt: i >= 39 });
const split = key => { const p = key.split(" "); return [p[0], +p[1]]; };
const title = key => { const [b, c] = split(key); return (b === "PSA" ? "Salmo" : BOOK[b].name) + " " + c; };
function stepKey(key, dir) {
  const [b, c] = split(key), bk = BOOK[b];
  if (dir > 0) {
    if (c < bk.n) return `${b} ${c + 1}`;
    const nb = BOOKS[bk.i + 1]; return nb ? `${nb[0]} 1` : null;
  }
  if (c > 1) return `${b} ${c - 1}`;
  const pb = BOOKS[bk.i - 1]; return pb ? `${pb[0]} ${pb[2]}` : null;
}
const PHOTO_ROTATION = ["montes", "lago", "flores", "sol", "trilha", "mar", "colinas", "cafe", "maos", "capuz"];
function meta(key) {
  if (CURATED[key]) return CURATED[key];
  const [b, c] = split(key);
  return {
    photo: PHOTO_ROTATION[(BOOK[b].i * 7 + c) % PHOTO_ROTATION.length],
    script: title(key), generic: true,
    pergunta: "Qual versículo deste capítulo ficou com você?",
    reflexao: "Volta no texto e procura o versículo que te fez parar. Lê de novo, devagar, em voz baixa. Pensa em por que ele chamou sua atenção hoje, e não outro.",
    oracao: `Senhor, obrigado por falar comigo em ${title(key)}. Que essa palavra não fique só no papel. Me ajuda a viver o que eu li hoje. Amém.`
  };
}

const CACHE_KEY = "lumina-cache";
let stored = {};
try { stored = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch (e) {}
const CACHE = Object.assign({}, stored, PRELOAD);
const loading = {};
function saveCache(key, verses) {
  stored[key] = verses;
  const keys = Object.keys(stored);
  if (keys.length > 120) keys.slice(0, keys.length - 120).forEach(k => delete stored[k]);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(stored)); } catch (e) { stored = {}; }
}
async function loadChapter(key) {
  if (CACHE[key]) return CACHE[key];
  if (loading[key]) return loading[key];
  const [b, c] = split(key);
  loading[key] = fetch(`https://bible-api.com/data/almeida/${b}/${c}`)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => {
      const v = d.verses.map(x => x.text.replace(/\s+/g, " ").trim());
      CACHE[key] = v; saveCache(key, v); return v;
    })
    .finally(() => delete loading[key]);
  return loading[key];
}
const vText = (key, nums) => (CACHE[key] ? nums.map(n => CACHE[key][n - 1] || "").join(" ") : "");
const vRef = (key, nums) => {
  const s = [...nums].sort((a, b) => a - b);
  const cont = s.length > 1 && s[s.length - 1] - s[0] === s.length - 1;
  return `${title(key)}:${cont ? s[0] + "-" + s[s.length - 1] : s.join(",")}`;
};

// ---------- estado ----------
const SAVE_KEYS = ["installHidden", "highlights", "favorites", "notes", "prayers", "plans", "activeDays", "achievements", "dark", "onboarded", "pos", "lastRead", "readCh", "fontSize"];
const S = Object.assign({
  tab: "inicio", sub: null, pos: "PSA 23", lastRead: null, bibleTab: "leitura", sel: [], readCh: [], fontSize: 1,
  highlights: {}, favorites: [], notes: [], prayers: [], plans: {}, activeDays: [], achievements: [],
  dark: false, onboarded: false, notesTab: "todas", prayerTab: "hoje", plansFilter: "todos", journeyTab: "progresso"
}, JSON.parse(localStorage.getItem("lumina") || "{}"));
// dados de versões antigas do protótipo
if (!/^[1-3A-Z]{3} \d+$/.test(S.pos || "") || !BOOK[split(S.pos)[0]]) S.pos = "PSA 23";
if (S.lastRead && !BOOK[split(S.lastRead.key || "")[0]]) S.lastRead = null;
S.favorites = S.favorites.filter(f => f.key && f.text);
Object.keys(S.highlights).forEach(k => { if (!/^[1-3A-Z]{3} \d+$/.test(k)) delete S.highlights[k]; });
function save() {
  const o = {}; SAVE_KEYS.forEach(k => o[k] = S[k]);
  localStorage.setItem("lumina", JSON.stringify(o));
}

// ---------- utilidades ----------
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad = n => String(n).padStart(2, "0");
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dkey(new Date());
const MONTHS = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
const fmtDate = iso => { const d = new Date(iso); return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`; };
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const FONT_SIZES = [15.5, 16.5, 18, 20];
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2300);
}
function unlock(id) {
  if (S.achievements.includes(id)) return;
  S.achievements.push(id); save();
  const a = ACHIEVEMENTS.find(x => x.id === id);
  setTimeout(() => toast(`Nova conquista: ${a.title}`), 900);
}
function markActive() {
  const t = today();
  if (!S.activeDays.includes(t)) S.activeDays.push(t);
  const st = streak();
  if (st >= 3) unlock("streak3");
  if (st >= 7) unlock("streak7");
  save();
}
function streak() {
  let n = 0; const d = new Date();
  if (!S.activeDays.includes(dkey(d))) d.setDate(d.getDate() - 1);
  while (S.activeDays.includes(dkey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function daily() {
  const d = new Date(), doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  const [key, nums] = DAILY[doy % DAILY.length];
  return { key, nums };
}
const isFav = (key, nums) => S.favorites.some(f => f.key === key && f.nums.join() === nums.join());
function toggleFav(key, nums) {
  const i = S.favorites.findIndex(f => f.key === key && f.nums.join() === nums.join());
  if (i >= 0) { S.favorites.splice(i, 1); toast("Tirei dos favoritos"); }
  else { S.favorites.unshift({ key, nums, text: vText(key, nums), date: new Date().toISOString() }); toast("Guardado nos favoritos"); }
  save();
}

// referência digitada: "joão 3", "sl 23", "1 co 13:4", "filipenses 4:13"
const ALIAS = { sl: "PSA", salmo: "PSA", sal: "PSA", jo: "JHN", joao: "JHN", mt: "MAT", mc: "MRK", lc: "LUK", rm: "ROM", gn: "GEN", ex: "EXO", pv: "PRO", is: "ISA", jr: "JER", ap: "REV", fp: "PHP", ef: "EPH", hb: "HEB", tg: "JAS", at: "ACT", cl: "COL", gl: "GAL", ec: "ECC", ct: "SNG", dn: "DAN", js: "JOS", rt: "RUT", lm: "LAM", ez: "EZK", os: "HOS" };
function parseRef(q) {
  const m = norm(q).replace(/\s+/g, " ").match(/^([1-3]?\s?[a-z]+)\.?\s*(\d+)?(?:\s*[:.,]\s*(\d+))?$/);
  if (!m) return null;
  const name = m[1].replace(/\s/g, "");
  let id = ALIAS[name];
  if (!id) {
    const exact = BOOKS.find(([, n]) => norm(n).replace(/\s/g, "") === name);
    const pre = BOOKS.find(([, n]) => norm(n).replace(/\s/g, "").startsWith(name));
    id = (exact || (name.length >= 3 || /^\d/.test(name) ? pre : null) || [])[0];
  }
  if (!id) return null;
  const ch = Math.min(Math.max(+(m[2] || 1), 1), BOOK[id].n);
  return { key: `${id} ${ch}`, verse: m[3] ? +m[3] : null };
}

// ---------- instalar na tela inicial ----------
const isInstalled = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let installEvent = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvent = e; });
addEventListener("appinstalled", () => { installEvent = null; S.installHidden = true; save(); toast("LUMINA instalado na sua tela inicial"); render(); });

// ---------- telas ----------
function render() {
  const el = $("#screen");
  const views = { inicio: vInicio, biblia: vBiblia, planos: vPlanos, anotacoes: vAnotacoes, mais: vMais };
  const key = [S.tab, S.sub, S.bibleTab, S.pos].join("|");
  const keepScroll = key === render.last ? el.scrollTop : 0;
  el.innerHTML = `<div class="${key !== render.last ? "fade" : ""}">${(S.sub ? SUBS[S.sub] : views[S.tab])()}</div>`;
  el.scrollTop = keepScroll;
  render.last = key;
  document.querySelectorAll(".tabbar button").forEach(b => b.classList.toggle("active", b.dataset.tab === S.tab));
  document.body.classList.toggle("dark", S.dark);
  document.querySelector('meta[name="theme-color"]').content = S.dark ? "#11151E" : "#F6E9DC";
  document.querySelectorAll(".fab").forEach(f => f.remove());
  if (S.tab === "anotacoes" && !S.sub) {
    $(".phone").insertAdjacentHTML("beforeend", `<button class="fab" data-act="newNote" aria-label="Nova anotação">${ic("plus")}</button>`);
  }
  bindInputs();
  if (S.scrollTo) {
    const v = document.querySelector(`.verse[data-arg="${S.scrollTo}"]`);
    if (v) { v.scrollIntoView({ block: "center" }); v.classList.add("flash"); S.scrollTo = null; }
  }
}

function vInicio() {
  const h = new Date().getHours();
  const greet = h < 12 ? "Bom dia," : h < 18 ? "Boa tarde," : "Boa noite,";
  const line = h < 18 ? "que hoje seja um dia guiado por propósito." : "descanse hoje no cuidado de Deus.";
  const d = daily(), fav = isFav(d.key, d.nums);
  const active = Object.entries(S.plans).find(([id, p]) => p.done.length < PLANS.find(x => x.id === id).days);
  let plan = "";
  if (active) {
    const p = PLANS.find(x => x.id === active[0]), done = active[1].done.length;
    plan = `<div class="ask">Seu plano</div>
      <button class="list-item" data-act="openPlan" data-arg="${p.id}">
        <div class="thumb"><img src="${photoUrl(p.photo, 300)}" alt="" loading="lazy"></div>
        <div class="info"><div class="t">${p.title}</div><div class="s">Dia ${Math.min(done + 1, p.days)} de ${p.days}</div>
        <div class="bar"><div style="width:${done / p.days * 100}%"></div></div></div>
        <i class="ico go">${ic("arrow")}</i></button>`;
  }
  const lr = S.lastRead;
  const cont = lr ? `
    <button class="list-item continue" data-act="goRead" data-arg="${lr.key}">
      <div class="thumb sm"><img src="${photoUrl(meta(lr.key).photo, 200)}" alt="" loading="lazy"></div>
      <div class="info"><div class="s" style="margin:0">Continue lendo</div><div class="t">${title(lr.key)}</div></div>
      <i class="ico go">${ic("arrow")}</i></button>` : "";
  return `
  <div class="home-top">${photo(S.dark ? "lua" : "home", 900)}
    <div class="topbar" style="margin:0">
      <span style="width:38px"></span>
      <div class="logo"><i class="ico star">${ic("star")}</i><div class="word">LUMINA</div></div>
      <button class="icon-btn" data-act="sub" data-arg="jornada" aria-label="Minha jornada">${ic("user")}</button>
    </div>
    <div class="greet">
      <h1>${greet}</h1>
      <p>${line} <i class="ico" style="width:16px;height:16px;color:#D9B48C;vertical-align:-2px">${ic("heart", 1)}</i></p>
    </div>
    <form class="search" data-form="search">${ic("search")}<input name="q" placeholder="Buscar na Bíblia..." autocomplete="off" enterkeyhint="search"></form>
  </div>
  <div class="card verse-card">
    <div class="head"><i class="ico star">${ic("star")}</i>
      <div>Versículo do dia<br>${vRef(d.key, d.nums)}</div></div>
    <blockquote>“${esc(vText(d.key, d.nums))}”</blockquote>
    <div class="foot">
      <button class="icon-btn ${fav ? "on" : ""}" data-act="favDaily" aria-label="Favoritar">${ic("heart", fav)}</button>
      <button class="icon-btn" data-act="share" data-arg="${d.key}|${d.nums.join(",")}" aria-label="Compartilhar">${ic("share")}</button>
      <button class="icon-btn" data-act="goRead" data-arg="${d.key}|${d.nums[0]}" aria-label="Ler o capítulo">${ic("arrow")}</button>
    </div>
  </div>
  ${cont}
  ${!isInstalled() && !S.installHidden ? `<div class="card install-card">
    <img src="icons/icon-192.png" alt="">
    <div style="flex:1"><div class="t">Leve o LUMINA no celular</div><div class="s">Coloque na tela inicial e abra como um app.</div></div>
    <div class="col"><button class="chip on" data-act="install">Como?</button><button class="link" data-act="hideInstall">Agora não</button></div>
  </div>` : ""}
  <div class="ask">Como está seu coração hoje?</div>
  <div class="mood-grid">
    ${MOODS.slice(0, 6).map(m => `<button class="mood" data-act="mood" data-arg="${m.id}"><i class="ico">${ic(m.icon)}</i>${m.label}</button>`).join("")}
  </div>
  <div class="more-moods">${MOODS.slice(6).map(m => `<button data-act="mood" data-arg="${m.id}">${m.label}</button>`).join("")}</div>
  <button class="card speak" data-act="speak">
    <div class="bulb">${ic("bulb")}</div>
    <div style="flex:1"><div class="t">Deus, fala comigo hoje</div><div class="s">Um versículo, uma reflexão e uma oração para agora.</div></div>
    <i class="ico" style="width:18px;height:18px;color:var(--text2)">${ic("chev")}</i>
  </button>
  ${plan}`;
}

function vBiblia() {
  const key = S.pos, m = meta(key), verses = CACHE[key], hl = S.highlights[key] || [];
  const prev = stepKey(key, -1), next = stepKey(key, 1);
  const tabs = [["leitura", "Leitura"], ["reflexao", "Reflexão"], ["oracao", "Oração"]];
  const head = `
  <div class="topbar">
    <button class="chapter-btn" data-act="pickChapter">${title(key)} ${ic("down")}</button>
    <div class="right">
      <button class="icon-btn" data-act="fontSize" aria-label="Tamanho da letra">${ic("aa")}</button>
      <button class="version" data-act="aboutVersion">Almeida</button>
    </div>
  </div>
  <div class="pills">${tabs.map(([k, n]) => `<button class="pill ${S.bibleTab === k ? "active" : ""}" data-act="bibleTab" data-arg="${k}">${n}</button>`).join("")}</div>`;

  if (S.bibleTab === "reflexao") {
    return head + `
      <p class="prose">${esc(m.reflexao)}</p>
      <div class="question">${esc(m.pergunta)}</div>
      <textarea class="field" id="reflAnswer" rows="5" placeholder="Escreva aqui o que veio ao seu coração..."></textarea>
      <button class="btn" data-act="saveReflection">Guardar nas anotações</button>`;
  }
  if (S.bibleTab === "oracao") {
    return head + `
      <div class="reader-hero" style="height:200px">${photo(m.photo, 900)}<div class="hand">Vamos orar?</div></div>
      <p class="prose" style="margin-top:20px">${esc(m.oracao)}</p>
      <p class="muted" style="font-size:14.5px">Pode ler em voz alta, ou trocar as palavras pelas suas.</p>
      <button class="btn" data-act="prayed">Amém</button>`;
  }

  let body;
  if (!verses) {
    if (!loadChapter.failed?.[key]) {
      loadChapter(key).then(() => { if (S.pos === key) render(); prefetch(key); })
        .catch(() => { (loadChapter.failed = loadChapter.failed || {})[key] = 1; if (S.pos === key) render(); });
      body = `<div class="loading">${[1, 2, 3, 4, 5].map(() => `<div class="line"></div><div class="line short"></div>`).join("")}</div>`;
    } else {
      body = `<div class="empty">Não consegui abrir ${title(key)}.<br>Confere a internet e tenta de novo.<br><br><button class="chip" data-act="retry">Tentar de novo</button></div>`;
    }
  } else {
    body = `<div class="verses" id="verses" style="--fs:${FONT_SIZES[S.fontSize]}px">
      ${verses.map((v, i) => {
        const n = i + 1;
        return `<div class="verse ${hl.includes(n) ? "hl" : ""} ${S.sel.includes(n) ? "sel" : ""}" data-act="selVerse" data-arg="${n}"><sup>${n}</sup><span>${esc(v)}</span></div>`;
      }).join("")}
      </div>
      ${S.sel.length ? `<div class="verse-bar">
        <button class="chip" data-act="hlSel">${ic("pen")} Marcar</button>
        <button class="chip" data-act="favSel">${ic("heart")} Favoritar</button>
        <button class="chip" data-act="noteSel">${ic("edit")} Anotar</button>
        <button class="chip" data-act="shareSel">${ic("share")} Compartilhar</button>
        <button class="chip" data-act="copySel" aria-label="Copiar">${ic("copy")}</button>
      </div>` : ""}
      <button class="btn" data-act="finishChapter">${ic("check")} ${next ? `Terminei, ir para ${title(next)}` : "Terminei a Bíblia!"}</button>
      <div class="chapnav">
        ${prev ? `<button data-act="goRead" data-arg="${prev}">${ic("back")}<span><small>Anterior</small>${title(prev)}</span></button>` : "<span></span>"}
        ${next ? `<button data-act="goRead" data-arg="${next}" class="r"><span><small>Próximo</small>${title(next)}</span>${ic("chev")}</button>` : "<span></span>"}
      </div>
      <p class="tip">Dica: deslize para o lado para mudar de capítulo.</p>
      <button class="card reflect" data-act="bibleTab" data-arg="reflexao">
        <div class="bulb">${ic("bulb")}</div>
        <div style="flex:1"><div class="t">Reflexão do dia</div><div class="s">${esc(m.pergunta)}</div></div>
        <i class="ico chev">${ic("chev")}</i>
      </button>`;
  }
  return head + `<div class="reader-hero">${photo(m.photo, 900)}<div class="hand">${m.script}</div>${doodle()}</div>` + body;
}
function prefetch(key) {
  const n = stepKey(key, 1);
  if (n && !CACHE[n]) setTimeout(() => loadChapter(n).catch(() => {}), 1200);
}

function vPlanos() {
  const f = S.plansFilter;
  const filters = [["todos", "Todos"], ["populares", "Populares"], ["desafios", "Desafios"], ["novos", "Novos"]];
  if (Object.keys(S.plans).length) filters.push(["meus", "Meus"]);
  const list = PLANS.filter(p => f === "todos" || (f === "meus" ? S.plans[p.id] : p.tags.includes(f)));
  return `
  <div class="topbar">
    <button class="icon-btn" data-act="tab" data-arg="inicio" aria-label="Voltar">${ic("back")}</button>
    <div class="right">
      <button class="icon-btn" data-act="plansFilter" data-arg="meus" aria-label="Meus planos">${ic("bookmark")}</button>
      <button class="icon-btn" data-act="sub" data-arg="jornada" aria-label="Minha jornada">${ic("calendar")}</button>
      <button class="icon-btn" data-act="shareApp" aria-label="Compartilhar">${ic("share")}</button>
    </div>
  </div>
  <h1 style="margin-bottom:14px">Planos de Leitura</h1>
  <div class="pills soft">${filters.map(([k, n]) => `<button class="pill ${f === k ? "active" : ""}" data-act="plansFilter" data-arg="${k}">${n}</button>`).join("")}</div>
  ${list.length ? list.map(p => {
    const st = S.plans[p.id];
    return `<button class="list-item" data-act="openPlan" data-arg="${p.id}">
      <div class="thumb"><img src="${photoUrl(p.photo, 300)}" alt="" loading="lazy"></div>
      <div class="info"><div class="t">${p.title}</div><div class="s">${p.sub}</div>
      ${st ? `<div class="bar"><div style="width:${st.done.length / p.days * 100}%"></div></div>` : ""}</div>
      <i class="ico go">${ic("arrow")}</i></button>`;
  }).join("") : `<div class="empty">Você ainda não começou nenhum plano.</div>`}`;
}

function vAnotacoes() {
  const t = S.notesTab;
  let list = [...S.notes];
  if (t === "favoritos") list = list.filter(n => n.fav);
  if (t === "recentes") list = list.filter(n => Date.now() - new Date(n.date) < 7 * 864e5);
  list.sort((a, b) => new Date(b.date) - new Date(a.date));
  const empty = { todas: "Ainda não tem nada aqui.<br>Quando um versículo mexer com você, anota.", favoritos: "Nenhuma anotação marcada com coração.", recentes: "Nada escrito nos últimos 7 dias." }[t];
  return `
  <div class="topbar"><h1>Minhas anotações</h1>
    <button class="icon-btn" data-act="notesTab" data-arg="recentes" aria-label="Recentes">${ic("history")}</button></div>
  <div class="pills soft">${[["todas", "Todas"], ["favoritos", "Favoritos"], ["recentes", "Recentes"]].map(([k, n]) =>
    `<button class="pill ${t === k ? "active" : ""}" data-act="notesTab" data-arg="${k}">${n}</button>`).join("")}</div>
  ${list.length ? list.map(n => `<button class="note" data-act="editNote" data-arg="${n.id}">
      <div class="topbar" style="margin:0;min-height:0"><div class="t">${esc(n.title || "Sem título")}</div>${n.fav ? `<i class="ico" style="width:16px;height:16px;color:var(--accent)">${ic("heart", 1)}</i>` : ""}</div>
      <div class="d">${fmtDate(n.date)}</div><div class="b">${esc(n.body).slice(0, 180)}</div></button>`).join("")
    : `<div class="empty">${empty}</div>`}`;
}

function vMais() {
  return `
  <div class="topbar"><h1>Mais</h1></div>
  <button class="menu-item" data-act="sub" data-arg="oracao"><i class="ico">${ic("pray")}</i>Meu momento de oração<i class="ico go">${ic("chev")}</i></button>
  <button class="menu-item" data-act="sub" data-arg="favoritos"><i class="ico">${ic("heart")}</i>Meus favoritos<i class="ico go">${ic("chev")}</i></button>
  <button class="menu-item" data-act="sub" data-arg="jornada"><i class="ico">${ic("trophy")}</i>Minha jornada<i class="ico go">${ic("chev")}</i></button>
  <button class="menu-item" data-act="toggleDark"><i class="ico">${ic("moon")}</i>Modo noturno<span class="switch ${S.dark ? "on" : ""}"></span></button>
  ${isInstalled() ? "" : `<button class="menu-item" data-act="install"><i class="ico">${ic("plus")}</i>Colocar na tela inicial<i class="ico go">${ic("chev")}</i></button>`}
  <button class="menu-item" data-act="shareApp"><i class="ico">${ic("share")}</i>Convidar alguém<i class="ico go">${ic("chev")}</i></button>
  <button class="menu-item" data-act="about"><i class="ico">${ic("info")}</i>Sobre o LUMINA<i class="ico go">${ic("chev")}</i></button>`;
}

const back = label => `<div class="topbar" style="justify-content:flex-start"><button class="icon-btn" data-act="back" aria-label="Voltar" style="margin-left:-10px">${ic("back")}</button><h1 class="subhead">${label}</h1></div>`;

const SUBS = {
  oracao() {
    const t = S.prayerTab, names = { hoje: "Hoje", pedidos: "Pedidos", agradecimentos: "Agradecimentos" };
    const ph = { hoje: "Escreva sua oração...", pedidos: "O que você quer pedir a Deus?", agradecimentos: "Pelo que você agradece hoje?" };
    const list = S.prayers.filter(p => p.type === t).sort((a, b) => new Date(b.date) - new Date(a.date));
    return `${back("Meu momento de oração")}
    <div class="pills soft">${Object.keys(names).map(k => `<button class="pill ${t === k ? "active" : ""}" data-act="prayerTab" data-arg="${k}">${names[k]}</button>`).join("")}</div>
    <textarea class="field" id="prayerText" rows="5" placeholder="${ph[t]}"></textarea>
    <button class="btn" data-act="savePrayer">Guardar</button>
    ${list.map(p => `
      <div class="note" style="margin-top:12px"><div class="topbar" style="margin:0;min-height:0"><div class="d" style="margin:0">${fmtDate(p.date)}</div>
        <div style="display:flex;gap:6px">
        ${t === "pedidos" ? `<button class="chip ${p.answered ? "on" : ""}" data-act="answered" data-arg="${p.id}">${p.answered ? "Respondida" : "Foi respondida?"}</button>` : ""}
        <button class="chip" data-act="delPrayer" data-arg="${p.id}" aria-label="Apagar">${ic("trash")}</button></div></div>
        <div class="b" style="margin-top:8px">${esc(p.text)}</div></div>`).join("")}
    <div class="prayer-photo">${photo("cafe", 900)}<div class="hand">Deus,<br>eu confio<br>em Ti.</div>${doodle()}</div>`;
  },
  favoritos() {
    return `${back("Meus favoritos")}
    ${S.favorites.length ? S.favorites.map((f, i) => `
      <div class="list-item">
        <button class="thumb sm" data-act="share" data-arg="${f.key}|${f.nums.join(",")}"><img src="${photoUrl(meta(f.key).photo, 200)}" alt="" loading="lazy"></button>
        <button class="info" style="text-align:left" data-act="goRead" data-arg="${f.key}|${f.nums[0]}"><div class="t" style="font-family:var(--sans);font-size:16px;font-weight:500">${vRef(f.key, f.nums)}</div>
        <div class="s">“${esc(f.text.slice(0, 64))}${f.text.length > 64 ? "..." : ""}”</div></button>
        <button class="icon-btn" style="color:var(--accent)" data-act="unfav" data-arg="${i}" aria-label="Tirar dos favoritos">${ic("heart", 1)}</button>
      </div>`).join("")
      : `<div class="empty">Toque no coração de um versículo<br>e ele aparece aqui.</div>`}`;
  },
  jornada() {
    const t = S.journeyTab;
    const last30 = S.activeDays.filter(d => (new Date() - new Date(d + "T12:00")) / 864e5 < 30).length;
    const r = 62, c = 2 * Math.PI * r;
    const now = new Date(), dow = (now.getDay() + 6) % 7, monday = new Date(now); monday.setDate(now.getDate() - dow);
    const labels = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
    const week = labels.map((l, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const on = S.activeDays.includes(dkey(d));
      return `<div class="day"><div class="dot ${on ? "on" : ""}">${on ? ic("check") : ""}</div>${l}</div>`;
    }).join("");
    const done = PLANS.filter(p => S.plans[p.id] && S.plans[p.id].done.length >= p.days);
    const head = `${back("Minha jornada")}
      <div class="seg">${[["progresso", "Progresso"], ["conquistas", "Conquistas"]].map(([k, n]) =>
        `<button class="${t === k ? "active" : ""}" data-act="journeyTab" data-arg="${k}">${n}</button>`).join("")}</div>`;
    if (t === "conquistas") {
      return head + `<div class="card">${ACHIEVEMENTS.map(a => {
        const got = S.achievements.includes(a.id);
        return `<div class="badge ${got ? "" : "locked"}"><div class="b-ico">${ic(got ? "star" : "trophy")}</div>
          <div><div class="t">${a.title}</div><div class="s">${a.desc}</div></div></div>`;
      }).join("")}</div>
      <p class="muted" style="text-align:center;font-size:14.5px">Aqui ninguém compete com ninguém.</p>`;
    }
    const total = BOOKS.reduce((a, b) => a + b[2], 0);
    return head + `
      <div class="ring-wrap"><div class="ring">
        <svg width="150" height="150"><circle cx="75" cy="75" r="${r}" stroke="#F1DFC9" stroke-width="7" fill="none"/>
        <circle cx="75" cy="75" r="${r}" stroke="var(--accent)" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - last30 / 30)}" style="transition:stroke-dashoffset .8s"/></svg>
        <div class="lbl"><b>${last30}<span>/30</span></b><span class="muted" style="font-size:14px">dias</span></div>
      </div>
      <p class="ring-quote">“Disciplina hoje, colheita amanhã.” <i class="ico" style="width:14px;height:14px;color:#D9B48C;vertical-align:-2px">${ic("heart", 1)}</i></p></div>
      <div class="sub-title">Minha sequência <span class="muted" style="font-family:var(--sans);font-size:14px;margin-left:6px">${streak()} ${streak() === 1 ? "dia seguido" : "dias seguidos"}</span></div>
      <div class="week">${week}</div>
      <div class="sub-title" style="margin-top:26px">Capítulos lidos <span class="muted" style="font-family:var(--sans);font-size:14px;margin-left:6px">${S.readCh.length} de ${total}</span></div>
      <div class="bar" style="height:5px"><div style="width:${Math.max(S.readCh.length / total * 100, S.readCh.length ? 1 : 0)}%"></div></div>
      <div class="sub-title" style="margin-top:26px">Desafios concluídos</div>
      ${done.length ? done.map(p => `<div class="list-item"><div class="thumb sm"><img src="${photoUrl(p.photo, 200)}" alt=""></div>
        <div class="info"><div class="t" style="font-family:var(--sans);font-size:16px;font-weight:500">${p.title}</div><div class="s">Concluído${S.plans[p.id].end ? " · " + fmtDate(S.plans[p.id].end) : ""}</div></div></div>`).join("")
        : `<p class="muted" style="font-size:15px">Quando você terminar um plano, ele aparece aqui.</p>`}`;
  }
};

// ---------- folhas ----------
function openSheet(html) {
  const s = $("#sheet");
  s.innerHTML = `<div class="panel"><div class="grab"></div>${html}</div>`;
  s.classList.remove("hidden");
  bindInputs();
}
function closeSheet() { $("#sheet").classList.add("hidden"); $("#sheet").innerHTML = ""; }

function moodSheet(m, isSpeak) {
  const mt = meta(m.ref);
  openSheet(`
    <div class="sheet-hero">${photo(mt.photo, 800)}<div class="hand">${mt.script}</div></div>
    <div class="label" style="margin-top:4px">${isSpeak ? "Para você, agora" : m.label}</div>
    <p class="msg">${esc(m.msg)}</p>
    <div class="label">${vRef(m.ref, m.v)}</div>
    <p class="prose" style="margin:4px 0">“${esc(vText(m.ref, m.v))}”</p>
    <div class="label">Para pensar</div><p class="prose" style="font-size:16px;margin:4px 0">${esc(mt.reflexao)}</p>
    <div class="label">Uma oração</div><p class="prose" style="font-size:16px;margin:4px 0">${esc(mt.oracao)}</p>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:20px 0 4px">
      <button class="chip ${isFav(m.ref, m.v) ? "on" : ""}" data-act="favThis" data-arg="${m.ref}|${m.v.join(",")}">${ic("heart")} Guardar</button>
      <button class="chip" data-act="share" data-arg="${m.ref}|${m.v.join(",")}">${ic("share")} Compartilhar</button>
      <button class="chip" data-act="noteFrom" data-arg="${m.ref}|${m.v.join(",")}">${ic("edit")} Anotar</button>
    </div>
    <button class="btn" data-act="goRead" data-arg="${m.ref}|${m.v[0]}">Ler o capítulo inteiro</button>`);
  markActive();
}

function noteSheet(note, preset) {
  const n = note || { id: "", title: preset?.title || "", body: "", fav: false };
  openSheet(`
    <div class="topbar"><h2>${note ? "Editar anotação" : "Nova anotação"}</h2>
      <button class="icon-btn" data-act="close" aria-label="Fechar">${ic("x")}</button></div>
    <input class="field" id="noteTitle" placeholder="Ex.: Salmo 40:1-3" value="${esc(n.title)}">
    <div style="height:10px"></div>
    <textarea class="field" id="noteBody" rows="8" placeholder="O que Deus falou com você?">${esc(n.body)}</textarea>
    <div style="display:flex;justify-content:space-between;margin-top:12px">
      <button class="chip ${n.fav ? "on" : ""}" id="noteFav" data-act="noteFavToggle">${ic("heart")} Favorita</button>
      ${note ? `<button class="chip" data-act="delNote" data-arg="${n.id}">${ic("trash")} Apagar</button>` : ""}
    </div>
    <button class="btn" data-act="saveNote" data-arg="${n.id}">Guardar</button>`);
}

function planSheet(id) {
  const p = PLANS.find(x => x.id === id), st = S.plans[id];
  openSheet(`
    <div class="sheet-hero">${photo(p.photo, 800)}<div class="hand">${p.title}</div></div>
    <p class="prose" style="margin:0 0 6px">${p.sub}</p>
    <p class="muted" style="margin:0 0 14px;font-size:15px">${p.days} dias, uns 10 minutos por dia.</p>
    ${st ? `<div class="bar" style="margin-bottom:6px"><div style="width:${st.done.length / p.days * 100}%"></div></div>
      <div class="day-list">${Array.from({ length: p.days }, (_, i) => {
        const key = p.readings[i % p.readings.length], on = st.done.includes(i);
        return `<button data-act="planDay" data-arg="${id}|${i}"><span class="check ${on ? "on" : ""}">${on ? ic("check") : ""}</span>
          <span style="flex:1"><b style="font-weight:500">Dia ${i + 1}</b> · ${title(key)}</span>
          <span class="chip" data-act="goRead" data-arg="${key}">Ler</span></button>`;
      }).join("")}</div>
      <button class="btn ghost" data-act="leavePlan" data-arg="${id}">Sair do plano</button>`
      : `<button class="btn" data-act="startPlan" data-arg="${id}">Começar</button>`}`);
}

// escolher livro e capítulo
let pickState = { testament: null, book: null, q: "" };
function chapterSheet() {
  const [cb] = split(S.pos);
  if (!pickState.testament) pickState.testament = BOOK[cb].nt ? "nt" : "at";
  const { testament, book, q } = pickState;
  let inner;
  if (book) {
    const bk = BOOK[book];
    inner = `<button class="back-row" data-act="pickBook" data-arg="">${ic("back")} ${bk.name}</button>
      <div class="num-grid">${Array.from({ length: bk.n }, (_, i) => {
        const key = `${book} ${i + 1}`;
        return `<button class="${key === S.pos ? "active" : ""} ${S.readCh.includes(key) ? "read" : ""}" data-act="goRead" data-arg="${key}">${i + 1}</button>`;
      }).join("")}</div>`;
  } else {
    const list = BOOKS.filter((b, i) => q ? norm(b[1]).includes(norm(q)) : (testament === "nt") === (i >= 39));
    inner = `<input class="field" id="bookFilter" placeholder="Procurar livro..." value="${esc(q)}" autocomplete="off">
      ${q ? "" : `<div class="seg" style="margin:12px 0">${[["at", "Antigo Testamento"], ["nt", "Novo Testamento"]].map(([k, n]) => `<button class="${testament === k ? "active" : ""}" data-act="pickTestament" data-arg="${k}">${n}</button>`).join("")}</div>`}
      <div class="book-list">${list.map(([id, name, n]) => `<button class="${id === cb ? "active" : ""}" data-act="pickBook" data-arg="${id}"><span>${name}</span><small>${n}</small></button>`).join("") || `<p class="muted">Nenhum livro com esse nome.</p>`}</div>`;
  }
  openSheet(`<h2 style="margin-bottom:12px">O que você quer ler?</h2>${inner}`);
  const f = $("#bookFilter");
  if (f) {
    f.oninput = () => { pickState.q = f.value; const pos = f.selectionStart; chapterSheet(); const g = $("#bookFilter"); g.focus(); g.setSelectionRange(pos, pos); };
  }
}

function searchSheet(q) {
  const ref = parseRef(q);
  if (ref) return ACT.goRead(ref.key + (ref.verse ? "|" + ref.verse : ""));
  const nq = norm(q), res = [];
  for (const key of Object.keys(CACHE)) CACHE[key].forEach((v, i) => { if (norm(v).includes(nq)) res.push({ key, n: i + 1, v }); });
  openSheet(`<h2>“${esc(q)}”</h2>
    <p class="muted" style="font-size:14.5px">${res.length} ${res.length === 1 ? "versículo" : "versículos"} nos capítulos que já estão no app. Para abrir um livro, digite o nome, por exemplo “João 3” ou “Sl 91”.</p>
    ${res.slice(0, 60).map(r => `<button class="note" data-act="goRead" data-arg="${r.key}|${r.n}"><div class="t">${title(r.key)}:${r.n}</div><div class="b">${esc(r.v)}</div></button>`).join("") || `<div class="empty">Não achei.<br>Tenta “paz”, “medo” ou “pastor”.</div>`}`);
}

// ---------- cartão para os Stories ----------
const SHARE_PHOTOS = ["montes", "lago", "flores", "lua", "trilha", "mar"];
let shareCtx = null;
async function shareSheet(key, nums, ph) {
  ph = ph || meta(key).photo;
  shareCtx = { key, nums, ph };
  const themes = [...new Set([ph, ...SHARE_PHOTOS])].slice(0, 6);
  openSheet(`<h2 style="text-align:center;margin-bottom:14px">Compartilhar</h2>
    <div class="theme-row">${themes.map(k => `<button class="${k === ph ? "active" : ""}" data-act="shareTheme" data-arg="${k}"><img src="${photoUrl(k, 120)}" alt=""></button>`).join("")}</div>
    <img id="sharePrev" class="share-preview" alt="Prévia do cartão">
    <div style="display:flex;gap:8px"><button class="btn" data-act="doShare">${ic("share")} Enviar</button>
    <button class="btn ghost" data-act="download">Salvar imagem</button></div>
    <p class="muted" style="text-align:center;font-size:13.5px">Tamanho certo para os Stories</p>`);
  try {
    const canvas = await drawCard(key, nums, ph);
    if (shareCtx.ph !== ph) return;
    shareCtx.canvas = canvas;
    const img = $("#sharePrev"); if (img) img.src = canvas.toDataURL("image/jpeg", .9);
  } catch (e) { toast("Não consegui montar a imagem. Confere a internet."); }
}
function loadImg(src) {
  return new Promise((ok, no) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = no; i.src = src; });
}
function wrap(ctx, text, maxW) {
  const words = text.split(" "), lines = []; let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
async function drawCard(key, nums, ph) {
  const W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  await Promise.all([document.fonts.load('64px "Gilda Display"'), document.fonts.load('120px "Sacramento"'), document.fonts.load('34px "Jost"')]).catch(() => {});
  const img = await loadImg(`https://images.unsplash.com/${PHOTOS[ph]}?auto=format&fit=crop&w=1080&h=1920&q=80`);
  ctx.drawImage(img, 0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(25,14,6,.35)"); g.addColorStop(.5, "rgba(25,14,6,.45)"); g.addColorStop(1, "rgba(25,14,6,.62)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#FDF6EE"; ctx.textAlign = "center"; ctx.shadowColor = "rgba(0,0,0,.25)"; ctx.shadowBlur = 16;
  ctx.font = '400 54px "Gilda Display"'; ctx.letterSpacing = "6px"; ctx.fillText("LUMINA", W / 2, 210); ctx.letterSpacing = "0px";
  const script = meta(key).script.replace(/<br>/g, " ").replace(/<[^>]+>/g, "");
  let fs = 128; ctx.font = `${fs}px "Sacramento"`;
  while (ctx.measureText(script).width > 900 && fs > 72) { fs -= 4; ctx.font = `${fs}px "Sacramento"`; }
  ctx.fillText(script, W / 2, 600);
  let vs = 62, lines;
  do { ctx.font = `400 ${vs}px "Gilda Display"`; lines = wrap(ctx, `“${vText(key, nums)}”`, 860); vs -= 4; } while (lines.length > 9 && vs > 38);
  const lh = (vs + 4) * 1.36, y0 = 740;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * lh));
  ctx.font = '500 34px "Jost"'; ctx.letterSpacing = "8px";
  ctx.fillText(vRef(key, nums).toUpperCase(), W / 2, y0 + lines.length * lh + 70);
  ctx.font = '400 26px "Jost"'; ctx.letterSpacing = "6px"; ctx.globalAlpha = .85;
  ctx.fillText("MAIS QUE UMA BÍBLIA, UMA JORNADA COM DEUS", W / 2, H - 130);
  return c;
}

// ---------- ações ----------
const ACT = {
  tab(a) { closeSheet(); S.tab = a; S.sub = null; S.sel = []; render(); },
  sub(a) { closeSheet(); S.sub = a; render(); },
  back() { S.sub = null; render(); },
  close: closeSheet,
  mood(id) { moodSheet(MOODS.find(m => m.id === id)); },
  speak() { moodSheet(MOODS[Math.floor(Math.random() * MOODS.length)], true); },
  favDaily() { const d = daily(); toggleFav(d.key, d.nums); render(); },
  favThis(a, el) { const [k, n] = a.split("|"); const nums = n.split(",").map(Number); toggleFav(k, nums); el.classList.toggle("on", isFav(k, nums)); },
  share(a) { const [k, n] = a.split("|"); shareSheet(k, n.split(",").map(Number)); },
  shareTheme(p) { shareSheet(shareCtx.key, shareCtx.nums, p); },
  async doShare() {
    if (!shareCtx?.canvas) return;
    unlock("first_share");
    const blob = await new Promise(r => shareCtx.canvas.toBlob(r, "image/jpeg", .92));
    const file = new File([blob], "lumina-versiculo.jpg", { type: "image/jpeg" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text: `${vRef(shareCtx.key, shareCtx.nums)} · LUMINA` }); } catch (e) {}
    } else ACT.download();
  },
  download() {
    if (!shareCtx?.canvas) return;
    unlock("first_share");
    const a = document.createElement("a"); a.download = "lumina-versiculo.jpg"; a.href = shareCtx.canvas.toDataURL("image/jpeg", .92); a.click();
    toast("Imagem salva");
  },
  noteFrom(a) { const [k, n] = a.split("|"); noteSheet(null, { title: vRef(k, n.split(",").map(Number)) }); },
  // "PSA 23" ou "PSA 23|4" (abre e rola até o versículo 4)
  goRead(a) {
    const [key, verse] = a.split("|");
    closeSheet(); pickState = { testament: null, book: null, q: "" };
    S.pos = key; S.bibleTab = "leitura"; S.sel = []; S.tab = "biblia"; S.sub = null;
    S.scrollTo = verse ? +verse : null;
    S.lastRead = { key, date: new Date().toISOString() };
    save(); render();
  },
  pickChapter() { pickState = { testament: null, book: null, q: "" }; chapterSheet(); },
  pickTestament(t) { pickState.testament = t; chapterSheet(); },
  pickBook(id) {
    if (id && BOOK[id].n === 1) return ACT.goRead(`${id} 1`);
    pickState.book = id || null; pickState.q = ""; chapterSheet();
  },
  retry() { if (loadChapter.failed) delete loadChapter.failed[S.pos]; render(); },
  fontSize() { S.fontSize = (S.fontSize + 1) % FONT_SIZES.length; save(); render(); toast(["Letra pequena", "Letra normal", "Letra grande", "Letra bem grande"][S.fontSize]); },
  aboutVersion() {
    openSheet(`<h2>Tradução</h2><p class="prose" style="font-size:16px">João Ferreira de Almeida, em domínio público. É uma das traduções mais antigas em português, por isso algumas palavras têm grafia antiga, como “tranqüilas”.</p>
      <p class="muted" style="font-size:14.5px">Outras traduções (NVI, NVT, ARA) precisam de licença das editoras para entrar no app.</p>
      <button class="btn ghost" data-act="close">Entendi</button>`);
  },
  bibleTab(t) { S.bibleTab = t; S.sel = []; render(); },
  selVerse(n) { n = +n; S.sel = S.sel.includes(n) ? S.sel.filter(x => x !== n) : [...S.sel, n].sort((a, b) => a - b); render(); },
  hlSel() {
    const h = S.highlights[S.pos] || [], all = S.sel.every(n => h.includes(n));
    S.highlights[S.pos] = all ? h.filter(n => !S.sel.includes(n)) : [...new Set([...h, ...S.sel])];
    S.sel = []; save(); render();
  },
  favSel() { toggleFav(S.pos, S.sel); S.sel = []; render(); },
  noteSel() { noteSheet(null, { title: vRef(S.pos, S.sel) }); },
  shareSel() { shareSheet(S.pos, S.sel); },
  copySel() { navigator.clipboard?.writeText(`“${vText(S.pos, S.sel)}” (${vRef(S.pos, S.sel)})`); toast("Copiado"); S.sel = []; render(); },
  finishChapter() {
    if (!S.readCh.includes(S.pos)) S.readCh.push(S.pos);
    markActive(); unlock("first_read");
    const n = stepKey(S.pos, 1);
    if (n) { ACT.goRead(n); toast("Capítulo marcado como lido"); }
    else { save(); toast("Você leu até o fim. Que caminhada!"); }
  },
  prayed() {
    markActive(); unlock("first_prayer");
    S.prayers.push({ id: Date.now() + "", type: "hoje", text: meta(S.pos).oracao, date: new Date().toISOString() });
    save(); toast("Amém. Ficou guardada no seu diário.");
  },
  saveReflection() {
    const t = $("#reflAnswer").value.trim(); if (!t) return toast("Escreve alguma coisa antes");
    S.notes.push({ id: Date.now() + "", title: title(S.pos), body: t, date: new Date().toISOString(), fav: false });
    unlock("first_note"); markActive(); save(); $("#reflAnswer").value = ""; toast("Guardado nas suas anotações");
  },
  plansFilter(f) { S.plansFilter = f; render(); },
  openPlan: planSheet,
  startPlan(id) { S.plans[id] = { start: today(), done: [] }; save(); planSheet(id); render(); toast("Plano começado. Dia 1 te espera."); },
  leavePlan(id) { if (!confirm("Sair deste plano? O progresso some.")) return; delete S.plans[id]; save(); closeSheet(); render(); },
  planDay(a) {
    const [id, i] = a.split("|"), st = S.plans[id], d = +i, p = PLANS.find(x => x.id === id);
    const was = st.done.length >= p.days;
    st.done = st.done.includes(d) ? st.done.filter(x => x !== d) : [...st.done, d];
    if (st.done.includes(d)) markActive();
    if (st.done.length >= p.days && !was) { st.end = new Date().toISOString(); unlock("plan_done"); toast("Você terminou o plano!"); }
    save(); const sc = $("#sheet .panel").scrollTop; planSheet(id); $("#sheet .panel").scrollTop = sc; render();
  },
  notesTab(t) { S.notesTab = t; render(); },
  newNote() { noteSheet(null); },
  editNote(id) { noteSheet(S.notes.find(n => n.id === id)); },
  noteFavToggle(a, el) { el.classList.toggle("on"); },
  saveNote(id) {
    const t = $("#noteTitle").value.trim(), body = $("#noteBody").value.trim(), fav = $("#noteFav").classList.contains("on");
    if (!body && !t) return toast("Escreve alguma coisa antes");
    if (id) Object.assign(S.notes.find(n => n.id === id), { title: t, body, fav });
    else { S.notes.push({ id: Date.now() + "", title: t, body, fav, date: new Date().toISOString() }); unlock("first_note"); markActive(); }
    save(); closeSheet(); toast("Anotação guardada"); render();
  },
  delNote(id) { if (!confirm("Apagar esta anotação?")) return; S.notes = S.notes.filter(n => n.id !== id); save(); closeSheet(); render(); },
  prayerTab(t) { S.prayerTab = t; render(); },
  savePrayer() {
    const t = $("#prayerText").value.trim(); if (!t) return toast("Escreve sua oração antes");
    S.prayers.push({ id: Date.now() + "", type: S.prayerTab, text: t, date: new Date().toISOString(), answered: false });
    unlock("first_prayer"); markActive(); save(); render(); toast("Guardada no seu diário");
  },
  answered(id) { const p = S.prayers.find(x => x.id === id); p.answered = !p.answered; save(); render(); },
  delPrayer(id) { if (!confirm("Apagar este registro?")) return; S.prayers = S.prayers.filter(p => p.id !== id); save(); render(); },
  unfav(i) { S.favorites.splice(+i, 1); save(); render(); },
  journeyTab(t) { S.journeyTab = t; render(); },
  toggleDark() { S.dark = !S.dark; save(); render(); },
  async shareApp() {
    const data = { title: "LUMINA", text: "Tô usando o LUMINA para ler a Bíblia todo dia. Vem comigo?", url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch (e) {} }
    else { navigator.clipboard?.writeText(`${data.text} ${data.url}`); toast("Convite copiado"); }
  },
  about() {
    openSheet(`<div class="logo" style="margin:14px 0 8px"><i class="ico star" style="width:26px;height:26px">${ic("star")}</i><div class="word" style="font-size:34px">LUMINA</div></div>
      <p class="label" style="text-align:center;color:var(--text2);margin-top:6px">Mais que uma Bíblia,<br>uma jornada com Deus.</p>
      <p class="prose" style="font-size:16px">Um lugar para ler a Palavra, anotar o que ela mexe em você e voltar no dia seguinte.</p>
      <p class="muted" style="font-size:13.5px">Versão de teste. Tudo o que você escreve fica só neste aparelho. Fotos: Unsplash. Texto bíblico: João Ferreira de Almeida (domínio público).</p>
      <button class="btn ghost" data-act="close">Fechar</button>`);
  },
  async install() {
    if (installEvent) {
      installEvent.prompt();
      const r = await installEvent.userChoice; installEvent = null;
      if (r.outcome === "accepted") return;
    }
    const step = (n, t) => `<div class="step"><span>${n}</span><div>${t}</div></div>`;
    openSheet(`<div style="text-align:center"><img src="icons/icon-192.png" alt="" style="width:76px;border-radius:18px;box-shadow:var(--shadow)"></div>
      <h2 style="text-align:center;margin:12px 0 4px">Colocar na tela inicial</h2>
      <p class="muted" style="text-align:center;font-size:15px;margin:0 0 16px">Fica com ícone próprio e abre em tela cheia, como um app. Não ocupa espaço de download.</p>
      ${isIOS ? `
        <div class="label">No iPhone (Safari)</div>
        ${step(1, `Toque no botão <b>Compartilhar</b> ${ic("share").replace("<svg", '<svg width="16" height="16" style="vertical-align:-3px"')} na barra de baixo.`)}
        ${step(2, "Role a lista e toque em <b>Adicionar à Tela de Início</b>.")}
        ${step(3, "Toque em <b>Adicionar</b>, no canto de cima.")}
        <p class="muted" style="font-size:14px">Se abriu pelo Instagram ou WhatsApp, toque antes nos três pontinhos e escolha <b>Abrir no Safari</b>.</p>` : `
        <div class="label">No Android (Chrome)</div>
        ${step(1, "Toque nos <b>três pontinhos ⋮</b> no canto de cima.")}
        ${step(2, "Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.")}
        ${step(3, "Confirme em <b>Instalar</b>.")}
        <div class="label">No iPhone (Safari)</div>
        ${step(1, "Botão <b>Compartilhar</b> → <b>Adicionar à Tela de Início</b> → <b>Adicionar</b>.")}`}
      <button class="btn ghost" data-act="close">Entendi</button>`);
  },
  hideInstall() { S.installHidden = true; save(); render(); },
  start() { S.onboarded = true; save(); $(".onboard")?.remove(); }
};

function bindInputs() {
  const f = document.querySelector('[data-form="search"]');
  if (f) f.onsubmit = e => { e.preventDefault(); const q = f.q.value.trim(); if (q) searchSheet(q); };
}

document.addEventListener("click", e => {
  if (e.target.id === "sheet") return closeSheet();
  const tabBtn = e.target.closest(".tabbar button");
  if (tabBtn) return ACT.tab(tabBtn.dataset.tab);
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (fn) fn(el.dataset.arg || "", el, e);
});

// deslizar para mudar de capítulo
let touch = null;
$("#screen").addEventListener("touchstart", e => { const t = e.touches[0]; touch = { x: t.clientX, y: t.clientY, at: Date.now() }; }, { passive: true });
$("#screen").addEventListener("touchend", e => {
  if (!touch || S.tab !== "biblia" || S.sub || S.bibleTab !== "leitura") return;
  const t = e.changedTouches[0], dx = t.clientX - touch.x, dy = t.clientY - touch.y;
  if (Math.abs(dx) > 70 && Math.abs(dy) < 60 && Date.now() - touch.at < 600) {
    const k = stepKey(S.pos, dx < 0 ? 1 : -1);
    if (k) ACT.goRead(k);
  }
  touch = null;
});
document.addEventListener("keydown", e => {
  if (S.tab !== "biblia" || S.sub || S.bibleTab !== "leitura" || /input|textarea/i.test(e.target.tagName)) return;
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const k = stepKey(S.pos, e.key === "ArrowRight" ? 1 : -1); if (k) ACT.goRead(k); }
});

// ---------- início ----------
document.querySelectorAll(".tabbar i[data-icon]").forEach(i => i.innerHTML = ic(i.dataset.icon));
render();
if (!S.onboarded) {
  $(".phone").insertAdjacentHTML("beforeend", `
  <div class="onboard">${photo("home", 1400, "0% 60%")}
    <i class="star">${ic("star")}</i>
    <div class="word">LUMINA</div>
    <div class="tag">Mais que<br>uma Bíblia,<br>uma jornada<br>com Deus.</div>
    <div class="words"><span>Leia</span><span>Reflita</span><span>Ore</span><span>Anote</span><span>Cresça</span><span>Recomece</span></div>
    <button class="btn" data-act="start">Começar</button>
  </div>`);
}
