# Pitchealo V1 · Design rules

The design system for V1 (the Luma-inspired version) of the Pitchealo site: the home page (`index.html`) and sign-up with onboarding (`registro.html`). Every value here is taken from the shipped code. If a value changes in code, change it here too.

---

## 1. Concept

- **Two sides, one platform.** Every screen serves one of two audiences, and each has its own colour:
  - **Publicadores**: journalists and creators of articles, newsletters, podcasts and programmes. **Green.**
  - **Fuentes**: experts, businesses and PR professionals who want to be quoted. **Blue.**
- **The character carries the brand.** A small figure built from the head in the Pitchealo logo appears throughout. It writes for Publicadores, signs for Fuentes, and peeks over the edges of cards and articles everywhere else.
- **Newspaper props, product clarity.** The hero and illustrations use newspaper clippings, but the interface around them is calm and modern: soft neutrals, rounded cards and pill buttons, in the spirit of luma.com.
- **Motion with meaning.** Animation shows which side you're on (colour ripples, things blown away), confirms actions (ticks drawing in, chips popping) and gives the character life. It is never decoration for its own sake, and it always respects reduced motion.

---

## 2. Colour

### 2.1 Tokens (`css/styles.css`, `:root`)

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#E9EBDF` | Page background, hero background |
| `--sheet` | `#FBFBF7` | The sheet that slides over the hero (all sections below it) |
| `--green` | `#548F52` | **Publicadores** side colour |
| `--blue` | `#417F98` | **Fuentes** side colour |
| `--ink` | `#151515` | Text, dark buttons, footer background |
| `--ink-muted` | `rgba(21,21,21,.64)` | Secondary text, body copy under headings |
| `--ink-faint` | `rgba(21,21,21,.40)` | Tertiary text, hints, "Explorar la plataforma" |
| `--paper` | `#FBFAF4` | Newspaper clippings |
| `--paper-line` | `#D2CEBF` | Text lines inside clippings |
| White | `#FFFFFF` | Cards, form fields |

### 2.2 Side palettes

| | Publicadores | Fuentes | Both selected |
| --- | --- | --- | --- |
| Base | `#548F52` | `#417F98` | Gradient `#548F52 → #417F98` (90deg) |
| Hover / pressed | `#497F47` | `#386F86` | |
| Tint (card art, icon tiles) | `#EEF4EC` | `#EAF2F5` | `#DCE7E2` |
| Soft (onboarding background glow, badges) | `#DDEAD9` | `#D6E6EC` | |
| Text on tint (labels, eyebrows) | `#3A6B39` | `#2C6177` | `#355F52` |
| Tag text | `#3F7240` | | |

### 2.3 Rules

- **One side, one colour.** Anything about Publicadores uses green; anything about Fuentes uses blue. Never swap them, and never use a side colour for a neutral element.
- **Neutral UI is ink.** Nav pills, "Crear cuenta", "Crear cuenta gratis", the footer and anything that serves both sides use `--ink`, not a side colour.
- **The gradient means both.** The green-to-blue gradient is reserved for things that cover both sides: the rotating headline word, the "conocimiento" accent and the "both selected" state in onboarding.
- **Tints are mixed, not new colours.** For hover borders, focus rings and shadows, mix the side colour with `transparent` (`color-mix(in srgb, var(--side) 45%, transparent)`). Don't introduce new hex values.
- **Inside the hero ripple** everything flips to white on the side colour. The rotating word becomes `#F4F0CF`, and the hovered button becomes `#F7F6EE` with side-coloured text.
- **Errors** use `#A83A27` for text, `#C24B36` for field borders and `#FBEDE8` for the message background. Errors never use a side colour.

---

## 3. Typography

### 3.1 Families

| Token | Stack | Use |
| --- | --- | --- |
| `--font-heading` | **Carmen Sans**, then Figtree, then system sans | All headings: hero title, section titles, card titles, names |
| `--font-ui` | **Figtree** (variable, 300 to 900), then system sans | Everything else: body, buttons, labels, fields |
| `--font-news` | Playfair Display 700/800 | Headlines and quotes **inside newspaper clippings only** |
| `--font-mast` | UnifrakturMaguntia | Newspaper mastheads **inside clippings only** |

