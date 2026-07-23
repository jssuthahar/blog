---
title: 'How to Secure a .NET Minimal API with JWT Bearer Authentication'
description: 'A complete, working setup for JWT bearer auth in ASP.NET Core Minimal APIs — token validation, role policies, and the configuration mistakes that silently disable security.'
publishedAt: 2026-07-10
updatedAt: 2026-07-21
category: dotnet
tags: ['ASP.NET Core', 'Minimal API', 'Authentication', 'JWT', 'Security']
featured: true
series: 'minimal-api-production'
seriesOrder: 2
faq:
  - q: 'Do Minimal APIs support the same authentication as controllers?'
    a: 'Yes. Minimal APIs use the identical authentication and authorization middleware as MVC controllers. The only difference is that you apply policies with RequireAuthorization() on endpoints or route groups instead of [Authorize] attributes.'
  - q: 'Why does my JWT return 401 even though the token looks valid?'
    a: 'The most common cause is a mismatch between the issuer or audience in the token and the TokenValidationParameters, followed by calling UseAuthorization() before UseAuthentication(). Enable IdentityModelEventSource.ShowPII in development to see the exact validation failure.'
---

**TL;DR** — Register `AddAuthentication().AddJwtBearer()`, set explicit `TokenValidationParameters`, call `UseAuthentication()` **before** `UseAuthorization()`, and protect endpoints with `.RequireAuthorization()`. The two failures that bite most teams are a silently disabled signature check and middleware ordering.

Minimal APIs removed a lot of ceremony from ASP.NET Core, but authentication is one area where the reduced ceremony makes it easier to ship something insecure without noticing. This post walks through a production-shaped setup.

## What does JWT bearer authentication actually validate?

A bearer token is only as good as the checks you run against it. On every request, ASP.NET Core verifies four things: the **signature** (the token was issued by someone holding the signing key), the **issuer** (`iss`), the **audience** (`aud`), and the **lifetime** (`exp`/`nbf`). Disable any one of these and the token stops being a security boundary.

Here is the minimum viable registration.

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

Every one of those four `Validate*` flags is set explicitly on purpose. They default to `true`, but writing them out means a future edit that flips one is visible in code review rather than buried in framework defaults.

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

Reverse those two `Use` calls and `HttpContext.User` is still anonymous when authorization runs, so **every** protected endpoint returns 401 regardless of the token. It is the single most common setup bug.

### Grouping protected endpoints

For anything beyond a couple of routes, apply the policy once to a route group:

```csharp
var admin = app.MapGroup("/admin")
    .RequireAuthorization("AdminOnly")
    .WithTags("Admin");

admin.MapGet("/users", GetUsers);
admin.MapDelete("/users/{id:guid}", DeleteUser);
```

This is safer than per-endpoint calls: a new endpoint added to the group inherits protection by default, rather than being unprotected until someone remembers.

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
