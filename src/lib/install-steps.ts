/**
 * The manual install steps, one source shared by /install and /refer.
 *
 * `steps` carry inline markup, so they are rendered with set:html — keep the
 * tags to <strong> around the thing the reader has to tap.
 */
export interface InstallPlatform {
  id: 'android' | 'ios' | 'desktop';
  label: string;
  sub: string;
  steps: string[];
}

export const INSTALL_PLATFORMS: InstallPlatform[] = [
  {
    id: 'android',
    label: 'Android',
    sub: 'Chrome, Edge, Samsung Internet',
    steps: [
      'Tap <strong>Install app</strong> on the install page, or the ⋮ menu in the browser bar.',
      'Choose <strong>Install app</strong> / <strong>Add to Home screen</strong>.',
      'Confirm <strong>Install</strong>. The icon lands on your home screen.',
    ],
  },
  {
    id: 'ios',
    label: 'iPhone & iPad',
    sub: 'Safari only — Apple allows no install prompt',
    steps: [
      'Open the install page in <strong>Safari</strong> (not Chrome or an in-app browser).',
      'Tap the <strong>Share</strong> button — bottom bar on iPhone, top-right on iPad.',
      'Scroll down, tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.',
    ],
  },
  {
    id: 'desktop',
    label: 'Windows, Mac & Linux',
    sub: 'Chrome, Edge, Brave, Arc',
    steps: [
      'Click <strong>Install app</strong> on the install page, or the install icon in the address bar.',
      'Confirm <strong>Install</strong> in the browser dialog.',
      'It opens in its own window and pins to the taskbar or dock.',
    ],
  },
];
