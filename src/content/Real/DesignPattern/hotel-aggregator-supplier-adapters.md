# One hotel. Three JSONs.

Topic: Hotel aggregator system design — how a platform that searches many hotel suppliers, each returning completely different JSON, uses one adapter per supplier, a canonical model and a master hotel ID to show one comparable price per hotel.
Runtime: ~54s across 10 stages (1080x1920)
SEO title: Hotel aggregator system design
Published: 2026-10-02

## What you will learn

- Why supplier JSON cannot be shown to travellers as it arrives
- How one adapter per supplier and a canonical model fix prices and units
- How a master hotel ID and a time budget fix duplicates and slow search

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
One hotel. Three JSONs.
```

**YouTube Shorts — title**

```
Hotel aggregator system design #Shorts
```

**Description** (Instagram caption and Shorts description)

```
A hotel aggregator does not fail on search. It fails on translation. 🏨

Picture three hotel suppliers returning the same Goa resort:
• Supplier A: price per night, taxes extra
• Supplier B: total per stay, in paise
• Supplier C: total in US dollars, fee at the hotel

Show that JSON as it arrives and you get a ₹212 resort at the top of the list, the same hotel three times, and a 9-second search.

THE DESIGN
1. One adapter per supplier. Auth, JSON, units and quirks stop there.
2. One canonical model: total for the stay, taxes in, major units, ISO currency, UTC deadlines.
3. One master hotel ID, mapped offline by distance and name score, with a review queue.
4. Fan out to every supplier in parallel under a 2.5-second budget. A slow one drops out.
5. Archive raw responses, replay them in tests, and alert when an adapter starts rejecting offers.

Search prices can be cached for minutes. The price a traveller pays is always re-checked with the supplier.

The payloads in this short are illustrative shapes, not any supplier's real contract.

Full system design write-up: blog.msdevbuild.com/blog/hotel-aggregator-system-design-supplier-integration

Follow for system design and cloud engineering tips.

#systemdesign #softwarearchitecture #traveltech #apiintegration #designpatterns #dotnet #azure #backenddeveloper #microservices #interviewprep #msdevbuild
```

**SEO keywords**

```
hotel aggregator system design, hotel supplier api integration, adapter pattern, canonical data model, anti-corruption layer, hotel mapping master hotel id, travel booking system design, integrate multiple apis different json, expedia booking.com agoda api integration, fan out with timeout, system design interview, ota architecture, systemdesign, softwarearchitecture, traveltech, apiintegration, designpatterns, dotnet, azure, backenddeveloper, microservices, interviewprep, msdevbuild
```

## Stage breakdown

01. **Three suppliers, three JSONs** (5400ms) — The same room, described three ways: per night, in paise, in dollars.
02. **Used as-is** (5600ms) — No adapter in the middle. Supplier C says 212.40 USD, and the app shows ₹212.
03. **The quiet bug** (5400ms) — Supplier B sends paise. Nobody divided by 100, so its hotels sank out of sight.
04. **One hotel, three listings** (5200ms) — Three names, three IDs, one building. The list shows it three times.
05. **One adapter per supplier** (5400ms) — Each adapter knows one supplier: its auth, its JSON, its units, its quirks.
06. **One canonical model** (5800ms) — Whole stay, taxes in, major units, ISO currency. Every adapter returns the same shape.
07. **One master hotel ID** (5600ms) — An offline mapping turns three supplier IDs into one hotel, with three offers.
08. **A slow supplier? Budget** (5600ms) — Call every adapter at once. At 2.5 seconds, cancel whoever is still running.
09. **The JSON changes** (5400ms) — Supplier B renames a field overnight. Its adapter rejects and counts. Search carries on.
10. **Every JSON in, one model out** (4800ms) — Adapters per supplier, one canonical model, one master hotel ID, one time budget.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
