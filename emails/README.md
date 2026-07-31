# EdCircles emails

Every automatic email EdCircles sends goes out from **contact@edcircles.net**.

Email confirmation is turned off in Supabase Auth settings: accounts are
active the moment someone signs up, no click-to-confirm step. That means
Supabase's own Confirm-signup template never fires (there is nothing left to
confirm), so `confirm-signup.html` is no longer pasted into Supabase and no
longer sends. It stays in the repo for reference in case confirmation is ever
turned back on.

Three files here are templates:

| File | Sent by | When it sends |
| --- | --- | --- |
| `welcome-login.html` | The `send-welcome-email` Edge Function (see below) | The moment somebody creates an account. This is the current welcome email. |
| `reset-password.html` | Supabase, template "Reset password" | When somebody uses "Forgot password?" on the members page. |
| `confirm-signup.html` | Nobody, currently | Unused while confirmation is off. Kept for reference. |

They are written for email clients rather than browsers: table layout, styles
inline, no stylesheet, no web fonts, no images to download. That is deliberate.
Outlook and Gmail strip most of what a normal web page relies on, and an email
with no images still looks right in a client that blocks them.

## The welcome email is not a Supabase template

`welcome-login.html` is different from the other two files here: it is not
pasted into the Supabase dashboard. Supabase only ever emails on its own as
part of the confirmation flow, and that flow is off, so nothing built into
Supabase Auth can send a "you're in" email any more.

Instead, `supabase/functions/send-welcome-email/index.ts` sends it directly
over the same SMTP setup as everything else here, triggered by a Database
Webhook the moment a new row lands in `auth.users`. That function keeps its
own copy of this template's HTML (Edge Functions cannot read the rest of the
repo at runtime), with `{{FULL_NAME_GREETING}}`, `{{DASHBOARD_HEADLINE}}`,
`{{DASHBOARD_BODY}}`, and `{{EMAIL}}` filled in by plain string substitution
rather than Supabase's Go templating. **If you edit the wording in
`welcome-login.html`, copy the change into the function's `TEMPLATE` constant
too**, since nothing keeps the two in sync automatically.

### Deploying the function

Needs the Supabase CLI, logged in and linked to the EdCircles project.

1. `supabase functions deploy send-welcome-email`
2. Set the secrets it reads from `Deno.env`:
   ```
   supabase secrets set SMTP_USER=contact@edcircles.net
   supabase secrets set SMTP_PASS=<the same Google Workspace App Password from the SMTP setup below>
   supabase secrets set WEBHOOK_SECRET=<a long random string you generate once>
   ```
3. Dashboard, **Database**, **Webhooks**, create a new one:
   - Table: `auth.users` (turn on "Show auth schema" if it is not listed)
   - Events: `Insert`
   - Type: HTTP Request, POST, to the function's URL (shown after step 1)
   - Add an HTTP header `X-Webhook-Secret` set to the same string as
     `WEBHOOK_SECRET` above. The function rejects any request missing this
     header or carrying the wrong value, since its URL is otherwise a public
     endpoint.

The function is what actually sends `welcome-login.html`'s content; nothing
needs pasting into Authentication -> Emails for it.

## What the site already does

`js/members-auth.js` sends the two pieces of information the welcome email
needs:

- `full_name` and `role` go into the sign-up call. Supabase stores them on
  `raw_user_meta_data`, which is where the Database Webhook payload and the
  Edge Function above read them from, and how the welcome email greets
  people by name and shows a teacher something different from a student.
- `redirectTo` points the password reset link at `reset-password.html`,
  worked out from whatever address the site is being served on, so nothing
  is hard-coded and previews work the same as the live domain.

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

### 2. Paste the reset-password template, deploy the welcome function

Dashboard, **Authentication**, **Emails**, **Reset password**. Open the tab,
switch to the source view, and paste in `reset-password.html`. Subject line:
`Reset your EdCircles password`.

The welcome email does not get pasted anywhere in this screen. Follow "The
welcome email is not a Supabase template" above to deploy the Edge Function
and wire its Database Webhook instead.

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
teacher role. Signing up should log you in immediately, with no confirm-your-
email step, and land you on `dashboard-teacher.html`. Separately, the welcome
email should arrive from contact@edcircles.net, greeting you by first name,
with the teacher paragraph in the third block, and a "Go to log in" button
that lands on `members.html#signin`.

Then do the same with the student role: you should land on the members page's
signed-in view instead, and the email's third block should read differently.

## Editing the copy later

For `reset-password.html`: edit the file here, paste it into Supabase again.
Keeping the files in the repo means the wording is version-controlled and
reviewable, rather than living only in a dashboard textarea where a change
leaves no trace.

For `welcome-login.html`: edit the file here, then copy the same change into
`supabase/functions/send-welcome-email/index.ts`'s `TEMPLATE` constant, then
redeploy the function (`supabase functions deploy send-welcome-email`).

## A note on what these emails are not

These send on account events. A booking confirmation, a session reminder, or a
newsletter is a different job, and it needs something that can send on demand
rather than in response to a sign-up: a Supabase Edge Function or a scheduled
job calling a sending service. Worth building when bookings go live, not
before.
