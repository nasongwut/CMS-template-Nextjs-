/**
 * Site templates — bundles of content (theme + colours + categories +
 * articles + about + timeline + nav) for different verticals.
 *
 * The super-admin portal lets a platform admin apply one of these to a
 * freshly provisioned tenant database so the new site has meaningful
 * content from day one.
 */
import { vehiclesTemplate } from "./vehicles";
import { petsTemplate } from "./pets";
import { furnitureTemplate } from "./furniture";
import { partyTemplate } from "./party";
import { engineeringTemplate } from "./engineering";
import type { SiteTemplate } from "./types";

export type { SiteTemplate } from "./types";

export const TEMPLATES: SiteTemplate[] = [
  vehiclesTemplate,
  petsTemplate,
  furnitureTemplate,
  partyTemplate,
  engineeringTemplate,
];

export function getTemplate(id: string): SiteTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
