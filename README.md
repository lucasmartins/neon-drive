# Neon Drive

A quiet, cinematic neon night drive, running as WebAssembly in your browser.

**Play: https://lucasmartins.github.io/neon-drive/**

Click **Start drive** to enable music and enter the city. Browser autoplay rules require this initial gesture.

| Control | Action |
| --- | --- |
| Hold Space | Boost |
| R | Open/close radio |
| M | Mute/unmute |
| Up / Down | Volume |
| Escape | Stop; reload to start again |

The radio also has clickable volume controls. Add `?muted=1` for a muted start, or `?radio=1` for an expanded radio deck.

## Distribution repository

This repository hosts the tested, prebuilt HTML/JavaScript/WASM distribution, not the development repository or its history. GitHub Pages publishes the root of `main`; `.nojekyll` keeps the assets unchanged. No Rust compilation runs on GitHub.

To preview a checkout locally:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open http://127.0.0.1:8765/ — do not open the HTML as a `file://` URL.

To update: build and verify a new WASM distribution in the development project with `bash scripts/build.sh wasm`, copy only `index.html`, `bridge.js`, `mq_js_bundle.js`, `neon-drive.wasm` and the authorized `assets/song.ogg` into this repository, refresh the notices and `distribution.json`, then commit and push to `main`. Verify the resulting Pages deployment and live assets. Never copy the entire development checkout, private references, credentials, or unrelated local files.

## Credits and rights

Music: **We Can Fix Everything (The Ultimate Machine)** by **Kevin Koontz** ([@koozeex1](https://x.com/koozeex1/status/2096140707329368181)). Visual inspiration: Kevin Koontz's music video. Original animation and humor: Lucas Martins.

The maintainer confirmed permission to publicly distribute the soundtrack and cleared public use of the existing billboard artwork before this deployment. These third-party assets are **not relicensed under this repository's MIT license**. All trademarks remain their owners' property; their appearance does not imply sponsorship or endorsement.

See [THIRD_PARTY.md](THIRD_PARTY.md) and [licenses/](licenses/) for software and font notices. `distribution.json` records the deployed artifact hashes. No reference-video frames are shipped.
