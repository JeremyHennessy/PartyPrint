import { conversationPrompts } from "./conversation.js";
import { honorQuestions, scrambleWords, drawingPrompts } from "./extra-games.js";
import { getBingoPrompts, getTriviaQuestions, getScavengerPrompts, occasionById, themeById } from "./content.js";

export function clampInteger(value, low, high, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(high, Math.max(low, Math.round(parsed))) : fallback;
}

export function tidyText(value, max = 70) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export function parseCustomPrompts(input) {
  const seen = new Set();
  const lines = String(input || "").split(/\r?\n/);
  return lines.map(line => tidyText(line, 56)).filter(item => {
    const key = item.toLocaleLowerCase("en");
    if (!item || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 80);
}

export function hashSeed(value) {
  const text = String(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function shuffle(items, seed) {
  const result = [...items];
  let state = hashSeed(seed) || 1;
  const random = () => {
    state += 0x6D2B79F5;
    let z = state;
    z = Math.imul(z ^ z >>> 15, z | 1);
    z ^= z + Math.imul(z ^ z >>> 7, z | 61);
    return ((z ^ z >>> 14) >>> 0) / 4294967296;
  };
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function uniquePrompts(values) {
  const seen = new Set();
  return values.filter(prompt => {
    const key = prompt.toLocaleLowerCase("en");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function createBingoCards({ prompts, count = 12, size = 5, seed = 1, freeSpace = true }) {
  const side = size === 4 ? 4 : 5;
  const hasFree = side === 5 && Boolean(freeSpace);
  const needed = side * side - (hasFree ? 1 : 0);
  const pool = uniquePrompts(prompts.map(item => tidyText(item, 56)).filter(Boolean));
  if (pool.length < needed) {
    throw new Error("Add more unique bingo prompts to fill the grid.");
  }
  const total = clampInteger(count, 1, 48, 12);
  return Array.from({ length: total }, (_, index) => {
    const selected = shuffle(pool, String(seed) + ":bingo:" + index).slice(0, needed);
    if (hasFree) selected.splice(12, 0, "FREE SPACE");
    const rows = Array.from({ length: side }, (_, row) =>
      selected.slice(row * side, (row + 1) * side));
    return { number: index + 1, rows, size: side, hasFree };
  });
}

export function normalizeConfig(config = {}) {
  const occasion = occasionById(config.occasion).id;
  const theme = themeById(config.theme).id;
  const games = {
    bingo: config.games?.bingo !== false,
    trivia: config.games?.trivia !== false,
    scavenger: config.games?.scavenger !== false,
    conversation: config.games?.conversation === true,
    honor: config.games?.honor === true,
    scramble: config.games?.scramble === true,
    drawing: config.games?.drawing === true
  };
  return {
    occasion,
    theme,
    bingoMode: occasion === "baby" && config.bingoMode === "gifts" ? "gifts" : "moments",
    promptSource: config.promptSource === "replace" ? "replace" : "supplement",
    title: tidyText(config.title, 70) || occasionById(occasion).label + " games",
    host: tidyText(config.host, 50),
    count: clampInteger(config.count, 1, 48, 12),
    answerCount: games.trivia ? clampInteger(config.answerCount ?? 0, 0, 48, 0) : 0,
    size: config.size === 4 || config.size === "4" ? 4 : 5,
    seed: Number.isFinite(Number(config.seed)) ? Number(config.seed) : 42,
    games,
    custom: String(config.custom || "").slice(0, 8000),
    honorQuestions: String(config.honorQuestions || "").slice(0, 2000),
    honorAnswers: String(config.honorAnswers || "").slice(0, 2000)
  };
}

export function createPack(userConfig) {
  const config = normalizeConfig(userConfig);
  if (!Object.values(config.games).some(Boolean)) {
    throw new Error("Choose at least one game for your pack.");
  }
  const custom = parseCustomPrompts(config.custom);
  const prompts = uniquePrompts(config.promptSource === "replace" ? custom : [...custom, ...getBingoPrompts(config.occasion, config.bingoMode)]);
  const bingoCards = config.games.bingo
    ? createBingoCards({ prompts, count: config.count, size: config.size, seed: config.seed })
    : [];
  const trivia = config.games.trivia
    ? shuffle(getTriviaQuestions(config.occasion), "trivia:" + config.seed).slice(0, 12)
    : [];
  const scavenger = config.games.scavenger
    ? shuffle(getScavengerPrompts(config.occasion), "scavenger:" + config.seed).slice(0, 12)
    : [];
  const customQuestions = config.honorQuestions.split(/\r?\n/).map(line=>tidyText(line,100)).filter(Boolean).slice(0,12);
  const answers = config.honorAnswers.split(/\r?\n/).map(line=>tidyText(line,100));
  const honor = config.games.honor ? (customQuestions.length ? customQuestions : honorQuestions(config.occasion)).map((question,i)=>({question,answer:answers[i] || ""})) : [];
  const scramble = config.games.scramble ? shuffle(scrambleWords(config.occasion),"words:"+config.seed).slice(0,12).map((answer,i)=>{
    let clue=shuffle([...answer],"letters:"+config.seed+":"+i).join("");
    if(clue===answer)clue=answer.slice(1)+answer[0];
    return {clue,answer};
  }) : [];
  const drawing = config.games.drawing ? shuffle(drawingPrompts(config.occasion),"drawing:"+config.seed).slice(0,12) : [];
  return {
    config,
    occasion: occasionById(config.occasion),
    theme: themeById(config.theme),
    bingoCards,
    trivia,
    scavenger,
    honor, scramble, drawing,
    conversation: config.games.conversation ? shuffle(conversationPrompts(config.occasion), "conversation:" + config.seed).slice(0,12) : [],
    pageCount: bingoCards.length + (trivia.length ? 2 + config.answerCount : 0) + (scavenger.length ? 1 : 0) + (config.games.conversation ? 1 : 0) + (honor.length ? 2 : 0) + (scramble.length ? 2 : 0) + (drawing.length ? 1 : 0),
    customCount: custom.length
  };
}

// Link stores generic settings, never custom prompts or the host's name.
export function shareURL(baseURL, config) {
  const normalized = normalizeConfig(config);
  const url = new URL(baseURL);
  const params = new URLSearchParams({
    occasion: normalized.occasion,
    mode: normalized.bingoMode,
    theme: normalized.theme,
    count: String(normalized.count),
    size: String(normalized.size),
    games: Object.entries(normalized.games).filter(([, active]) => active).map(([name]) => name).join(",")
  });
  if (normalized.answerCount) params.set("answers", String(normalized.answerCount));
  url.search = params.toString();
  url.hash = "studio";
  return url.toString();
}

export function configFromURL(search) {
  const params = new URLSearchParams(search);
  const occasion = params.get("occasion");
  const theme = params.get("theme");
  const gamesParam = params.get("games");
  const games = gamesParam === null ? undefined : {
    bingo: gamesParam.split(",").includes("bingo"),
    trivia: gamesParam.split(",").includes("trivia"),
    scavenger: gamesParam.split(",").includes("scavenger"),
    conversation: gamesParam.split(",").includes("conversation"),
    honor: gamesParam.split(",").includes("honor"),
    scramble: gamesParam.split(",").includes("scramble"),
    drawing: gamesParam.split(",").includes("drawing")
  };
  return normalizeConfig({
    occasion,
    theme,
    bingoMode: params.get("mode"),
    count: params.get("count") ?? 12,
    answerCount: params.get("answers") ?? 0,
    size: params.get("size") ?? 5,
    games
  });
}
