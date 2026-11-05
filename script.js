/* FALZ / BLADE — interactions */
(() => {
  "use strict";

  // Optional: set a WhatsApp number (international format, digits only, e.g. "2348012345678")
  // and booking tickets will open a pre-filled WhatsApp chat.
  const WHATSAPP_NUMBER = "";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const naira = (n) => "₦" + n.toLocaleString("en-NG");

  /* ---------------- intro ---------------- */
  const introCount = $(".intro__count span");
  let ic = 0;
  const icTimer = setInterval(() => {
    ic = Math.min(ic + 1, 5);
    if (introCount) introCount.textContent = ic;
    if (ic === 5) clearInterval(icTimer);
  }, 110);
  const ready = () => setTimeout(() => document.body.classList.add("ready"), reduce ? 0 : 650);
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready);
  setTimeout(() => document.body.classList.add("ready"), 2500); // safety net

  /* ---------------- cursor ---------------- */
  const cursor = $(".cursor");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (cursor && fine && !reduce) {
    document.body.classList.add("has-cursor");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("pointerover", (e) => {
      cursor.classList.toggle("is-link", !!e.target.closest("a, button, label, input, .card"));
    });
  }

  /* ---------------- razor menu ---------------- */
  const razor = $("#razorBtn");
  const menu = $("#menu");
  const setMenu = (open) => {
    razor.setAttribute("aria-expanded", String(open));
    razor.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menu.inert = !open;
    document.body.classList.toggle("locked", open);
  };
  menu.inert = true;
  razor.addEventListener("click", () => setMenu(razor.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------------- chair status (Lagos = UTC+1, no DST) ---------------- */
  const HOURS = { 0: [12, 18], 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [10, 20] };
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const lagosNow = () => new Date(Date.now() + 3600e3); // read with getUTC*
  const status = $("#chairStatus");
  const paintStatus = () => {
    const n = lagosNow();
    const d = n.getUTCDay(), h = n.getUTCHours() + n.getUTCMinutes() / 60;
    const [o, c] = HOURS[d];
    const open = h >= o && h < c;
    let txt;
    if (open) txt = `Chairs open · until ${c}:00`;
    else if (h < o) txt = `Closed · opens ${o}:00 today`;
    else { const nd = (d + 1) % 7; txt = `Closed · opens ${DAYS[nd]} ${HOURS[nd][0]}:00`; }
    status.classList.toggle("is-open", open);
    $(".status__text", status).textContent = txt;
  };
  paintStatus();
  setInterval(paintStatus, 60e3);

  /* ---------------- hero slash follows the pointer ---------------- */
  const slash = $("#slash");
  const cutLine = $("#cutLine");
  const hero = $(".hero");
  let ta = 62, tb = 38, a = 62, b = 38;
  if (!reduce) {
    hero.addEventListener("pointermove", (e) => {
      const r = slash.getBoundingClientRect();
      const py = ((e.clientY - r.top) / r.height) * 100;
      const px = (e.clientX - r.left) / r.width - 0.5;
      const mid = Math.max(18, Math.min(82, py));
      const tilt = 12 + px * 34;
      ta = mid + tilt; tb = mid - tilt;
    });
    hero.addEventListener("pointerleave", () => { ta = 62; tb = 38; });
  }
  const paintSlash = () => {
    a += (ta - a) * 0.12; b += (tb - b) * 0.12;
    slash.style.setProperty("--a", a.toFixed(2) + "%");
    slash.style.setProperty("--b", b.toFixed(2) + "%");
    // map text-box % into the cut svg (which overhangs: x -6%..106%, y -2%..102%)
    const k = (b - a) / 100;
    const yL = a - 6 * k, yR = a + 106 * k;
    cutLine.setAttribute("y1", ((yL + 2) / 104 * 100).toFixed(2));
    cutLine.setAttribute("y2", ((yR + 2) / 104 * 100).toFixed(2));
    requestAnimationFrame(paintSlash);
  };
  paintSlash();

  /* ---------------- manifesto: words sharpen on scroll ---------------- */
  const sharpen = $("#sharpen");
  const words = sharpen.textContent.trim().split(/\s+/);
  sharpen.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
  const wEls = $$(".w", sharpen);

  /* ---------------- dial + section tracking + scroll effects ---------------- */
  const sections = $$("[data-section]");
  const dialLinks = $$(".dial a");
  const dialFill = $(".dial__fill");
  const dialTrack = $(".dial__track");
  const ritual = $(".ritual__wrap");
  const acts = $$(".act");

  const onScroll = () => {
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const p = max > 0 ? scrollY / max : 0;
    dialFill.style.height = (p * dialTrack.offsetHeight) + "px";

    let current = 0;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * 0.45) current = i; });
    dialLinks.forEach((l, i) => l.classList.toggle("is-active", i === current));

    // sharpen
    const sr = sharpen.getBoundingClientRect();
    const sp = Math.min(1, Math.max(0, (vh * 0.85 - sr.top) / (sr.height + vh * 0.35)));
    const n = wEls.length;
    wEls.forEach((w, i) => {
      const local = Math.min(1, Math.max(0, sp * (n + 6) - i) / 6);
      w.style.setProperty("--bl", ((1 - local) * 6).toFixed(2) + "px");
      w.style.setProperty("--op", (0.12 + local * 0.88).toFixed(3));
    });

    // ritual blade
    const rr = ritual.getBoundingClientRect();
    const rp = Math.min(1, Math.max(0, (vh * 0.55 - rr.top) / rr.height));
    ritual.style.setProperty("--p", (rp * 100).toFixed(2) + "%");
    acts.forEach((act) => act.classList.toggle("on", act.getBoundingClientRect().top < vh * 0.62));
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------------- reveal + counters ---------------- */
  $$(".sec-tag, h2, .builder__head p, .builder__grid, .cards, .stats, .book__grid, .hero__bottom").forEach((el) => el.classList.add("rv"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      $$("[data-count]", en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  $$(".rv").forEach((el) => io.observe(el));

  function countUp(el) {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || "0", 10);
    const dur = reduce ? 0 : 1400;
    const t0 = performance.now();
    const step = (t) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1;
      const v = end * (1 - Math.pow(1 - k, 3));
      el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-NG");
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------------- fade builder ---------------- */
  const HEIGHTS = {
    taper: { lo: 246, hi: 224, label: "TAPER" },
    low:   { lo: 236, hi: 200, label: "LOW" },
    mid:   { lo: 222, hi: 168, label: "MID" },
    high:  { lo: 204, hi: 128, label: "HIGH" },
  };
  const GUARDS = [
    { op: 0,    code: "#0",  name: "#0 — skin" },
    { op: 0.2,  code: "#½",  name: "#½ — 1.5mm" },
    { op: 0.35, code: "#1",  name: "#1 — 3mm" },
    { op: 0.55, code: "#2",  name: "#2 — 6mm" },
  ];
  const TOPS = ["Buzz", "Short", "Short+", "Crop", "Crop+", "Full", "Volume"];

  const form = $("#builderForm");
  const guardIn = $("#guard"), topIn = $("#topLen");
  const lineupIn = $("#lineup"), beardIn = $("#beard");
  const svg = $("#headSvg");
  const grads = [$("#fadeGrad"), $("#fadeMaskGrad")];
  const maskLo = $("#maskLo"), fadeLo = $("#fadeLo");
  const gLo = $("#guideLo"), gHi = $("#guideHi"), gLoT = $("#guideLoTxt"), gHiT = $("#guideHiTxt");
  const topVol = $("#topVol"), topVolTex = $("#topVolTex");
  const lineUp = $("#lineUp");

  // beard layer (added here so it sits above skin, below line-up)
  const NS = "http://www.w3.org/2000/svg";
  const beard = document.createElementNS(NS, "path");
  beard.setAttribute("class", "beard");
  beard.setAttribute("d", "M194 200 L199 226 C205 250 220 264 240 264 C251 264 256 256 258 246 L264 230 L254 226 C246 240 230 246 216 238 C207 232 203 218 200 200 Z");
  svg.insertBefore(beard, lineUp);

  const state = { height: "mid", guard: 0, top: 3, lineup: true, beard: false, code: "", price: 0 };

  const volPath = (t) => {
    const h = t * 7 - 2;
    return `M${74 - t * 1.2} 168 C${68 - t * 2.4} ${112 - t * 3} ${102 - t * 2} ${66 - h} 176 ${60 - h} C232 ${58 - h * 0.85} ${258 + t} ${84 - t} 252 118 L200 170 L92 190 Z`;
  };

  const renderBuilder = () => {
    state.height = form.elements.height.value;
    state.guard = +guardIn.value;
    state.top = +topIn.value;
    state.lineup = lineupIn.checked;
    state.beard = beardIn.checked;

    const H = HEIGHTS[state.height], G = GUARDS[state.guard];
    grads.forEach((g) => { g.setAttribute("y1", H.lo); g.setAttribute("y2", H.hi); });
    maskLo.setAttribute("stop-opacity", G.op);
    fadeLo.setAttribute("stop-opacity", G.op);
    [gLo].forEach((l) => { l.setAttribute("y1", H.lo); l.setAttribute("y2", H.lo); });
    [gHi].forEach((l) => { l.setAttribute("y1", H.hi); l.setAttribute("y2", H.hi); });
    gLoT.setAttribute("y", H.lo - 4); gLoT.textContent = G.code;
    gHiT.setAttribute("y", H.hi - 4); gHiT.textContent = "#4";

    const d = volPath(state.top);
    topVol.setAttribute("d", d);
    topVolTex.setAttribute("d", d);
    lineUp.classList.toggle("off", !state.lineup);
    beard.style.opacity = state.beard ? 1 : 0;

    $("#guardOut").textContent = G.name;
    $("#topOut").textContent = TOPS[state.top];

    let price = 15000;
    if (state.guard === 0) price += 2000;
    if (state.height === "mid" || state.height === "high") price += 1000;
    if (state.lineup) price += 2000;
    if (state.beard) price += 5000;
    if (state.top >= 5) price += 1500;
    state.price = price;

    state.code = ["FB", H.label, `${G.code}→#4`, `TOP ${state.top}`]
      .concat(state.lineup ? ["LINE-UP"] : [])
      .concat(state.beard ? ["BEARD"] : [])
      .join(" · ");

    $("#cutCode").textContent = state.code;
    $("#price").textContent = naira(price);
    renderTicket();
  };
  form.addEventListener("input", renderBuilder);
  form.addEventListener("change", renderBuilder);

  /* ---------------- barbers: flip ---------------- */
  $$(".card").forEach((c) => {
    c.setAttribute("aria-pressed", "false");
    c.addEventListener("click", () => {
      const f = c.classList.toggle("is-flipped");
      c.setAttribute("aria-pressed", String(f));
    });
  });

  /* ---------------- booking ---------------- */
  const daysEl = $("#bDays"), timesEl = $("#bTimes");
  const bookForm = $("#bookForm");
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const today = lagosNow();
  const dayList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + i));
    return { i, date: d, dow: d.getUTCDay(), label: i === 0 ? "Today" : DAYS[d.getUTCDay()] };
  });
  daysEl.innerHTML = dayList.map((d) => `
    <label class="day"><input type="radio" name="day" value="${d.i}" ${d.i === 0 ? "checked" : ""} />
      <span><small>${d.label}</small><strong>${d.date.getUTCDate()}</strong></span></label>`).join("");

  // deterministic "already booked" slots so the grid feels alive
  const taken = (dayIdx, hour) => ((dayList[dayIdx].date.getUTCDate() * 31 + hour * 17) % 7) === 0;

  const renderTimes = () => {
    const di = +bookForm.elements.day.value;
    const d = dayList[di];
    const [o, c] = HOURS[d.dow];
    const nowH = today.getUTCHours() + today.getUTCMinutes() / 60;
    const prev = bookForm.elements.time && bookForm.elements.time.value;
    let html = "";
    for (let h = o; h < c; h++) {
      const v = `${String(h).padStart(2, "0")}:00`;
      const dis = (di === 0 && h <= nowH) || taken(di, h);
      html += `<label><input type="radio" name="time" value="${v}" ${dis ? "disabled" : ""} /><span>${v}</span></label>`;
    }
    timesEl.innerHTML = html;
    const pick = $$("input", timesEl).find((x) => !x.disabled && (x.value === prev)) || $$("input", timesEl).find((x) => !x.disabled);
    if (pick) pick.checked = true;
    if (!pick) timesEl.insertAdjacentHTML("beforeend", `<p class="ticket__note" style="margin:6px 0 0;font-size:16px">Fully booked — try another day.</p>`);
  };

  const ticketNo = "Nº " + String(1000 + Math.floor(Math.random() * 8999));
  $("#tNo").textContent = ticketNo;

  function renderTicket() {
    if (!bookForm) return;
    const di = +(bookForm.elements.day ? bookForm.elements.day.value : 0);
    const d = dayList[di];
    const t = bookForm.elements.time && bookForm.elements.time.value;
    $("#tName").textContent = $("#bName").value.trim() || "—";
    $("#tBarber").textContent = bookForm.elements.barber.value;
    $("#tDay").textContent = d ? `${d.label === "Today" ? "Today" : DAYS[d.dow]} ${d.date.getUTCDate()} ${MONTHS[d.date.getUTCMonth()]}` : "—";
    $("#tTime").textContent = t || "—";
    $("#tCode").textContent = state.code || "—";
    $("#tPrice").textContent = naira(state.price || 0);
    $("#ticket").classList.remove("printed");
  }

  bookForm.addEventListener("change", (e) => {
    if (e.target.name === "day") renderTimes();
    renderTicket();
  });
  $("#bName").addEventListener("input", () => {
    $("#bName").closest(".field").classList.remove("err");
    renderTicket();
  });

  // flipping a barber card's name into the booking form
  $$(".card").forEach((c) => c.addEventListener("dblclick", () => {
    const r = $(`#bBarber input[value="${c.dataset.barber}"]`);
    if (r) { r.checked = true; renderTicket(); }
  }));

  $("#useCut").addEventListener("click", () => {
    const tk = $("#ticket");
    setTimeout(() => { tk.classList.remove("printed"); void tk.offsetWidth; }, 600);
  });

  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#bName").value.trim();
    const note = $("#tNote");
    if (!name) {
      $("#bName").closest(".field").classList.add("err");
      $("#bName").focus();
      note.textContent = "We'll need a name for the ticket.";
      note.classList.remove("ok");
      return;
    }
    if (!(bookForm.elements.time && bookForm.elements.time.value)) {
      note.textContent = "Pick a time that's still open.";
      note.classList.remove("ok");
      return;
    }
    renderTicket();
    const tk = $("#ticket");
    void tk.offsetWidth;
    tk.classList.add("printed");
    note.textContent = `Sharp, ${name}. See you in the chair.`;
    note.classList.add("ok");

    if (WHATSAPP_NUMBER) {
      const msg = `Hi Falz Blade! Booking ${ticketNo}\nName: ${name}\nCut: ${state.code}\nBarber: ${$("#tBarber").textContent}\nWhen: ${$("#tDay").textContent} ${$("#tTime").textContent}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    }
  });

  renderTimes();
  renderBuilder();
})();
