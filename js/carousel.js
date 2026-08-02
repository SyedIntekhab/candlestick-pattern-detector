/* EdCircles banner carousel.
   Auto-rotating, swipeable, keyboard reachable. Loaded on index.html only.

   Each slide is a link, which is the whole point of the component, and that
   creates one trap worth naming: a swipe on a touch screen ends with a click
   on whatever is under the finger. The drag handler below tracks how far the
   pointer travelled and suppresses the click when it was a swipe rather than
   a tap, so flicking to the next banner does not also open the current one. */

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel-track");
    var slides = Array.prototype.slice.call(root.querySelectorAll(".carousel-slide"));
    var dotsBox = root.querySelector(".carousel-dots");
    if (!track || slides.length < 2) {
      return;
    }

    var DELAY = 6000;
    var index = 0;
    var timer = null;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var dots = slides.map(function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Slide " + (i + 1) + " of " + slides.length);
      dot.addEventListener("click", function () {
        go(i);
        restart();
      });
      if (dotsBox) {
        dotsBox.appendChild(dot);
      }
      return dot;
    });

    function go(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = "translateX(" + index * -100 + "%)";
      dots.forEach(function (dot, i) {
        dot.classList.toggle("current", i === index);
      });
      slides.forEach(function (slide, i) {
        /* Keep off-screen slides out of the tab order, so tabbing through the
           page does not stop at links nobody can see. */
        slide.setAttribute("aria-hidden", i === index ? "false" : "true");
        slide.tabIndex = i === index ? 0 : -1;
      });
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function restart() {
      stop();
      /* Somebody who asked for reduced motion gets a carousel they drive
         themselves rather than one that moves on its own. */
      if (reduceMotion) {
        return;
      }
      timer = setInterval(function () { go(index + 1); }, DELAY);
    }

    var prev = root.querySelector(".carousel-prev");
    var next = root.querySelector(".carousel-next");
    if (prev) {
      prev.addEventListener("click", function () { go(index - 1); restart(); });
    }
    if (next) {
      next.addEventListener("click", function () { go(index + 1); restart(); });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", restart);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", function (event) {
      if (!root.contains(event.relatedTarget)) {
        restart();
      }
    });

    root.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") { go(index - 1); restart(); }
      if (event.key === "ArrowRight") { go(index + 1); restart(); }
    });

    /* A background tab still fires setInterval, so a page left open for an
       hour would race through dozens of slides the moment it came back. */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stop(); } else { restart(); }
    });

    /* Drag and swipe. Pointer events cover mouse, touch, and pen in one path. */
    var startX = 0;
    var travelled = 0;
    var dragging = false;

    root.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      dragging = true;
      startX = event.clientX;
      travelled = 0;
      stop();
    });

    root.addEventListener("pointermove", function (event) {
      if (dragging) {
        travelled = event.clientX - startX;
      }
    });

    function endDrag() {
      if (!dragging) {
        return;
      }
      dragging = false;
      if (Math.abs(travelled) > 45) {
        go(index + (travelled < 0 ? 1 : -1));
      }
      restart();
    }

    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);

    /* Runs before the link's own navigation, in the capture phase, so a swipe
       that happens to end on a slide does not follow it. */
    root.addEventListener("click", function (event) {
      if (Math.abs(travelled) > 10) {
        event.preventDefault();
        event.stopPropagation();
        travelled = 0;
      }
    }, true);

    go(0);
    /* Enable the sliding transition only after the first position is set. */
    requestAnimationFrame(function () { root.classList.add("ready"); });
    restart();
  });
});
