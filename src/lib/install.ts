import { isIos } from './push';

/**
 * Shared access to the browser's deferred install prompt.
 *
 * `beforeinstallprompt` fires once, early, and only the event captured at that
 * moment can open the install dialog. Two places need it — the header icon
 * (PwaController) and the /install page — and either can mount after the event
 * has already fired, so the event is parked on `window` rather than in module
 * scope: view transitions swap the body, and separate script bundles would not
 * share a module-level variable.
 */

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Fired whenever the install prompt becomes available or is used up. */
export const INSTALL_STATE_EVENT = 'pwa:install-state';

const KEY = '__pwaInstallPrompt';

type PromptHolder = Window & { [KEY]?: InstallPromptEvent | null };

export function captureInstallPrompt(event: InstallPromptEvent): void {
  (window as PromptHolder)[KEY] = event;
  window.dispatchEvent(new CustomEvent(INSTALL_STATE_EVENT));
}

export function getInstallPrompt(): InstallPromptEvent | null {
  return (window as PromptHolder)[KEY] ?? null;
}

export function clearInstallPrompt(): void {
  (window as PromptHolder)[KEY] = null;
  window.dispatchEvent(new CustomEvent(INSTALL_STATE_EVENT));
}

/**
 * Opens the browser's install dialog. Resolves 'unavailable' when the browser
 * never offered one (iOS Safari, Firefox, or an already-installed app), which
 * the caller shows manual steps for.
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const event = getInstallPrompt();
  if (!event) return 'unavailable';

  event.prompt();
  const { outcome } = await event.userChoice;
  // The captured event is single-use; Chrome fires a fresh one if the visitor
  // dismisses now and becomes eligible again later.
  clearInstallPrompt();
  return outcome;
}

export function onInstallStateChange(handler: () => void): () => void {
  window.addEventListener(INSTALL_STATE_EVENT, handler);
  return () => window.removeEventListener(INSTALL_STATE_EVENT, handler);
}

/** Which set of manual steps applies to the device the visitor is holding. */
export function currentPlatform(): 'ios' | 'android' | 'desktop' {
  if (isIos()) return 'ios';
  return /android/i.test(navigator.userAgent) ? 'android' : 'desktop';
}

/**
 * Add-to-Home-Screen is a Safari-only feature. Chrome/Firefox on iOS and in-app
 * webviews (LinkedIn, Instagram…) don't offer it, so the manual steps need to
 * warn when they won't work as written.
 */
export function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  return isIos() && /Safari/.test(ua) && !/(CriOS|FxiOS|EdgiOS|GSA|FBAN|FBAV|Instagram|Line)/.test(ua);
}
