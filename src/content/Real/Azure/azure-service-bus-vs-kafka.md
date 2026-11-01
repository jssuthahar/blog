# Somebody said “we need Kafka”.

Topic: Service Bus or Kafka — why "we need Kafka" is usually the wrong answer on Azure, and what the team actually needed.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

“We need Kafka.” It gets said in design reviews constantly, and it is an answer to a question nobody asked out loud. 🐘

Start here: Service Bus and Kafka are not two brands of the same thing. One is a broker that hands you an individual message and waits for you to complete it. The other is a distributed log that hands you a position in a file that keeps growing. They answer different questions, which is why comparing them feature-by-feature goes nowhere.

So ask what you actually need — and there are really only two answers.

1️⃣ Do a piece of work exactly once. Charge a card, email a receipt, generate an invoice.
That is a broker. Service Bus gives you PeekLock and per-message completion, automatic dead-lettering, sessions for FIFO, duplicate detection, scheduled messages and transactions. On Kafka, a dead-letter topic and a retry policy are things you write yourself.

And the constraint nobody mentions in the review: Kafka parallelism is capped by partition count. One consumer per partition, per consumer group. Eight partitions means eight useful consumers — number nine onwards sit idle — and repartitioning is not a free afternoon. Service Bus competing consumers scale on one queue with no partitions involved.

2️⃣ Read the same stream many times, and read it again next week.
That is genuinely a log, and this half of the argument is real. Offsets, retention, replay, many independent readers.

But on Azure, that is Event Hubs — and here is the part people miss: Event Hubs exposes an Apache Kafka protocol endpoint. Point your existing Kafka producers and consumers at port 9093 with SASL_SSL, change three config lines, and they keep working. You deleted the cluster, not the code.

So when should you actually run Kafka? Honestly:
• You need the ecosystem — Kafka Connect, Kafka Streams, ksqlDB.
• You need exactly-once stream processing with Kafka transactions.
• You are multi-cloud and portability matters more than managed services.
• Your team already runs it well and the operational cost is already paid.

Those are good reasons. "A queue sounded too simple" is not, and the bill is brokers, KRaft, rebalancing, retention disks and upgrades — a platform team, not a NuGet package.

Most teams asking for Kafka wanted a broker.

What did yours actually need?

Follow for Azure & Cloud Engineering tips.

#azure #kafka #azureservicebus #azureeventhubs #apachekafka #systemdesign #microsoftazure #azurecloud #cloudarchitecture #dataengineering #microservices #az305 #msdevbuild

## Stage breakdown

01. **Somebody said “we need Kafka”** (2700ms) — It gets said in design reviews constantly, and it is an answer to a question nobody asked out loud.
02. **Kafka is a log, not a queue** (2900ms) — Service Bus hands you one message and waits. Kafka gives you a position in a file that keeps growing.
03. **What do you actually need?** (2800ms) — Only two answers matter here: do a piece of work exactly once, or read the same stream many times.
04. **Work needs a broker** (3000ms) — Lock a message, complete it, dead-letter it if it will never work. Kafka makes you build every bit of that.
05. **Kafka caps your parallelism** (2900ms) — One consumer per partition, per group. Eight partitions means eight consumers, and repartitioning is not free.
06. **Streams need a log** (2800ms) — If several teams must read the same events, and read them again next week, you do want a log.
07. **On Azure that's Event Hubs** (3000ms) — It exposes a Kafka-protocol endpoint. Point your existing Kafka client at it and change three config lines.
08. **So when do you run Kafka?** (2900ms) — When you need Connect, Streams or ksqlDB, exactly-once stream processing, or portability off Azure entirely.
09. **Broker, log, or cluster** (3200ms) — Three destinations, and only one of them comes with servers you have to keep alive yourself.
10. **You probably wanted a broker** (2800ms) — And if you genuinely wanted a log, Azure already speaks Kafka without asking you to operate one.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
