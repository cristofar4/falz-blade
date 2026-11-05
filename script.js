/* =========================================================
   FORM & FADE · interactions
   Everything editable lives in CONFIG.
   ========================================================= */
const CONFIG = {
  // Path or URL to a hero film (mp4/webm). Leave empty to use the photograph only.
  heroVideo: "",
  // WhatsApp number in international format, digits only (e.g. "2348030000000").
  // When set, confirmed bookings offer a prefilled WhatsApp message to the studio.
  whatsapp: "",

  hours: { 0: [12, 18], 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [10, 20] },

  services: [
    { id: "taper",   name: "The Taper",     minutes: 45, price: 25000, note: "Fade, line and finish" },
    { id: "texture", name: "Textured Top",  minutes: 60, price: 32000, note: "Curl shaping and fade" },
    { id: "classic", name: "The Classic",   minutes: 50, price: 28000, note: "Side part and taper" },
    { id: "beard",   name: "Beard Sculpt",  minutes: 30, price: 15000, note: "Shape, razor and oil" },
    { id: "full",    name: "Cut and Beard", minutes: 75, price: 38000, note: "Any cut with beard sculpt" },
  ],
  towel: { name: "Hot towel finish", minutes: 10, price: 5000 },

  cuts: {
    taper: {
      name: "The Taper",
      desc: "A gradual fade that cleans the neckline and sides while keeping your shape soft and natural. Finished with a razor line.",
    },
    texture: {
      name: "Textured Top",
      desc: "Short, faded sides with defined curls on top. We shape the volume so your natural texture does the work.",
    },
    classic: {
      name: "The Classic",
      desc: "A tailored side part over a clean taper, styled with a matte finish for the boardroom or the evening.",
    },
  },

  barbers: {
    miles: {
      name: "Miles",
      role: "Senior barber",
      spec: "Skin fades, textured tops, curl definition",
      bio: "Eleven years behind the chair, from Yaba to Victoria Island. Miles reads growth patterns like a map and is known for fades that still look sharp on day ten.",
      work: [
        { src: "assets/img/miles-1.jpg", alt: "Client in a barber cape being blow dried after a fade", cap: "Blow out and fade" },
        { src: "assets/img/miles-2.jpg", alt: "Sharp taper with a hard part, styled back", cap: "Hard part taper" },
        { src: "assets/img/miles-3.jpg", alt: "Skin fade with a textured crop seen from behind", cap: "Skin fade, textured crop" },
      ],
    },
    andre: {
      name: "Andre",
      role: "Master barber",
      spec: "Classic cuts, scissor work, beard sculpting",
      bio: "Trained in London, settled in Lagos. Andre is the studio's scissor specialist and the person to see for a beard that frames the face rather than hides it.",
      work: [
        { src: "assets/img/andre-1.jpg", alt: "Barber refining a classic cut with clippers and comb", cap: "Scissor over comb" },
        { src: "assets/img/andre-2.jpg", alt: "Detailed fade with a sculpted beard", cap: "Fade and beard design" },
        { src: "assets/img/andre-3.jpg", alt: "Beard being lathered with a brush before a razor shave", cap: "Hot lather shave" },
      ],
    },
  },
};

