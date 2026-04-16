// ==UserScript==
// @name         AI Firewall v6
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  AI Paste Firewall
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // 🔐 PUT YOUR REAL TOKEN HERE
  let USER_TOKEN = "PASTE_YOUR_REAL_TOKEN_HERE";

  function clean(str) {
    return (str || "")
      .normalize("NFKC")
      .replace(/\uFEFF/g, "")
      .replace(/[\u200B-\u200D\u2060]/g, "")
      .trim();
  }

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

    box.innerText = message;

    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4000);
  }

  document.addEventListener("paste", async function (e) {
    let raw = (e.clipboardData || window.clipboardData).getData("text");
    let cleaned = clean(raw);

    let risk = 0;
    if (raw !== cleaned) risk += 40;
    if (/(sk-|api|token|secret)/i.test(raw)) risk += 30;

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

    showPopup(`AI Firewall: ${status}\nRisk: ${risk}`, color);

    // ✅ FIXED FETCH
    await fetch("https://ai-firewall-v4.onrender.com/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: USER_TOKEN,
        raw,
        clean: cleaned,
        url: location.href
      })
    });
  });

})();
