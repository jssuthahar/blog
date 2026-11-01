#!/usr/bin/env node
// check-secrets.mjs
// Stops a credential from reaching a public page — or a public repo.
//
// Everything under src/content/ is published to blog.msdevbuild.com AND pushed
// to a public GitHub repository. Both of those are one-way doors: a key that
// lands in a commit is compromised the moment it is pushed, and deleting the
// line later does not un-publish it. Git keeps the old blob, and the article
// may already be in someone's feed reader, Google's cache, or an AI crawl.
//
// So this gate binds on DRAFTS TOO. That is the one place it deliberately
// differs from check-aeo.mjs: an unfinished FAQ harms nobody, an unfinished
// article with a live connection string in it is already a leak.
//
// Real articles are full of code samples that must keep working. The rule is
// not "no keys in prose", it is: show the SHAPE of a credential, never a live
// one. Placeholders — <your-key>, YOUR_API_KEY, process.env.X, xxxx — all pass.
//
// Usage:
//   node scripts/check-secrets.mjs                   # every content file
//   node scripts/check-secrets.mjs path/to/post.mdx  # one file (the hook path)
//   node scripts/check-secrets.mjs --json
//
// Exit code: 0 = clean, 1 = something that looks like a live credential.
//
// A finding you are certain is a false positive can be marked in the file:
//   <!-- allow-secret: why this string is safe -->
// on the line before. Use it sparingly and say why — it is read by humans.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src', 'content');
const EXTS = new Set(['.md', '.mdx']);

const args = process.argv.slice(2);
const JSON_MODE = args.includes('--json');
const fileArgs = args.filter((a) => !a.startsWith('--'));

// ---------------------------------------------------------------------------
// What a placeholder looks like.
//
// Checked BEFORE the patterns below, because an article is supposed to show the
// shape of a token. If any of these appear inside the matched text, the match is
// a teaching example, not a credential.
// ---------------------------------------------------------------------------
const PLACEHOLDER = new RegExp(
  [
    'your[-_ ]?', 'my[-_ ]?', 'example', 'sample', 'placeholder', 'dummy', 'fake',
    'test', 'demo', 'redacted', 'changeme', 'replace', 'insert', 'todo',
    'xxx+', '\\.\\.\\.', '\\*{3,}', '<[^>]*>', '\\{\\{', '\\$\\{', '\\$\\(',
    'process\\.env', 'env\\.', 'Environment\\.Get', 'secrets\\.', 'keyvault',
    'key ?vault', 'builder\\.Configuration', 'getenv', 'dotenv',
    'abc123', '123456', '0000', '1234567890',
  ].join('|'),
  'i',
);

/** A run of identical or sequential characters — nobody's real key looks like this. */
function isFiller(s) {
  return /^(.)\1+$/.test(s) || /^(?:abcdef|012345|aaaa|xxxx)/i.test(s);
}

// ---------------------------------------------------------------------------
// Patterns.
//
// `blocking` — the string is issued by a provider in a shape nothing else uses.
// A match is a credential or a very deliberate imitation of one.
// `warn` — the shape is suggestive but legitimately common in prose or samples.
// ---------------------------------------------------------------------------
const RULES = [
  // --- Provider-issued tokens, unambiguous prefixes -------------------------
  { id: 'aws-access-key', level: 'blocking', re: /\b(?:AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16}\b/g,
    what: 'AWS access key ID' },
  { id: 'github-token', level: 'blocking', re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/g,
    what: 'GitHub personal access token' },
  { id: 'github-pat', level: 'blocking', re: /\bgithub_pat_[A-Za-z0-9_]{50,}\b/g,
    what: 'GitHub fine-grained PAT' },
  { id: 'google-api-key', level: 'blocking', re: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    what: 'Google/Firebase API key' },
  { id: 'openai-key', level: 'blocking', re: /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/g,
    what: 'OpenAI API key' },
  { id: 'anthropic-key', level: 'blocking', re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g,
    what: 'Anthropic API key' },
  { id: 'slack-token', level: 'blocking', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
    what: 'Slack token' },
  { id: 'slack-webhook', level: 'blocking', re: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/+]{20,}/g,
    what: 'Slack incoming webhook' },
  { id: 'stripe-key', level: 'blocking', re: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{20,}\b/g,
    what: 'Stripe secret key' },
  { id: 'sendgrid-key', level: 'blocking', re: /\bSG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g,
    what: 'SendGrid API key' },
  { id: 'twilio-sid', level: 'blocking', re: /\bAC[0-9a-f]{32}\b/g,
    what: 'Twilio account SID' },
  { id: 'npm-token', level: 'blocking', re: /\bnpm_[A-Za-z0-9]{36}\b/g,
    what: 'npm access token' },
  { id: 'discord-webhook', level: 'blocking', re: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]{20,}/g,
    what: 'Discord webhook' },

  // --- Private keys and certificates ---------------------------------------
  { id: 'private-key', level: 'blocking', re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/g,
    what: 'private key block' },

  // --- Azure / database connection strings ---------------------------------
  { id: 'azure-storage', level: 'blocking', re: /AccountKey=[A-Za-z0-9+/=]{40,}/g,
    what: 'Azure Storage account key' },
  { id: 'azure-sas', level: 'blocking', re: /(?:SharedAccessKey|SharedAccessSignature)=[A-Za-z0-9+/%=]{20,}/g,
    what: 'Azure shared access key' },
  { id: 'sql-password', level: 'blocking', re: /(?:Password|Pwd)\s*=\s*(?!\s*[;'"])[^;'"\s]{6,}/gi,
    what: 'password inside a connection string' },
  { id: 'db-url-credentials', level: 'blocking', re: /\b(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqp):\/\/[^\s:/@]+:[^\s:/@]+@[^\s/]+/g,
    what: 'database URL with an inline password' },

  // --- JWTs ----------------------------------------------------------------
  // Three real base64url segments. Short illustrative "eyJhbGciOi..." stubs in
  // articles don't reach the length floor.
  { id: 'jwt', level: 'blocking', re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}\b/g,
    what: 'signed JWT' },

  // --- Generic assignments -------------------------------------------------
  // Deliberately a warning: `password: "..."` appears in a hundred harmless
  // config examples. The value still has to look like a real secret to match.
  { id: 'assigned-secret', level: 'warn',
    re: /\b(?:api[_-]?key|apikey|secret|client[_-]?secret|password|passwd|access[_-]?token|auth[_-]?token|private[_-]?key|connection[_-]?string)\b["'\s]*[:=]\s*["'`]([^"'`\n]{12,})["'`]/gi,
    what: 'a secret-looking value assigned in code', valueGroup: 1 },
];

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------

