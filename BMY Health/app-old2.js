// 🔥 Billder.js v2 — Modularized Core Loader Engine
// Root-aware, RBAC-driven, Dynamic Loader

// ------------------
// 📦 GLOBALS
// ------------------
const app = document.getElementById("app");
const ROOT = "/templates";
const PATHS = {
  json: `${ROOT}/json`,
  compos: `${ROOT}/components`,
  utils: `${ROOT}/utilities`
};

const state = {
  role: document.body.dataset.role,
  user: document.body.dataset.user,
  modalVisible: false
};

const listeners = {};
const layoutCache = {}, subCache = {}, utilCache = {},
      componentRegistry = new Map();
let activeLayout = [];

// ------------------
// 📡 PUB/SUB
// ------------------
function subscribe(key, fn) {
  (listeners[key] ||= []).push(fn);
}
function publish(key, value) {
  state[key] = value;
  (listeners[key] || []).forEach(fn => fn(value));
}

// ------------------
// ⚙️ CONFIG LOADERS
// ------------------
async function loadConfig(name, cache) {
  if (!cache[state.role]) {
    const res = await fetch(`${PATHS.json}/${name}.json`);
    if (!res.ok) throw new Error(`${name}.json not found`);
    const data = await res.json();
    cache[state.role] = data[state.role] || data.default || [];
  }
  return cache[state.role];
}

const configLoaders = {
  layout: () => loadConfig("components", layoutCache),
  sub: () => loadConfig("subcomponents", subCache),
  util: () => loadConfig("utils", utilCache)
};

// ------------------
// 📥 COMPONENT FETCHER
// ------------------
async function fetchComponent(name, isUtil = false) {
  const cacheKey = `${state.role}:${name}`;
  if (componentRegistry.has(cacheKey)) return componentRegistry.get(cacheKey);

  const path = `${isUtil ? PATHS.utils : PATHS.compos}/${name}.html`;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${name}.html not found at ${path}`);

  const html = await res.text();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();

  const fragment = wrapper.firstElementChild;
  fragment?.setAttribute("data-component", name);

  const scripts = [...wrapper.querySelectorAll("script")].map(s => {
    const clone = document.createElement("script");
    [...s.attributes].forEach(a => clone.setAttribute(a.name, a.value));
    clone.textContent = s.textContent;
    s.remove();
    return clone;
  });

  const styles = [];
  [...wrapper.querySelectorAll("style")].forEach(s => {
    const el = document.createElement("style");
    el.textContent = s.textContent;
    s.remove();
    styles.push(el);
  });
  [...wrapper.querySelectorAll('link[rel="stylesheet"]')].forEach(l => {
    const el = document.createElement("link");
    [...l.attributes].forEach(a => el.setAttribute(a.name, a.value));
    l.remove();
    styles.push(el);
  });

  const record = { fragment, scripts, styles };
  componentRegistry.set(cacheKey, record);
  return record;
}

// ------------------
// 🧱 RENDER ENGINE
// ------------------
function kick(fragment, role) {
  fragment.querySelectorAll('[data-auth]').forEach(el => {
    if (el.getAttribute("data-auth") !== role) el.remove();
  });
}

async function renderLayout() {
  const next = await configLoaders.layout();
  const toRemove = activeLayout.filter(x => !next.includes(x));
  const toAdd = next.filter(x => !activeLayout.includes(x));

  toRemove.forEach(name => {
    const rec = componentRegistry.get(`${state.role}:${name}`);
    if (rec?.fragment?.remove) rec.fragment.remove();
    componentRegistry.delete(`${state.role}:${name}`);
  });

  for (const name of toAdd) {
    const { fragment, scripts, styles } = await fetchComponent(name);
    styles.forEach(st => fragment.appendChild(st));
    kick(fragment, state.role);
    app.appendChild(fragment);
    scripts.forEach(s => fragment.appendChild(s));
  }

  activeLayout = next;
  postRender();
}

function postRender() {
  const modal = document.getElementById("infoModal");
  modal && (modal.style.display = state.modalVisible ? "flex" : "none");

  modal?.querySelector(".close")?.addEventListener("click", () => publish("modalVisible", false));
  modal?.querySelector("#modal-cta")?.addEventListener("click", () => publish("modalVisible", false));

  const sidebar = document.querySelector("[data-component=sidebar]");
  const toggleBtn = document.querySelector('.toggle-sidebar');

  if (sidebar) {
    sidebar.onclick = async e => {
      const link = e.target.closest("a[data-target]");
      if (!link) return;
      e.preventDefault();
      await injectSubComponent(link.dataset.target);
      sidebar.querySelector(".active")?.classList.remove("active");
      link.classList.add("active");
    };
  }

  toggleBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    sidebar?.classList.toggle('closed');
    toggleBtn.classList.toggle('active');
  });

  document.addEventListener('click', e => {
    if (!sidebar?.contains(e.target) && !toggleBtn?.contains(e.target) && window.innerWidth < 769) {
      sidebar?.classList.remove('open');
      toggleBtn?.classList.remove('active');
    }
  });
}

// ------------------
// ⚡ INJECTORS
// ------------------
async function injectSubComponent(name, slotId = "main-content") {
  const allowed = await configLoaders.sub();
  if (!allowed.includes(name)) return console.warn(`${name} not allowed for ${state.role}`);

  const { fragment, scripts, styles } = await fetchComponent(name);
  const slot = document.getElementById(slotId);
  if (!slot) throw new Error(`#${slotId} not found`);

  slot.innerHTML = "";
  styles.forEach(st => slot.appendChild(st));
  slot.appendChild(fragment);
  scripts.forEach(s => slot.appendChild(s));
}

async function injectUtilities(name, slotId = "main-content") {
  const { fragment, scripts, styles } = await fetchComponent(name, true);
  const slot = document.getElementById(slotId);
  if (!slot) throw new Error(`#${slotId} not found`);

  slot.innerHTML = "";
  styles.forEach(st => slot.appendChild(st));
  slot.appendChild(fragment);
  scripts.forEach(s => slot.appendChild(s));
}

// ------------------
// 🎛 STATE MANAGEMENT
// ------------------
function setRole(role) {
  if (role === state.role) return;
  publish("role", role);
  document.body.dataset.role = role;
  Object.assign(layoutCache, { [state.role]: null });
  Object.assign(subCache, { [state.role]: null });
  componentRegistry.clear();
  activeLayout = [];
  app.innerHTML = "";
  renderLayout();
}

subscribe("modalVisible", v => {
  const m = document.getElementById("infoModal");
  m && (m.style.display = v ? "flex" : "none");
});
subscribe("role", () => {});

// ------------------
// 🚀 INIT
// ------------------
renderLayout().catch(err => console.error("Render failed:", err));

// ------------------
// 🌐 EVENTS
// ------------------
window.setRole = setRole;
window.toggleModal = () => publish("modalVisible", !state.modalVisible);

window.addEventListener('updateUser', ({ detail }) => {
  const { username } = detail.settings;
  state.user = username;
  document.body.setAttribute('data-user', username);
  document.querySelectorAll('[data-user]').forEach(el => el.setAttribute('data-user', username));
});

window.addEventListener('loadUtilities', ({ detail }) => {
  const { utilities, slotId } = detail;
  utilities.forEach(u => injectUtilities(u, slotId));
});

window.addEventListener('updateRole', ({ detail }) => detail.role && setRole(detail.role));
