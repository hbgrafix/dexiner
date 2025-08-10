// ------------------------------
// 🧠 Billder.js - MVP Core w/ Script & Style Reinjection (Optimized)
// ------------------------------

// 🔌 Root mount point
const app = document.getElementById("app");

// 📦 Paths (relative to root/assets/js/app.js)
const pathroot = "/templates";
const pathjson = `${pathroot}/json`;
const pathcompos = `${pathroot}/components`;
const pathutils = `${pathroot}/utilities`;

// 📦 Global state & Pub/Sub
const state = {
  role: document.body.dataset.role,
  user: document.body.dataset.user,
  modalVisible: false,
};
const listeners = {};
function subscribe(key, fn) {
  listeners[key] = listeners[key] || [];
  listeners[key].push(fn);
}
function publish(key, value) {
  state[key] = value;
  (listeners[key] || []).forEach(fn => fn(value));
}

// 🧠 Caches & Trackers
const layoutCache = {};
const subCache = {};
const utilCache = {};
const componentRegistry = new Map(); // name → { fragment, scripts, styles, role }
let activeLayout = [];

// — CONFIG LOADERS — //
const configLoaders = {
  async layout() {
    if (!layoutCache[state.role]) {
      const res = await fetch(`${pathjson}/components.json`);
      if (!res.ok) throw new Error("components.json not found");
      const cfg = await res.json();
      layoutCache[state.role] = cfg[state.role] || cfg.default;
      if (!layoutCache[state.role]) {
        console.warn(`No layout defined for role "${state.role}"`);
        layoutCache[state.role] = [];
      }
    }
    return layoutCache[state.role];
  },
  async sub() {
    if (!subCache[state.role]) {
      const res = await fetch(`${pathjson}/subcomponents.json`);
      if (!res.ok) throw new Error("subcomponents.json not found");
      const cfg = await res.json();
      subCache[state.role] = cfg[state.role] || cfg.default;
      if (!subCache[state.role]) {
        console.warn(`No subcomponents defined for role "${state.role}"`);
        subCache[state.role] = [];
      }
    }
    return subCache[state.role];
  },
  async util() {
    if (!utilCache[state.role]) {
      const res = await fetch(`${pathjson}/utils.json`);
      if (!res.ok) throw new Error("utils.json not found");
      const cfg = await res.json();
      utilCache[state.role] = cfg[state.role] || cfg.default;
      if (!utilCache[state.role]) {
        console.warn(`No utilities defined for role "${state.role}"`);
        utilCache[state.role] = [];
      }
    }
    return utilCache[state.role];
  }
};

