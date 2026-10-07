// deploy/northflank/provision.mjs — creates the website's Northflank resources (idempotent, create-only).
//
// Creates in the existing project (default `etl`, where the dataplatform runs):
//   - combined service `website`: builds this repo's Dockerfile, port 3000 public, health checks /api/health
//     (created with 0 instances, so nothing runs before its volume and secrets exist)
//   - volume `website-data` (5 GB) mounted at /data
//   - secret group `website-secrets`, restricted to the service, with every variable the site reads.
//     AUTH_SECRET is generated here; PUBLIC_URL and DATAPLATFORM_URL are filled; the credentials you
//     own (Entra, Graph, GitHub token, alert webhook) are left empty for you to paste in the UI.
//   - then scales the service to 1 instance.
// Existing resources are never modified or deleted: re-running only creates what is missing, and checks
// that what exists is wired as expected (volume attached, secret group restricted to the service).
// Refuses to run when an unrestricted secret group exists in the project (it would be injected into the
// public website). Never prints secret values.
//
// Usage: NORTHFLANK_API_TOKEN=… node deploy/northflank/provision.mjs [--apply] [--project=etl]
//        [--service=website] [--branch=main] [--plan=nf-compute-50] [--backend=dataplatform-staging]
//        [--accept-shared-secrets]
import crypto from "node:crypto";

// ---------------------------------------------------------------- arguments (strict: --name=value only)
const FLAGS = new Set(["apply", "accept-shared-secrets"]);
const VALUES = new Set(["project", "service", "branch", "plan", "backend"]);
const flags = new Set();
const values = {};
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z-]+)(?:=(.*))?$/);
  if (!m) fail(`unexpected argument: ${a}`, 2);
  const [, name, value] = m;
  if (FLAGS.has(name) && value === undefined) flags.add(name);
  else if (VALUES.has(name) && value !== undefined) values[name] = value;
  else fail(`unknown or malformed option: ${a}`, 2);
}
function fail(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}
const APPLY = flags.has("apply");
const ACCEPT_SHARED = flags.has("accept-shared-secrets");
const PROJECT = values.project ?? "etl";
const SERVICE = values.service ?? "website";
const BRANCH = values.branch ?? "main";
const PLAN = values.plan ?? "nf-compute-50";
const BACKEND = values.backend ?? "dataplatform-staging";
const VOLUME = `${SERVICE}-data`;
const SECRETS = `${SERVICE}-secrets`;
const REPO = "https://github.com/Nymbus-Capital/website";
const PORT = 3000;
// overridable only for the unit test's local mock API
const API = (process.env.NORTHFLANK_API_URL || "https://api.northflank.com").replace(/\/$/, "");

for (const [k, v] of Object.entries({ PROJECT, SERVICE, BACKEND }))
  if (!/^[a-z][a-z0-9-]{1,52}$/.test(v)) fail(`invalid ${k}: ${v}`, 2);
if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$/.test(BRANCH) || BRANCH.includes("..")) fail(`invalid branch: ${BRANCH}`, 2);
if (!/^nf-[a-z0-9-]{2,40}$/.test(PLAN)) fail(`invalid plan: ${PLAN}`, 2);
const TOKEN = process.env.NORTHFLANK_API_TOKEN;
if (!TOKEN) fail("NORTHFLANK_API_TOKEN is not set.", 2);

// ---------------------------------------------------------------- output (secrets never printed)
const AUTH_SECRET = crypto.randomBytes(48).toString("base64url");
const scrub = (s) => String(s).split(AUTH_SECRET).join("***").split(TOKEN).join("***");
const summary = [];
const log = (...m) => console.log(...m.map(scrub));
const note = (line) => {
  summary.push(scrub(line));
  log(line);
};

class NfError extends Error {
  constructor(method, path, status, detail) {
    super(`Northflank ${method} ${path} → HTTP ${status}: ${detail}`);
    this.status = status;
  }
}

