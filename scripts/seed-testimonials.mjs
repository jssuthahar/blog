#!/usr/bin/env node
/**
 * Seeds starter testimonials into Firestore.
 *
 * These are written examples, not messages real readers sent. They go in as
 * `pending` — the same path a public submission takes — because the rules do
 * not let any client self-approve. Approve them in the Firebase console to
 * publish, and replace them with genuine feedback as it arrives.
 *
 * Run once with `npm run seed:testimonials`.
 */

import { randomUUID } from 'node:crypto';

const PROJECT = 'msdevbuild-blog';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

const SEED = [
  {
    message:
      "Suthahar's article helped me complete my work faster. The explanation was clear, practical, and easy to apply in a real project.",
    name: 'Praveen Kumar',
    role: 'Senior Software Engineer',
    company: '',
    article: '',
    featured: true,
  },
  {
    message:
      'The JWT bearer walkthrough caught a middleware ordering mistake we had shipped weeks earlier. Every protected endpoint was returning 401 and we could not work out why.',
    name: 'Anitha Raman',
    role: 'Backend Developer',
    company: '',
    article: 'How to Secure a .NET Minimal API with JWT Bearer Authentication',
    featured: true,
  },
  {
    message:
      'I used the RAG pipeline guide as the reference architecture for our internal assistant. The section on hybrid retrieval saved us a rewrite.',
    name: 'Mohan Raj',
    role: 'Solutions Architect',
    company: '',
    article: 'Building a RAG Pipeline in .NET with Azure OpenAI and Azure AI Search',
    featured: false,
  },
  {
    message:
      'Most tutorials stop at hello world. These posts keep going into the trade-offs, which is the part I actually needed before shipping to production.',
    name: 'Divya Shankar',
    role: 'Tech Lead',
    company: '',
    article: '',
    featured: false,
  },
  {
    message:
      'The .NET MAUI guidance helped our team ship to both platforms without maintaining two codebases. Clear, tested, and honest about the limitations.',
    name: 'Karthik Subramanian',
    role: 'Mobile Developer',
    company: '',
    article: '',
    featured: false,
  },
];

async function main() {
  const writes = SEED.map((item) => ({
    update: {
      name: `projects/${PROJECT}/databases/(default)/documents/testimonials/${randomUUID()}`,
      fields: {
        message: { stringValue: item.message },
        name: { stringValue: item.name },
        company: { stringValue: item.company },
        role: { stringValue: item.role },
        article: { stringValue: item.article },
        // The rules reject anything else; approval happens in the console.
        status: { stringValue: 'pending' },
        featured: { booleanValue: false },
      },
    },
    updateMask: {
      fieldPaths: ['message', 'name', 'company', 'role', 'article', 'status', 'featured'],
    },
    updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
    currentDocument: { exists: false },
  }));

  const res = await fetch(`${BASE}:commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ writes }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore responded ${res.status}: ${body.slice(0, 300)}`);
  }

  console.log(`✓ Seeded ${SEED.length} testimonials as "pending".`);
  console.log('  Next: open Firebase Console → Firestore → testimonials, set');
  console.log('  status to "approved" (and featured: true on the first two),');
  console.log('  then run: npm run sync:testimonials');
}

main().catch((error) => {
  console.error(`✗ Seed failed: ${error.message}`);
  process.exit(1);
});
