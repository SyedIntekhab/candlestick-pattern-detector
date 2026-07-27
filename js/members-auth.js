/* EdCircles member accounts, backed by Supabase Auth.
   Loaded only on members.html, after js/vendor/supabase.js and
   js/supabase-config.js. Everything here degrades quietly if those are
   missing, so a page never breaks because of this script. */

document.addEventListener("DOMContentLoaded", function () {
  var authCard = document.getElementById("member-auth-card");
  if (!authCard) {
    return;
  }

  var dashboard = document.getElementById("member-dashboard");
  var marketing = document.getElementById("members-marketing");
  var welcome = document.getElementById("dashboard-welcome");
  var roleLabel = document.getElementById("dashboard-role-label");
  var avatar = document.getElementById("dashboard-avatar");
  var signOutBtn = document.getElementById("sign-out-btn");

  /* --- Pure UI: mode switching (sign in / create account / forgot), the
     role toggle on sign-up, and show/hide-password. None of this needs
     Supabase, so it runs even if the client below fails to load. --- */

  function setMode(mode) {
    authCard.setAttribute("data-mode", mode);
    authCard.querySelectorAll(".auth-tab").forEach(function (tab) {
      tab.classList.toggle("active", tab.getAttribute("data-mode") === mode);
    });
    authCard.querySelectorAll(".auth-form").forEach(function (form) {
      form.classList.toggle("hidden", !form.classList.contains("auth-" + mode));
    });
  }
  authCard.querySelectorAll("[data-mode]").forEach(function (el) {
    el.addEventListener("click", function () {
      setMode(el.getAttribute("data-mode"));
    });
  });

  /* The nav links here as members.html#signin and members.html#signup, so
     open on the tab the visitor actually asked for. */
  function modeFromHash() {
    var hash = (window.location.hash || "").replace("#", "");
    if (hash === "signup" || hash === "signin" || hash === "forgot") {
      setMode(hash);
    }
  }
  modeFromHash();
  window.addEventListener("hashchange", modeFromHash);

  authCard.querySelectorAll(".role-opt").forEach(function (btn) {
    btn.addEventListener("click", function () {
      authCard.querySelectorAll(".role-opt").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
    });
  });

  authCard.querySelectorAll(".field-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var input = toggle.parentElement.querySelector("input");
      var showing = input.type === "text";
      input.type = showing ? "password" : "text";
      toggle.querySelector(".icon-eye").classList.toggle("hidden", !showing);
      toggle.querySelector(".icon-eye-off").classList.toggle("hidden", showing);
      toggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  });

  /* --- Supabase-backed behaviour --- */

  if (typeof supabase === "undefined" || typeof SUPABASE_URL === "undefined") {
    return;
  }
  var client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  /* Both emails Supabase sends carry a link back to this site, and the link
     has to be built from wherever the site is actually being served. Deriving
     it from the current URL means the same code works on the live domain, on
     a Netlify preview, and on a local server, with no address hard-coded.
     Every host used here must also be listed under Authentication ->
     URL Configuration -> Redirect URLs in Supabase, or the link is refused.

     A page opened straight from disk (double-clicked, or a file:// address)
     has no real origin: Chrome and Firefox both report it as the literal
     string "null", which would otherwise get baked into the emailed link and
     send the confirmation button nowhere. In that case, and on any other
     origin that is not http(s), return nothing rather than something broken.
     Supabase then falls back to whatever Site URL is configured in its own
     dashboard, which is where a real link should be pointing from anyway. */
  function siteUrl(page) {
    var origin = window.location.origin;
    if (!/^https?:\/\//.test(origin)) {
      return undefined;
    }
    return origin + window.location.pathname.replace(/[^/]*$/, "") + page;
  }

  function roleOf(user) {
    var meta = user.user_metadata || {};
    return meta.role === "teacher" ? "teacher" : "student";
  }

  /* Signing in or out swaps a tall section for a short one (or back), so
     the old scroll position can land anywhere on the resulting page.
     Jump to top so the new state is what the visitor actually sees. */
  function scrollToTop() {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function showSignedIn(user) {
    var meta = user.user_metadata || {};
    var name = meta.full_name || user.email;
    var role = roleOf(user);

    /* Teachers get their own dashboard page. Students stay here on the
       simple card until their dashboard is built. */
    if (role === "teacher") {
      window.location.assign("dashboard-teacher.html");
      return;
    }
    if (welcome) {
      welcome.textContent = "Welcome back, " + name + ".";
    }
    if (roleLabel) {
      roleLabel.textContent = role === "teacher" ? "The Staffroom · Member" : "The Classroom · Member";
    }
    if (avatar) {
      avatar.textContent = name.trim().charAt(0).toUpperCase() || "?";
    }
    if (dashboard) {
      dashboard.classList.remove("role-student", "role-teacher");
      dashboard.classList.add("role-" + role);
      dashboard.hidden = false;
    }
    authCard.hidden = true;
    if (marketing) {
      marketing.hidden = true;
    }
    scrollToTop();
  }

  function showSignedOut() {
    if (dashboard) {
      dashboard.hidden = true;
    }
    authCard.hidden = false;
    if (marketing) {
      marketing.hidden = false;
    }
    scrollToTop();
  }

  client.auth.getSession().then(function (result) {
    if (result.data && result.data.session) {
      showSignedIn(result.data.session.user);
    }
  });

  client.auth.onAuthStateChange(function (event, session) {
    if (session) {
      showSignedIn(session.user);
    } else {
      showSignedOut();
    }
  });

  if (signOutBtn) {
    signOutBtn.addEventListener("click", function () {
      signOutBtn.disabled = true;
      client.auth.signOut().then(function () {
        signOutBtn.disabled = false;
      });
    });
  }

  function setNote(note, text, isError) {
    if (!note) {
      return;
    }
    note.textContent = text;
    note.classList.toggle("error", !!isError);
    note.classList.add("shown");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    note.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  authCard.querySelectorAll(".auth-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var note = form.querySelector(".form-note");
      var btn = form.querySelector('button[type="submit"]');
      var originalLabel = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Please wait…";
      }
      if (note) {
        note.classList.remove("shown", "error");
      }

      var isSignup = form.classList.contains("auth-signup");
      var isForgot = form.classList.contains("auth-forgot");
      var emailInput = form.querySelector('input[type="email"]');
      var passwordInput = form.querySelector('input[id$="-pass"]');
      var email = emailInput ? emailInput.value : "";
      var password = passwordInput ? passwordInput.value : "";

      var request;
      if (isForgot) {
        request = client.auth.resetPasswordForEmail(email, {
          redirectTo: siteUrl("reset-password.html"),
        });
      } else if (isSignup) {
        var nameInput = form.querySelector('input[id$="-name"]');
        var roleBtn = form.querySelector(".role-opt.active");
        var role = roleBtn && roleBtn.getAttribute("data-role") === "teacher" ? "teacher" : "student";
        request = client.auth.signUp({
          email: email,
          password: password,
          options: {
            /* full_name and role reach the welcome email as {{ .Data.full_name }}
               and {{ .Data.role }}, which is how that email knows who it is
               greeting and which next step to suggest. */
            data: {
              full_name: nameInput ? nameInput.value : "",
              role: role,
            },
            emailRedirectTo: siteUrl("welcome.html"),
          },
        });
      } else {
        request = client.auth.signInWithPassword({ email: email, password: password });
      }

      request
        .then(function (result) {
          if (btn) {
            btn.disabled = false;
            btn.textContent = originalLabel;
          }
          if (result.error) {
            setNote(note, result.error.message, true);
            return;
          }
          if (isForgot) {
            setNote(note, "Check " + email + " for a link to reset your password. It comes from contact@edcircles.net.");
            form.reset();
            return;
          }
          if (isSignup && !result.data.session) {
            setNote(note, "Account created. We have sent a welcome email to " + email + " from contact@edcircles.net. Open it to confirm your address, then you are in.");
            form.reset();
            return;
          }
          form.reset();
        })
        .catch(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = originalLabel;
          }
          setNote(note, "Could not reach the server. Check your connection and try again.", true);
        });
    });
  });
});
