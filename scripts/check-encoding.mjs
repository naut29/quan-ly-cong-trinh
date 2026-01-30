import fs from 'node:fs';
import path from 'node:path';

const inputPaths = process.argv.slice(2);
const roots = inputPaths.length ? inputPaths : ['src', 'public'];
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md']);

const mojibakePatterns = [
  // Common UTF-8 -> Windows-1252 mojibake sequences for Vietnamese
  /\u00c3[\u0080-\u00bf]/g, // Ã + low/control/latin-1
  /\u00c4[\u0080-\u00bf\u0192\u2018\u2019\u201a\u201c\u201d]/g, // Ä + common cp1252 replacements
  /\u00c5[\u0080-\u00bf]/g, // Å + low/control/latin-1
  /\u00c6[\u0080-\u00bf]/g, // Æ + low/control/latin-1
  /\u00e2\u20ac\u2122/g, // â€™
  /\u00e2\u20ac\u201c/g, // â€œ
  /\u00e2\u20ac\?/g, // â€?
  /\u00e1[\u00ba\u00bb]/g, // áº / á»
  /\ufffd/g, // replacement character
  /\u00c2(?![A-Za-zÀ-ỹ])/g, // stray Â (not part of a word)
];

const distJsPatterns = [
  // Dist JS is minified and may include non-text data; only hard errors here.
  /\ufffd/g,
];

const stringLiteralRegex = /('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/gms;

const issues = [];

const isTextFile = (filePath) => {
  if (filePath.endsWith('index.html')) return true;
  return exts.has(path.extname(filePath));
};

const walk = (p) => {
  if (!fs.existsSync(p)) return [];
  const stat = fs.statSync(p);
  if (stat.isFile()) return [p];
  const entries = fs.readdirSync(p, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(p, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
};

const isDistPath = (filePath) => {
  const normalized = path.normalize(filePath);
  return normalized === 'dist' || normalized.startsWith(`dist${path.sep}`) || normalized.includes(`${path.sep}dist${path.sep}`);
};

const getPatternsForFile = (filePath) => {
  if (isDistPath(filePath) && filePath.endsWith('.js')) {
    return distJsPatterns;
  }
  return mojibakePatterns;
};

const checkLine = (filePath, lineNumber, line) => {
  const patterns = getPatternsForFile(filePath);
  for (const pattern of patterns) {
    if (pattern.test(line)) {
      issues.push({ filePath, lineNumber, line });
      pattern.lastIndex = 0;
      return;
    }
    pattern.lastIndex = 0;
  }
};

const shouldCheckQuestionMarks = (filePath) => {
  return !isDistPath(filePath);
};

const checkTextFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');

  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      checkLine(filePath, i + 1, lines[i]);
    }

    if (shouldCheckQuestionMarks(filePath)) {
      const literals = content.match(stringLiteralRegex) || [];
      for (const literal of literals) {
        if (/\?\?[A-Za-zÀ-ỹ]/.test(literal)) {
          issues.push({ filePath, lineNumber: 0, line: literal });
        }
      }
    }
    return;
  }

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (shouldCheckQuestionMarks(filePath) && /\?\?[A-Za-zÀ-ỹ]/.test(line)) {
      issues.push({ filePath, lineNumber: i + 1, line });
      continue;
    }
    checkLine(filePath, i + 1, line);
  }
};

const files = roots.flatMap(walk).filter(isTextFile);
files.forEach(checkTextFile);

if (issues.length) {
  console.error('Encoding check failed. Mojibake patterns found:');
  for (const issue of issues) {
    const location = issue.lineNumber ? `${issue.filePath}:${issue.lineNumber}` : issue.filePath;
    console.error(`${location}: ${issue.line}`);
  }
  process.exit(1);
}

console.log('Encoding check passed.');
