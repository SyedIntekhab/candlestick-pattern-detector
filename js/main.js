/* EdCircles — pie gate zoom transition */

document.addEventListener("DOMContentLoaded", function () {
  var pieWrap = document.querySelector(".pie-wrap");
  var wedges = document.querySelectorAll(".wedge");
  var panels = document.querySelectorAll(".role-panel");

  if (!pieWrap || !wedges.length || !panels.length) {
    return;
  }

  function openPanel(panel, originX, originY) {
    panel.style.transformOrigin = originX + "px " + originY + "px";
    pieWrap.classList.add("pie-hidden");
    document.body.style.overflow = "hidden";
    // force reflow so the transform-origin change takes effect before animating
    void panel.offsetWidth;
    panel.classList.add("panel-open");
  }

  function closePanel(panel) {
    panel.classList.remove("panel-open");
    pieWrap.classList.remove("pie-hidden");
    document.body.style.overflow = "";
  }

  wedges.forEach(function (wedge) {
    wedge.addEventListener("click", function (event) {
      var targetId = wedge.getAttribute("data-panel");
      var panel = document.getElementById(targetId);
      if (!panel) {
        return;
      }
      var rect = wedge.getBoundingClientRect();
      var originX = event.clientX || rect.left + rect.width / 2;
      var originY = event.clientY || rect.top + rect.height / 2;
      openPanel(panel, originX, originY);
    });
  });

  panels.forEach(function (panel) {
    var backButton = panel.querySelector(".back-home");
    if (backButton) {
      backButton.addEventListener("click", function () {
        closePanel(panel);
      });
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      panels.forEach(function (panel) {
        if (panel.classList.contains("panel-open")) {
          closePanel(panel);
        }
      });
    }
  });
});
