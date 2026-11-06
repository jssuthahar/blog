/**
 * "Prompt makeover": the ways people commonly ask Copilot, each rebuilt as the
 * best way to ask. The better prompt is made of four parts (task, context,
 * constraints, done when) so a reader sees the pattern, not just one example.
 *
 * File paths are real files in MSDevBuild Eats, the reference app the course's
 * stories follow. Token counts are worked out live on the page.
 */
export type Part = 'task' | 'context' | 'constraint' | 'done';

export interface Makeover {
  id: string;
  emoji: string;
  label: string;
  ask: string;
  best: [Part, string][];
  why: string[];
}

export const PART_LABEL: Record<Part, string> = {
  task: 'Task',
  context: 'Context',
  constraint: 'Constraints',
  done: 'Done when',
};

export const MAKEOVERS: Makeover[] = [
  {
    id: 'fix',
    emoji: '🐞',
    label: '“fix this”',
    ask: 'fix this',
    best: [
      ['task', 'Fix the crash when the cart is empty on the checkout screen.'],
      ['context', '#file:lib/features/checkout/bloc/checkout_bloc.dart, stack trace selected.'],
      ['constraint', 'Keep the existing BLoC events.'],
      ['done', 'Show only the changed method.'],
    ],
    why: [
      'Names the bug and where it happens, so Copilot does not explore to find it.',
      'The stack trace points straight at the cause.',
      '“Only the changed method” keeps the output, the priciest part, short.',
    ],
  },
  {
    id: 'explain',
    emoji: '🔍',
    label: '“explain this code”',
    ask: 'explain this code',
    best: [
      ['task', 'Explain what CartBloc does when an item is removed,'],
      ['context', '#file:lib/features/cart/bloc/cart_bloc.dart'],
      ['constraint', 'for a developer new to BLoC,'],
      ['done', 'in 5 short bullet points.'],
    ],
    why: [
      'One behaviour, not the whole file.',
      'Says who the answer is for, so it is neither too basic nor too deep.',
      'A length limit stops a long essay you would only skim.',
    ],
  },
  {
    id: 'tests',
    emoji: '🧪',
    label: '“write tests”',
    ask: 'write tests for this',
    best: [
      ['task', 'Write unit tests for CartBloc: add item, remove item, empty cart.'],
      ['context', '#file:lib/features/cart/bloc/cart_bloc.dart, existing tests in test/bloc.'],
      ['constraint', 'Follow the style of the existing tests. No new packages.'],
      ['done', 'Tests only. Run them and report any failure.'],
    ],
    why: [
      'Lists the cases, so Copilot does not invent twenty of its own.',
      'Pointing at existing tests means the first version matches the team’s style.',
      'A clear finish line: tests written, run, and reported.',
    ],
  },
  {
    id: 'better',
    emoji: '✨',
    label: '“make it better”',
    ask: 'can you make this better',
    best: [
      ['task', 'Split the build method in checkout_screen.dart into smaller widgets.'],
      ['context', '#file:lib/features/checkout/presentation/checkout_screen.dart'],
      ['constraint', 'No changes to behaviour or layout.'],
      ['done', 'Show the new widgets and the updated build method only.'],
    ],
    why: [
      '“Better” can mean anything, so the model guesses and you retry.',
      'One concrete change, with what must not change.',
      'Only the new and changed code comes back, not the whole file.',
    ],
  },
  {
    id: 'broken',
    emoji: '🤯',
    label: '“why isn’t it working?”',
    ask: 'why is it not working??',
    best: [
      ['task', 'The cart total does not update after removing an item.'],
      ['context', '#file:lib/features/cart/bloc/cart_bloc.dart. Expected 2 items; the screen still shows 3.'],
      ['constraint', 'Find the cause before changing any code.'],
      ['done', 'Explain the cause in 2 sentences, then give the minimal fix.'],
    ],
    why: [
      'Describes what you see and what you expected: the two facts debugging needs.',
      'Asking for the cause first stops a rewrite that hides the real bug.',
      'A short, two-part answer instead of a long guess.',
    ],
  },
  {
    id: 'big',
    emoji: '🏗️',
    label: '“add Google login”',
    ask: 'add google login to my app',
    best: [
      ['task', 'Plan Google sign-in for the auth feature.'],
      ['context', '#file:lib/features/auth/presentation/login_screen.dart and the auth bloc.'],
      ['constraint', 'Follow the flutter-feature skill. No code yet.'],
      ['done', 'A numbered plan of at most 8 steps.'],
    ],
    why: [
      'A big feature asked in one go turns into a long, costly agent run.',
      'A plan is cheap, and you can correct it before any code is written.',
      'The skill gives the agent the repo’s structure, so it does not guess.',
    ],
  },
  {
    id: 'review',
    emoji: '👀',
    label: '“review my code”',
    ask: 'review my code pls',
    best: [
      ['task', 'Review this diff for null-safety and BLoC state bugs.'],
      ['context', 'The diff selected in the editor.'],
      ['constraint', 'Ignore formatting and naming.'],
      ['done', 'At most 5 issues, most serious first.'],
    ],
    why: [
      'Says what to look for, so the review is not a list of style nits.',
      'Only the diff is sent, not the whole project.',
      'A cap keeps the answer focused on what matters most.',
    ],
  },
  {
    id: 'polite',
    emoji: '🙏',
    label: '“Hi, could you please…”',
    ask: 'Hi Copilot! Hope you are doing well. Could you please help me, if possible, with adding a loading spinner? Thanks a lot!!',
    best: [
      ['task', 'Add a loading spinner to the checkout screen while the order is being placed.'],
      ['context', '#file:lib/features/checkout/presentation/checkout_screen.dart'],
      ['constraint', 'Use the existing theme colours.'],
      ['done', 'Show only the changed widget.'],
    ],
    why: [
      'Greetings and thanks do not change the answer; the missing details do.',
      'The spinner now has a place and a moment to appear.',
      'Every token goes into instructions the model can act on.',
    ],
  },
  {
    id: 'yesterday',
    emoji: '📅',
    label: '“continue from yesterday”',
    ask: 'continue what we did yesterday',
    best: [
      ['task', 'Continue the promo-code work.'],
      ['context', '#file:PLAN.md, with the decisions so far and the open tasks.'],
      ['constraint', 'Stay on the plan. Ask before changing it.'],
      ['done', 'Do step 3 of the plan, then stop.'],
    ],
    why: [
      'A new chat remembers nothing from yesterday; the plan file gives it the context in a few hundred tokens.',
      'Far cheaper than pasting, or re-sending, the whole old chat.',
      'A clear stopping point keeps the run short.',
    ],
  },
];
