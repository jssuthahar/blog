import { SITE, AUTHOR } from '../config';

/**
 * The messages a *visitor* sends to their own contacts.
 *
 * Voice matters here: the reader of /share is not Suthahar, so nothing may be
 * written in his first person — every line has to be sayable by a stranger who
 * simply found the site useful. `greeting` is folded in only when the sender
 * types a name, so an un-personalised message never opens with a dangling "Hi ,".
 */
export interface ShareMessage {
  id: string;
  /** Chip label — who the message is aimed at. */
  label: string;
  /** One line of context under the chip row. */
  note: string;
  channel: 'whatsapp' | 'linkedin';
  /** `{name}` is replaced by the recipient's name; omitted when none is given. */
  greeting?: string;
  body: string;
}

const url = `${SITE.url}/install/`;

export const SHARE_MESSAGES: ShareMessage[] = [
  {
    id: 'friend',
    label: 'One friend',
    note: 'Personal and direct — the one people actually act on.',
    channel: 'whatsapp',
    greeting: 'Hi {name} —',
    body: `found something worth your time.

${AUTHOR.name}'s MSDEVBUILD library — Azure, AI, GitHub Copilot, .NET MAUI, Flutter and Web — is now an app you can install in one tap. Free, no sign-up, and it reads offline.

${url}

Open the link in Chrome (Android) or Safari (iPhone) and it walks you through it.`,
  },
  {
    id: 'group',
    label: 'A dev group',
    note: 'Team channels, community groups, student batches.',
    channel: 'whatsapp',
    body: `For anyone here trying to keep pace with AI and cloud 👇

MSDEVBUILD is now installable as an app — hands-on articles on Azure, AI, GitHub Copilot, .NET MAUI, Flutter and Web, written from real production work by ${AUTHOR.name}.

Free, no sign-up, reads offline:
${url}`,
  },
  {
    id: 'linkedin',
    label: 'A LinkedIn post',
    note: 'LinkedIn cannot pre-fill a post — copy this, then paste it.',
    channel: 'linkedin',
    body: `AI, vibe coding and cloud are moving faster than most of us can read about them — and a lot of good engineers have quietly decided they are already behind.

If that is you, or someone on your team: MSDEVBUILD by ${AUTHOR.name} is free, needs no sign-up, and now installs as an app that works offline. Azure, AI, GitHub Copilot, .NET MAUI, Flutter, Web — written from production work, not theory.

Worth ten seconds of your day: ${url}`,
  },
  {
    id: 'tamil',
    label: 'In Tamil',
    note: 'For Tamil-speaking friends and community groups.',
    channel: 'whatsapp',
    greeting: 'வணக்கம் {name},',
    body: `MSDEVBUILD ஆப் — Cloud, AI, .NET, Flutter பற்றிய இலவசக் கட்டுரைகள். ஒரே தட்டலில் நிறுவலாம், இணைய இணைப்பு இல்லாமலும் படிக்கலாம்.

${url}

(Chrome அல்லது Safari-ல் திறக்கவும்.)`,
  },
];
