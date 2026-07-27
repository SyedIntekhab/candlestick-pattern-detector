/* EdCircles member accounts, backed by Supabase Auth.
   Loaded only on members.html, after js/vendor/supabase.js and
   js/supabase-config.js. Everything here degrades quietly if those are
   missing, so a page never breaks because of this script. */

document.addEventListener("DOMContentLoaded", function () {
  if (typeof supabase === "undefined" || typeof SUPABASE_URL === "undefined") {
    return;
  }

  var client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  var split = document.querySelector(".member-split");
  var dashboard = document.getElementById("member-dashboard");
  var marketing = document.getElementById("members-marketing");
  var welcome = document.getElementById("dashboard-welcome");
  var roleLabel = document.getElementById("dashboard-role-label");
  var signOutBtn = document.getElementById("sign-out-btn");

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
    if (welcome) {
      welcome.textContent = "Welcome back, " + name + ".";
    }
    if (roleLabel) {
      roleLabel.textContent = role === "teacher" ? "The Staffroom · Member" : "The Classroom · Member";
    }
    if (dashboard) {
      dashboard.classList.remove("role-student", "role-teacher");
      dashboard.classList.add("role-" + role);
      dashboard.hidden = false;
    }
    if (split) {
      split.hidden = true;
    }
    if (marketing) {
      marketing.hidden = true;
    }
    scrollToTop();
  }

  function showSignedOut() {
    if (dashboard) {
      dashboard.hidden = true;
    }
    if (split) {
      split.hidden = false;
    }
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

  document.querySelectorAll(".auth-form").forEach(function (form) {
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
      var emailInput = form.querySelector('input[type="email"]');
      var passwordInput = form.querySelector('input[type="password"]');
      var email = emailInput ? emailInput.value : "";
      var password = passwordInput ? passwordInput.value : "";

      var request;
      if (isSignup) {
        var nameInput = form.querySelector('input[type="text"]');
        var side = form.closest(".side");
        var role = side && side.getAttribute("data-side") === "teacher" ? "teacher" : "student";
        request = client.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: nameInput ? nameInput.value : "",
              role: role,
            },
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
          if (isSignup && !result.data.session) {
            setNote(note, "Account created. Check " + email + " to confirm your email before signing in.");
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
