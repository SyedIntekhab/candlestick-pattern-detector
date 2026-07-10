/* EdCircles: small shared behaviours. No frameworks, no build step. */

document.addEventListener("DOMContentLoaded", function () {

  /* Mobile navigation toggle */
  document.querySelectorAll(".nav-toggle").forEach(function (toggle) {
    var nav = toggle.closest(".nav");
    var links = nav ? nav.querySelector(".nav-links") : null;
    if (!links) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* Email capture forms.
     These are placeholders: they show a confirmation but do not store
     the address yet. Wire them to a mailing list service before launch. */
  document.querySelectorAll(".email-capture").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var note = form.parentElement.querySelector(".form-note");
      if (note) {
        note.classList.add("shown");
      }
      form.reset();
    });
  });
});
