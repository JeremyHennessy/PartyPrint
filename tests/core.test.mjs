import test from "node:test";
import assert from "node:assert/strict";
import { OCCASIONS, THEMES, getBingoPrompts, getScavengerPrompts, getTriviaQuestions } from "../src/content.js";
import { clampInteger, tidyText, escapeHTML, parseCustomPrompts, shuffle, createBingoCards, normalizeConfig, createPack, shareURL, configFromURL } from "../src/core.js";

test("every supported event has enough useful content for a full pack", () => {
  assert.equal(OCCASIONS.length, 6);
  assert.equal(THEMES.length, 4);
  for (const event of OCCASIONS) {
    assert.ok(getBingoPrompts(event.id).length >= 40, event.id + " bingo");
    assert.ok(getScavengerPrompts(event.id).length >= 12, event.id + " scavenger");
    assert.ok(getTriviaQuestions(event.id).length >= 12, event.id + " trivia");
    assert.ok(getTriviaQuestions(event.id).every(item => item.question && item.answer));
  }
});

test("shuffles are deterministic without mutating the source", () => {
  const source = Array.from({ length: 60 }, (_, i) => "Word " + i);
  const first = shuffle(source, 123);
  assert.deepEqual(first, shuffle(source, 123));
  assert.notDeepEqual(first, shuffle(source, 124));
  assert.deepEqual(source, Array.from({ length: 60 }, (_, i) => "Word " + i));
});

test("5x5 bingo has a free center and no duplicate prompts on a card", () => {
  const cards = createBingoCards({ prompts: getBingoPrompts("baby"), seed: 101, count: 12, size: 5 });
  assert.equal(cards.length, 12);
  for (const card of cards) {
    assert.equal(card.rows.length, 5);
    assert.ok(card.rows.every(row => row.length === 5));
    assert.equal(card.rows[2][2], "FREE SPACE");
    assert.equal(new Set(card.rows.flat()).size, 25);
  }
});

test("4x4 bingo has sixteen regular prompts and no free space", () => {
  const [card] = createBingoCards({ prompts: getBingoPrompts("office"), seed: 88, count: 1, size: 4 });
  assert.equal(card.rows.length, 4);
  assert.equal(card.rows.flat().length, 16);
  assert.ok(!card.rows.flat().includes("FREE SPACE"));
});

test("different guests get differently arranged, deterministic cards", () => {
  const options = { prompts: getBingoPrompts("birthday"), seed: 203, count: 48 };
  const cards = createBingoCards(options);
  assert.equal(cards.length, 48);
  assert.equal(new Set(cards.map(card => JSON.stringify(card.rows))).size, 48);
  assert.deepEqual(cards, createBingoCards(options));
  assert.notDeepEqual(cards, createBingoCards({ ...options, seed: 204 }));
});

test("bingo cards validate an insufficient prompt pool", () => {
  assert.throws(() => createBingoCards({ prompts: ["one", "two"], size: 5 }), /unique bingo prompts/);
  assert.throws(() => createBingoCards({ prompts: ["repeat", "REPEAT", "two"], size: 4 }), /unique bingo prompts/);
});

test("count is always bounded so printing stays manageable", () => {
  assert.equal(clampInteger(-9, 1, 48, 12), 1);
  assert.equal(clampInteger(9999, 1, 48, 12), 48);
  assert.equal(clampInteger("not-a-number", 1, 48, 12), 12);
  assert.equal(createBingoCards({ prompts: getBingoPrompts("baby"), count: 100 }).length, 48);
});

test("custom prompts remove duplicates, blank entries and control chars", () => {
  const custom = parseCustomPrompts("  Grandma's cookies  \n\ngrandma's cookies\nParty\\tTime\nFree gifts");
  assert.deepEqual(custom, ["Grandma's cookies", "Party\\tTime", "Free gifts"]);
  assert.deepEqual(parseCustomPrompts("  hello\tthere\r\nHELLO  THERE").length, 1);
  assert.equal(parseCustomPrompts("x\n".repeat(70)).length, 1);
});

test("unsafe user text is escaped for HTML previews and prints", () => {
  assert.equal(escapeHTML('<img src=x onerror="bad">&'), "&lt;img src=x onerror=&quot;bad&quot;&gt;&amp;");
  assert.equal(escapeHTML("'"), "&#39;");
  assert.equal(tidyText(" \u0001 Hey \nthere ", 70), "Hey there");
});

