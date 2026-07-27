/* EdCircles password reset.
   Loaded only on reset-password.html, after js/vendor/supabase.js and
   js/supabase-config.js. This is where the link in the reset email lands.
   Supabase reads the recovery token out of the URL and puts a short-lived
   session in place, and updateUser then writes the new password against it. */

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("reset-form");
  var note = document.getElementById("reset-note");
  if (!form) {
    return;
  }

  function setNote(text, isError) {
    if (!note) {
      return;
    }
    note.textContent = text;
    note.classList.toggle("error", !!isError);
    note.classList.add("shown");
  }

  if (typeof supabase === "undefined" || typeof SUPABASE_URL === "undefined") {
    setNote("This page could not load. Please request a new reset link.", true);
    return;
  }
  var client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  /* Recovery links expire. Say so up front rather than after someone has
     typed a password and pressed the button. */
  var ready = false;
  function markReady() {
    ready = true;
  }
  client.auth.getSession().then(function (result) {
    if (result.data && result.data.session) {
      markReady();
      return;
    }
    window.setTimeout(function () {
      if (!ready) {
        setNote("This reset link has expired or has already been used. Ask for a new one from the sign in page.", true);
      }
    }, 1500);
  });
  client.auth.onAuthStateChange(function (event, session) {
    if (session) {
      markReady();
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var input = document.getElementById("reset-pass");
    var password = input ? input.value : "";
    var btn = form.querySelector('button[type="submit"]');

    if (password.length < 8) {
      setNote("Please choose a password of at least eight characters.", true);
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Please wait…";
    }
    if (note) {
      note.classList.remove("shown", "error");
    }

    client.auth
      .updateUser({ password: password })
      .then(function (result) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Save password";
        }
        if (result.error) {
          setNote(result.error.message, true);
          return;
        }
        setNote("Password saved. Taking you to your account.");
        form.reset();
        window.setTimeout(function () {
          window.location.assign("members.html");
        }, 1400);
      })
      .catch(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Save password";
        }
        setNote("Could not reach the server. Check your connection and try again.", true);
      });
  });
});
