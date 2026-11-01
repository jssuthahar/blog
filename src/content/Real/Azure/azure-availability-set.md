# Azure is rebooting your server. Nobody notices.

Topic: Azure Availability Set — how fault domains, update domains and a load balancer keep an e-commerce site online while Azure patches the servers under it.
Runtime: ~61s across 14 stages (1080x1920)

## Caption

A shop running on one VM. Azure schedules a security patch on the host, the VM reboots, and every shopper gets "Server Unavailable".

That is not a technical incident. It is abandoned carts, refund requests, and a screenshot of your error page circulating long after the server came back.

An Azure Availability Set fixes it at deploy time, and it costs nothing — you pay only for the VMs.

Put VM1 and VM2 in the same availability set and Azure spreads them across:
• Fault domains — separate rack, separate power feed, separate network switch. A rack failure cannot take both.
• Update domains — separate patch groups. During planned platform maintenance Azure reboots one update domain at a time and waits (roughly 30 minutes) before starting the next.

Front them with Azure Load Balancer. It health-probes each VM continuously. When VM1 goes down for its patch the probe fails, the load balancer pulls VM1 out of the backend pool, and VM2 absorbs 100% of the traffic. Nobody gets paged. Nobody edits DNS. The shopper checking out never sees anything.

The SLA follows the design: 99.95% for two or more VMs in an availability set, against 99.9% for a single VM on premium storage.

The catch worth knowing: an availability set protects you inside one datacenter — rack failures, host failures, planned maintenance. It does not protect you if the whole datacenter goes. That is what Availability Zones are for, and they take you to 99.99%.

And your VMs still share nothing. If session state lives in a web server's memory, half your shoppers get logged out on failover anyway.

How many of your production VMs are running alone right now?

#azure #availabilityset #highavailability #azurevm #loadbalancer #microsoftazure #azurecloud #cloudarchitecture #devops #sre #systemdesign #msdevbuild

## Stage breakdown

01. **One server. Every order goes through it** (3500ms) — The shop is live and selling. Right now nothing about this looks like a problem.
02. **Azure has to patch the host** (3500ms) — Security updates land on the physical host underneath. Your VM reboots — and it is not optional.
03. **Server Unavailable** (3500ms) — Problem: server maintenance causes downtime. Every shopper hits an error page and leaves.
04. **Put two VMs in an Availability Set** (3500ms) — VM1 and VM2 run the same shop. The set is Azure’s promise that it will never take both down at once.
05. **One address in front of both** (3400ms) — Azure Load Balancer owns the public IP and health-probes each VM before it sends a single request there.
06. **Fault domains and update domains** (3600ms) — Different rack, power and switch. And Azure only ever reboots one update domain at a time.
07. **Requests start arriving** (5000ms) — Shoppers hit one public address. They have no idea how many servers are behind it.
08. **The load balancer splits the traffic** (5000ms) — Roughly half to VM1, half to VM2 — and it keeps probing both the entire time.
09. **Both green. Orders going through** (5000ms) — Two servers doing the work of one. The spare capacity is a bonus, not the point.
10. **Azure starts maintenance on VM1** (4600ms) — Update domain 0 goes first. VM1 drains and reboots — update domain 1 is not touched.
11. **Traffic Automatically Redirected** (5000ms) — The health probe fails, the load balancer drops VM1 from the pool, and VM2 takes 100%.
12. **The shopper never finds out** (4400ms) — Same URL, same cart, same checkout. No error page, no support ticket, no abandoned basket.
13. **VM1 rejoins. Only then does UD 1 go** (5000ms) — The probe passes, traffic rebalances — and Azure waits for that before touching VM2 at all.
14. **High Availability Achieved** (6000ms) — Two VMs, one availability set, one load balancer. Azure backs it with a 99.95% SLA.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
