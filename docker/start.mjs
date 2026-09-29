// start.mjs — container entrypoint: give the data volume to the app user, drop root, start Next.js
import fs from "node:fs";
import path from "node:path";

const APP_UID = 1001;
const APP_GID = 1001;
const VOLUME = "/data";

/** Re-own everything under dir (lchown: symlinks are never followed); fixes files left by a root shell. */
function reown(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const st = fs.lstatSync(p);
    if (st.uid !== APP_UID || st.gid !== APP_GID) fs.lchownSync(p, APP_UID, APP_GID);
    if (e.isDirectory()) reown(p);
  }
}

if (process.getuid?.() === 0) {
  // Northflank mounts volumes owned by root: hand the mount to the app user before dropping privileges
  try {
    const st = fs.lstatSync(VOLUME);
    if (!st.isDirectory() || st.isSymbolicLink()) throw new Error(`${VOLUME} is not a plain directory`);
    if (st.uid !== APP_UID || st.gid !== APP_GID) fs.lchownSync(VOLUME, APP_UID, APP_GID);
    fs.chmodSync(VOLUME, 0o750);
    reown(VOLUME);
  } catch (e) {
    console.error(`[data] could not prepare ${VOLUME}: ${e?.code || e?.message || e}`);
  }
  process.setgroups([APP_GID]);
  process.setgid(APP_GID);
  process.setuid(APP_UID);
}
if (process.getuid?.() === 0) throw new Error("refusing to run the server as root");

await import("./server.js");
