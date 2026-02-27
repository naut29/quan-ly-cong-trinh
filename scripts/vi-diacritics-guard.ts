import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".json"]);

const directTargets = [
  "src/locales/vi.json",
  "src/components/layout/AppTopbarApp.tsx",
  "src/pages/Billing.tsx",
  "src/pages/Members.tsx",
];

const recursiveTargets = ["src/pages/app"];

const suspiciousPatterns: Array<{ label: string; regex: RegExp }> = [
  { label: "Xin chao", regex: /\bXin chao\b/i },
  { label: "Du an", regex: /\bDu an\b/i },
  { label: "Tong du toan", regex: /\bTong du toan\b/i },
  { label: "Tien do", regex: /\bTien do\b/i },
  { label: "Khong co", regex: /\bKhong co\b/i },
  { label: "Khong the", regex: /\bKhong the\b/i },
  { label: "Canh bao", regex: /\bCanh bao\b/i },
  { label: "Nguoi dung", regex: /\bNguoi dung\b/i },
  { label: "Cong ty", regex: /\bCong ty\b/i },
  { label: "Thanh toan", regex: /\bThanh toan\b/i },
  { label: "Nhat ky hoat dong", regex: /\bNhat ky hoat dong\b/i },
  { label: "Dang nhap", regex: /\bDang nhap\b/i },
  { label: "Dang xuat", regex: /\bDang xuat\b/i },
  { label: "To chuc", regex: /\bTo chuc\b/i },
  { label: "Tat ca", regex: /\bTat ca\b/i },
  { label: "Phan cong du an", regex: /\bPhan cong du an\b/i },
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

const filesToScan = new Set<string>();

for (const target of directTargets) {
  const absTarget = path.resolve(ROOT, target);
  if (fs.existsSync(absTarget)) {
    filesToScan.add(absTarget);
  }
}

for (const target of recursiveTargets) {
  const absTarget = path.resolve(ROOT, target);
  for (const filePath of walk(absTarget)) {
    filesToScan.add(filePath);
  }
}

const findings: Array<{ filePath: string; lineNumber: number; label: string; line: string }> = [];

for (const filePath of filesToScan) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const pattern of suspiciousPatterns) {
      if (pattern.regex.test(line)) {
        findings.push({
          filePath: path.relative(ROOT, filePath),
          lineNumber: i + 1,
          label: pattern.label,
          line: line.trim(),
        });
      }
    }
  }
}

if (findings.length > 0) {
  console.error("Vietnamese diacritics guard failed. Found suspicious non-diacritic phrases:");
  for (const finding of findings) {
    console.error(
      `- ${finding.filePath}:${finding.lineNumber} [${finding.label}] ${finding.line}`,
    );
  }
  process.exit(1);
}

console.log(`Vietnamese diacritics guard passed (${filesToScan.size} files scanned).`);
