# Baroham widget API — public authoring guide

Guide revision: 2026-10-30. Recommended baseline: Windows Studio 0.9.40+;
macOS 0.9.40 build148+ (local build verified; see the website for available downloads).
This guide and the Hello example describe the same format on both hosts.
Studio runs widgets on the PC. Android, ESP32 and the virtual screen receive the
rendered output. A JavaScript ZIP is not an Android app or ESP32 firmware.

## Package

Put manifest.json, main.js, settings.json and optional locales/assets at the ZIP
root, with no wrapping directory. Use a stable unique ID and a numeric
major.minor.patch version. Use packageVersion 1 for display-only scripts, 3 for
scripts that receive taps. Other formats are declarative services, not alternative
JavaScript APIs. New widgets should remain optional ZIPs, not Studio modifications.

Hello uses packageVersion 3, fps 1, background #10252B and permissions {"https":[]}.
Use fps 1 for static/time displays; bounded animations can request up to 12 fps.
Actual device throughput is not guaranteed to reach the requested rate.

Import via Fullscreen → Manage widgets; enable and save order/enabled state.
Widget settings supplies the editor generated from settings.json. Save commits
options, Cancel discards draft edits. Drop a higher-version ZIP with the same ID
to update. Identical bytes are a no-op; changed bytes at the same version or a
lower version are rejected. Validation failure keeps the current package.
Compatible saved options survive; added script keys receive declared defaults.
Do not rename/remove keys or change their types without testing migration.

ZIP limits: compressed and expanded total 8 MiB, 128 files, 1 MiB per file,
main.js 256 KiB. Absolute paths, traversal, symlinks and case-insensitive duplicate
names are rejected. Include attribution/license notices for all borrowed material.
The example's MIT license does not license Studio, other widgets or third-party art.

## JavaScript entry point and drawings

Define `const widget = { render(api) { /* synchronous drawing */ } };`.
There is no import/require/npm, DOM, direct fetch, filesystem or OS command API.
Studio records/validates commands and paints them after successful execution.

- api.canvas: fillRect, strokeRect, clearRect, beginPath, closePath, moveTo,
  lineTo, rect, roundRect, arc, fill, stroke, clip, save, restore, translate,
  scale, rotate, fillText, approximate measureText.
- Properties: fillStyle/strokeStyle (#RRGGBB), font (`[600 ]SIZEpx sans-serif` or
  monospace), textAlign, textBaseline, lineWidth, globalAlpha.
- api.width/height: legacy packages always receive 480/320. Scripts explicitly
  requiring `viewport: 1` can receive the current logical display size; see below.
- api.contentRect: {x,y,width,height} in the same coordinate system, excluding
  the host's top navigation and left/right edge navigation. Place controls here.
- api.now: Unix milliseconds. Derive animation from elapsed time rather than
  assuming every scheduled frame will be sent.
- api.language; api.t(key, fallback): locales/ko.json, en.json, ja.json, zh-Hans.json.
- api.settings: validated settings. settings.json is an array of up to 12 fields.
  Each has key, type, label, default; optional labelKey. Types: text (≤200 chars),
  toggle (boolean), choice (choices [{value,label,labelKey?}]), multi (ordered
  choices from a declared HTTPS JSON endpoint; see the installed SDK for mapping).
- api.state: JSON state, ≤32 KiB. Memory-only; reset on Studio restart, package
  replacement or cache eviction. It is shared by preview/active frames.
- api.useThemeBackground?.(): ask the host to paint the selected theme first.
  Leave regions transparent to reveal it; opaque drawing covers it.

Budget: ≤700 recorded drawing operations, ≤16 nested saves, 750 ms worker deadline.
The worker is isolated, but this is not a hard OS memory quota. An excessive
allocation can still disrupt the web engine. Only install trusted packages.

## Touch — packageVersion 3

api.active is false in passive previews. Do not advance game state from preview
frames. api.inputs is a bounded list (≤32) of {sequence,x,y} taps. Track consumed
sequence values and validate hit boxes; never count a repeated input twice.
Logical taps are x=22..457, y=48..319. The top-right Back control and side navigation
are host-owned. Do not paint a second Back button, replace gestures, or place
important controls at the edges. Hello keeps its card at x32,y72,w416,h192.
Studio owns navigation, input acknowledgements and transport to the device.

## HTTPS and privacy

Declare exact hosts in permissions.https, e.g. ["api.example.com"].
api.httpJson(url, intervalSeconds=10) immediately returns cached
{data,updatedAt,failed}; it schedules a host GET, not a Promise to await.
Data starts null; show loading/error states and validate response shapes.
The host accepts declared public HTTPS endpoints on port443, no credentials,
cookies or redirects. Up to8 request descriptions/frame,4 in flight,
1 new request/second/package; response ≤1 MiB, refresh10 seconds–6 hours.
Network failures preserve cached data and back off. 429/418 pause calls for ≥60s.

