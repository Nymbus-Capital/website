import { ContentBusyError, ContentConflictError } from "@/lib/data/content";
import { fail, internalError } from "./http";

/** Map content-store errors to HTTP responses (409 on a version conflict). */
export function contentError(where: string, e: unknown): Response {
  if (e instanceof ContentConflictError)
    return fail(409, "conflict", e.message, { expected: e.expected, actual: e.actual });
  if (e instanceof ContentBusyError) return fail(503, "busy", e.message);
  return internalError(where, e);
}
