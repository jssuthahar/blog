# A rack just lost power. The shop kept selling.

Topic: Azure Fault Domain — how spreading VMs across separate physical racks keeps an e-commerce site online when a rack loses power.
Runtime: ~50s across 16 stages (1080x1920)

## Caption

A rack in an Azure datacenter loses power mid-afternoon. Four servers go dark at once, and one of them is running your checkout.

The shop keeps selling.

That is a fault domain doing its job.

A fault domain is a group of hardware that shares one power source and one network switch — in practice, one physical rack. Everything in it fails together, so Azure treats it as a single unit of risk.

Put two VMs in an availability set and Azure spreads them across fault domains for you (2 or 3, depending on the region). You never pick the cabinet — you declare the intent and the platform does the placement.

Front them with Azure Load Balancer and the rest is automatic. The health probe on the dead VM stops answering, the load balancer pulls it out of the backend pool, and the surviving VM absorbs 100% of the traffic. Nobody is paged. Nobody edits DNS.

The honest version, because reels tend to oversell this:
• Failover is fast, not instant. The probe has an interval and a failure threshold, so requests already in flight to the dead VM do fail. The site stays up; a handful of requests do not.
• Two VMs on the same rack are not redundant, no matter how the architecture diagram looks. Same power feed, same switch, same outage.
• Fault domains protect you inside one datacenter. A whole-datacenter loss is what Availability Zones are for — separate buildings, separate power and cooling, and 99.99% instead of 99.95%.
• Update domains are the sibling concept: they cover planned platform maintenance, not hardware failure.

And the classic own-goal: if session state lives in the web server memory, failover keeps the site up but logs half your shoppers out anyway.

SLA follows the design — 99.95% for two or more VMs in an availability set, against 99.9% for a single VM on premium storage.

How many of your production VMs are sitting in the same fault domain right now?

Follow for Azure & Cloud Engineering tips.

#azure #faultdomain #availabilityset #highavailability #azurevm #loadbalancer #microsoftazure #azurecloud #cloudarchitecture #devops #sre #systemdesign #msdevbuild

## Stage breakdown

01. **12,000 shoppers. One checkout** (3000ms) — A live e-commerce site on Azure. Orders are landing, nobody is thinking about hardware.
02. **Two servers, two racks** (3000ms) — VM1 sits in rack A, VM2 in rack B. The load balancer splits every request between them.
03. **Rack A just lost power** (3200ms) — Not a reboot. Not a patch. The power feed to an entire cabinet is gone.
04. **Four servers gone at once** (3000ms) — A rack is a shared blast radius. One power feed, one switch, one cooling loop — and everything in it drops together.
05. **This is where most sites die** (2800ms) — Half the capacity is gone mid-checkout. You would expect the error page right about now.
06. **The health probe fails** (3000ms) — Azure Load Balancer probes every backend on a fixed interval. VM1 stops answering, so it leaves the pool.
07. **Every request goes to Rack B** (3200ms) — Within seconds the surviving backend is carrying 100% of the traffic. Same URL, same cart, same session.
08. **The shop never went down** (3200ms) — An entire rack is dark and the checkout is still taking money. That is the whole trick.
09. **Azure Fault Domain** (3400ms) — That rack has a name. A fault domain is a group of hardware that shares one power source and one network switch.
10. **Separate power, switch and cooling** (3000ms) — Two fault domains share nothing physical. A failure in one has no path into the other.
11. **Azure picks the racks for you** (3000ms) — Put the VMs in an availability set and Azure spreads them across 2–3 fault domains. You never choose a cabinet.
12. **Now put both VMs in one rack** (3200ms) — Two VMs, same app, same load balancer — but both landed in fault domain 0. It looks identical from the portal.
13. **Same power cut. Site is gone** (3000ms) — One cabinet, one failure, zero surviving backends. The load balancer has nowhere left to send anyone.
14. **Fault domains fix that at deploy time** (3600ms) — Nothing about the VMs changed. Only where Azure put them — and that is decided before the outage, not during it.
15. **Fault Domain = Hardware Failure Protection** (3400ms) — Rack power, top-of-rack switch, a dead host — spread across fault domains, none of them is your outage.
16. **Follow for Azure & Cloud Engineering Tips** (3000ms) — One architecture idea per reel, from the failure backwards. Save this one for your next design review.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
