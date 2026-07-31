# The reference project

Articles on this site use **one real application** for implementation steps and
code samples instead of isolated snippets. A reader should be able to read the
concept, open the source, run the live app, and install the mobile build —
without assembling a project of their own first.

## MSDevBuild Eats — Flutter food delivery app

| | |
| --- | --- |
| **Source code** | <https://github.com/jssuthahar/food-delivery-app> |
| **Live web** | <https://jssuthahar.github.io/food-delivery-app/> |
| **Android build** | <https://appdistribution.firebase.dev/i/00432c5aa60de58b> |
| **Local clone** | `~/Documents/GitHub/food-delivery-app` |

Sign in with `customer@msdevbuild.com` / `demo1234`. Also
`partner@msdevbuild.com` (restaurant dashboard) and `rider@msdevbuild.com`
(delivery rider), same password.

It runs with **no API keys and no Firebase project** — a seeded in-memory
backend stands in — which is what makes it usable as an article exercise.

## What it actually contains

Verify against the repo before citing any of this; it changes.

- **Flutter**, Dart SDK `>=3.5.0 <4.0.0`, one codebase for web, Android, iOS and tablet
- **Clean Architecture** — `lib/domain/` (pure Dart), `lib/data/`, `lib/features/<feature>/`, `lib/core/`
- **BLoC / Cubit** (`flutter_bloc`, `bloc_concurrency`) — **not Riverpod, not Provider**
- **get_it** DI graph in `lib/app/di/service_locator.dart`; blocs are deliberately not registered in it
- **go_router** in `lib/app/router/`
- `Result<T>` (`Success` / `FailureResult`) instead of throwing across the repository boundary; `mapErrorToFailure` is the single translation point
- Backend swapped at the repository interface via `AppConfig.backend` — `DemoDataSource` or `FirestoreDataSource`
- Tests: `flutter_test` + `bloc_test` + `mocktail` under `test/`
- Three roles in one app: customer ordering flow, restaurant partner dashboard, delivery rider dashboard
- Repo docs worth linking: [`docs/ARCHITECTURE.md`](https://github.com/jssuthahar/food-delivery-app/blob/main/docs/ARCHITECTURE.md), `docs/SETUP.md`, `docs/DEPLOYMENT.md`
- Committed instructions file: [`.github/copilot-instructions.md`](https://github.com/jssuthahar/food-delivery-app/blob/main/.github/copilot-instructions.md)

## How to use it in an article

Whenever an article explains GitHub Copilot, AI agents, Flutter, architecture,
testing, CI/CD, or anything else the app demonstrates:

1. **Ground the code samples in it.** Real file paths, real class names, real
   conventions. Read the file in the local clone before quoting it — never
   invent a path.
2. **Put the three links near the top**, before the reader needs them. A
   `<Callout type="tip">` in an `.mdx` post is the established shape:

   ```mdx
   import Callout from '../../../components/mdx/Callout.astro';

   <Callout type="tip" title="Follow along in a real app, not a snippet">
   ...
   - **Source code** — [github.com/jssuthahar/food-delivery-app](https://github.com/jssuthahar/food-delivery-app)
   - **Live web** — [jssuthahar.github.io/food-delivery-app](https://jssuthahar.github.io/food-delivery-app/)
   - **Android build** — [download and install](https://appdistribution.firebase.dev/i/00432c5aa60de58b)
   </Callout>
   ```

3. **Give the reader something to run**, not just read — a clone command, a
   prompt to try, a before/after to compare. The article's job is to get them
   into the app.
4. **Point at the live web build and the Android build** where they add
   something: comparing one codebase across platforms, seeing a flow work
   before reading the code behind it.

The reader path every article should support: read the concept → see the
implementation in the repo → try the live web app → install the Android build.

## When not to use it

Don't force it. A .NET, Azure, or C# article should use a .NET example — that
is what the reader came for. Reach for the food delivery app when the topic is
Flutter, mobile, cross-platform, or tool-level (Copilot, agents, instructions,
CI) where any real repo works and a runnable one works better. Keeping a
secondary .NET or MAUI example alongside it is fine and often better.
