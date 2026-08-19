import type { ReelSpec } from '../src/types.ts';
import { ICON, kitCss, kitHtml, kitJs, type KitDef } from './kit.ts';

/**
 * Reel 5: "Is your mobile app really secure?"
 *
 * The audit. One app goes into a scan and five findings come out, and the
 * point of the reel is the last beat: every one of the five is a *default* or
 * a leftover from testing, not a mistake someone made on purpose.
 *
 * The code block does the real work here — it is the scan report, and each
 * finding lights red in turn. The diagram stays a fixed three-node pipeline so
 * the eye has somewhere calm to sit while the report fills.
 *
 * The one number is the finding count, 0 to 5.
 */

const def: KitDef = {
  p: 'av',
  nodes: [
    { id: 'app', icon: ICON.phone, label: 'YOUR APP', color: 'var(--success)', cx: 165, cy: 243 },
    { id: 'scan', icon: ICON.scan, label: 'SECURITY SCAN', color: 'var(--accent-1)', cx: 496, cy: 243 },
    { id: 'report', icon: ICON.report, label: 'FINDINGS', color: 'var(--warn)', cx: 827, cy: 243, count: '0' },
  ],
  wires: [
    { id: 'in', dir: 'h', at: 243, a: 225, b: 436 },
    { id: 'out', dir: 'h', at: 243, a: 556, b: 767 },
  ],
  pills: [
    { label: 'SCANNED', value: '1', unit: 'app' },
    { label: 'FINDINGS', value: '0' },
  ],
  payoff: {
    a: '5 found',
    b: '1 hour',
    head: 'to fix every one of them',
    sub: 'none of the five needs a rewrite',
  },
  codeFile: 'scan-report.txt',
};

const stageHtml = kitHtml(def);
const stageCss = kitCss(def);