(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const naira = (n) => "₦" + n.toLocaleString("en-NG");
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Lagos is UTC+1 all year. Read these Date objects with getUTC* methods.
  const lagosNow = () => new Date(Date.now() + 3600e3);
  const isoDay = (d) => d.toISOString().slice(0, 10);
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const fmtDate = (d) => `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const fmtTime = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

  $("#year").textContent = lagosNow().getUTCFullYear();

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
    heroMedia.insertBefore(v, motionBtn);
    motionBtn.hidden = false;
    const setState = (paused) => {
      motionBtn.setAttribute("aria-pressed", String(paused));
      $(".hero__motion-text", motionBtn).textContent = paused ? "Play film" : "Pause film";
    };
    if (!reduceMotion.matches) v.play().then(() => setState(false)).catch(() => setState(true));
    else setState(true);
    motionBtn.addEventListener("click", () => {
      if (v.paused) { v.play(); setState(false); } else { v.pause(); setState(true); }
    });
  }

  /* ---------------- open status ---------------- */
  const statusEl = $("#openStatus");
  const paintStatus = () => {
    const n = lagosNow();
    const d = n.getUTCDay(), h = n.getUTCHours() + n.getUTCMinutes() / 60;
    const [o, c] = CONFIG.hours[d];
    const open = h >= o && h < c;
    let txt;
    if (open) txt = `Open until ${c}:00`;
    else if (h < o) txt = `Opens at ${o}:00`;
    else { const nd = (d + 1) % 7; txt = `Opens ${DAYS[nd]} at ${CONFIG.hours[nd][0]}:00`; }
    statusEl.classList.toggle("is-open", open);
    $("dd", statusEl).textContent = txt;
  };
  paintStatus();
  setInterval(paintStatus, 60e3);

  /* ---------------- navigation ---------------- */
  const header = $("#header");
  const dock = $("#dock");
  const toggle = $("#menuToggle");
  const navLinks = $$("[data-nav]", dock);
  const pill = $(".dock__pill");
  const sections = $$("[data-section]");
  const darkZones = [$(".showcase"), $(".folio")].filter(Boolean);
  const mqMobile = matchMedia("(max-width: 860px)");

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    dock.classList.toggle("is-open", open);
    if (open) setTimeout(() => $(".dock__links a").focus({ preventScroll: true }), 60);
  };
  toggle.setAttribute("aria-label", "Open menu");
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  navLinks.forEach((a) => a.addEventListener("click", () => { if (dock.classList.contains("is-open")) setMenu(false); }));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dock.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  document.addEventListener("click", (e) => { if (dock.classList.contains("is-open") && !dock.contains(e.target)) setMenu(false); });
  mqMobile.addEventListener("change", () => setMenu(false));

  let activeKey = "";
  const movePill = () => {
    const link = navLinks.find((a) => a.dataset.nav === activeKey && a.closest(".dock__links"));
    if (!link || mqMobile.matches) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = link.offsetWidth + "px";
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
  };
  const onScroll = () => {
    const probe = innerHeight * 0.4;
    let key = sections[0].dataset.section;
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= probe) key = s.dataset.section; });
    if (key !== activeKey) {
      activeKey = key;
      navLinks.forEach((a) => {
        const on = a.dataset.nav === key;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      movePill();
    }
    const y = header.offsetHeight / 2;
    const onDark = darkZones.some((z) => { const r = z.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
    header.classList.toggle("on-dark", onDark);
    header.classList.toggle("is-scrolled", scrollY > 60);
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", movePill);
  document.fonts && document.fonts.ready.then(movePill);
  onScroll();

  /* ---------------- reveal ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------------- cut showcase ---------------- */
  const cutOrder = ["taper", "texture", "classic"];
  const tabs = $$('#cutTabs [role="tab"]');
  const tabLine = $(".tabs__line");
  const cutText = $("#cutText");
  let cutIdx = 0;
  let textTimer;

  const placeLine = () => {
    const t = tabs[cutIdx];
    tabLine.style.width = t.offsetWidth + "px";
    tabLine.style.transform = `translateX(${t.offsetLeft}px)`;
  };

  const svcById = (id) => CONFIG.services.find((s) => s.id === id);

  const setCut = (i, { focus = false } = {}) => {
    i = (i + cutOrder.length) % cutOrder.length;
    if (i === cutIdx && !focus) return;
    cutIdx = i;
    const key = cutOrder[i];
    const cut = CONFIG.cuts[key];
    const svc = svcById(key);

    tabs.forEach((t, n) => {
      const on = n === i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) tabs[i].focus();
    $("#showcase").setAttribute("aria-labelledby", tabs[i].id);
    placeLine();

    $$(".showcase__img").forEach((img) => img.classList.toggle("is-active", img.dataset.cut === key));

    const swap = () => {
      $("#cutName").textContent = cut.name;
      $("#cutDesc").textContent = cut.desc;
      $("#cutTime").textContent = `${svc.minutes} min`;
      $("#cutPrice").textContent = naira(svc.price);
      $("#cutIndex").textContent = String(i + 1).padStart(2, "0");
      $("#bookCut").dataset.service = key;
    };
    clearTimeout(textTimer);
    if (reduceMotion.matches) { swap(); return; }
    cutText.classList.add("is-leaving");
    textTimer = setTimeout(() => {
      swap();
      cutText.classList.remove("is-leaving");
      cutText.classList.add("is-entering");
      void cutText.offsetWidth;
      cutText.classList.remove("is-entering");
    }, 380);
  };

  tabs.forEach((t, n) => t.addEventListener("click", () => setCut(n)));
  $("#cutTabs").addEventListener("keydown", (e) => {
    const map = { ArrowRight: cutIdx + 1, ArrowLeft: cutIdx - 1, Home: 0, End: cutOrder.length - 1 };
    if (e.key in map) { e.preventDefault(); setCut(map[e.key], { focus: true }); }
  });
  $("#cutPrev").addEventListener("click", () => setCut(cutIdx - 1));
  $("#cutNext").addEventListener("click", () => setCut(cutIdx + 1));

  // swipe on the photograph
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
  addEventListener("resize", placeLine);
  document.fonts && document.fonts.ready.then(placeLine);
  placeLine();

  /* ---------------- before / after ---------------- */
  const cmp = $("#compare");
  const range = $(".compare__range", cmp);
  const before = $(".compare__img--before", cmp), after = $(".compare__img--after", cmp);
  before.src = cmp.dataset.before; before.alt = cmp.dataset.beforeAlt || "";
  after.src = cmp.dataset.after; after.alt = cmp.dataset.afterAlt || "";
  // Until a real matching pair is supplied, show the same frame with a muted "before" treatment.
  cmp.classList.toggle("is-demo", cmp.dataset.before === cmp.dataset.after);

  const setPos = (p) => {
    p = Math.max(0, Math.min(100, p));
    cmp.style.setProperty("--pos", p + "%");
    range.value = p;
    range.setAttribute("aria-valuetext", `${Math.round(p)} percent before`);
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
      if (dy > dx) { dragging = false; return; } // vertical: let the page scroll
      decided = true; cmp.setPointerCapture(e.pointerId); cmp.classList.add("is-dragging");
    }
    setPos(posFromEvent(e));
  });
  const endDrag = (e) => {
    if (dragging && !decided && e.type === "pointerup") setPos(posFromEvent(e)); // a tap jumps the divider
    dragging = false; cmp.classList.remove("is-dragging");
  };
  cmp.addEventListener("pointerup", endDrag);
  cmp.addEventListener("pointercancel", endDrag);
  range.addEventListener("click", (e) => e.preventDefault());
  setPos(50);

  /* ---------------- booking ---------------- */
  const form = $("#bookForm");
  const svcWrap = $("#serviceOptions");
  svcWrap.innerHTML = CONFIG.services.map((s) => `
    <label class="opt">
      <input type="radio" name="service" value="${s.id}" />
      <span class="opt__body"><b>${s.name}</b><small>${s.minutes} min · ${s.note}</small><span class="opt__price">${naira(s.price)}</span></span>
    </label>`).join("");

  const dateIn = $("#bDate");
  const slotsEl = $("#slots");
  const todayIso = () => isoDay(lagosNow());
  dateIn.min = todayIso();
  const maxD = lagosNow(); maxD.setUTCDate(maxD.getUTCDate() + 60);
  dateIn.max = isoDay(maxD);

  const val = (name) => { const el = form.elements[name]; return el ? el.value : ""; };
  const state = () => {
    const svc = svcById(val("service"));
    const towel = $("#addonTowel").checked;
    return {
      svc, towel,
      barber: val("barber"),
      date: dateIn.value,
      time: val("time"),
      name: $("#bName").value.trim(),
      phone: $("#bPhone").value.trim(),
      minutes: svc ? svc.minutes + (towel ? CONFIG.towel.minutes : 0) : 0,
      total: svc ? svc.price + (towel ? CONFIG.towel.price : 0) : 0,
    };
  };

  // deterministic "already booked" slots so the schedule feels real
  const busy = (barber, iso, mins) => {
    let h = 0;
    for (const ch of barber + iso + mins) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h % 5 === 0;
  };
  const dateValid = (iso) => iso && iso >= dateIn.min && iso <= dateIn.max;

  const renderSlots = () => {
    const s = state();
    const prev = s.time;
    if (!dateValid(s.date)) {
      slotsEl.innerHTML = `<p class="hint">${s.date ? "Choose a date from today onwards." : "Pick a date to see open times."}</p>`;
      return;
    }
    const d = parseIso(s.date);
    const [o, c] = CONFIG.hours[d.getUTCDay()];
    const len = s.minutes || 45;
    const now = lagosNow();
    const nowMins = now.getUTCHours() * 60 + now.getUTCMinutes();
    const isToday = s.date === todayIso();
    const who = s.barber && s.barber !== "any" ? [s.barber] : ["miles", "andre"];
    let html = "", any = false;
    for (let m = o * 60; m + len <= c * 60; m += 30) {
      const past = isToday && m <= nowMins + 30;
      const taken = who.every((b) => busy(b, s.date, m));
      const dis = past || taken;
      if (!dis) any = true;
      const t = fmtTime(m);
      html += `<label class="slot"><input type="radio" name="time" value="${t}" ${dis ? "disabled" : ""} ${!dis && t === prev ? "checked" : ""} /><span>${t}<span class="sr">${past ? ", unavailable" : taken ? ", booked" : ""}</span></span></label>`;
    }
    slotsEl.innerHTML = any ? html : `<p class="hint">No open times left on this day. Try the next one.</p>`;
  };

  const setDD = (id, text) => { const el = $(id); el.textContent = text || "Not chosen"; el.classList.toggle("is-empty", !text); };
  const renderSummary = () => {
    const s = state();
    setDD("#sService", s.svc ? s.svc.name + (s.towel ? " + hot towel" : "") : "");
    setDD("#sBarber", s.barber ? (s.barber === "any" ? "No preference" : CONFIG.barbers[s.barber].name) : "");
    setDD("#sDate", dateValid(s.date) ? fmtDate(parseIso(s.date)) : "");
    setDD("#sTime", s.time);
    $("#sDuration").textContent = `${s.minutes} min`;
    $("#sTotal").textContent = naira(s.total);
  };

  const groups = {
    service: { el: $("#gService"), msg: $("#errService") },
    barber: { el: $("#gBarber"), msg: $("#errBarber") },
    date: { el: $("#gDate"), msg: $("#errDate") },
    time: { el: $("#gTime"), msg: $("#errTime") },
    details: { el: $("#bName").closest(".group"), msg: $("#errDetails") },
  };
  const setErr = (k, text) => {
    groups[k].el.classList.toggle("has-error", !!text);
    groups[k].msg.textContent = text || "";
  };

  form.addEventListener("change", (e) => {
    const n = e.target.name || e.target.id;
    if (n === "service" || n === "addonTowel" || n === "barber" || n === "bDate") renderSlots();
    if (n === "service") setErr("service");
    if (n === "barber") setErr("barber");
    if (n === "bDate") setErr("date", dateIn.value && !dateValid(dateIn.value) ? "Please choose a date from today onwards." : "");
    if (n === "time") setErr("time");
    renderSummary();
  });
  form.addEventListener("input", (e) => {
    if (e.target.id === "bName" || e.target.id === "bPhone") setErr("details");
    if (e.target.id === "bDate") { renderSlots(); renderSummary(); }
  });

  const validate = () => {
    const s = state();
    const errs = {};
    if (!s.svc) errs.service = "Choose a service.";
    if (!s.barber) errs.barber = "Choose a barber, or no preference.";
    if (!s.date) errs.date = "Choose a date.";
    else if (!dateValid(s.date)) errs.date = "Please choose a date from today onwards.";
    if (!s.time) errs.time = s.date ? "Choose an open time." : "Choose a date first, then a time.";
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
      first.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      const focusable = $("input:not([disabled])", first);
      if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 300);
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
      ["Service", s.svc.name + (s.towel ? " + hot towel" : "")],
      ["Barber", barberName],
      ["When", `${fmtDate(parseIso(s.date))}, ${s.time}`],
      ["Duration", `${s.minutes} min`],
      ["Total", naira(s.total)],
      ["Studio", "12 Akin Adesola St, Victoria Island"],
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
    const sum = $("#summary");
    sum.classList.remove("is-done"); void sum.offsetWidth; sum.classList.add("is-done");
    done.focus({ preventScroll: true });
    if (mqMobile.matches || innerWidth < 1080) sum.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
    const fields = $(".bform__fields");
    fields.inert = true; fields.classList.add("is-locked");
  });

  $("#bookAgain").addEventListener("click", () => {
    const fields = $(".bform__fields");
    fields.inert = false; fields.classList.remove("is-locked");
    form.reset();
    dateIn.min = todayIso();
    $("#summaryDone").hidden = true;
    $("#summaryView").hidden = false;
    renderSlots(); renderSummary();
    status.textContent = "Free cancellation up to 4 hours before.";
    $("#gService").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
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

  // carry a choice into the form, then scroll there
  const preselect = (name, value) => {
    const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (!input || input.disabled) return;
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    const opt = input.closest(".opt");
    if (opt && !reduceMotion.matches) opt.animate([{ transform: "translateX(-8px)" }, { transform: "none" }], { duration: 500, easing: "cubic-bezier(.22,.8,.2,1)" });
  };
  $("#bookCut").addEventListener("click", () => preselect("service", $("#bookCut").dataset.service));

  renderSlots();
  renderSummary();

  /* ---------------- portfolio overlay ---------------- */
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
    $("#folioStrip").innerHTML = b.work.map((w) => `
      <figure><img src="${w.src}" alt="${w.alt}" loading="lazy" /><figcaption><em>${w.cap}</em></figcaption></figure>`).join("");
    folio.showModal();
    document.body.style.overflow = "hidden";
    header.classList.add("on-dark");
  };
  const closeFolio = () => { if (folio.open) folio.close(); };
  folio.addEventListener("close", () => {
    document.body.style.overflow = "";
    onScroll();
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });
  $$(".roster__cta").forEach((btn) => btn.addEventListener("click", () => openFolio(btn.dataset.barber, btn)));
  $("#folioClose").addEventListener("click", closeFolio);
  folio.addEventListener("click", (e) => { if (e.target === folio) closeFolio(); });
  $("#folioBook").addEventListener("click", () => {
    const id = folioBarber;
    lastTrigger = null;
    closeFolio();
    preselect("barber", id);
    $("#book").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
    setTimeout(() => { const el = form.querySelector('input[name="service"]:checked') || form.querySelector('input[name="service"]'); el && el.focus({ preventScroll: true }); }, reduceMotion.matches ? 0 : 700);
  });
})();
