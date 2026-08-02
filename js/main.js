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

  /* "The Circles" nav dropdown. Click to open, click anywhere else or press
     Escape to close. Deliberately not hover-driven: a hover menu is unusable
     on a touch screen and unreachable from the keyboard. */
  var navGroups = document.querySelectorAll(".nav-group");
  navGroups.forEach(function (group) {
    var toggle = group.querySelector(".nav-group-toggle");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var open = !group.classList.contains("open");
      navGroups.forEach(function (other) {
        other.classList.remove("open");
        var otherToggle = other.querySelector(".nav-group-toggle");
        if (otherToggle) {
          otherToggle.setAttribute("aria-expanded", "false");
        }
      });
      group.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  if (navGroups.length) {
    document.addEventListener("click", function (event) {
      navGroups.forEach(function (group) {
        if (!group.contains(event.target)) {
          group.classList.remove("open");
          var toggle = group.querySelector(".nav-group-toggle");
          if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
          }
        }
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") {
        return;
      }
      navGroups.forEach(function (group) {
        group.classList.remove("open");
        var toggle = group.querySelector(".nav-group-toggle");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  /* FAQ accordion: one item open at a time */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    if (!btn) {
      return;
    }
    btn.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        var otherBtn = other.querySelector(".faq-q");
        if (otherBtn) {
          otherBtn.setAttribute("aria-expanded", "false");
        }
      });
      if (!wasOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Email capture and contact forms.
     These are placeholders: they show a confirmation but do not store
     anything yet. Wire them to a form or mailing list service before launch. */
  document.querySelectorAll(".email-capture, .contact-form").forEach(function (form) {
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

/* Members-page-specific behaviour (sign in / sign up UI and Supabase calls)
   lives entirely in js/members-auth.js, loaded only on members.html. */
