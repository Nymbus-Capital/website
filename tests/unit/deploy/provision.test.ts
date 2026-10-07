/* eslint-disable @typescript-eslint/no-explicit-any -- untyped JSON bodies of the mock Northflank API, asserted field by field */
// provision.test.ts — the Northflank provisioning script against a local mock of the API
import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";

type Call = { method: string; path: string; body: unknown; auth: string | undefined };

function mockApi(state: {
  services: Record<string, unknown>;
  volumes: unknown[];
  secrets: Record<string, unknown>;
  rejectEmpty?: boolean;
}) {
  const calls: Call[] = [];
  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const body = raw ? JSON.parse(raw) : undefined;
      const url = new URL(req.url!, "http://x");
      calls.push({ method: req.method!, path: url.pathname, body, auth: req.headers.authorization });
      const send = (status: number, data: unknown) => {
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify({ data }));
      };
      const p = url.pathname;
      const m = p.match(/^\/v1\/projects\/etl\/services\/([a-z-]+)(\/.*)?$/);
      if (p === "/v1/projects/etl" && req.method === "GET") return send(200, { id: "etl" });
      if (p === "/v1/projects/etl/services/combined" && req.method === "POST") {
        state.services[body.name] = { id: body.name, ...body };
        return send(201, { id: body.name });
      }
      if (m && req.method === "GET") {
        const svc = state.services[m[1]];
        if (!svc) return send(404, null);
        if (m[2] === "/ports")
          return send(200, {
            ports:
              m[1] === "website"
                ? [{ name: "p01", internalPort: 3000, dns: "p01--website--abc.code.run" }]
                : [{ name: "p01", internalPort: 8000 }],
          });
        if (m[2] === "/health-checks") return send(200, { healthChecks: [] });
        return send(200, svc);
      }
      if (m && req.method === "POST") return send(200, {});
      if (p === "/v1/projects/etl/volumes" && req.method === "GET") return send(200, { volumes: state.volumes });
      if (p === "/v1/projects/etl/volumes" && req.method === "POST") {
        state.volumes.push({ id: body.name, attachedObjects: body.attachedObjects });
        return send(201, {});
      }
      if (p === "/v1/projects/etl/secrets" && req.method === "GET")
        return send(200, { secrets: Object.values(state.secrets) });
      const s = p.match(/^\/v1\/projects\/etl\/secrets\/([a-z-]+)$/);
      if (s && req.method === "GET") return state.secrets[s[1]] ? send(200, state.secrets[s[1]]) : send(404, null);
      if (p === "/v1/projects/etl/secrets" && req.method === "POST") {
        if (state.rejectEmpty && Object.values(body.secrets.variables).some((v) => v === ""))
          return send(400, { message: "empty value" });
        state.secrets[body.name] = { id: body.name, ...body };
        return send(201, {});
      }
      return send(404, null);
    });
  });
  return new Promise<{ url: string; calls: Call[]; close: () => void }>((resolve) =>
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as { port: number };
      resolve({ url: `http://127.0.0.1:${port}`, calls, close: () => server.close() });
    }),
  );
}

function run(apiUrl: string, extra: string[] = []) {
  const script = path.resolve("deploy/northflank/provision.mjs");
  return new Promise<{ code: number; out: string }>((resolve) => {
    const p = spawn(process.execPath, [script, ...extra], {
      env: { ...process.env, NORTHFLANK_API_TOKEN: "test-token", NORTHFLANK_API_URL: apiUrl, GITHUB_STEP_SUMMARY: "" },
    });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (code) => resolve({ code: code ?? 1, out }));
  });
}

const backend = () => ({
  "dataplatform-staging": {
    id: "dataplatform-staging",
    vcsData: {
      projectType: "github",
      accountLogin: "Nymbus-Capital",
      projectUrl: "https://github.com/Nymbus-Capital/nymbus-dataplatform",
    },
  },
});

