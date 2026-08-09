# The sale opened. The orders vanished.

Topic: Azure Service Bus — how a queue in front of the order API stops a flash sale from dropping real customer orders.
Runtime: ~30s across 10 stages (1080x1920)

## Caption

11:00 AM. The flash sale opens. 12,000 people hit Buy in the same minute — and your order API drops 1,729 of them. 🛍️

Not because the code is wrong. Because there is nothing between the crowd and the server.

Without a queue, the arrival rate IS the processing rate. Shoppers decide how fast your server has to work, and when it cannot keep up, requests do not wait politely — connections time out and real carts die.

Azure Service Bus puts a broker in the middle:
• The API accepts the order and enqueues it in milliseconds, then returns. Nothing is rejected at the door.
• The worker receives one message at a time and completes it when it is actually done. The consumer sets the pace, not the crowd.
• A message is not deleted on delivery — it is deleted on completion. If the worker crashes, the lock expires and the message is redelivered.
• Need to drain faster? Run more consumers against the same queue. No partition maths, no re-sharding.

The honest version, because reels tend to oversell this:
• Async is a contract change. "Order placed" now means "order accepted", and your UI has to say so.
• Retries mean the same message can be processed twice. Your handler has to be idempotent — check the order id before you charge the card.
• After MaxDeliveryCount attempts (10 by default) the message goes to the dead-letter queue. If nobody monitors that queue, you did not save the order — you just moved where you lost it.
• A queue does not make you faster. It makes you survivable. The backlog is still real; you are choosing delay over failure.
• Ordering is not free either. If sequence matters, you need sessions or a single consumer, and that caps your throughput.

Delay is a feature. Losing the order is not.

What is sitting in front of your write path right now — a queue, or hope?

Follow for Azure & Cloud Engineering tips.

#azure #azureservicebus #servicebus #messagequeue #systemdesign #microsoftazure #azurecloud #cloudarchitecture #dotnet #backenddeveloper #devops #az305 #msdevbuild

## Stage breakdown

01. **11:00 AM — the flash sale opens** (2800ms) — 12,000 shoppers hit Buy inside the same minute. One order API is listening.
02. **Every order hits one server** (2900ms) — No buffer in between. Each request has to be accepted, validated and written right now.
03. **The server stops keeping up** (3000ms) — CPU pinned at 100%. Timestamps freeze mid-tick — the backlog is now inside the server.
04. **Real orders, gone** (2800ms) — Connections time out. 1,729 shoppers see an error page — that is lost revenue, not lost packets.
05. **Fix: Azure Service Bus** (2600ms) — Put a broker in front. The API has one job now — accept the order and enqueue it.
06. **Every order lands in the queue** (3100ms) — Enqueue takes milliseconds, so nothing is rejected. The timestamps keep ticking.
07. **The worker pulls at its own pace** (3100ms) — Service Bus holds the burst. The consumer takes one message, completes it, then asks for the next.
08. **Failed? It comes back** (2900ms) — An uncompleted message is redelivered automatically. Need it faster? Add workers to the same queue.
09. **Same minute, two outcomes** (3300ms) — Identical traffic. One design drops paying customers, the other absorbs the spike and keeps counting.
10. **Every order. Every time** (3400ms) — The queue is the shock absorber between a spike you cannot control and a server you can.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
