/**
 * "The idea in 3 frames": a short looping storyboard beside each step's plain
 * answer. Each frame shows one beat of the idea with a few simple visuals, so a
 * beginner sees it before reading the details.
 *
 * Visuals are deliberately few: token chips, an equation of pills, bars, and a
 * big emoji. Pills are written "kind:text", where kind is in, out, cache, total
 * or warn. Bar widths are relative (0–100) and illustrative unless a caption
 * gives a figure, and figures match the tool's own data.
 */
export type Kind = 'in' | 'out' | 'cache' | 'total' | 'warn' | 'id';

export type Visual =
  | { chips: string[]; kind?: Kind }
  | { eq: string[] }
  | { bars: [label: string, width: number, kind?: Kind][] }
  | { emoji: string; label: string };

export interface Frame {
  caption: string;
  show: Visual[];
}

export const STORIES: Record<string, Frame[]> = {
  start: [
    { caption: 'Everything you send is input', show: [{ chips: ['Your prompt', '+ instructions', '+ tools', '+ files'], kind: 'in' }] },
    { caption: 'Everything written back is output, about 5× the price', show: [{ chips: ['def', ' add', '(a, b):', ' return', ' a + b'], kind: 'out' }] },
    { caption: 'Tokens × the model’s price = AI Credits', show: [{ eq: ['in:12,000 in', '+', 'out:800 out', '=', 'total:3.2 credits'] }] },
  ],
  learn: [
    { caption: 'Text is cut into small pieces', show: [{ chips: ['Cop', 'ilot', ' counts', ' every', ' token'], kind: 'in' }] },
    { caption: 'Each piece becomes an ID number', show: [{ chips: ['60575', '56775', '28991', '1753', '6602'], kind: 'id' }] },
    { caption: 'About 4 characters make 1 token', show: [{ eq: ['in:c', 'in:o', 'in:d', 'in:e', '→', 'total:1 token'] }] },
  ],
  picture: [
    { caption: 'You write a tiny note', show: [{ emoji: '📝', label: '10 tokens' }] },
    { caption: 'Copilot packs a whole parcel around it', show: [{ bars: [['Your note', 2], ['Instructions', 20], ['Tools', 18], ['History', 30], ['Files', 40]] }] },
    { caption: 'You pay for the whole parcel', show: [{ emoji: '📦', label: '≈ 12,000 tokens' }] },
  ],
  generate: [
    { caption: 'The model reads everything so far', show: [{ chips: ['Write', ' a', ' Python', ' function'], kind: 'in' }] },
    { caption: '…then adds one token at a time', show: [{ chips: ['def', ' add', '(a', ','], kind: 'out' }] },
    { caption: 'It stops when it predicts the end token', show: [{ chips: ['def', ' add', '(a, b):', ' return a + b', '⟨end⟩'], kind: 'out' }] },
  ],
  calculator: [
    { caption: 'Plain English splits into few pieces', show: [{ chips: ['Add', ' input', ' validation', ' to', ' Create', 'Order'], kind: 'in' }] },
    { caption: 'Code splits into many more', show: [{ chips: ['public', ' async', ' Task', '<', 'Order', '?>', ' Get', 'Async', '('], kind: 'in' }] },
    { caption: 'Tokens per 100 characters', show: [{ bars: [['English', 48], ['C# code', 55], ['Test log', 69], ['JSON', 100]] }] },
  ],
  ask: [
    { caption: 'A vague prompt makes the model guess', show: [{ emoji: '🤷', label: '“fix my code”' }] },
    { caption: 'Guessing means retries, each bigger than the last', show: [{ bars: [['Try 1', 45, 'warn'], ['Try 2', 70, 'warn'], ['Try 3', 100, 'warn']] }] },
    { caption: 'A focused prompt gets it first time', show: [{ chips: ['Task', 'Context', 'Constraints', 'Done when'], kind: 'cache' }] },
  ],
  continue: [
    { caption: 'Same task, minutes later: the history comes from cache', show: [{ eq: ['cache:history at ~10%', '+', 'in:new question', '=', 'total:cheap'] }] },
    { caption: 'After an hour, the cache has expired', show: [{ eq: ['warn:history at 100%', '+', 'in:new question', '=', 'warn:expensive'] }] },
    { caption: 'New topic? New chat, with a short summary', show: [{ chips: ['📝 summary', '+ new question'], kind: 'cache' }] },
  ],
  billing: [
    { caption: 'Old: every prompt was 1 request × a multiplier', show: [{ eq: ['in:1 prompt', '×', 'in:9', '=', 'warn:9 requests'] }] },
    { caption: 'New: you pay for the tokens each request uses', show: [{ eq: ['in:tokens', '×', 'in:price', '=', 'total:AI Credits'] }] },
    { caption: '100 AI Credits make one dollar', show: [{ emoji: '🪙', label: '1 credit = $0.01' }] },
  ],
  patterns: [
    { caption: 'Message 1 is small', show: [{ bars: [['Msg 1', 14]] }] },
    { caption: 'Message 5 re-sends messages 1 to 4', show: [{ bars: [['Msg 1', 14], ['Msg 3', 42], ['Msg 5', 70]] }] },
    { caption: 'The total grows much faster than the chat', show: [{ bars: [['Msg 1', 14], ['Msg 3', 42], ['Msg 5', 70], ['Msg 7', 100, 'warn']] }] },
  ],
  scenarios: [
    { caption: 'Before: a whole folder rides on every turn', show: [{ bars: [['Every turn', 100, 'warn']] }] },
    { caption: 'After: only the two files that matter', show: [{ bars: [['Every turn', 12]] }] },
    { caption: 'In the context-bloat case, 77% fewer credits', show: [{ emoji: '✂️', label: '−77%' }] },
  ],
  customize: [
    { caption: 'Instructions ride on every request', show: [{ chips: ['📘 600', '📘 600', '📘 600', '📘 600'], kind: 'in' }] },
    { caption: 'A skill loads its steps only when needed', show: [{ chips: ['🧰 60', '🧰 60', '🧰 1,200', '🧰 60'], kind: 'cache' }] },
    { caption: 'A hook trims noisy tool output', show: [{ eq: ['warn:9,000-token log', '→', 'total:400 kept'] }] },
  ],
  project: [
    { caption: 'Nothing set up: the agent explores and guesses', show: [{ bars: [['Nothing set up', 100, 'warn']] }] },
    { caption: 'Each addition removes some waste (illustrative)', show: [{ bars: [['Nothing set up', 100, 'warn'], ['+ Instructions', 72], ['+ Agents', 56]] }] },
    { caption: 'Same task, far fewer tokens', show: [{ bars: [['+ Skills', 48], ['+ Hooks', 42]] }] },
  ],
  guide: [
    { caption: 'Every request needs it? Instructions', show: [{ eq: ['in:every request', '→', 'total:📘 Instructions'] }] },
    { caption: 'Only some tasks need the recipe? A skill', show: [{ eq: ['in:some tasks', '→', 'total:🧰 Skill'] }] },
    { caption: 'Must always happen? A hook', show: [{ eq: ['in:always enforce', '→', 'total:🪝 Hook'] }] },
  ],
  'tips-quiz': [
    { caption: 'Pack light: attach only the code that matters', show: [{ emoji: '🎒', label: 'Pack light' }] },
    { caption: 'Short ride: ask for the diff, not the file', show: [{ emoji: '✂️', label: 'Ask for the diff' }] },
    { caption: 'New topic? Start a new chat', show: [{ emoji: '🧊', label: 'Melt the snowball' }] },
  ],
};

