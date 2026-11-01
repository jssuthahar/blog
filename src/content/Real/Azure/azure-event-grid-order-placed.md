# One order. Four teams need to know.

Topic: Azure Event Grid — why one "OrderPlaced" event with subscriptions beats a checkout service that calls email, inventory and shipping itself.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

An order is placed. Send the email, reserve the stock, create the shipping label. So checkout-api calls all three itself — and that is where the trouble starts. 🛒

Two bills arrive for that decision:
• Latency and blast radius. Three sequential calls inside the request, and checkout now owns the uptime of three services it does not run. Shipping is down, so the order the customer already paid for fails.
• Change cost. The loyalty team wants the same event. That is a code change, a review and a redeploy of the one service that takes the money — for somebody else's feature.

Azure Event Grid inverts it. Checkout publishes one OrderPlaced event to a topic and returns in milliseconds:
• The event subscription is the fan-out unit. Each team owns its own subscription against a topic it does not have to own.
• Delivery is a push. Event Grid calls your webhook, Function, Service Bus queue or Event Hub — there is no receiver loop to keep alive.
• Filters decide who is even woken up: event type, subject prefix or suffix, or an advanced filter on a field inside the payload. Routing lives in the subscription, not in an if-statement in your handler.
• Failures are per subscriber. A broken shipping handler retries with exponential backoff while email and inventory are already done.
• A new consumer is a new subscription. Zero lines changed upstream. That is the whole argument.

The honest version, because reels tend to oversell this:
• Delivery is at-least-once and order is NOT guaranteed. If you need ordering, you wanted a queue with sessions.
• Retries run to a max delivery attempt count (30) and an event TTL (24h) by default — and some 4xx responses are treated as permanent, with no retry at all.
• Dead-lettering goes to a storage container and is OFF until you configure it. Service Bus gives you a DLQ for free; Event Grid does not.
• Webhook endpoints have to pass a validation handshake before anything is delivered.
• It is for discrete reactive events, not telemetry. 15,000 GPS pings a second is an Event Hubs problem.

Service Bus moves commands. Event Grid announces facts. Event Hubs carries streams. Most real systems run all three.

How many consumers are hard-coded into your checkout right now?

Follow for Azure & Cloud Engineering tips.

#azure #azureeventgrid #eventgrid #eventdrivenarchitecture #servicebus #eventhubs #systemdesign #microsoftazure #azurecloud #cloudarchitecture #microservices #az305 #msdevbuild

## Stage breakdown

01. **Order placed. Now what?** (2700ms) — Three things must happen next: send the email, reserve the stock, create the shipping label.
02. **Checkout is calling all three** (2900ms) — Sequential HTTP calls inside the request. The customer waits for work they never asked about.
03. **Add a fourth, redeploy checkout** (3000ms) — Loyalty points want the same event. Now you edit and ship the one service nobody wants to touch.
04. **Fix: Azure Event Grid** (2600ms) — Checkout publishes one event and returns. It does not know who is listening, and does not care.
05. **One event, many subscriptions** (3100ms) — The subscription is the fan-out unit. Event Grid pushes to each handler — nobody polls anything.
06. **Filters decide who gets what** (3100ms) — Event type, subject prefix, or a field inside the payload. A subscriber never sees what it filtered out.
07. **It retries, then dead-letters** (2900ms) — A failing handler gets exponential backoff for up to 24 hours — and only its own subscription is affected.
08. **New subscriber, zero changes** (2900ms) — Loyalty creates its own subscription. Nobody edited checkout, nobody redeployed, nobody was consulted.
09. **Which one? Grid, Hubs, Bus** (3200ms) — Commands to be done, facts to react to, and streams to be read. Three jobs, three services.
10. **Publish the fact. Let them subscribe** (2800ms) — The publisher should never hold a list of who cares. That list is the coupling.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
