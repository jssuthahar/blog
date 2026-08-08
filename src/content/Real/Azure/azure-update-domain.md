# Azure rebooted the server. The bank never noticed.

Topic: Azure Update Domain — how Azure reboots your VMs one group at a time for planned maintenance while a load balancer keeps a banking app online.
Runtime: ~54s across 16 stages (1080x1920)

## Caption

Azure rebooted the server running a banking app at peak hour. The payments counter never dropped to zero.

That is an update domain doing its job.

An update domain is a group of VMs in an availability set that Azure reboots together during planned platform maintenance — host OS patches, hypervisor upgrades, the work Microsoft has to do under your VM whether you like it or not.

The rule that makes it safe is boring and absolute: one update domain at a time. Azure takes UD 0 down, patches it, waits for it to come back healthy — roughly 30 minutes — and only then starts UD 1. Your VMs are spread across those domains automatically, 5 by default and up to 20 if you configure it.

Front them with Azure Load Balancer and the rest is automatic. The health probe on the rebooting VM stops answering, it leaves the backend pool, and the surviving VM absorbs the traffic. Then it swaps back. Nobody is paged. Nobody edits DNS.

The honest version, because reels tend to oversell this:
• Failover is fast, not instant. The probe has an interval and a failure threshold, so requests already in flight to the rebooting VM do fail.
• With two VMs you spend the entire maintenance window at 50% capacity. If one VM cannot carry peak load on its own, update domains just moved your outage rather than removing it. Size for N-1.
• Azure patches the host. The OS inside your VM is still yours — that is Azure Update Manager or your own tooling, not update domains.
• Session state in web server memory will log half your users out on the reboot even though the app stayed up.
• Update domains are the planned half of the story. Fault domains are the unplanned half — separate power feeds and switches for the failure nobody scheduled. One availability set gives you both.

SLA follows the design: 99.95% for two or more VMs in an availability set, against 99.9% for a single VM on premium storage.

When was the last time you actually watched what happens to your app during an Azure maintenance window?

Follow for Azure & Cloud Engineering tips.

#azure #updatedomain #availabilityset #highavailability #azurevm #loadbalancer #microsoftazure #azurecloud #cloudarchitecture #devops #sre #systemdesign #msdevbuild

## Stage breakdown

01. **9,400 customers. One payments app** (3200ms) — A retail banking app on Azure. Transfers are clearing, nobody is thinking about servers.
02. **Two VMs behind one load balancer** (3200ms) — VM1 and VM2 sit in the same availability set. Every request is split between them.
03. **Azure schedules host maintenance** (3400ms) — Not a crash. A planned platform update — the physical host under your VM needs patching and a reboot.
04. **VM1 starts installing updates** (3600ms) — Azure takes the first update domain offline. VM1 stops answering and begins the host patch.
05. **Everyone expects the app to drop** (3000ms) — Half the capacity is mid-reboot at peak hour. This is the moment the error page usually shows up.
06. **The load balancer already moved** (3400ms) — The health probe on VM1 stops answering, so Azure Load Balancer drops it from the backend pool.
07. **VM2 takes 100% of the traffic** (3400ms) — Same URL, same session, same balance on screen. The surviving VM simply absorbs the load.
08. **VM1 reboots and comes back** (3400ms) — The host restarts, the VM boots, the probe answers again — and the load balancer puts VM1 straight back in.
09. **Only now does Azure touch VM2** (3600ms) — Azure waits for the first update domain to recover — up to 30 minutes — before starting the next one.
10. **VM1 serves while VM2 patches** (3400ms) — The roles swap cleanly. The freshly patched VM carries every request while the other one reboots.
11. **Both VMs patched. Nobody noticed** (3400ms) — Two host reboots inside one maintenance window, and the payments counter never dropped to zero.
12. **Azure Update Domain** (3600ms) — That sequence has a name. An update domain is a group of VMs Azure reboots together during planned maintenance.
13. **One update domain at a time** (3600ms) — Five by default, up to twenty. Azure walks them in order and waits about 30 minutes after each one.
14. **Update domain vs fault domain** (3400ms) — Update domains cover the maintenance Azure schedules. Fault domains cover the hardware failure nobody schedules.
15. **Update Domain = Planned Maintenance Without Downtime** (3600ms) — Spread across update domains, a platform reboot becomes a rolling restart instead of an outage.
16. **Follow for Azure & Cloud Engineering Tips** (3200ms) — One architecture idea per reel, from the failure backwards. Save this one for your next design review.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
