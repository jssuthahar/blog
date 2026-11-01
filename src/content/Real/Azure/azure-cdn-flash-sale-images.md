# 1.6 million downloads. One photo.

Topic: A CDN during a flash sale — why 400,000 people downloading the same product photos from one server turned the API into a file server, and how Azure Front Door serves them from edge locations near each user instead.
Runtime: ~55s across 10 stages (1080x1920)
SEO title: Azure CDN for a flash sale
Published: 2026-09-28

## What you will learn

- Why a flash sale sends the same image bytes from one server to every phone
- How a CDN like Azure Front Door serves files from an edge location near each user
- What never goes on a CDN, and why a changed image needs a new URL

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
1.6 million downloads. One photo.
```

**YouTube Shorts — title**

```
Azure CDN for a flash sale #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Picture a flash sale that does not fail on logic. It fails on photos. 🍛

400,000 people open the same product page at 12:00. Four photos each, 350 KB a photo. That is 1.6 million downloads, and every single one comes from the app's own App Service, in one region.

Grey boxes where the photos should be. An API spending the biggest sale of the year as a file server.

THE REAL PROBLEM
The photo was identical for everyone. Same bytes, from far away, every time.

THE FIX: A CDN
Move the photos to Blob Storage and put Azure Front Door in front of them. Front Door keeps copies at edge locations near your users.
1. The first person in a city asks. The edge fetches the photo once.
2. Everyone after that gets it from the edge.
3. Your origin sees about 3 requests in every 100.

Upload with a long cache header:

az storage blob upload-batch \
  --account-name stassets --destination images \
  --source ./images --auth-mode login \
  --content-cache-control "public, max-age=31536000, immutable"

PUT ON A CDN
Product photos, JS and CSS bundles, fonts, icons, promo banners.

NEVER ON A CDN
Carts, checkout, addresses, stock left, live prices, anything behind a login. A CDN gives everyone the same answer — cache one person's cart and the next person sees it.

WHEN THE PHOTO CHANGES
Give it a new URL (put a hash in the filename). Purging only fixes the CDN; the phone keeps its own copy by URL. A new URL fixes both.

NOTE: classic Azure CDN retires on 30 September 2027. On Azure, "CDN" now means Azure Front Door Standard or Premium.

Full incident write-up: blog.msdevbuild.com/blog/azure-front-door-cdn-flash-sale

Follow for Azure & Cloud Engineering tips.

#azure #cdn #azurefrontdoor #systemdesign #webperformance #blobstorage #caching #scalability #cloudarchitecture #backenddeveloper #microsoftazure #interviewprep #msdevbuild
```

**SEO keywords**

```
azure cdn for a flash sale, azure cdn, azure front door cdn, what is a cdn, when to use a cdn, cdn cache hit ratio, serve images from blob storage cdn, cdn stale image cache busting, versioned url cache, what not to cache on a cdn, azure cdn classic retirement, system design flash sale, cdn vs redis, az-204 azure front door, azure, cdn, azurefrontdoor, systemdesign, webperformance, blobstorage, caching, scalability, cloudarchitecture, backenddeveloper, microsoftazure, interviewprep, msdevbuild
```

## Stage breakdown

01. **One photo, 400,000 phones** (5200ms) — Four photos per page, 350 KB each. Everybody opens the page at 12:00.
02. **Every download hits one server** (5800ms) — Chennai, Mumbai, Delhi. All of them pull the same bytes from App Service.
03. **The API became a file server** (5400ms) — The servers spent the sale shipping bytes that never change.
04. **Same bytes, every time** (5000ms) — The photo was identical for all 400,000 people.
05. **Put a copy near the users** (5800ms) — Azure Front Door keeps copies at edge locations. The original moves to Blob Storage.
06. **First download: fetch once** (5600ms) — Chennai's edge has no copy yet, so it fetches the photo from Blob Storage one time.
07. **Everyone else: from the edge** (6000ms) — The next 10,000 people in each city never reach your servers.
08. **Never on the CDN** (5600ms) — Carts, checkout, stock left. A CDN gives everyone the same answer.
09. **New photo? New URL** (5800ms) — Save it under a new name. Edges and phones fetch it fresh. No purge.
10. **Serve the same bytes from the edge** (4800ms) — CDN for files. Redis for data. The database for the truth.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
