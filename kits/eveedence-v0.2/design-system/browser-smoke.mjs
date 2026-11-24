"use strict";

import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3107";
const CHROME_BIN = process.env.CHROME_BIN || "google-chrome";
const CDP_PORT = Number(process.env.CDP_PORT || 9222);
const ARTIFACT_DIR = process.env.BROWSER_ARTIFACTS || "design-system/browser-artifacts";
const tokens = JSON.parse(await readFile(new URL("./tokens.json", import.meta.url), "utf8"));
const semanticKeys = ["surface-app", "surface-card", "surface-sunken", "text-primary", "text-secondary", "text-muted", "border-control", "action-brand"];
const toRgb = hex => `rgb(${[1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16)).join(", ")})`;

const routes = [
  "/",
  "/custo-da-prova",
  "/solucoes/incident-evidence",
  "/solucoes/decision-evidence",
  "/solucoes/assurance-evidence",
  "/assurance",
  "/design-system",
];

const viewports = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

await mkdir(ARTIFACT_DIR, { recursive: true });

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJson(url, timeoutMs = 15000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await delay(150);
  }
  throw new Error("Timed out waiting for " + url + ": " + String(lastError || "no response"));
}

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Set();
  }

  async open() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      const onOpen = () => {
        cleanup();
        resolve();
      };
      const onError = (event) => {
        cleanup();
        reject(new Error("WebSocket error: " + event.type));
      };
      const cleanup = () => {
        this.ws.removeEventListener("open", onOpen);
        this.ws.removeEventListener("error", onError);
      };
      this.ws.addEventListener("open", onOpen);
      this.ws.addEventListener("error", onError);
    });

    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message + " (" + pending.method + ")"));
        else pending.resolve(message.result || {});
        return;
      }
      for (const listener of this.listeners) listener(message);
    });
  }

  call(method, params = {}, sessionId) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      this.ws.send(JSON.stringify(payload));
    });
  }

  waitFor(method, sessionId, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.listeners.delete(listener);
        reject(new Error("Timed out waiting for " + method));
      }, timeoutMs);
      const listener = (message) => {
        if (message.method !== method || (sessionId && message.sessionId !== sessionId)) return;
        clearTimeout(timer);
        this.listeners.delete(listener);
        resolve(message.params || {});
      };
      this.listeners.add(listener);
    });
  }

  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  close() {
    this.ws.close();
  }
}

const chrome = spawn(CHROME_BIN, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--remote-debugging-port=" + CDP_PORT,
  "--remote-debugging-address=127.0.0.1",
  "--user-data-dir=/tmp/eveedence-chrome-" + process.pid,
  "about:blank",
], { stdio: ["ignore", "pipe", "pipe"] });

let chromeErr = "";
chrome.stderr.on("data", (chunk) => {
  chromeErr += chunk.toString();
});

const failures = [];
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  routes: [],
  interactions: [],
};

