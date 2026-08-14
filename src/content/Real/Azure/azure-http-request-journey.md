# One line of code. Seven stops.

Topic: What actually happens when your app calls an Azure API with an HTTP client — DNS, the TLS handshake, Front Door, App Service, the Entra ID token, Azure SQL and the trip home, timed stop by stop.
Runtime: ~62s across 13 stages (1080x1920)
SEO title: What happens when your app calls an Azure API
Published: 2026-08-14

## What you will learn

- The seven stops every HTTP call to an Azure API makes, and what each one costs
- Why the first call is slow: 100 of the 160 ms is DNS and the TLS handshake, before your code runs
- Why new HttpClient() in a loop pays that cost forever, and IHttpClientFactory pays it once

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
One line of code. Seven stops.
```

**YouTube Shorts — title**

```
What happens when your app calls an Azure API #Shorts
```

**Description** (Instagram caption and Shorts description)

```
You write one line:

var res = await http.GetAsync("api.contoso.com/orders");

160 ms later you have JSON. Here is every stop that request made — and why the second call takes 45 ms instead. 🌐

🔎 STOP 1 · DNS — 30 ms
Your code has a name, the network needs an address. Azure DNS answers with an IP. Cached afterwards, so you normally pay this once.

🤝 STOP 2 · TCP + TLS handshake — 70 ms
The expensive one, and nothing of yours has been sent yet. TCP does its three-way handshake, then TLS swaps certificates and agrees on keys. Cross-region, this alone can be 200 ms+.

🛡️ STOP 3 · Azure Front Door — 15 ms
You land at the nearest edge POP, not at the datacentre. WAF inspects the request and drops anything nasty before it costs you compute.

⚙️ STOP 4 · App Service — 5 ms
Your controller finally runs. This is the only part most people picture, and it is 5 ms of 160.

🔑 STOP 5 · Microsoft Entra ID — 10 ms
Your API needs to prove who it is to the database. Managed identity fetches a token — no connection string secret, nothing to rotate. The token is cached until it nears expiry.

🗄️ STOP 6 · Azure SQL — 20 ms
The query you actually cared about, over Azure’s internal network.

↩️ STOP 7 · Home — 10 ms
200 OK travels back down the same connection and your await returns.

WHERE THE TIME WENT
• Finding + greeting (DNS + TLS): 100 ms
• Azure doing the work: 50 ms
• The trip home: 10 ms

So 100 of the 160 ms were spent before your code ran a single line. Now call the same API again on the same client: the DNS answer is cached, the connection is still open, the token is still valid. 45 ms.

THE BUG THAT THROWS IT ALL AWAY
using var client = new HttpClient(); inside a method looks harmless and disposes politely. It also opens a brand new connection every call — you pay the full handshake every single time — and the disposed sockets sit in TIME_WAIT, so under load you run out of ports and start getting SocketException.

The fix is three lines:
builder.Services.AddHttpClient("orders", c => c.BaseAddress = new Uri("https://api.contoso.com"));

IHttpClientFactory pools the handlers, recycles them on a schedule so DNS changes are picked up, and gives you one place to set timeouts, retries and circuit breakers.

THREE THINGS TO REMEMBER
• A slow first call is usually setup, not your code. Measure before you optimise the controller.
• Keep connections alive and tokens cached. Almost all of that 100 ms is reusable.
• Put the API in the same region as its database. Every extra hop is paid on every call.

The milliseconds here are illustrative for a same-region call, not a benchmark — the shape is what matters.

Follow for Azure & Cloud Engineering tips.

#azure #dotnet #httpclient #webdevelopment #api #azureappservice #systemdesign #backenddeveloper #cloudcomputing #microsoftazure #csharp #performance #az204 #msdevbuild
```

**SEO keywords**

```
what happens when your app calls an azure api, what happens when you call an api, httpclient azure api call, ihttpclientfactory explained, httpclient socket exhaustion, tls handshake latency explained, dns lookup http request, azure front door app service flow, managed identity token entra id, azure api latency breakdown, http request lifecycle for beginners, dotnet httpclient best practices, azure app service request flow, api slow first call warm up, azure architecture for beginners, azure, dotnet, httpclient, webdevelopment, api, azureappservice, systemdesign, backenddeveloper, cloudcomputing, microsoftazure, csharp, performance, az204, msdevbuild
```

## Stage breakdown

01. **One line of code** (5000ms) — You call an API and get JSON back. Between those two moments, a lot happens.
02. **Stop 1 — Azure DNS** (4600ms) — Your code has a name. The internet needs an address. DNS turns one into the other.
03. **Stop 2 — the TLS handshake** (5000ms) — Before a single byte of your request moves, both sides say hello and swap certificates.
04. **Stop 3 — Azure Front Door** (4600ms) — Your request arrives at the nearest Azure edge, gets checked for anything nasty, then goes inside.
05. **Stop 4 — App Service runs your code** (4400ms) — Finally, your controller runs. This is the only part most people picture — and it is 5 ms of 160.
06. **Stop 5 — a token from Entra ID** (5000ms) — Your API needs to prove who it is to the database. Managed identity gets a token — no password anywhere.
07. **Stop 6 — Azure SQL** (4400ms) — The bit you were actually asking for: one query, over the private network inside Azure.
08. **Stop 7 — the trip home** (4400ms) — The JSON travels back the same way it came, and your await finally returns.
09. **The whole trip, 160 ms** (4800ms) — Seven stops, every one of them doing a job you never see. Now look at what each one cost.
10. **Where the time actually went** (5000ms) — Two thirds of the call was spent introducing yourself. Your code was 5 ms of it.
11. **Now call it a second time** (5000ms) — Same code, same server. But the address, the connection and the token are all still there.
12. **The one-line bug that undoes it** (5000ms) — new HttpClient() inside a method throws that saving away and pays the 100 ms tax on every call.
13. **Now you know what await really costs** (4600ms) — Next time an API feels slow, you can name the stop instead of guessing.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
