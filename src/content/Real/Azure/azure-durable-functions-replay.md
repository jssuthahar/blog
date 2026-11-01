# Your Durable Function runs many times

Topic: How Azure Durable Functions replay your orchestrator code
Runtime: ~19s across 8 stages (1080x1920)

## Caption

Azure Durable Functions do not run your orchestrator once.

They run it from the top again after every activity, replaying completed steps from an event history — which is exactly why DateTime.UtcNow quietly breaks it.

Did you know your orchestrator code re-executes?

#azure #dotnet #serverless #durablefunctions #azurefunctions #cloudcomputing #softwareengineering #systemdesign #csharp #devcommunity #msdevbuild

## Stage breakdown

01. **It did not run once** (2400ms) — Your orchestrator function executes again and again. You only ever see the final result.
02. **It looks like normal code** (2200ms) — Three awaits, top to bottom. Nothing here hints that it gets re-executed.
03. **It stops at the first await** (2400ms) — The runtime schedules the activity, then the function exits completely. No thread waits around.
04. **The result lands in history** (2400ms) — When the activity finishes, its output is appended to an event history in storage.
05. **Then it runs again** (2600ms) — From line one. This time the first await returns instantly from history instead of calling anything.
06. **One step deeper each time** (2400ms) — Every completed activity extends the history, so each replay gets further before it stops.
07. **This is why DateTime breaks** (2400ms) — Anything non-deterministic returns a new value on every replay, so your code stops matching history.
08. **Keep the replay invisible** (2400ms) — Use the context APIs for time and GUIDs, and the whole re-execution stays hidden from you.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
