/** Badge and one-line disclosure of a share class's offering type; nothing at all while the type is not known. */
import type { ClassType } from "@/lib/data/types";
import { T, tr } from "./copy";
import type { Lang } from "./lib/format.ts";

export function ClassTypeBadge({ type, lang, testId = "class-type" }: { type: ClassType; lang: Lang; testId?: string }) {
  if (type !== "prospectus" && type !== "om") return null;
  return <span className={`fx-chip cls-type ${type}`} data-testid={testId} data-type={type}>{tr(type === "om" ? T.classes.om : T.classes.prospectus, lang)}</span>;
}

export function ClassTypeNote({ type, lang }: { type: ClassType; lang: Lang }) {
  if (type !== "prospectus" && type !== "om") return null;
  return <p className="cls-note" data-testid="class-type-note">{tr(type === "om" ? T.classes.omNote : T.classes.prospectusNote, lang)}</p>;
}