Carmen Sans (Studio Jaso) is commercially licensed and isn't in the repo. Put the licensed web files in `fonts/carmen-sans/` (see the README there). Until then, headings fall back to Figtree. Weight 600 (SemiBold) is the one that matters most.

Newspaper fonts never appear in the interface itself: they belong to the props.

### 3.2 Scale

| Role | Font | Size / line height | Weight | Letter spacing |
| --- | --- | --- | --- | --- |
| Hero title | Heading | `clamp(40px, 5.3vw, 80px)` / .95 | 600 | -0.035em |
| Hero title (≤719px) | Heading | `clamp(32px, 9.2vw, 42px)` | 600 | -0.03em |
| "Tu conocimiento" title | Heading | `clamp(32px, 4.2vw, 56px)` / 1.08 | 600 | -0.035em |
| Footer title | Heading | `clamp(28px, 3.4vw, 46px)` / 1.08 | 600 | -0.03em |
| Section title | Heading | `clamp(30px, 3.4vw, 44px)` / 1.05 | 600 | -0.03em |
| Comparison card title | Heading | 38px / 1 (32px on phones) | 600 | -0.03em |
| Onboarding title | Heading | `clamp(26px, 3vw, 34px)` / 1.08 | 600 | -0.03em |
| Sign-up title | Heading | 34px / 1.05 | 600 | -0.03em |
| Step title ("Conocimiento" etc.) | Heading | 26px / 1.1 | 600 | -0.02em |
| Card title (requests) | Heading | 19px / 23px | 600 | -0.015em |
| Card name | Heading | 17px / 21px | 600 | -0.01em |
| Lead / section sub | UI | 18px / 28px (16/24 on phones) | 400 | |
| Hero sub | UI | 18px / 28px (15.5/23 on phones) | 400, lead-in sentence 600 | |
| Onboarding lead | UI | 17px / 26px | 400 | |
| Body | UI | 15–15.5px / 22–24px | 400 | |
| Button (hero CTA) | UI | 18px / 27px (16/24 on phones) | 600 | |
| Button (standard) | UI | 16px / 22–24px | 600 | |
| Nav and pills | UI | 14px / 21px | 500 | |
| Small text, card role | UI | 14px / 19–20px | 400 | |
| Eyebrow | UI | 12–13px / 16px, UPPERCASE | 600–700 | 0.12em |
| Tag / chip | UI | 12–12.5px (chips 15px) | 600 (chips 500) | |

### 3.3 Rules

- **Sentence case** for everything, except eyebrows, which are uppercase with 0.12em tracking.
- Headings use **negative tracking** (-0.01em for small titles up to -0.035em for display sizes) and `text-wrap: balance`. Paragraphs use `text-wrap: pretty`.
- Hierarchy comes from **ink versus muted ink**, not from extra weights: titles in `--ink`, supporting copy in `--ink-muted`, hints in `--ink-faint`.
- Keep line length to about 590–620px for body copy.
- Eyebrows are optional and sparing. The home page deliberately has none above the journalists or category sections.

---

## 4. Layout and spacing

### 4.1 Grid

- **Container:** max-width 1232px, centred, with 24px side padding (16px at ≤719px).
- **Sections:** 88px vertical padding inside the sheet (the first section has 104px on top); 64px at ≤719px.
- **Section head:** title block on the left and a "Ver todas…" pill on the right, aligned to the bottom, with a 40px gap before the content (28px on phones). Centred heads (`.section-head--center`) are used only for the comparison.
- **Grid gap:** 16px between cards everywhere (10px for compact phone category grids).

### 4.2 Spacing scale

Spacing follows a loose 4px rhythm. Use these steps: **4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 56, 64, 72, 88, 104**.

| Context | Value |
| --- | --- |
| Gap between items in the hero block | 20px (16px on phones) |
| Hero block padding | 0 20px 40px |
| Nav padding | 14px 18px (12px 14px on phones) |
| Card padding | 20px (journalist), 28px 32px 32px (comparison body), 24px (onboarding card), 32px (sign-up card) |
| Button row gaps | 12px (10px on phones) |
| List item gap | 12px |

### 4.3 Breakpoints