async function nf(method, path, payload) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Accept: "application/json", Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
    signal: AbortSignal.timeout(60_000),
  });
  const text = await res.text();
  if (!res.ok) {
    // keep only the API's error message (never the echoed request), and scrub our secrets from it anyway
    let detail = "";
    try {
      const j = JSON.parse(text);
      detail = j?.error?.message ?? j?.message ?? "";
      const details = j?.error?.details ?? j?.details;
      if (details && !path.includes("/secrets")) detail += ` ${JSON.stringify(details).slice(0, 600)}`;
    } catch {
      detail = path.includes("/secrets") ? "" : text.slice(0, 300);
    }
    throw new NfError(method, path, res.status, scrub(detail));
  }
  if (!text) return {};
  const json = JSON.parse(text);
  return json.data ?? json;
}
const get = (path) => nf("GET", path);
const exists = async (path) => {
  try {
    return await get(path);
  } catch (e) {
    if (e instanceof NfError && e.status === 404) return null;
    throw e;
  }
};
async function listAll(path, key) {
  const out = [];
  for (let page = 1; page <= 50; page++) {
    const items = (await get(`${path}?per_page=100&page=${page}`))[key] ?? [];
    out.push(...items);
    if (items.length < 100) break;
  }
  return out;
}
async function create(label, path, body) {
  if (!APPLY) {
    note(`- would create ${label}`);
    log(JSON.stringify(body, (k, v) => (k === "AUTH_SECRET" && v ? "<generated, hidden>" : v), 2));
    return null;
  }
  const r = await nf("POST", path, body);
  note(`- created ${label}`);
  return r;
}
const hostOf = (port) => {
  const d = port?.domains?.[0];
  return (typeof d === "string" ? d : d?.name) ?? port?.dns ?? "";
};