export const mobileAppFiveVulnerabilitiesReel: ReelSpec = {
  slug: 'mobile-app-five-vulnerabilities',
  topic:
    'The five vulnerabilities a security scan finds in a working mobile app — a secret in the package, a token in plain storage, an endpoint with no auth, TLS validation left off from testing, and permissions it never uses — and why all five are defaults rather than mistakes.',
  title: {
    main: 'Your app works. <em>It also has 5 holes.</em>',
    sub: 'None of them were mistakes. All five are defaults.',
    pill: '8 steps · 22 sec · Security',
  },

  learn: [
    'The five findings a scan reports on almost every working mobile app',
    'Why insecure storage and a disabled TLS check are leftovers, not bugs',
    'Which of the five to fix first, and why it is not the one you expect',
  ],
  seoTitle: 'Five common mobile app security vulnerabilities',
  keywords: [
    'mobile app security vulnerabilities',
    'owasp mobile top 10',
    'insecure data storage android',
    'token stored in sharedpreferences',
    'api endpoint without authentication',
    'ssl pinning disabled android',
    'excessive app permissions',
    'mobile app security checklist',
    'is my mobile app secure',
    'android security scan findings',
    'ios keychain vs userdefaults',
    'mobile app penetration testing basics',
    'azure mobile app security',
    'appsec mobile developer',
  ],
  publishedAt: '2026-08-24',

  stageHtml,
  stageCss,

  stages: [
    {
      title: 'It works. Ship it?',
      key: 'Ship it?',
      desc: 'Run one scan first. This is a normal, working app.',
      status: 'scanning MSDevShop.apk',
      thinking: false,
      durationMs: 2600,
      narration: 'Your app works. Before you ship it, run one scan. Watch what comes out.',
      js: `${kitJs(def)}
      K.EMPTY = [
        '<span class="c">// scanning MSDevShop.apk ...</span>',
        '',
        '',
        '',
        ''
      ];
      K.FINDINGS = [
        '1  secret in the app package        <span class="r">HIGH</span>',
        '2  session token in plain storage   <span class="r">HIGH</span>',
        '3  endpoint with no auth: /admin    <span class="r">CRIT</span>',
        '4  TLS certificate check disabled   <span class="r">HIGH</span>',
        '5  6 permissions the app never uses  <span class="r">MED</span>'
      ];
      // Reveals the report one line at a time, everything above it kept visible.
      K.found = function(n){
        var lines = [];
        for(var i = 0; i < 5; i++){ lines.push(i < n ? K.FINDINGS[i] : ''); }
        K.code('scan-report.txt', lines, { hit: n, tone: n > 0 ? 'bad' : '' });
      };

      K.reset();
      K.pill(1, '1', 'app', '');
      K.pill(2, '0', '', '');
      K.nodes(['app', 'scan', 'report'], ['app']);
      K.wires({ in: ['flow', 'hot'] });
      K.cnt('report', '0');
      K.code('scan-report.txt', K.EMPTY, {});

      MSD.after(500,  function(){ MSD.punch('#av-n-app', 1); MSD.sfx.blip(1); });
      MSD.after(1400, function(){
        K.nodes(['app', 'scan', 'report'], ['scan']);
        K.wires({ in: ['flow', 'hot'], out: ['flow', 'hot'] });
        MSD.sfx.whoosh();
      });
      MSD.after(2100, function(){ MSD.punch('#av-n-report', 4); });
      `,
    },
    {
      title: '1. A secret in the package',
      key: 'A secret',
      desc: 'An API key in strings.xml. The package is public.',
      status: 'finding 1 · HIGH',
      thinking: false,
      durationMs: 2800,
      narration: 'Finding one. An API key sitting in the app package, which is public.',
      js: `
      var K = window.__K;
      K.reset();
      K.pill(1, '1', 'app', '');
      K.pill(2, '1', '', 'bad');
      K.nodes(['app', 'scan', 'report'], ['report']);
      K.wires({ in: ['flow', 'hot'], out: ['flow', 'bad'] });
      K.cnt('report', '1');
      K.found(1);

      MSD.after(400,  function(){ MSD.punch('#av-ln-1', 2); MSD.sfx.error(); });
      MSD.after(1400, function(){ MSD.punch('#av-c-report', 4); });
      MSD.after(2100, function(){ MSD.punch('#av-pill-2', 5); });
      `,
    },
    {
      title: '2. The token in plain text',
      key: 'in plain text',
      desc: 'Saved in SharedPreferences or UserDefaults. Readable on a rooted phone.',
      status: 'finding 2 · HIGH',
      thinking: false,
      durationMs: 2800,
      narration: 'Finding two. The session token saved in plain text on the device.',
      js: `
      var K = window.__K;
      K.reset();
      K.pill(1, '1', 'app', '');
      K.pill(2, '2', '', 'bad');
      K.nodes(['app', 'scan', 'report'], ['report']);
      K.wires({ in: ['flow', 'hot'], out: ['flow', 'bad'] });
      K.cnt('report', '2');
      K.found(2);

      MSD.after(400,  function(){ MSD.punch('#av-ln-2', 2); MSD.sfx.error(); });
      MSD.after(1500, function(){ MSD.punch('#av-c-report', 4); });
      `,
    },
    {
      title: '3. An endpoint with no auth',
      key: 'no auth',
      desc: 'The /admin route you added to test. It never got a check.',
      status: 'finding 3 · CRITICAL',
      thinking: false,
      durationMs: 2800,
      narration: 'Finding three. An endpoint with no authentication at all.',
      js: `
      var K = window.__K;
      K.reset();
      K.pill(1, '1', 'app', '');
      K.pill(2, '3', '', 'bad');
      K.nodes(['app', 'scan', 'report'], ['report']);
      K.wires({ in: ['flow', 'hot'], out: ['flow', 'bad'] });
      K.cnt('report', '3');
      K.found(3);

      MSD.after(400,  function(){ MSD.punch('#av-ln-3', 2); MSD.sfx.error(); });
      MSD.after(1400, function(){ MSD.shake('#av-code'); });
      MSD.after(2100, function(){ MSD.punch('#av-c-report', 5); });
      `,
    },
    {
      title: '4. TLS checking turned off',
      key: 'turned off',
      desc: 'Someone disabled it to test against a local server. It stayed off.',
      status: 'finding 4 · HIGH',
      thinking: false,
      durationMs: 2800,
      narration: 'Finding four. Certificate checking, switched off for testing, still off.',
      js: `
      var K = window.__K;
      K.reset();
      K.pill(1, '1', 'app', '');
      K.pill(2, '4', '', 'bad');
      K.nodes(['app', 'scan', 'report'], ['report']);
      K.wires({ in: ['flow', 'hot'], out: ['flow', 'bad'] });
      K.cnt('report', '4');
      K.found(4);

      MSD.after(400,  function(){ MSD.punch('#av-ln-4', 2); MSD.sfx.error(); });
      MSD.after(1500, function(){ MSD.punch('#av-c-report', 4); });
      `,
    },
    {
      title: '5. Permissions it never uses',
      key: 'never uses',
      desc: 'Contacts, location, camera. Copied in from a sample and left there.',
      status: 'finding 5 · MEDIUM',
      thinking: false,
      durationMs: 2800,
      narration: 'Finding five. Six permissions the app asks for and never uses.',
      js: `
      var K = window.__K;
      K.reset();
      K.pill(1, '1', 'app', '');
      K.pill(2, '5', '', 'bad');
      K.nodes(['app', 'scan', 'report'], ['report']);
      K.wires({ in: ['flow', 'hot'], out: ['flow', 'bad'] });
      K.cnt('report', '5');
      K.found(5);

      MSD.after(400,  function(){ MSD.punch('#av-ln-5', 2); MSD.sfx.error(); });
      MSD.after(1400, function(){ MSD.punch('#av-c-report', 4); MSD.sfx.thud(); });
      MSD.after(2200, function(){ MSD.shake('#av-n-report'); });
      `,
    },
    {
      title: 'Fix number 3 first',
      key: 'number 3 first',
      desc: 'It is the only one that needs no phone at all. Anyone with curl can use it.',
      status: 'open endpoint · no device required',
      thinking: false,
      durationMs: 2800,
      narration: 'Fix number three first. It is the only one that needs no phone at all.',
      js: `
      var K = window.__K;
      K.reset();
      K.pill(1, '1', 'app', '');
      K.pill(2, '5', '', 'bad');
      K.nodes(['app', 'scan', 'report'], []);
      K.wires({ in: ['flow', 'hot'], out: ['flow', 'bad'] });
      K.cnt('report', '5');
      K.found(5);

      MSD.after(300, function(){
        K.code('scan-report.txt', K.FINDINGS, { hit: 3, tone: 'bad' });
        MSD.punch('#av-ln-3', 2);
        MSD.sfx.focus();
      });
      MSD.after(1500, function(){
        K.code('scan-report.txt', K.FINDINGS, { active: 3 });
        K.pill(2, '4', '', 'bad');
        K.cnt('report', '4');
        MSD.sfx.lock();
      });
      MSD.after(2200, function(){ MSD.punch('#av-pill-2', 5); MSD.sfx.chime(); });
      `,
    },
    {
      title: 'All five are defaults',
      key: 'are defaults',
      desc: 'Nobody chose any of them. That is exactly why they are still there.',
      status: 'run the scan on yours',
      thinking: false,
      durationMs: 2800,
      narration: 'Nobody chose any of these. That is exactly why they are still there.',
      js: `
      var K = window.__K;
      K.reset();
      K.pill(1, '1', 'app', '');
      K.pill(2, '5', '', 'bad');
      K.nodes(['app', 'scan', 'report'], []);
      K.wires({ in: ['flow', 'hot'], out: ['flow', 'ok'] });
      K.cnt('report', '5');
      K.code('scan-report.txt', K.FINDINGS, { tone: 'good' });

      MSD.after(400,  function(){ K.payoff(true); MSD.sfx.chime(); });
      MSD.after(1300, function(){ MSD.punch('#av-po-b', 4); MSD.sfx.sparkle(); });
      MSD.after(2100, function(){ MSD.punch('#av-po-h', 5); MSD.sfx.resolve(); });
      `,
    },
  ],

  end: {
    title: 'All five are defaults, not mistakes.',
    sub: 'Which is why they survive code review — nobody wrote them, so nobody spots them.',
  },

  post: {
    caption: [
      'A security scan on a perfectly working mobile app. Five findings. Nobody made a mistake. 📱',
      '',
      'That is the uncomfortable part: every one of these is a default, a leftover from testing, or something copied from a sample. None of them survive code review, because nobody wrote them on purpose.',
      '',
      '1. A SECRET IN THE APP PACKAGE — HIGH',
      'An API key in strings.xml, Info.plist, a .env bundled into assets, or a constant in your code. The package is a zip file; anything inside it is public. Fix: the app holds a short-lived token, your API holds the keys, Key Vault holds them at rest.',
      '',
      '2. THE SESSION TOKEN IN PLAIN STORAGE — HIGH',
      'SharedPreferences and UserDefaults are plain files. On a rooted or jailbroken device — or from a device backup — they are readable. Fix: Android Keystore / EncryptedSharedPreferences, iOS Keychain. In .NET MAUI use SecureStorage, not Preferences. They are one word apart and completely different.',
      '',
      '3. AN ENDPOINT WITH NO AUTH — CRITICAL',
      'Usually /admin, /health returning config, /debug, or an internal route someone added to test and never protected. Fix: make authorization the default and opt out explicitly, not the reverse.',
      '',
      'builder.Services.AddAuthorizationBuilder()',
      '    .SetFallbackPolicy(new AuthorizationPolicyBuilder()',
      '        .RequireAuthenticatedUser().Build());',
      '',
      'Now a route you forget about fails closed instead of open.',
      '',
      '4. TLS CERTIFICATE CHECKING DISABLED — HIGH',
      'Somebody turned it off to test against a local server with a self-signed cert, and it shipped. Every request is now readable by anyone on the same coffee-shop wifi. Fix: remove the override, and wrap any dev-only handler in #if DEBUG so it physically cannot ship in release.',
      '',
      '5. PERMISSIONS THE APP NEVER USES — MEDIUM',
      'Contacts, location, camera, storage — copied in from a tutorial. It lowers install rates, it fails store review more often, and it widens what an attacker gets if the app is ever compromised. Fix: delete every permission, then add back only the ones that break.',
      '',
      'WHICH ONE TO FIX FIRST',
      'Number 3, and it is not close. Findings 1, 2 and 4 need someone to have your app or your network. An endpoint with no auth needs curl and a URL. It is reachable from anywhere on earth right now, and bots are already scanning for it.',
      '',
      'HOW TO RUN THIS ON YOUR OWN APP TODAY',
      '- Unzip your APK and grep it for key, secret, password, Bearer and http://',
      '- Check what your app writes to disk after login',
      '- List your routes and mark which ones require a token',
      '- Diff your manifest permissions against the ones you actually call',
      '',
      'Follow for Azure & Cloud Engineering tips.',
    ].join('\n'),
    hashtags: [
      '#mobilesecurity',
      '#appsec',
      '#android',
      '#ios',
      '#dotnetmaui',
      '#flutter',
      '#security',
      '#owasp',
      '#azure',
      '#apisecurity',
      '#devsecops',
      '#mobiledeveloper',
      '#cybersecurity',
      '#msdevbuild',
    ],
  },
};