try {
  const version = await waitForJson("http://127.0.0.1:" + CDP_PORT + "/json/version");
  const cdp = new CDP(version.webSocketDebuggerUrl);
  await cdp.open();

  const target = await cdp.call("Target.createTarget", { url: "about:blank" });
  const attached = await cdp.call("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  const sessionId = attached.sessionId;

  await cdp.call("Page.enable", {}, sessionId);
  await cdp.call("Runtime.enable", {}, sessionId);
  await cdp.call("Log.enable", {}, sessionId);

  let pageErrors = [];
  const off = cdp.on((message) => {
    if (message.sessionId !== sessionId) return;
    if (message.method === "Runtime.exceptionThrown") {
      pageErrors.push("Runtime exception: " + (message.params?.exceptionDetails?.text || "unknown"));
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params?.type === "error") {
      pageErrors.push("console.error");
    }
    if (message.method === "Log.entryAdded" && message.params?.entry?.level === "error") {
      pageErrors.push("log.error: " + message.params.entry.text);
    }
  });

  async function evaluate(expression) {
    const result = await cdp.call("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    }, sessionId);
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
    return result.result?.value;
  }

  async function navigate(pathname, viewport) {
    pageErrors = [];
    await cdp.call("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.mobile,
    }, sessionId);

    const loaded = cdp.waitFor("Page.loadEventFired", sessionId);
    await cdp.call("Page.navigate", { url: BASE_URL + pathname }, sessionId);
    await loaded;
    await delay(150);

    const state = await evaluate("(() => ({path: location.pathname, title: document.title, h1: document.querySelector('h1')?.textContent?.trim() || '', horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1, footerHasDesignSystem: Boolean(document.querySelector('footer a[href=\"/design-system\"]')), robots: document.querySelector('meta[name=\"robots\"]')?.content || ''}))()");

    const safe = pathname === "/" ? "home" : pathname.replace(/^\//, "").replaceAll("/", "-");
    const shot = await cdp.call("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      fromSurface: true,
    }, sessionId);
    await writeFile(ARTIFACT_DIR + "/" + safe + "-" + viewport.name + ".png", Buffer.from(shot.data, "base64"));

    const entry = {
      pathname,
      viewport: viewport.name,
      ...state,
      errors: [...pageErrors],
    };
    report.routes.push(entry);

    // Check the computed layout, not just page-level horizontal overflow.
    const gridColumns = async selector => evaluate(`(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!node) return null; const style = getComputedStyle(node); return style.display === "grid" ? style.gridTemplateColumns.trim().split(/\\s+/).length : null; })()`);
    if (pathname === "/assurance") {
      const columns = await gridColumns(".ev-assurance-model");
      const expected = viewport.mobile ? 1 : 5;
      entry.assuranceColumns = columns;
      if (columns !== expected) failures.push(`Assurance model (${viewport.name}): expected ${expected} columns, got ${columns}`);
    }
    if (pathname === "/design-system") {
      const columns = await gridColumns(".ev-evidence-row");
      const expected = viewport.mobile ? 1 : 2;
      entry.evidenceRowColumns = columns;
      if (columns !== expected) failures.push(`Evidence row (${viewport.name}): expected ${expected} columns, got ${columns}`);
      if (viewport.mobile) {
        const direction = await evaluate("(() => { const node = document.querySelector('.ev-evidence-row__status'); return node ? getComputedStyle(node).flexDirection : null; })()");
        entry.evidenceStatusDirection = direction;
        if (direction !== "column") failures.push("Mobile evidence status must stack vertically");
      }
    }
    if (viewport.mobile && (pathname === "/" || pathname === "/assurance" || pathname.startsWith("/solucoes/"))) {
      for (const selector of [".ev-how", ".ev-not-grid"]) {
        const exists = await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);
        if (!exists) continue;
        const columns = await gridColumns(selector);
        (entry.mobileGrids ??= {})[selector] = columns;
        if (columns !== 1) failures.push(`${pathname} mobile ${selector}: expected 1 column, got ${columns}`);
      }
    }

    if (state.path !== pathname) failures.push(pathname + " (" + viewport.name + ") navigated to " + state.path);
    if (!state.h1) failures.push(pathname + " (" + viewport.name + ") has no H1");
    if (state.horizontalOverflow) failures.push(pathname + " (" + viewport.name + ") causes document-level horizontal overflow");
    if (state.footerHasDesignSystem) failures.push(pathname + " (" + viewport.name + ") exposes /design-system in the public footer");
    if (pageErrors.length) failures.push(pathname + " (" + viewport.name + ") emitted browser errors: " + pageErrors.join(" | "));
    if (pathname === "/design-system" && !state.robots.toLowerCase().includes("noindex")) {
      failures.push("/design-system is missing robots noindex");
    }
  }

  for (const viewport of viewports) {
    for (const pathname of routes) {
      await navigate(pathname, viewport);
    }
  }


  // Compare both themes against the primitive values in tokens.json, independently
  // of the CSS custom properties that the catalog itself consumes.
  await navigate("/design-system", viewports[0]);
  for (const theme of ["light", "dark"]) {
    const state = await evaluate(`(async () => {
      const theme = ${JSON.stringify(theme)};
      const root = document.querySelector(".ds-root");
      const button = [...document.querySelectorAll(".ds-theme button")].find(node => node.textContent.trim() === (theme === "light" ? "Claro" : "Escuro"));
      if (!root || !button) return { theme: null, swatches: [] };
      const deadline = Date.now() + 3000;
      while (root.dataset.evTheme !== theme && Date.now() < deadline) {
        button.click();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return { theme: root.dataset.evTheme, swatches: [...root.querySelectorAll(".ds-token-color[data-semantic-token]")].map(node => ({ key: node.dataset.semanticToken, color: getComputedStyle(node).backgroundColor })) };
    })()`);
    const expected = Object.fromEntries(semanticKeys.map(key => [key, toRgb(tokens.primitives[tokens[theme][key].slice(1, -1)])]));
    const actual = Object.fromEntries(state.swatches.map(swatch => [swatch.key, swatch.color]));
    const pass = state.theme === theme && state.swatches.length === semanticKeys.length && semanticKeys.every(key => actual[key] === expected[key]);
    report.interactions.push({ name: "semantic swatches", theme, renderedTheme: state.theme, expected, actual, pass });
    if (!pass) failures.push("Semantic swatches do not match tokens.json in " + theme + " theme");
    const shot = await cdp.call("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, fromSurface: true }, sessionId);
    await writeFile(ARTIFACT_DIR + "/design-system-swatches-" + theme + ".png", Buffer.from(shot.data, "base64"));
  }
  if (pageErrors.length) failures.push("Theme switching emitted browser errors: " + pageErrors.join(" | "));

  await navigate("/", viewports[1]);
  const navResult = await evaluate("(async () => { const button = document.querySelector('.ev-menu-toggle'); button?.click(); await new Promise((resolve) => setTimeout(resolve, 80)); const nav = document.querySelector('#ev-site-nav'); return { open: nav?.classList.contains('is-open') || false, assuranceLink: Boolean(nav?.querySelector('a[href=\"/assurance\"]')), staleLabel: [...(nav?.querySelectorAll('a') || [])].some((a) => a.textContent?.includes('Um caso real')) }; })()");
  report.interactions.push({ name: "mobile navigation", ...navResult });
  if (!navResult.open || !navResult.assuranceLink || navResult.staleLabel) {
    failures.push("Mobile navigation interaction failed or retained stale 'Um caso real' label");
  }

  await navigate("/custo-da-prova", viewports[1]);
  const proofResult = await evaluate("(async () => { const setValue = (element, value) => { const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value'); descriptor.set.call(element, value); element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); }; const inputs = [...document.querySelectorAll('.ev-proof-form input')]; const selects = [...document.querySelectorAll('.ev-proof-form select')]; ['3','5','1','8'].forEach((value, index) => setValue(inputs[index], value)); ['partial','no','help'].forEach((value, index) => setValue(selects[index], value)); await new Promise((resolve) => setTimeout(resolve, 30)); document.querySelector('.ev-proof-form')?.requestSubmit(); await new Promise((resolve) => setTimeout(resolve, 150)); const sheet = document.querySelector('.ev-sheet'); const text = sheet?.innerText || ''; return { visible: Boolean(sheet), text, hasNoScoreLanguage: text.includes('não uma pontuação'), hasGapSection: text.includes('O que ainda precisa ser investigado') }; })()");
  report.interactions.push({
    name: "Proof Test submission",
    visible: proofResult.visible,
    hasNoScoreLanguage: proofResult.hasNoScoreLanguage,
    hasGapSection: proofResult.hasGapSection,
    text: proofResult.text.slice(0, 500),
  });

  if (!proofResult.visible || !proofResult.hasNoScoreLanguage || !proofResult.hasGapSection) {
    failures.push("Proof Test did not produce the expected reconstruction sheet");
  }

  off();
  await cdp.call("Target.closeTarget", { targetId: target.targetId });
  cdp.close();
} finally {
  chrome.kill("SIGTERM");
}

report.failures = failures;
await writeFile(ARTIFACT_DIR + "/browser-report.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({
  routes: report.routes.length,
  interactions: report.interactions.length,
  failures,
}, null, 2));

if (failures.length) {
  console.error(chromeErr.slice(-4000));
  process.exit(1);
}