Studio's internet switch blocks package HTTPS and feed requests and shows its
own enable-in-settings notice. It does not disable USB or local Wi-Fi connections.
Offline packages need no internet permission. Never embed API secrets in ZIPs.
Camera/microphone capture, arbitrary files, shell execution and unrestricted
browser opening are not exposed to script widgets. Request only needed data.

## Responsive coordinates (new development builds)

This extension requires an updated Windows/macOS Studio advertising `viewport:1`.
**The public 0.9.40 release does not support it.** Importing the responsive example
into an older host fails safely as an unsupported capability. No existing package
opts in automatically and Hello remains a legacy 480×320 example.

```json
"hostApiVersion": 1,
"requires": {"canvas": 1, "settings": 1, "touch": 1, "viewport": 1}
```

Use this on JavaScript packages (packageVersion 1 or 3), not declarative services.
The separate `responsive-example` shows two columns in landscape and two rows in
portrait. Read api.width, api.height and api.contentRect **on every render**;
recompute positions after resize without discarding game/counter state.
Touch x/y use the same coordinates and can be fractional. Continue deduplicating
sequence and ignoring input when api.active is false. Never rescale input again.

The available logical area currently follows the Mac/Windows virtual screen size.
For example a 600×960 virtual screen supplies width=600, height=960. A larger
screen is not a reason to use tiny fixed fonts: choose a readable scale, e.g.
Math.min(api.width/480, api.height/320), and use width/height to choose the layout.
The host handles Back and page edges; contentRect is the conservative usable area.

**Compatibility boundary:** ESP32 and existing Android display protocols still
use the fixed 480×320 frame and input area. On these connections the new package
receives 480×320 and must render a working fallback. This change does not update
Android, ESP32 firmware, physical device protocols or transmission resolution.
Wire/raster output remains bounded to 480×320 (legacy low-resolution clients
240×160); virtual presentation maps it to the available area. This is adaptive
layout support, not a promise of native-resolution text or higher pixel detail.
Passive Studio previews follow the connected display's compatibility mode.

Do not save absolute pixel positions indefinitely. Store relative positions or
reclamp them when width/height change. State is shared by preview and active frames;
layout-only changes must not reset user progress. API geometry is bounded to 4096
per axis; all existing command, state and time budgets remain in force.

## Packaged images

api.useImageBackground("asset:assets/scene.jpg")
api.drawSprite("asset:assets/actor.webp",sx,sy,sw,sh,dx,dy,dw,dh)

Flat filenames use ASCII letters/digits/underscore/hyphen. JPEG backgrounds and
static extended WebP sprite atlases only: ≤16 files,149,000 bytes/file,1 MiB total,
≤1024×1024. Sprite source crops must fit the atlas; at most8 sprite draws/frame.
Do not pass remote URLs, filesystem paths, arbitrary fonts or SVG as raster assets.

## Optional shared host capabilities

A package can declare hostApiVersion:1 and requires:{"canvas":1,"system":1,...}.
The included host-api.json is the version registry, not a grant of arbitrary APIs.
Use the installed SDK's HOST-API.md and its examples for the complete declaration
and permission pairing. Unsupported capabilities are rejected at import.

Scripts can request read-only api.host snapshots for system, media and weather.
Unavailable sensor values are null, not zero. They do not expose paths, media
control handles, OS commands or location coordinates. HTTPS combined with these
snapshots can disclose PC metadata: request both only when necessary and explain it.

Declarative packageVersion2 uses definition.json, defaults when required,
settings.json:[], runtime:"declarative", and no main.js:
- dashboard-v1: combine validated clock/system/weather/media layers.
- news-v1: native feed selection/parsing and article navigation.
- local-images-v1: native folder picker and read-only image service; empty default
  folders, no preselected local paths. The ZIP does not receive general file access.
These are explicit service contracts, not calls that can be invented in JavaScript.
Legacy native-video v4 is not a general video API; Video is already built into Studio.

## Validation and sharing

1. Import a freshly packaged ZIP, open settings and verify Save/Cancel.
2. Test default/long text, all intended languages, theme on/off, and missing data.
3. Test passive preview, active fullscreen, repeated taps, switching away/back.
4. For online data test first-load/error/offline states and Studio internet disabled.
5. Test the virtual screen and target devices on Windows/macOS separately.
6. Keep the same ID and increase version; confirm old settings survive update.
7. Share only the package, its license and minimum Studio version. Do not include
   user paths/settings, secrets, app binaries or private source. No automatic
   marketplace upload or listing review is performed by the packer.

The legacy SDK preview.html previews declarative JSON, not JavaScript ZIPs or live
PC services. Use Studio for package preflight and real runtime tests. No standalone
JavaScript ZIP browser preview is promised by this guide.
