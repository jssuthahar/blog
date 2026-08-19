# Mobile App Security — reel series

Ten reels on securing a mobile app and its API on Azure. Each reel teaches
**one** idea in about 23 seconds. Everything that did not fit on screen lives
here — settings, code, defaults, and the traps that only show up in production.

Each reel also emits its own `.md` (the post caption) and, once you run the
narration script, a `.script.md` and `.srt` for Filmora.

| # | Reel | The one idea | Publish | Build |
|---|------|--------------|---------|-------|
| 1 | Your app is leaking secrets | The app package is public — anything shipped inside it is public | 2026-08-16 | `npm run sec:apk` |
| 2 | How Azure protects your mobile app | The app never touches the database | 2026-08-18 | `npm run sec:layers` |
| 3 | One API key can destroy your app | You cannot rotate a key that lives in 40,000 phones | 2026-08-20 | `npm run sec:key` |
| 4 | Hacker vs Azure security | Five attacks, five named doors — and the default that opens one | 2026-08-22 | `npm run sec:vs` |
| 5 | Is your mobile app really secure? | Five findings that are all *defaults*, not mistakes | 2026-08-24 | `npm run sec:audit` |
| 6 | Secure your mobile API in 5 steps | The five layers, added in order, to one API | 2026-08-26 | `npm run sec:steps` |
| 7 | Azure Key Vault in 60 seconds | The last secret is the one that fetches the secrets — Managed Identity removes it | 2026-08-28 | `npm run sec:kv` |
| 8 | AI hacker attacks a mobile app | You cannot out-watch a bot; make the door slow | 2026-08-30 | `npm run sec:bot` |
| 9 | Before vs after: insecure → secure | The same request on both architectures | 2026-09-01 | `npm run sec:cmp` |
| 10 | What happens when you log in? | Your password never reaches your API | 2026-09-03 | `npm run sec:login` |

