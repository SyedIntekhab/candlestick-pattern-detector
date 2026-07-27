/* EdCircles teacher dashboard.
   Loaded only on dashboard-teacher.html, after js/vendor/supabase.js and
   js/supabase-config.js. Guards the page behind a real session, then brings
   the dashboard to life: live clock, greeting, workspace, booking request. */

document.addEventListener("DOMContentLoaded", function () {
  var main = document.getElementById("dash-main");
  var checking = document.getElementById("dash-checking");
  if (!main) {
    return;
  }

  /* ------------------------------------------------------------------
     Live analogue clock. Runs regardless of sign-in state so the face is
     already correct the moment the dashboard is revealed.
     ------------------------------------------------------------------ */
  var hourHand = document.getElementById("hand-hour");
  var minHand = document.getElementById("hand-min");
  var secHand = document.getElementById("hand-sec");
  var digital = document.getElementById("clock-digital");
  var dateOut = document.getElementById("clock-date");

  function two(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function tick() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();

    // Hour and minute hands move smoothly between marks, like a real clock.
    var hourDeg = ((h % 12) + m / 60) * 30;
    var minDeg = (m + s / 60) * 6;
    var secDeg = s * 6;

    if (hourHand) { hourHand.setAttribute("transform", "rotate(" + hourDeg + " 50 50)"); }
    if (minHand) { minHand.setAttribute("transform", "rotate(" + minDeg + " 50 50)"); }
    if (secHand) { secHand.setAttribute("transform", "rotate(" + secDeg + " 50 50)"); }

    if (digital) {
      digital.textContent = two(h) + ":" + two(m);
    }
    if (dateOut) {
      dateOut.textContent = now.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  }
  tick();
  setInterval(tick, 1000);

  /* A line that changes with the day rather than at random, so it stays
     steady while someone works and is new tomorrow. */
  var lines = [
    "One student, one hour, one clear explanation.",
    "The best teachers teach from the heart, not from the book.",
    "Small steps, taken daily, become someone's turning point.",
    "You do not just teach a subject, you shape futures.",
    "Be kind to yourself too. The room feels how you feel.",
    "We rise by lifting others.",
    "Every day is a chance to make a difference.",
  ];
  var chalk = document.getElementById("chalk-line");
  if (chalk) {
    var start = new Date(new Date().getFullYear(), 0, 0);
    var dayOfYear = Math.floor((new Date() - start) / 86400000);
    chalk.textContent = lines[dayOfYear % lines.length];
  }

  /* ------------------------------------------------------------------
     Workspace: tasks and notes, saved in this browser only. No account
     data is involved, which is why the card says "saved on this device".
     ------------------------------------------------------------------ */
  var TASK_KEY = "edcircles.teacher.tasks";
  var NOTE_KEY = "edcircles.teacher.notes";

  function readStore(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key)) || {};
    } catch (e) {
      return {};
    }
  }
  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* Private browsing or a full quota: the dashboard still works,
         it just will not remember. */
    }
  }

  var doneTasks = readStore(TASK_KEY);
  document.querySelectorAll('#task-list input[type="checkbox"]').forEach(function (box) {
    var id = box.getAttribute("data-task");
    if (doneTasks[id]) {
      box.checked = true;
      box.closest("li").classList.add("done");
    }
    box.addEventListener("change", function () {
      doneTasks[id] = box.checked;
      box.closest("li").classList.toggle("done", box.checked);
      writeStore(TASK_KEY, doneTasks);
    });
  });

  var notes = document.getElementById("ws-notes");
  var savedFlag = document.getElementById("ws-saved");
  if (notes) {
    try {
      notes.value = window.localStorage.getItem(NOTE_KEY) || "";
    } catch (e) { /* ignore */ }
    var saveTimer = null;
    notes.addEventListener("input", function () {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(function () {
        try {
          window.localStorage.setItem(NOTE_KEY, notes.value);
        } catch (e) { /* ignore */ }
        if (savedFlag) {
          savedFlag.textContent = "Saved";
          window.setTimeout(function () { savedFlag.textContent = ""; }, 1600);
        }
      }, 400);
    });
  }

  /* ------------------------------------------------------------------
     Session guard and everything that needs the signed-in member.
     ------------------------------------------------------------------ */
  if (typeof supabase === "undefined" || typeof SUPABASE_URL === "undefined") {
    // Without the client we cannot verify anyone, so send them to sign in
    // rather than exposing the dashboard shell.
    window.location.replace("members.html#signin");
    return;
  }

  var client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  function greetingFor(name) {
    var h = new Date().getHours();
    var part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    return name ? part + ", " + name + "." : part + ".";
  }

  function reveal(user) {
    var meta = user.user_metadata || {};
    var full = (meta.full_name || "").trim();
    var first = full ? full.split(" ")[0] : "";
    var greetOut = document.getElementById("dash-greeting");
    if (greetOut) {
      greetOut.textContent = greetingFor(first);
    }
    document.body.classList.remove("dash-loading");
    if (checking) {
      checking.hidden = true;
    }
    main.hidden = false;

    var bookForm = document.getElementById("book-form");
    var bookNote = document.getElementById("book-note");
    if (bookForm) {
      bookForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var service = document.getElementById("book-service");
        var picked = service ? service.value : "a session";
        if (bookNote) {
          bookNote.textContent =
            "Request noted for " + picked + ". We will email " + user.email + " with times that fit your timetable.";
          bookNote.classList.add("shown");
        }
      });
    }
  }

  client.auth.getSession().then(function (result) {
    var session = result.data && result.data.session;
    if (!session) {
      window.location.replace("members.html#signin");
      return;
    }
    var role = (session.user.user_metadata || {}).role;
    if (role === "student") {
      // Students have their own space; the teacher dashboard is not it.
      window.location.replace("members.html");
      return;
    }
    reveal(session.user);
  });

  client.auth.onAuthStateChange(function (event, session) {
    if (!session) {
      window.location.replace("members.html#signin");
    }
  });

  var signOut = document.getElementById("dash-signout");
  if (signOut) {
    signOut.addEventListener("click", function () {
      signOut.disabled = true;
      client.auth.signOut().then(function () {
        window.location.replace("members.html");
      });
    });
  }
});