| Width | What changes |
| --- | --- |
| ≥1280px | Hero shows 11 clippings (2 extra mid-depth ones) |
| ≤1120px | Journalist and category grids go to 2 columns; footer to 3 columns |
| ≤900px | Comparison cards stack, and their connector turns horizontal; "Tu conocimiento" steps stack vertically; onboarding goes single-column |
| ≤719px | Phone layout: smaller type, `--overlap` 28px, nav gets a fading background, hero shows 6 clippings, "Sobre nosotros" is hidden from the nav |
| ≤600px | Onboarding action bar becomes sticky at the bottom |
| ≤560px | Journalist grid becomes 1 column; category grid becomes compact 2-column tiles |

### 4.4 The overlapping sheet

- The hero is `100svh + var(--overlap)` tall, and the sheet below it has a negative top margin of the same amount. The result: **only the hero is above the fold**, and the sheet's rounded top sits exactly at the fold.
- `--overlap` is 36px (28px on phones). It's also the sheet's top corner radius.
- The footer repeats the move as a dark sheet sliding over the light one, with the same radius.

---

## 5. Shape, borders and elevation

### 5.1 Radius scale

| Radius | Use |
| --- | --- |
| 100px (pill) | All buttons, chips, tags, "Ver todas", labels |
| 15px | Nav pills |
| 36px (`--overlap`) | Sheet and footer top corners |
| 32px | "Tu conocimiento" panel |
| 24px | Comparison cards, sign-up card, onboarding card |
| 20px | Category cards |
| 16px | Journalist cards, type options, radio cards, request preview |
| 14px | Category icon tiles |
| 12px | Form fields, error boxes |
| 4px | Newspaper clippings |
| 50% | Avatars, step nodes, the logo medallion |

### 5.2 Borders

- Cards: `1px solid rgba(21,21,21,.07–.08)` on white. Borders are hairlines that only just separate a card from the sheet.
- Form fields, chips and type options: `1.5px solid rgba(21,21,21,.10–.12)`.
- Dividers inside cards: `1px solid rgba(21,21,21,.08)`.
- On hover, a border takes the side colour at about 40–45% (`color-mix`), or ink at 12% for neutral cards.

### 5.3 Shadows

| Name | Value | Use |
| --- | --- | --- |
| CTA (`--shadow-cta`) | `0 3px 3px rgba(0,0,0,.03), 0 8px 7px rgba(0,0,0,.04), 0 17px 14px rgba(0,0,0,.05), 0 35px 28px rgba(0,0,0,.06)` | Hero buttons, primary buttons |
| Card hover (Luma) | `0 28px 17px rgba(0,0,0,.01), 0 12px 24px rgba(0,0,0,.05), 0 3px 7px rgba(0,0,0,.03)` | Comparison and landing cards |
| Category hover | The same layers tinted with the side colour at 2% and 6% | Category cards |
| Raised card | `0 2px 4px rgba(21,21,21,.03), 0 18px 40px rgba(21,21,21,.06)` | Sign-up and onboarding cards |
| Clipping | `0 0 0 1px rgba(30,30,20,.05), 0 1px 2px …, 0 8px 18px …, 0 24px 40px rgba(30,30,20,.08)` | Newspaper clippings |

Shadows are soft, layered and low-opacity. Never use a single hard shadow in V1 (hard offset shadows belong to V2).

---

## 6. Components

### 6.1 Navigation

- Logo mark (39×26) on the left in blue; on the right, "Sobre nosotros" (text link), "Iniciar sesión" (light pill) and "Crear cuenta" (ink pill).
- Pills: 14px/500, padding 7px 10px, radius 15px. Light pill: ink at 5% (9% on hover). Dark pill: ink (`#2a2a2a` on hover).

### 6.2 Buttons

