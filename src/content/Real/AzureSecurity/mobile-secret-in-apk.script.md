# Voiceover script — API key hardcoded in a mobile app — how attackers find it

## How to sync this

1. Screen-record the reel as usual, then drop the clip on the Filmora timeline.
2. Scrub to the frame where **`STEP 01 / 08` first appears.** That frame is `00:00.000` for every timecode below.
3. Trim the clip there, or add a marker there and offset the voice track to match.
4. Import `mobile-secret-in-apk.srt` as a caption track and run Filmora's text-to-speech on it — each block is already cut to its stage, so the voice lands in sync without nudging.
5. Duck the reel audio to about 20% under the voice. The music bed is already mixed to sit under narration.

## Timing

| | |
|---|---|
| Stages | 8 |
| Stage runtime | 23.0s |
| From stage one to end of end card | 25.6s |
| Words to speak | 76 |
| Estimated spoken time | 29.2s at 156 wpm |
| Lines needing attention | 8 |

Everything below is measured from that frame. Before it sits the title screen, which holds until you click, plus a 240ms fade — so any hook line you speak over the title is free-floating. Place that one by ear.

## The read

### 01 · `00:00.000 → 00:02.800` · 2.8s

> To do that, it has to carry the key.

`9 words / 6 budget` · **1.1s over**

- ⚠️ 9 words in a 2.4s window — cut 3 to fit
- ⚠️ no narration written — reading the caption body

### 02 · `00:02.800 → 00:05.400` · 2.6s

> Anyone can download your app and open it.

`8 words / 5 budget` · **0.9s over**

- ⚠️ 8 words in a 2.2s window — cut 3 to fit
- ⚠️ no narration written — reading the caption body

### 03 · `00:05.400 → 00:08.200` · 2.8s

> It is sitting in plain text, in a file you published.

`11 words / 6 budget` · **1.8s over**

- ⚠️ 11 words in a 2.4s window — cut 5 to fit
- ⚠️ no narration written — reading the caption body

### 04 · `00:08.200 → 00:11.200` · 3.0s

> Same key, same access. Your bill, his traffic.

`8 words / 6 budget` · **0.5s over**

- ⚠️ 8 words in a 2.6s window — cut 2 to fit
- ⚠️ no narration written — reading the caption body

### 05 · `00:11.200 → 00:14.200` · 3.0s

> Now the phone talks to you, and only you talk to Azure.

`12 words / 6 budget` · **2.0s over**

- ⚠️ 12 words in a 2.6s window — cut 6 to fit
- ⚠️ no narration written — reading the caption body

### 06 · `00:14.200 → 00:17.200` · 3.0s

> Your API reads it at runtime. It is never in a file.

`12 words / 6 budget` · **2.0s over**

- ⚠️ 12 words in a 2.6s window — cut 6 to fit
- ⚠️ no narration written — reading the caption body
- ⚠️ acronym — confirm the voice says it correctly

### 07 · `00:17.200 → 00:20.000` · 2.8s

> Same command. Nothing in there worth taking.

`7 words / 6 budget` · **0.3s over**

- ⚠️ 7 words in a 2.4s window — cut 1 to fit
- ⚠️ no narration written — reading the caption body

### 08 · `00:20.000 → 00:23.000` · 3.0s

> The app should carry a token, never a key.

`9 words / 6 budget` · **0.9s over**

- ⚠️ 9 words in a 2.6s window — cut 3 to fit
- ⚠️ no narration written — reading the caption body

### End card · `00:23.000 → 00:25.600` · 2.6s

On screen: **If it ships, it is public** — Put your own API in front, keep the key in Azure Key Vault, and the app becomes worthless to unzip.

Optional, and it reads fine silently. If you do sign off here, you have room for about 5 words — write a new short line rather than speaking the card.