test("complete packs include cards, trivia, answer-key pages and scavenger hunt", () => {
  const pack = createPack({ occasion: "bridal", title: "Ava's party", count: 14, theme: "sage", seed: 15 });
  assert.equal(pack.bingoCards.length, 14);
  assert.equal(pack.trivia.length, 12);
  assert.equal(pack.scavenger.length, 12);
  assert.equal(pack.pageCount, 17);
  assert.equal(pack.theme.id, "sage");
  assert.equal(pack.config.title, "Ava's party");
});

test("choosing individual games actually removes other games", () => {
  const pack = createPack({ games: { bingo: false, trivia: true, scavenger: false }, seed: 7 });
  assert.equal(pack.bingoCards.length, 0);
  assert.equal(pack.trivia.length, 12);
  assert.equal(pack.scavenger.length, 0);
  assert.equal(pack.pageCount, 2);
  assert.throws(() => createPack({ games: { bingo: false, trivia: false, scavenger: false } }), /at least one game/);
});

test("one-card and maximum-card modes are supported", () => {
  assert.equal(createPack({ count: 1, games: { bingo: true, trivia: false, scavenger: false } }).pageCount, 1);
  assert.equal(createPack({ count: 48, games: { bingo: true, trivia: false, scavenger: false } }).pageCount, 48);
});

test("unknown theme, occasion and layout values safely fall back", () => {
  const pack = createPack({ occasion: "unlisted", theme: "not-a-theme", size: 999, title: "" });
  assert.equal(pack.occasion.id, "baby");
  assert.equal(pack.theme.id, "peach");
  assert.equal(pack.config.size, 5);
  assert.equal(normalizeConfig({ title: "  " }).title, "Baby shower games");
});

test("share link never includes private title, host or custom prompts", () => {
  const link = shareURL("https://example.test/?old=1#main", {
    occasion: "office", theme: "blue", count: 18, size: 4, title: "Secret Party",
    host: "Private Person", custom: "Super private prompt", games: { bingo: true, trivia: false, scavenger: true }
  });
  assert.ok(link.includes("occasion=office"));
  assert.ok(link.includes("games=bingo%2Cscavenger"));
  assert.ok(!link.includes("Secret"));
  assert.ok(!link.includes("Private"));
  assert.ok(!link.includes("old=1"));
  assert.ok(link.endsWith("#studio"));
  const restored = configFromURL(new URL(link).search);
  assert.equal(restored.occasion, "office");
  assert.equal(restored.count, 18);
  assert.equal(restored.size, 4);
  assert.deepEqual(restored.games, { bingo: true, trivia: false, scavenger: true });
});

test("untrusted query parameters cannot create arbitrary themes or occasions", () => {
  const result = configFromURL("?occasion=<script>&theme=evil&count=9999&games=whatever");
  assert.equal(result.occasion, "baby");
  assert.equal(result.theme, "peach");
  assert.equal(result.count, 48);
  assert.deepEqual(result.games, { bingo: false, trivia: false, scavenger: false });
});

test("different events produce meaningfully different trivia selections", () => {
  const baby = createPack({ occasion: "baby", seed: 45 });
  const office = createPack({ occasion: "office", seed: 45 });
  assert.notDeepEqual(baby.trivia, office.trivia);
});


test("gift-opening bingo uses only baby gifts and sharing restores the mode", () => {
  const config = {occasion:"baby", bingoMode:"gifts", count:48, seed:12};
  const pool = getBingoPrompts("baby", "gifts");
  assert.equal(pool.length, 40);
  assert.ok(pool.includes("Diapers"));
  for (const card of createPack(config).bingoCards) assert.ok(card.rows.flat().every(word => word === "FREE SPACE" || pool.includes(word)));
  const restored = configFromURL(new URL(shareURL("https://example.test/", config)).search);
  assert.equal(restored.bingoMode, "gifts");
  assert.equal(normalizeConfig({occasion:"office",bingoMode:"gifts"}).bingoMode,"moments");
});

test("replacement lists exclude curated words and validate enough unique entries", () => {
  const custom = Array.from({length:24},(_,i)=>"Personal word " + i).join("\n");
  const pack = createPack({custom,promptSource:"replace",seed:3});
  assert.ok(pack.bingoCards.every(card=>card.rows.flat().every(word=>word === "FREE SPACE" || word.startsWith("Personal word "))));
  assert.throws(()=>createPack({custom:"One\nTwo",promptSource:"replace"}), /unique bingo prompts/);
  const link = shareURL("https://example.test/",pack.config);
  assert.ok(!link.includes("Personal"));
  assert.equal(configFromURL(new URL(link).search).promptSource,"supplement");
  assert.equal(parseCustomPrompts(Array.from({length:81},(_,i)=>"Word "+i).join("\n")).length,80);
});
