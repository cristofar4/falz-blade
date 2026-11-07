# MONROE · Modern Grooming

A premium grooming studio website. Static HTML, CSS and JavaScript with no build step and no dependencies.

```
index.html          page structure and semantic markup
css/monroe.css      design system, layout, motion, responsive rules
js/data.js          ALL editable content: business details, services, cuts, process, barbers, media
js/main.js          interactions (navigation, gallery, process, portfolios, booking)
assets/media/       optimised WebP photography in several widths
```

## Run it

Open `index.html` in a browser, or serve the folder (recommended, so paths behave like production):

```bash
cd monroe && python3 -m http.server 8080
```

Then visit http://localhost:8080. Deploy by uploading the folder to any static host (Netlify, Vercel, Cloudflare Pages, S3).

## Edit content

Everything visitors read comes from `js/data.js`:

| Key | What it controls |
| --- | --- |
| `business` | Name, location, optional email/phone (empty values are hidden), weekly `hours` used by booking, `hoursLabel` shown in the footer and menu, `utcOffset`, `social` links (labels without a `url` show as plain text). |
| `services` | Bookable services with `minutes` and `price` (naira). Duration and total in the form come from here. |
| `cuts` | The three gallery panels. Each links to a service by `service` id, so names and prices stay in one place. |
| `process` | Consult, Craft, Finish: title, description and photograph for each step. |
| `barbers` | Names, roles, specialties, bios and portfolio images. These are sample people; replace them with the real team. |
| `heroVideo` | Optional hero film (see below). |

## Replace the media

Photos are placeholders from [Unsplash](https://unsplash.com) (Unsplash License), colour graded to one warm palette.

1. Export each new photo as WebP in the widths listed for it in `js/data.js`, named `name-WIDTH.webp` (for example `cut-taper-640.webp`, `cut-taper-1200.webp`, `cut-taper-1800.webp`). Any tool works; with `cwebp`:
   ```bash
   cwebp -q 78 -resize 1200 0 my-photo.jpg -o assets/media/cut-taper-1200.webp
   ```
2. Update the `alt` text and, if needed, the focal point (`pos`, a CSS `object-position` such as `"50% 30%"`) in `js/data.js`.
3. The hero studio photo and portrait are referenced directly in `index.html` (so they load first); replace those `srcset` paths too.

**Hero video:** set `heroVideo.src` in `js/data.js` to an mp4 (for example `assets/media/studio.mp4`). It plays muted and looped over the poster photograph, is skipped for visitors who prefer reduced motion, and falls back to the photograph if autoplay is blocked. Keep it short (10 to 20 seconds) and compressed (under about 4 MB).

## Connect a real booking backend

The form validates everything (required fields, past dates, closed days, times within opening hours) and then shows a clearly labelled **demo confirmation** stating that no appointment was submitted. No availability is invented: times are simply the opening hours.

To go live, replace the block marked `// Demo only` in the `submit` handler in `js/main.js` with a request to your system, for example:

```js
const res = await fetch("https://your-booking-api.example/appointments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    service: fService.value, barber: fBarber.value,
    date: fDate.value, time: fTime.value,
    name: fName.value.trim(), phone: fPhone.value.trim(),
  }),
});
if (!res.ok) { status.textContent = "We could not send your request. Please try again."; return; }
```

Then change the confirmation copy in `index.html` (`#confirm`) from demo wording to a real confirmation. If you use a hosted scheduler (Square Appointments, Fresha, Cal.com), you can instead send visitors to its booking link with the chosen service and barber as URL parameters. To show real availability, fetch open slots for the chosen day and barber and fill the time `<select>` in `renderTimes()` from that response.

## Accessibility and motion

Semantic landmarks, visible focus states, keyboard support for the gallery (arrow keys, Home, End), process steps (arrow keys) and overlays (Escape), focus return after closing, and `prefers-reduced-motion` support (no hero drift, parallax or animated transitions).
