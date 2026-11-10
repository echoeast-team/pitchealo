# Pitchealo · design proposals

The root `index.html` is a landing page linking to two versions:

- `v1/`: the Luma-inspired version (home + `registro.html` sign-up and onboarding)
- `v2/`: the editorial version based on pitchealo.com (home + `registro.html`)

Live on GitHub Pages: https://echoeast-team.github.io/pitchealo/

Static site, no build step, no external requests (fonts are self-hosted).

## Run it locally

- **Double-click `start-server.command`** (macOS). It starts a small local server (Node, or Python if Node isn't installed) at http://127.0.0.1:4321 (the landing page), waits until it's up, then opens your browser. Keep the Terminal window open while you use the site.
  If macOS says it can't be opened, right-click it, choose **Open**, then **Open** again.
- Or in Terminal: `cd` into this folder and run `node server.js` (or `python3 -m http.server 4321`).
- Or simply open `index.html` in a browser; everything works from the file too.

`v1/character.html` is a sheet of the character's poses and colourways.

## V1 files

Paths below are inside `v1/`.

| Path | What it is |
| --- | --- |
| `index.html` | Home: hero, comparison, «Tu conocimiento», journalists, categories, footer |
| `css/home.css` | Styles for the sections below the hero and the footer |
| `css/styles.css` | All styles, tokens at the top (`--bg`, `--green`, `--blue`) |
| `js/hero.js` | Articles, typed headline, ripple and wind animation |
| `js/character.js` | The reusable character (`PitchealoCharacter.svg(pose)`) |
| `assets/character/*.svg` | Standalone SVGs of each pose |
| `fonts/` | Figtree, Playfair Display, UnifrakturMaguntia (all OFL). Heading font Carmen Sans is licensed separately: see `fonts/carmen-sans/README.txt` |
| `js/sections.js` | Places the character in the sections below the hero |

## Editing

- **Journalist cards:** plain HTML in the `journalists` section of `index.html` (8 cards, 4 across on desktop).

- **Headline phrases:** `PHRASES` in `js/hero.js`.
- **Articles:** `ARTICLES` (content and type: `write`, `sign`, `peek-l`, `peek-r`, `plain`) and the
  `LAYOUT_*` arrays (positions as % of the hero) in `js/hero.js`. Mastheads and headlines are placeholders.
- **Character colours:** Publicadores characters (writing, and the journalist section) are brand green; Fuentes characters (signing) are brand blue. Set with `--pc-colour` near `.pc-body` in `css/styles.css`.
- **Which articles stay on hover:** Publicadores keeps `write`, Fuentes keeps `sign` (see `activate()`).
- **Spacing:** matched to luma.com at 1440 px: nav 14 / 18 px, centred block with 20 px gaps, 18 px pill buttons.

Keyboard focus on either button plays the same animation, touch plays it on press, and
`prefers-reduced-motion` swaps the wind for a simple fade.
