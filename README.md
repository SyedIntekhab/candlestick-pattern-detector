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
cpd-catalogue.html          CPD for Schools: three in-service programmes
about.html                  vision, mission, what we do, testimonials (placeholder)
faq.html                    accordion FAQ (extend by copying a .faq-item block)
contact.html                contact form (placeholder backend) and details
members.html                student/teacher sign in and sign up, backed by Supabase Auth
welcome.html                unused since email confirmation was turned off; kept, unlinked
reset-password.html         where the reset email's link lands, sets the new password
dashboard-teacher.html      the teacher's own dashboard: sessions, prep, library, workspace
wellness.html               Wellness Corner, reached from the dashboard
*.html                      individual service placeholder pages
styles/main.css             all styles, token driven (edit colors at the top)
js/main.js                  nav, FAQ accordion, member picker UI, placeholder email forms
js/supabase-config.js       Project URL and publishable key (safe to commit, see below)
js/members-auth.js          sign up / sign in / sign out logic for members.html
js/welcome.js               greets the new member and shows the step that fits their role
js/reset-password.js        saves the new password against the recovery session
js/dashboard-teacher.js     live clock, workspace, session guard for the teacher dashboard
js/wellness.js              check-ins, resets, journal, ambient sound
js/library-access.js        unlocks the member shelf in The Library once signed in
js/vendor/supabase.js       vendored Supabase JS client (no CDN dependency)
emails/                     the automatic emails, plus their setup guide
assets/favicon.svg          pie favicon
```

## Member accounts (Supabase)

`members.html` has real, working sign-up and sign-in, backed by Supabase Auth. No
build step is involved: `js/vendor/supabase.js` is the official client library
downloaded once and committed as a plain script, loaded before
`js/members-auth.js` on that page only.

- **Config**: `js/supabase-config.js` holds the Project URL and the
  **publishable key**. That key is designed to be public (Supabase's own
  dashboard labels it "safe to use in a browser"), so it's fine committed here.
  The **secret key** must never go in this file, or anywhere else client-side.
- **What's stored**: sign-up collects name, email, and password. Name and a
  `role` (`student` or `teacher`, set by which side of the picker was used)
  are saved to Supabase's built-in `user_metadata`, no extra database table
  yet. `members.html` shows a real "Welcome back" dashboard with a Sign Out
  button once Supabase confirms a session.
- **Email confirmation is off**: signing up returns an active session
  immediately, no click-to-confirm step. There's no `welcome.html` link to
  chase; the page signs the new member in on the spot.
- **Automatic emails**: the welcome email (`emails/welcome-login.html`) is
  sent by a Supabase Edge Function on signup, not by Supabase's own
  templates, since those only fire as part of the confirmation flow that's
  now off. The password reset email is a real Supabase template, same as
  before. `emails/README.md` covers deploying the function and pointing SMTP
  at contact@edcircles.net, which is the step that stops emails going out
  from a Supabase address with a low rate limit.
- **Where teachers land**: signing in as a teacher goes to
  `dashboard-teacher.html`, which guards itself behind a real session and
  sends students back. Students stay on `members.html` until their own
  dashboard is built.
- **Testing note**: the claude.ai Artifact preview link runs under a strict
  content security policy that blocks calls to external hosts, so sign-up and
  sign-in will always show a connection error there by design. Everything
  works normally once the site is actually deployed (Netlify, etc.) with real
  internet access.

## Editing guide

- **Colors and fonts**: everything is defined as CSS custom properties at the top of `styles/main.css`. Change a token there and the whole site follows.
- **Navigation and footer**: repeated on every page with identical markup. If you change a link, search and replace across all HTML files to keep them in sync.
- **Adding a service**: copy an existing placeholder page, then add a card to its zone page, a link to its circle card on `index.html`, and a link to the footer column on every page.

## Still needed before launch

1. **Custom SMTP in Supabase**, so emails send from contact@edcircles.net rather than a Supabase address (see `emails/README.md`). Without it the site works, but only a few emails an hour get through.
2. **Deploy the `send-welcome-email` Edge Function and its Database Webhook** (see `emails/README.md`). Without it, signup works but no welcome email goes out at all, since Supabase's own signup email no longer fires now that confirmation is off.
3. Confirmed session length (marked `PLACEHOLDER`)
4. The Calendly inline embed code (marked `CALENDLY EMBED GOES HERE`)
5. A mailing list or form service for the email capture forms (they currently confirm but store nothing)
6. Decision on whether to show a price on the Career Counselling page
7. Real files behind The Library's member shelf. The lock in `js/library-access.js` hides the cards, it does not protect files: anything genuinely private has to be served from storage that checks the member's token.
8. The teacher dashboard's sessions, prep notes, and class activity are sample content until real bookings exist to read from
9. A student dashboard, matching the teacher one
10. Decide whether members need more than name/email/role at sign-up (a proper `profiles` table with Row Level Security, if so)
