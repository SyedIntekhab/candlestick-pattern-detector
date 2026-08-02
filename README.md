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
index.html                  homepage: banner carousel, hero with pie, CPD event band, circle cards
book-demo.html              short demo request form (name, email, phone, which circle)
cpd.html                    the CPD event: registration form and post-session feedback form
admin.html                  private: demo requests, CPD registrations, feedback charts and notes
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
js/carousel.js              the homepage banner carousel (auto-rotate, swipe, dots)
js/public-forms.js          demo, CPD registration, and CPD feedback submissions
js/admin.js                 admin sign-in, charts, sticky notes, tables
js/vendor/supabase.js       vendored Supabase JS client (no CDN dependency)
emails/                     the automatic emails, plus their setup guide
supabase/migrations/        SQL for the form tables and their access rules
supabase/functions/         the welcome-email Edge Function
assets/banners/             the three homepage carousel images
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

## Forms that actually store things (Supabase)

Three forms write real rows: the demo request on `book-demo.html`, and the
registration and feedback forms on `cpd.html`. `admin.html` reads all three
back. Setting this up is two steps, both in the Supabase dashboard.

### 1. Create the tables

SQL Editor, New query, paste all of `supabase/migrations/001_forms.sql`, Run.
Safe to re-run. It creates `demo_requests`, `cpd_registrations`, and
`cpd_feedback`, and turns on the access rules described below.

### 2. Create the admin account

Authentication, Users, Add user. Use `admin@edcircles.net`, set a strong
password, and tick "Auto confirm user". Then open the new user, edit its
**User Metadata**, and add:

```json
{ "role": "admin" }
```

That `role` is the whole of the permission system. `admin.html` will not show
anything to an account without it, and more importantly neither will the
database.

### Why the lock is real this time

The publishable key in `js/supabase-config.js` is public by design, so anyone
can read it out of the page source and query this project directly. A page
that merely hides a panel behind a JavaScript password check would be a
curtain, not a lock: the data would still be one fetch away.

Instead, Row Level Security in Postgres allows anonymous visitors to INSERT
into these three tables and to do nothing else. Reading requires a signed-in
user whose JWT carries `role: admin`. That check runs in the database, not in
the browser, so editing `js/admin.js` in devtools gains an attacker nothing.

The practical consequence: never move the admin check into client-side code,
and never paste the project's **secret** key into any file here. The
publishable key is the only one that belongs client-side.

## Editing guide

- **Colors and fonts**: everything is defined as CSS custom properties at the top of `styles/main.css`. Change a token there and the whole site follows.
- **Navigation and footer**: repeated on every page with identical markup. If you change a link, search and replace across all HTML files to keep them in sync.
- **Adding a service**: copy an existing placeholder page, then add a card to its zone page, a link to its circle card on `index.html`, and a link to the footer column on every page.

## Still needed before launch

1. **Run `supabase/migrations/001_forms.sql` and create the admin user** (see "Forms that actually store things" above). Until then the demo, registration, and feedback forms all fail on submit, because the tables they write to do not exist.
2. **The CPD event's real date, time, and format.** Marked `[PLACEHOLDER]` in two places that must agree: the band on `index.html` and the facts list on `cpd.html`.
3. **The CPD promo images**, to sit in the marked slot in the event band on `index.html`.
4. **Real numbers for the proof band on `index.html`.** The figures and the testimonial there came from the design mockup, not from records. They are public claims about the business, so replace or delete them before launch.
5. **Custom SMTP in Supabase**, so emails send from contact@edcircles.net rather than a Supabase address (see `emails/README.md`). Without it the site works, but only a few emails an hour get through.
6. **Deploy the `send-welcome-email` Edge Function and its Database Webhook** (see `emails/README.md`). Without it, signup works but no welcome email goes out at all, since Supabase's own signup email no longer fires now that confirmation is off.
7. Confirmed session length (marked `PLACEHOLDER`)
8. The Calendly inline embed code (marked `CALENDLY EMBED GOES HERE`)
9. A mailing list or form service for the email capture forms on the individual service pages (those still confirm but store nothing; the demo, CPD registration, and CPD feedback forms are wired up properly)
10. Decision on whether to show a price on the Career Counselling page
11. Real files behind The Library's member shelf. The lock in `js/library-access.js` hides the cards, it does not protect files: anything genuinely private has to be served from storage that checks the member's token.
12. The teacher dashboard's sessions, prep notes, and class activity are sample content until real bookings exist to read from
13. A student dashboard, matching the teacher one
14. Decide whether members need more than name/email/role at sign-up (a proper `profiles` table with Row Level Security, if so)
