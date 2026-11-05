---
title: 'How to Secure a .NET Minimal API with JWT Bearer Authentication'
description: 'A working JWT bearer auth setup for ASP.NET Core Minimal APIs — token validation, role policies, and the config mistakes that silently disable security.'
seoTitle: 'Secure a .NET Minimal API with JWT'
highlight: 'Register AddJwtBearer with all four validation flags set explicitly, call UseAuthentication() before UseAuthorization(), and protect route groups rather than individual endpoints. The two failures that bite most teams are a silently weakened signature check and middleware ordering.'
publishedAt: 2026-07-10
cover: './images/secure-minimal-api-jwt-dotnet-cover.png'
coverAlt: 'Share banner headed .NET · API SECURITY with the title "Four flags, or it is not a gate" and the line "Signature, issuer, audience, lifetime. Disable one and the token proves nothing." above the MSDEVBUILD wordmark and the author name. On the right, a three-step chain: a bad box reading "ValidateAudience = false", a token for another app is accepted; then a warn box reading "All four flags set explicitly", signature, issuer, audience, lifetime; then a good box reading "Protect route groups", not endpoint by endpoint.'
updatedAt: 2026-07-21
category: web
categories: ['engineering']
tags: ['ASP.NET Core', 'Minimal API', 'Authentication', 'JWT', 'Security']
featured: true
series: 'minimal-api-production'
seriesOrder: 2
faq:
  - q: 'Do Minimal APIs support the same authentication as controllers?'
    a: 'Yes. Minimal APIs use the identical authentication and authorization middleware as MVC controllers. The only difference is that you apply policies with RequireAuthorization() on endpoints or route groups instead of [Authorize] attributes.'
  - q: 'What are the most common JWT configuration mistakes in ASP.NET Core?'
    a: 'Five recur: calling UseAuthorization() before UseAuthentication(), a signing key under 256 bits, committing the key to appsettings.json, setting ValidateAudience to false, and leaving the default ClockSkew so expired tokens keep working for five more minutes. Each one silently weakens or breaks auth rather than failing loudly.'
  - q: 'Why does my JWT return 401 even though the token looks valid?'
    a: 'The most common cause is a mismatch between the issuer or audience in the token and the TokenValidationParameters, followed by calling UseAuthorization() before UseAuthentication(). Enable IdentityModelEventSource.ShowPII in development to see the exact validation failure.'
quiz:
  - q: "Which four things does JWT bearer authentication validate on every request?"
    options:
      - "Username, password, IP and user agent"
      - "Signature, cookie, session and CSRF token"
      - "Issuer, scope, region and tenant name"
      - "Signature, issuer, audience and lifetime"
    answer: D
    explain: "Disable any one and the token stops being a security boundary. The article sets all four Validate flags explicitly so a future edit that flips one shows up in code review."
    exam: SC-500
    skill: "Manage identity, access, and governance"
  - q: "Every protected endpoint returns 401 even with a valid token. What is the most common cause?"
    options:
      - "The token is too long"
      - "UseAuthorization() is called before UseAuthentication(), so HttpContext.User is still anonymous"
      - "HTTPS is disabled"
      - "The route group has too many endpoints"
    answer: B
    explain: "Authentication must run first because it populates HttpContext.User. Swap the order and every protected route fails."
    exam: AI-200
    skill: "Implement secure Azure solutions"
  - q: "Why apply RequireAuthorization() to a route group instead of to each endpoint?"
    options:
      - "It's faster at runtime"
      - "Groups don't need policies"
      - "A new endpoint added to the group is protected by default, instead of open until someone remembers"
      - "Per-endpoint calls are deprecated"
    answer: C
    explain: "Secure by default: the group carries the policy, such as AdminOnly, so forgetting a line can't leave a new route unprotected."
    exam: SC-500
    skill: "Manage identity, access, and governance"
  - q: "What happens if ValidateAudience is set to false?"
    options:
      - "Tokens issued for another application are accepted by your API"
      - "Tokens without a signature are accepted"
      - "Expired tokens stop working"
      - "The app refuses to start"
    answer: A
    explain: "The audience check proves the token was issued for this API. Always validate it and set ValidAudience."
    exam: SC-500
    skill: "Manage identity, access, and governance"
  - q: "Where should the JWT signing key live?"
    options:
      - "In appsettings.json"
      - "Hardcoded in Program.cs"
      - "In the token itself"
      - "In user-secrets locally and Azure Key Vault in Azure"
    answer: D
    explain: "A key committed to appsettings.json lets anyone with the repo forge tokens. Use a key of at least 32 bytes for HS256, and tighten ClockSkew from its five-minute default."
    exam: AI-200
    skill: "Implement secure Azure solutions"