The ten as briefed contained three near-duplicate pairs (1/3/7 are all "key in
the app", 2/10 are both the request flow, 4/8 are both hacker-vs-defence), so
each was re-angled to a distinct idea. That is what the middle column records.

---

## The format

All ten follow the reference reel in `agents/sample video.mp4`:

- **Line art on the dark ground.** Stroke-only inline SVG icons, 2px connector
  wires, one accent colour per node. No filled panel cards.
- **Two live metric pills** under the title that change value *and* colour as
  the story turns. They carry the one number the reel argues about.
- **Dots travelling along every live wire**, continuously, so no frame is static.
- **A counter beside a node** that climbs while that node is being hit.
- **A syntax-highlighted code block pinned at the bottom** with one highlighted
  active line that moves between stages, and lines that strike through when
  they stop being true.
- **The payoff frame dims the diagram and slams one before/after comparison.**

Roughly 8 stages in 23 seconds — the `short` pacing envelope, not the 46s
`long` cut used by the Azure system-design reels.

All ten are built. `npm run narration:<name>` emits the timed script and SRT for
Filmora alongside each one.

### Adding a reel

1. Write `security/<slug>.ts` exporting a `ReelSpec` (copy `mobile-secret-in-apk.ts`).
2. Register it in `scripts/build-security.ts`.
3. Add `sec:<name>` and `narration:<name>` scripts to `package.json`.
4. Every new spec needs `learn` (exactly 3), `seoTitle`, `keywords` (10–16
   lowercase search phrases) and `publishedAt`.

`security/kit.ts` holds the whole grammar — the icon library, and `kitHtml`,
`kitCss` and `kitJs` generated from one `KitDef`. A reel file declares its nodes,
wires, pills, payoff and stages; it does not restate the layout. The map's
coordinate space is 992 x 546, with icon centres usually at x 165/496/827 for
three columns or 112/356/600/844 for four, and rows at y 100 and y 386.

Three traps worth knowing before you edit the CSS:

- Code lines must be `display:block` with an explicit `line-height`, never
  `flex`. A flex line makes each syntax span a flex item and eats the
  whitespace between them, so `var key` renders as `varkey`.
- When screenshotting stages with headless Chrome, do not add a padding offset
  to `--virtual-time-budget`; it silently shifts every frame into the next stage.
- Node counters go *under* the label, not beside the icon. Beside works for a
  node at the end of a row, but every inner column has a wire running through
  exactly that space — a contact sheet caught `40,000` landing on top of the
  Key Vault icon.

A contact sheet is the cheapest way to review a batch: screenshot one stage per
reel, drop the PNGs into a grid in an HTML file, and screenshot that. It caught
both layout bugs in this series in a single pass.

---

## Reel 1 — Your app is leaking secrets

**On screen:** an app calling Azure OpenAI directly, a stranger unzipping the
package, the key found, your API and Key Vault inserted, the stranger's wire cut.

### Why the package is readable

An `.apk` (and an `.ipa`) is a zip archive. Rename, extract, and you have
`strings.xml`, the manifest, the assets folder and the compiled classes.
`apktool` and `jadx` turn that back into readable Java/Kotlin in about a minute.
No exploit is involved — this is the file you published.

**Obfuscation does not fix it.** ProGuard and R8 rename your *classes*; they do
not delete the string. The key must be in memory at the moment the app uses it,
so it is always recoverable. Same for React Native bundles, Flutter assets and
.NET MAUI assemblies.

### The rule

> If the phone can read it, so can the person holding the phone.

### The fix, end to end

```csharp
// Your API (never shipped). No key in appsettings.json either.
builder.Configuration.AddAzureKeyVault(
    new Uri("https://msdev-kv.vault.azure.net/"),
    new DefaultAzureCredential());
```

Grant the App Service's managed identity the **Key Vault Secrets User** role.
That is the whole authentication story — no client secret, no certificate.

Even better: for Azure-to-Azure calls, skip keys entirely. Azure SQL, Storage,
Service Bus, Cosmos DB and Azure OpenAI all accept managed identity. A key you
never created cannot leak.

### What did not fit in the video

- **Check git history, not just the working tree.** Removing a key in a later
  commit does not remove it from the repo. Use `gitleaks` or GitHub secret
  scanning across all history.
- **Turn on Key Vault soft delete and purge protection** before you need them.
  Soft delete is on by default now; purge protection is not, and it is the one
  that stops a compromised identity from destroying your secrets permanently.
- **Set a rotation reminder** on each secret. Key Vault can emit an
  Event Grid event ahead of expiry — wire it to a Logic App or Function.
- **Where to search first:** `strings.xml`, `Info.plist`, `.env`, anything in
  `assets/`, `google-services.json`, CI variables printed into build logs, and
  hard-coded values in `MauiProgram.cs` / `AppDelegate` / `MainActivity`.

### If you find a leaked key today

In this order, because doing it backwards turns an incident into an outage:

1. Check whether it is already being used — Azure Monitor logs, grouped by caller IP.
2. Ship the version that no longer needs the key, or stand up the API in front of it.
3. Swap traffic to the **secondary** key (most Azure services issue two).
4. Regenerate the primary. Then repeat for the secondary.

---

## Reel 2 — How Azure protects your mobile app

**On screen:** the straight app-to-database line, cut; then Front Door, your
API, Entra ID and a database whose public-address counter drops to zero.

### The five layers and the question each answers

| Layer | Question it answers |
|---|---|
| Azure Front Door + WAF | Is this traffic garbage? |
| Your API | (the only public address you own) |
| Microsoft Entra ID | Who are you? |
| Authorization in your API | What may you see? |
| Private endpoint on Azure SQL | Can you even reach me? |

Miss one and the others do not cover for it.

### The bug this shape prevents

`GET /orders/1043` returning someone else's order. It is called **broken object
level authorization** and it is number one on the OWASP API Security Top 10.
Authentication does not prevent it — a perfectly valid token from a real user is
exactly what exploits it.

The fix is a `WHERE` clause, not middleware:

```csharp
app.MapGet("/orders", (ClaimsPrincipal me, AppDb db) =>
    db.Orders.Where(o => o.UserId == me.GetObjectId()))
   .RequireAuthorization();
```

Never take the user id from the request body, the query string or a header.
Take it from the validated token. The moment the client can tell you who it is,
the check is decoration.

### The four settings people forget

1. **WAF ships in Detection mode.** Detection only logs. Switch to Prevention.
2. **Set public network access to `Disabled`** on SQL, Storage and Key Vault —
   not "allow Azure services", which permits every Azure tenant, not just yours.
3. **Validate the `aud` claim**, not just the signature. A valid token issued
   for a different app is still a valid token.
4. **Lock the API to Front Door only**, or people will find the origin and skip
   the WAF entirely. Check the `X-Azure-FDID` header and restrict inbound to the
   `AzureFrontDoor.Backend` service tag.

### What did not fit in the video

- **Token validation is local.** Your API caches Microsoft's signing keys from
  the OpenID configuration endpoint and verifies offline. It does not call Entra
  ID per request, so this costs microseconds, not a round trip.
- **Managed identity to SQL** removes the last password in the chain. Enable
  Microsoft Entra authentication on the server, then
  `CREATE USER [my-app] FROM EXTERNAL PROVIDER;` and grant it a role.
- **Private endpoint needs private DNS.** Without the
  `privatelink.database.windows.net` zone linked to your VNet, the name still
  resolves to the public IP and the connection fails confusingly.
- **Front Door vs Application Gateway:** Front Door is global and sits at the
  edge; Application Gateway is regional and sits inside a VNet. Both offer WAF.
  For a mobile app with users in more than one region, Front Door.

### Check your own app in five minutes

1. Take a valid token from your app. Call your API with an id belonging to a
   different user. If you get data back, you have the bug.
2. Remove the token entirely and call again. If you still get data, you have a
   bigger one.
3. From your laptop, try to open a connection straight to the database server
   name. If it connects, the private endpoint is not doing its job.

---

## Reel 3 — One API key can destroy your app

**On screen:** the bill climbing to $18,400, the key rotated, and then all 40,000
installs going dark at the same instant.

### The trap

Everyone says do not hard-code keys. Almost nobody explains the day you undo it.
The key is in every installed copy, so revoking it to stop the attacker breaks
every customer at the same second. You did not fix an incident — you caused an
outage on top of one.

### Response order (getting this backwards is the whole problem)

1. Check if the key is in use — Azure Monitor logs, grouped by caller IP.
2. Ship the version that no longer needs it, or put your API in front.
3. Swap traffic to the **secondary** key. Most Azure services issue two exactly
   for this.
4. Regenerate the primary. Then repeat for the secondary.

### What did not fit in the video

- A stolen key is rarely used to *delete* things — deletion gets noticed. On
  consumption services like Azure OpenAI it shows up as a bill, not an alert.
  Set a subscription budget alert **and** a cost anomaly alert before you need them.
- `az keyvault secret set` creates a new *version*. `AddAzureKeyVault` reads at
  startup and caches, so pass a `ReloadInterval` or your "no redeploy" rotation
  quietly needs a redeploy.
- Rotating is only cheap if exactly one system holds the key. If three services
  each have a copy in their own config, you are back to a coordinated release.

---

## Reel 4 — Hacker vs Azure security

**On screen:** one attacker, one target, and a guard in the middle that changes
identity five times.

| Attack | Stopped by | The catch |
|---|---|---|
| Flood of junk and injection | Front Door WAF | Ships in **Detection** mode — switch to Prevention |
| No token | Microsoft Entra ID | Validate `aud`, not just the signature |
| Real token, someone else's id | Owner check in your API | This is OWASP API #1 and auth does not cover it |
| Key found in a public repo | Key Vault + managed identity | Check git *history*, not just HEAD |
| Dialling the database | Private endpoint | Needs the private DNS zone linked, or it still resolves public |

### The default that undoes door 5

"Allow Azure services and resources to access this server" sounds like it means
*your* Azure resources. It means **any resource in any Azure subscription in the
world**, including one an attacker creates in five minutes. Leave it off.

### Five-minute audit

1. Is WAF in Prevention or Detection?
2. Can you fetch another user's record with your own valid token?
3. Is public network access `Disabled` on SQL, Storage and Key Vault?
4. Is "allow Azure services" off?
5. Is Defender for Cloud on?

---

## Reel 5 — Is your mobile app really secure?

**On screen:** a scan report filling in one line at a time, five findings, all of
them defaults.

### The five, and the actual fix

1. **Secret in the package** — the app holds a token; your API holds the keys.
2. **Token in plain storage** — Android Keystore / iOS Keychain. In .NET MAUI use
   `SecureStorage`, not `Preferences`. They are one word apart and completely
   different.
3. **Endpoint with no auth** — make it fail closed:

```csharp
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser().Build());
```

4. **TLS check disabled** — remove the override and wrap any dev-only handler in
   `#if DEBUG` so it physically cannot ship in release.
5. **Unused permissions** — delete every one, then add back only what breaks.

### Fix #3 first, and it is not close

Findings 1, 2 and 4 need someone to have your app or your network. An endpoint
with no auth needs curl and a URL — it is reachable from anywhere on earth right
now, and bots are already scanning for it.

---

## Reel 6 — Secure your mobile API in 5 steps

**On screen:** one API, with a layer bolting on underneath it five times, and the
code file growing a line per step.

HTTPS only → authentication → authorization → secrets → monitoring.

### Why this order

Steps 1–3 are what an attacker walks through. Step 4 decides how bad the day is
when something else goes wrong. Step 5 decides whether you find out in an hour or
on the invoice.

You can do 5 last. You cannot do 1 last, because everything you added in the
meantime travelled in the clear while you waited.

### Rate limiting, which is not in the five

Not a security boundary on its own, but it turns a credential-stuffing bot from a
threat into a nuisance:

```csharp
builder.Services.AddRateLimiter(o =>
    o.AddFixedWindowLimiter("login", w => {
        w.PermitLimit = 10;
        w.Window = TimeSpan.FromMinutes(1);
    }));
```

Partition by user or IP, never globally, or one attacker rate-limits your real
customers.

---

## Reel 7 — Azure Key Vault explained

**On screen:** six secrets leaving the config file, one stubbornly remaining, and
managed identity deleting it.

### The bit tutorials skip

Every Key Vault tutorial ends at "your secrets are in the vault". Then
appsettings.json still has a `ClientId` and `ClientSecret` — the credential that
opens the vault. You replaced six secrets with one master secret in the same
repo, and it expires, usually at 2am, 24 months after whoever created it left.

`DefaultAzureCredential` is the fix: your `az login` on a laptop, the managed
identity in Azure, same line of code, no `#if DEBUG`.

### RBAC, not access policies

Key Vault has two permission models. Access policies are the older, coarser one.
Use Azure RBAC and grant **Key Vault Secrets User** — read only, secrets only.
Your app should not be able to write, delete, or list keys.

### Turn on before you need them

1. Soft delete (default) **and** purge protection (not default) — purge
   protection is what stops a compromised identity destroying secrets permanently.
2. Diagnostic logging to Log Analytics. The audit trail is the whole reason to
   use a vault instead of an environment variable.
3. Firewall or private endpoint, so the vault is not internet-reachable.
4. Expiry dates plus the Event Grid near-expiry event wired to something that pages you.

---

## Reel 8 — AI hacker attacks a mobile app

**On screen:** attempts per minute climbing to 8,000, then dropping to 10.

### Why this is a different problem

Automated attacks are not clever. They are fast and cheap, and they run at 3am
because that is when nobody responds. Every part of your answer has to assume
nobody is awake.

Three controls, in order of effect: **rate limiting** (takes the speed away),
**smart lockout + MFA** (makes a correct guess useless), **Defender for Cloud**
(is awake instead of you).

### The mistake

Adding a CAPTCHA. The bot is not using your web form — it is calling the same API
your app calls, from a server. The control has to live at the API, not the UI.

### One more thing

Return the same response *and the same timing* for "no such user" and "wrong
password". Different responses let the script enumerate which accounts exist, and
a list of real accounts is worth more than the guesses.

---

## Reel 9 — Before vs after

**On screen:** two architectures stacked, with the same six events played through
both.

The six divergences: a real customer (identical), unzipping the app, dialling the
database, asking for another user's order, replacing a secret, and changing
anything at all.

### The real cost

In the "before" design every security fix is an app release, so your response time
to any incident is measured in days and gated by a store reviewer. In the "after"
design every fix is a server-side change you control.

### Migrating without a big bang

1. Stand up an API in front, even if at first it just proxies the same queries.
2. Point a new app version at the API. Leave the old path working.
3. Add authentication, then owner checks.
4. When enough users have updated, turn off public network access on the database.

Step 4 is the one that actually closes it, and it can only happen once step 2 has
rolled out. That gap is why doing this early is so much cheaper than later.

---

## Reel 10 — What happens when you log in?

**On screen:** one sign-in travelling app → Entra ID → your API → Azure SQL, with
the password counter stuck at zero the whole way.

### The journey

1. The app opens the **system browser** on the Microsoft sign-in page — not a text
   field it built. If the app renders the password field, the app has the password.
2. The password reaches Entra ID and stops. Your API is not in this step.
3. MFA — the slow part, and it is her, not the system.
4. A signed JWT comes back, typically valid 60–90 minutes. Store it in the
   Keychain or Android Keystore, never `UserDefaults` / `SharedPreferences`.
5. Your API verifies **signature, issuer, audience and expiry** locally against
   cached Microsoft signing keys. No network call. Check all four — a valid token
   issued for a different app is still valid.
6. Your API reaches SQL with a managed identity:

```
Server=msdev.database.windows.net;
Authentication=Active Directory Default;
```

### The surprise

After step 2 there is no password anywhere — not in the app, your config, the
connection string, or your database. Only a short-lived token that expires by itself.

### Check your own app

Does your login screen have a password field you built? If yes, your app is
handling passwords and none of the above applies to you yet. Moving to MSAL and
the system browser is the change that makes it apply.

---

## Running the reels

```bash
npm run sec:apk     npm run sec:layers   npm run sec:key     npm run sec:vs
npm run sec:audit   npm run sec:steps    npm run sec:kv      npm run sec:bot
npm run sec:cmp     npm run sec:login

npm run narration:apk    # ...and narration:<name> for each of the ten
npx tsc --noEmit         # typecheck after editing any spec
```

Open the built HTML, tap once to start, then screen-record the canvas.
