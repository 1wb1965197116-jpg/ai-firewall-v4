(function () {
  'use strict';

  function clean(str) {
    return (str || "")
      .normalize("NFKC")
      .replace(/\uFEFF/g, "")
      .replace(/[\u200B-\u200D\u2060]/g, "")
      .trim();
  }

  function riskScore(text) {
    let score = 0;

    if (/\u200B|\u200C|\u200D/.test(text)) score += 40;
    if (text.length > 2000) score += 20;
    if (/[<>]/.test(text)) score += 10;
    if (/(sk-|api|token|secret)/i.test(text)) score += 30;

    return score;
  }

  /* =========================
     POPUP UI
  ========================= */
  function showPopup(message, color = "#111") {
    let old = document.getElementById("ai-popup");
    if (old) old.remove();

    let box = document.createElement("div");
    box.id = "ai-popup";

    box.style.position = "fixed";
    box.style.bottom = "20px";
    box.style.right = "20px";
    box.style.zIndex = "999999";
    box.style.background = color;
    box.style.color = "white";
    box.style.padding = "15px";
    box.style.borderRadius = "10px";
    box.style.fontSize = "14px";
    box.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    box.innerText = message;

    document.body.appendChild(box);

    setTimeout(() => box.remove(), 4000);
  }

  /* =========================
     PASTE LISTENER
  ========================= */
  document.addEventListener("paste", async function (e) {
    let raw = (e.clipboardData || window.clipboardData).getData("text");
    let cleaned = clean(raw);
    let risk = riskScore(raw);

    let status = "ALLOW";
    let color = "#2ecc71";

    if (risk > 30) {
      status = "REVIEW";
      color = "#f39c12";
    }

    if (risk > 60) {
      status = "BLOCKED";
      color = "#e74c3c";
      e.preventDefault();
    }

    // SHOW POPUP
    showPopup(
      `AI Firewall: ${status}\nRisk Score: ${risk}`,
      color
    );

    // SEND TO BACKEND (optional)
    await fetch("https://YOUR-BACKEND.com/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw,
        cleaned,
        risk,
        status,
        url: location.href,
        time: Date.now()
      })
    });
  });

})();
