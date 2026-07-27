# EdCircles emails

Every automatic email EdCircles sends goes out from **contact@edcircles.net**.

Two files here are the templates:

| File | Supabase template | When it sends |
| --- | --- | --- |
| `confirm-signup.html` | Confirm signup | The moment somebody creates an account. This is the welcome email. |
| `reset-password.html` | Reset password | When somebody uses "Forgot password?" on the members page. |

They are written for email clients rather than browsers: table layout, styles
inline, no stylesheet, no web fonts, no images to download. That is deliberate.
Outlook and Gmail strip most of what a normal web page relies on, and an email
with no images still looks right in a client that blocks them.

## What the site already does

`js/members-auth.js` sends the two pieces of information the welcome email
needs, and tells Supabase where each link should land:

- `full_name` and `role` go into the sign-up call, and reach the template as
  `{{ .Data.full_name }}` and `{{ .Data.role }}`. That is how the email greets
  people by name and shows a teacher something different from a student.
- `emailRedirectTo` points the confirm link at `welcome.html`.
- `redirectTo` points the reset link at `reset-password.html`.

Both URLs are worked out from whatever address the site is being served on, so
nothing is hard-coded and previews work the same as the live domain.

## Setting it up in Supabase

Three steps. The first is the one that matters: **until SMTP is configured,
Supabase sends from its own address and rate-limits you to a handful of emails
an hour**, which is fine for testing and not fine for a live site.

### 1. Send from contact@edcircles.net

Dashboard, Project Settings, **Authentication**, **SMTP Settings**. Turn on
"Enable Custom SMTP" and fill in:

- **Sender email**: `contact@edcircles.net`
- **Sender name**: `EdCircles`

Then the server details, which depend on where the mailbox lives.

**Google Workspace** (edcircles.net mail is already there):

| Field | Value |
| --- | --- |
| Host | `smtp.gmail.com` |
| Port | `587` |
| Username | `contact@edcircles.net` |
| Password | An **App Password**, not the account password |

Create the App Password at myaccount.google.com, Security, 2-Step Verification,
App passwords. The normal password will not work and 2-Step Verification has to
be on before the option appears. Google Workspace allows roughly 2,000
messages a day, which is far more headroom than a launch needs.

**A dedicated sending service** (Resend, Postmark, SendGrid) is the better
long-term answer once volume grows, because deliverability reporting is real
and bounces are visible. Any of them gives you a host, port 587, and a
username and password to paste into the same form. The templates do not change.

Whichever route you pick, add SPF and DKIM records for edcircles.net in your
DNS. Without them a good share of welcome emails land in spam, and a welcome
email in the spam folder is the same as no welcome email.

### 2. Paste the templates

Dashboard, **Authentication**, **Emails**. For each template, open the tab,
switch to the source view, and paste the file's contents in whole.

Subject lines to set alongside them:

- Confirm signup: `Welcome to EdCircles. Confirm your email.`
- Reset password: `Reset your EdCircles password`

### 3. Allow the redirect URLs

Dashboard, **Authentication**, **URL Configuration**.

- **Site URL**: `https://edcircles.net`
- **Redirect URLs**: add `https://edcircles.net/**`, and the Netlify preview
  domain too if you use one.

Supabase refuses any redirect that is not on this list, and the failure looks
like a link that quietly bounces back to the homepage. If a confirmation link
ever misbehaves, check here first.

## Checking it works

Create an account on the live site with a real address, using a name and the
teacher role. You should get the welcome email from contact@edcircles.net,
greeting you by first name, with the teacher paragraph in the third block.
Clicking through lands on `welcome.html`, which greets you again and points at
the teacher dashboard.

Then do the same with the student role and confirm the third block changes.

## Editing the copy later

Edit the file here, paste it into Supabase again. Keeping the files in the repo
means the wording is version-controlled and reviewable, rather than living only
in a dashboard textarea where a change leaves no trace.

## A note on what these emails are not

These send on account events. A booking confirmation, a session reminder, or a
newsletter is a different job, and it needs something that can send on demand
rather than in response to a sign-up: a Supabase Edge Function or a scheduled
job calling a sending service. Worth building when bookings go live, not
before.
