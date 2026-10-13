// Vector pages from generator data: no screenshots, uploaded content or print dialog.
let enginePromise;
let fontPromise;
export async function loadPDFResources() {
  if (!enginePromise) enginePromise = new Promise((resolve, reject) => {
    if (window.jspdf?.jsPDF) return resolve(window.jspdf.jsPDF);
    const script = document.createElement("script");
    script.src = new URL("../assets/vendor/jspdf-4.2.1.min.js", import.meta.url).href;
    const timeout = window.setTimeout(() => { script.remove(); reject(new Error("PDF engine timed out")); }, 20000);
    script.onload = () => { window.clearTimeout(timeout); window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error("PDF engine unavailable")); };
    script.onerror = () => { window.clearTimeout(timeout); script.remove(); reject(new Error("PDF engine unavailable")); };
    document.head.append(script);
  }).catch(error => { enginePromise = undefined; throw error; });
  if (!fontPromise) fontPromise = (async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(new URL("../assets/fonts/NotoSans-Regular.ttf", import.meta.url), {signal:controller.signal});
      if (!response.ok) throw new Error("PDF font unavailable");
      return await response.arrayBuffer();
    }
    finally { window.clearTimeout(timeout); }
  })()
    .then(buffer => { const bytes = new Uint8Array(buffer); let binary = ""; for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192)); return btoa(binary); })
    .catch(error => { fontPromise = undefined; throw error; });
  return Promise.all([enginePromise, fontPromise]);
}

