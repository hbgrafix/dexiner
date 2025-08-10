import log from './debug.js';
import State from './state.js';

const loadedComponents = new Map();
const templateCache = new Map(); // Cache: cleaned HTML + extracted scripts/styles

async function fetchHTML(path) {
  const res = await fetch(`./templates/${path}.html`);
  if (!res.ok) throw new Error(`Failed to load: ${path}`);
  return res.text(); // ⚠️ Just return raw text
}

// simple in-flight request dedupe
const inflight = new Map();

async function fetchHTMLDedup(path) {
  if (inflight.has(path)) return inflight.get(path);
  const p = fetch(`./templates/${path}.html`)
    .then(res => {
      if (!res.ok) throw new Error('Failed');
      return res.text();
    })
    .finally(() => inflight.delete(path));
  inflight.set(path, p);
  return p;
}


function extractScriptsAndStyles(html) {
  const container = document.createElement('div');
  container.innerHTML = html;

  const scripts = [];
  const styles = [];

  container.querySelectorAll('script').forEach(s => {
    const srcAttr = s.getAttribute('src');
    const isModule = s.type === 'module';

    scripts.push({
      content: srcAttr ? null : s.textContent,
      src: srcAttr || null,
      isModule,
    });

    s.remove();
  });

  container.querySelectorAll('style').forEach(style => {
    styles.push(style.textContent);
    style.remove();
  });

  return {
    html: container.innerHTML,
    scripts,
    styles,
  };
}

function injectStyles(styles) {
  styles.forEach(css => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  });
}

function pascalCase(str) {
  return str
    .replace(/(^\w|[-_/]\w)/g, m => m.replace(/[-_/]/, '').toUpperCase());
}

async function injectScripts(scripts, path) {
  for (let script of scripts) {
    if (script.src) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = script.src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    } else {
      const temp = document.createElement('script');
      if (script.type) temp.type = script.type;
      temp.textContent = script.content;
      document.body.appendChild(temp);
    }
  }

  const fallbackFn = 'init' + pascalCase(path.split('/').pop()); // e.g. initProposal2
  const fullFn = 'init' + pascalCase(path);                      // e.g. initFeaturesProposal2

  const fn = window[fullFn] || window[fallbackFn];

  if (typeof fn === 'function') {
    try {
      log(`Auto-calling ${fn.name}()`);
      fn();
    } catch (err) {
      log.warn(`Error running ${fn.name}()`, err);
    }
  } else {
    log.warn(`No ${fullFn}() or ${fallbackFn}() found, skipping init.`);
  }
}



function generateComponentId(path) {
  const clean = path.replace(/[^\w]/g, '_');
  return `comp_${clean}_${Date.now().toString(36)}`;
}

async function loadComponent(path, targetSelector, options = {}) {
  const key = `${path}@${targetSelector}`;
  if (loadedComponents.has(key)) {
    log.warn(`Duplicate load attempt skipped → ${key}`);
    return;
  }

  // ✅ Use cleaned cache
  let cleaned;
  if (templateCache.has(path)) {
    cleaned = templateCache.get(path);
    log.warn(`Using cached template for ${path}`);
  } else {
    const rawHTML = await fetchHTMLDedup(path);
    cleaned = extractScriptsAndStyles(rawHTML);
    templateCache.set(path, cleaned); // ✅ cache only cleaned version
    log.warn(`Cached template for ${path}`);
  }

  const { html: cleanHTML, scripts, styles } = cleaned;

  const temp = document.createElement('div');
  temp.innerHTML = cleanHTML.trim();

  const topLevel = temp.firstElementChild;
  if (!topLevel) throw new Error(`Component at ${path} has no valid HTML content`);

  const slotSelector = topLevel.getAttribute('data-slot') || targetSelector;
  const target = document.querySelector(slotSelector);
  if (!target) throw new Error(`Target not found: ${slotSelector}`);

  topLevel.setAttribute('data-id', generateComponentId(path));

  if (options.replace) target.innerHTML = '';
  target.insertAdjacentElement(options.insert || 'beforeend', topLevel);

  // 🔥 Dispatch `component-loaded` event
  topLevel.dispatchEvent(new CustomEvent('component-loaded', {
    bubbles: true,
    detail: { path, slot: slotSelector, id: topLevel.dataset.id }
  }));


  injectStyles(styles);
  injectScripts(scripts, path);

  loadedComponents.set(key, { path, target: slotSelector });
  log.success(`Loaded ${path} → ${slotSelector}`);
}

function unloadComponent(path, targetSelector) {
  const key = `${path}@${targetSelector}`;
  const entry = loadedComponents.get(key);
  if (!entry) return;

  const target = document.querySelector(targetSelector);
  if (target) {
    const fragment = target.querySelector(`[data-component="${path}"]`) || target.firstChild;

    if (fragment) {
      // ✅ Dispatch event BEFORE removing the element
      fragment.dispatchEvent(new CustomEvent('component-unloaded', {
        bubbles: true,
        detail: { path, target: targetSelector }
      }));

      fragment.remove(); // 🔥 remove AFTER dispatching
    }
  }

  document.querySelectorAll(`script[data-component="${path}"]`).forEach(el => el.remove());
  loadedComponents.delete(key);

  log(`Unloaded component: ${path}, target: ${targetSelector}`);
}


function clearAllComponents() {
  [...loadedComponents.keys()].forEach(key => {
    const [path, selector] = key.split('@');
    unloadComponent(path, selector);
  });
  log(`Unloaded all components [${loadedComponents.size}]`);
}

function watchRoleComponentMap(roleComponentMap) {
  let currentRole = State.get('role');

  const refreshComponents = () => {
    const role = State.get('role');
    const prev = roleComponentMap[currentRole] || [];
    const next = roleComponentMap[role] || [];

    prev.forEach(comp => {
      if (!next.some(n => n.path === comp.path)) {
        unloadComponent(comp.path, comp.target);
      }
    });

    next.forEach(comp => {
      loadComponent(comp.path, comp.target);
    });

    currentRole = role;
  };

  State.on('role', refreshComponents);
  refreshComponents();

  log(`Watching role changes...`);
  log(roleComponentMap);
}

export {
  loadComponent,
  unloadComponent,
  clearAllComponents,
  watchRoleComponentMap,
};

