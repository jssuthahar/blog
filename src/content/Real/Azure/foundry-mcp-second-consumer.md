# Function tool or MCP? Count the consumers.

Topic: What MCP (Model Context Protocol) is for Microsoft Foundry agents: how it differs from a function tool, consuming remote MCP servers with an approval loop, and publishing your own tools through a Toolbox.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: MCP vs function tools in Foundry
Published: 2026-10-01

## What you will learn

- How MCP differs from a function tool
- Why approval matters for remote servers
- When MCP is not worth it

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Function tool or MCP? Count the consumers.
```

**YouTube Shorts — title**

```
MCP vs function tools in Foundry #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Function tool or MCP server? Count the consumers. 🔌

A function tool belongs to one Microsoft Foundry agent. An MCP server is a tool layer any agent or client can discover: another agent, GitHub Copilot, a script.

MCP adds a server, a version and a protocol. Until a second consumer appears, it buys you nothing.

When you do use it: approval on always for servers you did not write, allow-list the three tools you need, and remember your logic now runs somewhere a remote caller can reach.

Full article: blog.msdevbuild.com/blog/mcp-model-context-protocol-azure-ai-foundry-agents

Follow for AI engineering tips.

#mcp #modelcontextprotocol #aiagents #microsoftfoundry #azureai #dotnet #aicoding #msdevbuild
```

**SEO keywords**

```
mcp vs function tools in foundry, model context protocol, what is mcp, mcp vs function calling, microsoft foundry mcp, mcp server approval, foundry toolbox, mcp, modelcontextprotocol, aiagents, microsoftfoundry, azureai, dotnet, aicoding, msdevbuild
```

## Stage breakdown

01. **A tool belongs to one agent** (5200ms) — A function tool is declared on one agent definition.
02. **Then a second consumer** (5400ms) — The support console wants the same tools. Copy the schemas again?
03. **MCP: a tool layer** (5600ms) — An MCP server exposes tools any agent or client can discover and call.
04. **Preview surface** (5200ms) — Approval and Toolbox types need 2.1.0-beta.4. The shape can change.
05. **Approval before the call** (5400ms) — With approval on, the model asks first and your code decides.
06. **Allow-list the tools** (5200ms) — A server exposes forty tools; you need three. Take three.
07. **Your logic, now reachable** (5400ms) — An MCP server runs where a remote caller can reach it. Security is re-established there.
08. **Count the consumers** (5800ms) — One consumer: function tool. A second appears: that is the day.
09. **Count the consumers, then decide** (4800ms) — MCP buys nothing until a second consumer appears. Then it buys a lot.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