async function main() {
  log(
    `${APPLY ? "APPLY" : "DRY RUN (add --apply to create)"} — project ${PROJECT}, service ${SERVICE}, branch ${BRANCH}, plan ${PLAN}`,
  );

  // 1. project, backend, and no unrestricted secret group (it would be injected into the public site)
  const project = await exists(`/v1/projects/${PROJECT}`);
  if (!project) throw new Error(`project "${PROJECT}" not found (or the token has no access to it)`);

  const groups = await listAll(`/v1/projects/${PROJECT}/secrets`, "secrets");
  const shared = [];
  for (const g of groups) {
    if (g.id === SECRETS) continue;
    const detail = g.restrictions ? g : await get(`/v1/projects/${PROJECT}/secrets/${g.id}`);
    if (detail?.restrictions?.restricted !== true) shared.push(g.id);
  }
  if (shared.length) {
    const msg = `unrestricted secret group(s) in ${PROJECT}: ${shared.join(", ")} — Northflank injects them into every service, including this public website`;
    if (!ACCEPT_SHARED)
      throw new Error(
        `${msg}. Restrict them to their services first (Secret group → Restrictions), or re-run with --accept-shared-secrets after checking their contents.`,
      );
    note(`- WARNING: ${msg} (accepted with --accept-shared-secrets)`);
  } else note("- no unrestricted secret groups in the project");

  const backend = await exists(`/v1/projects/${PROJECT}/services/${BACKEND}`);
  let dataplatformUrl = "";
  const vcsTemplate = {};
  if (backend) {
    const ports = (await get(`/v1/projects/${PROJECT}/services/${BACKEND}/ports`)).ports ?? [];
    const p = ports.find((x) => x.internalPort === 8000) ?? ports[0];
    if (p) dataplatformUrl = `http://${BACKEND}:${p.internalPort}`;
    // reuse the git link of a service that already builds from the Nymbus-Capital organisation
    const v = backend.vcsData ?? {};
    for (const k of ["projectType", "accountLogin", "vcsLinkId", "selfHostedVcsId"])
      if (v[k] !== undefined) vcsTemplate[k] = v[k];
    note(
      `- backend \`${BACKEND}\` found (not modified); the site reads it privately at ${dataplatformUrl || "(no port found)"}`,
    );
  } else note(`- backend \`${BACKEND}\` NOT found in ${PROJECT}: DATAPLATFORM_URL left empty`);

  // 2. service, created with 0 instances: it builds, but runs only once its volume and secrets exist
  let service = await exists(`/v1/projects/${PROJECT}/services/${SERVICE}`);
  const serviceIsNew = !service;
  if (service) note(`- service \`${SERVICE}\` already exists: left unchanged`);
  else {
    await create(
      `combined service \`${SERVICE}\` (build ${REPO}@${BRANCH}, Dockerfile, plan ${PLAN}, 0 instances until wired)`,
      `/v1/projects/${PROJECT}/services/combined`,
      {
        name: SERVICE,
        description: "Nymbus Capital public website + fund data pipeline + admin (Next.js)",
        billing: { deploymentPlan: PLAN },
        deployment: { instances: 0, docker: { configType: "default" } },
        ports: [{ name: "p01", internalPort: PORT, public: true, protocol: "HTTP" }],
        vcsData: { projectType: "github", ...vcsTemplate, projectUrl: REPO, projectBranch: BRANCH },
        buildSettings: {
          dockerfile: { buildEngine: "kaniko", dockerFilePath: "/Dockerfile", dockerWorkDir: "/", useCache: true },
        },
        buildConfiguration: {
          pathIgnoreRules: ["docs/**", "e2e/**", "*.md"],
          isAllowList: false,
          ciIgnoreFlagsEnabled: false,
        },
        disabledCI: false,
        disabledCD: false,
      },
    );
    if (APPLY) service = await get(`/v1/projects/${PROJECT}/services/${SERVICE}`);
  }

  // 3. health checks
  if (APPLY && service) {
    const current = (await exists(`/v1/projects/${PROJECT}/services/${SERVICE}/health-checks`))?.healthChecks ?? [];
    if (!current.length) {
      const probe = (type) => ({
        protocol: "HTTP",
        type,
        path: "/api/health",
        port: PORT,
        initialDelaySeconds: 15,
        periodSeconds: 15,
        timeoutSeconds: 5,
        failureThreshold: 4,
        successThreshold: 1,
      });
      try {
        await nf("POST", `/v1/projects/${PROJECT}/services/${SERVICE}/health-checks`, {
          healthChecks: [probe("readinessProbe"), probe("livenessProbe")],
        });
        note("- health checks set on /api/health");
      } catch (e) {
        note(
          `- could not set health checks (${e.message.slice(0, 200)}): add an HTTP readiness check on /api/health port ${PORT} in the UI`,
        );
      }
    } else note("- health checks already configured: left unchanged");
  }

  // 4. public address → PUBLIC_URL
  let publicUrl = "";
  if (service) {
    const ports = (await get(`/v1/projects/${PROJECT}/services/${SERVICE}/ports`)).ports ?? [];
    const host = hostOf(ports.find((x) => x.internalPort === PORT) ?? ports[0]);
    if (host) publicUrl = `https://${host}`;
    note(`- public address: ${publicUrl || "(assigned after the first deployment)"}`);
  }

  // 5. volume (verify the attachment when it already exists)
  const volumes = await listAll(`/v1/projects/${PROJECT}/volumes`, "volumes");
  const vol = volumes.find((v) => v.id === VOLUME || v.name === VOLUME);
  if (vol) {
    const detail = vol.attachedObjects ? vol : await exists(`/v1/projects/${PROJECT}/volumes/${vol.id}`);
    const attached = (detail?.attachedObjects ?? []).some((o) => o.id === SERVICE);
    if (!attached)
      throw new Error(
        `volume \`${VOLUME}\` exists but is not attached to \`${SERVICE}\`: attach it at /data in the UI, then re-run`,
      );
    note(`- volume \`${VOLUME}\` already exists and is attached: left unchanged`);
  } else {
    const body = (storageClassName) => ({
      name: VOLUME,
      mounts: [{ containerMountPath: "/data" }],
      spec: { accessMode: "ReadWriteOnce", storageClassName, storageSize: 5120 },
      attachedObjects: [{ id: SERVICE, type: "service" }],
    });
    try {
      await create(`volume \`${VOLUME}\` (5 GB at /data)`, `/v1/projects/${PROJECT}/volumes`, body("nvme"));
    } catch (e) {
      if (!(e instanceof NfError && e.status === 400)) throw e;
      await create(`volume \`${VOLUME}\` (5 GB at /data, ssd)`, `/v1/projects/${PROJECT}/volumes`, body("ssd"));
    }
  }

  // 6. secret group (verify its restriction when it already exists)
  const group = await exists(`/v1/projects/${PROJECT}/secrets/${SECRETS}`);
  if (group) {
    const r = group.restrictions;
    if (r?.restricted !== true || !(r.nfObjects ?? []).some((o) => o.id === SERVICE)) {
      throw new Error(
        `secret group \`${SECRETS}\` exists but is not restricted to \`${SERVICE}\`: fix its restrictions in the UI, then re-run`,
      );
    }
    note(`- secret group \`${SECRETS}\` already exists and is restricted: left unchanged (edit values in the UI)`);
  } else {
    const variables = {
      PUBLIC_URL: publicUrl,
      AUTH_SECRET,
      DATAPLATFORM_URL: dataplatformUrl,
      ADMIN_ALLOWED_DOMAINS: "nymbus.ca",
      PIPELINE_SCHEDULE: "06:45,12:45,18:45",
      FICHES_BASE_PATH: "Business Development/Fiches d'infos",
      AZURE_TENANT_ID: "",
      AZURE_CLIENT_ID: "",
      AZURE_CLIENT_SECRET: "",
      ADMIN_REQUIRED_ROLE: "",
      GRAPH_TENANT_ID: "",
      GRAPH_CLIENT_ID: "",
      GRAPH_CLIENT_SECRET: "",
      GRAPH_DRIVE_ID: "",
      GITHUB_TOKEN: "",
      PIPELINE_ALERT_WEBHOOK: "",
    };
    const body = (vars) => ({
      name: SECRETS,
      description: "Website runtime configuration and credentials",
      secretType: "environment-arguments",
      priority: 10,
      restrictions: { restricted: true, nfObjects: [{ id: SERVICE, type: "service" }] },
      secrets: { variables: vars },
    });
    const label = `secret group \`${SECRETS}\` (restricted to \`${SERVICE}\`; AUTH_SECRET generated)`;
    try {
      await create(label, `/v1/projects/${PROJECT}/secrets`, body(variables));
    } catch (e) {
      if (!(e instanceof NfError && e.status === 400)) throw e;
      // some API versions refuse empty values: create with the filled ones and list the rest to add
      const filled = Object.fromEntries(Object.entries(variables).filter(([, v]) => v !== ""));
      await create(label, `/v1/projects/${PROJECT}/secrets`, body(filled));
      note(
        `  add these keys in the UI: ${Object.keys(variables)
          .filter((k) => variables[k] === "")
          .join(", ")}`,
      );
    }
    if (!publicUrl) note("  PUBLIC_URL is empty: set it to the service's https address once the UI shows it");
  }

  // 7. start: scale a newly created service to one instance (its first build deploys automatically)
  if (APPLY && serviceIsNew) {
    try {
      await nf("POST", `/v1/projects/${PROJECT}/services/${SERVICE}/scale`, { instances: 1 });
      note("- service scaled to 1 instance: it starts as soon as the first build finishes");
    } catch (e) {
      note(`- could not scale automatically (${e.message.slice(0, 160)}): set instances to 1 in the UI`);
    }
  }

  note("");
  note(
    "Next: paste the credentials into the secret group in the Northflank UI (docs/deploy.md §2), then restart the service.",
  );
}

main()
  .then(async () => {
    if (process.env.GITHUB_STEP_SUMMARY) {
      const fs = await import("node:fs");
      fs.appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `## Northflank provisioning (${APPLY ? "applied" : "dry run"})\n\n${summary.join("\n")}\n`,
      );
    }
  })
  .catch((e) => fail(`FAILED: ${scrub(e.message)}`));
