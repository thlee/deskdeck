# Baroham widget API — public authoring guide

Guide revision: 2026-11-05. The existing Hello and viewport examples retain their
documented baseline: Windows Studio 0.9.41+ and macOS 0.9.40 build148+.
The newer conditional settings (`settings:2`) and device sound (`audio:2`) require
Studio 0.9.45+ on both platforms; macOS build153 was verified locally. Android
sound also requires Android app 0.5.56+. Updating Studio does not update the phone
app. ESP32 remains silent with audio:2; PC playback is for virtual-display-only
sessions. See the website for available downloads.
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

Independently written widgets may be distributed free or sold, with prices and license terms set by their authors. No separate API fee or revenue share is payable to Baroham for independent sales. Preserve copyright and license notices when reusing MIT examples; other code, artwork and audio retain their own licenses. This permission does not license the host code or brand as a whole. See WIDGET-LICENSE.en.txt for the full conditions.

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
- api.settings: validated settings. settings.json is an array of up to 12 fields. Studio 0.9.46 development builds support up to 16 settings with `settings:3`.
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

Windows 0.9.41 / macOS 0.9.40 build148 hardening: state must contain only plain
JSON objects/arrays, strings, finite numbers, booleans and null. The 32 KiB limit
counts serialized UTF-8 bytes, with at most 20 nesting levels and 4,096 value
nodes. Binary buffers, typed arrays, Map/Set, Date, cycles and non-finite numbers
are rejected. The parent validates raw Worker messages as well as normal API
output; invalid frames do not replace the last accepted state. Limits apply
after message transfer and do not impose a hard memory quota on the Worker.

In Windows 0.9.41 and macOS 0.9.40 build148 or later, execution failures and safety-rule violations suspend
the package immediately. The host saves the reason and time, cancels its pending
work and prevents further execution, including previews. Suspension survives
Studio restart, ZIP upgrades and reinstallation. Widget management shows the
reason; only explicit user confirmation enables it again. Reinstalling a suspended
ID can replace its files but does not run the installation preview or lift the
suspension. Another violation suspends it again. Offline operation, DNS lookup
failure, ordinary network timeouts, server errors and invalid JSON responses do
not suspend a widget. A private destination, undeclared URL or response-size
violation does. If saving the suspension record fails, the host reports the error
and keeps the in-memory block for the current session.

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

Windows 0.9.41 / macOS 0.9.40 build148 and later validate every resolved destination and connect only
to those validated public IP addresses, while checking TLS against the original
hostname. Loopback, private, link-local and reserved addresses, mixed public/private
DNS answers and redirects are rejected. The 1 MiB response limit is enforced
while receiving data, including responses without Content-Length. This policy
applies to widget HTTPS; local device connections remain separate.

Studio's internet switch blocks package HTTPS and feed requests and shows its
own enable-in-settings notice. It does not disable USB or local Wi-Fi connections.
Offline packages need no internet permission. Never embed API secrets in ZIPs.
Camera/microphone capture, arbitrary files, shell execution and unrestricted
browser opening are not exposed to script widgets. Request only needed data.

## Responsive coordinates (Windows 0.9.41 / macOS 0.9.40 build148+)

This extension requires an updated Windows/macOS Studio advertising `viewport:1`.
**Supported in Windows 0.9.41 and macOS 0.9.40 build148 or later.** Importing the responsive example
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

In Studio 0.9.46 development builds, declare `requires.sky:1` and `permissions.sky:true` to read `api.host.sky` for the configured weather region. `current` uses the current instant. `day` and `night` use noon and midnight on the same local mean solar date, as determined by the region’s longitude. Each sample contains `sun` and `moon`. Their `azimuth` is measured clockwise from true north (0°, east 90°) and `altitude` is measured from the horizon (0°, negative below it). `api.host.sky` is null when the region is unavailable. Coordinates are private to Studio.

`moon.illuminated` is the fraction of the visible disc that is lit (0–1). `moon.phase` follows the lunar cycle from 0 up to 1, wrapping at the new moon (0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter). `moon.limbAngle` points toward the bright side, measured clockwise in degrees from the local upright toward increasing azimuth (0° = up, 90° = right on a horizon-aligned display).

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


## Scene settings and package sound (Studio 0.9.45+)

Declare `settings:2` to use `visibleWhen` on a settings field. The object has 1–3 keys referring to another choice/toggle field, with exact valid values; all conditions must match. Hidden values are retained and saved; cancellation discards edits. No expressions are evaluated.

Declare `audio:1`, `permissions.audio:true` and `sounds` to use `api.playSound("rain", 0.2)`. Each sound maps to a package-local `assets/<name>.wav`. Only canonical 44-byte-header PCM16 WAV, mono/stereo, 8–48 kHz, 1–30 seconds is accepted: at most 8 sounds, 1 MiB per file, 2 MiB total. One looping sound is played through PC speakers. Repeat the request on each active frame to keep playing; omit it or use volume 0 to stop. Volume is a finite number from 0 to 1. Preview/preflight cannot play audio. Leaving the widget, display sleep, quarantine or app exit stops playback. The host controls the player; there is no microphone, arbitrary URL/path or file-write access. Android/ESP32 do not receive this sound.

An interactive ambient package can set `autoRotate:true` in its manifest to allow Studio’s regular widget rotation. It defaults to false for games. The Relax package is a complete example including scene-specific settings and original rain audio.

`audio:2` (Studio 0.9.45+, Android 0.5.56+) uses the same API and limits but plays on the connected Android device. Virtual-display-only sessions play on the PC. ESP32 and Android without audio_cache remain silent; there is no PC fallback for a physical device. Android advertises `audio_cache:"pcm16-v1"` and keeps SHA-256-verified WAVs in an app-private cache. Both USB and Wi-Fi use audio_select, then audio_begin/audio_chunk/audio_finish only on a cache miss; chunks are at most 65,536 bytes. The device cache is bounded to 8 files and 8 MiB. widget_layout audio_hash/audio_volume commit with the next valid frame. Volume changes keep the player; omitting sound stops it. Backgrounding, disconnect, screen sleep and widget exit stop playback. Losing audio focus does not repeatedly reclaim it. Legacy `audio:1` keeps PC playback. Widgets gain no user-file write/delete rights; only the host maintains its dedicated cache.
