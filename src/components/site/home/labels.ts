/**
 * Labels of the home / strategies / solutions fund figures added by the data fixes (partial-year flags, inline
 * gross marker), EN / FR. Kept apart from home.copy.ts (texts under review). Pure data.
 */
import { l } from "../../../lib/i18n/config.ts";

export const HL = {
  /** short flag under a partial inception year in the mini bars */
  launchShort: l("launch", "lanc."),
  /** long form (screen readers) */
  sinceLaunch: l("since launch", "depuis le lancement"),
  /** inline marker next to a gross-of-fees figure shown among net ones */
  gross: l("gross", "brut"),
  grossLong: l("gross of fees", "avant déduction des frais"),
  /** inline marker next to a net-of-fees figure (every fund figure states its basis) */
  net: l("net", "net"),
  netLong: l("net of fees", "après déduction des frais"),
};
