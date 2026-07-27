/* EdCircles Wellness Corner.
   A private pause between classes. Everything a teacher does here stays in
   this browser: check-ins, reflections and insights are written to
   localStorage and never sent anywhere. No account data is written, and
   nothing here is visible to a school. */

document.addEventListener("DOMContentLoaded", function () {
  var main = document.getElementById("w-main");
  if (!main) {
    return;
  }
  var checking = document.getElementById("dash-checking");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------- local store ----------------------------- */

  var KEY = "ec.wellness";
  function load() {
    try {
      return JSON.parse(window.localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function save(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* Private mode or a full quota. The corner still works, it just
         will not remember between visits. */
    }
  }
  var store = load();
  store.visits = store.visits || [];
  store.moods = store.moods || {};
  store.resets = store.resets || {};
  store.checkins = store.checkins || 0;

  // Record this visit, keeping only a short recent history.
  store.visits.push(new Date().toISOString());
  if (store.visits.length > 60) {
    store.visits = store.visits.slice(-60);
  }
  save(store);

  /* ------------------------------- greeting ------------------------------ */

  function greetingFor(name) {
    var h = new Date().getHours();
    var part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    return name ? part + ", " + name + "." : part + ".";
  }

  /* -------------------------------- plant -------------------------------- */

  var STAGES = 6;
  function renderPlant() {
    var g = document.getElementById("plant-growth");
    var caption = document.getElementById("plant-caption");
    if (!g) {
      return;
    }
    var stage = Math.min(STAGES - 1, Math.floor(store.checkins / 2));
    // Even a brand new plant is a real little plant: two leaves, never a bare stick.
    var leafCount = stage + 2;
    var height = 36 + stage * 12;
    var topY = 104 - height;

    var parts = [
      '<path class="stem" d="M60 104 C 56 ' + (104 - height * 0.45) +
      ' 64 ' + (104 - height * 0.7) + ' 60 ' + topY + '"/>',
    ];

    for (var i = 0; i < leafCount; i++) {
      var t = (i + 1) / (leafCount + 1);      // how far up the stem
      var y = 104 - height * t;
      var side = i % 2 === 0 ? 1 : -1;
      var len = 22 - t * 7;                    // leaves shorten towards the top
      var tipX = 60 + side * len;
      var tipY = y - 10;
      parts.push(
        '<path class="leaf" style="--d:' + (i * 0.1).toFixed(2) + 's" d="M60 ' + y.toFixed(1) +
        ' Q ' + (60 + side * len * 0.45).toFixed(1) + ' ' + (y - 15).toFixed(1) +
        ' ' + tipX.toFixed(1) + ' ' + tipY.toFixed(1) +
        ' Q ' + (60 + side * len * 0.55).toFixed(1) + ' ' + (y + 3).toFixed(1) +
        ' 60 ' + y.toFixed(1) + '"/>'
      );
    }
    if (stage >= STAGES - 1) {
      parts.push('<circle class="bud" cx="60" cy="' + (topY - 5) + '" r="5.5"/>');
    }
    g.innerHTML = parts.join("");

    if (caption) {
      caption.textContent = store.checkins === 0
        ? "Your plant grows a little each time you check in."
        : stage >= STAGES - 1
          ? "Fully grown, and it stays that way."
          : "Growing quietly. Nothing is lost if you skip a day.";
    }
  }

  /* ------------------------------ check in ------------------------------- */

  var ackText = {
    energised: "Good to hear. Enjoy the rest of it.",
    okay: "Okay is a perfectly good place to be.",
    tired: "That is worth acknowledging. Be gentle with the next hour.",
    "break": "Then take one. Even a minute counts.",
  };

  document.querySelectorAll(".mood").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mood = btn.getAttribute("data-mood");
      document.querySelectorAll(".mood").forEach(function (b) {
        b.classList.toggle("chosen", b === btn);
      });
      store.moods[mood] = (store.moods[mood] || 0) + 1;
      store.checkins += 1;
      save(store);
      var ack = document.getElementById("mood-ack");
      if (ack) {
        ack.textContent = ackText[mood] || "";
      }
      renderPlant();
      renderInsights();
    });
  });

  /* ------------------------------- journal ------------------------------- */

  var PROMPTS = [
    "What helped today feel easier?",
    "What do you want to leave behind here?",
    "Who made your day a little lighter?",
    "What went better than you expected?",
    "What is one thing you handled well today?",
    "What can wait until tomorrow?",
  ];
  var promptEl = document.getElementById("journal-prompt");
  var promptIndex = 0;
  if (promptEl) {
    promptIndex = new Date().getDate() % PROMPTS.length;
    promptEl.textContent = PROMPTS[promptIndex];
  }
  var newPrompt = document.getElementById("new-prompt");
  if (newPrompt && promptEl) {
    newPrompt.addEventListener("click", function () {
      promptIndex = (promptIndex + 1) % PROMPTS.length;
      promptEl.textContent = PROMPTS[promptIndex];
    });
  }

  var journal = document.getElementById("journal");
  var journalSaved = document.getElementById("journal-saved");
  if (journal) {
    journal.value = store.journal || "";
    var jTimer = null;
    journal.addEventListener("input", function () {
      window.clearTimeout(jTimer);
      jTimer = window.setTimeout(function () {
        store.journal = journal.value;
        save(store);
        if (journalSaved) {
          journalSaved.textContent = "Saved on this device";
          window.setTimeout(function () { journalSaved.textContent = ""; }, 1800);
        }
      }, 500);
    });
  }

  /* ---------------------------- quick resets ----------------------------- */

  var RESETS = {
    breathe1: { title: "Breathe", secs: 60, kind: "breath" },
    shoulders: { title: "Relax shoulders", secs: 60, kind: "steps", steps: ["Let your shoulders drop", "Roll them back, slowly", "Unclench your jaw", "Rest your hands, palms down"] },
    water: { title: "Drink water", secs: 60, kind: "steps", steps: ["Fetch a glass", "Drink it slowly", "Notice that it is cold", "Put the glass down"] },
    breathe3: { title: "Guided breathing", secs: 180, kind: "breath" },
    stretch: { title: "Stretch", secs: 180, kind: "steps", steps: ["Tilt your head right, then left", "Reach both arms overhead", "Twist gently to each side", "Roll your wrists", "Shake your hands out"] },
    grounding: { title: "Grounding", secs: 180, kind: "steps", steps: ["Five things you can see", "Four things you can feel", "Three things you can hear", "Two things you can smell", "One slow breath"] },
    reflect: { title: "Short reflection", secs: 300, kind: "steps", steps: ["What went better than expected?", "What would you leave behind here?", "What is one small thing for tomorrow?", "Nothing needs an answer"] },
    calm: { title: "Calm reset", secs: 300, kind: "breath" },
  };

  var overlay = document.getElementById("reset-overlay");
  var overlayTitle = document.getElementById("reset-title");
  var overlayCue = document.getElementById("reset-cue");
  var overlayTimer = document.getElementById("reset-timer");
  var overlayOrb = document.getElementById("reset-orb");
  var overlayDone = document.getElementById("reset-done");
  var tickTimer = null;
  var cueTimer = null;
  var lastTrigger = null;

  function fmt(s) {
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" + r : r);
  }

  function closeReset() {
    window.clearInterval(tickTimer);
    window.clearInterval(cueTimer);
    overlay.hidden = true;
    if (overlayOrb) {
      overlayOrb.classList.remove("breathing");
    }
    document.body.classList.remove("no-scroll");
    if (lastTrigger) {
      lastTrigger.focus();
    }
  }

  function openReset(id, trigger) {
    var spec = RESETS[id];
    if (!spec) {
      return;
    }
    lastTrigger = trigger || null;
    store.resets[id] = (store.resets[id] || 0) + 1;
    save(store);
    renderInsights();

    overlayTitle.textContent = spec.title;
    overlay.hidden = false;
    document.body.classList.add("no-scroll");
    overlayDone.focus();

    var left = spec.secs;
    overlayTimer.textContent = fmt(left);

    window.clearInterval(tickTimer);
    tickTimer = window.setInterval(function () {
      left -= 1;
      overlayTimer.textContent = fmt(Math.max(0, left));
      if (left <= 0) {
        window.clearInterval(tickTimer);
        window.clearInterval(cueTimer);
        overlayCue.textContent = "That is the minute. Go gently.";
        if (overlayOrb) {
          overlayOrb.classList.remove("breathing");
        }
      }
    }, 1000);

    window.clearInterval(cueTimer);
    if (spec.kind === "breath") {
      var phases = ["Breathe in", "Hold", "Breathe out"];
      var durations = [4000, 1000, 6000];
      var p = 0;
      overlayCue.textContent = phases[0];
      if (overlayOrb && !reduceMotion) {
        overlayOrb.classList.add("breathing");
      }
      var step = function () {
        p = (p + 1) % phases.length;
        overlayCue.textContent = phases[p];
        cueTimer = window.setTimeout(step, durations[p]);
      };
      cueTimer = window.setTimeout(step, durations[0]);
    } else {
      var i = 0;
      overlayCue.textContent = spec.steps[0];
      var per = Math.max(8000, Math.floor((spec.secs * 1000) / spec.steps.length));
      cueTimer = window.setInterval(function () {
        i += 1;
        if (i < spec.steps.length) {
          overlayCue.textContent = spec.steps[i];
        }
      }, per);
    }
  }

  document.querySelectorAll("[data-reset]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openReset(btn.getAttribute("data-reset"), btn);
    });
  });
  if (overlayDone) {
    overlayDone.addEventListener("click", closeReset);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay && !overlay.hidden) {
      closeReset();
    }
  });
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        closeReset();
      }
    });
  }

  /* ---------------------------- ambient sound ---------------------------- */
  /* Synthesised with the Web Audio API rather than loaded from files: no
     downloads, works offline, and nothing autoplays. Sound only ever starts
     from a click. */

  var audioCtx = null;
  var soundNodes = null;
  var currentSound = null;
  var volInput = document.getElementById("sound-vol");
  var stopBtn = document.getElementById("sound-stop");

  function noiseBuffer(ctx, brown) {
    var len = ctx.sampleRate * 3;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        data[i] = white;
      }
    }
    return buf;
  }

  var SOUNDS = {
    rain: { brown: false, type: "bandpass", freq: 1400, q: 0.6, gain: 0.5 },
    library: { brown: true, type: "lowpass", freq: 380, q: 0.7, gain: 0.9 },
    nature: { brown: true, type: "lowpass", freq: 900, q: 0.5, gain: 0.7, sway: true },
    cafe: { brown: true, type: "lowpass", freq: 1100, q: 0.8, gain: 0.8 },
  };

  function stopSound() {
    if (soundNodes) {
      try { soundNodes.src.stop(); } catch (e) {}
      soundNodes = null;
    }
    currentSound = null;
    document.querySelectorAll(".sound-opt").forEach(function (b) {
      b.classList.remove("playing");
      b.setAttribute("aria-pressed", "false");
    });
    if (stopBtn) {
      stopBtn.hidden = true;
    }
  }

  function playSound(id, btn) {
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        return;
      }
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    stopSound();

    var spec = SOUNDS[id];
    var src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer(audioCtx, spec.brown);
    src.loop = true;

    var filter = audioCtx.createBiquadFilter();
    filter.type = spec.type;
    filter.frequency.value = spec.freq;
    filter.Q.value = spec.q;

    var gain = audioCtx.createGain();
    var vol = volInput ? Number(volInput.value) / 100 : 0.45;
    gain.gain.value = 0;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    src.start();

    // Ease in so it never startles.
    gain.gain.linearRampToValueAtTime(vol * spec.gain, audioCtx.currentTime + 1.2);

    var lfo = null;
    if (spec.sway) {
      lfo = audioCtx.createOscillator();
      var lfoGain = audioCtx.createGain();
      lfo.frequency.value = 0.06;
      lfoGain.gain.value = 260;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
    }

    soundNodes = { src: src, gain: gain, base: spec.gain, lfo: lfo };
    currentSound = id;
    if (btn) {
      btn.classList.add("playing");
      btn.setAttribute("aria-pressed", "true");
    }
    if (stopBtn) {
      stopBtn.hidden = false;
    }
  }

  document.querySelectorAll(".sound-opt").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-sound");
      if (currentSound === id) {
        stopSound();
      } else {
        playSound(id, btn);
      }
    });
  });
  if (stopBtn) {
    stopBtn.addEventListener("click", stopSound);
  }
  if (volInput) {
    volInput.addEventListener("input", function () {
      if (soundNodes) {
        soundNodes.gain.gain.value = (Number(volInput.value) / 100) * soundNodes.base;
      }
    });
  }

  /* ------------------------------ insights ------------------------------- */
  /* Drawn only from what this browser has stored. Observations, never
     scores, and phrased so nothing reads as a judgement. */

  function renderInsights() {
    var list = document.getElementById("insight-list");
    if (!list) {
      return;
    }
    var out = [];

    if (store.visits.length >= 3) {
      var buckets = { morning: 0, "after lunch": 0, evening: 0 };
      store.visits.forEach(function (iso) {
        var h = new Date(iso).getHours();
        if (h < 12) { buckets.morning += 1; }
        else if (h < 17) { buckets["after lunch"] += 1; }
        else { buckets.evening += 1; }
      });
      var top = Object.keys(buckets).sort(function (a, b) { return buckets[b] - buckets[a]; })[0];
      if (buckets[top] > 0) {
        out.push("You often stop by in the " + (top === "after lunch" ? "afternoon, after lunch" : top) + ".");
      }
    }

    var resetKeys = Object.keys(store.resets);
    if (resetKeys.length) {
      var topReset = resetKeys.sort(function (a, b) { return store.resets[b] - store.resets[a]; })[0];
      var name = (RESETS[topReset] || {}).title || topReset;
      out.push("You reach for " + name + " more often than anything else here.");
    }

    if (store.checkins >= 2) {
      out.push("You have checked in " + store.checkins + " times. Your plant is keeping up.");
    }

    if (!out.length) {
      out.push("Nothing noticed yet. A few visits from now, small patterns will show up here.");
    }

    list.innerHTML = out.map(function (line) { return "<li>" + line + "</li>"; }).join("");
  }

  /* ------------------------------- reveal -------------------------------- */

  function reveal(name) {
    var greet = document.getElementById("w-greeting");
    if (greet) {
      greet.textContent = greetingFor(name);
    }
    document.body.classList.remove("dash-loading");
    if (checking) {
      checking.hidden = true;
    }
    main.hidden = false;
    renderPlant();
    renderInsights();
  }

  if (typeof supabase === "undefined" || typeof SUPABASE_URL === "undefined") {
    window.location.replace("members.html#signin");
    return;
  }
  var client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  client.auth.getSession().then(function (result) {
    var session = result.data && result.data.session;
    if (!session) {
      window.location.replace("members.html#signin");
      return;
    }
    var meta = session.user.user_metadata || {};
    if (meta.role === "student") {
      window.location.replace("members.html");
      return;
    }
    var full = (meta.full_name || "").trim();
    reveal(full ? full.split(" ")[0] : "");
  });
});
