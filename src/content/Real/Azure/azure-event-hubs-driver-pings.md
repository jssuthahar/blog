# 15,000 GPS pings a second. Do not put that in a queue.

Topic: Azure Event Hubs — why 60,000 drivers reporting GPS every four seconds belongs in a partitioned event stream and not in a queue.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

60,000 drivers. One GPS ping every 4 seconds. That is 15,000 events a second and 1.3 billion a day — and the first instinct is always "put it on a queue". 🚕

It is the wrong shape, and not for the reason people say.

The throughput is the boring objection. The real one is fan-out: four teams want that same ping — the live map, the ETA model, fraud scanning, and analytics. A queue hands each message to exactly one consumer and deletes it on completion. One team wins, three get nothing. Run four queues and you are storing 1.3 billion events four times, and you still cannot replay them.

Azure Event Hubs is a different thing entirely — an append-only log:
• Producers append. Nothing is handed out, nothing is locked, nothing is deleted on read.
• A partition key (driverId here) hashes to one partition, so every ping from one driver lands in the same partition, in order.
• Consumers read by offset. Each consumer group keeps its own position over the same events, so four teams read one copy of the data.
• A slow consumer is a lag metric, not an outage. fraud-scan can sit 41 seconds behind while the live map stays at the head.
• Anything inside the retention window can be replayed. A team that shows up tomorrow reads yesterday, with no re-ingest.
• Capture writes the whole stream to Blob or ADLS in Avro without you writing a consumer at all.

The honest version, because reels tend to oversell this:
• Ordering is per partition, never global. If you need global ordering you are asking the wrong question.
• Pick the partition key badly and you get a hot partition — one lane doing all the work while the rest idle.
• Delivery is at-least-once against a checkpoint. A restarted consumer re-reads from the last checkpoint, so the handler must tolerate duplicates.
• Retention is 1-7 days on Standard (longer on Premium/Dedicated). Past the window the events are gone. A stream is not a database.
• Partition count is a decision you make up front — plan it, do not discover it.

Most real systems use both. "Charge this card" is a command and belongs in a queue. "Driver moved here" is a fact and belongs in a log.

Which one is your telemetry sitting in right now?

Follow for Azure & Cloud Engineering tips.

#azure #azureeventhubs #eventhubs #eventstreaming #servicebus #systemdesign #microsoftazure #azurecloud #cloudarchitecture #dataengineering #kafka #az305 #msdevbuild

## Stage breakdown

01. **60,000 drivers. Every 4 seconds** (2800ms) — Every car reports where it is. Nobody asked for a reply, and nothing needs a lock.
02. **1.3 billion pings a day** (2800ms) — Each one is a few hundred bytes, and each one is worthless four seconds later.
03. **A queue is the wrong tool** (3000ms) — Four teams need the same ping. A queue hands each message to exactly one consumer, then deletes it.
04. **Fix: Azure Event Hubs** (2600ms) — Not a mailbox — an append-only log. Producers append, and nothing is handed out or removed.
05. **One log, split into partitions** (3100ms) — The partition key hashes to a lane. Every ping from one driver lands in the same lane, in order.
06. **Reading doesn't delete** (3100ms) — Each consumer group keeps its own offset over the same events. Four teams, one copy of the data.
07. **A slow reader can't hurt the rest** (2900ms) — fraud-scan is 41 seconds behind. The live map is still at the head, and no event was dropped.
08. **Replay yesterday, no re-ingest** (2900ms) — A new team rewinds to an old offset inside the retention window and reads the same events again.
09. **Queue vs stream** (3200ms) — One is a job to be done and destroyed. The other is a fact to be read by anyone, twice if needed.
10. **Commands queue. Facts stream** (2800ms) — “Charge this card” belongs in a queue. “Driver moved here” belongs in a log everyone can read.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
