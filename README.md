# Spider-Man — Reading Order

A complete Spider-Man reading-order tracker. 1,859 issues from *Amazing Fantasy* #15
onward, arranged in true chronological reading order across 93 era bands, with the
main Peter Parker spine woven together with fifteen parallel strands.

Companion to the X-Men tracker. Built from the Spider-Man reading-order workbook.

## Running it

It is a static site with no build step. Serve the folder over HTTP and open it:

    python3 -m http.server 8080

Opening `index.html` directly from the filesystem will not work — service workers
and the manifest need a real origin.

## What's here

| File | Purpose |
|---|---|
| `index.html` | Shell, rendering, filters, settings, sync |
| `styles.css` | Token system: two themes, two era-colour schemes, 26 era palettes |
| `data.js` | The whole checklist as `window.SPIDEY_DATA` |
| `qrcode.js` | QR generator, MIT, self-hosted for offline use |
| `sw.js` | Service worker — precaches everything including fonts |
| `manifest.json` | PWA manifest |
| `fonts/` | Anton, IBM Plex Sans, IBM Plex Mono — self-hosted woff2 |
| `icons/` | App icons |

## Deploying

Push the contents of this folder to the repository root. GitHub Pages serves it
as-is; `.nojekyll` stops Jekyll from touching it.

**Bump `CACHE` in `sw.js` on every deploy** (`spider-man-v1` → `-v2` and so on),
or returning visitors keep the old cached build until the cache is cleared.

## Storage

Everything lives in `window.storage`, never `localStorage`:

- `spidey:v1:progress` — `{p: {sortKey: state}, b: [bookmarked sortKeys]}`
- `spidey:v1:settings` — theme, era scheme, Clone Saga order, collapsed eras, view options
- `spidey:v1:filters` — depth, types, strands, era, search, ALT visibility
- `spidey:v1:reviews` — `{sortKey: {r: 0-5, t: 'note'}}`

Writes are batched on a 400 ms debounce. A missing key on first run falls back to
defaults rather than erroring.

## Sync

Settings → "sync to another device" produces a `SPDY1:` code carrying progress,
bookmarks, settings, filters and reviews. Progress is a positional bitfield — two
bits per issue in Sort Key order — so it stays a fixed 620 characters however much
you have read. The code is shown as a QR when it fits and as copyable text when
review notes push it past QR capacity.

The bitfield is positional, so the payload carries a data-version stamp. A code
made before issues were added to the checklist is refused rather than misapplied.
