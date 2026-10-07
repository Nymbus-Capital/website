/** Badge and one-line disclosure of a share class's offering type; nothing at all while the type is not known. */
import type { ClassType } from "@/lib/data/types";
import { T } from "./fund.copy";
import { tr, type Locale } from "@/lib/i18n/config";

export function ClassTypeBadge({
  type,
  lang,
  testId = "class-type",
}: {
  type: ClassType;
  lang: Locale;
  testId?: string;
}) {
  if (type !== "prospectus" && type !== "om") return null;
  return (
    <span className={`fx-chip cls-type ${type}`} data-testid={testId} data-type={type}>
      {tr(type === "om" ? T.classes.om : T.classes.prospectus, lang)}
    </span>
  );
}

export function ClassTypeNote({ type, lang }: { type: ClassType; lang: Locale }) {
  if (type !== "prospectus" && type !== "om") return null;
  return (
    <p className="cls-note" data-testid="class-type-note">
      {tr(type === "om" ? T.classes.omNote : T.classes.prospectusNote, lang)}
    </p>
  );
}
