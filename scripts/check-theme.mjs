#!/usr/bin/env node
// check-theme.mjs
// Validates the Blogger theme XML before it is uploaded, because Blogger's
// own error messages are close to useless — every failure comes back as
// "Your theme could not be parsed as it is not well-formed", with a one-line
// Xerces message and no line number.
//
// Usage:
//   node scripts/check-theme.mjs                       # checks tools/blog/docs/theme-Blog.xml
//   node scripts/check-theme.mjs path/to/theme.xml     # checks a specific file
//
// Exit code: 0 = safe to upload, 1 = Blogger will reject it.
//
// What it catches, in the order Blogger's parser hits them:
//
//   "Content is not allowed in prolog"  — anything at all before the <?xml
//     declaration: a UTF-8 BOM, a blank line, or (by far the most common
//     cause) a paste that landed *inside* the old theme instead of replacing
//     it, leaving the previous theme's opening lines above the new one.
//
//   "Content is not allowed in trailing section" — the mirror image: leftover
//     text after </html>, which is what a Cmd+A that only selected the
//     rendered viewport in Blogger's CodeMirror editor leaves behind.
//
//   "The entity ... was referenced but not declared" — a named HTML entity
//     such as &nbsp; or &mdash;. The theme is parsed as XML, and XML declares
//     only &amp; &lt; &gt; &quot; &apos;. Everything else must be numeric
//     (&#160;, &#8212;).
//
// Well-formedness itself is delegated to xmllint when it is available, since
// libxml2 is far closer to Blogger's Java parser than a hand-rolled check.

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';

// The theme lives with the rest of the blog's docs in the private tooling
// checkout, symlinked in as tools/. Pass a path explicitly if you keep it
// somewhere else.
const DEFAULT_FILE = 'tools/blog/docs/theme-Blog.xml';

/** The five entities XML predefines. Any other named entity is fatal. */
const XML_ENTITIES = new Set(['amp', 'lt', 'gt', 'quot', 'apos']);

function check(file) {
  const problems = [];
  const notes = [];

  if (!existsSync(file)) {
    return { problems: [`${file} does not exist.`], notes };
  }

  const bytes = readFileSync(file);

  // --- prolog: the BOM check has to happen on bytes, not on a decoded string,
  // because decoding is exactly what hides a BOM from view.
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    problems.push(
      'File starts with a UTF-8 BOM (EF BB BF). Blogger reports this as ' +
        '"Content is not allowed in prolog". Re-save as UTF-8 without BOM.',
    );
  }

  const text = bytes.toString('utf8');
  const declAt = text.indexOf('<?xml');

  if (declAt === -1) {
    notes.push('No <?xml ... ?> declaration found. Blogger tolerates this, but the working theme has one.');
  } else if (declAt > 0) {
    const before = text.slice(0, declAt);
    problems.push(
      `${JSON.stringify(before.length > 60 ? before.slice(0, 60) + '…' : before)} appears before the <?xml ` +
        'declaration. This is the exact cause of "Content is not allowed in prolog" — the declaration must ' +
        'be the very first byte of the file.',
    );
  }

  // A second declaration means two themes got concatenated.
  const declCount = text.split('<?xml').length - 1;
  if (declCount > 1) {
    problems.push(
      `${declCount} <?xml declarations found. Two themes have been pasted into one file — delete everything ` +
        'except the one you want.',
    );
  }

  // CDATA is masked with same-length filler rather than deleted, so byte
  // offsets still line up with the original text and can be sliced from it.
  const CDATA = /<!\[CDATA\[[\s\S]*?\]\]>/g;
  const masked = text.replace(CDATA, (m) => ' '.repeat(m.length));

  // --- trailing section. Anchored to the FIRST </html>, not the last: a
  // duplicated tail puts a second one at the end of the file, and searching
  // backwards would find that and see nothing after it.
  const closeAt = masked.indexOf('</html>');
  if (closeAt === -1) {
    problems.push('No closing </html> found — the file is truncated.');
  } else {
    const after = text.slice(closeAt + '</html>'.length);
    if (after.trim() !== '') {
      problems.push(
        `${JSON.stringify(after.trim().slice(0, 60))} appears after </html>. Blogger reports this as ` +
          '"Content is not allowed in trailing section".',
      );
    }
  }

  // --- named entities. Skip CDATA: inside it, &nbsp; is just text.
  const outsideCdata = masked;
  const named = new Map();
  for (const [, name] of outsideCdata.matchAll(/&([a-zA-Z][a-zA-Z0-9]*);/g)) {
    if (!XML_ENTITIES.has(name)) named.set(name, (named.get(name) ?? 0) + 1);
  }
  for (const [name, count] of named) {
    problems.push(
      `&${name}; used ${count}× outside CDATA. XML predefines only &amp; &lt; &gt; &quot; &apos; — ` +
        'use the numeric form instead.',
    );
  }

  // --- well-formedness, via libxml2 when present.
  try {
    execFileSync('xmllint', ['--noout', file], { stdio: ['ignore', 'ignore', 'pipe'] });
    notes.push('xmllint: well-formed XML.');
  } catch (err) {
    if (err.code === 'ENOENT') {
      notes.push('xmllint not installed — skipped the full well-formedness parse.');
    } else {
      const detail = (err.stderr?.toString() ?? '').trim();
      problems.push(`xmllint rejected the file:\n${detail.split('\n').slice(0, 12).join('\n')}`);
    }
  }

  return { problems, notes };
}

function main() {
  const file = process.argv[2] ?? DEFAULT_FILE;
  const { problems, notes } = check(file);
  const label = relative(process.cwd(), file) || file;

  console.log('');
  for (const note of notes) console.log(`  · ${note}`);

  if (problems.length === 0) {
    console.log('');
    console.log(`theme: ${label} is well-formed and safe to upload. ✓`);
    console.log('');
    console.log('If Blogger still rejects it, the file is not the problem — the paste is.');
    console.log('Upload it instead of pasting: Blogger → Theme → ⋮ → Backup/Restore → Upload.');
    console.log('');
    return 0;
  }

  console.log('');
  for (const p of problems) console.log(`  ✗ ${p}`);
  console.log('');
  console.log(`theme: ${problems.length} problem(s) in ${label}. Blogger will reject it as-is.`);
  console.log('');
  return 1;
}

process.exit(main());
