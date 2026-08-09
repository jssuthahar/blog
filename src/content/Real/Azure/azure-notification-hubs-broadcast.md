# One push. A million phones.

Topic: Azure Notification Hubs — why pushing one message to a million phones is a platform problem, not a loop.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

“Design a notification system for 10 million users.” The answer people give is a loop over device tokens. It is wrong, and not for the reason you think. 🔔

The loop is slow — a million sequential HTTP calls at 44 a second finishes six hours after the sale ended. But speed is the boring objection. The real cost is everything the loop forces you to own:
• Three platform APIs. APNs wants a .p8 key over HTTP/2, FCM wants a service account JSON, WNS wants a package SID and secret. Three SDKs, three credential rotations.
• Three payload schemas. An aps dictionary, an FCM notification object, a WNS toast XML — for the same sentence of copy.
• A device token table you now maintain, including the tokens that died when someone uninstalled the app.

Azure Notification Hubs turns that into one send:
• Devices register with the hub. It holds the registrations and the platform credentials, so your code never sees a token.
• One SendNotificationAsync fans out to every matching device across every platform, and templates render the right payload per platform.
• You target by tag — "city:bengaluru && tier:prime" — instead of querying your own device table. Tag expressions are how segments work.
• When APNs or FCM rejects a token because the app was uninstalled, the hub removes that registration. The cleanup job you would have forgotten to write is already running.

The honest version, because a push is not a queue:
• Delivery is best effort. The platform decides, and neither Apple nor Google guarantees it. Phone off, no data, notifications muted — it simply never arrives.
• No ordering, no retention, no read receipt. If the information matters, the banner is a hint and your API is the source of truth.
• Tags are opaque strings visible to anyone who can register. Never encode a phone number, an email or anything personal in one.
• Payload size limits are the platform's, not Azure's — around 4 KB on APNs. Send an id, not a document.
• Registrations expire. If a device does not check in, it goes stale, and pushing to a stale audience flatters your dashboards and nothing else.

Push tells someone to open the app. It is not how you tell them something true.

Is your push code still holding a table of device tokens?

Follow for Azure & Cloud Engineering tips.

#azure #notificationhubs #pushnotifications #azurenotificationhubs #systemdesign #mobiledevelopment #microsoftazure #azurecloud #cloudarchitecture #dotnetmaui #backenddeveloper #az305 #msdevbuild

## Stage breakdown

01. **Send this to a million phones** (2700ms) — One line of copy, one send button, and 1,000,000 devices that need to hear about it.
02. **Three platforms, three of everything** (2900ms) — APNs wants a .p8 key, FCM wants a service account, WNS wants a package SID. Different payloads too.
03. **The loop finishes tomorrow** (3000ms) — A million sequential HTTP calls at 44 a second. The sale it was announcing ended hours ago.
04. **Fix: Azure Notification Hubs** (2600ms) — One send to the hub. It holds the credentials, the registrations and the per-platform payloads.
05. **The hub speaks every platform** (3000ms) — One call becomes an aps payload, an FCM notification and a WNS toast. You wrote none of them.
06. **Target by tag, not by device** (3100ms) — Devices register with tags. You send to “city:bengaluru AND tier:prime” and never touch a token.
07. **Dead tokens clean themselves** (2900ms) — Uninstalled apps get rejected by APNs and FCM, and the hub removes those registrations for you.
08. **A push is not a message queue** (2800ms) — No ordering, no retention, no receipt. If it must arrive, it belongs in your app, not in a banner.
09. **Your loop vs the hub** (3200ms) — The same push, and the difference is how much delivery machinery you are on the hook for.
10. **Send once. Reach a million** (2800ms) — Your code should describe the audience and the copy. Everything below that is the hub’s job.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
