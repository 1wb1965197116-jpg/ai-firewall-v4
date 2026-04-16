// ==UserScript==
// @name         AI Firewall v6 Auto Login
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  AI Firewall with Auto Login
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const API = "https://ai-firewall-v4.onrender.com";

  let USER_TOKEN = localStorage.getItem("ai_firewall_token");

  /* =========================
     AUTO LOGIN
  ========================= */
  async function login() {
    let username = prompt("AI Firewall Username:");
    let password = prompt("AI Firewall Password:");

    const res = await fetch(API + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("ai_firewall_token", data.token);
      USER_TOKEN = data.token;
      alert("Logged in ✔");
    } else {
      alert("Login failed");
    }
  }

  /* =========================
     CHECK TOKEN ON LOAD
  ========================= */
  if (!USER_TOKEN) {
    login();
  }

  /* =========================
     CLEAN FUNCTION
  ========================= */
  function clean(str) {
    return (str || "")
      .normalize("NFKC")
      .replace(/\uFEFF/g, "")
      .replace(/[\u200B-\u200D\u2060]/g, "")
      .trim();
  }

  /* =========================
     POPUP
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

    box.innerText = message;

    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4000);
  }

  /* =========================
     PASTE EVENT
  ========================= */
  document.addEventListener("paste", async function (e) {

    if (!USER_TOKEN) {
      showPopup("Not logged in", "#e74c3c");
      return;
    }

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

    await fetch(API + "/event", {
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