/** Lines carrying an explicit, explained exemption. */
function allowedLines(lines) {
  const allowed = new Set();
  lines.forEach((line, i) => {
    if (/allow-secret:/i.test(line)) {
      allowed.add(i); // the marker's own line
      allowed.add(i + 1); // and the one it guards
    }
  });
  return allowed;
}

function scan(file) {
  const raw = readFileSync(file, 'utf8');
  const lines = raw.split('\n');
  const exempt = allowedLines(lines);
  const findings = [];

  lines.forEach((line, i) => {
    if (exempt.has(i)) return;

    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line)) !== null) {
        const matched = m[0];
        const value = rule.valueGroup ? m[rule.valueGroup] : matched;

        if (PLACEHOLDER.test(matched) || isFiller(value)) continue;
        // A value with no digits and no mixed case is a word, not a key.
        if (rule.level === 'warn' && !/[0-9]/.test(value) && !/[A-Z]/.test(value)) continue;

        findings.push({
          line: i + 1,
          level: rule.level,
          id: rule.id,
          what: rule.what,
          // Never echo the credential — a build log is another public surface.
          excerpt: `${matched.slice(0, 6)}…${matched.length} chars`,
          context: line.trim().slice(0, 80),
        });
      }
    }
  });

  return { file, findings };
}

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (EXTS.has(extname(e.name))) out.push(p);
  }
  return out;
}

function main() {
  const targets = (
    fileArgs.length
      ? fileArgs.map((f) => (f.startsWith('/') ? f : join(ROOT, f))).filter((f) => EXTS.has(extname(f)))
      : walk(CONTENT_DIR)
  ).filter((f) => {
    try {
      return statSync(f).isFile();
    } catch {
      return false;
    }
  });

  const results = targets.map(scan).filter((r) => r.findings.length);

  if (JSON_MODE) {
    console.log(JSON.stringify(results.map((r) => ({ ...r, file: relative(ROOT, r.file) })), null, 2));
    return results.some((r) => r.findings.some((f) => f.level === 'blocking')) ? 1 : 0;
  }

  let blocking = 0;
  let warnings = 0;

  for (const r of results) {
    console.log(`\n${relative(ROOT, r.file)}`);
    for (const f of r.findings) {
      const mark = f.level === 'blocking' ? '✗' : '•';
      console.log(`  ${mark} line ${f.line}: ${f.what} (${f.excerpt})`);
      console.log(`      ${f.context}`);
      if (f.level === 'blocking') blocking++;
      else warnings++;
    }
  }

  console.log('');
  if (blocking) {
    console.log(`secrets: ${blocking} probable live credential(s) in content.`);
    console.log('This content is published to a public site AND a public repo.');
    console.log('Replace the value with a placeholder — <your-key>, YOUR_API_KEY, process.env.KEY.');
    console.log('If the key was ever real, rotate it: it is compromised the moment it is pushed.');
    return 1;
  }
  if (warnings) {
    console.log(`secrets: ${warnings} value(s) worth a second look, nothing conclusive.`);
    return 0;
  }

  console.log(`secrets: ${targets.length} content file(s) scanned, no credentials found. ✓`);
  return 0;
}

process.exit(main());