/**
 * One short story per step, following Meera, a developer working on
 * MSDevBuild Eats (the open-source Flutter food delivery app this site uses
 * as its reference project). A scenario, not a real incident: the app, its
 * files and its Copilot setup are real; the numbers are illustrative. Each
 * story borrows a picture from the food delivery world, so the idea lands
 * before the explanation does.
 */
export interface Tale {
  emoji: string;
  title: string;
  text: string;
}

export const TALES: Record<string, Tale> = {
  start: {
    emoji: '🧾',
    title: 'Meera’s mystery bill',
    text: 'Meera adds a promo-code field to the MSDevBuild Eats checkout with Copilot Chat. She types one line. At the end of the month, the team’s AI usage page shows thousands of tokens for that one afternoon, far more than the words she typed. Where did they all come from? That is what this course answers.',
  },
  learn: {
    emoji: '🔪',
    title: 'The chopping board',
    text: 'In a kitchen, nothing is cooked whole: the order is chopped first. Meera’s prompt “Add a promo code to checkout” goes onto the chopping board and comes off in pieces: Add · a · promo · code · to · checkout. Each piece gets a number on a ticket, and the model only ever sees the tickets.',
  },
  picture: {
    emoji: '🛵',
    title: 'The delivery bag',
    text: 'Meera’s question is a single samosa. But the rider’s bag goes out full: Copilot packs the repo’s copilot-instructions.md, the list of tools, the earlier chat, and the checkout_bloc.dart file she had open. The fee is charged on the size of the bag, not the samosa.',
  },
  generate: {
    emoji: '🖨️',
    title: 'The receipt printer',
    text: 'Meera watches Copilot’s answer appear piece by piece, like the receipt printer at the restaurant counter: one line at a time, until it prints “Thank you”. Every line costs paper. A short receipt is quick and cheap; asking it to reprint the whole menu is not.',
  },
  calculator: {
    emoji: '⚖️',
    title: 'Weighing the parcel',
    text: 'Before pasting a 300-line test log into chat, Meera weighs it in the calculator. The log is far heavier than an English paragraph of the same length: every bracket, timestamp and indent is a token. She sends only the failing test, and the reply comes back just as useful.',
  },
  ask: {
    emoji: '🍛',
    title: 'Two ways to order',
    text: 'A customer who orders “something nice” gets three wrong deliveries before the right one. A customer who orders “one masala dosa, extra chutney, no onion” gets it first time. Meera’s first prompt was “fix checkout”. Her second: “In checkout_bloc.dart, reject expired promo codes. Show only the diff.” One reply, no retries.',
  },
  continue: {
    emoji: '🍽️',
    title: 'Same table, or a new table?',
    text: 'At lunch, Meera keeps chatting with the same waiter: they remember her order, so adding a dessert takes one sentence. After a long break, the table has been cleared and the waiter has forgotten everything, so re-explaining the whole meal costs more than sitting at a new table with a short note. Copilot chats work the same way: the cache is the waiter’s short memory.',
  },
  billing: {
    emoji: '🚕',
    title: 'From stamps to a taxi meter',
    text: 'Under the old plan, every question Meera asked was one stamp on a card, whether it was a one-liner or a two-hour agent session. Now Copilot runs like a taxi meter: a quick question is a short ride, and an agent rebuilding the cart screen is a long one. The team’s monthly pool of AI Credits is the fuel tank.',
  },
  patterns: {
    emoji: '⛄',
    title: 'The snowball chat',
    text: 'Meera keeps one chat open all morning: promo codes, then rider tracking, then a partner dashboard bug. By lunch, every new question drags the whole morning along with it. When she starts a fresh chat for the partner bug, the snowball melts and each reply is cheap again.',
  },
  scenarios: {
    emoji: '📦',
    title: 'The moving-day attachment',
    text: 'On Friday, Meera attached the whole lib folder “just in case”, and every turn of that chat carried it. On Monday she attached only the two checkout files that mattered. Same answer, a fraction of the credits. Each scenario in this step is one of those Friday-versus-Monday moments.',
  },
  customize: {
    emoji: '👩‍🍳',
    title: 'The kitchen’s house rules',
    text: 'The MSDevBuild Eats repo has a short copilot-instructions.md: the house rules every cook reads at the start of every shift. Its flutter-feature skill is a recipe card, pulled out only when a new screen is being cooked. And its guard-commit hook is the manager at the door, checking shell commands before they run, without spending a single model token.',
  },
  project: {
    emoji: '🏗️',
    title: 'One feature, five kitchens',
    text: 'Meera builds the same feature five times. First with an agent that knows nothing about the repo, then adding the instructions, the specialist agents the repo ships (architecture, feature, tester, security), the flutter-feature skill, and the hook. Each time, the agent explores less, redoes less, and the bill gets smaller.',
  },
  guide: {
    emoji: '🗂️',
    title: 'Where does this rule live?',
    text: 'The team wants every new screen to follow Clean Architecture. A rule every request needs? Instructions. Detailed steps only for new screens? The flutter-feature skill. Something that must never be skipped, even if the model forgets? A hook. Putting each rule in the right home is what this step is about.',
  },
  'tips-quiz': {
    emoji: '📝',
    title: 'Meera’s sticky note',
    text: 'By Friday, a sticky note sits on Meera’s monitor: pack light, ask for the diff, one model per task, new topic means new chat, light model for routine work. Same Copilot, same answers, and the team’s credit pool lasts the whole month.',
  },
};
