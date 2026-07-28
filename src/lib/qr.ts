import QRCode from 'qrcode';

/**
 * QR codes rendered at build time, so nothing is fetched from a third-party
 * chart API at runtime and no encoder ships to the browser.
 *
 * Always dark-on-white: a QR inverted for a dark theme fails on a meaningful
 * share of scanners, so the code keeps its own white plate in both themes.
 * Error correction M tolerates a printed, folded or badly-lit slide.
 */
export async function qrSvg(
  data: string,
  { size = 200, margin = 2 }: { size?: number; margin?: number } = {},
): Promise<string> {
  return QRCode.toString(data, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin,
    width: size,
    color: { dark: '#0b1220', light: '#ffffff' },
  });
}
