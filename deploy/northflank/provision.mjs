// deploy/northflank/provision.mjs — creates the website's Northflank resources (idempotent, create-only).
//
// Creates in the existing project (default `etl`, where the dataplatform runs):
//   - combined service `website`: builds this repo's Dockerfile, port 3000 public, health check /api/health
//   - volume `website-data` (5 GB) mounted at /data
//   - secret group `website-secrets`, restricted to the service, with every variable the site reads.
//     AUTH_SECRET is generated here; PUBLIC_URL and DATAPLATFORM_URL are filled; the credentials you
//     own (Entra, Graph, GitHub token, alert webhook) are left empty for you to paste in the UI.
// Existing resources are never modified or deleted: re-running only creates what is missing.
// Never prints secret values.
//
// Usage: NORTHFLANK_API_TOKEN=… node deploy/northflank/provision.mjs [--apply] [--project etl]
//        [--service website] [--branch main] [--plan nf-compute-50] [--backend dataplatform-staging]
import crypto from "node:crypto";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const APPLY = args.includes("--apply");
const PROJECT = opt("project", "etl");
const SERVICE = opt("service", "website");
const BRANCH = opt("branch", "main");
const PLAN = opt("plan", "nf-compute-50");
const BACKEND = opt("backend", "dataplatform-staging");
const VOLUME = `${SERVICE}-data`;
const SECRETS = `${SERVICE}-secrets`;
const REPO = opt("repo", "https://github.com/Nymbus-Capital/website");
const PORT = 3000;
// overridable only for the unit test's local mock API
const API = (process.env.NORTHFLANK_API_URL || "https://api.northflank.com").replace(/\/$/, "");

const TOKEN = process.env.NORTHFLANK_API_TOKEN;
if (!TOKEN) {
  console.error("NORTHFLANK_API_TOKEN is not set.");
  process.exit(2);
}
for (const [k, v] of Object.entries({ PROJECT, SERVICE, BACKEND })) {
  if (!/^[a-z][a-z0-9-]{1,52}$/.test(v)) {
    console.error(`invalid ${k}: ${v}`);
    process.exit(2);
  }
}

const log = (...m) => console.log(...m);
const summary = [];
const note = (line) => { summary.push(line); log(line); };

