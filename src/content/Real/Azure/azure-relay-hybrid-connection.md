# Security said no inbound ports.

Topic: Azure Relay Hybrid Connections — reaching an on-premises service from the cloud without opening a single inbound firewall port.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

The cloud app needs live stock from an ERP sitting in a rack in Chennai, on 10.20.4.11:8080. Every answer you propose is a change to somebody else's network — and security says no. 🔒

Open 443 inbound. Get a public IP. Build a DMZ. Buy a certificate. All refused, and correctly: a public door into the datacenter is the thing nobody signs off.

The heavier options are not wrong, just heavy. A VPN gateway or ExpressRoute joins two networks — sizing, routing, address plans, change windows — so that one app can read one number. And now a whole subnet is reachable when you wanted one endpoint.

Azure Relay Hybrid Connections flips the direction:
• The on-prem service is the listener. It opens an outbound WebSocket over TLS on 443 to <namespace>.servicebus.windows.net and holds it open. That rule was already allowed — every network lets a server make an outbound HTTPS call.
• The cloud app is the sender. It calls a public relay endpoint and the request is forwarded down the socket the ERP opened itself.
• No inbound rule, no public IP, no DMZ, no NAT entry, no VPN. Nothing on the firewall changes.
• You expose one hybrid connection, not a subnet. Listen and Send are separate SAS rights, so a caller cannot register itself as a listener.
• The listener is a library inside your app — nothing is installed on the network, and up to 25 listeners can share one hybrid connection for redundancy.

The honest version, and it is the opposite of everything else in this series:
• Relay does not buffer. There is no store-and-forward. If the listener is down, the caller fails immediately — no queue, no retry, no message waiting anywhere.
• It is a hop, so it costs latency. This is a path for calls, not for bulk data transfer.
• The connection is only as reliable as the on-prem process. If that box reboots nightly, your cloud app has a nightly outage.
• WCF Relay is the legacy flavour and .NET Framework only. Hybrid Connections is the one to start from.
• And if the answer can wait, you did not want a synchronous call at all — put a queue in front and let the on-prem side pull.

Connectivity, not messaging. Knowing which one you need is the whole question.

How many inbound rules are open today for something a listener could have handled?

Follow for Azure & Cloud Engineering tips.

#azure #azurerelay #hybridconnections #hybridcloud #networksecurity #servicebus #systemdesign #microsoftazure #azurecloud #cloudarchitecture #onpremises #az305 #msdevbuild

## Stage breakdown

01. **Your ERP is behind the firewall** (2700ms) — The cloud app needs live stock levels. The system that has them is on a private address in Chennai.
02. **Security says no inbound port** (2900ms) — Open 443 inbound, get a public IP, build a DMZ, buy a certificate. Every answer is a change to the network.
03. **A VPN is a big hammer** (2900ms) — Not wrong — just network-level. You joined two networks to let one app read one number.
04. **Fix: Azure Relay** (2600ms) — A public rendezvous point in Azure that both sides connect out to. Nothing dials in to anybody.
05. **The on-prem service dials out** (3100ms) — An outbound TLS connection on 443 to the relay, held open. That rule was already allowed.
06. **The cloud calls the relay** (3100ms) — The request goes to a public Azure endpoint and comes back down the socket the ERP already opened.
07. **One service, not your network** (2800ms) — The relay exposes a single hybrid connection. Listen and Send are separate keys, so a caller cannot register.
08. **No listener, no call** (2900ms) — Relay is connectivity, not messaging. It buffers nothing — if the ERP is down, the caller fails now.
09. **Relay, VPN or queue** (3200ms) — Join two networks, join one service, or join nothing at all and let a queue hold the request.
10. **Dial out, don't open in** (2800ms) — The safest inbound rule is the one you never had to write. Let the private side start the conversation.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
