// Reproducible samples from the shipping generator and renderer, not illustrated guesses.
// Usage: npm ci, then node scripts/make-marketing-pdfs.mjs.
import fs from "node:fs";
import path from "node:path";
import { jsPDF } from "jspdf";
import { createPack } from "../src/core.js";
import { createPDF } from "../src/pdf.js";

const destination = path.resolve("qa/marketing-pdfs");
fs.mkdirSync(destination, { recursive: true });
const fontBase64 = fs.readFileSync("assets/fonts/NotoSans-Regular.ttf").toString("base64");
const none = { bingo: false, trivia: false, scavenger: false };
const recipes = [
  { file: "baby-gift-bingo.pdf", occasion: "baby", bingoMode: "gifts", theme: "sage", games: { ...none, bingo: true }, count: 1, size: 5, title: "Baby Shower Gift Bingo" },
  { file: "bridal-trivia.pdf", occasion: "bridal", theme: "lilac", games: { ...none, trivia: true }, title: "Bridal Shower Trivia" },
  { file: "birthday-bingo.pdf", occasion: "birthday", theme: "peach", games: { ...none, bingo: true }, count: 1, size: 5, title: "Birthday Party Bingo" },
  { file: "office-bingo.pdf", occasion: "office", theme: "sage", games: { ...none, bingo: true }, count: 1, size: 5, title: "Office Party Bingo" },
  { file: "scavenger.pdf", occasion: "baby", theme: "lilac", games: { ...none, scavenger: true }, title: "Party Scavenger Hunt" }
];
for (const recipe of recipes) {
  const { file, ...config } = recipe;
  const pack = createPack({ ...config, seed: 64321, answerCount: 0 });
  if (pack.pageCount < 1 || pack.pageCount > 2) throw new Error("Marketing pack unexpectedly has " + pack.pageCount + " pages: " + file);
  const bytes = Buffer.from(createPDF(pack, "A4", jsPDF, fontBase64));
  if (bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error("Invalid PDF: " + file);
  fs.writeFileSync(path.join(destination, file), bytes);
  console.log("Actual PartyPrint sample", file, bytes.length + " bytes", pack.pageCount + " pages");
}
