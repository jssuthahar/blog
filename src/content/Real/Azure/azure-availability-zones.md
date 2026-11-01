# One server goes down. Nobody can buy anything.

Topic: Why a high-traffic shopping app needs Azure Availability Zones — the cost of a single-server outage, and how three physically separate zones in one region remove it
Runtime: ~29s across 10 stages (1080x1920)

## Caption

A shopping app with millions of users. One server. Maintenance starts, the box goes offline, and nobody can log in.

That outage is not a technical event. It is lost customers, lost revenue and screenshots of your error page living on social media long after the server is back.

Azure Availability Zones fix it at the architecture level. Every zone-enabled region is three or more physically separate datacenters, each with its own power, cooling and network, under 2 ms apart. Put an instance in each one, front them with a zone-redundant load balancer, replicate the database across them — and a whole datacenter can fail mid-checkout while zones 1 and 3 absorb the traffic.

That 2 ms is the whole trick. Zones are close enough to replicate synchronously: the write goes to all three, and the commit is only acknowledged once every zone has it. Lose a zone and there is nothing to recover. RPO zero. Across regions the latency is far too high to wait for, so that replication is asynchronous and failover costs you data.

Which is also the catch: your app instances share nothing. Session state in a web server’s memory dies with its zone. Move state into zone-redundant services — ZRS storage, a zone-redundant database, zone-redundant Redis — or a third of your customers get logged out anyway.

The SLA follows the design: 99.9% for a single VM, 99.99% for two or more spread across zones. 8.7 hours of downtime a year, or 52 minutes.

Is your production workload running in one zone right now?

#azure #availabilityzones #highavailability #cloudarchitecture #microsoftazure #azurecloud #devops #sre #systemdesign #cloudcomputing #dotnet #msdevbuild

## Stage breakdown

01. **Millions of shoppers, one shop** (2600ms) — Logins, carts and checkouts — every one of them lands on the same server.
02. **Everything depends on that one box** (2700ms) — Traditional design: users, one server, one database. No spare, no second copy.
03. **Maintenance starts. The server goes offline** (2900ms) — A patch, a reboot, a failed power supply — it does not matter which. The box stops answering.
04. **Customers cannot log in** (2800ms) — The architecture diagram fails silently. Your customer sees a spinner, then an error, then leaves.
05. **This is what the outage costs** (2900ms) — Lost customers, lost revenue, damaged reputation — the bill keeps growing while the box reboots.
06. **Azure splits a region into zones** (3000ms) — Every zone-enabled Azure region has three or more physically separate datacenters — own power, own cooling, own network.
07. **Run the shop in all three** (3000ms) — One load balancer in front, an app instance in every zone, and the database replicated across them.
08. **Zones share data synchronously** (3200ms) — Under 2 ms apart, so a write can wait for all three. The commit is only acknowledged once every zone has it — zero data loss.
09. **Zone 2 fails. The shop stays open** (3100ms) — The load balancer stops sending traffic there within seconds. Zones 1 and 3 absorb it — logins keep working.
10. **One server: 99.9%. Three zones: 99.99%** (3000ms) — Azure backs it with an SLA — 8.7 hours of downtime a year becomes 52 minutes, for the price of spreading out.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
