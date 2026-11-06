/* =========================================================
   MONROE · Modern Grooming
   Editable content. Everything the site renders lives here:
   business details, services, gallery, process, barbers, media.
   ========================================================= */

/** Media helper: a base path plus the widths that exist on disk as `${base}-${w}.webp`. */
const media = (base, widths, alt, pos = "50% 50%") => ({ base: `assets/media/${base}`, widths, alt, pos });

window.MONROE = {
  business: {
    name: "MONROE",
    tagline: "Modern Grooming",
    // Area only. Add the full street address when it is final.
    location: ["Victoria Island", "Lagos"],
    // Leave email and phone empty until the real details exist; empty values are not rendered.
    email: "",
    phone: "",
    // Hours per weekday, 0 = Sunday. `null` means closed. Times are local studio time (WAT).
    hours: { 0: [11, 18], 1: null, 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [10, 20] },
    hoursLabel: [["Tue to Sat", "10:00 to 20:00"], ["Sun", "11:00 to 18:00"], ["Mon", "Closed"]],
    // UTC offset of the studio, in hours. Lagos is UTC+1 all year.
    utcOffset: 1,
    // Set real profile URLs. Links with an empty url are not rendered.
    social: [
      { label: "Instagram", url: "" },
      { label: "TikTok", url: "" },
      { label: "LinkedIn", url: "" },
    ],
  },

  // Optional hero film. Leave `src` empty to show the photograph only.
  heroVideo: { src: "", type: "video/mp4" },

  hero: {
    studio: media("studio", [960, 1600, 2400], "A quiet, warmly lit barber studio with round mirrors, leather chairs and a long marble counter", "50% 55%"),
    portrait: media("portrait", [480, 800, 1200], "Portrait of a client in profile light, with a crisp short cut and sharp line", "50% 30%"),
  },

  services: [
    { id: "signature", name: "Signature taper", minutes: 45, price: 15000 },
    { id: "texture", name: "Texture crop", minutes: 60, price: 18000 },
    { id: "classic", name: "Classic short", minutes: 30, price: 12000 },
    { id: "beard", name: "Beard sculpt", minutes: 30, price: 8000 },
    { id: "full", name: "Cut and beard", minutes: 75, price: 22000 },
  ],

  // The cut library. `service` links each style to a bookable service above.
  cuts: [
    { service: "signature", blurb: "A gradual taper that keeps the shape soft and the line razor sharp.", image: media("cut-taper", [640, 1200, 1800], "Side profile of a client with a clean low taper and short natural top", "45% 40%") },
    { service: "texture", blurb: "Defined curls on top, faded close at the sides. Your texture leads.", image: media("cut-texture", [640, 1200, 1800], "Textured curls on top of a skin fade, being refined with clippers", "62% 35%") },
    { service: "classic", blurb: "Short, even and quietly precise. The cut that goes with everything.", image: media("cut-classic", [640, 1200, 1600], "Front portrait of a client with a neat classic short cut", "50% 30%") },
  ],

  process: [
    { n: "01", title: "Consult", text: "We talk through how you wear your hair, what your week looks like and what to keep.", image: media("consult", [960, 1600, 2400], "Barber checking a client's hair before the cut begins", "60% 40%") },
    { n: "02", title: "Craft", text: "Precise technique, considered detail. Shaped to your features, lifestyle and style.", image: media("craft", [960, 1600, 2400], "Close view of a barber shaping a client's hairline with scissors and comb", "55% 35%") },
    { n: "03", title: "Finish", text: "Hot lather, a straight razor line and a final check in two mirrors before you leave.", image: media("finish", [960, 1600, 2400], "Beard lathered with a brush before a straight razor finish", "60% 40%") },
  ],

  team: {
    photo: media("team", [960, 1600, 2000], "A Monroe barber shaping a client's curls in the studio", "50% 32%"),
  },

  // Sample barbers. Replace names, bios and portfolio images with the real team.
  barbers: [
    {
      id: "kayode", name: "Kayode", role: "Head barber",
      specialties: "Tapers, skin fades, line work",
      bio: "Kayode built the Monroe standard. Patient, exact and known for tapers that still look sharp two weeks later.",
      work: [
        media("k2", [600, 1000], "Skin fade with a textured crop, seen from behind", "50% 45%"),
        media("k1", [600, 1000], "Client being styled and blow dried after a fade", "50% 30%"),
        media("k3", [600, 1000], "Detailed fade and sculpted beard with a razor line", "50% 40%"),
      ],
    },
    {
      id: "marcus", name: "Marcus", role: "Senior barber",
      specialties: "Classic cuts, scissor work, beard shaping",
      bio: "Marcus is the scissor specialist. Calm in the chair and the person to see for a classic cut or a beard that frames the face.",
      work: [
        media("m1", [600, 1000], "Barber refining a classic cut with clippers and comb", "50% 45%"),
        media("m3", [600, 1000], "Classic tapered cut being finished with hold spray", "50% 35%"),
        media("m2", [600, 1000], "Barber's clippers, scissors and finishing products laid out", "50% 50%"),
      ],
    },
  ],
};
