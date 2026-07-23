---
title: 'Structuring a .NET Minimal API Project That Survives Growth'
description: 'Program.cs stops scaling around twenty endpoints. Here is a vertical-slice layout for Minimal APIs that keeps routing, validation, and handlers organised as the project grows.'
highlight: 'Give every feature its own folder holding its endpoints, records, and handler, register each through an IEndpointModule extension method, and keep Program.cs to composition only. Program.cs stops scaling at roughly twenty endpoints.'
publishedAt: 2026-06-28
category: dotnet
tags: ['ASP.NET Core', 'Minimal API', 'Architecture', 'Vertical Slice']
series: 'minimal-api-production'
seriesOrder: 1
faq:
  - q: 'Are Minimal APIs suitable for large applications?'
    a: 'Yes, provided you move endpoint definitions out of Program.cs into feature modules registered via extension methods. The performance and simplicity benefits hold at scale; only the default single-file layout does not.'
---

The Minimal API tutorials all put endpoints in `Program.cs`. That is fine for a demo and untenable by the twentieth endpoint.

## Why does Program.cs stop scaling?

Three reasons compound. Merge conflicts concentrate in one file that every feature branch touches. Related code drifts apart — the endpoint sits in `Program.cs` while its validation lives three folders away. And discoverability collapses: finding "where orders are handled" becomes a scroll rather than a folder.

## The vertical slice layout

Organise by feature, not by technical role:

```
src/
├─ Program.cs                 // composition only
├─ Features/
│  ├─ Orders/
│  │  ├─ OrderEndpoints.cs    // routes for this feature
│  │  ├─ CreateOrder.cs       // request, response, handler
│  │  ├─ GetOrder.cs
│  │  └─ OrderValidators.cs
│  └─ Customers/
│     ├─ CustomerEndpoints.cs
│     └─ ...
└─ Shared/
   ├─ Endpoints/IEndpointModule.cs
   └─ Persistence/AppDbContext.cs
```

Everything a change to "create order" touches lives in one folder.

## Registering feature modules

Define a tiny contract:

```csharp
public interface IEndpointModule
{
    void MapEndpoints(IEndpointRouteBuilder app);
}
```

Then implement it per feature:

```csharp
public sealed class OrderEndpoints : IEndpointModule
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/orders")
            .WithTags("Orders")
            .RequireAuthorization();

        group.MapGet("/{id:guid}", GetOrder.Handle).WithName("GetOrder");
        group.MapPost("/", CreateOrder.Handle).WithName("CreateOrder");
    }
}
```

And discover them all at startup by assembly scan:

```csharp
public static class EndpointExtensions
{
    public static void MapAllEndpoints(this WebApplication app)
    {
        var modules = typeof(Program).Assembly
            .GetTypes()
            .Where(t => typeof(IEndpointModule).IsAssignableFrom(t)
                        && t is { IsInterface: false, IsAbstract: false })
            .Select(Activator.CreateInstance)
            .Cast<IEndpointModule>();

        foreach (var module in modules)
        {
            module.MapEndpoints(app);
        }
    }
}
```

`Program.cs` then stays short no matter how many features exist:

```csharp
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.MapAllEndpoints();

app.Run();
```

## Handlers as static classes

Each operation gets one file holding its request, response, and handler:

```csharp
public static class CreateOrder
{
    public record Request(Guid CustomerId, List<LineItem> Items);
    public record Response(Guid OrderId, decimal Total);

    public static async Task<Results<Created<Response>, ValidationProblem>> Handle(
        Request request,
        AppDbContext db,
        IValidator<Request> validator,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return TypedResults.ValidationProblem(validation.ToDictionary());
        }

        var order = Order.Create(request.CustomerId, request.Items);
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        return TypedResults.Created(
            $"/orders/{order.Id}",
            new Response(order.Id, order.Total));
    }
}
```

Static handlers avoid a per-request allocation, and `TypedResults` gives you accurate OpenAPI output without extra attributes.

## Key takeaways

- Organise by feature; a change should touch one folder.
- `IEndpointModule` + assembly scanning keeps `Program.cs` at composition only.
- Route groups carry cross-cutting concerns like auth and tags.
- Static handlers with `TypedResults` are cheap and self-documenting.
