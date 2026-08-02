/* EdCircles admin view: demo requests, CPD registrations, CPD feedback.
   Loaded on admin.html only, after js/vendor/supabase.js and
   js/supabase-config.js.

   On what actually protects this page: not this file. Hiding the panel until
   somebody signs in is a convenience, and any visitor can edit that away in
   devtools. What stops them reading the data is Row Level Security in
   Postgres: the select policies on all three tables require the caller's JWT
   to carry role "admin", so an anonymous request, or a signed-in member who
   is not an admin, gets an empty result no matter what the page displays.
   See supabase/migrations/001_forms.sql. Never move that check into here. */

document.addEventListener("DOMContentLoaded", function () {
  var gate = document.getElementById("admin-gate");
  var panel = document.getElementById("admin-panel");
  if (!gate || !panel) {
    return;
  }

  var loginForm = document.getElementById("admin-login-form");
  var loginNote = loginForm.querySelector(".form-note");
  var errorBox = document.getElementById("admin-error");

  if (typeof supabase === "undefined" || typeof SUPABASE_URL === "undefined") {
    loginNote.textContent = "Could not load the sign-in library. Check your connection and reload.";
    loginNote.classList.add("shown", "error");
    return;
  }
  var client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  /* ---- Small helpers ---- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function when(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) +
      ", " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  var CIRCLE_LABELS = {
    staffroom: "Teacher Training",
    classroom: "Student Support",
    library: "Whole-School Training",
  };

  /* ---- Tabs ---- */

  document.querySelectorAll(".admin-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var name = tab.getAttribute("data-tab");
      document.querySelectorAll(".admin-tab").forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll(".admin-view").forEach(function (view) {
        view.hidden = view.getAttribute("data-view") !== name;
      });
    });
  });

  /* ---- Rendering ---- */

  var QUESTIONS = [
    { key: "rating_overall", label: "Overall rating" },
    { key: "rating_relevance", label: "Relevant to classroom practice" },
    { key: "rating_recommend", label: "Would recommend to a colleague" },
    { key: "rating_pace", label: "Pace of the session" },
  ];

  function renderFeedback(rows) {
    setCount("feedback", rows.length);
    toggleEmpty("feedback", rows.length === 0);
    if (!rows.length) {
      return;
    }

    var charts = document.getElementById("feedback-charts");
    charts.textContent = "";

    QUESTIONS.forEach(function (question) {
      var counts = [0, 0, 0, 0, 0];
      var total = 0;
      var sum = 0;
      rows.forEach(function (row) {
        var value = row[question.key];
        if (value >= 1 && value <= 5) {
          counts[value - 1]++;
          total++;
          sum += value;
        }
      });
      /* Scale every bar against the most common answer rather than against
         the response count, so the shape of the distribution stays readable
         when most people picked the same number. */
      var peak = Math.max.apply(null, counts) || 1;

      var card = el("div", "chart-card");
      var head = el("div", "chart-head");
      head.appendChild(el("h3", null, question.label));
      var avg = total ? (sum / total).toFixed(1) : "0.0";
      var mean = el("span", "chart-avg");
      mean.appendChild(el("strong", null, avg));
      mean.appendChild(el("span", null, " / 5"));
      head.appendChild(mean);
      card.appendChild(head);

      var bars = el("div", "bars");
      counts.forEach(function (count, i) {
        var row = el("div", "bar-row");
        row.appendChild(el("span", "bar-key", String(i + 1)));
        var track = el("div", "bar-track");
        var fill = el("div", "bar-fill r" + (i + 1));
        fill.style.width = (count / peak * 100) + "%";
        track.appendChild(fill);
        row.appendChild(track);
        row.appendChild(el("span", "bar-count", String(count)));
        bars.appendChild(row);
      });
      card.appendChild(bars);
      card.appendChild(el("p", "chart-foot", total + (total === 1 ? " response" : " responses")));
      charts.appendChild(card);
    });

    stickyNotes("notes-www", rows, "went_well", "www");
    stickyNotes("notes-ebi", rows, "even_better_if", "ebi");
  }

  function stickyNotes(targetId, rows, field, kind) {
    var wall = document.getElementById(targetId);
    wall.textContent = "";
    var written = rows.filter(function (row) {
      return row[field] && String(row[field]).trim();
    });
    if (!written.length) {
      wall.appendChild(el("p", "notes-none", "Nothing written here yet."));
      return;
    }
    written.forEach(function (row, i) {
      var note = el("div", "sticky sticky-" + kind);
      /* A wall of perfectly aligned rectangles reads as a table, not as
         notes. A small deterministic tilt per position keeps the pinboard
         feel without the jitter of a random angle on every re-render. */
      note.style.setProperty("--tilt", (((i % 4) - 1.5) * 0.9).toFixed(2) + "deg");
      note.appendChild(el("p", null, String(row[field]).trim()));
      note.appendChild(el("span", "sticky-date", when(row.created_at)));
      wall.appendChild(note);
    });
  }

  function renderRegistrations(rows) {
    setCount("registrations", rows.length);
    toggleEmpty("registrations", rows.length === 0);
    var body = document.getElementById("registrations-body");
    body.textContent = "";
    rows.forEach(function (row) {
      var tr = el("tr");
      tr.appendChild(el("td", null, row.full_name));
      tr.appendChild(mailCell(row.email));
      tr.appendChild(waCell(row.whatsapp));
      tr.appendChild(el("td", "col-when", when(row.created_at)));
      body.appendChild(tr);
    });
  }

  function renderDemos(rows) {
    setCount("demos", rows.length);
    toggleEmpty("demos", rows.length === 0);
    var body = document.getElementById("demos-body");
    body.textContent = "";
    rows.forEach(function (row) {
      var tr = el("tr");
      tr.appendChild(el("td", null, row.full_name));
      tr.appendChild(mailCell(row.email));
      tr.appendChild(waCell(row.phone));
      var tag = el("td");
      tag.appendChild(el("span", "pill pill-" + row.interest, CIRCLE_LABELS[row.interest] || row.interest));
      tr.appendChild(tag);
      tr.appendChild(el("td", "col-when", when(row.created_at)));
      body.appendChild(tr);
    });
  }

  function mailCell(address) {
    var td = el("td");
    var link = el("a", null, address);
    link.href = "mailto:" + address;
    td.appendChild(link);
    return td;
  }

  /* WhatsApp only accepts digits in a wa.me link, so strip everything else
     off the number the visitor typed rather than building a dead link. */
  function waCell(number) {
    var td = el("td");
    var digits = String(number).replace(/\D/g, "");
    var link = el("a", null, number);
    link.href = "https://wa.me/" + digits;
    link.target = "_blank";
    link.rel = "noopener";
    td.appendChild(link);
    return td;
  }

  function setCount(name, n) {
    var badge = document.querySelector('[data-count="' + name + '"]');
    if (badge) badge.textContent = String(n);
  }

  function toggleEmpty(name, isEmpty) {
    var empty = document.querySelector('[data-empty="' + name + '"]');
    var has = document.querySelector('[data-has="' + name + '"]');
    if (empty) empty.hidden = !isEmpty;
    if (has) has.hidden = isEmpty;
  }

  /* ---- Loading ---- */

  function load() {
    errorBox.hidden = true;
    return Promise.all([
      client.from("cpd_feedback").select("*").order("created_at", { ascending: false }),
      client.from("cpd_registrations").select("*").order("created_at", { ascending: false }),
      client.from("demo_requests").select("*").order("created_at", { ascending: false }),
    ]).then(function (results) {
      var failed = results.filter(function (r) { return r.error; });
      if (failed.length) {
        errorBox.textContent = "Could not load everything: " + failed[0].error.message +
          " (if this says the table does not exist, run supabase/migrations/001_forms.sql first)";
        errorBox.hidden = false;
      }
      renderFeedback(results[0].data || []);
      renderRegistrations(results[1].data || []);
      renderDemos(results[2].data || []);
    });
  }

  /* ---- Session ---- */

  function isAdmin(user) {
    var meta = (user && user.user_metadata) || {};
    return meta.role === "admin";
  }

  function show(session) {
    if (session && isAdmin(session.user)) {
      gate.hidden = true;
      panel.hidden = false;
      load();
      return;
    }
    /* Signed in but not an admin is a different problem from signed out, and
       saying so saves somebody wondering why their working password does
       nothing. The database would refuse them either way. */
    if (session) {
      loginNote.textContent = "That account is not an admin, so it cannot open this page.";
      loginNote.classList.add("shown", "error");
      client.auth.signOut();
    }
    gate.hidden = false;
    panel.hidden = true;
  }

  client.auth.getSession().then(function (result) {
    show(result.data && result.data.session);
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }
    var btn = loginForm.querySelector('button[type="submit"]');
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Signing in...";
    loginNote.classList.remove("shown", "error");

    client.auth
      .signInWithPassword({
        email: loginForm.querySelector("#a-email").value,
        password: loginForm.querySelector("#a-pass").value,
      })
      .then(function (result) {
        btn.disabled = false;
        btn.textContent = label;
        if (result.error) {
          loginNote.textContent = result.error.message;
          loginNote.classList.add("shown", "error");
          return;
        }
        loginForm.reset();
        show(result.data.session);
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = label;
        loginNote.textContent = "Could not reach the server. Check your connection and try again.";
        loginNote.classList.add("shown", "error");
      });
  });

  document.getElementById("admin-refresh").addEventListener("click", load);
  document.getElementById("admin-signout").addEventListener("click", function () {
    client.auth.signOut().then(function () {
      panel.hidden = true;
      gate.hidden = false;
    });
  });
});
