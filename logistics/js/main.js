/* =========================================================
   ARRO Logistics · interactions
   Content and pricing come from js/data.js (window.ARRO).
   ========================================================= */
(() => {
  "use strict";
  const A = window.ARRO;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = matchMedia("(min-width: 1025px)");
  const smooth = () => (reduce.matches ? "auto" : "smooth");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const place = (id) => A.places.find((p) => p.id === id);
  const modeOf = (id) => A.modes.find((m) => m.id === id);
  const srcset = (m) => m.widths.map((w) => `${m.base}-${w}.webp ${w}w`).join(", ");
  const imgTag = (m, sizes, extra = "") => `<img src="${m.base}-${m.widths[Math.min(1, m.widths.length - 1)]}.webp" srcset="${srcset(m)}" sizes="${sizes}" alt="${esc(m.alt)}" style="--pos:${m.pos}" loading="lazy" decoding="async" ${extra} />`;
  const lagosNow = () => new Date(Date.now() + A.brand.utcOffset * 3600e3);
  const ICON = {
    road: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="12" height="9" rx="1"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>',
    air: '<svg viewBox="0 0 24 24"><path d="M2 14l8-2 4-8h2l-2 8 6 1 2-3h1l-1 5 1 5h-1l-2-3-6 1 2 8h-2l-4-8-8-2z" transform="scale(.9) translate(1 -1)"/></svg>',
    sea: '<svg viewBox="0 0 24 24"><path d="M3 15l2 4h14l2-4z"/><path d="M6 15V9h8v6M9 9V5h3"/><path d="M2 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/></svg>',
    warehouse: '<svg viewBox="0 0 24 24"><path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-8h10v8M7 17h10"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    page: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    quote: '<svg viewBox="0 0 24 24"><path d="M4 4h16v12H8l-4 4z"/><path d="M8 9h8M8 12h5"/></svg>',
  };

  document.documentElement.classList.toggle("is-reduced", reduce.matches);
  requestAnimationFrame(() => setTimeout(() => document.body.classList.add("loaded"), 60));
  $("#year").textContent = lagosNow().getUTCFullYear();
  $$("[data-hours]").forEach((el) => (el.textContent = A.contact.hours));
  const tickClock = () => { const n = lagosNow(); $("#clock").textContent = `${pad(n.getUTCHours())}:${pad(n.getUTCMinutes())}`; };
  tickClock(); setInterval(tickClock, 15e3);

  /* ---------------- reveal ---------------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  const observe = (root = document) => $$(".reveal:not(.in)", root).forEach((el) => io.observe(el));
  observe();

  /* =========================================================
     ESTIMATOR (shared by the console, map and quote form)
     ========================================================= */
  const km = (a, b) => {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  function estimate(mode, fromId, toId, kg, express = false) {
    const P = A.pricing[mode];
    const a = place(fromId), b = place(toId);
    if (!P || !a || !b || a === b) return null;
    const d = km(a, b) * P.routeFactor;
    let price, days;
    if (mode === "road") { price = P.base + P.perKgKm * kg * d; days = Math.ceil(d / P.kmPerDay) + P.extraDays; }
    else { price = P.base + kg * (P.perKg + P.perKgKm * d); days = (P.minDays || 0) + Math.ceil(d / P.kmPerDay) + P.extraDays; }
    if (express && mode !== "sea") { price *= A.pricing.express; days = Math.max(1, days - 1); }
    const s = A.pricing.spread;
    return { km: Math.round(d), days, low: Math.round(price * (1 - s) / 1000) * 1000, high: Math.round(price * (1 + s) / 1000) * 1000, co2: Math.round(d * (kg / 1000) * P.co2PerTonneKm) };
  }
  const naira = (n) => n >= 1e6 ? `₦${(n / 1e6).toFixed(1)}M` : `₦${Math.round(n / 1000).toLocaleString("en-NG")}k`;
  const range = (e) => `${naira(e.low)} to ${naira(e.high)}`;
  const daysTxt = (n) => `${n} day${n === 1 ? "" : "s"}`;
  const placesFor = (mode) => A.places.filter((p) => mode === "warehouse" ? p.country === "Nigeria" : p.modes.includes(mode));
  const optionList = (list, sel) => list.map((p) => `<option value="${p.id}"${p.id === sel ? " selected" : ""}>${esc(p.name)}${p.country !== "Nigeria" ? ", " + esc(p.country) : ""}</option>`).join("");

  /* ---------------- hero console ---------------- */
  const con = $("#console");
  const cFrom = $("#cFrom"), cTo = $("#cTo"), cW = $("#cWeight"), cEx = $("#cExpress");
  const DEFAULTS = { road: ["lagos", "abuja"], air: ["lagos", "london"], sea: ["shanghai", "lagos"] };
  const cMode = () => con.elements.mode.value;
  const fillConsole = (mode, keep = true) => {
    const list = placesFor(mode);
    const has = (id) => list.some((p) => p.id === id);
    const f = keep && has(cFrom.value) ? cFrom.value : DEFAULTS[mode][0];
    let t = keep && has(cTo.value) ? cTo.value : DEFAULTS[mode][1];
    if (t === f) t = DEFAULTS[mode][1] === f ? DEFAULTS[mode][0] : DEFAULTS[mode][1];
    cFrom.innerHTML = optionList(list, f); cTo.innerHTML = optionList(list, t);
    cEx.disabled = mode === "sea"; if (mode === "sea") cEx.checked = false;
    cEx.closest(".toggle").style.opacity = mode === "sea" ? .45 : 1;
  };
  const kgTxt = (v) => (v >= 1000 ? `${(v / 1000).toLocaleString("en-NG", { maximumFractionDigits: 1 })} t` : `${v} kg`);
  // the weight slider is logarithmic so small parcels and full loads are both easy to pick
  const LOG_MIN = Math.log(10), LOG_MAX = Math.log(30000);
  cW.min = 0; cW.max = 1000; cW.step = 1;
  const sliderToKg = (s) => { const v = Math.exp(LOG_MIN + (LOG_MAX - LOG_MIN) * (s / 1000)); return v < 100 ? Math.round(v) : v < 1000 ? Math.round(v / 10) * 10 : Math.round(v / 100) * 100; };
  const kgToSlider = (kg) => Math.round(((Math.log(kg) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 1000);
  cW.value = kgToSlider(500);
  const priceEl = $("#cPrice");
  let lastPrice = "";
  const paintConsole = () => {
    const kg = sliderToKg(+cW.value);
    $("#cWeightOut").textContent = kgTxt(kg);
    cW.style.setProperty("--fill", `${(cW.value / 10).toFixed(1)}%`);
    cW.setAttribute("aria-valuetext", kgTxt(kg));
    const e = estimate(cMode(), cFrom.value, cTo.value, kg, cEx.checked);
    const txt = e ? range(e) : "Pick two places";
    if (txt !== lastPrice && !reduce.matches) { priceEl.classList.remove("tick"); void priceEl.offsetWidth; priceEl.classList.add("tick"); }
    lastPrice = txt;
    priceEl.textContent = txt;
    $("#cDays").textContent = e ? daysTxt(e.days) : "-";
    $("#cKm").textContent = e ? `${e.km.toLocaleString("en-NG")} km` : "-";
    $("#cCo2").textContent = e ? `${e.co2.toLocaleString("en-NG")} kg` : "-";
  };
  con.addEventListener("change", (e) => { if (e.target.name === "mode") fillConsole(cMode()); paintConsole(); });
  cW.addEventListener("input", paintConsole);
  $("#cSwap").addEventListener("click", (e) => {
    const f = cFrom.value; cFrom.value = cTo.value; cTo.value = f; paintConsole();
    e.currentTarget.classList.toggle("spin");
  });
  con.addEventListener("submit", (e) => {
    e.preventDefault();
    prefillQuote({ mode: cMode(), from: cFrom.value, to: cTo.value, weight: sliderToKg(+cW.value) });
  });
  fillConsole("road", false); paintConsole();

  /* ---------------- stats ---------------- */
  // dt comes first for valid markup; CSS shows the number above its label
  $("#stats").innerHTML = A.stats.map((s) => `<div class="reveal"><dt>${esc(s.label)}</dt><dd data-to="${s.value}">0<span>${esc(s.suffix)}</span></dd></div>`).join("");
  const countUp = (el) => {
    const to = +el.dataset.to, suffix = el.querySelector("span").outerHTML;
    if (reduce.matches) { el.innerHTML = to + suffix; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.innerHTML = Math.round(to * (1 - (1 - k) ** 3)) + suffix; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const sio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { $$("dd", e.target).forEach(countUp); sio.disconnect(); } }), { threshold: 0.4 });
  sio.observe($("#stats")); observe($("#stats"));

  /* =========================================================
     HEADER, NAV, SHEET
     ========================================================= */
  const hdr = $("#hdr");
  const navLinks = $$(".nav__list a");
  const navBar = $(".nav__bar");
  const sections = $$("[data-section]");
  let active = "";
  const moveBar = () => {
    const a = navLinks.find((l) => l.dataset.nav === active);
    if (!a) { navBar.style.opacity = 0; return; }
    navBar.style.opacity = 1;
    navBar.style.width = `${a.offsetWidth - 32}px`;
    navBar.style.transform = `translateX(${a.offsetLeft + 16}px)`;
  };
  const onScroll = () => {
    hdr.classList.toggle("is-scrolled", scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    $("#progress").style.setProperty("--p", max > 0 ? (scrollY / max).toFixed(4) : 0);
    let key = "top";
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= innerHeight * 0.35) key = s.dataset.section; });
    if (key !== active) {
      active = key;
      $$("[data-nav]").forEach((a) => { const on = a.dataset.nav === key; a.classList.toggle("is-active", on); on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"); });
      moveBar();
    }
    flowScroll();
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", moveBar);
  document.fonts && document.fonts.ready.then(moveBar);

  const sheet = $("#sheet"), burger = $("#burger");
  $$(".sheet__links li").forEach((li, i) => li.style.setProperty("--i", i));
  const setSheet = (open) => {
    if (open) { sheet.hidden = false; void sheet.offsetWidth; }
    sheet.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("locked", open);
    $("#main").inert = open; $(".foot").inert = open;
    if (open) setTimeout(() => $("#sheetTrack").focus(), reduce.matches ? 0 : 300);
    else setTimeout(() => { if (!sheet.classList.contains("is-open")) sheet.hidden = true; }, reduce.matches ? 0 : 650);
  };
  burger.addEventListener("click", () => setSheet(!sheet.classList.contains("is-open")));
  $$(".sheet__links a").forEach((a) => a.addEventListener("click", () => setSheet(false)));
  desktop.addEventListener("change", () => { if (desktop.matches) setSheet(false); });
  document.addEventListener("keydown", (e) => {
    if (!sheet.classList.contains("is-open")) return;
    if (e.key === "Escape") { setSheet(false); burger.focus(); }
    if (e.key === "Tab") {
      const items = [burger, ...$$("input, button, a", sheet)];
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });

  /* =========================================================
     COMMAND PALETTE
     ========================================================= */
  const pal = $("#palette"), pIn = $("#paletteInput"), pList = $("#paletteList");
  const go = (hash) => () => document.querySelector(hash).scrollIntoView({ behavior: smooth() });
  const ACTIONS = [
    { t: "Get a quote", s: "Request a confirmed price", i: "quote", k: "quote price cost book", run: go("#quote") },
    { t: "Track a shipment", s: "Follow milestones and ETA", i: "search", k: "track tracking where status", run: () => { go("#track")(); setTimeout(() => $("#trackInput").focus({ preventScroll: true }), 500); } },
    ...A.modes.map((m) => ({ t: m.name, s: m.line, i: m.id, k: `${m.id} ${m.short} service`, run: () => { setMode(A.modes.indexOf(m), { user: true }); go("#services")(); } })),
    { t: "Network map", s: "Corridors, ports and air lanes", i: "page", k: "network map cities routes coverage", run: go("#network") },
    { t: "Industries", s: "Ecommerce, manufacturing, pharma, FMCG", i: "page", k: "industries sectors retail", run: go("#industries") },
    { t: "How it works", s: "Request, plan, move, deliver", i: "page", k: "process steps how", run: go("#process") },
    { t: "Questions", s: "Customs, insurance, recurring loads", i: "page", k: "faq questions help customs insurance", run: go("#faq") },
    ...A.places.filter((p) => p.id !== "lagos").map((p) => ({ t: `Lagos to ${p.name}`, s: `${p.modes.map((m) => modeOf(m).short).join(", ")} · see on the map`, i: p.modes[0], k: `${p.name} ${p.country} lane city`, run: () => { selectStation(p.id); go("#network")(); } })),
  ];
  let pItems = [], pSel = 0;
  const renderPalette = () => {
    const q = pIn.value.trim().toLowerCase();
    const code = pIn.value.replace(/\s+/g, "").toUpperCase();
    pItems = [];
    if (/^AR[0-9A-Z]{3,}$/.test(code)) pItems.push({ t: `Track ${code}`, s: A.shipments[code] ? `${A.shipments[code].status} · demo shipment` : "Look up this number", i: "search", run: () => runTrack(code, true) });
    pItems.push(...ACTIONS.filter((a) => !q || (a.t + " " + a.k).toLowerCase().includes(q)).slice(0, q ? 8 : 7));
    pSel = 0;
    pList.innerHTML = pItems.length ? pItems.map((a, n) => `<li role="option" id="pi${n}" aria-selected="${n === 0}"><span class="pi-ico" aria-hidden="true">${ICON[a.i] || ICON.page}</span><span><b>${esc(a.t)}</b><small>${esc(a.s)}</small></span><span class="pi-go" aria-hidden="true">Enter</span></li>`).join("") : `<li class="palette__empty" role="option" aria-disabled="true">No matches. Try a city, a service or a tracking number.</li>`;
    pIn.setAttribute("aria-activedescendant", pItems.length ? "pi0" : "");
  };
  const markSel = () => { $$("li[role=option]", pList).forEach((li, n) => li.setAttribute("aria-selected", String(n === pSel))); pIn.setAttribute("aria-activedescendant", `pi${pSel}`); const el = $(`#pi${pSel}`); el && el.scrollIntoView({ block: "nearest" }); };
  const openPalette = () => { if (pal.open) return; setSheet(false); pIn.value = ""; renderPalette(); pal.showModal(); pIn.focus(); };
  const runItem = (n) => { const a = pItems[n]; if (!a) return; pal.close(); setTimeout(a.run, 30); };
  $("#cmdkBtn").addEventListener("click", openPalette);
  pIn.addEventListener("input", renderPalette);
  pIn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); pSel = Math.min(pItems.length - 1, pSel + 1); markSel(); }
    if (e.key === "ArrowUp") { e.preventDefault(); pSel = Math.max(0, pSel - 1); markSel(); }
    if (e.key === "Enter") { e.preventDefault(); runItem(pSel); }
  });
  pList.addEventListener("click", (e) => { const li = e.target.closest("li[id]"); if (li) runItem(+li.id.slice(2)); });
  pal.addEventListener("click", (e) => { if (e.target === pal) pal.close(); });
  pal.addEventListener("close", () => $("#cmdkBtn").focus({ preventScroll: true }));
  document.addEventListener("keydown", (e) => {
    const ae = document.activeElement;
    const typing = (ae.tagName === "INPUT" && !/^(radio|checkbox|range|button|submit)$/.test(ae.type)) || /TEXTAREA|SELECT/.test(ae.tagName) || ae.isContentEditable;
    if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) { e.preventDefault(); openPalette(); }
  });

  /* =========================================================
     SERVICES · MODE SWITCHER
     ========================================================= */
  const modesEl = $("#modes"), tabsEl = $("#modeTabs"), mediaEl = $("#modeMedia"), panelEl = $("#modePanel");
  const DUR = 7000;
  modesEl.style.setProperty("--dur", `${DUR / 1000}s`);
  tabsEl.innerHTML = A.modes.map((m, i) => `
    <button class="mtab" role="tab" id="mtab-${m.id}" aria-controls="modePanel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
      <span class="mtab__n">${pad(i + 1)}</span><span class="mtab__name">${esc(m.name)}</span>
      <svg class="mtab__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      <span class="mtab__line"><span>${esc(m.line)}</span></span><i class="mtab__bar" aria-hidden="true"></i>
    </button>`).join("");
  mediaEl.innerHTML = A.modes.map((m, i) => imgTag(m.image, "(max-width: 1024px) 100vw, 64vw", i === 0 ? 'class="on"' : "")).join("");
  const mtabs = $$(".mtab", tabsEl), mimgs = $$("img", mediaEl);
  let mIdx = -1, mTimer, mHover = false, mSeen = false, mUser = false, mSwap;
  const panelHTML = (m) => `
    <h3 class="mp__title">${esc(m.name)}</h3>
    <p class="mp__body">${esc(m.body)}</p>
    <dl class="mp__specs">${m.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
    <a href="#quote" class="btn btn--signal mp__cta" data-quote-mode="${m.id}"><span>Get a ${esc(m.short.toLowerCase())} quote</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>`;
  const autoplay = () => {
    clearTimeout(mTimer);
    const play = mSeen && !mHover && !mUser && !reduce.matches && !document.hidden;
    modesEl.classList.remove("is-playing");
    if (!play) return;
    void modesEl.offsetWidth; modesEl.classList.add("is-playing");
    mTimer = setTimeout(() => setMode((mIdx + 1) % A.modes.length), DUR);
  };
  function setMode(i, { focus = false, user = false } = {}) {
    if (user) mUser = true;
    if (i === mIdx) { autoplay(); return; }
    mIdx = i;
    const m = A.modes[i];
    mtabs.forEach((t, n) => { t.setAttribute("aria-selected", String(n === i)); t.tabIndex = n === i ? 0 : -1; });
    panelEl.setAttribute("aria-labelledby", mtabs[i].id);
    mimgs.forEach((im, n) => im.classList.toggle("on", n === i));
    if (focus) mtabs[i].focus();
    if (!desktop.matches) mtabs[i].scrollIntoView({ block: "nearest", inline: "center", behavior: smooth() });
    clearTimeout(mSwap);
    if (reduce.matches || !panelEl.innerHTML) panelEl.innerHTML = panelHTML(m);
    else { panelEl.classList.add("swap-out"); mSwap = setTimeout(() => { panelEl.innerHTML = panelHTML(m); panelEl.classList.remove("swap-out"); }, 300); }
    autoplay();
  }
  mtabs.forEach((t, i) => t.addEventListener("click", () => setMode(i, { user: true })));
  tabsEl.addEventListener("keydown", (e) => {
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (k) { e.preventDefault(); setMode((mIdx + k + A.modes.length) % A.modes.length, { focus: true, user: true }); }
    if (e.key === "Home") { e.preventDefault(); setMode(0, { focus: true, user: true }); }
    if (e.key === "End") { e.preventDefault(); setMode(A.modes.length - 1, { focus: true, user: true }); }
  });
  modesEl.addEventListener("pointerenter", () => { mHover = true; autoplay(); });
  modesEl.addEventListener("pointerleave", () => { mHover = false; autoplay(); });
  modesEl.addEventListener("focusin", () => { mHover = true; autoplay(); });
  modesEl.addEventListener("focusout", (e) => { if (!modesEl.contains(e.relatedTarget)) { mHover = false; autoplay(); } });
  new IntersectionObserver(([e]) => { mSeen = e.isIntersecting; autoplay(); }, { threshold: 0.4 }).observe(modesEl);
  document.addEventListener("visibilitychange", autoplay);
  setMode(0);
  $$("[data-mode-link]").forEach((a) => a.addEventListener("click", () => setMode(A.modes.findIndex((m) => m.id === a.dataset.modeLink), { user: true })));

  /* =========================================================
     NETWORK MAP
     ========================================================= */
  const svg = $("#mapSvg"), NS = "http://www.w3.org/2000/svg";
  const N = A.network;
  let mapHTML = `<g class="grid">${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="620"/>`).join("")}${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 100 + 10}" x2="1200" y2="${i * 100 + 10}"/>`).join("")}</g>`;
  mapHTML += `<rect class="region" x="100" y="90" width="660" height="410" rx="28"/><text class="region-label" x="124" y="122">WEST AFRICA</text>`;
  mapHTML += `<rect class="region" x="880" y="60" width="200" height="150" rx="24"/><text class="region-label" x="898" y="196">EUROPE</text>`;
  mapHTML += `<rect class="region" x="980" y="250" width="120" height="90" rx="20"/><text class="region-label" x="1050" y="328">GULF</text>`;
  mapHTML += `<rect class="region" x="1060" y="380" width="110" height="80" rx="20"/><text class="region-label" x="1072" y="404">ASIA</text>`;
  N.lines.forEach((l, i) => { mapHTML += `<path id="ln${i}" class="ln ln--${l.mode}" data-mode="${l.mode}" d="${l.d}"><title>${esc(l.name)}</title></path>`; });
  if (!reduce.matches) N.lines.forEach((l, i) => {
    if ((l.d.match(/M/g) || []).length > 1) return;
    const color = l.mode === "road" ? "#0B0E11" : l.mode === "sea" ? "#fff" : "#D4FF3F";
    const r = l.mode === "air" ? 4 : 3;
    const dur = 6 + (i % 4) * 1.6;
    mapHTML += `<circle class="pk" data-mode="${l.mode}" r="${r}" fill="${color}"><animateMotion dur="${dur}s" repeatCount="indefinite" begin="${(i * 0.7).toFixed(1)}s"><mpath href="#ln${i}"/></animateMotion></circle>`;
  });
  Object.entries(N.stations).forEach(([id, [x, y]]) => {
    const p = place(id); if (!p) return;
    // label placement: r = right, tl = above left, b = below, default above
    const pos = { kano: "r", kaduna: "r", ph: "r", lagos: "tl", benin: "b", enugu: "b", shanghai: "b", cotonou: "b", lome: "b", accra: "b" }[id];
    const tx = pos === "r" ? x + 18 : pos === "tl" ? x - 16 : x;
    const ty = pos === "r" ? y + 5 : pos === "tl" ? y - 16 : pos === "b" ? y + 32 : y - 20;
    const anchor = pos === "r" ? "start" : pos === "tl" ? "end" : "middle";
    mapHTML += `<g class="st${p.hub ? " hub" : ""}" data-id="${id}" tabindex="0" role="button" aria-label="${esc(p.name)}, ${esc(p.country)}. ${p.modes.map((m) => modeOf(m).name).join(", ")}"><circle class="halo" cx="${x}" cy="${y}" r="${p.hub ? 26 : 20}"/><circle class="ring" cx="${x}" cy="${y}" r="${p.hub ? 11 : 7}"/><text x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(p.name)}</text></g>`;
  });
  svg.insertAdjacentHTML("beforeend", mapHTML);
  const mapPanel = $("#mapPanel");
  function selectStation(id) {
    $$(".st", svg).forEach((g) => g.classList.toggle("on", g.dataset.id === id));
    const p = place(id);
    const rows = id === "lagos"
      ? `<div><dt>Role</dt><dd>Head office and main hub</dd></div><div><dt>Ports</dt><dd>Apapa, Tin Can</dd></div><div><dt>Airport</dt><dd>Murtala Muhammed</dd></div>`
      : p.modes.map((m) => { const e = estimate(m, "lagos", id, 500); return e ? `<div><dt>${esc(modeOf(m).name)} from Lagos</dt><dd>~${daysTxt(e.days)}</dd></div>` : ""; }).join("");
    mapPanel.innerHTML = `
      <div><p class="mono mpanel__k">${esc(p.country)}</p><h3 class="mpanel__name">${esc(p.name)}</h3><div class="mpanel__modes" style="margin-top:12px">${p.modes.map((m) => `<span>${esc(modeOf(m).short)}</span>`).join("")}</div></div>
      <div><dl class="mpanel__rows">${rows}</dl>
      ${id === "lagos" ? `<p class="mpanel__hint" style="margin-top:14px">Select another city to see transit times from Lagos.</p>` : `<button type="button" class="btn btn--signal btn--block" style="margin-top:16px" data-lane="${id}"><span>Quote Lagos to ${esc(p.name)}</span></button>`}</div>`;
  }
  svg.addEventListener("click", (e) => { const g = e.target.closest(".st"); if (g) selectStation(g.dataset.id); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest(".st"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); selectStation(g.dataset.id); } });
  mapPanel.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lane]"); if (!b) return;
    const p = place(b.dataset.lane);
    const mode = ["road", "air", "sea"].find((m) => p.modes.includes(m));
    prefillQuote({ mode, from: "lagos", to: p.id });
  });
  $$(".chip[data-line]").forEach((c) => c.addEventListener("click", () => {
    const on = c.getAttribute("aria-pressed") !== "true";
    c.setAttribute("aria-pressed", String(on));
    $$(`[data-mode="${c.dataset.line}"]`, svg).forEach((el) => el.classList.toggle("off", !on));
  }));
  selectStation("lagos");
  const canvas = $(".map__canvas");
  const centreMap = () => { if (canvas.scrollWidth > canvas.clientWidth) canvas.scrollLeft = canvas.scrollWidth * (410 / 1200) - canvas.clientWidth / 2; };
  centreMap(); addEventListener("load", centreMap);

  /* =========================================================
     TRACKING
     ========================================================= */
  const tcard = $("#tcard");
  function runTrack(raw, scroll = false) {
    const code = String(raw || "").replace(/\s+/g, "").toUpperCase();
    if (!code) return;
    $("#trackInput").value = code;
    const s = A.shipments[code];
    tcard.classList.remove("enter"); void tcard.offsetWidth; tcard.classList.add("enter");
    if (!s) {
      tcard.innerHTML = `<div class="tc__miss"><p class="mono" style="color:var(--signal)">${esc(code)}</p><h3>We could not find that number.</h3><p>Check the reference on your booking confirmation. This demo recognises AR2048NG, AR7731AF and AR5590SE.</p></div>`;
    } else {
      const from = place(s.from), to = place(s.to);
      const n = s.events.length, firstDone = n - s.done;
      tcard.innerHTML = `
        <div class="tc__top"><span class="tc__id">${esc(code)}</span><span class="tc__demo">Demo shipment</span><span class="tc__status">${esc(s.status)}</span></div>
        <div class="tc__route">
          <div class="tc__place"><small>From</small><b>${esc(from.name)}</b></div>
          <div class="tc__bar" role="progressbar" aria-label="Journey progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(s.progress * 100)}"><i></i><span class="tc__veh" aria-hidden="true">${ICON[s.mode]}</span></div>
          <div class="tc__place tc__place--to"><small>To</small><b>${esc(to.name)}</b></div>
        </div>
        <dl class="tc__meta"><div><dt>Mode</dt><dd>${esc(modeOf(s.mode).name)}</dd></div><div><dt>Expected</dt><dd>${esc(s.eta)}</dd></div><div><dt>Cargo</dt><dd>${esc(s.cargo)}</dd></div></dl>
        <ol class="tc__events">${s.events.map(([t, when], i) => `<li class="${i >= firstDone ? "done" : ""}${i === firstDone ? " now" : ""}"><span>${esc(t)}</span><time>${esc(when || "Pending")}</time></li>`).join("")}</ol>`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        $(".tc__bar i", tcard).style.width = `${s.progress * 100}%`;
        $(".tc__veh", tcard).style.left = `${s.progress * 100}%`;
      }));
    }
    if (scroll) { setSheet(false); $("#track").scrollIntoView({ behavior: smooth() }); }
  }
  $$("[data-track-form]").forEach((f) => f.addEventListener("submit", (e) => { e.preventDefault(); runTrack(f.elements.code.value, f.id !== "trackForm"); }));
  $$("[data-try]").forEach((b) => b.addEventListener("click", () => runTrack(b.dataset.try)));

  /* =========================================================
     INDUSTRIES ACCORDION
     ========================================================= */
  $("#accord").innerHTML = A.industries.map((d, i) => `
    <div class="acc${i === 0 ? " on" : ""}">
      ${imgTag(d.image, "(max-width: 760px) 100vw, 50vw", 'aria-hidden="true"').replace(`alt="${esc(d.image.alt)}"`, 'alt=""')}
      <h3><button type="button" class="acc__btn" aria-expanded="${i === 0}" aria-controls="acc-${d.id}" id="accb-${d.id}"><span class="acc__n">${pad(i + 1)}</span><span class="acc__name">${esc(d.name)}</span></button></h3>
      <div class="acc__body" id="acc-${d.id}" role="region" aria-labelledby="accb-${d.id}"><p>${esc(d.text)}</p><ul>${d.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>
    </div>`).join("");
  const accs = $$(".acc");
  const openAcc = (i) => accs.forEach((a, n) => { a.classList.toggle("on", n === i); $(".acc__btn", a).setAttribute("aria-expanded", String(n === i)); });
  accs.forEach((a, i) => {
    $(".acc__btn", a).addEventListener("click", () => openAcc(i));
    a.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && desktop.matches) openAcc(i); });
  });

  /* =========================================================
     PROCESS
     ========================================================= */
  const flow = $("#flow");
  flow.insertAdjacentHTML("beforeend", A.process.map((p) => `<li class="step reveal"><span class="step__n">${esc(p.n)}</span><h3>${esc(p.title)}</h3><span class="step__time">${esc(p.time)}</span><p>${esc(p.text)}</p></li>`).join(""));
  observe(flow);
  const steps = $$(".step", flow);
  function flowScroll() {
    const r = flow.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.25)));
    flow.style.setProperty("--f", f.toFixed(3));
    steps.forEach((s, i) => s.classList.toggle("lit", f >= i / steps.length + 0.02));
  }

  /* =========================================================
     FAQ
     ========================================================= */
  $("#faqList").innerHTML = A.faq.map(([q, a], i) => `
    <div class="q${i === 0 ? " open" : ""}"><h3><button type="button" class="q__btn" aria-expanded="${i === 0}" aria-controls="qa${i}" id="qb${i}"><span>${esc(q)}</span><span class="q__ico" aria-hidden="true"></span></button></h3>
    <div class="q__body" id="qa${i}" role="region" aria-labelledby="qb${i}"><div><p>${esc(a)}</p></div></div></div>`).join("");
  $("#faqList").addEventListener("click", (e) => {
    const b = e.target.closest(".q__btn"); if (!b) return;
    const q = b.closest(".q"), open = !q.classList.contains("open");
    q.classList.toggle("open", open); b.setAttribute("aria-expanded", String(open));
  });

  /* =========================================================
     QUOTE FORM
     ========================================================= */
  const qf = $("#quoteForm"), qMode = $("#qMode"), qFrom = $("#qFrom"), qTo = $("#qTo"), qDate = $("#qDate"), qW = $("#qWeight");
  const fillQuotePlaces = (keepFrom, keepTo) => {
    const list = placesFor(qMode.value);
    const has = (id) => list.some((p) => p.id === id);
    qFrom.innerHTML = `<option value="">Choose origin</option>` + optionList(list, has(keepFrom) ? keepFrom : "");
    qTo.innerHTML = `<option value="">Choose destination</option>` + optionList(list, has(keepTo) ? keepTo : "");
  };
  const dateBounds = () => { const t = lagosNow(); qDate.min = t.toISOString().slice(0, 10); const m = new Date(t); m.setUTCDate(m.getUTCDate() + 180); qDate.max = m.toISOString().slice(0, 10); };
  dateBounds(); fillQuotePlaces("lagos", "");
  const paintQuoteEst = () => {
    const kg = +qW.value;
    const e = qMode.value !== "warehouse" && kg > 0 ? estimate(qMode.value, qFrom.value, qTo.value, kg) : null;
    $("#qEst").innerHTML = e ? `Instant estimate <b>${range(e)}</b> · ${daysTxt(e.days)} · ${e.km.toLocaleString("en-NG")} km` : qMode.value === "warehouse" ? "Storage is priced per pallet and month after a short call." : "Add a route and weight to see an instant estimate.";
  };
  qMode.addEventListener("change", () => { fillQuotePlaces(qFrom.value, qTo.value); paintQuoteEst(); });
  qf.addEventListener("input", paintQuoteEst);
  qf.addEventListener("change", (e) => clearErr(e.target));
  paintQuoteEst();

  function prefillQuote({ mode, from, to, weight }) {
    if (!$("#qDone").hidden) resetQuote();
    if (mode) qMode.value = mode;
    fillQuotePlaces(from, to);
    if (weight) qW.value = weight;
    [qMode, qFrom, qTo, qW].forEach(clearErr);
    paintQuoteEst();
    $("#quote").scrollIntoView({ behavior: smooth() });
    setTimeout(() => (qDate.value ? $("#qCargo") : qDate).focus({ preventScroll: true }), reduce.matches ? 0 : 700);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-quote-mode]");
    if (a) { e.preventDefault(); prefillQuote({ mode: a.dataset.quoteMode, from: "lagos" }); }
  });

  const showErr = (el, msg) => { const w = el.closest(".qf"); w.classList.add("err"); el.setAttribute("aria-invalid", "true"); let m = $(".qf__msg", w); if (!m) { m = document.createElement("span"); m.className = "qf__msg"; m.id = `${el.id}Err`; w.appendChild(m); } m.textContent = msg; el.setAttribute("aria-describedby", m.id); };
  function clearErr(el) { const w = el && el.closest && el.closest(".qf"); if (!w) return; w.classList.remove("err"); el.removeAttribute("aria-invalid"); el.removeAttribute("aria-describedby"); const m = $(".qf__msg", w); if (m) m.remove(); }
  qf.addEventListener("submit", (e) => {
    e.preventDefault();
    $$(".qf input, .qf select", qf).forEach(clearErr);
    const bad = [];
    const need = (el, msg) => { if (!el.value.trim()) { showErr(el, msg); bad.push(el); } };
    need(qFrom, "Choose where we collect from."); need(qTo, "Choose where it is going.");
    if (qFrom.value && qFrom.value === qTo.value && qMode.value !== "warehouse") { showErr(qTo, "Destination must differ from origin."); bad.push(qTo); }
    if (!qDate.value) { showErr(qDate, "Choose a collection date."); bad.push(qDate); }
    else if (qDate.value < qDate.min) { showErr(qDate, "That date has passed."); bad.push(qDate); }
    need($("#qCargo"), "Describe the cargo.");
    if (!(+qW.value > 0)) { showErr(qW, "Add the weight in kg."); bad.push(qW); }
    need($("#qName"), "Add your name.");
    const c = $("#qContact").value.trim();
    if (!(/\S+@\S+\.\S+/.test(c) || c.replace(/\D/g, "").length >= 10)) { showErr($("#qContact"), "Add an email or a phone number."); bad.push($("#qContact")); }
    if (bad.length) { $("#qStatus").textContent = `${bad.length} field${bad.length > 1 ? "s need" : " needs"} attention.`; bad[0].focus(); return; }
    $("#qStatus").textContent = "";
    // Demo only: replace this block with a request to your quoting backend (see README).
    const e2 = qMode.value !== "warehouse" ? estimate(qMode.value, qFrom.value, qTo.value, +qW.value) : null;
    $("#qRef").textContent = "Q" + Math.random().toString(36).slice(2, 7).toUpperCase();
    $("#qList").innerHTML = [
      ["Mode", qMode.options[qMode.selectedIndex].text], ["Route", `${place(qFrom.value).name} to ${place(qTo.value).name}`],
      ["Collection", qDate.value], ["Cargo", `${$("#qCargo").value.trim()}, ${(+qW.value).toLocaleString("en-NG")} kg`],
      ["Estimate", e2 ? range(e2) : "Confirmed after a call"], ["Contact", `${$("#qName").value.trim()}${$("#qCompany").value.trim() ? ", " + $("#qCompany").value.trim() : ""}`],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
    qf.hidden = true; const d = $("#qDone"); d.hidden = false; d.focus({ preventScroll: true });
  });
  function resetQuote() { qf.reset(); dateBounds(); fillQuotePlaces("lagos", ""); $$(".qf input, .qf select", qf).forEach(clearErr); $("#qDone").hidden = true; qf.hidden = false; paintQuoteEst(); }
  $("#qAgain").addEventListener("click", () => { resetQuote(); qMode.focus(); });

  /* ---------------- footer ---------------- */
  const C = A.contact;
  $("#footContact").innerHTML = [
    ...C.address.map((l) => `<li>${esc(l)}</li>`),
    C.phone && `<li><a href="tel:${esc(C.phone.replace(/\s/g, ""))}">${esc(C.phone)}</a></li>`,
    C.email && `<li><a href="mailto:${esc(C.email)}">${esc(C.email)}</a></li>`,
    `<li>${esc(C.hours)}</li>`,
  ].filter(Boolean).join("");
  $("#social").innerHTML = C.social.map((s) => s.url ? `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>` : `<li class="pending">${esc(s.label)}</li>`).join("");

  onScroll();
})();