export function createPDF(pack, format, jsPDF, fontData, progress = () => {}) {
  const paper = format === "A4" ? "a4" : "letter";
  const doc = new jsPDF({ unit: "pt", format: paper, compress: true, putOnlyUsedFonts: true });
  doc.addFileToVFS("NotoSans.ttf", fontData);
  doc.addFont("NotoSans.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans", "normal");
  const cmap = doc.getFont().metadata.cmap.unicode.codeMap;
  const text = [pack.config.title, ...pack.bingoCards.flatMap(c => c.rows.flat()), ...pack.trivia.flatMap(q => [q.question, q.answer]), ...pack.scavenger, ...(pack.conversation || [])].join(" ");
  const missing = [...new Set([...text].filter(c => !/\s/.test(c) && !cmap[c.codePointAt(0)]))];
  if (missing.length) throw new Error("The PDF font cannot show these characters: " + missing.slice(0, 8).join(" ") + ". Replace them or use browser printing.");
  const width = doc.internal.pageSize.getWidth(), height = doc.internal.pageSize.getHeight();
  const ink = pack.theme.ink, tint = pack.theme.tint;
  const left = 48, right = width - 48, contentWidth = width - 96;
  let pageCount = 0;
  function font(size, color = "#55484d", serif = false) {
    doc.setFont(serif ? "times" : "NotoSans", serif && serif !== "title" ? "italic" : "normal");
    doc.setFontSize(size); doc.setTextColor(color);
  }
  function lines(value, maxWidth, size, serif = false) {
    font(size, "#55484d", serif);
    return doc.splitTextToSize(String(value), maxWidth);
  }
  function centered(value, top, maxWidth, size, color, serif = false) {
    const wrapped = lines(value, maxWidth, size, serif);
    font(size, color, serif);
    doc.text(wrapped, width / 2, top, { align: "center", lineHeightFactor: 1.25 });
    return top + wrapped.length * size * 1.25;
  }
  function start(type, subtitle) {
    if (pageCount++) doc.addPage(paper, "portrait");
    font(9, ink); doc.text("PARTYPRINT ORIGINALS · " + pack.occasion.label.toUpperCase(), left, 52);
    doc.setDrawColor(ink); doc.setLineWidth(.6); doc.line(left, 65, right, 65);
    // Built-in serif for ordinary titles; embedded Unicode font for other scripts.
    const serifTitle = /^[\u0020-\u007e\u00a0-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d]*$/.test(pack.config.title);
    let y = centered(pack.config.title, 101, contentWidth, 24, "#3d363a", serifTitle ? "title" : false);
    y = centered(type, y + 4, contentWidth, 25, ink, true);
    y = centered(subtitle, y + 7, contentWidth, 9, "#74696e");
    return y + 12;
  }
  function footer(instruction) {
    doc.setDrawColor("#ddd3cb"); doc.line(left, height - 83, right, height - 83);
    centered(instruction, height - 66, contentWidth, 8.5, "#74696e");
    font(8, "#74696e"); doc.text(pageCount + " / " + pack.pageCount, right, height - 30, {align:"right"});
    progress(pageCount, pack.pageCount);
  }
  for (const card of pack.bingoCards) {
    const y = start("BINGO!", (pack.config.bingoMode === "gifts" ? "Mark each gift as it is opened" : "Mark a square when you spot it") + " · Card " + card.number + " of " + pack.bingoCards.length);
    const gridWidth = Math.min(contentWidth, 490), x = (width - gridWidth) / 2;
    const cellWidth = gridWidth / card.size;
    const cellHeight = Math.min(cellWidth, (height - 130 - y) / card.size);
    card.rows.flat().forEach((value, i) => {
      const cellX = x + (i % card.size) * cellWidth, cellY = y + Math.floor(i / card.size) * cellHeight;
      const free = value === "FREE SPACE";
      doc.setDrawColor(ink); doc.setLineWidth(.6);
      if (free) { doc.setFillColor(tint); doc.rect(cellX, cellY, cellWidth, cellHeight, "FD"); }
      else doc.rect(cellX, cellY, cellWidth, cellHeight);
      let size = free ? 14 : 10, wrapped = lines(value, cellWidth - 12, size);
      while (wrapped.length * size * 1.25 > cellHeight - 12 && size > 6) wrapped = lines(value, cellWidth - 12, --size);
      if (wrapped.length * size * 1.25 > cellHeight - 12) throw new Error("A bingo entry is too long for this layout. Shorten it or use 4 × 4.");
      font(size, free ? ink : "#55484d");
      doc.text(wrapped, cellX + cellWidth / 2, cellY + (cellHeight - (wrapped.length - 1) * size * 1.25) / 2 + size * .3, {align:"center",lineHeightFactor:1.25});
    });
    centered("FIRST COMPLETE LINE WINS · GOOD LUCK", y + cellHeight * card.size + 22, contentWidth, 8, "#74696e");
    footer("HOW TO PLAY · " + (pack.config.bingoMode === "gifts" ? "Mark a gift when it is opened." : "Cross off a moment when it happens.") + " First to finish a row, column or diagonal calls Bingo!");
  }
  function questionSheet(answerKey) {
    const y = start(answerKey ? "answer key" : "trivia time", answerKey ? "For the host · Keep this page to yourself" : "12 questions · One point per correct answer");
    const available = height - 135 - y;
    let size = answerKey ? 10 : 11;
    const entries = () => pack.trivia.map((q, i) => ({question:lines((i + 1) + ". " + q.question, contentWidth - 14, size), answer:answerKey ? lines(q.answer, contentWidth - 28, size) : []}));
    let list = entries();
    const used = () => list.reduce((sum, entry) => sum + (entry.question.length + entry.answer.length) * size * 1.35 + 10, 0);
    while (used() > available && size > 8) { size -= .5; list = entries(); }
    if (used() > available) throw new Error("Trivia does not fit this paper size.");
    let top = y + size;
    for (const entry of list) {
      font(size); doc.text(entry.question, left + 4, top, {lineHeightFactor:1.35}); top += entry.question.length * size * 1.35;
      if (answerKey) { font(size, ink); doc.text(entry.answer, left + 18, top, {lineHeightFactor:1.35}); top += entry.answer.length * size * 1.35; }
      top += 10;
    }
    footer(answerKey ? "HOST COPY · Do not hand out until the round is complete." : pack.config.answerCount ? "Host reads each question. Players use the included guest answer sheets." : "Host reads each question. Players write their answers on the back or on separate paper.");
  }
  if (pack.trivia.length) {
    questionSheet(false);
    for (let copy = 0; copy < pack.config.answerCount; copy++) {
      const y = start("my trivia answers", "Name / team: __________________________");
      const spacing = Math.min(36, (height - 145 - y) / pack.trivia.length);
      pack.trivia.forEach((_, i) => {
        const top = y + (i + 1) * spacing;
        font(11); doc.text(String(i + 1) + ".", left, top);
        doc.setDrawColor("#bbb0aa"); doc.setLineWidth(.5); doc.line(left + 25, top + 2, right, top + 2);
      });
      footer("Write one answer per line. Wait until the host finishes before checking the answers.");
    }
    questionSheet(true);
  }
  if (pack.scavenger.length) {
    const y = start("find & seek", "Spot each item · Tick it off · Have fun!");
    const gap = 24, colWidth = (contentWidth - gap) / 2;
    const rowHeight = Math.min(70, (height - 150 - y) / 6);
    pack.scavenger.forEach((item, i) => {
      const x = left + (i % 2) * (colWidth + gap), top = y + Math.floor(i / 2) * rowHeight;
      doc.setDrawColor(ink); doc.rect(x, top + 2, 5, 5); font(10);
      doc.text(lines(item, colWidth - 16, 10), x + 14, top + 8, {lineHeightFactor:1.3});
      doc.setDrawColor("#ddd3cb"); doc.line(x, top + rowHeight - 14, x + colWidth, top + rowHeight - 14);
    });
    footer("Check off each thing you find. Set a timer or play throughout the event.");
  }
  if (pack.conversation?.length) {
    const y = start("this or that", "Choose either option · No right or wrong answers");
    const spacing = Math.min(34, (height - 135 - y) / pack.conversation.length);
    pack.conversation.forEach((prompt, i) => {
      font(10); doc.text(lines((i + 1) + ". " + prompt, contentWidth, 10), left, y + 12 + i * spacing, {lineHeightFactor:1.3});
    });
    footer("Take turns choosing an option. Sharing a reason is optional. Pass any question. No scoring.");
  }
  if (pageCount !== pack.pageCount) throw new Error("Incomplete PDF pack");
  doc.setProperties({title:"PartyPrint game pack",subject:"Printable party games",creator:"PartyPrint"});
  return doc.output("arraybuffer");
}
