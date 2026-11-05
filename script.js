/* =========================================================
   FORM & FADE · interactions
   Everything editable lives in CONFIG.
   ========================================================= */
const CONFIG = {
  // Path or URL to a hero film (mp4/webm). Leave empty to use the photograph only.
  heroVideo: "",
  // WhatsApp number in international format, digits only (e.g. "2348030000000").
  whatsapp: "",
  // Seconds each cut stays on screen while the showcase autoplays.
  showcaseSeconds: 7,

  hours: { 0: [12, 18], 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [10, 20] },

  services: [
    { id: "taper",   name: "The Taper",     minutes: 45, price: 25000, note: "Fade, line and finish" },
    { id: "texture", name: "Textured Top",  minutes: 60, price: 32000, note: "Curl shaping and fade" },
    { id: "classic", name: "The Classic",   minutes: 50, price: 28000, note: "Side part and taper" },
    { id: "beard",   name: "Beard Sculpt",  minutes: 30, price: 15000, note: "Shape, razor and oil" },
    { id: "full",    name: "Cut and Beard", minutes: 75, price: 38000, note: "Any cut with a full beard sculpt" },
  ],
  towel: { minutes: 10, price: 5000 },

  cuts: {
    taper:   { name: "The Taper",    tag: "Most requested", refresh: "3 weeks", desc: "A gradual fade that cleans the neckline and sides while keeping your shape soft and natural. Finished with a razor line." },
    texture: { name: "Textured Top", tag: "For curls",      refresh: "4 weeks", desc: "Short, faded sides with defined curls on top. We shape the volume so your natural texture does the work." },
    classic: { name: "The Classic",  tag: "Timeless",       refresh: "4 weeks", desc: "A tailored side part over a clean taper, styled with a matte finish for the boardroom or the evening." },
  },

  barbers: {
    miles: {
      name: "Miles", role: "Senior barber",
      spec: "Skin fades, textured tops, curl definition",
      bio: "Eleven years behind the chair, from Yaba to Victoria Island. Miles reads growth patterns like a map and is known for fades that still look sharp on day ten.",
      stats: [["Years", "11"], ["Chair", "02"], ["Signature", "Skin fade"]],
      work: [
        { src: "assets/img/miles-1.jpg", alt: "Client in a barber cape being blow dried after a fade", cap: "Blow out and fade" },
        { src: "assets/img/miles-2.jpg", alt: "Sharp taper with a hard part, styled back", cap: "Hard part taper" },
        { src: "assets/img/miles-3.jpg", alt: "Skin fade with a textured crop seen from behind", cap: "Skin fade, textured crop" },
        { src: "assets/img/cut-texture.jpg", alt: "Textured curls on top of a low fade", cap: "Curl definition" },
      ],
    },
    andre: {
      name: "Andre", role: "Master barber",
      spec: "Classic cuts, scissor work, beard sculpting",
      bio: "Trained in London, settled in Lagos. Andre is the studio's scissor specialist and the person to see for a beard that frames the face rather than hides it.",
      stats: [["Years", "14"], ["Chair", "01"], ["Signature", "Scissor cut"]],
      work: [
        { src: "assets/img/andre-1.jpg", alt: "Barber refining a classic cut with clippers and comb", cap: "Scissor over comb" },
        { src: "assets/img/andre-2.jpg", alt: "Detailed fade with a sculpted beard", cap: "Fade and beard design" },
        { src: "assets/img/andre-3.jpg", alt: "Beard being lathered with a brush before a razor shave", cap: "Hot lather shave" },
        { src: "assets/img/cut-classic.jpg", alt: "Classic tapered cut being finished with spray", cap: "Classic side part" },
      ],
    },
  },
};

