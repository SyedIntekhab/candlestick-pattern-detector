# EdCircles

A marketing and booking website for EdCircles, a two-sided marketplace connecting teachers, students, and schools with verified education consultants.

The design follows a clean, minimal marketing-site pattern: sticky top navigation, a hero with the EdCircles pie mark, uniform card grids, and a dark footer with links to every service. Plain HTML, CSS, and JavaScript, no build step, no frameworks.

## The three circles

Each zone is reachable from the navigation bar, the pie on the homepage, the circle cards, or the footer:

- **The Staffroom** (`staffroom.html`): teacher training and career support
- **The Classroom** (`classroom.html`): student career counselling, tutoring, and exam prep
- **The Library** (`library.html`): whole-school training and resources

`career-counselling.html` is the one fully built booking page for now; every other service links to a placeholder page with real draft copy and an email capture for interest.

## Running locally

Serve the folder with any static file server, for example:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploying to a domain

The site is fully static with relative links, so it works on any host with no configuration:

- **Netlify / Vercel / Cloudflare Pages**: point at this repo, no build command, publish directory is the repo root
- **GitHub Pages**: enable Pages on the branch, root folder
- **Shared hosting (cPanel etc.)**: upload all files to `public_html`

## Structure

```
index.html                  homepage: hero with pie, circle cards, featured service, footer
staffroom.html              Teacher Training service grid
classroom.html              Student Support service grid
library.html                Whole-School Training service grid
career-counselling.html     full booking page
*.html                      individual service placeholder pages
styles/main.css             all styles, token driven (edit colors at the top)
js/main.js                  mobile nav toggle and placeholder email forms
assets/favicon.svg          pie favicon
```

## Editing guide

- **Colors and fonts**: everything is defined as CSS custom properties at the top of `styles/main.css`. Change a token there and the whole site follows.
- **Navigation and footer**: repeated on every page with identical markup. If you change a link, search and replace across all HTML files to keep them in sync.
- **Adding a service**: copy an existing placeholder page, then add a card to its zone page, a link to its circle card on `index.html`, and a link to the footer column on every page.

## Still needed before launch

1. Counsellor name, short bio, and headshot for `career-counselling.html` (marked `PLACEHOLDER` in the file)
2. Confirmed session length (marked `PLACEHOLDER`)
3. The Calendly inline embed code (marked `CALENDLY EMBED GOES HERE`)
4. A mailing list or form service for the email capture forms (they currently confirm but store nothing)
5. Decision on whether to show a price on the Career Counselling page