test("dry run changes nothing and never prints the generated secret", async () => {
  const api = await mockApi({ services: backend(), volumes: [], secrets: {} });
  const r = await run(api.url);
  api.close();
  assert.equal(r.code, 0, r.out);
  assert.equal(api.calls.filter((c) => c.method !== "GET").length, 0);
  assert.match(r.out, /would create combined service/);
  assert.match(r.out, /<generated, hidden>/);
  assert.ok(api.calls.every((c) => c.auth === "Bearer test-token"));
});

test("apply creates service, health checks, volume, restricted secret group and starts a build", async () => {
  const state = {
    services: backend() as Record<string, unknown>,
    volumes: [] as unknown[],
    secrets: {} as Record<string, any>,
  };
  const api = await mockApi(state);
  const r = await run(api.url, ["--apply"]);
  api.close();
  assert.equal(r.code, 0, r.out);
  const svc = state.services.website as any;
  assert.equal(svc.vcsData.projectUrl, "https://github.com/Nymbus-Capital/website");
  assert.equal(svc.vcsData.accountLogin, "Nymbus-Capital");
  assert.equal(svc.ports[0].internalPort, 3000);
  assert.equal(svc.buildSettings.dockerfile.dockerFilePath, "/Dockerfile");
  const hc = api.calls.find((c) => c.path.endsWith("/health-checks") && c.method === "POST")!.body as any;
  assert.equal(hc.healthChecks[0].path, "/api/health");
  assert.deepEqual((state.volumes[0] as any).id, "website-data");
  const vol = api.calls.find((c) => c.path.endsWith("/volumes") && c.method === "POST")!.body as any;
  assert.equal(vol.mounts[0].containerMountPath, "/data");
  const sg = state.secrets["website-secrets"];
  assert.deepEqual(sg.restrictions, { restricted: true, nfObjects: [{ id: "website", type: "service" }] });
  const v = sg.secrets.variables;
  assert.equal(v.PUBLIC_URL, "https://p01--website--abc.code.run");
  assert.equal(v.DATAPLATFORM_URL, "http://dataplatform-staging:8000");
  assert.ok(v.AUTH_SECRET.length >= 48);
  assert.ok(!r.out.includes(v.AUTH_SECRET), "secret must not be printed");
  assert.equal(v.AZURE_CLIENT_SECRET, "");
  assert.equal(svc.deployment.instances, 0, "created stopped until wired");
  const order = api.calls.filter((c) => c.method === "POST").map((c) => c.path.replace("/v1/projects/etl", ""));
  assert.ok(
    order.indexOf("/services/website/scale") > order.indexOf("/secrets") &&
      order.indexOf("/secrets") > order.indexOf("/volumes"),
    order.join(","),
  );
  assert.deepEqual(api.calls.find((c) => c.path.endsWith("/scale"))!.body as any, { instances: 1 });
});

test("re-running is idempotent: existing resources are left unchanged", async () => {
  const state = {
    services: { ...backend(), website: { id: "website" } } as Record<string, unknown>,
    volumes: [{ id: "website-data", attachedObjects: [{ id: "website", type: "service" }] }],
    secrets: {
      "website-secrets": {
        id: "website-secrets",
        restrictions: { restricted: true, nfObjects: [{ id: "website", type: "service" }] },
      },
    } as Record<string, unknown>,
  };
  const api = await mockApi(state);
  const r = await run(api.url, ["--apply"]);
  api.close();
  assert.equal(r.code, 0, r.out);
  const writes = api.calls.filter((c) => c.method === "POST").map((c) => c.path);
  // only the (harmless) build trigger and health-check set when none exist
  assert.ok(
    writes.every((p) => p.endsWith("/health-checks")),
    writes.join(","),
  );
  assert.match(r.out, /already exists: left unchanged/);
});

test("secret group falls back to filled values when the API refuses empty ones", async () => {
  const state = {
    services: backend() as Record<string, unknown>,
    volumes: [] as unknown[],
    secrets: {} as Record<string, any>,
    rejectEmpty: true,
  };
  const api = await mockApi(state);
  const r = await run(api.url, ["--apply"]);
  api.close();
  assert.equal(r.code, 0, r.out);
  assert.ok(!("AZURE_CLIENT_SECRET" in state.secrets["website-secrets"].secrets.variables));
  assert.match(r.out, /add these keys in the UI: .*AZURE_CLIENT_SECRET/);
});

