// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: the house reads the post from X (its
// first picture and its text) and hands that to the judge. So all this
// program has to do is hand the post's address to the gate: it reads
// POST.json from the repository root, checks it is a JSON object whose
// url is a real X post address, and copies it to /output/POST.json.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// An X post address as X shows it: x.com or twitter.com (www. or mobile.
// allowed), /status/<digits> or /i/web/status/<digits>. A query string or
// fragment after the id is tolerated by the gate (X appends tracking
// parameters such as ?s=20 to copied links), so it is accepted here too;
// a placeholder still fails because it has no numeric status id.
const POST_URL = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/(i\/web\/status\/|[A-Za-z0-9_]+\/status\/)\d+\/?([?#].*)?$/;

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const postPath = join(BOT_DIR, 'POST.json');
let post: unknown;
try {
  post = JSON.parse(readFileSync(postPath, 'utf8'));
} catch (err) {
  console.error(`POST.json could not be read from ${postPath}: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof post !== 'object' || post === null || Array.isArray(post)) {
  console.error('POST.json must be a JSON object like {"url": "https://x.com/<handle>/status/<id>"}');
  process.exit(1);
}

const url = (post as Record<string, unknown>).url;
if (typeof url !== 'string' || !POST_URL.test(url)) {
  console.error(`POST.json url is not a post address: ${String(url)}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
console.log(`POST.json copied to ${OUTPUT_DIR} for ${url}`);
