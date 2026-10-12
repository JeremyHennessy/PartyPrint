import { createPack, configFromURL, shareURL, escapeHTML } from "./core.js";

import { getBingoPrompts } from "./content.js";

const $ = id => document.getElementById(id);
const form = $("party-form");
const stage = $("preview-stage");
const printRoot = $("print-root");
const message = $("form-message");
const tabs = Array.from(document.querySelectorAll("[data-preview]"));
const printButton = $("print-button");
let activeTab = "bingo";
let currentPack = null;
let seed = (() => {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }
  return Date.now();
})();

function readConfig() {
  return {
    occasion: $("occasion").value,
    bingoMode: $("bingo-mode").value,
    promptSource: $("prompt-source").value,
    title: $("party-title").value,
    count: $("guest-count").value,
    size: $("card-size").value,
    games: {
      bingo: $("game-bingo").checked,
      trivia: $("game-trivia").checked,
      scavenger: $("game-scavenger").checked
    },
    theme: document.querySelector('input[name="theme"]:checked')?.value || "peach",
    custom: $("custom-prompts").value,
    seed
  };
}

function themeStyle(pack) {
  const theme = pack.theme;
  return `--theme-ink:${theme.ink};--theme-swatch:${theme.swatch};--theme-tint:${theme.tint}`;
}

function sheetStart(pack, type, subtitle) {
  return `<div class="game-sheet" style="${themeStyle(pack)}">
    <div class="print-topline"><span>PARTYPRINT ORIGINALS · ${escapeHTML(pack.occasion.label)}</span><span class="sheet-art-star">✳</span></div>
    <h4>${escapeHTML(pack.config.title)}<br><em>${escapeHTML(type)}</em></h4>
    <p class="sheet-subtitle">${escapeHTML(subtitle)}</p>`;
}

function sheetEnd(text = "MADE FOR GOOD TIMES · PARTYPRINT") {
  return `<div class="print-footnote">${escapeHTML(text)}</div></div>`;
}

function bingoHTML(pack, card) {
  const board = card.rows.flat().map(cell => {
    const free = cell === "FREE SPACE";
    return `<div class="bingo-cell${free ? " free-cell" : ""}">${escapeHTML(cell)}</div>`;
  }).join("");
  return sheetStart(pack, "BINGO!", (pack.config.bingoMode === "gifts" ? "Mark each gift as it is opened · Card " : "Mark a square when you spot it · Card ") + card.number + " of " + pack.bingoCards.length) +
    `<div class="bingo-board" style="--side:${card.size}">${board}</div>` +
    sheetEnd("FIRST TO COMPLETE A ROW WINS · GOOD LUCK ♡");
}

function triviaHTML(pack, isPreview = false) {
  const questions = isPreview ? pack.trivia.slice(0, 6) : pack.trivia;
  return sheetStart(pack, "trivia time", "12 questions · One point per correct answer") +
    `<ol class="question-list">${questions.map(q => `<li>${escapeHTML(q.question)}</li>`).join("")}</ol>` +
    (isPreview ? `<p class="print-footnote">+ 6 more questions in your printed pack</p>` : "") +
    sheetEnd("ANSWERS INCLUDED ON A SEPARATE HOST SHEET");
}

function answersHTML(pack) {
  return sheetStart(pack, "answer key", "For the host · Keep this page to yourself") +
    `<ol class="question-list answer-list">${pack.trivia.map(q =>
      `<li>${escapeHTML(q.question)}<br><strong>${escapeHTML(q.answer)}</strong></li>`
    ).join("")}</ol>` + sheetEnd("A LITTLE KNOWLEDGE GOES A LONG WAY ✳");
}

function scavengerHTML(pack, isPreview = false) {
  const items = isPreview ? pack.scavenger.slice(0, 8) : pack.scavenger;
  return sheetStart(pack, "find & seek", "Spot each item · Tick it off · Have fun!") +
    `<ul class="scavenger-list">${items.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` +
    (isPreview ? `<p class="print-footnote">+ 4 more finds on your printed page</p>` : "") +
    sheetEnd("PLAY AT YOUR OWN PACE · EVERY FIND IS A WIN");
}

function printPages(pack) {
  const pages = [];
  for (const card of pack.bingoCards) {
    pages.push(`<article class="print-page">${bingoHTML(pack, card)}
      <p class="print-how-to"><strong>HOW TO PLAY</strong> · ${pack.config.bingoMode === "gifts" ? "Mark a gift when it is opened." : "Cross off a moment when it happens."} First to finish a row, column or diagonal calls “Bingo!”</p></article>`);
  }
  if (pack.trivia.length) {
    pages.push(`<article class="print-page">${triviaHTML(pack)}
      <p class="print-how-to">Host reads each question. Players write their answers on the back or on separate paper.</p></article>`);
    pages.push(`<article class="print-page">${answersHTML(pack)}
      <p class="print-how-to">HOST COPY · Do not hand out until the round is complete.</p></article>`);
  }
  if (pack.scavenger.length) {
    pages.push(`<article class="print-page">${scavengerHTML(pack)}
      <p class="print-how-to">Check off each thing you find. Set a timer or play throughout the event.</p></article>`);
  }
  return pages.join("");
}