---

Minimal APIs removed a lot of ceremony from ASP.NET Core. Authentication is one area where the reduced ceremony makes it easier to ship something insecure without noticing. This post walks through a production-shaped setup.

## What does JWT bearer authentication actually validate?

A bearer token is only as good as the checks you run against it. On every request, ASP.NET Core verifies four things: the **signature** (the token was issued by someone holding the signing key), the **issuer** (`iss`), the **audience** (`aud`), and the **lifetime** (`exp`/`nbf`). Disable any one of these and the token stops being a security boundary. Microsoft's own [token validation reference](https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens#validate-tokens) spells out why the audience check is the one people skip and the one that matters most.

This assumes the endpoints are already organised into feature modules rather than one file; [structuring a Minimal API project that survives growth](/blog/minimal-api-project-structure) covers that side. The minimum viable registration looks like this.

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),

            // Default is 5 minutes of leeway. Tighten it.
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();
```

Every one of those four `Validate*` flags is set explicitly on purpose. They default to `true`. Writing them out means a future edit that flips one is visible in code review rather than buried in framework defaults.

<figure>

![Flowchart of JWT bearer validation. A request arrives with a bearer token and passes four decisions in order: is the signature valid, does the issuer match, does the audience name this API, and is the token still within its lifetime. A no on any of them returns 401 Unauthorized. All four yes paths reach the authorization policy on the route group, and then a 200 where the endpoint runs.](./images/jwt-bearer-token-validation-flow.png)

<figcaption>Figure 1 — the four checks AddJwtBearer runs on every request. Disable any one and the token stops being a security boundary.</figcaption>

</figure>

## How do you apply authorization to endpoints?

Minimal APIs replace `[Authorize]` with a fluent call. The middleware order is not optional:

```csharp
var app = builder.Build();

app.UseAuthentication();  // must come first — it populates HttpContext.User
app.UseAuthorization();   // then this decides whether that user is allowed

app.MapGet("/public", () => "anyone can read this");

app.MapGet("/me", (ClaimsPrincipal user) => new
{
    Name = user.Identity?.Name,
    Email = user.FindFirstValue(ClaimTypes.Email)
})
.RequireAuthorization();

app.Run();
```

Reverse those two `Use` calls and `HttpContext.User` is still anonymous when authorization runs. **Every** protected endpoint returns 401 regardless of the token. It is the single most common setup bug.

### Grouping protected endpoints

For anything beyond a couple of routes, apply the policy once to a route group:

```csharp
var admin = app.MapGroup("/admin")
    .RequireAuthorization("AdminOnly")
    .WithTags("Admin");

admin.MapGet("/users", GetUsers);
admin.MapDelete("/users/{id:guid}", DeleteUser);
```

This is safer than per-endpoint calls. A new endpoint added to the group inherits protection by default, rather than being unprotected until someone remembers.

## Role and policy-based authorization

Register named policies at startup and reference them by name:

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin"));

    options.AddPolicy("VerifiedEmail", policy =>
        policy.RequireClaim("email_verified", "true"));
});
```

> Prefer policies over raw role strings scattered through endpoints. When the rule changes — say verified email also requires MFA — you edit one registration instead of hunting every call site.

An API is one layer of five, and the token only answers "who are you" — [how Azure protects a mobile app](/blog/azure-mobile-app-layers) walks the whole request path, including the authorization check this article deliberately leaves to your own code.

## Common configuration mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| `UseAuthorization()` before `UseAuthentication()` | Every protected route 401s | Swap the order |
| Signing key under 256 bits | `IDX10653` at startup | Use a 32+ byte key for HS256 |
| Key committed to `appsettings.json` | Token forgery if repo leaks | Use user-secrets locally, Key Vault in Azure |
| `ValidateAudience = false` | Tokens from another app are accepted | Always validate, set `ValidAudience` |
| Default `ClockSkew` | Expired tokens work for 5 more minutes | Set to 30 seconds or less |

### Debugging a 401 you cannot explain

Turn on personally-identifiable logging in development only. It reveals exactly which validation step failed:

```csharp
if (app.Environment.IsDevelopment())
{
    IdentityModelEventSource.ShowPII = true;
}
```

The log will name the failing parameter — issuer mismatch, audience mismatch, or signature failure — which turns a guessing game into a one-line fix.

## Key takeaways

- Set all four `Validate*` parameters explicitly so defaults never hide a weakened check.
- `UseAuthentication()` always precedes `UseAuthorization()`.
- Apply `.RequireAuthorization()` to route groups so new endpoints are secure by default.
- Keep signing keys in user-secrets or Key Vault, never in `appsettings.json`.
- Tighten `ClockSkew` — the 5-minute default extends the life of every expired token.