// — COMPONENT FETCH + PARSE — //
async function fetchComponentResources(name, util = false) {
  const cacheKey = `${state.role}:${name}`;
  if (componentRegistry.has(cacheKey)) {
    return componentRegistry.get(cacheKey);
  }

  const path = util ? `${pathutils}/${name}.html` : `${pathcompos}/${name}.html`;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${name}.html not found`);
  const text = await res.text();

  const wrapper = document.createElement("div");
  wrapper.innerHTML = text.trim();

  const scripts = Array.from(wrapper.querySelectorAll("script")).map(old => {
    const s = document.createElement("script");
    Array.from(old.attributes).forEach(a => s.setAttribute(a.name, a.value));
    s.textContent = old.textContent;
    old.remove();
    return s;
  });

  const styles = [];
  Array.from(wrapper.querySelectorAll("style")).forEach(old => {
    const st = document.createElement("style");
    st.textContent = old.textContent;
    old.remove();
    styles.push(st);
  });
  Array.from(wrapper.querySelectorAll('link[rel="stylesheet"]')).forEach(old => {
    const ln = document.createElement("link");
    Array.from(old.attributes).forEach(a => ln.setAttribute(a.name, a.value));
    old.remove();
    styles.push(ln);
  });

  const fragment = wrapper.firstElementChild;
  fragment?.setAttribute("data-component", name);

  const record = { fragment, scripts, styles };
  componentRegistry.set(cacheKey, record);
  return record;
}

// — RENDER LAYOUT — //
function kick(fragment, role) {
  const elements = fragment.querySelectorAll('[data-auth]');
  elements.forEach((element) => {
    const authAttr = element.getAttribute('data-auth');
    if (authAttr && authAttr !== role) {
      console.log(`Kicked element type: ${element.tagName.toLowerCase()}, Current role: ${role}, Authorised role: ${authAttr}`);
      element.remove();
    }
  });
}

async function renderLayout() {
  const next = await configLoaders.layout();
  const toRemove = activeLayout.filter(n => !next.includes(n));
  const toAdd = next.filter(n => !activeLayout.includes(n));

  toRemove.forEach(name => {
    const cacheKey = `${state.role}:${name}`;
    const rec = componentRegistry.get(cacheKey);
    if (rec?.fragment?.remove) rec.fragment.remove();
    componentRegistry.delete(cacheKey);
  });

  for (const name of toAdd) {
    const { fragment, scripts, styles } = await fetchComponentResources(name);
    styles.forEach(st => fragment.appendChild(st));
    kick(fragment, state.role);
    app.appendChild(fragment);
    scripts.forEach(s => fragment.appendChild(s));
  }

  activeLayout = next;
  postRender();
}

// — POST-RENDER — //
function postRender() {
  const modal = document.getElementById("infoModal");
  const close = modal?.querySelector(".close");
  const cta = modal?.querySelector("#modal-cta");
  if (modal) {
    modal.style.display = state.modalVisible ? "flex" : "none";
    close?.addEventListener("click", () => publish("modalVisible", false));
    cta?.addEventListener("click", () => publish("modalVisible", false));
  }

  const sidebar = document.querySelector("[data-component=sidebar]");
  const toggleBtn = document.querySelector('.toggle-sidebar');

  if (sidebar) {
    sidebar.onclick = async e => {
      const link = e.target.closest("a[data-target]");
      if (!link) return;
      e.preventDefault();
      const tgt = link.dataset.target;
      await injectSubComponent(tgt);
      sidebar.querySelector(".active")?.classList.remove("active");
      link.classList.add("active");
    };
  }

  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const small = window.innerWidth < 769;
      sidebar.classList.toggle('open');
      sidebar.classList.toggle('closed');
      toggleBtn.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && window.innerWidth < 769) {
        sidebar.classList.remove('open');
        toggleBtn.classList.remove('active');
      }
    });
  }
}

// — SUBCOMPONENT INJECT — //
async function injectSubComponent(name, slotId = "main-content") {
  const allowed = await configLoaders.sub();
  if (!allowed.includes(name)) {
    console.warn(`"${name}" not allowed for "${state.role}"`);
    return;
  }
  const { fragment, scripts, styles } = await fetchComponentResources(name);
  const slot = document.getElementById(slotId);
  if (!slot) throw new Error(`#${slotId} not found`);
  slot.innerHTML = "";
  styles.forEach(st => slot.appendChild(st));
  slot.appendChild(fragment);
  scripts.forEach(s => slot.appendChild(s));
}

// — UTILITIES LOAD — //
async function injectUtilities(name, slotId = "main-content") {
  const { fragment, scripts, styles } = await fetchComponentResources(name, true);
  const slot = document.getElementById(slotId);
  if (!slot) throw new Error(`#${slotId} not found`);
  slot.innerHTML = "";
  styles.forEach(st => slot.appendChild(st));
  slot.appendChild(fragment);
  scripts.forEach(s => slot.appendChild(s));
}

// — STATE CONTROLLERS — //
subscribe("modalVisible", v => {
  const m = document.getElementById("infoModal");
  if (m) m.style.display = v ? "flex" : "none";
});

function setRole(role) {
  if (role === state.role) return;
  publish("role", role);
  document.body.dataset.role = role;

  Object.assign(layoutCache, { [state.role]: null });
  Object.assign(subCache,    { [state.role]: null });
  componentRegistry.clear();
  activeLayout = [];
  app.innerHTML = "";
  renderLayout();
}
subscribe("role", () => {});

window.setRole = setRole;
window.toggleModal = () => publish("modalVisible", !state.modalVisible);

// — INIT — //
renderLayout().catch(err => console.error("Render failed:", err));

// — CUSTOM EVENT LISTENERS — //
window.addEventListener('updateUser', (event) => {
  const { settings } = event.detail;
  const newUsername = settings.username;
  const elements = document.querySelectorAll('[data-user]');
  elements.forEach((el) => el.setAttribute('data-user', newUsername));
  document.body.setAttribute('data-user', newUsername);
  state.user = newUsername;
});

window.addEventListener('loadUtilities', (event) => {
  const { utilities, slotId } = event.detail;
  utilities.forEach((utility) => {
    injectUtilities(utility, slotId);
  });
});

window.addEventListener('updateRole', (event) => {
  const { role } = event.detail;
  if (role) setRole(role);
});
