/* =========================================================
   ARRO Logistics · editable content
   Everything the page renders comes from here.
   Figures marked SAMPLE are placeholders: replace them with
   real, verifiable numbers before launch.
   ========================================================= */
const img = (name, widths, alt, pos = "50% 50%") => ({ base: `assets/${name}`, widths, alt, pos });

window.ARRO = {
  brand: { name: "ARRO", full: "ARRO Logistics", city: "Lagos", utcOffset: 1 },

  contact: {
    // Leave empty until real details exist; empty values are not rendered.
    phone: "", email: "", whatsapp: "",
    address: ["Head office", "Lagos, Nigeria"],
    hours: "Mon to Sat, 07:00 to 20:00 WAT",
    social: [{ label: "LinkedIn", url: "" }, { label: "Instagram", url: "" }, { label: "X", url: "" }],
  },

  // SAMPLE figures shown under the hero.
  stats: [
    { value: 36, suffix: "", label: "Cities on our road network" },
    { value: 4, suffix: "", label: "Freight modes, one team" },
    { value: 98, suffix: "%", label: "On time delivery target" },
    { value: 2, suffix: " hrs", label: "Typical quote turnaround" },
  ],

  modes: [
    {
      id: "road", name: "Road freight", short: "Road",
      line: "Full and part loads across Nigeria and the West African coast.",
      body: "Dedicated trucks and shared consolidation lanes linking Lagos, Abuja, Kano, Port Harcourt and the Accra corridor. Every vehicle is GPS tracked and every handover is signed.",
      specs: [["Transit", "1 to 4 days"], ["Capacity", "Up to 30 t"], ["Best for", "Pallets, bulk, retail replenishment"]],
      image: img("road", [800, 1400, 2000], "A heavy truck crossing an open highway at dusk", "60% 88%"),
    },
    {
      id: "air", name: "Air freight", short: "Air",
      line: "Priority capacity for urgent, high value and time critical cargo.",
      body: "Consolidated and charter options out of Lagos and Abuja, with customs prepared before wheels up and a courier waiting on arrival.",
      specs: [["Transit", "1 to 5 days"], ["Capacity", "Up to 5 t per booking"], ["Best for", "Spares, pharma, documents, electronics"]],
      image: img("air", [800, 1400, 2000], "A cargo plane passing low overhead against a bright sky", "50% 50%"),
    },
    {
      id: "sea", name: "Sea freight", short: "Sea",
      line: "FCL and LCL ocean freight through Apapa, Tin Can and Onne.",
      body: "Booked space on major carriers, port clearance handled in house and inland haulage arranged the moment your container is released.",
      specs: [["Transit", "18 to 45 days"], ["Capacity", "20 ft and 40 ft containers"], ["Best for", "Imports, machinery, raw materials"]],
      image: img("sea", [800, 1400, 2000], "A fully loaded container ship at sea", "50% 50%"),
    },
    {
      id: "warehouse", name: "Warehousing", short: "Storage",
      line: "Bonded and general storage with pick, pack and dispatch.",
      body: "Racked, secured space with stock visibility, cycle counts and same day dispatch onto our own road network.",
      specs: [["Space", "Pallet to dedicated bay"], ["Access", "Live stock reports"], ["Best for", "Ecommerce, FMCG, spare parts"]],
      image: img("warehouse", [800, 1400, 2000], "Rows of racking and parcels inside a busy warehouse", "50% 50%"),
    },
  ],

  // Places used by the instant quote and the network map.
  // `modes` lists which freight modes serve each place.
  places: [
    { id: "lagos", name: "Lagos", country: "Nigeria", lat: 6.52, lon: 3.38, modes: ["road", "air", "sea"], hub: true },
    { id: "ibadan", name: "Ibadan", country: "Nigeria", lat: 7.38, lon: 3.95, modes: ["road"] },
    { id: "abuja", name: "Abuja", country: "Nigeria", lat: 9.06, lon: 7.49, modes: ["road", "air"] },
    { id: "kaduna", name: "Kaduna", country: "Nigeria", lat: 10.52, lon: 7.44, modes: ["road"] },
    { id: "kano", name: "Kano", country: "Nigeria", lat: 12.0, lon: 8.52, modes: ["road", "air"] },
    { id: "benin", name: "Benin City", country: "Nigeria", lat: 6.34, lon: 5.63, modes: ["road"] },
    { id: "enugu", name: "Enugu", country: "Nigeria", lat: 6.45, lon: 7.5, modes: ["road"] },
    { id: "ph", name: "Port Harcourt", country: "Nigeria", lat: 4.82, lon: 7.03, modes: ["road", "air", "sea"] },
    { id: "cotonou", name: "Cotonou", country: "Benin", lat: 6.37, lon: 2.39, modes: ["road"] },
    { id: "lome", name: "Lomé", country: "Togo", lat: 6.13, lon: 1.22, modes: ["road"] },
    { id: "accra", name: "Accra", country: "Ghana", lat: 5.6, lon: -0.19, modes: ["road", "air", "sea"] },
    { id: "london", name: "London", country: "United Kingdom", lat: 51.47, lon: -0.45, modes: ["air"] },
    { id: "antwerp", name: "Antwerp", country: "Belgium", lat: 51.26, lon: 4.4, modes: ["sea"] },
    { id: "dubai", name: "Dubai", country: "UAE", lat: 25.25, lon: 55.36, modes: ["air", "sea"] },
    { id: "shanghai", name: "Shanghai", country: "China", lat: 31.23, lon: 121.47, modes: ["air", "sea"] },
  ],

  // Indicative pricing model for the instant quote (NGN). Tune with real rate cards.
  pricing: {
    road: { base: 25000, perKgKm: 0.9, kmPerDay: 450, extraDays: 1, co2PerTonneKm: 0.062, routeFactor: 1.25 },
    air: { base: 60000, perKg: 3500, perKgKm: 0.6, minDays: 1, kmPerDay: 3000, extraDays: 1, co2PerTonneKm: 0.6, routeFactor: 1.05 },
    sea: { base: 350000, perKg: 40, perKgKm: 0.02, kmPerDay: 600, extraDays: 4, co2PerTonneKm: 0.012, routeFactor: 1.35 },
    express: 1.35,
    spread: 0.1,
  },

  // Schematic network map. Coordinates are in the SVG viewBox (0 0 1200 620); not to scale.
  network: {
    stations: {
      accra: [150, 380], lome: [235, 380], cotonou: [315, 380], lagos: [410, 380],
      ibadan: [480, 310], abuja: [610, 310], kaduna: [670, 250], kano: [670, 140],
      benin: [530, 380], enugu: [640, 380], ph: [700, 440],
      london: [930, 110], antwerp: [1010, 170], dubai: [1040, 300], shanghai: [1120, 420],
    },
    lines: [
      { mode: "road", name: "Northern corridor", d: "M410 380 L480 310 L610 310 L670 250 L670 140" },
      { mode: "road", name: "Eastern corridor", d: "M410 380 L640 380 L700 440" },
      { mode: "road", name: "Coastal corridor", d: "M410 380 L150 380" },
      { mode: "sea", name: "Asia service", d: "M410 380 L410 540 L1060 540 L1120 480 L1120 420" },
      { mode: "sea", name: "Europe service", d: "M700 440 L700 540 M820 540 L1010 350 L1010 170" },
      { mode: "sea", name: "Gulf service", d: "M960 540 L1040 460 L1040 300" },
      { mode: "air", name: "Lagos to London", d: "M410 380 Q620 120 930 110" },
      { mode: "air", name: "Lagos to Dubai", d: "M410 380 Q760 220 1040 300" },
      { mode: "air", name: "Lagos to Shanghai", d: "M410 380 Q820 300 1120 420" },
      { mode: "air", name: "Abuja to London", d: "M610 310 Q760 160 930 110" },
    ],
  },

  // SAMPLE shipments for the tracking demo.
  shipments: {
    AR2048NG: {
      mode: "road", from: "lagos", to: "kano", cargo: "12 pallets, consumer goods", progress: 0.62, status: "In transit", eta: "Tomorrow, before 14:00",
      events: [["Delivered to consignee", ""], ["Arrived Kano depot", ""], ["Departed Abuja hub", "Today 06:40"], ["Arrived Abuja hub", "Yesterday 21:15"], ["Collected in Lagos", "Yesterday 08:05"]],
      done: 3,
    },
    AR7731AF: {
      mode: "air", from: "lagos", to: "london", cargo: "2 cartons, medical devices", progress: 0.35, status: "Customs cleared", eta: "Friday, morning",
      events: [["Delivered", ""], ["Arrived London Heathrow", ""], ["Departed Lagos", ""], ["Customs cleared", "Today 11:20"], ["Received at Lagos airport", "Today 07:45"]],
      done: 2,
    },
    AR5590SE: {
      mode: "sea", from: "shanghai", to: "lagos", cargo: "1 × 40 ft container, machinery", progress: 0.84, status: "Arriving at Apapa", eta: "In 3 days",
      events: [["Delivered to site", ""], ["Released from port", ""], ["Arriving Apapa, Lagos", "Expected Thursday"], ["Transshipped at Jebel Ali", "12 days ago"], ["Loaded at Shanghai", "29 days ago"]],
      done: 2,
    },
  },

  industries: [
    { id: "ecommerce", name: "Ecommerce & retail", text: "Fast replenishment and last mile hand offs that keep shelves and carts full.", points: ["Store and DC replenishment", "Marketplace inbound", "Returns handling"], image: img("ind-ecommerce", [600, 1100], "Stacks of parcels ready for dispatch") },
    { id: "manufacturing", name: "Manufacturing", text: "Inbound materials and outbound finished goods on a schedule your line can rely on.", points: ["Just in time inbound", "Heavy and oversized loads", "Import clearance"], image: img("ind-manufacturing", [600, 1100], "Industrial machinery on a factory floor") },
    { id: "pharma", name: "Pharma & healthcare", text: "Secure, documented movement for sensitive and regulated products.", points: ["Chain of custody records", "Priority air uplift", "Temperature aware handling"], image: img("ind-pharma", [600, 1100], "A laboratory technician holding a glass beaker") },
    { id: "fmcg", name: "FMCG & distribution", text: "High volume, multi drop distribution across cities and states.", points: ["Multi drop routes", "Distributor deliveries", "Bulk warehousing"], image: img("ind-fmcg", [600, 1100], "Warehouse shelves stacked with boxed goods") },
  ],

  process: [
    { n: "01", title: "Request", time: "2 minutes", text: "Tell us what is moving, from where, to where and when. Instant estimate on the spot." },
    { n: "02", title: "Plan", time: "Within 2 hours", text: "A named coordinator confirms the route, mode, price and pickup slot." },
    { n: "03", title: "Move", time: "On schedule", text: "Collected, loaded and tracked. Updates at every handover, not just at the end." },
    { n: "04", title: "Deliver", time: "Signed and proven", text: "Proof of delivery with time, signature and photo, sent the moment it lands." },
  ],

  faq: [
    ["What can you move?", "General cargo from single parcels to full truckloads, containers and oversized machinery. Hazardous or temperature controlled goods need special arrangements, so describe your cargo and we will confirm what is possible."],
    ["Is the instant quote the final price?", "No. It is an indicative estimate based on distance, weight and mode. A coordinator confirms the final price after checking dimensions, access and timing."],
    ["Do you handle customs clearance?", "Yes, for air and sea freight through Lagos and Port Harcourt we prepare and file documentation and coordinate inspections and release."],
    ["Can you support recurring shipments?", "Yes. We set up scheduled collections, contract rates and monthly reporting for regular lanes."],
    ["How does tracking work?", "Every shipment gets a reference. You can follow its milestones online and receive updates at each handover."],
    ["Do you offer insurance?", "Cargo cover can be arranged for each shipment. Share the declared value when you request a quote."],
  ],
};
