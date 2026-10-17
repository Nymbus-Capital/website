/* global module */
/* App-local transport: expired writes are never replayed and unsaved forms stay open. */
(function () {
  "use strict";
  function createTransport(fetchRequest, expired, restored, probe = "/oauth2/auth", success = 202, principal = false) {
    let blocked = false,
      checking = null;
    function expire() {
      blocked = true;
      expired();
    }
    async function check() {
      if (checking) return checking;
      checking = (async () => {
        try {
          const result = await fetchRequest(probe, {
            credentials: "same-origin",
            cache: "no-store",
            redirect: "manual",
            signal: AbortSignal.timeout(10000),
          });
          const valid = result.status === success && (!principal || Boolean((await result.json()).clientPrincipal));
          if (valid) {
            if (blocked) restored();
            blocked = false;
            return true;
          }
          if (result.status === 401 || result.type === "opaqueredirect" || (principal && result.status === success))
            expire();
          return false;
        } catch {
          // A network outage does not establish that Microsoft revoked the session.
          return false;
        } finally {
          checking = null;
        }
      })();
      return checking;
    }
    async function request(input, options) {
      if (blocked && !(await check()))
        return new Response('{"error":"Sign in to continue"}', {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      const response = await fetchRequest(input, options);
      if (response.status === 401 || response.type === "opaqueredirect") {
        expire();
        if (response.type === "opaqueredirect")
          return new Response('{"error":"Sign in to continue"}', {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
      }
      return response;
    }
    return { request, check, expire };
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createTransport };
    return;
  }
  const configuration = document.currentScript?.dataset || {};
  const fetchRequest = window.fetch.bind(window);
  let banner;
  const transport = createTransport(
    fetchRequest,
    () => {
      if (!banner) {
        banner = document.createElement("div");
        banner.setAttribute("role", "alert");
        banner.style.cssText =
          "position:fixed;bottom:16px;left:16px;right:16px;z-index:2147483647;padding:16px;background:#fff;border:1px solid #c9d4e4;border-radius:8px;color:#172b4d;font:14px sans-serif;box-shadow:0 4px 20px #0002";
        const message = document.createElement("span");
        message.textContent = "Microsoft sign-in expired. Your unsaved work is still here. ";
        const signIn = document.createElement("a");
        const returnPath = location.pathname + location.search + location.hash;
        signIn.href = (configuration.login || "/oauth2/start?rd=") + encodeURIComponent(returnPath);
        signIn.target = "_blank";
        signIn.rel = "noopener";
        signIn.textContent = "Sign in with Microsoft";
        banner.append(message, signIn);
        document.body.append(banner);
      }
      banner.firstChild.textContent = "Microsoft sign-in expired. Your unsaved work is still here. ";
      banner.lastChild.hidden = false;
      banner.hidden = false;
    },
    () => {
      if (banner) {
        banner.firstChild.textContent = "Microsoft sign-in restored. Retry your action. ";
        banner.lastChild.hidden = true;
      }
    },
    configuration.probe,
    Number(configuration.success || 202),
    configuration.principal === "true",
  );
  window.addEventListener("nymbus:session-expired", transport.expire);
  window.fetch = function (input, options) {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url, location.href);
    return url.origin === location.origin && url.pathname.startsWith(configuration.apiPrefix || "/api/")
      ? transport.request(input, configuration.manualRedirect === "true" ? { ...options, redirect: "manual" } : options)
      : fetchRequest(input, options);
  };
  function checkVisibleSession() {
    if (!document.hidden && (!configuration.activePrefix || location.pathname.startsWith(configuration.activePrefix)))
      void transport.check();
  }
  setInterval(checkVisibleSession, 60000);
  document.addEventListener("visibilitychange", checkVisibleSession);
})();
