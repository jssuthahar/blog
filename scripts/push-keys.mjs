#!/usr/bin/env node
/**
 * Prints a fresh VAPID key pair for Web Push.
 *
 * Run once with `npm run push:keys`, then:
 *   - put the PUBLIC key in src/config.ts → PUSH.publicKey
 *   - put the PRIVATE key in .env → VAPID_PRIVATE_KEY  (never commit it)
 * Both must come from the SAME run. Regenerating invalidates every existing
 * subscription, so only do it if the private key is lost or compromised.
 */

import webpush from 'web-push';

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log('VAPID key pair — public is safe to publish, private is a secret.\n');
console.log('src/config.ts  → PUSH.publicKey:');
console.log(`  ${publicKey}\n`);
console.log('.env           → VAPID_PRIVATE_KEY:');
console.log(`  ${privateKey}\n`);
