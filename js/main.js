/* EdCircles: small shared behaviours. No frameworks, no build step. */

/* Tag the document so CSS only hides .reveal elements when JS can
   reveal them again. Without JS, everything stays visible. */
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", function () {

  /* Scroll-triggered reveals */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in-view"); });
  }

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
