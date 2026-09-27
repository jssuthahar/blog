/**
 * Country from the browser's own timezone — no IP, no third party, no cookie.
 *
 * The site is static on GitHub Pages, so there is no server to read a request
 * IP from, and an IP-geolocation service would mean shipping every reader's
 * address to a third party for a flag on a bar. `Intl.DateTimeFormat()
 * .resolvedOptions().timeZone` is already in the browser, costs one function
 * call, and never leaves the device.
 *
 * The trade-off is accuracy, and it is worth stating plainly: a reader on a VPN
 * is counted wherever their clock says, a few zones are shared across borders,
 * and anyone whose zone is not in this table is counted as unknown rather than
 * guessed at. This is reach, not analytics — an approximate country is fine,
 * an invented one is not.
 *
 * The table covers the zones the site's traffic actually comes from plus the
 * major world zones. Add rather than guess: an unmapped zone degrades to
 * `null`, which the presence counters skip entirely.
 */

/** IANA timezone → ISO 3166-1 alpha-2. */
const ZONE_TO_COUNTRY: Record<string, string> = {
  // South and South-East Asia — where most of this site's readers are
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Asia/Kuala_Lumpur': 'MY', 'Asia/Kuching': 'MY',
  'Asia/Singapore': 'SG', 'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID',
  'Asia/Manila': 'PH', 'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN',
  'Asia/Dhaka': 'BD', 'Asia/Karachi': 'PK', 'Asia/Colombo': 'LK', 'Asia/Kathmandu': 'NP',
  'Asia/Yangon': 'MM', 'Asia/Phnom_Penh': 'KH', 'Asia/Vientiane': 'LA', 'Asia/Brunei': 'BN',
  // East Asia
  'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN', 'Asia/Chongqing': 'CN',
  'Asia/Urumqi': 'CN', 'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW', 'Asia/Macau': 'MO',
  'Asia/Ulaanbaatar': 'MN',
  // Middle East and Central Asia
  'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW',
  'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM', 'Asia/Tehran': 'IR', 'Asia/Baghdad': 'IQ',
  'Asia/Amman': 'JO', 'Asia/Beirut': 'LB', 'Asia/Damascus': 'SY', 'Asia/Jerusalem': 'IL',
  'Asia/Tel_Aviv': 'IL', 'Asia/Gaza': 'PS', 'Asia/Hebron': 'PS',
  'Asia/Tashkent': 'UZ', 'Asia/Almaty': 'KZ', 'Asia/Baku': 'AZ', 'Asia/Tbilisi': 'GE',
  'Asia/Yerevan': 'AM', 'Asia/Kabul': 'AF', 'Asia/Bishkek': 'KG', 'Asia/Dushanbe': 'TJ',
  // Europe
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Lisbon': 'PT', 'Europe/Madrid': 'ES',
  'Europe/Paris': 'FR', 'Europe/Brussels': 'BE', 'Europe/Amsterdam': 'NL',
  'Europe/Berlin': 'DE', 'Europe/Zurich': 'CH', 'Europe/Vienna': 'AT', 'Europe/Rome': 'IT',
  'Europe/Prague': 'CZ', 'Europe/Warsaw': 'PL', 'Europe/Budapest': 'HU',
  'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI', 'Europe/Athens': 'GR', 'Europe/Bucharest': 'RO',
  'Europe/Sofia': 'BG', 'Europe/Belgrade': 'RS', 'Europe/Zagreb': 'HR',
  'Europe/Kyiv': 'UA', 'Europe/Kiev': 'UA', 'Europe/Moscow': 'RU', 'Europe/Minsk': 'BY',
  'Europe/Istanbul': 'TR', 'Europe/Vilnius': 'LT', 'Europe/Riga': 'LV', 'Europe/Tallinn': 'EE',
  'Europe/Bratislava': 'SK', 'Europe/Ljubljana': 'SI', 'Europe/Luxembourg': 'LU',
  'Europe/Malta': 'MT', 'Atlantic/Reykjavik': 'IS',
  // Americas
  'America/New_York': 'US', 'America/Detroit': 'US', 'America/Chicago': 'US',
  'America/Denver': 'US', 'America/Phoenix': 'US', 'America/Los_Angeles': 'US',
  'America/Anchorage': 'US', 'Pacific/Honolulu': 'US', 'America/Indiana/Indianapolis': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA',
  'America/Mexico_City': 'MX', 'America/Monterrey': 'MX', 'America/Tijuana': 'MX',
  'America/Sao_Paulo': 'BR', 'America/Bahia': 'BR', 'America/Fortaleza': 'BR',
  'America/Manaus': 'BR', 'America/Recife': 'BR',
  'America/Argentina/Buenos_Aires': 'AR', 'America/Santiago': 'CL', 'America/Lima': 'PE',
  'America/Bogota': 'CO', 'America/Caracas': 'VE', 'America/Guayaquil': 'EC',
  'America/La_Paz': 'BO', 'America/Asuncion': 'PY', 'America/Montevideo': 'UY',
  'America/Panama': 'PA', 'America/Costa_Rica': 'CR', 'America/Guatemala': 'GT',
  'America/Havana': 'CU', 'America/Santo_Domingo': 'DO', 'America/Jamaica': 'JM',
  'America/Puerto_Rico': 'PR',
  // Africa
  'Africa/Lagos': 'NG', 'Africa/Cairo': 'EG', 'Africa/Nairobi': 'KE',
  'Africa/Johannesburg': 'ZA', 'Africa/Accra': 'GH', 'Africa/Casablanca': 'MA',
  'Africa/Algiers': 'DZ', 'Africa/Tunis': 'TN', 'Africa/Addis_Ababa': 'ET',
  'Africa/Dar_es_Salaam': 'TZ', 'Africa/Kampala': 'UG', 'Africa/Khartoum': 'SD',
  'Africa/Dakar': 'SN', 'Africa/Abidjan': 'CI', 'Africa/Kinshasa': 'CD',
  'Africa/Harare': 'ZW', 'Africa/Lusaka': 'ZM', 'Africa/Maputo': 'MZ',
  // Oceania
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Australia/Darwin': 'AU',
  'Australia/Hobart': 'AU', 'Pacific/Auckland': 'NZ', 'Pacific/Fiji': 'FJ',
  'Pacific/Port_Moresby': 'PG', 'Pacific/Guam': 'GU',
};

