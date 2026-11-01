# Netflix does not stream from Netflix

Topic: How Netflix works internally
Runtime: ~19s across 8 stages (1080x1920)

## Caption

Netflix does not stream from Netflix.

It ships physical servers into your ISP and fills them overnight, so the video you watch is already a few milliseconds away before you press play.

Which system's internals should I break down next?

#softwareengineering #systemdesign #backend #netflix #cdn #distributedsystems #cloudcomputing #devcommunity #coding #architecture #msdevbuild

## Stage breakdown

01. **It is not coming from Netflix** (2400ms) — When you press play, the video almost never travels from Netflix's own data centres to your TV.
02. **Two separate planes** (2200ms) — Netflix splits the job in two: a control plane that decides things, and a data plane that moves bytes.
03. **You press play** (2400ms) — Your app asks the control plane one question: where should I get this title from right now?
04. **It answers with a ranked list** (2600ms) — The reply is not video. It is a manifest naming the nearest servers, sorted by measured latency.
05. **That server is a real box** (2200ms) — Open Connect appliances are physical servers Netflix ships to internet providers, for free.
06. **Filled while you sleep** (2400ms) — Every night Netflix predicts what your region will watch and pre-loads it onto that box.
07. **Then the bytes go local** (2400ms) — Playback streams from inside your ISP, so the video never crosses the public internet at all.
08. **Why it feels instant** (2600ms) — A few milliseconds away, already cached, and the quality adapts per chunk. That is the whole trick.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
