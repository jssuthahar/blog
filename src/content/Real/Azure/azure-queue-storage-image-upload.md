# The upload froze the app for 8 seconds.

Topic: Azure Queue Storage — moving image processing out of the upload request with a blob, a 182-byte message and a background worker.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

Someone uploads a 4.2 MB photo and your app freezes for 8 seconds. Not because the upload is slow — because your API decided to do the image processing inside the HTTP request. 🖼️

Virus scan, three resizes, EXIF strip, blob write. Every one of those holds a thread. Twenty people upload at once and the whole site returns 504s, including the pages that have nothing to do with photos.

The fix is not a bigger VM. It is Azure Queue Storage, and it is the cheapest thing in the messaging catalogue:
• The upload endpoint writes the file to Blob Storage, drops a small message on a queue and returns 202 Accepted. Ninety milliseconds.
• The message is a claim check — a blob path plus a bit of context, 182 bytes. The photo is never in the message. That is why the 64 KB limit is not a problem.
• A queue-triggered Function or WebJob picks it up and does the same eight seconds of work, with nobody sitting on a spinner.
• Receiving a message does not delete it. GetMessage hides it for a visibility timeout; only DeleteMessage removes it. If the worker crashes mid-resize the message reappears with DequeueCount incremented — a retry costs you nothing.
• The queue lives in the storage account you already created for the blob. No new namespace, no new bill to explain.

The honest version, because "just use Service Bus" is not always the right answer — and neither is this:
• There is no built-in dead-letter queue. The Azure Functions queue trigger moves a message to <queue>-poison after five failed attempts; write your own client and nothing does that for you. Check DequeueCount yourself.
• Ordering is best-effort, not guaranteed. If you need FIFO, you need Service Bus sessions.
• No topics, no subscriptions, no sessions, no transactions, no duplicate detection. If you want fan-out, this is the wrong queue.
• Messages are 64 KB, against 256 KB on Service Bus Standard and 100 MB on Premium.
• Delivery is at-least-once, so the handler must be idempotent — resizing the same photo twice should overwrite, not duplicate.

Pick Queue Storage for background jobs behind your own app. Pick Service Bus for workflows between systems. Most teams reach for the expensive one out of habit.

What is your slowest endpoint doing that the user never asked to wait for?

Follow for Azure & Cloud Engineering tips.

#azure #azurequeuestorage #queuestorage #azurefunctions #blobstorage #servicebus #systemdesign #microsoftazure #azurecloud #cloudarchitecture #backenddeveloper #az305 #msdevbuild

## Stage breakdown

01. **Upload. Then nothing happens** (2700ms) — A 4.2 MB photo goes up and the screen just sits there. No progress anyone believes.
02. **Your API is doing image work** (2900ms) — Virus scan, three resizes, EXIF strip, then the blob write — all inside the HTTP request.
03. **20 uploads and the site is down** (2900ms) — Each request pins a thread for 8.4 seconds. The web tier runs out long before the CPU does.
04. **Fix: Blob + Queue Storage** (2600ms) — Write the file to a blob, drop a tiny message on a queue, return 202. Ninety milliseconds.
05. **Send the claim check, not the file** (3100ms) — The message carries a blob path and 182 bytes of context. A 64 KB limit you will never hit.
06. **A worker drains it in the background** (3100ms) — A queue-triggered function picks the message up, does the eight seconds of work, and nobody waits.
07. **Nothing is deleted until you delete it** (2900ms) — Receiving only hides the message. If the worker dies, it reappears with DequeueCount up by one.
08. **Poison? You handle that yourself** (2900ms) — There is no automatic dead-letter here. The Functions trigger gives you a -poison queue after five tries.
09. **Queue Storage vs Service Bus** (3200ms) — One is already in the storage account you pay for. The other is a broker with features you may not need.
10. **Return fast. Work later** (2800ms) — The user only ever needed to hear “got it”. Everything after that belongs to a worker.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
