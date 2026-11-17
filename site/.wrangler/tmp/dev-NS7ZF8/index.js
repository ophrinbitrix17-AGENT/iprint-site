var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.ts
var FILE_EXT = ["pdf", "ai", "eps", "svg", "png", "jpg", "jpeg", "tif", "tiff", "psd", "cdr", "zip", "rar", "7z", "webp"];
var LIMITS = { name: 80, contact: 120, comment: 2e3, item: 80, items: 12 };
var worker_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/api/lead") {
      if (req.method !== "POST") return json({ ok: false, error: "method" }, 405);
      return handleLead(req, env);
    }
    return env.ASSETS.fetch(req);
  }
};
async function handleLead(req, env) {
  const wantsJson = (req.headers.get("accept") ?? "").includes("application/json");
  const respond = /* @__PURE__ */ __name((r, status = 200) => {
    if (wantsJson) return json(r, status);
    const to = r.ok ? "/dyakuyemo/" : `/dyakuyemo/?pomylka=${encodeURIComponent(r.ok ? "" : r.error)}`;
    return Response.redirect(new URL(to, req.url).toString(), 303);
  }, "respond");
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) return respond({ ok: false, error: "origin" }, 403);
  let form;
  try {
    form = await req.formData();
  } catch {
    return respond({ ok: false, error: "format" }, 400);
  }
  if (str(form.get("website"))) return respond({ ok: true });
  const started = Number(str(form.get("t")));
  if (started && Date.now() - started < 2500) return respond({ ok: true });
  if (env.TURNSTILE_SECRET) {
    const token = str(form.get("cf-turnstile-response"));
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, token, req.headers.get("cf-connecting-ip"));
    if (!ok) return respond({ ok: false, error: "captcha" }, 400);
  }
  const lead = {
    name: str(form.get("name")).slice(0, LIMITS.name),
    contact: str(form.get("contact")).slice(0, LIMITS.contact),
    needs: form.getAll("needs").map(str).filter(Boolean).slice(0, LIMITS.items).map((s) => s.slice(0, LIMITS.item)),
    qty: str(form.get("qty")).slice(0, LIMITS.item),
    comment: str(form.get("comment")).slice(0, LIMITS.comment),
    page: (req.headers.get("referer") ?? "").slice(0, 200),
    file: null
  };
  if (!lead.name) return respond({ ok: false, error: "required", field: "name" }, 400);
  if (!lead.contact || lead.contact.replace(/[^\p{L}\p{N}]/gu, "").length < 4) return respond({ ok: false, error: "required", field: "contact" }, 400);
  const f = form.get("file");
  if (f instanceof File && f.size > 0) {
    const maxMb = Number(env.LEAD_MAX_FILE_MB ?? "20");
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (f.size > maxMb * 1024 * 1024) return respond({ ok: false, error: "file-size", field: "file" }, 400);
    if (!FILE_EXT.includes(ext)) return respond({ ok: false, error: "file-type", field: "file" }, 400);
    lead.file = f;
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.log("[lead:test-mode]", JSON.stringify({ ...lead, file: lead.file ? { name: lead.file.name, size: lead.file.size } : null }));
    return respond({ ok: true, test: true });
  }
  try {
    await sendToTelegram(env, lead);
    return respond({ ok: true });
  } catch (e) {
    console.error("[lead:telegram-failed]", String(e));
    return respond({ ok: false, error: "delivery" }, 502);
  }
}
__name(handleLead, "handleLead");
async function sendToTelegram(env, lead) {
  const api = `${env.TELEGRAM_API_BASE ?? "https://api.telegram.org"}/bot${env.TELEGRAM_BOT_TOKEN}`;
  const text = formatLead(lead);
  const r1 = await fetch(`${api}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true })
  });
  if (!r1.ok) throw new Error(`sendMessage ${r1.status}`);
  if (lead.file) {
    const fd = new FormData();
    fd.set("chat_id", env.TELEGRAM_CHAT_ID);
    fd.set("caption", `\u0424\u0430\u0439\u043B \u0434\u043E \u0437\u0430\u044F\u0432\u043A\u0438: ${lead.name}`.slice(0, 1e3));
    fd.set("document", lead.file, lead.file.name);
    const r2 = await fetch(`${api}/sendDocument`, { method: "POST", body: fd });
    if (!r2.ok) throw new Error(`sendDocument ${r2.status}`);
  }
}
__name(sendToTelegram, "sendToTelegram");
function formatLead(l) {
  const time = (/* @__PURE__ */ new Date()).toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" });
  const rows = [
    "<b>\u{1F9FE} \u041D\u043E\u0432\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u0437 \u0441\u0430\u0439\u0442\u0443 iPrint</b>",
    `<b>\u0406\u043C'\u044F:</b> ${esc(l.name)}`,
    `<b>\u041A\u043E\u043D\u0442\u0430\u043A\u0442:</b> ${esc(l.contact)}`,
    l.needs.length ? `<b>\u0429\u043E \u043F\u043E\u0442\u0440\u0456\u0431\u043D\u043E:</b> ${esc(l.needs.join(", "))}` : "",
    l.qty ? `<b>\u0422\u0438\u0440\u0430\u0436:</b> ${esc(l.qty)}` : "",
    l.comment ? `<b>\u041A\u043E\u043C\u0435\u043D\u0442\u0430\u0440:</b>
${esc(l.comment)}` : "",
    l.file ? `<b>\u0424\u0430\u0439\u043B:</b> ${esc(l.file.name)} (${(l.file.size / 1024 / 1024).toFixed(1)} \u041C\u0411) \u2014 \u043D\u0430\u0434\u0456\u0441\u043B\u0430\u043D\u043E \u043D\u0438\u0436\u0447\u0435` : "",
    `<i>${esc(time)}${l.page ? " \xB7 " + esc(l.page) : ""}</i>`
  ];
  return rows.filter(Boolean).join("\n").slice(0, 4e3);
}
__name(formatLead, "formatLead");
async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const fd = new FormData();
  fd.set("secret", secret);
  fd.set("response", token);
  if (ip) fd.set("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: fd });
  const data = await r.json();
  return data.success === true;
}
__name(verifyTurnstile, "verifyTurnstile");
var str = /* @__PURE__ */ __name((v) => typeof v === "string" ? v.trim() : "", "str");
var esc = /* @__PURE__ */ __name((s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), "esc");
var json = /* @__PURE__ */ __name((body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }), "json");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-YQumio/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-YQumio/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default,
  formatLead
};
//# sourceMappingURL=index.js.map
