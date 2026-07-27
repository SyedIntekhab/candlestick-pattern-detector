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

/* Members page: split-screen role chooser with sign-in and sign-up cards */
document.addEventListener("DOMContentLoaded", function () {
  var split = document.querySelector(".member-split");
  if (!split) {
    return;
  }

  /* Living background video: only ever requested on desktop, and only
     started if the visitor has not asked for reduced motion. Fading it
     in waits for the browser's "playing" event, so a blocked or slow
     autoplay never leaves a blank gap; the flat tint background shows
     until the video actually confirms it is running. */
  var splitVideo = split.querySelector(".split-video");
  var canPlayVideo =
    splitVideo &&
    window.matchMedia("(min-width: 761px)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (canPlayVideo) {
    splitVideo.addEventListener("playing", function () {
      split.classList.add("video-bg-active");
    });
    splitVideo.preload = "auto";
    splitVideo.play().catch(function () {});
  }

  function pick(side) {
    split.classList.remove("choose", "picked-student", "picked-teacher");
    split.classList.add("picked-" + side);
    if (splitVideo) {
      splitVideo.pause();
    }
  }

  split.querySelectorAll("[data-side]").forEach(function (el) {
    el.addEventListener("click", function (event) {
      if (el.classList.contains("side") && event.target.closest(".auth-card")) {
        return;
      }
      event.stopPropagation();
      pick(el.getAttribute("data-side"));
    });
  });

  /* Tab switching (Sign in / Create account) is pure UI and lives here.
     The forms themselves submit to Supabase; see js/members-auth.js,
     loaded only on this page. */
  split.querySelectorAll(".auth-card").forEach(function (card) {
    card.querySelectorAll(".auth-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        card.querySelectorAll(".auth-tab").forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        card.querySelector(".auth-signin").classList.toggle("hidden", tab.getAttribute("data-mode") !== "signin");
        card.querySelector(".auth-signup").classList.toggle("hidden", tab.getAttribute("data-mode") !== "signup");
      });
    });
  });
});
