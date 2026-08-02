/* EdCircles public forms: demo requests, CPD registration, CPD feedback.
   Loaded on book-demo.html and cpd.html, after js/vendor/supabase.js and
   js/supabase-config.js.

   Unlike the placeholder forms in js/main.js, these really store what they
   collect: each one inserts a row into its own Supabase table. Anonymous
   visitors are allowed to INSERT and nothing else. They cannot read any of
   it back, which is enforced by Row Level Security in the database rather
   than by this file. See supabase/migrations/001_forms.sql.

   Everything here degrades quietly if Supabase fails to load, so a page
   never breaks because of this script. */

document.addEventListener("DOMContentLoaded", function () {
  var forms = document.querySelectorAll(".public-form");
  if (!forms.length) {
    return;
  }

  /* Which table each form writes to, and how its success reads. */
  var TARGETS = {
    "demo": {
      table: "demo_requests",
      done: "Thank you. Your demo request is in, and we will be in touch within two working days.",
    },
    "cpd-registration": {
      table: "cpd_registrations",
      done: "You are registered. Joining details are on their way to your WhatsApp and email.",
    },
    "cpd-feedback": {
      table: "cpd_feedback",
      done: "Thank you. Your feedback has been recorded anonymously.",
    },
  };

  /* Build the 1-to-5 scales. Written by script rather than by hand because
     four questions of five options each is twenty near-identical radios, and
     hand-maintaining that in the markup invites a mismatched name or value. */
  document.querySelectorAll(".scale").forEach(function (scale) {
    var name = scale.getAttribute("data-scale");
    var row = document.createElement("div");
    row.className = "scale-row";
    for (var value = 1; value <= 5; value++) {
      var label = document.createElement("label");
      label.className = "scale-opt";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = String(value);
      input.required = true;
      var text = document.createElement("span");
      text.textContent = String(value);
      label.appendChild(input);
      label.appendChild(text);
      row.appendChild(label);
    }
    var ends = document.createElement("div");
    ends.className = "scale-ends";
    ends.innerHTML = "<span></span><span></span>";
    ends.children[0].textContent = scale.getAttribute("data-low") || "";
    ends.children[1].textContent = scale.getAttribute("data-high") || "";
    scale.appendChild(row);
    scale.appendChild(ends);
  });

  if (typeof supabase === "undefined" || typeof SUPABASE_URL === "undefined") {
    return;
  }
  var client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  function setNote(note, text, isError) {
    if (!note) {
      return;
    }
    note.textContent = text;
    note.classList.toggle("error", !!isError);
    note.classList.add("shown");
  }

  /* Collects the form into a plain object, dropping empty optional fields so
     an untouched textarea stores null rather than an empty string. */
  function valuesOf(form) {
    var out = {};
    new FormData(form).forEach(function (value, key) {
      var trimmed = typeof value === "string" ? value.trim() : value;
      if (trimmed === "") {
        return;
      }
      out[key] = /^rating_/.test(key) ? Number(trimmed) : trimmed;
    });
    return out;
  }

  forms.forEach(function (form) {
    var target = TARGETS[form.getAttribute("data-form")];
    if (!target) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      /* novalidate is set in the markup so the browser does not interrupt
         with its own bubbles before this runs, but the constraints are still
         worth honouring. Check them here and let the browser report. */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var note = form.querySelector(".form-note");
      var btn = form.querySelector('button[type="submit"]');
      var originalLabel = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending...";
      }
      if (note) {
        note.classList.remove("shown", "error");
      }

      client
        .from(target.table)
        .insert(valuesOf(form))
        .then(function (result) {
          if (btn) {
            btn.disabled = false;
            btn.textContent = originalLabel;
          }
          if (result.error) {
            setNote(note, "Could not send that: " + result.error.message, true);
            return;
          }
          form.reset();
          /* The form is gone from view once it succeeds, so the confirmation
             has to be what replaces it rather than a line under a form the
             visitor might fill in twice. */
          form.classList.add("sent");
          setNote(note, target.done);
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
