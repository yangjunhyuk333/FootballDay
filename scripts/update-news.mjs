import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const feedsPath = resolve(root, "data", "feeds.json");
const articlesPath = resolve(root, "data", "articles.json");
const articlesJsPath = resolve(root, "data", "articles.js");

const WINDOW_DAYS = Number(process.env.WINDOW_DAYS || 7);
const MAX_ARTICLES = Number(process.env.MAX_ARTICLES || 42);
const STRICT_NETWORK = process.argv.includes("--strict-network");

const footballKeywords = [
  "football",
  "soccer",
  "premier league",
  "la liga",
  "serie a",
  "bundesliga",
  "ligue 1",
  "champions league",
  "europa league",
  "world cup",
  "transfer",
  "fifa",
  "uefa",
  "arsenal",
  "chelsea",
  "liverpool",
  "manchester",
  "barcelona",
  "real madrid",
  "psg",
  "bayern",
  "inter",
  "milan",
  "juventus"
];

const categoryRules = [
  ["transfer", ["transfer", "sign", "deal", "bid", "clause", "romano", "loan", "window"]],
  ["worldcup", ["world cup", "fifa", "squad", "roster", "qualifier"]],
  ["ucl", ["champions league", "uefa champions", "ucl"]],
  ["ratings", ["rating", "team of the season", "team of the week", "best xi", "sofascore", "whoscored", "fotmob"]],
  ["issue", ["injury", "welfare", "heat", "racism", "disciplinary", "investigation", "ban", "arrest"]]
];

const regionRules = [
  ["england", ["premier league", "arsenal", "chelsea", "liverpool", "manchester", "tottenham", "newcastle"]],
  ["spain", ["la liga", "barcelona", "real madrid", "atletico", "villarreal", "betis"]],
  ["italy", ["serie a", "inter", "milan", "juventus", "napoli", "roma", "atalanta"]],
  ["france", ["ligue 1", "psg", "monaco", "marseille", "lyon", "lille"]],
  ["germany", ["bundesliga", "bayern", "dortmund", "leipzig", "leverkusen"]]
];

async function main() {
  const feeds = JSON.parse(await readFile(feedsPath, "utf8"));
  const existing = await readExisting();
  const pinned = (existing.articles || []).filter((article) => article.pinned);

  const fetchedGroups = await Promise.all(feeds.map((feed) => fetchFeed(feed)));
  const successes = fetchedGroups.filter((group) => group.ok).length;
  const fetched = fetchedGroups.flatMap((group) => group.articles);

  if (STRICT_NETWORK && successes === 0) {
    throw new Error("No feeds could be fetched.");
  }

  const articles = dedupe([...pinned, ...fetched])
    .filter(isInsideWindowOrPinned)
    .sort(compareArticles)
    .slice(0, MAX_ARTICLES);

  const payload = {
    generatedAt: new Date().toISOString(),
    windowDays: WINDOW_DAYS,
    articles,
    feeds
  };

  await writeFile(articlesPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await writeFile(articlesJsPath, `window.FOOTBALLDAY_DATA = ${JSON.stringify(payload, null, 2)};\n`, "utf8");

  console.log(`FootballDay update complete: ${articles.length} articles, ${successes}/${feeds.length} feeds fetched.`);
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(articlesPath, "utf8"));
  } catch {
    return { articles: [] };
  }
}

async function fetchFeed(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: {
        "user-agent": "FootballDayBot/0.1 (+https://github.com/)",
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml"
      }
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const xml = await response.text();
    const articles = parseFeed(xml, feed);
    return { ok: true, articles };
  } catch (error) {
    console.warn(`Feed failed: ${feed.name} - ${error.message}`);
    return { ok: false, articles: [] };
  }
}

function parseFeed(xml, feed) {
  const itemBlocks = blocks(xml, "item");
  const entryBlocks = blocks(xml, "entry");
  const rawItems = itemBlocks.length ? itemBlocks : entryBlocks;
  return rawItems
    .map((block) => normalizeItem(block, feed, itemBlocks.length ? "rss" : "atom"))
    .filter(Boolean)
    .filter((article) => isFootballRelated(article));
}

function normalizeItem(block, feed, type) {
  const title = cleanText(readTag(block, "title"));
  const description = cleanText(readTag(block, "description") || readTag(block, "summary") || readTag(block, "content:encoded"));
  const url = type === "atom" ? readAtomLink(block) : cleanText(readTag(block, "link") || readTag(block, "guid"));
  const published = cleanText(readTag(block, "pubDate") || readTag(block, "published") || readTag(block, "updated"));
  const publishedAt = parseDate(published);

  if (!title || !url) return null;

  const text = `${title} ${description}`;
  return {
    id: stableId(url || title),
    title,
    summary: summarize(description || title),
    source: feed.name,
    url,
    publishedAt,
    category: inferCategory(text, feed.category),
    region: inferRegion(text, feed.region),
    tags: inferTags(text)
  };
}

function blocks(xml, tag) {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  return [...xml.matchAll(pattern)].map((match) => match[1]);
}

function readTag(block, tag) {
  const pattern = new RegExp(`<${escapeRegex(tag)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegex(tag)}>`, "i");
  return block.match(pattern)?.[1] || "";
}

function readAtomLink(block) {
  const href = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
  return href ? decodeEntities(href) : "";
}

function cleanText(value) {
  return decodeEntities(stripTags(stripCdata(value))).replace(/\s+/g, " ").trim();
}

function stripCdata(value) {
  return String(value || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]*>/g, " ");
}

function decodeEntities(value) {
  const entities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " "
  };
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (_, name) => entities[name.toLowerCase()] || `&${name};`);
}

function summarize(value) {
  const text = cleanText(value);
  if (text.length <= 170) return text;
  return `${text.slice(0, 168).trim()}...`;
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function inferCategory(text, fallback = "league") {
  const lower = text.toLowerCase();
  const match = categoryRules.find(([, keywords]) => keywords.some((keyword) => lower.includes(keyword)));
  return match?.[0] || fallback || "league";
}

function inferRegion(text, fallback = "global") {
  const lower = text.toLowerCase();
  const matches = regionRules
    .filter(([, keywords]) => keywords.some((keyword) => lower.includes(keyword)))
    .map(([region]) => region);
  return matches.length ? matches.join(" ") : fallback || "global";
}

function inferTags(text) {
  const lower = text.toLowerCase();
  return footballKeywords
    .filter((keyword) => lower.includes(keyword))
    .slice(0, 4)
    .map((keyword) => keyword.replace(/\b\w/g, (char) => char.toUpperCase()));
}

function isFootballRelated(article) {
  const text = `${article.title} ${article.summary}`.toLowerCase();
  return footballKeywords.some((keyword) => text.includes(keyword));
}

function isInsideWindowOrPinned(article) {
  if (article.pinned) return true;
  const published = new Date(article.publishedAt).getTime();
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Number.isFinite(published) && published >= cutoff;
}

function compareArticles(a, b) {
  if (a.pinned && !b.pinned) return -1;
  if (!a.pinned && b.pinned) return 1;
  return new Date(b.publishedAt) - new Date(a.publishedAt);
}

function dedupe(articles) {
  const seen = new Set();
  const unique = [];
  for (const article of articles) {
    const key = normalizeUrl(article.url) || article.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(article);
  }
  return unique;
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.searchParams.delete("utm_source");
    parsed.searchParams.delete("utm_medium");
    parsed.searchParams.delete("utm_campaign");
    return parsed.toString();
  } catch {
    return url;
  }
}

function stableId(value) {
  return createHash("sha1").update(value).digest("hex").slice(0, 14);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