/** Display names, so the strip never shows a bare two-letter code. */
export const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India', MY: 'Malaysia', SG: 'Singapore', ID: 'Indonesia', PH: 'Philippines',
  TH: 'Thailand', VN: 'Vietnam', BD: 'Bangladesh', PK: 'Pakistan', LK: 'Sri Lanka',
  NP: 'Nepal', MM: 'Myanmar', KH: 'Cambodia', LA: 'Laos', BN: 'Brunei',
  JP: 'Japan', KR: 'South Korea', CN: 'China', HK: 'Hong Kong', TW: 'Taiwan',
  MO: 'Macau', MN: 'Mongolia',
  AE: 'UAE', SA: 'Saudi Arabia', QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain',
  OM: 'Oman', IR: 'Iran', IQ: 'Iraq', JO: 'Jordan', LB: 'Lebanon', SY: 'Syria',
  IL: 'Israel', PS: 'Palestine', UZ: 'Uzbekistan', KZ: 'Kazakhstan', AZ: 'Azerbaijan',
  GE: 'Georgia', AM: 'Armenia', AF: 'Afghanistan', KG: 'Kyrgyzstan', TJ: 'Tajikistan',
  GB: 'United Kingdom', IE: 'Ireland', PT: 'Portugal', ES: 'Spain', FR: 'France',
  BE: 'Belgium', NL: 'Netherlands', DE: 'Germany', CH: 'Switzerland', AT: 'Austria',
  IT: 'Italy', CZ: 'Czechia', PL: 'Poland', HU: 'Hungary', SE: 'Sweden', NO: 'Norway',
  DK: 'Denmark', FI: 'Finland', GR: 'Greece', RO: 'Romania', BG: 'Bulgaria',
  RS: 'Serbia', HR: 'Croatia', UA: 'Ukraine', RU: 'Russia', BY: 'Belarus',
  TR: 'Turkey', LT: 'Lithuania', LV: 'Latvia', EE: 'Estonia', SK: 'Slovakia',
  SI: 'Slovenia', LU: 'Luxembourg', MT: 'Malta', IS: 'Iceland',
  US: 'United States', CA: 'Canada', MX: 'Mexico', BR: 'Brazil', AR: 'Argentina',
  CL: 'Chile', PE: 'Peru', CO: 'Colombia', VE: 'Venezuela', EC: 'Ecuador',
  BO: 'Bolivia', PY: 'Paraguay', UY: 'Uruguay', PA: 'Panama', CR: 'Costa Rica',
  GT: 'Guatemala', CU: 'Cuba', DO: 'Dominican Republic', JM: 'Jamaica', PR: 'Puerto Rico',
  NG: 'Nigeria', EG: 'Egypt', KE: 'Kenya', ZA: 'South Africa', GH: 'Ghana',
  MA: 'Morocco', DZ: 'Algeria', TN: 'Tunisia', ET: 'Ethiopia', TZ: 'Tanzania',
  UG: 'Uganda', SD: 'Sudan', SN: 'Senegal', CI: "Côte d'Ivoire", CD: 'DR Congo',
  ZW: 'Zimbabwe', ZM: 'Zambia', MZ: 'Mozambique',
  AU: 'Australia', NZ: 'New Zealand', FJ: 'Fiji', PG: 'Papua New Guinea', GU: 'Guam',
};

/**
 * The flag as a regional-indicator pair, built from the code rather than stored.
 * Windows renders these as letters rather than a flag, which is why the strip
 * always prints the country name beside it.
 */
export function flagOf(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...[...code].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}

export function nameOf(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

/** `null` when the zone is unknown — never a guess. */
export function countryFromTimeZone(zone: string | undefined): string | null {
  if (!zone) return null;
  return ZONE_TO_COUNTRY[zone] ?? null;
}

/** The map, for the client script — it runs inline and cannot import. */
export const ZONE_MAP = ZONE_TO_COUNTRY;