(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const mqMobile = matchMedia("(max-width: 860px)");
  const naira = (n) => "₦" + n.toLocaleString("en-NG");
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const smooth = () => (reduceMotion.matches ? "auto" : "smooth");

  // Lagos is UTC+1 all year. Read these Date objects with getUTC* methods.
  const lagosNow = () => new Date(Date.now() + 3600e3);
  const isoDay = (d) => d.toISOString().slice(0, 10);
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const fmtDate = (d) => `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const fmtTime = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

  $("#year").textContent = lagosNow().getUTCFullYear();
  requestAnimationFrame(() => setTimeout(() => document.body.classList.add("loaded"), 80));

  /* ---------------- button glow follows the pointer ---------------- */
  document.addEventListener("pointerover", (e) => {
    const b = e.target.closest(".btn");
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--mx", `${e.clientX - r.left}px`);
    b.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  /* ---------------- context cursor ---------------- */
  const cursor = $(".cursor");
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion.matches) {
    document.body.classList.add("has-cursor");
    const label = $(".cursor__label", cursor);
    let mx = -100, my = -100, cx = -100, cy = -100;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      const host = e.target.closest("[data-cursor]");
      const onControl = e.target.closest("button, a, input:not(.compare__range)");
      const show = host && !onControl;
      cursor.classList.toggle("is-on", !!show);
      if (show) label.textContent = host.dataset.cursor;
    });
    document.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));
  }

  /* ---------------- hero film (optional) ---------------- */
  const heroMedia = $("#heroMedia");
  const motionBtn = $("#heroMotion");
  if (CONFIG.heroVideo) {
    const v = document.createElement("video");
    v.className = "hero__video";
    v.src = CONFIG.heroVideo;
    v.poster = $(".hero__poster").getAttribute("src");
    v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute("aria-hidden", "true");
    v.preload = reduceMotion.matches ? "none" : "auto";
    heroMedia.insertBefore(v, $(".clock", heroMedia));
    motionBtn.hidden = false;
    const setState = (paused) => {
      motionBtn.setAttribute("aria-pressed", String(paused));
      $(".hero__motion-text", motionBtn).textContent = paused ? "Play film" : "Pause film";
    };
    if (!reduceMotion.matches) v.play().then(() => setState(false)).catch(() => setState(true));
    else setState(true);
    motionBtn.addEventListener("click", () => { if (v.paused) { v.play(); setState(false); } else { v.pause(); setState(true); } });
  }

  /* ---------------- live Lagos clock ---------------- */
  const clock = $(".clock");
  const paintClock = () => {
    const n = lagosNow();
    const d = n.getUTCDay(), h = n.getUTCHours() + n.getUTCMinutes() / 60;
    const [o, c] = CONFIG.hours[d];
    const open = h >= o && h < c;
    let txt;
    if (open) txt = `Open now, until ${c}:00`;
    else if (h < o) txt = `Opens today at ${o}:00`;
    else { const nd = (d + 1) % 7; txt = `Closed, opens ${DAYS[nd]} ${CONFIG.hours[nd][0]}:00`; }
    clock.classList.toggle("is-open", open);
    $("#clockTime").textContent = fmtTime(n.getUTCHours() * 60 + n.getUTCMinutes());
    $("#clockState").textContent = txt;
  };
  paintClock();
  setInterval(paintClock, 15e3);

  /* ---------------- lens navigation ---------------- */
  const header = $("#header");
  const lens = $("#lens");
  const face = $("#lensFace");
  const faceLabel = $("#lensFaceLabel");
  const nowEl = $("#lensNow");
  const idxEl = $("#lensIndex");
  const ring = $("#lensProgress");
  const sheet = $("#sheet");
  const links = $$("#lensLinks a");
  const allNav = $$("[data-nav]");
  const pill = document.createElement("li");
  pill.className = "lens__pill"; pill.setAttribute("aria-hidden", "true");
  $("#lensLinks").appendChild(pill);
  const sections = $$("[data-section]");
  const RING = 119.38;

  const sheetOpen = () => sheet.classList.contains("is-open");
  const setSheet = (open) => {
    sheet.classList.toggle("is-open", open);
    sheet.setAttribute("aria-hidden", String(!open));
    sheet.inert = !open;
    face.setAttribute("aria-expanded", String(open));
    faceLabel.textContent = open ? "Close menu" : "Open menu";
    document.body.classList.toggle("locked", open);
    header.classList.toggle("on-dark", open || isOnDark());
    swapNow(open ? "Close" : currentLabel);
    if (open) setTimeout(() => $(".sheet__links a").focus({ preventScroll: true }), 300);
  };
  sheet.inert = true;

  const syncFaceRole = () => {
    face.setAttribute("aria-controls", mqMobile.matches ? "sheet" : "lensLinks");
    if (!mqMobile.matches && sheetOpen()) setSheet(false);
  };
  syncFaceRole();
  mqMobile.addEventListener("change", syncFaceRole);

  face.addEventListener("click", () => {
    if (mqMobile.matches) { setSheet(!sheetOpen()); return; }
    const open = !lens.classList.contains("is-open");
    lens.classList.toggle("is-open", open);
    face.setAttribute("aria-expanded", String(open));
    faceLabel.textContent = open ? "Collapse navigation" : "Expand navigation";
    if (open) links[0].focus();
  });
  $$("a", sheet).forEach((a) => a.addEventListener("click", () => setSheet(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (sheetOpen()) { setSheet(false); face.focus(); }
    else if (lens.classList.contains("is-open")) { lens.classList.remove("is-open"); face.setAttribute("aria-expanded", "false"); face.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (lens.classList.contains("is-open") && !lens.contains(e.target)) { lens.classList.remove("is-open"); face.setAttribute("aria-expanded", "false"); }
  });

  let currentLabel = "Studio";
  let swapTimer;
  function swapNow(text) {
    if (nowEl.textContent === text) return;
    clearTimeout(swapTimer);
    if (reduceMotion.matches) { nowEl.textContent = text; return; }
    nowEl.classList.remove("is-in"); nowEl.classList.add("is-out");
    swapTimer = setTimeout(() => {
      nowEl.textContent = text;
      nowEl.classList.remove("is-out"); void nowEl.offsetWidth; nowEl.classList.add("is-in");
    }, 230);
  }

  const movePill = (key) => {
    const link = links.find((a) => a.dataset.nav === key);
    if (!link) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = link.offsetWidth + "px";
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
  };

  const darkZones = $$("[data-dark]");
  function isOnDark() {
    const y = 40;
    return darkZones.some((z) => { const r = z.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
  }

  let activeKey = "";
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    ring.style.strokeDashoffset = (RING * (1 - p)).toFixed(2);

    const probe = innerHeight * 0.4;
    let cur = sections[0];
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= probe) cur = s; });
    const key = cur.dataset.section;
    if (key !== activeKey) {
      activeKey = key;
      currentLabel = cur.dataset.label;
      idxEl.textContent = cur.dataset.index;
      if (!sheetOpen()) swapNow(currentLabel);
      allNav.forEach((a) => {
        const on = a.dataset.nav === key;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      movePill(key);
    }
    if (!sheetOpen() && !$("#folio").open) header.classList.toggle("on-dark", isOnDark());
    header.classList.toggle("is-scrolled", scrollY > 60);
    ritualScroll();
  };
  addEventListener("scroll", onScroll, { passive: true });
  lens.addEventListener("transitionend", () => movePill(activeKey));
  addEventListener("resize", () => { movePill(activeKey); layoutRitual(); onScroll(); });

  /* ---------------- reveal ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------------- cut showcase ---------------- */
  const cutOrder = ["taper", "texture", "classic"];
  const tabs = $$('#cutTabs [role="tab"]');
  const thumb = $("#scaleThumb");
  const scale = $(".scale");
  const cutText = $("#cutText");
  const numeral = $(".showcase__numeral");
  const playBtn = $("#cutPlay");
  const showcaseEl = $("#cuts");
  let cutIdx = 0, textTimer, autoTimer;
  let userPaused = reduceMotion.matches, hovering = false, inView = false;
  scale.style.setProperty("--dur", CONFIG.showcaseSeconds + "s");

  const svcById = (id) => CONFIG.services.find((s) => s.id === id);
  const placeThumb = () => {
    const t = tabs[cutIdx];
    thumb.style.width = t.offsetWidth + "px";
    thumb.style.transform = `translateX(${t.offsetLeft}px)`;
  };

  const restartAuto = () => {
    clearTimeout(autoTimer);
    const playing = !userPaused && !hovering && inView && !document.hidden;
    scale.classList.remove("is-playing");
    if (!playing) return;
    void scale.offsetWidth;
    scale.classList.add("is-playing");
    autoTimer = setTimeout(() => setCut(cutIdx + 1), CONFIG.showcaseSeconds * 1000);
  };

  function setCut(i, { focus = false } = {}) {
    i = (i + cutOrder.length) % cutOrder.length;
    const changed = i !== cutIdx;
    cutIdx = i;
    const key = cutOrder[i];
    const cut = CONFIG.cuts[key];
    const svc = svcById(key);

    tabs.forEach((t, n) => { const on = n === i; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    if (focus) tabs[i].focus();
    $("#showcase").setAttribute("aria-labelledby", tabs[i].id);
    placeThumb();
    restartAuto();
    if (!changed) return;

    $$(".showcase__img").forEach((img) => img.classList.toggle("is-active", img.dataset.cut === key));
    const swap = () => {
      $("#cutName").textContent = cut.name;
      $("#cutDesc").textContent = cut.desc;
      $("#cutTag").textContent = cut.tag;
      $("#cutTime").textContent = `${svc.minutes} min`;
      $("#cutPrice").textContent = naira(svc.price);
      $("#cutRefresh").textContent = cut.refresh;
      $("#cutIndex").textContent = String(i + 1).padStart(2, "0");
      $("#cutNumeral").textContent = String(i + 1).padStart(2, "0");
      $("#bookCut").dataset.service = key;
    };
    clearTimeout(textTimer);
    if (reduceMotion.matches) { swap(); return; }
    cutText.classList.add("is-leaving");
    numeral.classList.add("is-swapping");
    textTimer = setTimeout(() => {
      swap();
      cutText.classList.remove("is-leaving");
      cutText.classList.add("is-entering");
      numeral.classList.remove("is-swapping");
      void cutText.offsetWidth;
      cutText.classList.remove("is-entering");
    }, 380);
  }

  tabs.forEach((t, n) => t.addEventListener("click", () => setCut(n)));
  $("#cutTabs").addEventListener("keydown", (e) => {
    const map = { ArrowRight: cutIdx + 1, ArrowLeft: cutIdx - 1, Home: 0, End: cutOrder.length - 1 };
    if (e.key in map) { e.preventDefault(); setCut(map[e.key], { focus: true }); }
  });
  $("#cutPrev").addEventListener("click", () => setCut(cutIdx - 1));
  $("#cutNext").addEventListener("click", () => setCut(cutIdx + 1));

  const paintPlay = () => {
    playBtn.setAttribute("aria-pressed", String(userPaused));
    playBtn.setAttribute("aria-label", userPaused ? "Play autoplay" : "Pause autoplay");
  };
  playBtn.addEventListener("click", () => { userPaused = !userPaused; paintPlay(); restartAuto(); });
  paintPlay();
  const body = $("#showcase");
  body.addEventListener("pointerenter", () => { hovering = true; restartAuto(); });
  body.addEventListener("pointerleave", () => { hovering = false; restartAuto(); });
  showcaseEl.addEventListener("focusin", () => { hovering = true; restartAuto(); });
  showcaseEl.addEventListener("focusout", (e) => { if (!showcaseEl.contains(e.relatedTarget)) { hovering = false; restartAuto(); } });
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; restartAuto(); }, { threshold: 0.35 }).observe(showcaseEl);
  document.addEventListener("visibilitychange", restartAuto);

  const media = $("#cutMedia");
  let sx = null, sy = 0;
  media.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; });
  media.addEventListener("pointerup", (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) setCut(cutIdx + (dx < 0 ? 1 : -1));
    sx = null;
  });
  media.addEventListener("pointercancel", () => { sx = null; });

  $("#bookCut").dataset.service = "taper";
  document.fonts && document.fonts.ready.then(() => { placeThumb(); movePill(activeKey); });
  addEventListener("resize", placeThumb);
  placeThumb();

  /* ---------------- before / after ---------------- */
  const cmp = $("#compare");
  const range = $(".compare__range", cmp);
  const before = $(".compare__img--before", cmp), after = $(".compare__img--after", cmp);
  before.src = cmp.dataset.before; before.alt = cmp.dataset.beforeAlt || "";
  after.src = cmp.dataset.after; after.alt = cmp.dataset.afterAlt || "";
  cmp.classList.toggle("is-demo", cmp.dataset.before === cmp.dataset.after);
  const minEl = $("#compareMin");

  const setPos = (p) => {
    p = Math.max(0, Math.min(100, p));
    cmp.style.setProperty("--pos", p + "%");
    range.value = p;
    const minute = Math.round(45 * (1 - p / 100));
    minEl.textContent = `Minute ${minute}`;
    range.setAttribute("aria-valuetext", `${Math.round(p)} percent before, minute ${minute} of 45`);
    $(".compare__tag--before", cmp).style.opacity = p < 12 ? 0 : 1;
    $(".compare__tag--after", cmp).style.opacity = p > 88 ? 0 : 1;
  };
  range.addEventListener("input", () => setPos(+range.value));
  let dragging = false, startX = 0, startY = 0, decided = false;
  const posFromEvent = (e) => { const r = cmp.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
  cmp.addEventListener("pointerdown", (e) => {
    dragging = true; decided = e.pointerType === "mouse"; startX = e.clientX; startY = e.clientY;
    if (decided) { e.preventDefault(); cmp.setPointerCapture(e.pointerId); cmp.classList.add("is-dragging"); setPos(posFromEvent(e)); }
  });
  cmp.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    if (!decided) {
      const dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
      if (dx < 6 && dy < 6) return;
      if (dy > dx) { dragging = false; return; }
      decided = true; cmp.setPointerCapture(e.pointerId); cmp.classList.add("is-dragging");
    }
    setPos(posFromEvent(e));
  });
  const endDrag = (e) => {
    if (dragging && !decided && e.type === "pointerup") setPos(posFromEvent(e));
    dragging = false; cmp.classList.remove("is-dragging");
  };
  cmp.addEventListener("pointerup", endDrag);
  cmp.addEventListener("pointercancel", endDrag);
  range.addEventListener("click", (e) => e.preventDefault());
  setPos(50);

  /* ---------------- ritual: vertical scroll drives a horizontal track ---------------- */
  const ritual = $("#ritual");
  const rTrack = $("#ritualTrack");
  const rView = $("#ritualViewport");
  const rBar = $("#ritualBar").parentElement;
  let rDistance = 0;
  const pinned = () => !mqMobile.matches && !reduceMotion.matches;
  function layoutRitual() {
    if (!pinned()) { ritual.style.height = ""; rTrack.style.transform = ""; return; }
    rDistance = Math.max(0, rTrack.scrollWidth - innerWidth);
    ritual.style.height = `${innerHeight + rDistance}px`;
  }
  function ritualScroll() {
    if (!pinned()) return;
    const r = ritual.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    rTrack.style.transform = `translate3d(${-p * rDistance}px, 0, 0)`;
    rBar.style.setProperty("--p", p.toFixed(4));
  }
  rView.addEventListener("scroll", () => {
    if (pinned()) return;
    const max = rView.scrollWidth - rView.clientWidth;
    rBar.style.setProperty("--p", max > 0 ? (rView.scrollLeft / max).toFixed(4) : 0);
  }, { passive: true });
  rView.addEventListener("keydown", (e) => {
    if (!pinned() || !["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    const step = innerHeight * 0.5 * (e.key === "ArrowRight" ? 1 : -1);
    scrollBy({ top: step, behavior: smooth() });
  });
  layoutRitual();
  addEventListener("load", () => { layoutRitual(); onScroll(); });

  /* ---------------- people: floating preview ---------------- */
  const peek = $(".peek"), peekImg = $("img", peek);
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let px = 0, py = 0, tx = 0, ty = 0, raf = 0;
    const follow = () => { px += (tx - px) * 0.16; py += (ty - py) * 0.16; peek.style.left = px + "px"; peek.style.top = py + "px"; raf = requestAnimationFrame(follow); };
    $$(".roster__row").forEach((row) => {
      row.addEventListener("pointerenter", (e) => {
        peekImg.src = row.dataset.preview;
        tx = px = e.clientX + 150; ty = py = e.clientY;
        peek.classList.add("is-on");
        cancelAnimationFrame(raf); follow();
      });
      row.addEventListener("pointermove", (e) => { tx = e.clientX + 150; ty = e.clientY; });
      row.addEventListener("pointerleave", () => { peek.classList.remove("is-on"); setTimeout(() => cancelAnimationFrame(raf), 400); });
    });
    // the whole row opens the portfolio
    $$(".roster__row").forEach((row) => row.addEventListener("click", (e) => { if (!e.target.closest("button")) $(".roster__cta", row).click(); }));
  }

  /* ---------------- booking ---------------- */
  const form = $("#bookForm");
  $("#serviceOptions").innerHTML = CONFIG.services.map((s, i, a) => `
    <label class="stub${i === a.length - 1 && a.length % 2 ? " stub--wide" : ""}">
      <input type="radio" name="service" value="${s.id}" />
      <span class="stub__body">
        <span class="stub__main"><b>${s.name}</b><small>${s.note}</small><span class="stub__min">${s.minutes} min</span></span>
        <span class="stub__side"><small>From</small><strong>${naira(s.price)}</strong></span>
      </span>
    </label>`).join("");

  // day strip: next 14 days in Lagos time
  const dateIn = $("#bDate");
  const todayIso = () => isoDay(lagosNow());
  const resetDateBounds = () => {
    dateIn.min = todayIso();
    const maxD = lagosNow(); maxD.setUTCDate(maxD.getUTCDate() + 60);
    dateIn.max = isoDay(maxD);
  };
  resetDateBounds();
  const buildDays = () => {
    const t = lagosNow();
    let html = "";
    for (let i = 0; i < 14; i++) {
      const d = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + i));
      const iso = isoDay(d);
      const lbl = i === 0 ? "Today" : DAYS[d.getUTCDay()];
      html += `<label class="day"><input type="radio" name="day" value="${iso}" aria-label="${fmtDate(d)}" /><span><small>${lbl}</small><strong>${d.getUTCDate()}</strong><small>${MONTHS[d.getUTCMonth()]}</small></span></label>`;
    }
    $("#dayStrip").innerHTML = html;
  };
  buildDays();

  let chosenDate = "";
  const val = (name) => { const el = form.elements[name]; return el ? el.value : ""; };
  const dateValid = (iso) => !!iso && iso >= dateIn.min && iso <= dateIn.max;
  const state = () => {
    const svc = svcById(val("service"));
    const towel = $("#addonTowel").checked;
    return {
      svc, towel,
      barber: val("barber"),
      date: chosenDate,
      time: val("time"),
      name: $("#bName").value.trim(),
      phone: $("#bPhone").value.trim(),
      minutes: svc ? svc.minutes + (towel ? CONFIG.towel.minutes : 0) : 0,
      total: svc ? svc.price + (towel ? CONFIG.towel.price : 0) : 0,
    };
  };

  const busy = (barber, iso, mins) => {
    let h = 0;
    for (const ch of barber + iso + mins) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h % 5 === 0;
  };

  const slotsEl = $("#slots");
  const renderSlots = () => {
    const s = state();
    const prev = s.time;
    if (!dateValid(s.date)) {
      slotsEl.innerHTML = `<p class="hint">${s.date ? "Choose a date from today onwards." : "Pick a day to see open times."}</p>`;
      return;
    }
    const d = parseIso(s.date);
    const [o, c] = CONFIG.hours[d.getUTCDay()];
    const len = s.minutes || 45;
    const now = lagosNow();
    const nowMins = now.getUTCHours() * 60 + now.getUTCMinutes();
    const isToday = s.date === todayIso();
    const who = s.barber && s.barber !== "any" ? [s.barber] : ["miles", "andre"];
    const groups = [["Morning", 0, 12 * 60], ["Afternoon", 12 * 60, 16 * 60], ["Evening", 16 * 60, 24 * 60]];
    let html = "", any = false;
    groups.forEach(([label, from, to]) => {
      let row = "";
      for (let m = o * 60; m + len <= c * 60; m += 30) {
        if (m < from || m >= to) continue;
        const past = isToday && m <= nowMins + 30;
        const taken = who.every((b) => busy(b, s.date, m));
        const dis = past || taken;
        if (!dis) any = true;
        const t = fmtTime(m);
        row += `<label class="slot"><input type="radio" name="time" value="${t}" ${dis ? "disabled" : ""} ${!dis && t === prev ? "checked" : ""} /><span>${t}<span class="sr">${past ? ", unavailable" : taken ? ", booked" : ""}</span></span></label>`;
      }
      if (row) html += `<div class="slots__row"><span class="slots__label">${label}</span><div class="slots__grid">${row}</div></div>`;
    });
    slotsEl.innerHTML = any ? html : `<p class="hint">No open times left on this day. Try the next one.</p>`;
  };

  const steps = { service: false, barber: false, date: false, time: false, details: false };
  const paintSteps = () => {
    const s = state();
    steps.service = !!s.svc;
    steps.barber = !!s.barber;
    steps.date = dateValid(s.date);
    steps.time = !!s.time;
    steps.details = !!s.name && s.phone.replace(/\D/g, "").length >= 10;
    $$(".steps li").forEach((li) => li.classList.toggle("done", steps[li.dataset.step]));
  };

  const totalEl = $("#sTotal");
  let lastTotal = 0;
  const setDD = (id, text) => { const el = $(id); el.textContent = text || "Not chosen"; el.classList.toggle("is-empty", !text); };
  const renderSummary = () => {
    const s = state();
    setDD("#sService", s.svc ? s.svc.name + (s.towel ? " + hot towel" : "") : "");
    setDD("#sBarber", s.barber ? (s.barber === "any" ? "No preference" : CONFIG.barbers[s.barber].name) : "");
    setDD("#sDate", dateValid(s.date) ? fmtDate(parseIso(s.date)) : "");
    setDD("#sTime", s.time);
    $("#sDuration").textContent = `${s.minutes} min`;
    totalEl.textContent = naira(s.total);
    if (s.total !== lastTotal && !reduceMotion.matches) { totalEl.classList.remove("bump"); void totalEl.offsetWidth; totalEl.classList.add("bump"); }
    lastTotal = s.total;
    paintSteps();
  };

  const groups = {
    service: { el: $("#gService"), msg: $("#errService") },
    barber: { el: $("#gBarber"), msg: $("#errBarber") },
    date: { el: $("#gDate"), msg: $("#errDate") },
    time: { el: $("#gTime"), msg: $("#errTime") },
    details: { el: $("#gDetails"), msg: $("#errDetails") },
  };
  const setErr = (k, text) => { groups[k].el.classList.toggle("has-error", !!text); groups[k].msg.textContent = text || ""; };

  form.addEventListener("change", (e) => {
    const t = e.target;
    if (t.name === "day") { chosenDate = t.value; dateIn.value = ""; dateIn.classList.remove("is-set"); setErr("date"); }
    if (t.id === "bDate") {
      $$('input[name="day"]').forEach((r) => (r.checked = r.value === t.value));
      chosenDate = t.value;
      t.classList.toggle("is-set", !!t.value);
      setErr("date", t.value && !dateValid(t.value) ? "Please choose a date from today onwards." : "");
    }
    if (["service", "barber", "day"].includes(t.name) || ["addonTowel", "bDate"].includes(t.id)) renderSlots();
    if (t.name === "service") setErr("service");
    if (t.name === "barber") setErr("barber");
    if (t.name === "time") setErr("time");
    renderSummary();
  });
  form.addEventListener("input", (e) => { if (e.target.id === "bName" || e.target.id === "bPhone") { setErr("details"); renderSummary(); } });

  const validate = () => {
    const s = state();
    const errs = {};
    if (!s.svc) errs.service = "Choose a cut or service.";
    if (!s.barber) errs.barber = "Choose a barber, or no preference.";
    if (!s.date) errs.date = "Choose a day.";
    else if (!dateValid(s.date)) errs.date = "Please choose a date from today onwards.";
    if (!s.time) errs.time = s.date ? "Choose an open time." : "Choose a day first, then a time.";
    const digits = s.phone.replace(/\D/g, "");
    if (!s.name && digits.length < 10) errs.details = "Add your name and a phone number.";
    else if (!s.name) errs.details = "Add your name.";
    else if (digits.length < 10) errs.details = "Add a phone number with at least 10 digits.";
    Object.keys(groups).forEach((k) => setErr(k, errs[k]));
    return errs;
  };

  const status = $("#formStatus");
  let lastBooking = null;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errs = validate();
    const keys = Object.keys(errs);
    if (keys.length) {
      status.textContent = keys.length === 1 ? "One thing left to complete." : `${keys.length} things left to complete.`;
      status.classList.add("is-error");
      const first = groups[keys[0]].el;
      first.scrollIntoView({ behavior: smooth(), block: "start" });
      const f = $("input:not([disabled])", first);
      if (f) setTimeout(() => f.focus({ preventScroll: true }), 350);
      return;
    }
    status.textContent = "";
    status.classList.remove("is-error");

    const s = state();
    const ref = "FF" + Math.random().toString(36).slice(2, 7).toUpperCase();
    lastBooking = { ...s, ref };
    const barberName = s.barber === "any" ? "First available" : CONFIG.barbers[s.barber].name;
    $("#dName").textContent = s.name.split(" ")[0];
    $("#dRef").textContent = ref;
    $("#dList").innerHTML = [
      ["Cut", s.svc.name + (s.towel ? " + hot towel" : "")],
      ["Barber", barberName],
      ["When", `${fmtDate(parseIso(s.date))}, ${s.time}`],
      ["Duration", `${s.minutes} min`],
      ["Total", naira(s.total)],
      ["Studio", "12 Akin Adesola St, V.I."],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

    const wa = $("#waLink");
    if (CONFIG.whatsapp) {
      const msg = `Hello FORM & FADE, I just booked ${ref}.\n${s.svc.name}${s.towel ? " + hot towel" : ""} with ${barberName}\n${fmtDate(parseIso(s.date))} at ${s.time}\nName: ${s.name}, ${s.phone}`;
      wa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
      wa.hidden = false;
    } else wa.hidden = true;

    $("#summaryView").hidden = true;
    const done = $("#summaryDone");
    done.hidden = false;
    const rec = $("#summary");
    rec.classList.remove("is-done"); void rec.offsetWidth; rec.classList.add("is-done");
    done.focus({ preventScroll: true });
    if (innerWidth <= 1080) rec.scrollIntoView({ behavior: smooth(), block: "center" });
    const fields = $(".bform__fields");
    fields.inert = true; fields.classList.add("is-locked");
  });

  $("#bookAgain").addEventListener("click", () => {
    const fields = $(".bform__fields");
    fields.inert = false; fields.classList.remove("is-locked");
    form.reset();
    chosenDate = "";
    resetDateBounds(); buildDays();
    dateIn.classList.remove("is-set");
    $("#summaryDone").hidden = true;
    $("#summaryView").hidden = false;
    $("#summary").classList.remove("is-done");
    renderSlots(); renderSummary();
    status.textContent = "Free cancellation up to 4 hours before.";
    $("#gService").scrollIntoView({ behavior: smooth(), block: "start" });
  });

  $("#addCal").addEventListener("click", () => {
    if (!lastBooking) return;
    const b = lastBooking;
    const [hh, mm] = b.time.split(":").map(Number);
    const d = parseIso(b.date);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hh - 1, mm)); // Lagos to UTC
    const end = new Date(start.getTime() + b.minutes * 60e3);
    const stamp = (x) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const barberName = b.barber === "any" ? "First available" : CONFIG.barbers[b.barber].name;
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FORM AND FADE//Booking//EN", "BEGIN:VEVENT",
      `UID:${b.ref}@formandfade`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
      `SUMMARY:${b.svc.name} at FORM & FADE`,
      `DESCRIPTION:Reference ${b.ref}. Barber: ${barberName}.`,
      "LOCATION:12 Akin Adesola Street\\, Victoria Island\\, Lagos",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `form-and-fade-${b.ref}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  const preselect = (name, value) => {
    const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (!input || input.disabled || form.querySelector(".bform__fields").inert) return;
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  $("#bookCut").addEventListener("click", () => preselect("service", $("#bookCut").dataset.service));

  renderSlots();
  renderSummary();

  /* ---------------- portfolio drawer ---------------- */
  const folio = $("#folio");
  let folioBarber = null, lastTrigger = null;
  const openFolio = (id, trigger) => {
    const b = CONFIG.barbers[id];
    folioBarber = id; lastTrigger = trigger;
    $("#folioName").textContent = b.name;
    $("#folioRole").textContent = b.role;
    $("#folioBio").textContent = b.bio;
    $("#folioSpec").textContent = b.spec;
    $("#folioBookName").textContent = b.name;
    $("#folioStats").innerHTML = b.stats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    $("#folioStrip").innerHTML = b.work.map((w) => `<figure><img src="${w.src}" alt="${w.alt}" loading="lazy" /><figcaption><em>${w.cap}</em></figcaption></figure>`).join("");
    $("#folioStrip").scrollLeft = 0;
    folio.showModal();
    document.body.classList.add("locked");
    header.classList.add("on-dark");
    peek.classList.remove("is-on");
  };
  const closeFolio = (after) => {
    if (!folio.open) return;
    if (reduceMotion.matches) { folio.close(); after && after(); return; }
    folio.classList.add("is-closing");
    setTimeout(() => { folio.classList.remove("is-closing"); folio.close(); after && after(); }, 420);
  };
  folio.addEventListener("cancel", (e) => { e.preventDefault(); closeFolio(); });
  folio.addEventListener("close", () => {
    document.body.classList.remove("locked");
    onScroll();
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });
  $$(".roster__cta").forEach((btn) => btn.addEventListener("click", () => openFolio(btn.dataset.barber, btn)));
  $("#folioClose").addEventListener("click", () => closeFolio());
  folio.addEventListener("click", (e) => { if (e.target === folio) closeFolio(); });
  $("#folioBook").addEventListener("click", () => {
    const id = folioBarber;
    lastTrigger = null;
    closeFolio(() => {
      preselect("barber", id);
      $("#book").scrollIntoView({ behavior: smooth() });
      setTimeout(() => { const el = form.querySelector('input[name="service"]:checked') || form.querySelector('input[name="service"]'); el && el.focus({ preventScroll: true }); }, reduceMotion.matches ? 0 : 800);
    });
  });

  onScroll();
})();
