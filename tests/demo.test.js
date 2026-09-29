const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { formatDuration, remainingSeconds, summarizeSession } = require("../script.js");

test("Timer preserves the deadline after a tab has been in the background", () => {
  assert.equal(remainingSeconds(1000, 61500, 90), 30);
  assert.equal(remainingSeconds(1000, 100000, 90), 0);
  assert.equal(remainingSeconds(1000, 100000, null), null);
});
test("Timer displays correct minute transitions and never a negative value", () => {
  assert.equal(formatDuration(90), "01:30");
  assert.equal(formatDuration(59.5), "01:00");
  assert.equal(formatDuration(-2), "00:00");
});
test("Scoring includes skipped questions in accuracy and tracks changed answers", () => {
  const result = summarizeSession([
    { index: 0, selected: 1, seconds: 8, changes: 2 },
    { index: 1, selected: null, seconds: 5, changes: 0 },
    { index: 2, selected: 0, seconds: 11, changes: 1 }
  ]);
  assert.deepEqual(result, { correct: 1, answered: 2, skipped: 1, accuracy: 33, average: 8, changes: 3 });
});
test("An expired session includes unanswered questions without inventing response time", () => {
  assert.deepEqual(summarizeSession([{ index: 0, selected: 1, seconds: 45, changes: 0 }]), { correct: 1, answered: 1, skipped: 2, accuracy: 33, average: 45, changes: 0 });
  assert.deepEqual(summarizeSession([]), { correct: 0, answered: 0, skipped: 3, accuracy: 0, average: 0, changes: 0 });
});
test("A completed correct session has 100% accuracy", () => {
  assert.equal(summarizeSession([1, 1, 2].map((selected, index) => ({ index, selected, seconds: 10, changes: 0 }))).accuracy, 100);
});
test("Navigation, local assets, dialog targets, and ARIA references resolve", () => {
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, "IDs must be unique");
  for (const match of html.matchAll(/(?:href="#|data-open="|aria-controls="|aria-labelledby=")([^"\s]+)"/g)) {
    assert.ok(ids.includes(match[1]), `Missing target: ${match[1]}`);
  }
  for (const match of html.matchAll(/(?:src|href)="((?:assets\/|style\.css|script\.js)[^"]*)"/g)) {
    assert.ok(fs.existsSync(path.join(root, match[1])), `Missing asset: ${match[1]}`);
  }
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('<html lang="pt-BR">'));
});
