/**
 * Minimal ISO-3166 alpha-2 → display name + flag emoji map.
 * Only includes countries we expect to see most often; falls back to the raw
 * code for everything else. Avoids pulling in a 50KB dataset.
 */
const NAMES: Record<string, string> = {
  TH: "Thailand",
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  HK: "Hong Kong",
  TW: "Taiwan",
  SG: "Singapore",
  MY: "Malaysia",
  ID: "Indonesia",
  VN: "Vietnam",
  PH: "Philippines",
  IN: "India",
  AU: "Australia",
  NZ: "New Zealand",
  CA: "Canada",
  MX: "Mexico",
  BR: "Brazil",
  AR: "Argentina",
  CL: "Chile",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  CH: "Switzerland",
  AT: "Austria",
  BE: "Belgium",
  IE: "Ireland",
  PT: "Portugal",
  PL: "Poland",
  RU: "Russia",
  UA: "Ukraine",
  TR: "Turkey",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  IL: "Israel",
  EG: "Egypt",
  ZA: "South Africa",
  NG: "Nigeria",
  KE: "Kenya",
  LA: "Laos",
  KH: "Cambodia",
  MM: "Myanmar",
  BD: "Bangladesh",
  PK: "Pakistan",
  LK: "Sri Lanka",
};

export function countryName(code: string | null | undefined): string {
  if (!code) return "Unknown";
  const up = code.toUpperCase();
  return NAMES[up] ?? up;
}

/**
 * Convert a 2-letter ISO code to its flag emoji via the Regional Indicator
 * Symbol range — no need for an image dataset.
 */
export function countryFlag(code: string | null | undefined): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "🌐";
  const cc = code.toUpperCase();
  return String.fromCodePoint(
    0x1f1e6 + cc.charCodeAt(0) - 65,
    0x1f1e6 + cc.charCodeAt(1) - 65,
  );
}
