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