class NfError extends Error {
  constructor(method, path, status, body) {
    super(`Northflank ${method} ${path} → HTTP ${status}: ${body}`);
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
    // API error bodies describe the invalid field; they never contain our secret values
    throw new NfError(method, path, res.status, text.slice(0, 2000));
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
    const r = await get(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    const items = r[key] ?? [];
    out.push(...items);
    if (items.length < 100) break;
  }
  return out;
}
const create = async (label, path, body) => {
  if (!APPLY) {
    note(`- would create ${label}`);
    log(JSON.stringify(redact(body), null, 2));
    return null;
  }
  const r = await nf("POST", path, body);
  note(`- created ${label}`);
  return r;
};
function redact(body) {
  return JSON.parse(JSON.stringify(body, (k, v) => (k === "AUTH_SECRET" && v ? "<generated, hidden>" : v)));
}

async function main() {
  log(`${APPLY ? "APPLY" : "DRY RUN (add --apply to create)"} — project ${PROJECT}, service ${SERVICE}, branch ${BRANCH}`);

  // 1. project and backend must already exist (this script never creates projects)
  const project = await exists(`/v1/projects/${PROJECT}`);
  if (!project) throw new Error(`project "${PROJECT}" not found (or the token has no access to it)`);
  const backend = await exists(`/v1/projects/${PROJECT}/services/${BACKEND}`);
  let dataplatformUrl = "";
  let vcsTemplate = {};
  if (backend) {
    const ports = (await get(`/v1/projects/${PROJECT}/services/${BACKEND}/ports`)).ports ?? [];
    const p = ports.find((x) => x.internalPort === 8000) ?? ports[0];
    if (p) dataplatformUrl = `http://${BACKEND}:${p.internalPort}`;
    // reuse the git link settings of a service that already builds from the Nymbus-Capital org
    const v = backend.vcsData ?? {};
    for (const k of ["projectType", "accountLogin", "vcsLinkId", "selfHostedVcsId"]) if (v[k] !== undefined) vcsTemplate[k] = v[k];
    note(`- backend \`${BACKEND}\` found; the site will read it privately at ${dataplatformUrl || "(no port found)"}`);
  } else {
    note(`- backend \`${BACKEND}\` NOT found in ${PROJECT}: DATAPLATFORM_URL left empty`);
  }

  // 2. service
  let service = await exists(`/v1/projects/${PROJECT}/services/${SERVICE}`);
  if (service) {
    note(`- service \`${SERVICE}\` already exists: left unchanged`);
  } else {
    await create(`combined service \`${SERVICE}\` (build ${REPO}@${BRANCH}, Dockerfile, plan ${PLAN})`, `/v1/projects/${PROJECT}/services/combined`, {
      name: SERVICE,
      description: "Nymbus Capital public website + fund data pipeline + admin (Next.js)",
      billing: { deploymentPlan: PLAN },
      deployment: { instances: 1, docker: { configType: "default" } },
      ports: [{ name: "p01", internalPort: PORT, public: true, protocol: "HTTP" }],
      vcsData: { projectType: "github", ...vcsTemplate, projectUrl: REPO, projectBranch: BRANCH },
      buildSettings: { dockerfile: { buildEngine: "kaniko", dockerFilePath: "/Dockerfile", dockerWorkDir: "/", useCache: true } },
      buildConfiguration: { pathIgnoreRules: ["docs/**", "e2e/**", "*.md"], isAllowList: false, ciIgnoreFlagsEnabled: false },
      disabledCI: false,
      disabledCD: false,
    });
    if (APPLY) service = await get(`/v1/projects/${PROJECT}/services/${SERVICE}`);
  }

  // 3. health checks (readiness + liveness on /api/health)
  if (APPLY && service) {
    const current = (await exists(`/v1/projects/${PROJECT}/services/${SERVICE}/health-checks`))?.healthChecks ?? [];
    if (!current.length) {
      const probe = (type) => ({ protocol: "HTTP", type, path: "/api/health", port: PORT, initialDelaySeconds: 15, periodSeconds: 15, timeoutSeconds: 5, failureThreshold: 4, successThreshold: 1 });
      try {
        await nf("POST", `/v1/projects/${PROJECT}/services/${SERVICE}/health-checks`, { healthChecks: [probe("readinessProbe"), probe("livenessProbe")] });
        note("- health checks set on /api/health");
      } catch (e) {
        note(`- could not set health checks automatically (${e.message.slice(0, 200)}): add an HTTP readiness check on /api/health port ${PORT} in the UI`);
      }
    } else note("- health checks already configured: left unchanged");
  }

  // 4. public hostname → PUBLIC_URL
  let publicUrl = "";
  if (service) {
    const ports = (await get(`/v1/projects/${PROJECT}/services/${SERVICE}/ports`)).ports ?? [];
    const p = ports.find((x) => x.internalPort === PORT) ?? ports[0];
    const host = p?.domains?.[0]?.name ?? p?.dns;
    if (host) publicUrl = `https://${host}`;
    note(`- public address: ${publicUrl || "(assigned after the first deployment)"}`);
  }

  // 5. volume
  const volumes = await listAll(`/v1/projects/${PROJECT}/volumes`, "volumes");
  if (volumes.some((v) => v.id === VOLUME || v.name === VOLUME)) note(`- volume \`${VOLUME}\` already exists: left unchanged`);
  else {
    await create(`volume \`${VOLUME}\` (5 GB at /data)`, `/v1/projects/${PROJECT}/volumes`, {
      name: VOLUME,
      mounts: [{ containerMountPath: "/data", volumeMountPath: "" }],
      spec: { accessMode: "ReadWriteOnce", storageClassName: "ssd", storageSize: 5120 },
      attachedObjects: [{ id: SERVICE, type: "service" }],
    });
  }

  // 6. secret group
  const group = await exists(`/v1/projects/${PROJECT}/secrets/${SECRETS}`);
  if (group) note(`- secret group \`${SECRETS}\` already exists: left unchanged (edit values in the UI)`);
  else {
    const variables = {
      // filled automatically
      PUBLIC_URL: publicUrl,
      AUTH_SECRET: crypto.randomBytes(48).toString("base64url"),
      DATAPLATFORM_URL: dataplatformUrl,
      ADMIN_ALLOWED_DOMAINS: "nymbus.ca",
      PIPELINE_SCHEDULE: "06:45,12:45,18:45",
      FICHES_BASE_PATH: "Business Development/Fiches d'infos",
      // to paste in the Northflank UI (see docs/deploy.md)
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
      note(`  add these keys in the UI: ${Object.keys(variables).filter((k) => variables[k] === "").join(", ")}`);
    }
    if (!publicUrl) note("  PUBLIC_URL is empty: set it to the service's https address once it is shown in the UI");
  }

  // 7. first build
  if (APPLY && service) {
    try {
      await nf("POST", `/v1/projects/${PROJECT}/services/${SERVICE}/build`, { branch: BRANCH });
      note(`- build started from \`${BRANCH}\``);
    } catch (e) {
      note(`- build not started (${e.message.slice(0, 160)}); it starts on the next push to \`${BRANCH}\`, or click "Build" in the UI`);
    }
  }

  note("");
  note("Next: fill the empty values of the secret group in the Northflank UI (docs/deploy.md §2), then restart the service.");
}

main()
  .then(async () => {
    if (process.env.GITHUB_STEP_SUMMARY) {
      const fs = await import("node:fs");
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Northflank provisioning (${APPLY ? "applied" : "dry run"})\n\n${summary.join("\n")}\n`);
    }
  })
  .catch((e) => {
    console.error(`FAILED: ${e.message}`);
    process.exit(1);
  });
