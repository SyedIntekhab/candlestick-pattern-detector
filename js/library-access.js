/* Library access tiers.
   Loaded only on library.html. Free resources are open to everyone. Member
   resources stay locked until Supabase confirms a signed-in account, at
   which point the page unlocks them in place rather than sending anyone
   away. Locking here is a convenience, not a security boundary: real files
   must be served from storage that checks the member's token, otherwise a
   determined visitor could read them straight from the network tab. */

document.addEventListener("DOMContentLoaded", function () {
  var grid = document.querySelector(".res-grid");
  if (!grid) {
    return;
  }

  /* Free resources work with no account and no JavaScript beyond this. */
  function wireOpen(card) {
    var link = card.querySelector(".res-open");
    var note = card.querySelector(".res-note");
    if (!link || link.dataset.wired) {
      return;
    }
    link.dataset.wired = "1";
    link.addEventListener("click", function (event) {
      // PLACEHOLDER: no files are uploaded yet, so opening explains itself
      // instead of leading to a dead link.
      event.preventDefault();
      if (note) {
        note.hidden = false;
      }
    });
  }
  document.querySelectorAll('.res-card[data-access="free"]').forEach(wireOpen);

  function unlock() {
    document.body.classList.add("library-unlocked");
    document.querySelectorAll('.res-card[data-access="member"]').forEach(function (card) {
      var badge = card.querySelector(".res-badge");
      var link = card.querySelector(".res-open");
      if (badge) {
        badge.textContent = "Unlocked";
      }
      if (link) {
        link.textContent = "Open resource";
        link.setAttribute("href", "#resources");
      }
      wireOpen(card);
    });
    var foot = document.getElementById("res-foot");
    if (foot) {
      var locked = foot.querySelector(".res-foot-locked");
      var open = foot.querySelector(".res-foot-open");
      if (locked) { locked.hidden = true; }
      if (open) { open.hidden = false; }
    }
  }

  if (typeof supabase === "undefined" || typeof SUPABASE_URL === "undefined") {
    return;
  }
  var client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  client.auth.getSession().then(function (result) {
    if (result.data && result.data.session) {
      unlock();
    }
  });
  client.auth.onAuthStateChange(function (event, session) {
    if (session) {
      unlock();
    }
  });
});
