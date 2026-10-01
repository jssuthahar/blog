# Correct. Deployable. Quietly expensive.

Topic: An Azure Copilot Skill for Bicep — why Copilot writes correct but insecure and expensive infrastructure by default, and how a SKILL.md with security and cost rules makes it write private, keyless, tagged, cheap resources in the editor, before Azure Policy or the bill.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Copilot Skill for Azure Bicep guardrails
Published: 2026-02-22

## What you will learn

- Why Copilot leaves public access on and keys in the output
- How a Skill makes the secure, cheap choice the default
- Where a Skill sits next to Azure Policy and Resource Graph

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Correct. Deployable. Quietly expensive.
```

**YouTube Shorts — title**

```
Copilot Skill for Azure Bicep guardrails #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Ask Copilot for an Azure storage account and you get correct, deployable Bicep. With public access on, a key in the output, no diagnostics and no tags. ☁️

And the P1v3 plan someone copied from prod into test? It runs for four months before a cost review finds it.

THE FIX: AN AZURE COPILOT SKILL
.github/skills/azure-service-baseline/SKILL.md

SECURITY FLOOR
• Managed Identity over keys; secrets in Key Vault
• publicNetworkAccess: 'Disabled' + private endpoint
• Diagnostics to the central Log Analytics workspace

COST CEILING
• Cheap tiers by default outside prod
• Premium needs a written reason
• env, owner, costCenter tags on everything

It does not replace Azure Policy. It is the first of four gates: editor, CI, deploy, and a weekly Resource Graph query.

Full build-along: blog.msdevbuild.com/blog/build-azure-copilot-skill-secure-cost-aware-bicep

Follow for GitHub Copilot and Azure tips.

#githubcopilot #azure #bicep #infrastructureascode #finops #cloudsecurity #devops #msdevbuild
```

**SEO keywords**

```
copilot skill for azure bicep guardrails, github copilot skill azure, bicep copilot, azure managed identity, publicnetworkaccess disabled, azure cost control, azure resource graph query, azure policy, infrastructure as code, finops, githubcopilot, azure, bicep, infrastructureascode, cloudsecurity, devops, msdevbuild
```

## Stage breakdown

01. **Provision storage** (5200ms) — A developer asks Copilot for a storage account in the test environment.
02. **The convenient default** (5800ms) — Public network access on, a key in the output, no diagnostics, no tags.
03. **Four months later** (5400ms) — A P1v3 plan copied from prod has been running in test all along.
04. **Write the baseline Skill** (5200ms) — Security floor and cost ceiling, once, in .github/skills/azure-service-baseline.
05. **Security rules** (5400ms) — Managed Identity over keys, secrets in Key Vault, public access disabled.
06. **Cost rules** (5200ms) — Cheap tiers by default outside prod. Premium needs a written reason.
07. **Same prompt, again** (5800ms) — The Skill loads. Private, keyless, logged, tagged, cheap.
08. **The last gate stays quiet** (5200ms) — Policy and the weekly Resource Graph query rarely fire, because the first gate held.
09. **Guardrails in the editor** (4800ms) — Security floor and cost ceiling in a Skill, with Policy and Resource Graph behind it.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
