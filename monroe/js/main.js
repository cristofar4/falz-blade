/* =========================================================
   MONROE · interactions
   Content comes from js/data.js (window.MONROE).
   ========================================================= */
(() => {
  "use strict";
  const D = window.MONROE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 860px)");
  const behavior = () => (reduce.matches ? "auto" : "smooth");
  const naira = (n) => "₦" + n.toLocaleString("en-NG");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const svc = (id) => D.services.find((s) => s.id === id);
  const barber = (id) => D.barbers.find((b) => b.id === id);

  /** Build an <img> for a media entry from data.js. */
  const img = (m, sizes, cls = "", extra = "") => {
    const srcset = m.widths.map((w) => `${m.base}-${w}.webp ${w}w`).join(", ");
    const mid = m.widths[Math.min(1, m.widths.length - 1)];
    return `<img class="${cls}" src="${m.base}-${mid}.webp" srcset="${srcset}" sizes="${sizes}" alt="${esc(m.alt)}" style="--pos:${m.pos}" loading="lazy" decoding="async" ${extra} />`;
  };

  // Studio local time. Read with getUTC* methods.
  const studioNow = () => new Date(Date.now() + D.business.utcOffset * 3600e3);
  const iso = (d) => d.toISOString().slice(0, 10);
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const fmtDate = (d) => `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  const fmtTime = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

  requestAnimationFrame(() => setTimeout(() => document.body.classList.add("is-loaded"), 60));
  $("#year").textContent = studioNow().getUTCFullYear();

  /* ---------------- business details ---------------- */
  $$("[data-hours]").forEach((ul) => { ul.innerHTML = D.business.hoursLabel.map(([d, t]) => `<li><span>${esc(d)}</span><span>${esc(t)}</span></li>`).join(""); });
  $$("[data-location]").forEach((p) => { p.innerHTML = D.business.location.map(esc).join("<br />"); });
  $$("[data-contact]").forEach((p) => {
    const parts = [];
    if (D.business.email) parts.push(`<a href="mailto:${esc(D.business.email)}">${esc(D.business.email)}</a>`);
    if (D.business.phone) parts.push(`<a href="tel:${esc(D.business.phone.replace(/\s/g, ""))}">${esc(D.business.phone)}</a>`);
    p.innerHTML = parts.join("<br />");
    p.hidden = !parts.length;
  });
  // Profiles without a URL show as plain labels until real links are added in data.js.
  $("#social").innerHTML = D.business.social.map((s) => s.url
    ? `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`
    : `<li><span class="is-pending">${esc(s.label)}</span></li>`).join("");

  /* ---------------- hero: optional film + gentle drift ---------------- */
  const heroStudio = $("#heroStudio");
  const heroImg = $(".hero__img", heroStudio);
  if (D.heroVideo && D.heroVideo.src && !reduce.matches) {
    const v = document.createElement("video");
    v.className = "hero__video";
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.setAttribute("aria-hidden", "true");
    v.poster = heroImg.currentSrc || heroImg.src;
    v.preload = "metadata";
    const source = document.createElement("source");
    source.src = D.heroVideo.src; source.type = D.heroVideo.type || "video/mp4";
    v.appendChild(source);
    heroImg.after(v);
    v.play().catch(() => v.remove()); // if autoplay is blocked, keep the photograph
  }

  const portraitFrame = $(".hero__portrait-frame");
  const carveNotch = () => {
    if (mobile.matches) { heroStudio.style.removeProperty("clip-path"); return; }
    // offsets ignore the reveal transform, so the notch matches the portrait's final position
    const fig = portraitFrame.parentElement;
    const x = fig.offsetLeft - heroStudio.offsetLeft;
    const y = fig.offsetTop - heroStudio.offsetTop + portraitFrame.offsetHeight;
    if (y >= heroStudio.offsetHeight) { heroStudio.style.removeProperty("clip-path"); return; }
    heroStudio.style.clipPath = `polygon(0 0, 100% 0, 100% ${y}px, ${x}px ${y}px, ${x}px 100%, 0 100%)`;
  };
  carveNotch();
  addEventListener("resize", carveNotch);
  addEventListener("load", carveNotch);

  /* ---------------- navigation ---------------- */
  const nav = $("#nav");
  const menu = $("#menu");
  const menuBtn = $("#menuBtn");
  const navLinks = $$("[data-nav]");
  const sections = $$("[data-section]");

  const setMenu = (open) => {
    if (open) { menu.hidden = false; void menu.offsetWidth; }
    menu.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("is-locked", open);
    $("#main").inert = open;
    $(".footer").inert = open;
    if (open) setTimeout(() => $(".menu__links a").focus(), reduce.matches ? 0 : 250);
    else setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, reduce.matches ? 0 : 600);
  };
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (!menu.classList.contains("is-open")) return;
    if (e.key === "Escape") { setMenu(false); menuBtn.focus(); return; }
    if (e.key === "Tab") { // keep focus inside the open menu (and its toggle)
      const items = [menuBtn, ...$$("a", menu)];
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  mobile.addEventListener("change", () => { if (!mobile.matches && menu.classList.contains("is-open")) setMenu(false); });

  let active = "";
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", scrollY > 8);
    const probe = innerHeight * 0.38;
    let key = sections[0].dataset.section;
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= probe) key = s.dataset.section; });
    if (key !== active) {
      active = key;
      navLinks.forEach((a) => {
        const on = a.dataset.nav === key;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    }
    if (!reduce.matches) { // gentle parallax on the studio photo while it is in view
      const r = heroStudio.getBoundingClientRect();
      if (r.bottom > 0) heroStudio.style.setProperty("--py", `${Math.round(-r.top * 0.1)}px`);
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- reveals ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------------- cut library ---------------- */
  const track = $("#galleryTrack");
  const dots = $("#galleryDots");
  track.innerHTML = D.cuts.map((c, i) => {
    const s = svc(c.service);
    return `
    <article class="panel${i === 0 ? " is-active" : ""}" data-index="${i}" aria-label="${pad(i + 1)}, ${esc(s.name)}">
      ${img(c.image, "(max-width: 860px) 84vw, 64vw", "panel__img")}
      <button type="button" class="panel__select" aria-pressed="${i === 0}" aria-label="Show ${esc(s.name)}, ${naira(s.price)}"></button>
      <div class="panel__cap">
        <div>
          <p class="panel__name"><b>${pad(i + 1)} /</b> ${esc(s.name)}</p>
          <span class="panel__price">${naira(s.price)} · ${s.minutes} min</span>
        </div>
        <button type="button" class="panel__book" data-service="${s.id}">
          <span class="panel__book-text" aria-hidden="true">${naira(s.price)}</span>
          <i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></i>
          <span class="sr">Book ${esc(s.name)}, ${naira(s.price)}, ${s.minutes} minutes</span>
        </button>
      </div>
    </article>`;
  }).join("");
  dots.innerHTML = D.cuts.map((c, i) => `<button type="button" aria-label="Show ${esc(svc(c.service).name)}" ${i === 0 ? 'aria-current="true"' : ""}></button>`).join("");
  $("#galleryTotal").textContent = pad(D.cuts.length);

  const panels = $$(".panel", track);
  let current = 0;
  const setPanel = (i, { focus = false, scroll = false } = {}) => {
    i = Math.max(0, Math.min(panels.length - 1, i));
    current = i;
    panels.forEach((p, n) => {
      const on = n === i;
      p.classList.toggle("is-active", on);
      $(".panel__select", p).setAttribute("aria-pressed", String(on));
      $(".panel__select", p).tabIndex = on ? -1 : 0;
    });
    $$("button", dots).forEach((b, n) => (n === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
    $("#galleryIndex").textContent = pad(i + 1);
    if (focus) $(".panel__book", panels[i]).focus({ preventScroll: mobile.matches });
    if (scroll && mobile.matches) track.scrollTo({ left: panels[i].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: behavior() });
  };
  panels.forEach((p, i) => $(".panel__select", p).addEventListener("click", () => setPanel(i)));
  track.addEventListener("keydown", (e) => {
    const map = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: panels.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    setPanel(map[e.key], { focus: true, scroll: true });
  });
  $$("button", dots).forEach((b, i) => b.addEventListener("click", () => setPanel(i, { scroll: true })));
  // mobile: the panel nearest the start of the track becomes active as you swipe
  let swipeRaf;
  track.addEventListener("scroll", () => {
    if (!mobile.matches) return;
    cancelAnimationFrame(swipeRaf);
    swipeRaf = requestAnimationFrame(() => {
      const left = track.scrollLeft;
      let best = 0, dist = Infinity;
      panels.forEach((p, i) => { const d = Math.abs(p.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft) - left); if (d < dist) { dist = d; best = i; } });
      if (best !== current) setPanel(best);
    });
  }, { passive: true });
  setPanel(0);

  /* ---------------- process ---------------- */
  const pMedia = $("#processMedia");
  const stepsEl = $("#steps");
  pMedia.innerHTML = D.process.map((s, i) => img(s.image, "100vw", i === 0 ? "is-active" : "", i === 0 ? 'fetchpriority="low"' : "")).join("");
  stepsEl.innerHTML = D.process.map((s, i) => `
    <li class="step${i === 1 ? " is-active" : ""}">
      <button type="button" class="step__btn" id="stepBtn${i}" aria-expanded="${i === 1}" aria-controls="stepBody${i}">
        <span class="step__n">${esc(s.n)}</span><span class="step__t">${esc(s.title)}</span>
      </button>
      <div class="step__body" id="stepBody${i}" role="region" aria-labelledby="stepBtn${i}"><div><p>${esc(s.text)}</p></div></div>
    </li>`).join("");
  const steps = $$(".step", stepsEl);
  const pImgs = $$("img", pMedia);
  const setStep = (i, focus = false) => {
    i = (i + steps.length) % steps.length;
    steps.forEach((s, n) => { s.classList.toggle("is-active", n === i); $(".step__btn", s).setAttribute("aria-expanded", String(n === i)); });
    pImgs.forEach((im, n) => im.classList.toggle("is-active", n === i));
    if (focus) $(".step__btn", steps[i]).focus();
  };
  steps.forEach((s, i) => $(".step__btn", s).addEventListener("click", () => setStep(i)));
  stepsEl.addEventListener("keydown", (e) => {
    const idx = steps.findIndex((s) => s.contains(document.activeElement));
    if (idx < 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setStep(idx + 1, true); }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setStep(idx - 1, true); }
  });
  setStep(1);

  /* ---------------- people ---------------- */
  $("#teamPhoto").innerHTML = img(D.team.photo, "(max-width: 860px) 100vw, 92vw");
  $("#roster").innerHTML = D.barbers.map((b, i) => `
    <li class="member reveal">
      <span class="member__n">${pad(i + 1)}</span>
      <span class="member__name">${esc(b.name)}</span>
      <span class="member__role">${esc(b.role)}</span>
      <span class="member__spec">${esc(b.specialties)}</span>
      <button type="button" class="textlink" data-barber="${b.id}" aria-haspopup="dialog">View work<span class="sr"> by ${esc(b.name)}</span> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg></button>
    </li>`).join("");
  $$("#roster .reveal").forEach((el) => io.observe(el));

  /* ---------------- portfolio overlay ---------------- */
  const folio = $("#folio");
  let folioId = null, folioTrigger = null;
  const openFolio = (id, trigger) => {
    const b = barber(id);
    folioId = id; folioTrigger = trigger;
    $("#folioName").textContent = b.name;
    $("#folioRole").textContent = b.role;
    $("#folioBio").textContent = b.bio;
    $("#folioSpec").textContent = b.specialties;
    $("#folioBookLabel").textContent = `Book with ${b.name}`;
    $("#folioWork").innerHTML = b.work.map((w) => `<figure>${img(w, "(max-width: 860px) 72vw, 26vw")}</figure>`).join("");
    folio.showModal();
    document.body.classList.add("is-locked");
    $("#folioClose").focus();
  };
  const closeFolio = (then) => {
    if (!folio.open) return;
    const done = () => { folio.classList.remove("is-closing"); folio.close(); if (then) then(); };
    if (reduce.matches) return done();
    folio.classList.add("is-closing");
    setTimeout(done, 360);
  };
  folio.addEventListener("cancel", (e) => { e.preventDefault(); closeFolio(); });
  folio.addEventListener("close", () => {
    document.body.classList.remove("is-locked");
    if (folioTrigger) folioTrigger.focus({ preventScroll: true });
  });
  folio.addEventListener("click", (e) => { if (e.target === folio) closeFolio(); });
  $("#folioClose").addEventListener("click", () => closeFolio());
  $("#roster").addEventListener("click", (e) => { const b = e.target.closest("[data-barber]"); if (b) openFolio(b.dataset.barber, b); });
  $("#folioBook").addEventListener("click", () => {
    const id = folioId;
    folioTrigger = null;
    closeFolio(() => preselect({ barber: id }));
  });

  /* ---------------- booking ---------------- */
  const form = $("#bookForm");
  const fService = $("#fService"), fBarber = $("#fBarber"), fDate = $("#fDate"), fTime = $("#fTime");
  const fName = $("#fName"), fPhone = $("#fPhone");
  fService.insertAdjacentHTML("beforeend", D.services.map((s) => `<option value="${s.id}">${esc(s.name)} · ${s.minutes} min · ${naira(s.price)}</option>`).join(""));
  fBarber.insertAdjacentHTML("beforeend", D.barbers.map((b) => `<option value="${b.id}">${esc(b.name)}</option>`).join(""));

  const setDateBounds = () => {
    const t = studioNow();
    fDate.min = iso(t);
    const max = new Date(t); max.setUTCDate(max.getUTCDate() + 90);
    fDate.max = iso(max);
  };
  setDateBounds();

  const dateProblem = (v) => {
    if (!v) return "Choose a day.";
    if (v < fDate.min) return "That day has passed. Choose today or later.";
    if (v > fDate.max) return "Requests open up to 90 days ahead.";
    const d = parseIso(v);
    if (!D.business.hours[d.getUTCDay()]) return `We are closed on ${DAYS[d.getUTCDay()]}s. Please choose another day.`;
    return "";
  };

  const renderTimes = () => {
    const prev = fTime.value;
    const v = fDate.value;
    if (dateProblem(v)) {
      fTime.innerHTML = `<option value="">${v ? "Choose another day" : "Select a day first"}</option>`;
      fTime.disabled = true;
      return;
    }
    const d = parseIso(v);
    const [open, close] = D.business.hours[d.getUTCDay()];
    const s = svc(fService.value);
    const len = s ? s.minutes : 30;
    const now = studioNow();
    const nowM = now.getUTCHours() * 60 + now.getUTCMinutes();
    const today = v === fDate.min;
    let opts = "";
    for (let m = open * 60; m + len <= close * 60; m += 30) {
      if (today && m < nowM + 30) continue; // no times in the past
      opts += `<option value="${fmtTime(m)}"${fmtTime(m) === prev ? " selected" : ""}>${fmtTime(m)}</option>`;
    }
    fTime.innerHTML = opts ? `<option value="">Choose a time</option>${opts}` : `<option value="">No times left today</option>`;
    fTime.disabled = !opts;
    if (prev && fTime.value !== prev) fTime.value = "";
  };

  const tDur = $("#tDuration"), tTot = $("#tTotal");
  const renderTally = () => {
    const s = svc(fService.value);
    const total = s ? naira(s.price) : naira(0);
    if (tTot.textContent !== total && !reduce.matches) { tTot.classList.remove("bump"); void tTot.offsetWidth; tTot.classList.add("bump"); }
    tDur.textContent = s ? `${s.minutes} min` : "0 min";
    tTot.textContent = total;
  };

  const fields = { service: fService, barber: fBarber, date: fDate, time: fTime, name: fName, phone: fPhone };
  const errEl = { service: "#eService", barber: "#eBarber", date: "#eDate", time: "#eTime", name: "#eName", phone: "#ePhone" };
  const setErr = (k, msg) => {
    const wrap = fields[k].closest(".field");
    wrap.classList.toggle("has-error", !!msg);
    $(errEl[k]).textContent = msg || "";
    if (msg) { fields[k].setAttribute("aria-invalid", "true"); fields[k].setAttribute("aria-describedby", errEl[k].slice(1)); }
    else { fields[k].removeAttribute("aria-invalid"); fields[k].removeAttribute("aria-describedby"); }
  };

  form.addEventListener("change", (e) => {
    const t = e.target;
    if (t === fDate) { setErr("date", fDate.value ? dateProblem(fDate.value) : ""); renderTimes(); }
    if (t === fService) { setErr("service"); renderTimes(); }
    if (t === fBarber) setErr("barber");
    if (t === fTime) setErr("time");
    renderTally();
  });
  [fName, fPhone].forEach((el) => el.addEventListener("input", () => setErr(el === fName ? "name" : "phone")));

  const validate = () => {
    const errs = {};
    if (!fService.value) errs.service = "Choose a service.";
    if (!fBarber.value) errs.barber = "Choose a barber, or any barber.";
    const dp = dateProblem(fDate.value); if (dp) errs.date = dp;
    if (!fTime.value) errs.time = dp ? "Choose a valid day first." : "Choose a time.";
    if (!fName.value.trim()) errs.name = "Add your name.";
    if (fPhone.value.replace(/\D/g, "").length < 10) errs.phone = "Add a phone number with at least 10 digits.";
    Object.keys(fields).forEach((k) => setErr(k, errs[k]));
    return errs;
  };

  const status = $("#formStatus");
  const confirm = $("#confirm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errs = Object.keys(validate());
    if (errs.length) {
      status.textContent = errs.length === 1 ? "One detail needs your attention." : `${errs.length} details need your attention.`;
      fields[errs[0]].focus();
      return;
    }
    status.textContent = "";
    const s = svc(fService.value);
    const b = fBarber.value === "any" ? "Any barber" : barber(fBarber.value).name;
    // Demo only: replace this block with a request to your booking backend (see README).
    $("#cName").textContent = fName.value.trim().split(" ")[0];
    $("#cList").innerHTML = [
      ["Service", s.name], ["Barber", b], ["Day", fmtDate(parseIso(fDate.value))],
      ["Time", fTime.value], ["Duration", `${s.minutes} min`], ["Total", naira(s.price)],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
    form.hidden = true;
    confirm.hidden = false;
    confirm.focus({ preventScroll: true });
    confirm.scrollIntoView({ behavior: behavior(), block: "center" });
  });
  $("#restart").addEventListener("click", () => {
    form.reset();
    Object.keys(fields).forEach((k) => setErr(k));
    setDateBounds(); renderTimes(); renderTally();
    confirm.hidden = true; form.hidden = false;
    fService.focus();
  });

  /** Carry a service and/or barber into the form, then bring the form into view. */
  function preselect({ service, barber: b }) {
    if (!form.hidden) {
      if (service) { fService.value = service; setErr("service"); renderTimes(); flash(fService); }
      if (b) { fBarber.value = b; setErr("barber"); flash(fBarber); }
      renderTally();
    }
    $("#book").scrollIntoView({ behavior: behavior(), block: "start" });
    setTimeout(() => (form.hidden ? confirm : fDate.value ? fTime : fDate).focus({ preventScroll: true }), reduce.matches ? 0 : 700);
  }
  function flash(el) {
    if (reduce.matches) return;
    el.closest(".field").animate([{ backgroundColor: "rgba(115,118,101,.22)" }, { backgroundColor: "rgba(115,118,101,0)" }], { duration: 1400, easing: "ease-out" });
  }
  track.addEventListener("click", (e) => {
    const btn = e.target.closest(".panel__book");
    if (!btn) return;
    const i = panels.indexOf(btn.closest(".panel"));
    if (i !== current) setPanel(i);
    preselect({ service: btn.dataset.service });
  });

  renderTimes();
  renderTally();
})();
