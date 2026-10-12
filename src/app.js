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
let printablePack = null;
let editorScrollY = 0;
let pdfBusy = false;
let readyPDF = null;
const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
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
    sheetEnd("FIRST COMPLETE LINE WINS · GOOD LUCK ♡");
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
  printablePack = null;
  message.textContent = text;
  stage.textContent = text;
  printButton.disabled = true;
  $("pdf-button").disabled = true;
  $("pack-summary").textContent = "Choose your games";
  $("page-summary").textContent = "Your pack will appear here";
}

function render() {
  clearPDF();
  $("bingo-mode-field").hidden = $("occasion").value !== "baby" || !$("game-bingo").checked;
  $("bingo-mode-help").textContent = $("bingo-mode").value === "gifts" ? "Mark gifts as the guest of honor opens them." : "Mark things guests say or do during the celebration.";
  try {
    const pack = createPack(readConfig());
    currentPack = pack;
    message.textContent = "";
    printButton.disabled = false;
    $("pdf-button").disabled = pdfBusy;
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
  if (printablePack !== currentPack) {
    printRoot.innerHTML = printPages(currentPack);
    printablePack = currentPack;
  }
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

function openPrintableView(pushHistory = true) {
  if (!preparePrint()) return false;
  if (!document.body.classList.contains("print-preview")) {
    editorScrollY = window.scrollY;
    if (pushHistory) history.pushState({ partyprintPrint: true }, "", "#printables");
  }
  document.body.classList.add("print-preview");
  $("print-toolbar").hidden = false;
  $("iphone-print-help").hidden = !isAppleMobile;
  $("print-ready-summary").textContent = $("pack-summary").textContent + " · " + currentPack.pageCount + " page" + (currentPack.pageCount === 1 ? "" : "s");
  printRoot.setAttribute("aria-hidden", "false");
  window.scrollTo(0, 0);
  $("print-ready-heading").focus({ preventScroll: true });
  return true;
}

function closePrintableView() {
  document.body.classList.remove("print-preview");
  $("print-toolbar").hidden = true;
  printRoot.setAttribute("aria-hidden", "true");
  window.scrollTo(0, editorScrollY);
  printButton.focus({ preventScroll: true });
}

printButton.addEventListener("click", () => {
  if (!openPrintableView()) return;
  // iOS may ignore scripted printing (especially inside app browsers).
  // Keep the full pack visible so Safari's Share > Print has real content.
  if (!isAppleMobile) window.print();
});
$("print-ready-button").addEventListener("click", () => {
  if (preparePrint()) window.print();
});
$("back-to-editor").addEventListener("click", () => history.back());
window.addEventListener("popstate", () => {
  if (!history.state?.partyprintPrint) closePrintableView();
  else openPrintableView(false);
});

window.addEventListener("beforeprint", preparePrint);

function clearPDF() {
  if (readyPDF) URL.revokeObjectURL(readyPDF.url);
  readyPDF = null;
  $("pdf-result").hidden = true;
  if (!pdfBusy) $("pdf-status").textContent = "";
}
$("pdf-paper").addEventListener("change", clearPDF);
$("pdf-button").addEventListener("click", async () => {
  if (!currentPack || pdfBusy) return;
  const pack = currentPack, paper = $("pdf-paper").value;
  clearPDF(); pdfBusy = true;
  $("pdf-button").disabled = true;
  $("pdf-button").textContent = "Creating your PDF…";
  $("pdf-status").textContent = "Preparing a real PDF file. Your details stay on this device.";
  try {
    // Let the loading state paint before rendering a high-card-count pack.
    await new Promise(resolve => window.requestAnimationFrame(() => window.setTimeout(resolve, 0)));
    const { loadPDFResources, createPDF } = await import("./pdf.js");
    const [engine, font] = await loadPDFResources();
    const bytes = createPDF(pack, paper, engine, font);
    if (pack !== currentPack || paper !== $("pdf-paper").value) throw new Error("Your settings changed. Tap Download PDF again for the updated pack.");
    const filename = "PartyPrint-" + pack.config.occasion + "-" + paper + ".pdf";
    const file = new File([bytes], filename, {type:"application/pdf"});
    readyPDF = {url:URL.createObjectURL(file),file};
    $("pdf-download").href = readyPDF.url;
    $("pdf-download").download = filename;
    $("pdf-open").href = readyPDF.url;
    let canShare = false;
    try { canShare = Boolean(navigator.canShare?.({files:[file]})); } catch { /* Download stays available. */ }
    $("pdf-share").hidden = !canShare;
    $("pdf-result").hidden = false;
    $("pdf-status").textContent = "Your " + pack.pageCount + "-page PDF is ready. Tap Save PDF below. On iPhone, you can also Share PDF → Save to Files.";
    $("pdf-download").focus({preventScroll:true});
    $("pdf-result").scrollIntoView({block:"nearest",behavior:"smooth"});
  } catch (error) {
    $("pdf-status").textContent = error.message?.startsWith("The PDF font") || error.message?.startsWith("Your settings") ? error.message : "We couldn’t create the PDF. Check your connection and try again, or use Print below.";
  } finally {
    pdfBusy = false;
    $("pdf-button").disabled = !currentPack;
    $("pdf-button").textContent = "Download PDF ↓";
  }
});
$("pdf-share").addEventListener("click", async () => {
  if (!readyPDF) return;
  try { await navigator.share({files:[readyPDF.file]}); }
  catch (error) { if (error.name !== "AbortError") $("pdf-status").textContent = "Sharing is unavailable here. Use Save PDF or Open PDF instead."; }
});

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
