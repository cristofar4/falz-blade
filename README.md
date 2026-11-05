# FORM & FADE

A static, dependency free website for a modern barber studio in Victoria Island, Lagos.
Open `index.html` in a browser, or serve the folder with any static host.

## Sections

1. **Header**: wordmark plus a floating dock (Studio, Cuts, People, Book) with an active section pill. On small screens it collapses into an accessible dropdown menu (Esc and outside click close it).
2. **Hero**: headline, supporting line and a cinematic media frame with a sculpted notch holding the "Book a chair" action.
3. **Cut showcase**: one continuous petrol section. Tabs (Taper, Texture, Classic) crossfade the photo and update name, description, duration and price. Arrow keys, Home/End, the arrow buttons and horizontal swipes all work.
4. **Before and after**: draggable comparison (mouse, touch, keyboard via the underlying range input).
5. **People**: panoramic team photo with text rows; "View work" opens a modal portfolio with a "Book with …" action.
6. **Booking**: service, add on, barber, date (past dates blocked), time slots, details, live total and a confirmation with an `.ics` calendar download.

## Configuration

All editable content lives in the `CONFIG` object at the top of `script.js`:

| Key | Purpose |
| --- | --- |
| `heroVideo` | Path or URL to an mp4/webm. When set, it plays muted and looped over the poster (not under reduced motion) and a working Pause/Play control appears. |
| `whatsapp` | Studio number in international digits (e.g. `2348030000000`). When set, confirmations offer a prefilled WhatsApp message. |
| `hours` | Opening hours per weekday (0 = Sunday), Lagos time. |
| `services`, `towel` | Booking menu: names, minutes and prices in naira. |
| `cuts` | Showcase copy per tab. Duration and price come from the matching service. |
| `barbers` | Names, roles, bios and portfolio images. |

### Before and after images

Set the sources on the `#compare` element in `index.html`:

```html
<div class="compare" id="compare"
     data-before="assets/img/your-before.jpg"
     data-after="assets/img/your-after.jpg" ...>
```

While both point to the same file, the "before" side is shown with a muted placeholder treatment. Supply a real matching pair (same client, same framing) to replace it.

### Booking backend

There is no backend yet. Submitting validates the form and shows a confirmation on the page only.
Connect the `submit` handler in `script.js` to your booking API, form service or WhatsApp flow.

## Photography

Placeholder photography from [Unsplash](https://unsplash.com) (Unsplash License), stored in `assets/img/`. Replace with the studio's own photos before launch.