| Button | Look | Use |
| --- | --- | --- |
| **Hero CTA** (`.cta`) | Pill, min-width 168px, padding 10px 24px, 18px/600, white text on side colour, CTA shadow | "Publicadores" and "Fuentes" in the hero |
| **Side button** (`.side-btn`) | Pill, padding 11px 20px, 16px/600, side colour, trailing "→" that nudges 3px on hover | "Soy publicador", "Quiero ser fuente" |
| **Main button** (`.main-btn`) | Pill, padding 12px 26px, 17px/600, ink | Neutral actions: "Crear cuenta gratis" |
| **Primary (onboarding)** | Pill, 16px/600, side colour (gradient when both are selected), CTA shadow | "Registrarme", "Siguiente" |
| **Ghost** | Pill, ink at 5% | "Anterior", secondary actions |
| **"Ver todas"** | Pill, 15px/500, ink at 5%, trailing "→" | Section heads |
| **Text link** | 16px/500, `--ink-faint`, "→" nudges on hover | "Explorar la plataforma" |

Every button lifts 1–2px on hover (`translateY`) with the spring ease, and has a visible focus ring (2px outline, 3px offset).

### 6.3 Comparison cards ("Facilitamos el trabajo entre publicadores y fuentes")

- Two cards side by side, joined by a dashed vertical rule with the logo in a white 52px medallion that slowly pulses.
- Each card has:
  - an art band (220px, side tint with a dot grid) holding a tilted mini newspaper with the character writing or signing on it;
  - a body with the question, title, bold subtitle and muted paragraph;
  - a ticked list (circle and tick in the side colour, drawn in one by one on scroll);
  - a side button pinned to the bottom.
- Hover: the border takes the side colour, the Luma shadow appears, the card lifts 3px, and the mini paper straightens and scales to 1.03.
- Below both cards, a centred main button: "Crear cuenta gratis".

### 6.4 "Tu conocimiento merece estar en los medios de comunicación."

- White panel with a 32px radius, a green glow top-left and a blue glow bottom-right. A character peeks over the top edge from behind the panel.
- "conocimiento" is set in the green-to-blue gradient with a hand-drawn green underline that draws in on scroll.
- Three steps (Conocimiento, Visibilidad, Vínculos), each a 64px circular node with a line icon. Node colours run blue, then `#4A8776`, then green. A curved line draws between the nodes on scroll.
- Hover on a step: the node fills with its colour, the icon turns white, and the node lifts and scales to 1.06.

### 6.5 Journalist cards ("Detrás de cada historia, alguien busca una fuente")

- 4 × 2 grid of white cards (16px radius, 20px padding).
- Each card, in order: 52px illustrated avatar, name (heading 17px), role (muted 14px), "Perfil y solicitud de ejemplo" grey pill, request title (heading 19px), description (muted 14.5px), hairline divider, then green tag pills.
- Hover: lift 2px with a soft shadow. One card has the character peeking over its top edge.

### 6.6 Category cards (Luma "Browse by Category")