test("refuses to run without a token or against a missing project", async () => {
  const api = await mockApi({ services: {}, volumes: [], secrets: {} });
  const noToken = await new Promise<number>((resolve) => {
    const p = spawn(process.execPath, [path.resolve("deploy/northflank/provision.mjs")], {
      env: { PATH: process.env.PATH ?? "" } as unknown as NodeJS.ProcessEnv,
    });
    p.on("close", (c) => resolve(c ?? 1));
  });
  const missing = await run(api.url, ["--project=nope"]);
  api.close();
  assert.equal(noToken, 2);
  assert.equal(missing.code, 1);
  assert.match(missing.out, /project "nope" not found/);
});

test("refuses when an unrestricted secret group would leak into the public site", async () => {
  const state = {
    services: backend() as Record<string, unknown>,
    volumes: [] as unknown[],
    secrets: { "dp-secrets": { id: "dp-secrets", restrictions: { restricted: false } } } as Record<string, unknown>,
  };
  const api = await mockApi(state);
  const r = await run(api.url, ["--apply"]);
  const accepted = await run(api.url, ["--apply", "--accept-shared-secrets"]);
  api.close();
  assert.equal(r.code, 1);
  assert.match(r.out, /unrestricted secret group\(s\) in etl: dp-secrets/);
  assert.equal(accepted.code, 0, accepted.out);
  assert.match(accepted.out, /WARNING: unrestricted/);
});

test("existing resources that are wired wrongly fail loudly", async () => {
  const state = {
    services: { ...backend(), website: { id: "website" } } as Record<string, unknown>,
    volumes: [{ id: "website-data", attachedObjects: [] }],
    secrets: {} as Record<string, unknown>,
  };
  const api = await mockApi(state);
  const r = await run(api.url, ["--apply"]);
  api.close();
  assert.equal(r.code, 1);
  assert.match(r.out, /not attached to `website`/);
});

test("options are strict: a value cannot smuggle --apply, bad branch or plan are refused", async () => {
  const api = await mockApi({ services: backend(), volumes: [], secrets: {} });
  const smuggled = await run(api.url, ["--branch", "--apply"]);
  const badBranch = await run(api.url, ["--branch=-x"]);
  const badPlan = await run(api.url, ["--plan=big; rm -rf /"]);
  api.close();
  assert.equal(smuggled.code, 2);
  assert.equal(badBranch.code, 2);
  assert.equal(badPlan.code, 2);
  assert.equal(api.calls.filter((c) => c.method !== "GET").length, 0);
});

test("API error bodies never surface the generated secret", async () => {
  const leaky = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const p = new URL(req.url!, "http://x").pathname;
      const send = (st: number, d: unknown) => {
        res.writeHead(st, { "content-type": "application/json" });
        res.end(JSON.stringify(d));
      };
      if (req.method === "GET" && p === "/v1/projects/etl") return send(200, { data: { id: "etl" } });
      if (req.method === "GET" && p.endsWith("/ports"))
        return send(200, { data: { ports: [{ internalPort: 3000, dns: "h.code.run" }] } });
      if (req.method === "GET" && (p.endsWith("/secrets") || p.endsWith("/volumes")))
        return send(200, { data: { secrets: [], volumes: [] } });
      if (req.method === "GET" && p.endsWith("/website")) return send(200, { data: { id: "website" } });
      if (req.method === "GET") return send(404, {});
      if (req.method === "POST" && p.endsWith("/volumes")) return send(201, { data: {} });
      // echo the whole request back, as some validators do
      return send(422, { error: { message: `bad value ${raw}` } });
    });
  });
  await new Promise<void>((r) => leaky.listen(0, "127.0.0.1", () => r()));
  const url = `http://127.0.0.1:${(leaky.address() as { port: number }).port}`;
  const r = await run(url, ["--apply"]);
  leaky.close();
  assert.equal(r.code, 1);
  const m = r.out.match(/"AUTH_SECRET":"([^"]*)"/);
  assert.ok(!m || m[1] === "***", `secret leaked: ${m?.[1]}`);
  assert.ok(!r.out.includes("test-token"));
});
