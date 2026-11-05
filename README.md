# FORM & FADE

A static, dependency free website for a modern barber studio in Victoria Island, Lagos.
Open `index.html` in a browser, or serve the folder with any static host.

## Sections

1. **Lens navigation**: a compact floating pill on the right with a scroll progress ring, the current section number and its name (which slides as you scroll). Hover or keyboard focus expands it into Studio, Cuts, People with a sliding active pill; Book is always visible. On small screens the ring opens a full screen menu sheet with image previews (Esc closes it).
2. **Hero**: masked headline reveal, supporting line, sculpted media frame with a live Lagos clock and open status, and a carved notch holding "Book a chair". A slow ticker of services runs underneath.
3. **Cut showcase**: one continuous petrol section. A glass spec card (notched corner) sits over a photo that dissolves into the background, with a giant outlined numeral behind. The Taper, Texture, Classic tabs sit on a scale with a sliding thumb and autoplay progress (pause button, pauses on hover and focus, off under reduced motion). Arrow keys, Home/End, arrow buttons and swipes all work.
4. **Before and after**: draggable divider (mouse, touch, keyboard) that reports the minute of the appointment as you drag.
5. **Ritual**: five steps in arch framed panels. On desktop, vertical scrolling drives the track sideways; on phones and with reduced motion it becomes a native swipe rail.
6. **People**: panoramic photo and text rows. Hovering a row floats a work preview beside the cursor; "View work" opens a side drawer portfolio with stats and a "Book with …" action.
7. **Booking**: step tracker, ticket stub service cards, arch barber cards, a 14 day strip (plus a date picker for later dates), time slots grouped by morning, afternoon and evening, and a receipt style summary with a live total. Confirming stamps the ticket and offers an `.ics` calendar file.

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
