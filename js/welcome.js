/* EdCircles welcome page.
   Loaded only on welcome.html, after js/vendor/supabase.js and
   js/supabase-config.js. This is where the confirmation link in the welcome
   email lands. Supabase has already turned the link's token into a session by
   the time this runs, so the page can greet the new member by name and show
   the next step that actually applies to them.

   It degrades on purpose: someone who opens this page with no session still
   sees a sensible welcome, just without the personal touches. */

document.addEventListener("DOMContentLoaded", function () {
  var title = document.getElementById("welcome-title");
  if (!title) {
    return;
  }

  if (typeof supabase === "undefined" || typeof SUPABASE_URL === "undefined") {
    return;
  }
  var client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  function show(user) {
    var meta = user.user_metadata || {};
    var full = (meta.full_name || "").trim();
    var first = full ? full.split(" ")[0] : "";
    var teacher = meta.role === "teacher";

    if (first) {
      title.textContent = "You're in, " + first + ".";
    }

    var sub = document.getElementById("welcome-sub");
    if (sub) {
      sub.textContent = teacher
        ? "Your email is confirmed and your teaching account is live. Your sessions and prep notes are waiting on your dashboard."
        : "Your email is confirmed and your EdCircles account is live. Here is the short version of what you can do with it.";
    }

    // Each step card is tagged for a student, a teacher, or both.
    document.querySelectorAll("#welcome-steps [data-for]").forEach(function (card) {
      var want = card.getAttribute("data-for");
      card.hidden = want !== "both" && want !== (teacher ? "teacher" : "student");
    });

    var go = document.getElementById("welcome-go");
    if (go && teacher) {
      go.setAttribute("href", "dashboard-teacher.html");
      go.textContent = "Go to your dashboard";
    }
  }

  client.auth.getSession().then(function (result) {
    if (result.data && result.data.session) {
      show(result.data.session.user);
    }
  });

  /* The session sometimes arrives a moment after load, while the client is
     still reading the token out of the URL. */
  client.auth.onAuthStateChange(function (event, session) {
    if (session) {
      show(session.user);
    }
  });
});
