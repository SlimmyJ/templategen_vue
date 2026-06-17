import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve("src");

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

function stripTsComments(code) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, code);
  let result = "";
  let last = 0;
  let token = scanner.scan();
  while (token !== ts.SyntaxKind.EndOfFileToken) {
    if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) {
      const start = scanner.getTokenPos();
      const end = scanner.getTextPos();
      const text = code.slice(start, end);
      if (!text.startsWith("///")) {
        result += code.slice(last, start);
        last = end;
      }
    }
    token = scanner.scan();
  }
  result += code.slice(last);
  return result;
}

function stripCssComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, "");
}

function processVue(code) {
  code = code.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (_m, a, body, b) => a + stripTsComments(body) + b);
  code = code.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g, (_m, a, body, b) => a + stripCssComments(body) + b);
  code = code.replace(/<!--[\s\S]*?-->/g, "");
  return code;
}

function tidy(code) {
  return code
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

let changed = 0;
for (const file of listFiles(root)) {
  const ext = path.extname(file);
  if (![".ts", ".vue", ".css"].includes(ext)) continue;
  const original = fs.readFileSync(file, "utf8");
  let next = ext === ".ts" ? stripTsComments(original) : ext === ".css" ? stripCssComments(original) : processVue(original);
  next = tidy(next);
  if (next !== original) {
    fs.writeFileSync(file, next, "utf8");
    changed++;
    console.log("stripped:", path.relative(".", file).replace(/\\/g, "/"));
  }
}
console.log("files changed:", changed);