- Two sections: **"Encontrá fuentes por especialidad"** (Publicadores, green) and **"Medios que buscan fuentes hoy"** (Fuentes, blue). 12 cards each.
- Grid: 3 columns × 4 rows, 16px gap.
- Card: white, 72px tall, 20px radius, hairline border. A 52px icon tile (14px radius, side tint, line icon in the side colour) is followed by the name (16px/500) and count (14px, ink at 42%).
- Hover (Luma's behaviour in the side colour), 0.3s `cubic-bezier(.4,0,.2,1)`:
  - border goes to the side colour at 45%, and the tinted layered shadow appears;
  - the icon tile fills with the side colour, the icon turns white and redraws itself (0.9s), and the tile tilts -6° and scales to 1.06;
  - the count turns the side colour, and a "→" slides in from the left.
- Icons: 24×24 line icons, 1.6px stroke, round caps and joins, `pathLength="1"` so they can draw on.
- Phones (≤560px): 2-column tiles with the icon above the text, and no arrow.

### 6.7 Footer

- A dark (`--ink`) sheet with 36px top corners that slides over the page. Two characters peek over its top edge, a green one on the left and a blue one on the right.
- Contents, top to bottom:
  - a centred CTA: eyebrow "Tu conocimiento puede llegar más lejos", heading, and both side buttons;
  - a 4-column grid: about text with the logo, then "Empezá", "Pitchealo" and "Legal" link columns;
  - a bottom row: "© 2026 Pitchealo".
- Text: white at 82% for links, 60% for paragraphs, 42% for column headings and the bottom row.

### 6.8 Newspaper clippings (hero props)

- Paper `#FBFAF4`, 4px radius, clipping shadow, and a faint newsprint vignette.
- Contents, top to bottom: blackletter masthead, a date row between a single rule and a double rule, a red kicker (`#A1442F`), a Playfair headline, an optional photo (flat illustration with halftone dots) or text lines, and two columns of grey lines.
- All sizes are in `em` from `font-size: calc(var(--w) / 21)`, so a clipping scales as one piece.
- Types:
  - **write**: the character writes a draft in pencil;
  - **sign**: the character signs a quote with a fountain pen;
  - **peek-l / peek-r**: the character peeks from behind a top corner;
  - **plain**: no character.
- Mastheads and headlines are fictional placeholders.

### 6.9 Forms (sign-up and onboarding)

- **Labels:** 14px/600 above the field; optional fields add "(opcional)" in faint ink.
- **Fields:** 16px text, padding 11px 14px, 1.5px border, 12px radius. Focus: the border takes the side colour, plus a 4px ring in the side colour at 16%.
- **Errors:** an inline message under the field, the border turns `#C24B36`, and the card gives a gentle 360ms shake. Messages are kind and say how to fix the problem.
- **Type options (Fuente / Publicador):** 16px-radius rows with a custom checkbox whose tick draws in, a 44px icon with the character, the name and a description. Checked: border and fill take the option's colour and tint, and the character bobs.
- **Chips:** pills (padding 9px 15px, 1.5px border). Selected: filled with the side colour, white text, and a tick that slides in and draws. They pop on toggle and stagger in (25ms apart).
- **Radio cards:** 16px-radius rows with a 40px icon tile and a dot that springs in.
- **Switch:** 44×26 track; the knob springs across.
- **Password:** "Mostrar" toggle and a 3-segment strength meter.

### 6.10 Onboarding progress and actions

- **Progress:** "Paso X de N · Step name" on the left, "Siguiente: next step" on the right, and a segmented bar of 6px-tall segments with 6px gaps. Filled segments use the side colour of that step; the current segment has a soft ring.
- **Card:** white, 24px radius, 24px padding, raised shadow. Screens are either split (a 340px visual column plus content) or wide.
- **Action bar:** a three-column grid with "Anterior" (ghost) on the left, the "Presioná Enter para continuar" hint in the **exact centre** and "Siguiente" (primary) on the right. "Anterior" is hidden on the first screen, but the hint stays centred. It's separated from the screen by a hairline with 28px above and 24px of padding.

---

## 7. The character

### 7.1 Construction

- Built from the **head silhouette in the Pitchealo logo**, so the mascot and the logo always share one profile. Every pose is drawn in the logo's own coordinate space; the head spans about x 1.6–26, y 4–29.
- It's a flat shape in the side colour, with a white eye and dark pupil, a coral cheek (`#F58C78` at 72%), a small mouth, and, when talking, the logo's sound waves.
- Colour comes from `--pc-colour`: **green on anything about Publicadores, blue on anything about Fuentes**. The default is blue.

### 7.2 API (`js/character.js`)

```js
PitchealoCharacter.svg('hello')          // standalone <svg>
PitchealoCharacter.group('write')        // <g> to place inside another SVG
PitchealoCharacter.TIP                   // { x: 31, y: 30 }: pen tip anchor for write / sign
```

### 7.3 Poses

| Pose | What it does | Colour | Where |
| --- | --- | --- | --- |
| `hello` | Front-facing, sound waves on | Either | Character sheet, general use |
| `peek` | Head only, looks around; the page adds hands on the edge | Blue by default; green in the journalist section; one of each in the footer | Behind clipping corners, cards, panels, footer |
| `write` | Writes with a pencil | **Green** | Clippings that stay on Publicadores hover; comparison card |
| `sign` | Signs with a fountain pen | **Blue** | Clippings that stay on Fuentes hover; comparison card |
| `wave` | Waves a hand | Side of the flow | Onboarding welcome |
| `celebrate` | Both hands up, happy eyes | Side of the flow | Onboarding final screen, with newspaper confetti |

### 7.4 Behaviour

- **Blinks** every 5.2s.
- **Peeks** on a 6.5–9.5s loop: rises 58–64% of its height with a small tilt, looks around, says something (sound waves), then ducks back down. Each instance gets its own duration and delay, so they never move in sync.
- **Writes and signs live:** the pen follows the handwriting path as it draws (46 units/s writing, 34 units/s signing), holds for 1.4s, lifts back to the start over 0.75s, then repeats.
- **When blown away** in the hero, its eyes widen and peeks pause.

### 7.5 Rules

- Never recolour the character outside the two side colours.
- Never stretch it: scale it uniformly, and size it by width.
- Peeking characters always sit **behind** the edge they peek over, with hands drawn **in front** of it.
- At most one peeking character per card and two per section.

---

## 8. Hero behaviour

### 8.1 Layout

- Background `--bg`. Clippings float around the centred text block and fade out towards the bottom (mask from opaque at 70% to clear at 97% of the hero's height).
- Positions are percentages of the hero (see `LAYOUT_*` in `js/hero.js`). Each clipping has a width, a rotation and a depth (0.75–1.05) that sets its parallax and bob.
- **Idle motion:** a gentle bob (±7px × depth), a sway of about 1°, and mouse parallax (up to 26px horizontal and 18px vertical × depth).

### 8.2 Headline

- "Conseguí prensa gratis / conectando con / {word}", where {word} types out "creadores de contenido." and then "periodistas." in the green-to-blue gradient, with a blinking caret.
- Typewriter timing: hold 2.6s, delete 32ms per character, pause 0.35s, type 70ms per character. The caret only blinks while idle.

### 8.3 Hovering "Publicadores" or "Fuentes"

1. **Colour ripple:** a circle of the side colour grows from the button's centre until it fills the hero (1050ms, ease-out cubic). The text inside the circle switches to its white version exactly where the ripple has reached, so the change sweeps across rather than snapping.
2. **Wind:** every clipping blows away from the button, except the **writing** ones (for Publicadores) or the **signing** ones (for Fuentes).
   - Each clipping leaves when the wind reaches it: its delay is its distance from the button ÷ 1500 px/s.
   - It flies outwards with a flutter, spins 35–90° in 3D and fades over 0.95s.
   - The clippings that stay just wobble in the gust.
3. **Leaving:** the ripple shrinks back over 650ms (ease-in-out cubic) and the clippings float back over 1.15s.

Keyboard focus on either button triggers the same effect. On touch, it plays on press.

---

## 9. Motion

### 9.1 Easing

| Name | Curve | Use |
| --- | --- | --- |
| Standard | `cubic-bezier(.4, 0, .2, 1)` | Colour, border and shadow transitions (Luma's curve) |
| Spring | `cubic-bezier(.2, 1.15, .3, 1)` | Onboarding screens, chips, toggles, checks |
| Lift | `cubic-bezier(.3, .7, .4, 1)` | Button and card lifts |
| Reveal | `cubic-bezier(.2, .7, .2, 1)` | Scroll reveals |
| Draw | `cubic-bezier(.6, 0, .2, 1)` | Lines and icons drawing on |

### 9.2 Durations

| What | Duration |
| --- | --- |
| Hover colour, border or shadow | 0.2–0.3s |
| Button or card lift | 0.25–0.4s |
| Scroll reveal (fade up 18–26px) | 0.6–0.8s, list items staggered 45ms |
| Tick or line draw-in | 0.4–0.7s, staggered 110ms |
| Icon redraw on hover | 0.9s |
| Onboarding screen out / in | 260ms out (-48px), 620ms in (+56px, spring, 90ms delay); card height 520ms |
| Error shake | 360ms |
| Hero ripple in / out | 1050ms / 650ms |

### 9.3 Patterns

- **Reveal on scroll:** sections fade up once when 8% of them is visible, with a -12% bottom root margin. Only runs when JavaScript is on (`html.js`), so content is never hidden without it.
- **Draw on:** lines, ticks and icons use `pathLength="1"` and animate `stroke-dashoffset` from 1 to 0.
- **Hover lift:** cards lift 2–3px; buttons lift 1–2px and their arrow nudges 3px.

### 9.4 Reduced motion

With `prefers-reduced-motion: reduce`:

- Reveals, draw-ons and loops are switched off, so content shows in its final state.
- The wind becomes a simple fade.
- Peeking characters sit still, half raised.
- Onboarding transitions become a plain fade, and the confetti is skipped.

---

## 10. Onboarding

### 10.1 Sign-up (`registro.html`)

- Two columns: the form card (max 460px) and an illustration that recolours live as types are ticked. With both ticked, it shows two characters and the gradient.
- `?tipo=publicador` or `?tipo=fuente` preselects a type; `?modo=ingresar` shows a note that the prototype starts at sign-up.
- Fields: Nombre y apellido, Correo electrónico, Contraseña. Button: "Registrarme".

### 10.2 Flows

**Publicador (green):** Bienvenida → Tu medio → Tus temas → Verificación → Tu primera solicitud (with a live preview card the character writes on) → Listo.

**Fuente (blue):** Bienvenida → Tu especialidad → Tu perfil → Cómo responder (sample request with the character signing) → Alertas → Listo ("Te quedan 10 respuestas este mes").

**Both:** the shared welcome, then the Publicador steps, then the Fuente steps, then the shared final screen. The colour switches with each step, and Fuente topics are prefilled from Publicador topics.

### 10.3 Rules

- **One question per screen.** Every screen has an eyebrow, a title, one short lead and one task.
- **The character on every screen,** in a pose that suits the task.
- **Enter always advances.** Focus moves to the new screen's title, and the change is announced through `aria-live`.
- **Validate kindly and inline.** Errors clear as soon as the person fixes the problem.
- **Nothing leaves the page:** the prototype makes no network calls and never stores passwords.

---

## 11. Copy and voice

- **Rioplatense Spanish with voseo:** "Conseguí", "Querés", "Contanos", "Elegí", "Presioná". Never mix in tú forms.
- **Warm, direct and practical.** Talk to the person ("Tu conocimiento merece…"), keep sentences short, and avoid jargon and hype.
- **Name the two sides consistently:** "publicadores" and "fuentes" (capitalised as section or button names: "Publicadores", "Fuentes"). Calls to action: "Soy publicador", "Quiero ser fuente", "Crear cuenta gratis".
- **Error messages say what to do next,** for example: "Contanos tu cargo o rol: ayuda a los publicadores a saber por qué sos la persona indicada."
- Use guillemets for quotes in clippings: «…».
- People, requests, counts, mastheads and headlines on the site are **examples**. Keep them plausible, Latin American and clearly fictional.

---

## 12. Accessibility

- **Contrast:** text is always ink on light or white on a side colour. Muted ink (64%) is the lowest level used for body copy; faint ink (40%) is only for hints and decorative labels.
- **Focus:** every interactive element has a visible focus ring (2px outline in ink or the side colour, 2–3px offset). Hover effects are mirrored on focus where they carry meaning, such as the hero ripple.
- **Semantics:** use real headings in order, lists for grids, `<nav>` with labels, and `aria-hidden` on decorative SVGs and characters. The hero title has a screen-reader version, because the visible one animates.
- **Recoloured hero copy:** the white copy inside the ripple is `aria-hidden` and `inert`; only the light copy is read.
- **Touch targets:** buttons, options and chips are at least 44px tall. The nav pills (35px) are the one exception, as on Luma: keep them well spaced.
- **Motion:** see 9.4.

---

## 13. Files

| File | Contains |
| --- | --- |
| `css/styles.css` | Tokens, fonts, hero, nav, clippings, character styles, journalist cards |
| `css/home.css` | The sheet, comparison, "Tu conocimiento", categories, footer, scroll reveals |
| `css/onboarding.css` | Sign-up and onboarding (all classes start with `ob-`) |
| `js/character.js` | The character and its poses |
| `js/hero.js` | Clippings, typewriter, ripple and wind |
| `js/sections.js` | Places characters (`[data-pc="pose"]`) and runs the scroll reveals |
| `js/onboarding.js` | Sign-up validation and the onboarding flows |
| `character.html` | Character sheet: every pose and colourway |
| `fonts/` | Figtree, Playfair Display, UnifrakturMaguntia (OFL); Carmen Sans goes in `fonts/carmen-sans/` |

When adding something new: use the tokens, pick the side colour by audience, reuse an existing card, button or motion pattern, and add the character only where it has a job to do.
