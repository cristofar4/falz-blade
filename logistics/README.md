# ARRO Logistics

A freight and logistics website for a Lagos based operator. Static HTML, CSS and JavaScript with no build step.

```
index.html      page structure
css/arro.css    design system, layout, motion, responsive rules
js/data.js      ALL content: services, places, pricing model, network map, sample shipments, industries, FAQ
js/main.js      interactions
assets/         responsive WebP photography
```

Run it by opening `index.html`, or serve the folder:

```bash
cd logistics && python3 -m http.server 8080
```

## What it does

- **Instant estimate** in the hero: mode, route, weight (log scale from 10 kg to 30 t) and express; shows a price range, transit days, distance and CO₂ live. "Lock in this estimate" carries everything into the quote form.
- **Track or search** palette: press `/` or Ctrl/⌘ K anywhere. Type a tracking number, a service or a city.
- **Mode switcher** for road, air, sea and warehousing, with autoplay that pauses on hover, focus or reduced motion.
- **Interactive network map**: filter road, sea and air lines, select a city for transit times from Lagos and a one click quote for that lane.
- **Tracking demo** with milestones and a progress rail (demo numbers: AR2048NG, AR7731AF, AR5590SE).
- **Quote form** with validation, an instant estimate and a clearly labelled demo confirmation.

## Before launch

- Figures in `stats`, the `pricing` model and the sample `shipments` are placeholders. Replace them with real numbers and a real tracking source.
- `contact` is empty on purpose: add the real phone, email and social URLs.
- Photos are from [Unsplash](https://unsplash.com) (Unsplash License); replace them with your own fleet and facilities.
- Connect the quote form: replace the block marked `// Demo only` in the quote `submit` handler in `js/main.js` with a request to your CRM or quoting API.
- Connect tracking: in `runTrack()`, fetch the shipment from your tracking API instead of `ARRO.shipments`.
