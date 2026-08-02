// EdCircles welcome email, sent on signup now that email confirmation is
// off. Supabase's own Confirm-signup template only ever fires as part of
// the confirmation flow, so with confirmation disabled it sends nothing at
// all on its own. This function is what replaces it.
//
// Triggered by a Database Webhook: Database -> Webhooks -> INSERT on
// auth.users -> HTTP Request -> this function's URL, with a
// X-Webhook-Secret header matching the WEBHOOK_SECRET secret below.
// See emails/README.md for the full setup, including the SMTP secrets.
//
// The HTML below is a hand-kept copy of emails/welcome-login.html. That file
// is the source of truth for wording; if you change it, update this copy too
// (Supabase Edge Functions can't read the rest of the git repo at runtime).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.14";

const TEMPLATE = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F7FFF7;margin:0;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 34px rgba(41,47,54,0.10);">

        <tr>
          <td style="background-color:#292F36;padding:28px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:5px;"><div style="width:12px;height:12px;border-radius:12px;background-color:#4ECDC4;font-size:0;line-height:0;">&nbsp;</div></td>
                <td style="padding-right:5px;"><div style="width:12px;height:12px;border-radius:12px;background-color:#FF6B6B;font-size:0;line-height:0;">&nbsp;</div></td>
                <td style="padding-right:14px;"><div style="width:12px;height:12px;border-radius:12px;background-color:#FFE66D;font-size:0;line-height:0;">&nbsp;</div></td>
                <td style="color:#F7FFF7;font-size:20px;font-weight:700;letter-spacing:0.2px;">EdCircles</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 32px 8px;">
            <p style="margin:0 0 6px;color:#4ECDC4;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">Welcome</p>
            <h1 style="margin:0 0 18px;color:#292F36;font-size:26px;line-height:1.25;font-weight:700;">{{FULL_NAME_GREETING}}</h1>
            <p style="margin:0 0 16px;color:#4a545e;font-size:16px;line-height:1.6;">Your EdCircles account is ready right now, no extra step needed. Log in with the email address and password you just chose.</p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:10px 32px 28px;">
            <a href="https://edcircles.net/members.html#signin" style="display:inline-block;background-color:#4ECDC4;color:#292F36;font-size:16px;font-weight:700;text-decoration:none;padding:15px 34px;border-radius:999px;">Go to log in</a>
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px;">
            <div style="height:1px;background-color:#e7ece9;font-size:0;line-height:0;">&nbsp;</div>
          </td>
        </tr>

        <tr>
          <td style="padding:26px 32px 4px;">
            <h2 style="margin:0 0 14px;color:#292F36;font-size:17px;font-weight:700;">What your account gives you</h2>
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="8" style="background-color:#4ECDC4;border-radius:4px;font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding:2px 0 16px 14px;">
                  <p style="margin:0 0 3px;color:#292F36;font-size:15px;font-weight:700;">Sessions with verified consultants</p>
                  <p style="margin:0;color:#4a545e;font-size:14px;line-height:1.6;">Every consultant on EdCircles is checked before they join. You tell us what you need, we come back with times that fit.</p>
                </td>
              </tr>
              <tr>
                <td width="8" style="background-color:#FF6B6B;border-radius:4px;font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding:2px 0 16px 14px;">
                  <p style="margin:0 0 3px;color:#292F36;font-size:15px;font-weight:700;">The Library, unlocked</p>
                  <p style="margin:0;color:#4a545e;font-size:14px;line-height:1.6;">The free shelf is open to everyone. Having an account opens the member shelf as well.</p>
                </td>
              </tr>
              <tr>
                <td width="8" style="background-color:#FFE66D;border-radius:4px;font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding:2px 0 16px 14px;">
                  <p style="margin:0 0 3px;color:#292F36;font-size:15px;font-weight:700;">{{DASHBOARD_HEADLINE}}</p>
                  <p style="margin:0;color:#4a545e;font-size:14px;line-height:1.6;">{{DASHBOARD_BODY}}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:8px 32px 30px;">
            <p style="margin:0 0 10px;color:#4a545e;font-size:14px;line-height:1.6;">Questions at any point? Reply to this email. It reaches a real person, usually within two working days.</p>
            <p style="margin:0;color:#8a949c;font-size:13px;line-height:1.6;">If the button does not work, go to edcircles.net and choose Log in.</p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#292F36;padding:22px 32px;">
            <p style="margin:0 0 6px;color:#F7FFF7;font-size:13px;line-height:1.6;font-weight:700;">EdCircles</p>
            <p style="margin:0 0 4px;color:#a7b0b6;font-size:12px;line-height:1.6;">Verified education consultants for teachers, students, and schools.</p>
            <p style="margin:0;color:#8a949c;font-size:12px;line-height:1.6;">You are receiving this because someone created an EdCircles account with {{EMAIL}}. If that was not you, contact us by replying to this email.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderEmail(fullName: string, role: string, email: string): string {
  const first = fullName.trim().split(" ")[0];
  const greeting = first ? `Welcome to EdCircles, ${escapeHtml(first)}.` : "Welcome to EdCircles.";
  const isTeacher = role === "teacher";
  const headline = isTeacher ? "Your teaching dashboard" : "Everything in one place";
  const body = isTeacher
    ? "Your sessions for the day, what to prepare for each one, and full access to the resource library."
    : "Bookings, session notes, and follow-ups live in your account instead of scattered across your inbox.";

  return TEMPLATE
    .replaceAll("{{FULL_NAME_GREETING}}", greeting)
    .replaceAll("{{DASHBOARD_HEADLINE}}", headline)
    .replaceAll("{{DASHBOARD_BODY}}", body)
    .replaceAll("{{EMAIL}}", escapeHtml(email));
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!expectedSecret) {
    console.error("REJECTED: WEBHOOK_SECRET secret is not set on this function");
    return new Response("Unauthorized: WEBHOOK_SECRET secret is not set on this function", { status: 401 });
  }
  const providedSecret = req.headers.get("X-Webhook-Secret");
  if (!providedSecret) {
    console.error("REJECTED: request is missing the X-Webhook-Secret header");
    return new Response("Unauthorized: request is missing the X-Webhook-Secret header", { status: 401 });
  }
  if (providedSecret !== expectedSecret) {
    console.error(
      "REJECTED: X-Webhook-Secret header does not match the WEBHOOK_SECRET secret. Header was " +
        providedSecret.length + " characters, secret was " + expectedSecret.length + " characters.",
    );
    return new Response("Unauthorized: X-Webhook-Secret header does not match the WEBHOOK_SECRET secret", { status: 401 });
  }

  const payload = await req.json();
  const record = payload?.record;
  const email: string | undefined = record?.email;
  if (!email) {
    return new Response("Missing email in payload", { status: 400 });
  }

  const meta = record?.raw_user_meta_data ?? {};
  const fullName: string = typeof meta.full_name === "string" ? meta.full_name : "";
  const role: string = meta.role === "teacher" ? "teacher" : "student";

  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");
  if (!smtpUser || !smtpPass) {
    return new Response("SMTP not configured", { status: 500 });
  }

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transport.sendMail({
    from: '"EdCircles" <contact@edcircles.net>',
    to: email,
    subject: "Welcome to EdCircles. You're all set.",
    html: renderEmail(fullName, role, email),
  });

  return new Response("ok", { status: 200 });
});