function displayError(text) {
  currentPack = null;
  printRoot.innerHTML = "";
  message.textContent = text;
  stage.textContent = text;
  printButton.disabled = true;
  $("pack-summary").textContent = "Choose your games";
  $("page-summary").textContent = "Your pack will appear here";
}

function render() {
  $("bingo-mode-field").hidden = $("occasion").value !== "baby" || !$("game-bingo").checked;
  $("bingo-mode-help").textContent = $("bingo-mode").value === "gifts" ? "Mark gifts as the guest of honor opens them." : "Mark things guests say or do during the celebration.";
  try {
    const pack = createPack(readConfig());
    currentPack = pack;
    message.textContent = "";
    printButton.disabled = false;
    const activeGames = {
      bingo: pack.bingoCards.length > 0,
      trivia: pack.trivia.length > 0,
      scavenger: pack.scavenger.length > 0
    };
    if (!activeGames[activeTab]) activeTab = Object.keys(activeGames).find(key => activeGames[key]);

    for (const tab of tabs) {
      const type = tab.dataset.preview;
      tab.disabled = !activeGames[type];
      tab.setAttribute("aria-selected", type === activeTab ? "true" : "false");
      tab.tabIndex = type === activeTab ? 0 : -1;
    }
    stage.setAttribute("aria-labelledby", "tab-" + activeTab);
    if (activeTab === "bingo") stage.innerHTML = bingoHTML(pack, pack.bingoCards[0]);
    else if (activeTab === "trivia") stage.innerHTML = triviaHTML(pack, true);
    else stage.innerHTML = scavengerHTML(pack, true);
    const extras = [pack.trivia.length && "trivia", pack.scavenger.length && "scavenger hunt"].filter(Boolean);
    const parts = [
      pack.bingoCards.length ? pack.bingoCards.length + " bingo card" + (pack.bingoCards.length === 1 ? "" : "s") : "",
      ...extras
    ].filter(Boolean);
    $("pack-summary").textContent = parts.join(" + ");
    $("page-summary").textContent = pack.pageCount + " printable page" + (pack.pageCount === 1 ? "" : "s") + " · " + pack.theme.label + " design";
  } catch (error) {
    displayError(error.message || "Please check your party settings.");
  }
}

function preparePrint() {
  if (!currentPack) return false;
  printRoot.innerHTML = printPages(currentPack);
  return true;
}

function restoreFromURL() {
  if (!window.location.search) return;
  const config = configFromURL(window.location.search);
  $("occasion").value = config.occasion;
  $("bingo-mode").value = config.bingoMode;
  $("guest-count").value = config.count;
  $("card-size").value = config.size;
  $("game-bingo").checked = config.games.bingo;
  $("game-trivia").checked = config.games.trivia;
  $("game-scavenger").checked = config.games.scavenger;
  const selected = document.querySelector('input[name="theme"][value="' + config.theme + '"]');
  if (selected) selected.checked = true;
}

$("edit-word-list").addEventListener("click", () => {
  $("custom-prompts").value = getBingoPrompts($("occasion").value, $("bingo-mode").value).join("\n");
  $("prompt-source").value = "replace";
  render();
  $("custom-prompts").focus();
});

restoreFromURL();
$("year").textContent = String(new Date().getFullYear());
form.addEventListener("input", render);
form.addEventListener("change", render);

for (const button of document.querySelectorAll("[data-occasion]")) {
  button.addEventListener("click", () => {
    $("occasion").value = button.dataset.occasion;
    $("party-title").value = "";
    render();
    $("studio").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    $("occasion").focus({ preventScroll: true });
  });
}

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    if (tab.disabled) return;
    activeTab = tab.dataset.preview;
    render();
  });
  tab.addEventListener("keydown", event => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const available = tabs.filter(item => !item.disabled);
    const index = available.indexOf(tab);
    if (index === -1) return;
    event.preventDefault();
    const next = available[(index + (event.key === "ArrowRight" ? 1 : -1) + available.length) % available.length];
    activeTab = next.dataset.preview;
    render();
    next.focus();
  });
}

$("shuffle-button").addEventListener("click", () => {
  seed = (seed + 1) >>> 0;
  render();
  $("shuffle-button").textContent = "✓ New mix ready";
  window.setTimeout(() => { $("shuffle-button").textContent = "↻ Mix it up"; }, 1900);
});

printButton.addEventListener("click", () => {
  if (!preparePrint()) return;
  window.print();
});

window.addEventListener("beforeprint", preparePrint);

$("share-button").addEventListener("click", async () => {
  const link = shareURL(window.location.href, readConfig());
  const button = $("share-button");
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(link);
    button.textContent = "✓ Link copied (no personal details)";
  } catch {
    window.prompt("Copy your setup link (names and custom prompts aren't included):", link);
    button.textContent = "↗ Share this setup";
    return;
  }
  window.setTimeout(() => { button.textContent = "↗ Share this setup"; }, 2800);
});

render();
