# They stole the key. Rotating it broke everything.

Topic: What actually happens after a hard-coded Azure key leaks — the bill climbs, and then rotating the key kills every installed copy of your own app, because a secret shipped inside a mobile app cannot be replaced without an app store release.
Runtime: ~23s across 8 stages (1080x1920)
SEO title: What happens when you hardcode an API key in your app
Published: 2026-08-20

## What you will learn

- Why a leaked key costs money long before anyone notices it leaked
- Why rotating a hard-coded key kills every installed copy of your app
- Why a secret in Azure Key Vault rotates with nobody updating anything

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
They stole the key. Rotating it broke everything.
```

**YouTube Shorts — title**

```
What happens when you hardcode an API key in your app #Shorts
```

**Description** (Instagram caption and Shorts description)

```
The attacker cost us four hours. Rotating the key cost us three days. 💀

THE PART NOBODY WARNS YOU ABOUT
Everyone says do not hard-code keys. Almost nobody explains what happens on the day you have to undo it.

The key is inside the shipped app, so it is inside every installed copy. The moment you revoke it to stop the attacker, all of those copies start failing at the same second. You did not have a security incident and then fix it — you had a security incident, and then you caused an outage.

And the repair goes through an app store: new build, submission, review, release, then you wait for people to update. Some never will.

THE RULE
A secret is only a secret if you can replace it in one place, right now, without asking anyone for permission.

WHAT THAT LOOKS LIKE ON AZURE
1. The app holds no service key — only a user token from Microsoft Entra ID that expires in about an hour.
2. Your API holds the relationship with Azure and reads secrets from Azure Key Vault at runtime with a managed identity.
3. Rotation is a Key Vault operation. New version, done. The app never knew the key existed, so it does not care that it changed.

az keyvault secret set --vault-name msdev-kv \
  --name OpenAiKey --value <new-key>

No build. No store review. No waiting.

BETTER STILL: NO KEY AT ALL
For Azure-to-Azure calls use managed identity and skip keys entirely. Azure SQL, Storage, Service Bus, Cosmos DB and Azure OpenAI all support it. A key you never created cannot leak and never needs rotating.

THE COST SIDE PEOPLE UNDERESTIMATE
A stolen key is rarely used to delete things — deletion gets noticed. It gets used quietly, and on consumption services like Azure OpenAI that shows up as a bill, not an alert. Set a budget alert on the subscription and a cost anomaly alert on the resource before you need them, because otherwise your first signal is the invoice.

IF YOU FIND A LEAKED KEY TODAY, IN THIS ORDER
1. Check whether it is already in use — Azure Monitor logs, grouped by caller IP.
2. Ship the version that no longer needs the key, or put the API in front of it.
3. Swap traffic to the secondary key. Most Azure services issue two for exactly this reason.
4. Regenerate the primary. Then repeat for the secondary.

Doing step 4 first is what turns an incident into an outage.

Follow for Azure & Cloud Engineering tips.

#azure #security #azurekeyvault #devsecops #apisecurity #mobilesecurity #cloudsecurity #dotnet #finops #managedidentity #backenddeveloper #softwareengineering #microsoftazure #msdevbuild
```

**SEO keywords**

```
what happens when you hardcode an api key in your app, hardcoded api key consequences, leaked azure api key, rotate api key mobile app, azure key vault secret rotation, hardcoded credentials mobile app, why not hardcode secrets, azure openai key leaked, api key abuse azure bill, secret rotation without redeploy, app store update to fix secret, cloud cost attack api key, devsecops secret management azure, managed identity instead of keys, azure security best practices keys, azure, security, azurekeyvault, devsecops, apisecurity, mobilesecurity, cloudsecurity, dotnet, finops, managedidentity, backenddeveloper, softwareengineering, microsoftazure, msdevbuild
```

## Stage breakdown

01. **One line, shipped** (2800ms) — A key in the code, in the app, on forty thousand phones.
02. **A stranger has the key** (2800ms) — He unzipped the app. It took him a minute.
03. **The bill starts moving** (3000ms) — He does not delete anything. He just uses it.
04. **So you rotate the key** (3000ms) — One click at three in the morning. The bleeding stops.
05. **And you killed your own app** (3000ms) — Every installed copy carries the key you just revoked.
06. **The repair takes days** (3000ms) — New build, store review, and then people have to update.
07. **None of it had to happen** (2800ms) — If the key had lived in Key Vault, rotation changes nothing for users.
08. **A secret you cannot rotate** (2800ms) — If fixing it needs an app store release, it was never a secret.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
