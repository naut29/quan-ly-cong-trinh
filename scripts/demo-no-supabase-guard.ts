import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_EXTENSIONS = new Set([".ts", ".tsx"]);
const scanRoots = ["src/pages/demo", "src/routes/demo", "src/demo"];

const patterns: Array<{ label: string; regex: RegExp }> = [
  { label: "Supabase client import", regex: /supabaseClient/ },
  { label: "Supabase table query", regex: /\bsupabase\.from\s*\(/ },
  { label: "Supabase RPC", regex: /\bsupabase\.rpc\s*\(/ },
  { label: "App API call", regex: /["'`]\/api\// },
];

const walk = (dirPath: string): string[] => {
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (SCAN_EXTENSIONS.has(path.extname(fullPath))) {
      files.push(fullPath);
    }
  }

  return files;
};

const filesToScan = scanRoots.flatMap((root) => walk(path.resolve(ROOT, root)));
const findings: Array<{ filePath: string; lineNumber: number; label: string; line: string }> = [];

for (const filePath of filesToScan) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        findings.push({
          filePath: path.relative(ROOT, filePath),
          lineNumber: index + 1,
          label: pattern.label,
          line: line.trim(),
        });
      }
    }
  }
}

if (findings.length > 0) {
  console.error("Demo guard failed. Demo files must not call Supabase or app APIs:");
  for (const finding of findings) {
    console.error(
      `- ${finding.filePath}:${finding.lineNumber} [${finding.label}] ${finding.line}`,
    );
  }
  process.exit(1);
}

console.log(`Demo guard passed (${filesToScan.length} files scanned).`);
